import { useState, useEffect, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
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
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (
          !supabaseUrl ||
          !supabaseKey ||
          supabaseUrl === 'https://placeholder.supabase.co' ||
          supabaseKey === 'placeholder-key'
        ) {
          console.warn('Supabase not configured. Running in offline mode.');
          if (mounted) setLoading(false);
          return;
        }

        let session;
        let error;

        try {
          const result = await Promise.race([
            supabase.auth.getSession(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Auth timeout - please check your internet connection')), 8000)
            )
          ]);

          session = result.data.session;
          error = result.error;
        } catch (e) {
          console.error('Auth timeout or fetch error:', e);
          if (mounted) setLoading(false);
          return;
        }

        if (error) {
          console.error('Auth initialization error:', error);
          if (mounted) setLoading(false);
          return;
        }

        if (session?.user) {
          await loadUserProfile(session.user);
        } else if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      console.log('Loading profile for user:', authUser.email);
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
    signOut
  }), [user, loading]);
}