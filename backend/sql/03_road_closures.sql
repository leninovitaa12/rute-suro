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
  edges jsonb NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'planned')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- NOTES on 'edges' format:
-- This stores the closed road edges in JSON format
-- Example: [{"from": "node_001", "to": "node_002"}, {"from": "node_003", "to": "node_004"}]
-- The nodes correspond to the road network graph in your backend

-- 3.2 Enable RLS on Closures
ALTER TABLE public.closures ENABLE ROW LEVEL SECURITY;

-- 3.3 Policies for Closures (Same as Events - Public Read, Authenticated Write)
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

-- 3.4 Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_closures_event_id ON public.closures(event_id);
CREATE INDEX IF NOT EXISTS idx_closures_start_time ON public.closures(start_time);
CREATE INDEX IF NOT EXISTS idx_closures_end_time ON public.closures(end_time);
CREATE INDEX IF NOT EXISTS idx_closures_status ON public.closures(status);
CREATE INDEX IF NOT EXISTS idx_closures_type ON public.closures(type);

-- 3.5 View: Active Closures Only
DROP VIEW IF EXISTS public.closures_active CASCADE;
CREATE VIEW public.closures_active AS
SELECT * FROM public.closures
WHERE status = 'active' 
  AND start_time <= now() 
  AND end_time >= now();

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Note: Insert sample closure after you have an event created
-- INSERT INTO public.closures (event_id, name, description, type, reason, start_time, end_time, edges, status)
-- VALUES (
--   '<event_id>',
--   'Penutupan Jalan Slamet Riyadi',
--   'Jalan ditutup untuk acara Ruwah Ponorogo',
--   'closure',
--   'Event setup',
--   now(),
--   now() + interval '7 days',
--   '[{"from": "node_001", "to": "node_002"}, {"from": "node_002", "to": "node_003"}]',
--   'active'
-- );
