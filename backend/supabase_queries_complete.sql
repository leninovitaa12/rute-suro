-- ============================================================================
-- RUTE SURO - COMPLETE SUPABASE QUERIES
-- Organized by Function & Table
-- ============================================================================

-- ============================================================================
-- 1. AUTHENTICATION & PROFILES (User Management)
-- ============================================================================

-- 1.1 Create Profiles Table (Role-Based Access Control)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.2 Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1.3 Policies for Profiles Table
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

DROP POLICY IF EXISTS "profile_insert_admin" ON public.profiles;
CREATE POLICY "profile_insert_admin" 
  ON public.profiles FOR INSERT 
  TO authenticated 
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 1.4 Auto-Create Profile on New User (Trigger)
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

-- 1.5 Helper Function to Check Admin Role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE;

-- 1.6 Setup Admin User (Run this once to add admin)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Admin User', 'admin'
FROM auth.users
WHERE email = 'admin@rutesuro.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Index
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- 2. EVENTS MANAGEMENT (Event/Acara Management)
-- ============================================================================

-- 2.1 Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  location text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  organizer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.2 Enable RLS on Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2.3 Policies for Events (Public Read, Authenticated Write)
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

-- 2.4 Indexes
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON public.events(end_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_location ON public.events(location);

-- 2.5 View: Active Events Only
CREATE OR REPLACE VIEW public.events_active AS
SELECT * FROM public.events
WHERE status = 'active' 
  AND start_time <= now() 
  AND end_time >= now();

-- ============================================================================
-- 3. ROAD CLOSURES & TRAFFIC MANAGEMENT (Rekayasa Jalan)
-- ============================================================================

-- 3.1 Create Closures/Rekayasa Table
CREATE TABLE IF NOT EXISTS public.closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text DEFAULT 'closure' CHECK (type IN ('closure', 'restriction', 'detour')),
  reason text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  edges jsonb NOT NULL, -- Format: [{"from": "node_id", "to": "node_id"}, ...]
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'planned')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3.2 Enable RLS on Closures
ALTER TABLE public.closures ENABLE ROW LEVEL SECURITY;

-- 3.3 Policies for Closures (Same as Events)
DROP POLICY IF EXISTS "closures_public_read" ON public.closures;
CREATE POLICY "closures_public_read" 
  ON public.closures FOR SELECT 
  USING (status = 'active');

DROP POLICY IF EXISTS "closures_authenticated_write" ON public.closures;
CREATE POLICY "closures_authenticated_write" 
  ON public.closures FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- 3.4 Indexes
CREATE INDEX IF NOT EXISTS idx_closures_event_id ON public.closures(event_id);
CREATE INDEX IF NOT EXISTS idx_closures_start_time ON public.closures(start_time);
CREATE INDEX IF NOT EXISTS idx_closures_end_time ON public.closures(end_time);
CREATE INDEX IF NOT EXISTS idx_closures_status ON public.closures(status);
CREATE INDEX IF NOT EXISTS idx_closures_type ON public.closures(type);

-- 3.5 View: Active Closures Only
CREATE OR REPLACE VIEW public.closures_active AS
SELECT * FROM public.closures
WHERE status = 'active' 
  AND start_time <= now() 
  AND end_time >= now();

-- ============================================================================
-- 4. CONGESTION ZONES (Zona Kemacetan Real-time)
-- ============================================================================

-- 4.1 Create Congestion Zones Table
CREATE TABLE IF NOT EXISTS public.congestion_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  name text NOT NULL,
  level text NOT NULL DEFAULT 'MODERATE' CHECK (level IN ('LOW', 'MODERATE', 'HEAVY')),
  reason text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  edges jsonb NOT NULL, -- Format: [{"from": "node_id", "to": "node_id"}, ...]
  estimated_delay_minutes integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.2 Enable RLS on Congestion Zones
ALTER TABLE public.congestion_zones ENABLE ROW LEVEL SECURITY;

-- 4.3 Policies for Congestion Zones (Same Public Access)
DROP POLICY IF EXISTS "congestion_public_read" ON public.congestion_zones;
CREATE POLICY "congestion_public_read" 
  ON public.congestion_zones FOR SELECT 
  USING (status = 'active');

DROP POLICY IF EXISTS "congestion_authenticated_write" ON public.congestion_zones;
CREATE POLICY "congestion_authenticated_write" 
  ON public.congestion_zones FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- 4.4 Indexes
