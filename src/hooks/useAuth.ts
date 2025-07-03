import { useState, useEffect } from 'react';
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

    // Get initial session with improved error handling
    const initializeAuth = async () => {
      try {
        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey || 
            supabaseUrl === 'https://placeholder.supabase.co' || 
            supabaseKey === 'placeholder-key') {
          console.warn('Supabase not configured. Running in offline mode.');
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        // Increase timeout and add better error handling
        const { data: { session }, error } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: null }, error: Error }>((_, reject) => 
            setTimeout(() => reject(new Error('Auth timeout - please check your internet connection')), 15000)
          )
        ]);

        if (!mounted) return;

        if (error) {
          console.error('Auth initialization error:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
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

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        try {
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
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      const profile = await databaseService.getProfile(authUser.id);
      setUser({
        ...authUser,
        profile: {
          full_name: profile.full_name,
          role: profile.role,
          phone: profile.phone || undefined,
          location: profile.location || undefined,
        },
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Still set the user even if profile loading fails
      setUser(authUser as AuthUser);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      const data = await databaseService.signUp(email, password, fullName);
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
      const data = await databaseService.signIn(email, password);
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

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
}