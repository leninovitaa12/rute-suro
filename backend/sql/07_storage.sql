-- ============================================================================
-- 7. STORAGE BUCKETS (File Storage Configuration)
-- ============================================================================

-- 7.1 Create Storage Buckets for Media
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('posters', 'posters', true, true, 5242880, '{"image/*"}'),
  ('events', 'events', true, true, 5242880, '{"image/*"}'),
  ('profiles', 'profiles', true, true, 5242880, '{"image/*"}')
ON CONFLICT (id) DO NOTHING;

-- 7.2 Storage Policies for Posters Bucket
-- Policy: Anyone can read poster images
DROP POLICY IF EXISTS "posters_public_read" ON storage.objects;
CREATE POLICY "posters_public_read" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'posters');

-- Policy: Only authenticated users can upload posters
DROP POLICY IF EXISTS "posters_auth_upload" ON storage.objects;
CREATE POLICY "posters_auth_upload" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'posters' AND auth.role() = 'authenticated');

-- Policy: Only authenticated users can delete posters
DROP POLICY IF EXISTS "posters_auth_delete" ON storage.objects;
CREATE POLICY "posters_auth_delete" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'posters' AND auth.role() = 'authenticated');

-- 7.3 Storage Policies for Events Bucket
-- Policy: Anyone can read event images
DROP POLICY IF EXISTS "events_public_read" ON storage.objects;
CREATE POLICY "events_public_read" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'events');

-- Policy: Only authenticated users can upload event images
DROP POLICY IF EXISTS "events_auth_upload" ON storage.objects;
CREATE POLICY "events_auth_upload" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'events' AND auth.role() = 'authenticated');

-- Policy: Only authenticated users can delete event images
DROP POLICY IF EXISTS "events_auth_delete" ON storage.objects;
CREATE POLICY "events_auth_delete" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'events' AND auth.role() = 'authenticated');

-- 7.4 Storage Policies for Profiles Bucket
-- Policy: Anyone can read profile pictures
DROP POLICY IF EXISTS "profiles_public_read" ON storage.objects;
CREATE POLICY "profiles_public_read" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'profiles');

-- Policy: Only authenticated users can upload profile pictures
DROP POLICY IF EXISTS "profiles_auth_upload" ON storage.objects;
CREATE POLICY "profiles_auth_upload" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

-- Policy: Only authenticated users can delete their own profile pictures
DROP POLICY IF EXISTS "profiles_auth_delete" ON storage.objects;
CREATE POLICY "profiles_auth_delete" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

-- ============================================================================
-- NOTES:
-- ============================================================================
-- Bucket Storage Limits & File Types:
-- - posters: 5MB, images only (JPEG, PNG, WebP, GIF)
-- - events: 5MB, images only  
-- - profiles: 5MB, images only
--
-- File paths in storage follow this pattern:
-- - posters/event_id/poster_id.jpg
-- - events/event_id/image.jpg
-- - profiles/user_id/avatar.jpg
-- ============================================================================
