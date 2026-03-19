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
  edges jsonb NOT NULL,
  estimated_delay_minutes integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- NOTES on fields:
-- level: LOW (< 5 min delay), MODERATE (5-15 min delay), HEAVY (> 15 min delay)
-- edges: Same format as closures - [{"from": "node_001", "to": "node_002"}, ...]
-- estimated_delay_minutes: Expected additional time due to congestion

-- 4.2 Enable RLS on Congestion Zones
ALTER TABLE public.congestion_zones ENABLE ROW LEVEL SECURITY;

-- 4.3 Policies for Congestion Zones
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

-- 4.4 Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_congestion_event_id ON public.congestion_zones(event_id);
CREATE INDEX IF NOT EXISTS idx_congestion_level ON public.congestion_zones(level);
CREATE INDEX IF NOT EXISTS idx_congestion_start_time ON public.congestion_zones(start_time);
CREATE INDEX IF NOT EXISTS idx_congestion_end_time ON public.congestion_zones(end_time);
CREATE INDEX IF NOT EXISTS idx_congestion_status ON public.congestion_zones(status);

-- 4.5 View: Active Congestion Zones Only
DROP VIEW IF EXISTS public.congestion_zones_active CASCADE;
CREATE VIEW public.congestion_zones_active AS
SELECT * FROM public.congestion_zones
WHERE status = 'active' 
  AND start_time <= now() 
  AND end_time >= now();

-- 4.6 Update Trigger for updated_at (Auto-update timestamp)
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
-- SAMPLE DATA
-- ============================================================================

-- Note: Insert sample congestion zone after you have an event created
-- INSERT INTO public.congestion_zones (event_id, name, level, reason, start_time, end_time, edges, estimated_delay_minutes, status)
-- VALUES (
--   '<event_id>',
--   'Kemacetan Alun-alun Ponorogo',
--   'HEAVY',
--   'Tinggi volume pengunjung event Ruwah',
--   now(),
--   now() + interval '6 hours',
--   '[{"from": "node_010", "to": "node_011"}]',
--   25,
--   'active'
-- );
