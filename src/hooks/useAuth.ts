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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
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
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await databaseService.signIn(email, password);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await databaseService.signOut();
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