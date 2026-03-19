-- ============================================================================
-- 8. POSTER TABLE (Media/Informasi Poster)
-- ============================================================================

-- 8.1 Create Poster Table
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

-- 8.2 Enable RLS
ALTER TABLE public.poster ENABLE ROW LEVEL SECURITY;

-- 8.3 Policies
-- Policy: Anyone can read active posters
DROP POLICY IF EXISTS "poster_public_read" ON public.poster;
CREATE POLICY "poster_public_read" 
  ON public.poster FOR SELECT 
  USING (is_active = true);

-- Policy: Only authenticated users can insert posters
DROP POLICY IF EXISTS "poster_insert_auth" ON public.poster;
CREATE POLICY "poster_insert_auth" 
  ON public.poster FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update posters
DROP POLICY IF EXISTS "poster_update_auth" ON public.poster;
CREATE POLICY "poster_update_auth" 
  ON public.poster FOR UPDATE 
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can delete posters
DROP POLICY IF EXISTS "poster_delete_auth" ON public.poster;
CREATE POLICY "poster_delete_auth" 
  ON public.poster FOR DELETE 
  USING (auth.role() = 'authenticated');

-- 8.4 Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_poster_event_id ON public.poster(event_id);
CREATE INDEX IF NOT EXISTS idx_poster_is_active ON public.poster(is_active);
CREATE INDEX IF NOT EXISTS idx_poster_created_at ON public.poster(created_at DESC);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Note: You can insert posters after creating events
-- INSERT INTO public.poster (title, description, image_url, event_id, is_active)
-- VALUES (
--   'Ruwah Ponorogo 2024 - Main Event',
--   'Poster utama untuk acara Ruwah Ponorogo tahun 2024',
--   'https://your-bucket.supabase.co/storage/v1/object/public/posters/poster-main.jpg',
--   '<event_id>',
--   true
-- );
