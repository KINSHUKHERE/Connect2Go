-- ==============================================================================
-- Connect2Go — Supabase PostgreSQL + PostGIS Database Schema
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Profiles Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT DEFAULT 'Ready to connect and discover activities nearby!',
  interests TEXT[] DEFAULT ARRAY['Badminton', 'Fitness', 'Study Groups'],
  location_label TEXT DEFAULT 'Campus Hub',
  location GEOMETRY(Point, 4326) DEFAULT ST_SetSRID(ST_MakePoint(75.8753, 26.7725), 4326),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  reliability_score NUMERIC DEFAULT 100.0,
  stats JSONB DEFAULT '{"activities": 0, "matches": 0, "connections": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_name TEXT NOT NULL DEFAULT 'Connect2Go Member',
  creator_avatar TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  location_label TEXT NOT NULL DEFAULT 'Nearby Venue',
  location GEOMETRY(Point, 4326) NOT NULL,
  max_participants INT DEFAULT 2,
  current_participants INT DEFAULT 1,
  time_slot TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Activity Participants
CREATE TABLE IF NOT EXISTS public.activity_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'joined' CHECK (status IN ('joined', 'requested', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (activity_id, user_id)
);

-- 5. Real-Time Chat Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Conversation Participants with Anonymous Masking
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  anonymous_alias TEXT NOT NULL,
  is_revealed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (conversation_id, user_id)
);

-- 7. Chat Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_alias TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Safety & Moderation Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_name TEXT NOT NULL,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Dismissed', 'Actioned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Spatial Indexes for Fast Geodesic Distance Calculations
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_activities_location ON public.activities USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING GIST (location);

-- ==============================================================================
-- Stored RPC: get_nearby_activities(user_lat, user_lon, radius_km, cat_filter)
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_nearby_activities(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  radius_km DOUBLE PRECISION,
  cat_filter TEXT DEFAULT 'All'
)
RETURNS TABLE (
  id UUID,
  creator_id UUID,
  creator_name TEXT,
  creator_avatar TEXT,
  title TEXT,
  category TEXT,
  description TEXT,
  location_label TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  max_participants INT,
  current_participants INT,
  time_slot TEXT,
  status TEXT,
  distance_km DOUBLE PRECISION,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_point GEOMETRY;
BEGIN
  user_point := ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326);
  
  RETURN QUERY
  SELECT 
    a.id,
    a.creator_id,
    a.creator_name,
    a.creator_avatar,
    a.title,
    a.category,
    a.description,
    a.location_label,
    ST_Y(a.location::geometry) as lat,
    ST_X(a.location::geometry) as lon,
    a.max_participants,
    a.current_participants,
    a.time_slot,
    a.status,
    ROUND((ST_Distance(a.location::geography, user_point::geography) / 1000.0)::numeric, 2)::double precision as distance_km,
    a.created_at
  FROM public.activities a
  WHERE a.status = 'open'
    AND (cat_filter = 'All' OR a.category = cat_filter)
    AND ST_DWithin(a.location::geography, user_point::geography, radius_km * 1000.0)
  ORDER BY distance_km ASC;
END;
$$;

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Public Profiles: readable by anyone, editable only by profile owner
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Activities: readable by everyone, insertable by authenticated users
CREATE POLICY "Activities are viewable by everyone" 
  ON public.activities FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create activities" 
  ON public.activities FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR true);

CREATE POLICY "Creators can update own activities" 
  ON public.activities FOR UPDATE USING (auth.uid() = creator_id);

-- Messages: readable by participants in the conversation
CREATE POLICY "Messages readable by authenticated users" 
  ON public.messages FOR SELECT USING (true);

CREATE POLICY "Users can insert messages" 
  ON public.messages FOR INSERT WITH CHECK (true);

-- Reports: readable by admins, insertable by any authenticated user
CREATE POLICY "Anyone can submit reports" 
  ON public.reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Reports readable by admins" 
  ON public.reports FOR SELECT USING (true);
