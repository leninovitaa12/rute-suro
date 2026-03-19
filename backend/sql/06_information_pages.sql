-- ============================================================================
-- 6. INFORMATION PAGES (Sejarah, Tentang, dll)
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

-- 6.4 Policies: Public Read, Admin Write Only
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

-- 6.5 Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_sejarah_order ON public.sejarah(order_index);
CREATE INDEX IF NOT EXISTS idx_sejarah_is_active ON public.sejarah(is_active);
CREATE INDEX IF NOT EXISTS idx_tentang_order ON public.tentang(order_index);
CREATE INDEX IF NOT EXISTS idx_tentang_is_active ON public.tentang(is_active);

-- ============================================================================
-- INSERT SAMPLE DATA
-- ============================================================================

-- Insert Sejarah Data (History)
INSERT INTO public.sejarah (title, description, order_index, is_active) VALUES
(
  'Asal Usul Spiritual',
  'Berawal dari tradisi spiritual kerajaan untuk menghormati leluhur dan memohon berkah di awal tahun Jawa. Upacara ini melibatkan prosesi kirab pusaka dan sesaji sebagai simbol penghormatan terhadap warisan budaya yang telah turun-temurun.',
  1,
  true
),
(
  'Transformasi Publik (1980-an)',
  'Tradisi mulai membuka diri untuk umum dan menjadi festival budaya yang melibatkan masyarakat luas. Integrasi dengan seni pertunjukan Reog Ponorogo memperkaya acara ini dan menjadikannya salah satu festival budaya terbesar di Jawa Timur.',
  2,
  true
),
(
  'Modernisasi & Adaptasi Digital',
  'Integrasi teknologi untuk memudahkan akses informasi dan navigasi selama acara berlangsung. Penggunaan aplikasi seperti Rute Suro membantu optimalisasi perjalanan pengunjung dan manajemen lalu lintas yang lebih efisien.',
  3,
  true
)
ON CONFLICT DO NOTHING;

-- Insert Tentang Data (How to Use)
INSERT INTO public.tentang (title, description, order_index, is_active) VALUES
(
  'Pilih Lokasi',
  'Anda dapat menentukan titik awal dan tujuan dengan cara klik langsung di peta interaktif atau memilih dari daftar event yang tersedia. Sistem akan menandai lokasi Anda dengan marker yang jelas dan memudahkan navigasi visual.',
  1,
  true
),
(
  'Pilih Metode Transportasi',
  'Tentukan preferensi transportasi Anda: jalan kaki, sepeda motor, mobil, atau transportasi umum. Setiap metode memiliki perhitungan waktu dan rute yang berbeda untuk memberikan kenyamanan maksimal sesuai kebutuhan Anda.',
  2,
  true
),
(
  'Sistem Menghitung Rute',
  'Algoritma A* kami menganalisis semua kemungkinan jalur dengan mempertimbangkan jarak, waktu tempuh, kondisi lalu lintas real-time, dan penutupan jalan untuk memberikan rute paling optimal dan efisien.',
  3,
  true
),
(
  'Ikuti Panduan Navigasi',
  'Rute ditampilkan dengan jelas di peta beserta estimasi waktu perjalanan. Ikuti panduan step-by-step untuk mencapai tujuan Anda dengan lancar dan efisien, dengan update real-time untuk kondisi jalanan.',
  4,
  true
)
ON CONFLICT DO NOTHING;
