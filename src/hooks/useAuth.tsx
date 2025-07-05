import { useState, useEffect, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { databaseService } from '../services/databaseService';

export interface AuthUser extends User {
  profile?: {
    full_name: string;
    role: 'customer' | 'provider' | 'admin';
    phone?: string;
    location?: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check if Supabase is configured first
        if (!isSupabaseConfigured) {
          console.warn('Supabase not configured. Running in offline mode.');
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        // Try to get session with shorter timeout and better error handling
        let session;
        let error;

        try {
          const result = await Promise.race([
            supabase.auth.getSession(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Connection timeout - Supabase may be unreachable')), 5000)
            )
          ]);

          if (result && typeof result === 'object' && 'data' in result) {
            session = result.data.session;
            error = result.error;
          } else {
            throw new Error('Invalid response from Supabase');
          }
        } catch (e) {
          console.warn('Supabase connection failed:', e instanceof Error ? e.message : 'Unknown error');
          console.warn('Running in offline mode. Please check:');
          console.warn('1. Your internet connection');
          console.warn('2. Supabase configuration in .env file');
          console.warn('3. Supabase project status');
          
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (error) {
          console.error('Auth initialization error:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user) {
          await loadUserProfile(session.user);
        } else if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Only set up auth listener if Supabase is configured
    let subscription: { unsubscribe: () => void } | null = null;
    
    if (isSupabaseConfigured) {
      try {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;

          try {
            console.log('Auth state change:', event, session?.user?.email);
            if (session?.user) {
              await loadUserProfile(session.user);
            } else {
              setUser(null);
              setLoading(false);
            }
          } catch (error) {
            console.error('Auth state change error:', error);
            if (mounted) {
              setLoading(false);
            }
          }
        });
        
        subscription = data.subscription;
      } catch (error) {
        console.error('Failed to set up auth listener:', error);
      }
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      console.log('Loading profile for user:', authUser.email);
      
      // Check if database service is available
      if (!isSupabaseConfigured) {
        console.warn('Database not available, using basic profile');
        setUser({
          ...authUser,
          profile: {
            full_name: authUser.user_metadata?.full_name || authUser.email || '',
            role: 'customer'
          }
        });
        return;
      }

      const profile = await databaseService.getProfile(authUser.id);

      if (!profile) {
        console.warn('No profile found for user, creating one...');
        try {
          const newProfile = await databaseService.createProfile({
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || authUser.email || '',
            role: 'customer'
          });
          console.log('Profile created successfully:', newProfile);
          setUser({
            ...authUser,
            profile: {
              full_name: newProfile.full_name,
              role: newProfile.role,
              phone: newProfile.phone || undefined,
              location: newProfile.location || undefined
            }
          });
        } catch (createError) {
          console.error('Error creating profile:', createError);
          setUser({
            ...authUser,
            profile: {
              full_name: authUser.user_metadata?.full_name || authUser.email || '',
              role: 'customer'
            }
          });
        }
      } else {
        console.log('Profile loaded:', profile);
        setUser({
          ...authUser,
          profile: {
            full_name: profile.full_name,
            role: profile.role,
            phone: profile.phone || undefined,
            location: profile.location || undefined
          }
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser({
        ...authUser,
        profile: {
          full_name: authUser.user_metadata?.full_name || authUser.email || '',
          role: 'customer'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication is not available. Please check your Supabase configuration.');
    }

    setLoading(true);
    try {
      console.log('Signing up user:', email);
      const data = await databaseService.signUp(email, password, fullName);
      console.log('Sign up successful:', data);
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication is not available. Please check your Supabase configuration.');
    }

    setLoading(true);
    try {
      console.log('Signing in user:', email);
      const data = await databaseService.signIn(email, password);
      console.log('Sign in successful:', data);
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      console.warn('Sign out not available - Supabase not configured');
      return;
    }

    setLoading(true);
    try {
      await databaseService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  return useMemo(() => ({
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isConfigured: isSupabaseConfigured
  }), [user, loading]);
}