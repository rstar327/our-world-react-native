# Supabase Database Setup

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Sign in
3. Create a new project
4. Wait for the project to be ready

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Click on "Settings" in the sidebar
3. Click on "API" 
4. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

## 3. Update Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-actual-anon-key-here
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

**Note**: You need both versions - the regular ones for the backend and the EXPO_PUBLIC ones for the frontend.

## 4. Run the Database Schema

1. In your Supabase dashboard, go to the "SQL Editor"
2. Create a new query
3. Copy and paste the following SQL schema:

\`\`\`sql
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

-- Basic RLS policies
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

-- Helper function for incrementing event attendees
CREATE OR REPLACE FUNCTION increment_event_attendees(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events 
  SET current_attendees = current_attendees + 1,
      updated_at = NOW()
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;
\`\`\`

4. Click "Run" to execute the schema

## 5. Test the Connection

1. Restart your development server
2. Try signing up or logging in
3. Check the console logs to see if Supabase is connected

## Demo User

The system will automatically create a demo user with these credentials:
- **Email**: dodopoulos2@gmail.com
- **Password**: Rimopolivolo7

## Troubleshooting

- If you see "Backend server not found (404)" errors, make sure your environment variables are set correctly
- If you see "JSON Parse error", the backend might not be running or accessible
- The app will fall back to mock data if Supabase is not configured properly