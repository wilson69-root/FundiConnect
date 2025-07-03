import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Some features may not work.');
}

// Create client with fallback for missing env vars
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-application-name': 'fundiconnect',
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

// Connection test helper
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};