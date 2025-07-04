import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Better environment variable validation
const isConfigured = supabaseUrl && 
                    supabaseAnonKey && 
                    supabaseUrl !== 'https://placeholder.supabase.co' && 
                    supabaseAnonKey !== 'placeholder-key' &&
                    supabaseUrl.includes('supabase.co');

if (!isConfigured) {
  console.warn('⚠️  Supabase configuration missing or invalid.');
  console.warn('Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.');
  console.warn('You can find these values in your Supabase project dashboard.');
}

// Create client with fallback for missing env vars
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-application-name': 'fundiconnect',
      },
    },
    // Add retry configuration
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Auth helpers
export const auth = supabase.auth;

// Database helpers
export const db = supabase.from.bind(supabase);

// Storage helpers
export const storage = supabase.storage;

// Real-time helpers
export const channel = supabase.channel.bind(supabase);

// Connection test helper with better error handling
export const testConnection = async () => {
  if (!isConfigured) {
    console.warn('Skipping connection test - Supabase not configured');
    return false;
  }

  try {
    const { error } = await Promise.race([
      supabase.from('service_categories').select('count').limit(1),
      new Promise<{ data: null, error: Error }>((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      )
    ]);
    
    if (error) throw error;
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return false;
  }
};

// Export configuration status
export const isSupabaseConfigured = isConfigured;