# SQL Quick Reference - Rute Suro Supabase Queries

## File Structure Reference

### ✅ COMPLETE ORGANIZATION

You have **9 SQL files** organized by function:

```
├── 01_authentication.sql       (85 lines)   - Profiles & user auth
├── 02_events.sql              (69 lines)   - Event management  
├── 03_road_closures.sql       (74 lines)   - Road closures
├── 04_congestion_zones.sql    (88 lines)   - Traffic congestion
├── 05_parking_spots.sql       (71 lines)   - Parking locations
├── 06_information_pages.sql   (115 lines)  - Sejarah & Tentang
├── 07_storage.sql             (83 lines)   - Storage buckets
├── 08_poster_table.sql        (63 lines)   - Poster media
└── supabase_queries_complete.sql (489 lines) - ALL IN ONE
```

---

## 🚀 QUICKSTART - Execution Order

```bash
# In Supabase SQL Editor, copy-paste in this order:

1. 01_authentication.sql       ← Profiles & RBAC
2. 02_events.sql              ← Events table
3. 03_road_closures.sql       ← Closures
4. 04_congestion_zones.sql    ← Congestion
5. 05_parking_spots.sql       ← Parking
6. 06_information_pages.sql   ← Info pages
7. 07_storage.sql             ← Storage setup
8. 08_poster_table.sql        ← Poster table
```

**⏱️ Total time:** ~5-10 seconds

---

## 📊 Table Creation Sequence

```
Step 1: profiles
        ↓
Step 2: events
        ↓
   ┌─────┼─────┬─────┐
   ↓     ↓     ↓     ↓
   3     4     5     8
closures congestion parking poster
        
        ↓
   6: sejarah & tentang
   7: storage buckets
```

---

## 🔐 Authentication (File 01)

**Create admin user:**
```sql
-- After creating auth user with admin@rutesuro.com
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Admin Rute Suro', 'admin'
FROM auth.users
WHERE email = 'admin@rutesuro.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

**Check if user is admin:**
```sql
SELECT public.is_admin();
```

---

## 📍 Events (File 02)

**Create an event:**
```sql
INSERT INTO public.events (name, location, lat, lng, start_time, end_time, status)
VALUES (
  'Ruwah Ponorogo 2024',
  'Alun-alun Ponorogo',
  -7.8705,
  111.4945,
  '2024-06-01 08:00:00+07',
  '2024-06-08 23:00:00+07',
  'active'
);
```

**Get active events:**
```sql
SELECT * FROM events_active ORDER BY start_time;
```

---

## 🛣️ Road Closures (File 03)

**Create a closure:**
```sql
INSERT INTO public.closures (event_id, name, type, reason, start_time, end_time, edges, status)
VALUES (
  '<event_id>',
  'Jalan Slamet Riyadi Ditutup',
  'closure',
  'Setup Event',
  '2024-06-01 08:00:00+07',
  '2024-06-08 23:00:00+07',
  '[{"from": "node_001", "to": "node_002"}, {"from": "node_003", "to": "node_004"}]',
  'active'
);
```

**⚠️ Important:** Edge format must be valid JSON with node IDs from your graph

**Get active closures:**
```sql
SELECT * FROM closures_active WHERE event_id = '<event_id>';
```

---

## 🚗 Congestion Zones (File 04)

**Create congestion zone:**
```sql
INSERT INTO public.congestion_zones (event_id, name, level, reason, start_time, end_time, edges, estimated_delay_minutes, status)
VALUES (
  '<event_id>',
  'Kemacetan Alun-alun',
  'HEAVY',
  'Tinggi volume pengunjung',
  '2024-06-01 08:00:00+07',
  '2024-06-01 14:00:00+07',
  '[{"from": "node_010", "to": "node_011"}]',
  25,
  'active'
);
```

**Severity levels:**
- **LOW** = < 5 min delay
- **MODERATE** = 5-15 min delay
- **HEAVY** = > 15 min delay

**Get congestion for routing:**
```sql
SELECT edges, level, estimated_delay_minutes 
FROM congestion_zones_active;
```

---

## 🅿️ Parking Spots (File 05)

**Add parking location:**
```sql
INSERT INTO public.parking_spots (event_id, name, capacity, available_slots, lat, lng, is_active)
VALUES (
  '<event_id>',
  'Parkir A - Alun-alun',
  500,
  250,
  -7.8705,
  111.4945,
  true
);
```

**Get available parking:**
```sql
SELECT * FROM parking_spots 
WHERE event_id = '<event_id>' AND is_active = true;
```

---

## 📚 Information Pages (File 06)

**Sample data included:**
- Sejarah (History) - 3 entries
- Tentang (How-to) - 4 entries

**Get sejarah:**
```sql
SELECT * FROM sejarah WHERE is_active = true ORDER BY order_index;
```

**Get tentang:**
```sql
SELECT * FROM tentang WHERE is_active = true ORDER BY order_index;
```

---

## 📦 Storage Buckets (File 07)

**Three buckets created:**
1. `posters` - 5MB, images only
2. `events` - 5MB, images only
3. `profiles` - 5MB, images only

**Upload file:**
```
supabase.storage
  .from('posters')
  .upload('event_id/poster.jpg', file)
