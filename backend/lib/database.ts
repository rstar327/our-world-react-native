import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Database row interfaces
export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  profile_image_url: string | null;
  tickets_remaining: number;
  max_tickets: number;
  age: number | null;
  hobbies: string | null;
  work: string | null;
  interests: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventRow {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  image_url: string;
  host_id: string;
  max_attendees: number;
  current_attendees: number;
  price: number;
  join_type: string;
  latitude: number;
  longitude: number;
  address: string | null;
  general_area: string;
  doorbell: string | null;
  allergens: string | null;
  vegan_options: boolean;
  pets: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventCapacityRow {
  max_attendees: number;
  current_attendees: number;
}

// Create Supabase client with fallback for development
const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseKey !== 'placeholder-key';

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

// Mock data for when Supabase is not configured
const mockUsers = new Map();
const mockEvents = new Map();

// Initialize with demo user
if (!isSupabaseConfigured) {
  const demoUserId = 'demo-user-123';
  mockUsers.set('dodopoulos2@gmail.com', {
    id: demoUserId,
    email: 'dodopoulos2@gmail.com',
    password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: Rimopolivolo7
    first_name: 'Demo',
    last_name: 'User',
    profile_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80',
    tickets_remaining: 5,
    max_tickets: 5,
    age: 30,
    hobbies: 'Food, Travel, Music',
    work: 'Professional',
    interests: 'Dining, Socializing',
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  mockUsers.set(demoUserId, mockUsers.get('dodopoulos2@gmail.com'));
}

// Legacy db export for compatibility (will be replaced with Supabase calls)
export const db = {
  prepare: (query: string) => ({
    get: async (...params: any[]) => {
      console.log('Legacy db.prepare().get() called:', query, params);
      return null;
    },
    run: async (...params: any[]) => {
      console.log('Legacy db.prepare().run() called:', query, params);
      return { changes: 0 };
    },
    all: async (...params: any[]) => {
      console.log('Legacy db.prepare().all() called:', query, params);
      return [];
    }
  })
};

// Initialize database tables (Supabase SQL commands)
export const getSupabaseSchema = () => {
  return `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  profile_image_url TEXT,
  tickets_remaining INTEGER DEFAULT 5,
  max_tickets INTEGER DEFAULT 5,
  age INTEGER,
  hobbies TEXT,
  work TEXT,
  interests TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  image_url TEXT NOT NULL,
  host_id UUID NOT NULL REFERENCES users(id),
  max_attendees INTEGER NOT NULL,
  current_attendees INTEGER DEFAULT 0,
  price INTEGER DEFAULT 10,
  join_type TEXT DEFAULT 'open',
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  address TEXT,
  general_area TEXT NOT NULL,
  doorbell TEXT,
  allergens TEXT,
  vegan_options BOOLEAN DEFAULT FALSE,
  pets TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Join requests table
CREATE TABLE IF NOT EXISTS join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(event_id, user_id)
);

-- Host updates table
CREATE TABLE IF NOT EXISTS host_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you can customize these based on your needs)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert users" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Hosts can update their events" ON events FOR UPDATE USING (true);

CREATE POLICY "Anyone can view event attendees" ON event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can join events" ON event_attendees FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view join requests" ON join_requests FOR SELECT USING (true);
CREATE POLICY "Users can create join requests" ON join_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view host updates" ON host_updates FOR SELECT USING (true);
CREATE POLICY "Hosts can create updates" ON host_updates FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
  `;
};

export const initDatabase = async () => {
  if (isSupabaseConfigured) {
    console.log('Supabase client initialized. Run the SQL schema in your Supabase dashboard.');
    console.log('Schema SQL:', getSupabaseSchema());
  } else {
    console.log('Using mock database - Supabase not configured');
    console.log('To use Supabase, set SUPABASE_URL and SUPABASE_ANON_KEY environment variables');
  }
};

// Helper functions
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Supabase helper functions with fallback
export const getUserByEmail = async (email: string) => {
  if (!isSupabaseConfigured) {
    return mockUsers.get(email) || null;
  }
  
  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  
  return data;
};

export const createUser = async (userData: {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  age?: number;
  hobbies?: string;
  work?: string;
  interests?: string;
}) => {
  if (!isSupabaseConfigured) {
    const newUser = {
      id: generateId(),
      ...userData,
      tickets_remaining: 5,
      max_tickets: 5,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockUsers.set(userData.email, newUser);
    mockUsers.set(newUser.id, newUser);
    return newUser;
  }
  
  const { data, error } = await supabase!
    .from('users')
    .insert(userData)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getUserById = async (id: string) => {
  if (!isSupabaseConfigured) {
    return mockUsers.get(id) || null;
  }
  
  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  
  return data;
};

export const updateUser = async (id: string, updates: Partial<UserRow>) => {
  if (!isSupabaseConfigured) {
    const user = mockUsers.get(id);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
    mockUsers.set(id, updatedUser);
    mockUsers.set(updatedUser.email, updatedUser);
    return updatedUser;
  }
  
  const { data, error } = await supabase!
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getEvents = async () => {
  if (!isSupabaseConfigured) {
    return Array.from(mockEvents.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  
  const { data, error } = await supabase!
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const createEvent = async (eventData: Omit<EventRow, 'id' | 'created_at' | 'updated_at'>) => {
  if (!isSupabaseConfigured) {
    const newEvent = {
      id: generateId(),
      ...eventData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockEvents.set(newEvent.id, newEvent);
    return newEvent;
  }
  
  const { data, error } = await supabase!
    .from('events')
    .insert(eventData)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const joinEvent = async (eventId: string, userId: string) => {
  if (!isSupabaseConfigured) {
    // Mock implementation for joining events
    const joinData = {
      id: generateId(),
      event_id: eventId,
      user_id: userId,
      joined_at: new Date().toISOString()
    };
    
    // Update event attendees count in mock data
    const event = mockEvents.get(eventId);
    if (event) {
      event.current_attendees = (event.current_attendees || 0) + 1;
      mockEvents.set(eventId, event);
    }
    
    return joinData;
  }
  
  const { data, error } = await supabase!
    .from('event_attendees')
    .insert({ event_id: eventId, user_id: userId })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  // Update event current_attendees count
  const { error: updateError } = await supabase!.rpc('increment_event_attendees', {
    event_id: eventId
  });
  
  if (updateError) {
    console.error('Error updating event attendees count:', updateError);
  }
  
  return data;
};

// Seed database with demo users
export const seedDatabase = async () => {
  if (!isSupabaseConfigured) {
    console.log('Demo user already seeded in mock database');
    return;
  }
  
  try {
    // Check if demo user already exists
    const { data: existingUser } = await supabase!
      .from('users')
      .select('id')
      .eq('email', 'dodopoulos2@gmail.com')
      .single();

    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }

    // Create demo user
    const passwordHash = await hashPassword('Rimopolivolo7');

    const { data, error } = await supabase!
      .from('users')
      .insert({
        email: 'dodopoulos2@gmail.com',
        password_hash: passwordHash,
        first_name: 'Demo',
        last_name: 'User',
        profile_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80',
        age: 30,
        hobbies: 'Food, Travel, Music',
        work: 'Professional',
        interests: 'Dining, Socializing',
        is_verified: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating demo user:', error);
    } else {
      console.log('Demo user created successfully:', data);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Don't auto-initialize on import to avoid issues
// The initialization will be done in hono.ts

// Note: You'll also need to create this SQL function in Supabase:
/*
CREATE OR REPLACE FUNCTION increment_event_attendees(event_id UUID)
RETURNS void AS $
BEGIN
  UPDATE events 
  SET current_attendees = current_attendees + 1,
      updated_at = NOW()
  WHERE id = event_id;
END;
$ LANGUAGE plpgsql;
*/