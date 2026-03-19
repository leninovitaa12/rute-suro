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

-- 2.4 Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON public.events(end_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_location ON public.events(location);

-- 2.5 View: Active Events Only
DROP VIEW IF EXISTS public.events_active CASCADE;
CREATE VIEW public.events_active AS
SELECT * FROM public.events
WHERE status = 'active' 
  AND start_time <= now() 
  AND end_time >= now();

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Note: Insert sample event after you have user profile created
-- INSERT INTO public.events (name, description, location, lat, lng, start_time, end_time, organizer_id, status)
-- VALUES (
--   'Ruwah Ponorogo 2024',
--   'Festival budaya tahunan Ponorogo',
--   'Alun-alun Ponorogo',
--   -7.8705,
--   111.4945,
--   now(),
--   now() + interval '7 days',
--   '<organizer_user_id>',
--   'active'
-- );