CREATE INDEX IF NOT EXISTS idx_congestion_event_id ON public.congestion_zones(event_id);
CREATE INDEX IF NOT EXISTS idx_congestion_level ON public.congestion_zones(level);
CREATE INDEX IF NOT EXISTS idx_congestion_start_time ON public.congestion_zones(start_time);
CREATE INDEX IF NOT EXISTS idx_congestion_end_time ON public.congestion_zones(end_time);
CREATE INDEX IF NOT EXISTS idx_congestion_status ON public.congestion_zones(status);

-- 4.5 View: Active Congestion Zones Only
CREATE OR REPLACE VIEW public.congestion_zones_active AS
SELECT * FROM public.congestion_zones
WHERE status = 'active' 
  AND start_time <= now() 
  AND end_time >= now();

-- 4.6 Update Trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_congestion()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS congestion_zones_updated_at ON public.congestion_zones;
CREATE TRIGGER congestion_zones_updated_at
  BEFORE UPDATE ON public.congestion_zones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_congestion();

-- ============================================================================
-- 5. PARKING SPOTS (Titik Parkir)
-- ============================================================================

-- 5.1 Create Parking Spots Table
CREATE TABLE IF NOT EXISTS public.parking_spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  capacity integer,
  available_slots integer,
  location text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5.2 Enable RLS on Parking Spots
ALTER TABLE public.parking_spots ENABLE ROW LEVEL SECURITY;

-- 5.3 Policies for Parking Spots
DROP POLICY IF EXISTS "parking_public_read" ON public.parking_spots;
CREATE POLICY "parking_public_read" 
  ON public.parking_spots FOR SELECT 
  USING (is_active = true);

DROP POLICY IF EXISTS "parking_authenticated_write" ON public.parking_spots;
CREATE POLICY "parking_authenticated_write" 
  ON public.parking_spots FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- 5.4 Indexes
CREATE INDEX IF NOT EXISTS idx_parking_event_id ON public.parking_spots(event_id);
CREATE INDEX IF NOT EXISTS idx_parking_is_active ON public.parking_spots(is_active);
CREATE INDEX IF NOT EXISTS idx_parking_capacity ON public.parking_spots(capacity);

-- ============================================================================
-- 6. INFORMATION PAGES (Sejarah, Tentang, etc)
-- ============================================================================

-- 6.1 Create Sejarah (History) Table
CREATE TABLE IF NOT EXISTS public.sejarah (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6.2 Create Tentang (About) Table
CREATE TABLE IF NOT EXISTS public.tentang (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6.3 Enable RLS
ALTER TABLE public.sejarah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tentang ENABLE ROW LEVEL SECURITY;

-- 6.4 Policies: Public Read, Admin Write
DROP POLICY IF EXISTS "sejarah_public_read" ON public.sejarah;
CREATE POLICY "sejarah_public_read" 
  ON public.sejarah FOR SELECT 
  USING (is_active = true);

DROP POLICY IF EXISTS "sejarah_admin_write" ON public.sejarah;
CREATE POLICY "sejarah_admin_write" 
  ON public.sejarah FOR ALL 
  TO authenticated 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "tentang_public_read" ON public.tentang;
CREATE POLICY "tentang_public_read" 
  ON public.tentang FOR SELECT 
  USING (is_active = true);

DROP POLICY IF EXISTS "tentang_admin_write" ON public.tentang;
CREATE POLICY "tentang_admin_write" 
  ON public.tentang FOR ALL 
  TO authenticated 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6.5 Indexes
CREATE INDEX IF NOT EXISTS idx_sejarah_order ON public.sejarah(order_index);
CREATE INDEX IF NOT EXISTS idx_sejarah_is_active ON public.sejarah(is_active);
CREATE INDEX IF NOT EXISTS idx_tentang_order ON public.tentang(order_index);
CREATE INDEX IF NOT EXISTS idx_tentang_is_active ON public.tentang(is_active);

-- ============================================================================
-- 7. POSTERS & MEDIA (Informasi Poster/Media)
-- ============================================================================

-- 7.1 Create Poster Table
CREATE TABLE IF NOT EXISTS public.poster (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7.2 Enable RLS
ALTER TABLE public.poster ENABLE ROW LEVEL SECURITY;

-- 7.3 Policies
DROP POLICY IF EXISTS "poster_public_read" ON public.poster;
CREATE POLICY "poster_public_read" 
  ON public.poster FOR SELECT 
  USING (is_active = true);

DROP POLICY IF EXISTS "poster_authenticated_write" ON public.poster;
CREATE POLICY "poster_authenticated_write" 
  ON public.poster FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- 7.4 Indexes
CREATE INDEX IF NOT EXISTS idx_poster_event_id ON public.poster(event_id);
CREATE INDEX IF NOT EXISTS idx_poster_is_active ON public.poster(is_active);
CREATE INDEX IF NOT EXISTS idx_poster_created_at ON public.poster(created_at DESC);

-- ============================================================================
-- 8. STORAGE BUCKETS (File Storage)
-- ============================================================================

-- 8.1 Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('posters', 'posters', true, true, 5242880, '{"image/*"}'),
  ('events', 'events', true, true, 5242880, '{"image/*"}'),
  ('profiles', 'profiles', true, true, 5242880, '{"image/*"}')
ON CONFLICT (id) DO NOTHING;

-- 8.2 Storage Policies for Posters Bucket
DROP POLICY IF EXISTS "posters_public_read" ON storage.objects;
CREATE POLICY "posters_public_read" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'posters');

DROP POLICY IF EXISTS "posters_auth_upload" ON storage.objects;
CREATE POLICY "posters_auth_upload" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'posters' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "posters_auth_delete" ON storage.objects;
CREATE POLICY "posters_auth_delete" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'posters' AND auth.role() = 'authenticated');

-- 8.3 Storage Policies for Events Bucket
DROP POLICY IF EXISTS "events_public_read" ON storage.objects;
CREATE POLICY "events_public_read" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'events');

