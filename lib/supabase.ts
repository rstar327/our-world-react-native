import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.SUPABASE_URL ?? 'https://dgmdjsqvnhbzvwiiwhpu.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbWRqc3F2bmhienZ3aWl3aHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNTE1MzgsImV4cCI6MjA2ODkyNzUzOH0.ya0XkDJoR61Cw5tWk5NZbxjfpIqhqMKLopg2BU0eD4c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for your database
export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  email_verified: boolean;
  onboarding_completed: boolean;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'> & { created_at?: string };
        Update: Partial<Profile>;
      };
    };
  };
}