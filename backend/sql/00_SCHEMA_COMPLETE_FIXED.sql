-- ============================================================================
-- RUTE SURO - COMPLETE SCHEMA SETUP (CORRECTED VERSION)
-- ============================================================================
-- PASTIKAN JALANKAN INI SEKALI (JANGAN DIULANG)
-- Execute this once - it contains all tables, functions, policies
-- ============================================================================

-- ============================================================================
-- 1. AUTHENTICATION & PROFILES (User Management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
DROP POLICY IF EXISTS "profile_read_own" ON public.profiles;
CREATE POLICY "profile_read_own" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "profile_update_own" ON public.profiles;
CREATE POLICY "profile_update_own" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-Create Profile on New User (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper Function to Check Admin Role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- 2. EVENTS MANAGEMENT (Event/Acara Management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  location text DEFAULT '',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  organizer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Events
DROP POLICY IF EXISTS "events_public_read" ON public.events;
CREATE POLICY "events_public_read" 
  ON public.events FOR SELECT 
  USING (status = 'active');

DROP POLICY IF EXISTS "events_authenticated_write" ON public.events;
CREATE POLICY "events_authenticated_write" 
  ON public.events FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON public.events(end_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);

-- View: Active Events Only
CREATE OR REPLACE VIEW public.events_active AS
SELECT * FROM public.events
WHERE status = 'active' 
  AND start_time <= now() 
  AND end_time >= now();

-- ============================================================================
-- 3. ROAD CLOSURES & TRAFFIC MANAGEMENT (Rekayasa Jalan)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL DEFAULT 'closure' CHECK (type IN ('closure', 'restriction', 'detour')),
  reason text DEFAULT '',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  edges jsonb NOT NULL DEFAULT '[]',
  severity text DEFAULT 'moderate' CHECK (severity IN ('low', 'moderate', 'high')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.closures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "closures_public_read" ON public.closures;
CREATE POLICY "closures_public_read" 
  ON public.closures FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "closures_authenticated_write" ON public.closures;
CREATE POLICY "closures_authenticated_write" 
  ON public.closures FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_closures_event_id ON public.closures(event_id);
CREATE INDEX IF NOT EXISTS idx_closures_start_time ON public.closures(start_time);
CREATE INDEX IF NOT EXISTS idx_closures_end_time ON public.closures(end_time);

-- ============================================================================
-- 4. CONGESTION ZONES (Zona Kemacetan)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.congestion_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL CHECK (type IN ('LIGHT', 'MODERATE', 'HEAVY')),
  polygon jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.congestion_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "congestion_public_read" ON public.congestion_zones;
CREATE POLICY "congestion_public_read" 
  ON public.congestion_zones FOR SELECT 
  USING (true);

CREATE INDEX IF NOT EXISTS idx_congestion_type ON public.congestion_zones(type);

-- ============================================================================
-- 5. PARKING SPOTS (Lokasi Parkir)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.parking_spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  location text DEFAULT '',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  capacity integer DEFAULT 0,
  available integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.parking_spots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parking_public_read" ON public.parking_spots;
CREATE POLICY "parking_public_read" 
  ON public.parking_spots FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "parking_authenticated_write" ON public.parking_spots;
CREATE POLICY "parking_authenticated_write" 
  ON public.parking_spots FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_parking_event_id ON public.parking_spots(event_id);

-- ============================================================================
-- 6. INFORMATION PAGES (Sejarah, Tentang, FAQ)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.information_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text NOT NULL CHECK (page_type IN ('tentang', 'sejarah', 'faq')),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  order_index integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.information_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "info_public_read" ON public.information_pages;
CREATE POLICY "info_public_read" 
  ON public.information_pages FOR SELECT 
  USING (is_published = true);

DROP POLICY IF EXISTS "info_admin_write" ON public.information_pages;
CREATE POLICY "info_admin_write" 
  ON public.information_pages FOR ALL 
  TO authenticated 
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE INDEX IF NOT EXISTS idx_info_type ON public.information_pages(page_type);
CREATE INDEX IF NOT EXISTS idx_info_published ON public.information_pages(is_published);

-- ============================================================================
-- 7. STORAGE BUCKETS (File Upload)
-- ============================================================================

-- Bucket untuk Event Posters
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-posters', 'event-posters', true)
ON CONFLICT (id) DO NOTHING;

-- RLS untuk event-posters bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-posters');

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-posters');

-- Bucket untuk Information Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('info-images', 'info-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Info Public Access" ON storage.objects;
CREATE POLICY "Info Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'info-images');

-- ============================================================================
-- 8. POSTER TABLE (Poster/Gambar Event)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.posters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posters_public_read" ON public.posters;
CREATE POLICY "posters_public_read" 
  ON public.posters FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "posters_authenticated_write" ON public.posters;
CREATE POLICY "posters_authenticated_write" 
  ON public.posters FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_posters_event_id ON public.posters(event_id);

-- ============================================================================
-- DONE! All tables, functions, policies, and indexes are created
-- ============================================================================
