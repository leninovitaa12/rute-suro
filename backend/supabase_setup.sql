-- Rute-Suro Supabase Schema Setup
-- Run this SQL in your Supabase dashboard SQL editor

-- ========== EVENTS TABLE ==========
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  radius_m DOUBLE PRECISION DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_end_time ON events(end_time);

-- ========== ROAD CLOSURES TABLE ==========
CREATE TABLE IF NOT EXISTS road_closures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  reason TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  edges JSONB NOT NULL,  -- [{"u": int, "v": int}, ...]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_road_closures_event_id ON road_closures(event_id);
CREATE INDEX idx_road_closures_start_time ON road_closures(start_time);
CREATE INDEX idx_road_closures_end_time ON road_closures(end_time);
CREATE INDEX idx_road_closures_created_at ON road_closures(created_at);

-- ========== CONGESTION ZONES TABLE ==========
CREATE TABLE IF NOT EXISTS congestion_zones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  level VARCHAR(50) NOT NULL,  -- MODERATE, HEAVY
  reason TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  edges JSONB NOT NULL,  -- [{"u": int, "v": int, "lat": float, "lng": float}, ...]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_congestion_zones_event_id ON congestion_zones(event_id);
CREATE INDEX idx_congestion_zones_level ON congestion_zones(level);
CREATE INDEX idx_congestion_zones_start_time ON congestion_zones(start_time);
CREATE INDEX idx_congestion_zones_end_time ON congestion_zones(end_time);
CREATE INDEX idx_congestion_zones_created_at ON congestion_zones(created_at);

-- ========== PARKING SPOTS TABLE ==========
CREATE TABLE IF NOT EXISTS parking_spots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  capacity INTEGER,
  available INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_parking_spots_event_id ON parking_spots(event_id);
CREATE INDEX idx_parking_spots_created_at ON parking_spots(created_at);

-- ========== ROUTE HISTORY TABLE (for analytics) ==========
CREATE TABLE IF NOT EXISTS route_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,  -- null for anonymous users
  start_lat DOUBLE PRECISION NOT NULL,
  start_lng DOUBLE PRECISION NOT NULL,
  end_lat DOUBLE PRECISION NOT NULL,
  end_lng DOUBLE PRECISION NOT NULL,
  mode VARCHAR(50),  -- fastest, shortest, both
  distance_m DOUBLE PRECISION,
  duration_sec DOUBLE PRECISION,
  polyline JSONB,  -- [{lat, lng}, ...]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_route_history_user_id ON route_history(user_id);
CREATE INDEX idx_route_history_created_at ON route_history(created_at);

-- ========== Enable Row Level Security ==========
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE road_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE congestion_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_history ENABLE ROW LEVEL SECURITY;

-- ========== RLS Policies (Public Read, Auth Admin Write) ==========

-- Events: Public read, authenticated admin write
CREATE POLICY "Events are public" 
  ON events FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert events" 
  ON events FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update events" 
  ON events FOR UPDATE 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete events" 
  ON events FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Road Closures: Public read, authenticated admin write
CREATE POLICY "Road closures are public" 
  ON road_closures FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert closures" 
  ON road_closures FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update closures" 
  ON road_closures FOR UPDATE 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete closures" 
  ON road_closures FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Congestion Zones: Public read, authenticated write
CREATE POLICY "Congestion zones are public" 
  ON congestion_zones FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert congestion" 
  ON congestion_zones FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update congestion" 
  ON congestion_zones FOR UPDATE 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete congestion" 
  ON congestion_zones FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Parking Spots: Public read, authenticated write
CREATE POLICY "Parking spots are public" 
  ON parking_spots FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can manage parking" 
  ON parking_spots FOR ALL 
  WITH CHECK (auth.role() = 'authenticated');

-- Route History: Users see own history, authenticated admins see all
CREATE POLICY "Users see own history" 
  ON route_history FOR SELECT 
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert route history" 
  ON route_history FOR INSERT 
  WITH CHECK (true);

-- ========== Sample Data ==========
INSERT INTO events (title, description, start_time, end_time, location_lat, location_lng, radius_m)
VALUES (
  'Grebeg Suro 2024',
  'Acara tradisional Grebeg Suro di Alun-alun Ponorogo',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '8 days',
  -7.8728,
  111.4625,
  2000
) ON CONFLICT DO NOTHING;