```

**Get public URL:**
```
https://your-supabase-url/storage/v1/object/public/posters/event_id/poster.jpg
```

---

## 🖼️ Poster Table (File 08)

**Add poster:**
```sql
INSERT INTO public.poster (title, description, image_url, event_id, is_active)
VALUES (
  'Ruwah Ponorogo 2024',
  'Poster utama acara',
  'https://...storage.../posters/event_id/poster.jpg',
  '<event_id>',
  true
);
```

**Get posters:**
```sql
SELECT * FROM poster WHERE event_id = '<event_id>' AND is_active = true;
```

---

## ⚙️ Views (Automatically Created)

### events_active
```sql
SELECT * FROM events_active;
-- Returns: Events happening NOW
```

### closures_active
```sql
SELECT * FROM closures_active;
-- Returns: Active closures NOW
```

### congestion_zones_active
```sql
SELECT * FROM congestion_zones_active;
-- Returns: Current congestion zones
```

---

## 🔒 RLS Summary

| Table | Select | Insert | Update | Delete |
|-------|--------|--------|--------|--------|
| profiles | Own + Admin | Admin | Own | - |
| events | Public (active) | Auth | Auth | Auth |
| closures | Public (active) | Auth | Auth | Auth |
| congestion_zones | Public (active) | Auth | Auth | Auth |
| parking_spots | Public (active) | Auth | Auth | Auth |
| sejarah | Public (active) | Admin | Admin | Admin |
| tentang | Public (active) | Admin | Admin | Admin |
| poster | Public (active) | Auth | Auth | Auth |

---

## 📋 Common Queries

### Get all active data for map
```sql
SELECT 
  e.id, e.name, e.lat, e.lng,
  COALESCE(json_agg(c.id) FILTER (WHERE c.id IS NOT NULL), '[]'::json) as closures,
  COALESCE(json_agg(cz.id) FILTER (WHERE cz.id IS NOT NULL), '[]'::json) as congestion
FROM events_active e
LEFT JOIN closures_active c ON e.id = c.event_id
LEFT JOIN congestion_zones_active cz ON e.id = cz.event_id
GROUP BY e.id;
```

### Get routing data for A* algorithm
```sql
SELECT 
  c.edges as blocked_edges,
  cz.edges as congested_edges,
  cz.level,
  cz.estimated_delay_minutes
FROM closures_active c
FULL OUTER JOIN congestion_zones_active cz ON c.event_id = cz.event_id;
```

### Get complete event details
```sql
SELECT 
  e.*,
  COUNT(DISTINCT p.id) as parking_spots,
  COUNT(DISTINCT c.id) as closed_roads,
  COUNT(DISTINCT cz.id) as congestion_zones
FROM events_active e
LEFT JOIN parking_spots p ON e.id = p.event_id AND p.is_active
LEFT JOIN closures_active c ON e.id = c.event_id
LEFT JOIN congestion_zones_active cz ON e.id = cz.event_id
GROUP BY e.id;
```

---

## 🚨 Important Notes

### Edge Format (Critical for A* Algorithm)
```json
// ✅ CORRECT
[
  {"from": "node_001", "to": "node_002"},
  {"from": "node_003", "to": "node_004"}
]

// ❌ WRONG
[
  {"source": "node_001", "target": "node_002"}
]

// ❌ WRONG
["node_001-node_002", "node_003-node_004"]
```

### Coordinates
```sql
-- ✅ CORRECT - Indonesian format
lat: -7.8705,  -- Negative for Southern Hemisphere
lng: 111.4945  -- Positive for Eastern Hemisphere

-- Used for Ponorogo City (example)
-- lat: -7.8705, lng: 111.4945
```

### Timestamps
```sql
-- ✅ CORRECT - PostgreSQL format with timezone
'2024-06-01 08:00:00+07'  -- +07 for Indonesia/Jakarta

-- Supabase will handle conversion automatically
```

---

## 🐛 Debugging

### Check if RLS is enabled
```sql
SELECT table_name, row_security_enabled 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check all policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'events';
```

### Check storage buckets
```sql
SELECT id, name, public FROM storage.buckets;
```

### Check views
```sql
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public';
```

---

## 📞 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "relation X does not exist" | Run files in correct order |
| Foreign key error | Parent table must exist first |
| RLS violation | Check user is authenticated + has role |
| Storage error | Check 07_storage.sql ran correctly |
| Invalid JSON edges | Use `[{"from": "X", "to": "Y"}]` format |

---

## 📁 File Summary

```
Files: 9 total
├─ Individual: 8 files (75 KB total)
└─ Complete: 1 file (489 lines)

Each file:
✓ Includes create table statements
✓ Includes RLS policies
✓ Includes indexes
✓ Includes sample data/comments
✓ Includes explanations
```

---

## Next: Backend Integration

These queries power the FastAPI backend:

```python
# backend/main.py uses:
- /events → events_active view
- /closures → closures_active view  
- /congestion → congestion_zones_active view
- /route → A* algorithm with closures + congestion
- /parking → parking_spots table
- /info → sejarah + tentang tables
```

---

**Version:** 1.0  
**Files:** 9 SQL files  
**Lines:** 1,300+ total  
**Status:** Ready for Supabase
