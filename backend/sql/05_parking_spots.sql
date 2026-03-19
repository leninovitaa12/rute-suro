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

-- 5.3 Policies for Parking Spots (Public Read, Authenticated Write)
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

-- 5.4 Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_parking_event_id ON public.parking_spots(event_id);
CREATE INDEX IF NOT EXISTS idx_parking_is_active ON public.parking_spots(is_active);
CREATE INDEX IF NOT EXISTS idx_parking_capacity ON public.parking_spots(capacity);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Note: Insert sample parking spots after you have an event created
-- INSERT INTO public.parking_spots (event_id, name, description, capacity, available_slots, location, lat, lng, is_active)
-- VALUES 
-- (
--   '<event_id>',
--   'Parkir A - Alun-alun',
--   'Area parkir utama di alun-alun Ponorogo',
--   500,
--   250,
--   'Alun-alun Ponorogo',
--   -7.8705,
--   111.4945,
--   true
-- ),
-- (
--   '<event_id>',
--   'Parkir B - Terminal Wisata',
--   'Area parkir sekunder di terminal wisata',
--   300,
--   150,
--   'Terminal Wisata',
--   -7.8750,
--   111.4950,
--   true
-- );
