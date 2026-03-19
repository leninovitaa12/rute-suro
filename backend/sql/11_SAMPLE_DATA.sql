-- ============================================================================
-- SAMPLE DATA INSERTION
-- ============================================================================
-- JALANKAN INI SETELAH admin user sudah dibuat (10_ADMIN_USER_SETUP.sql)
-- Run AFTER admin user is created
-- ============================================================================

-- Get the admin user ID (replace with actual admin ID)
-- First, get admin ID:
-- SELECT id FROM public.profiles WHERE email = 'admin@rutesuro.com';

-- Note: Replace 'YOUR_ADMIN_UUID_HERE' with actual admin UUID from above

-- ============================================================================
-- SAMPLE EVENT 1 (Hardiknas)
-- ============================================================================

INSERT INTO public.events (
  name,
  description,
  location,
  lat,
  lng,
  start_time,
  end_time,
  organizer_id,
  status
) VALUES (
  'Perayaan Hari Pendidikan Nasional',
  'Perayaan Hardiknas di Alun-Alun Ponorogo dengan berbagai kegiatan edukatif',
  'Alun-Alun Ponorogo',
  -7.8725,
  111.4633,
  now() + interval '7 days',
  now() + interval '7 days 4 hours',
  (SELECT id FROM public.profiles WHERE email = 'admin@rutesuro.com' LIMIT 1),
  'active'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- SAMPLE EVENT 2 (Pameran Dagang)
-- ============================================================================

INSERT INTO public.events (
  name,
  description,
  location,
  lat,
  lng,
  start_time,
  end_time,
  organizer_id,
  status
) VALUES (
  'Pameran Dagang Ponorogo 2024',
  'Pameran dagang mencakup produk lokal, UKM, dan industri kreatif',
  'Taman Hiburan Ponorogo',
  -7.8650,
  111.4700,
  now() + interval '14 days',
  now() + interval '17 days',
  (SELECT id FROM public.profiles WHERE email = 'admin@rutesuro.com' LIMIT 1),
  'active'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- SAMPLE CLOSURES (Rekayasa Jalan)
-- ============================================================================

INSERT INTO public.closures (
  event_id,
  name,
  description,
  type,
  reason,
  start_time,
  end_time,
  edges,
  severity
) VALUES (
  (SELECT id FROM public.events WHERE name = 'Perayaan Hari Pendidikan Nasional' LIMIT 1),
  'Penutupan Jalan Diponegoro',
  'Penutupan jalan untuk acara Hardiknas',
  'closure',
  'Event Hardiknas',
  now() + interval '7 days',
  now() + interval '7 days 4 hours',
  '[{"from": "node_1", "to": "node_2"}, {"from": "node_2", "to": "node_3"}]'::jsonb,
  'moderate'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- SAMPLE CONGESTION ZONES
-- ============================================================================

INSERT INTO public.congestion_zones (
  name,
  description,
  type,
  polygon
) VALUES (
  'Zona Kemacetan Alun-Alun',
  'Area sekitar Alun-Alun Ponorogo yang sering macet',
  'HEAVY',
  '[[-7.8725, 111.4633], [-7.8720, 111.4640], [-7.8730, 111.4640], [-7.8730, 111.4633]]'::jsonb
) ON CONFLICT DO NOTHING;

INSERT INTO public.congestion_zones (
  name,
  description,
  type,
  polygon
) VALUES (
  'Zona Kemacetan Jln. Ahmad Yani',
  'Area Jalan Ahmad Yani dengan tingkat kemacetan sedang',
  'MODERATE',
  '[[-7.8700, 111.4600], [-7.8700, 111.4650], [-7.8750, 111.4650], [-7.8750, 111.4600]]'::jsonb
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- SAMPLE PARKING SPOTS
-- ============================================================================

INSERT INTO public.parking_spots (
  event_id,
  name,
  description,
  location,
  lat,
  lng,
  capacity,
  available
) VALUES (
  (SELECT id FROM public.events WHERE name = 'Perayaan Hari Pendidikan Nasional' LIMIT 1),
  'Parkir Utama Alun-Alun',
  'Lapangan parkir utama di samping Alun-Alun',
  'Alun-Alun Ponorogo',
  -7.8730,
  111.4640,
  200,
  200
) ON CONFLICT DO NOTHING;

INSERT INTO public.parking_spots (
  event_id,
  name,
  description,
  location,
  lat,
  lng,
  capacity,
  available
) VALUES (
  (SELECT id FROM public.events WHERE name = 'Pameran Dagang Ponorogo 2024' LIMIT 1),
  'Parkir Taman Hiburan',
  'Area parkir Taman Hiburan Ponorogo',
  'Taman Hiburan Ponorogo',
  -7.8670,
  111.4700,
  300,
  300
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- SAMPLE INFORMATION PAGES
-- ============================================================================

INSERT INTO public.information_pages (
  page_type,
  title,
  content,
  order_index,
  is_published
) VALUES (
  'tentang',
  'Tentang Rute Suro',
  'Rute Suro adalah aplikasi manajemen lalu lintas cerdas berbasis AI yang membantu pengguna menemukan rute tercepat dan teraman di Kota Ponorogo.',
  1,
  true
) ON CONFLICT DO NOTHING;

INSERT INTO public.information_pages (
  page_type,
  title,
  content,
  order_index,
  is_published
) VALUES (
  'sejarah',
  'Sejarah Kota Ponorogo',
  'Kota Ponorogo memiliki sejarah panjang dan kaya budaya. Kota ini terkenal dengan kesenian tradisional Reog Ponorogo.',
  1,
  true
) ON CONFLICT DO NOTHING;

INSERT INTO public.information_pages (
  page_type,
  title,
  content,
  order_index,
  is_published
) VALUES (
  'faq',
  'Bagaimana cara menggunakan Rute Suro?',
  'Masukkan lokasi asal dan tujuan, pilih preferensi rute (tercepat atau terdekat), dan aplikasi akan menampilkan rekomendasi rute terbaik.',
  1,
  true
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all data was inserted correctly
SELECT '=== Events ===' as section;
SELECT id, name, status, start_time FROM public.events LIMIT 5;

SELECT '=== Closures ===' as section;
SELECT id, name, type FROM public.closures LIMIT 5;

SELECT '=== Congestion Zones ===' as section;
SELECT id, name, type FROM public.congestion_zones LIMIT 5;

SELECT '=== Parking Spots ===' as section;
SELECT id, name, capacity FROM public.parking_spots LIMIT 5;

SELECT '=== Information Pages ===' as section;
SELECT id, page_type, title FROM public.information_pages LIMIT 5;