DROP POLICY IF EXISTS "events_auth_upload" ON storage.objects;
CREATE POLICY "events_auth_upload" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'events' AND auth.role() = 'authenticated');

-- 8.4 Storage Policies for Profiles Bucket
DROP POLICY IF EXISTS "profiles_own_read" ON storage.objects;
CREATE POLICY "profiles_own_read" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'profiles');

DROP POLICY IF EXISTS "profiles_own_upload" ON storage.objects;
CREATE POLICY "profiles_own_upload" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

-- ============================================================================
-- 9. SAMPLE DATA INSERTION
-- ============================================================================

-- 9.1 Insert Sample Sejarah Data
INSERT INTO public.sejarah (title, description, order_index) VALUES
(
  'Asal Usul Spiritual',
  'Berawal dari tradisi spiritual kerajaan untuk menghormati leluhur dan memohon berkah di awal tahun Jawa. Upacara ini melibatkan prosesi kirab pusaka dan sesaji sebagai simbol penghormatan terhadap warisan budaya yang telah turun-temurun.',
  1
),
(
  'Transformasi Publik (1980-an)',
  'Tradisi mulai membuka diri untuk umum dan menjadi festival budaya yang melibatkan masyarakat luas. Integrasi dengan seni pertunjukan Reog Ponorogo memperkaya acara ini dan menjadikannya salah satu festival budaya terbesar di Jawa Timur.',
  2
),
(
  'Modernisasi & Adaptasi Digital',
  'Integrasi teknologi untuk memudahkan akses informasi dan navigasi selama acara berlangsung. Penggunaan aplikasi seperti Rute Suro membantu optimalisasi perjalanan pengunjung dan manajemen lalu lintas yang lebih efisien.',
  3
)
ON CONFLICT DO NOTHING;

-- 9.2 Insert Sample Tentang Data
INSERT INTO public.tentang (title, description, order_index) VALUES
(
  'Pilih Lokasi',
  'Anda dapat menentukan titik awal dan tujuan dengan cara klik langsung di peta interaktif atau memilih dari daftar event yang tersedia. Sistem akan menandai lokasi Anda dengan marker yang jelas dan memudahkan navigasi visual.',
  1
),
(
  'Pilih Metode Transportasi',
  'Tentukan preferensi transportasi Anda: jalan kaki, sepeda motor, mobil, atau transportasi umum. Setiap metode memiliki perhitungan waktu dan rute yang berbeda untuk memberikan kenyamanan maksimal sesuai kebutuhan Anda.',
  2
),
(
  'Sistem Menghitung Rute',
  'Algoritma A* kami menganalisis semua kemungkinan jalur dengan mempertimbangkan jarak, waktu tempuh, kondisi lalu lintas real-time, dan penutupan jalan untuk memberikan rute paling optimal dan efisien.',
  3
),
(
  'Ikuti Panduan Navigasi',
  'Rute ditampilkan dengan jelas di peta beserta estimasi waktu perjalanan. Ikuti panduan step-by-step untuk mencapai tujuan Anda dengan lancar dan efisien, dengan update real-time untuk kondisi jalanan.',
  4
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- END OF SUPABASE QUERIES
-- ============================================================================
