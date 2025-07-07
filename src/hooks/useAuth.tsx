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
          console.warn('⚠️ Supabase not configured. Running in offline mode.');
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('🔄 Initializing authentication...');

        // Try to get session with timeout
        let session;
        let error;

        try {
          const result = await Promise.race([
            supabase.auth.getSession(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Auth timeout - please check your internet connection')), 30000)
            )
          ]);

          if (result && typeof result === 'object' && 'data' in result) {
            session = result.data.session;
            error = result.error;
          } else {
            throw new Error('Invalid response from Supabase');
          }
        } catch (e) {
          console.warn('⚠️ Supabase auth failed - Full error details:', e);
          console.warn('⚠️ Error type:', typeof e);
          console.warn('⚠️ Error constructor:', e?.constructor?.name);
          if (e instanceof Error) {
            console.warn('⚠️ Error message:', e.message);
            console.warn('⚠️ Error stack:', e.stack);
          }
          console.warn('⚠️ Error properties:', Object.getOwnPropertyNames(e));
          
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (error) {
          console.error('❌ Auth initialization error - Full error details:', error);
          console.error('❌ Error type:', typeof error);
          console.error('❌ Error constructor:', error?.constructor?.name);
          console.error('❌ Error properties:', Object.getOwnPropertyNames(error));
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user) {
          console.log('✅ Found existing session for:', session.user.email);
          await loadUserProfile(session.user);
        } else {
          console.log('ℹ️ No existing session found');
          if (mounted) {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization failed - Full error details:', error);
        console.error('❌ Error type:', typeof error);
        console.error('❌ Error constructor:', error?.constructor?.name);
        if (error instanceof Error) {
          console.error('❌ Error message:', error.message);
          console.error('❌ Error stack:', error.stack);
        }
        console.error('❌ Error properties:', Object.getOwnPropertyNames(error));
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
            console.log('🔄 Auth state change:', event, session?.user?.email);
            
            if (event === 'SIGNED_IN' && session?.user) {
              console.log('✅ User signed in:', session.user.email);
              await loadUserProfile(session.user);
            } else if (event === 'SIGNED_OUT') {
              console.log('👋 User signed out');
              setUser(null);
              setLoading(false);
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
              console.log('🔄 Token refreshed for:', session.user.email);
              await loadUserProfile(session.user);
            } else {
              console.log('ℹ️ Auth event:', event);
              if (!session?.user) {
                setUser(null);
                setLoading(false);
              }
            }
          } catch (error) {
            console.error('❌ Auth state change error - Full error details:', error);
            console.error('❌ Error type:', typeof error);
            console.error('❌ Error constructor:', error?.constructor?.name);
            if (error instanceof Error) {
              console.error('❌ Error message:', error.message);
              console.error('❌ Error stack:', error.stack);
            }
            console.error('❌ Error properties:', Object.getOwnPropertyNames(error));
            if (mounted) {
              setLoading(false);
            }
          }
        });
        
        subscription = data.subscription;
      } catch (error) {
        console.error('❌ Failed to set up auth listener - Full error details:', error);
        console.error('❌ Error type:', typeof error);
        console.error('❌ Error constructor:', error?.constructor?.name);
        if (error instanceof Error) {
          console.error('❌ Error message:', error.message);
          console.error('❌ Error stack:', error.stack);
        }
        console.error('❌ Error properties:', Object.getOwnPropertyNames(error));
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
      console.log('📋 Loading profile for user:', authUser.email);
      
      // Check if database service is available
      if (!isSupabaseConfigured) {
        console.warn('⚠️ Database not available, using basic profile');
        setUser({
          ...authUser,
          profile: {
            full_name: authUser.user_metadata?.full_name || authUser.email || '',
            role: 'customer'
          }
        });
        setLoading(false);
        return;
      }

      const profile = await databaseService.getProfile(authUser.id);

      if (!profile) {
        console.log('⚠️ No profile found for user, creating one...');
        try {
          const newProfile = await databaseService.createProfile({
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || authUser.email || '',
            role: 'customer'
          });
          console.log('✅ Profile created successfully:', newProfile);
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
          console.error('❌ Error creating profile - Full error details:', createError);
          console.error('❌ Error type:', typeof createError);
          console.error('❌ Error constructor:', createError?.constructor?.name);
          if (createError instanceof Error) {
            console.error('❌ Error message:', createError.message);
            console.error('❌ Error stack:', createError.stack);
          }
          console.error('❌ Error properties:', Object.getOwnPropertyNames(createError));
          setUser({
            ...authUser,
            profile: {
              full_name: authUser.user_metadata?.full_name || authUser.email || '',
              role: 'customer'
            }
          });
        }
      } else {
        console.log('✅ Profile loaded:', profile);
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
      console.error('❌ Error loading user profile - Full error details:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error constructor:', error?.constructor?.name);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      console.error('❌ Error properties:', Object.getOwnPropertyNames(error));
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
      console.log('🚀 Starting signup process for:', email);
      const data = await databaseService.signUp(email, password, fullName);
      console.log('✅ Sign up completed:', data);
      
      // The auth state change listener will handle loading the profile
      return data;
    } catch (error) {
      console.error('❌ Sign up error - Full error details:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error constructor:', error?.constructor?.name);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      console.error('❌ Error properties:', Object.getOwnPropertyNames(error));
      setLoading(false);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Authentication is not available. Please check your Supabase configuration.');
    }

    setLoading(true);
    try {
      console.log('🔑 Starting signin process for:', email);
      const data = await databaseService.signIn(email, password);
      console.log('✅ Sign in completed:', data);
      
      // The auth state change listener will handle loading the profile
      return data;
    } catch (error) {
      console.error('❌ Sign in error - Full error details:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error constructor:', error?.constructor?.name);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      console.error('❌ Error properties:', Object.getOwnPropertyNames(error));
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Sign out not available - Supabase not configured');
      return;
    }

    setLoading(true);
    try {
      console.log('🚪 Starting signout process...');
      await databaseService.signOut();
      console.log('✅ Sign out completed');
      // The auth state change listener will handle clearing the user
    } catch (error) {
      console.error('❌ Sign out error - Full error details:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error constructor:', error?.constructor?.name);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      console.error('❌ Error properties:', Object.getOwnPropertyNames(error));
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