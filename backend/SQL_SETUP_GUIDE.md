# Rute Suro - Supabase SQL Setup Guide

## Overview

This guide explains the complete Supabase database schema for Rute Suro routing optimization system. All queries are organized by function/table for easy understanding and execution.

## Database Architecture

### Tables Summary

| No | Table | Purpose | Status |
|----|-------|---------|--------|
| 1 | `profiles` | User authentication & role management | Core |
| 2 | `events` | Event/Acara management | Core |
| 3 | `closures` | Road closures/Rekayasa Jalan | Core |
| 4 | `congestion_zones` | Real-time traffic congestion | Core |
| 5 | `parking_spots` | Event-specific parking locations | Core |
| 6 | `sejarah` | History/Background information | Info |
| 7 | `tentang` | How-to guides | Info |
| 8 | `poster` | Event posters & media | Media |

### Storage Buckets

- `posters` - Poster images & promotional materials
- `events` - Event images
- `profiles` - User avatar pictures

---

## Execution Order

Execute the SQL files in this specific order:

```
1. 01_authentication.sql    (User auth & profiles)
2. 02_events.sql            (Events management)
3. 03_road_closures.sql     (Road closures/Rekayasa)
4. 04_congestion_zones.sql  (Traffic congestion)
5. 05_parking_spots.sql     (Parking locations)
6. 06_information_pages.sql (Sejarah & Tentang)
7. 07_storage.sql           (Storage buckets & policies)
8. 08_poster_table.sql      (Poster media table)
```

**Why this order?** Each table may have foreign keys to previous tables, so you must create dependencies first.

---

## Table Details

### 1. PROFILES (Authentication)
**File:** `01_authentication.sql`

**Purpose:** Store user profiles with role-based access control (RBAC)

**Columns:**
- `id` (uuid, PK) - References auth.users
- `email` (text) - User email
- `full_name` (text) - User's full name
- `avatar_url` (text) - Profile picture URL
- `role` (text) - 'user' or 'admin'
- `is_active` (boolean) - Account status
- `created_at`, `updated_at` (timestamptz) - Timestamps

**Key Features:**
- Auto-creates profile when user signs up (trigger)
- RLS policies for own profile only access
- Helper function `is_admin()` to check roles
- Email index for fast lookup

**Setup Admin User:**
```sql
-- Run this after creating an admin user in Supabase Auth
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Admin Rute Suro', 'admin'
FROM auth.users
WHERE email = 'admin@rutesuro.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

---

### 2. EVENTS (Event Management)
**File:** `02_events.sql`

**Purpose:** Store event/acara information with location & time

**Columns:**
- `id` (uuid, PK) - Unique event ID
- `name` (text) - Event name
- `description` (text) - Event details
- `location` (text) - Location description
- `lat`, `lng` (double) - Geographic coordinates
- `start_time`, `end_time` (timestamptz) - Event duration
- `organizer_id` (uuid, FK) - References profiles.id
- `status` (text) - draft|active|completed|cancelled
- `created_at`, `updated_at` (timestamptz) - Timestamps

**Key Features:**
- Public read access for active events
- Authenticated users can create/edit events
- View `events_active` for currently happening events
- Indexes on time fields for fast queries

**Example Insert:**
```sql
INSERT INTO public.events (name, description, location, lat, lng, start_time, end_time, status)
VALUES (
  'Ruwah Ponorogo 2024',
  'Festival budaya tahunan Ponorogo',
  'Alun-alun Ponorogo',
  -7.8705,
  111.4945,
  '2024-06-01 08:00:00+07',
  '2024-06-08 23:00:00+07',
  'active'
);
```

---

### 3. CLOSURES (Road Closures/Rekayasa Jalan)
**File:** `03_road_closures.sql`

**Purpose:** Track closed/restricted roads for routing optimization

**Columns:**
- `id` (uuid, PK) - Unique closure ID
- `event_id` (uuid, FK) - References events.id
- `name` (text) - Closure name
- `description` (text) - Details
- `type` (text) - closure|restriction|detour
- `reason` (text) - Reason for closure
- `start_time`, `end_time` (timestamptz) - Duration
- `edges` (jsonb) - Closed road edges (see format below)
- `status` (text) - active|inactive|planned
- `created_at`, `updated_at` (timestamptz) - Timestamps

**Edge Format (Critical):**
```json
[
  {"from": "node_001", "to": "node_002"},
  {"from": "node_003", "to": "node_004"}
]
```

These node IDs correspond to your road network graph. The A* algorithm will avoid these edges.

**Key Features:**
- Linked to events
- View `closures_active` shows only active closures
- Used by backend routing engine to avoid closed roads

**Example Insert:**
```sql
INSERT INTO public.closures (event_id, name, type, reason, start_time, end_time, edges, status)
VALUES (
  '<event_id>',
  'Penutupan Jalan Slamet Riyadi',
  'closure',
  'Event setup',
  '2024-06-01 08:00:00+07',
  '2024-06-08 23:00:00+07',
  '[{"from": "node_001", "to": "node_002"}, {"from": "node_002", "to": "node_003"}]',
  'active'
);
```

---

### 4. CONGESTION ZONES (Traffic Congestion)
**File:** `04_congestion_zones.sql`

**Purpose:** Track real-time traffic congestion with severity levels

**Columns:**
- `id` (uuid, PK) - Unique zone ID
- `event_id` (uuid, FK) - References events.id
- `name` (text) - Zone name
- `level` (text) - LOW|MODERATE|HEAVY
- `reason` (text) - Cause of congestion
- `start_time`, `end_time` (timestamptz) - Duration
- `edges` (jsonb) - Affected road edges (same format as closures)
- `estimated_delay_minutes` (integer) - Expected delay
- `status` (text) - active|inactive
- `created_at`, `updated_at` (timestamptz) - Timestamps

**Delay Guidelines:**
- **LOW**: < 5 minutes
- **MODERATE**: 5-15 minutes
- **HEAVY**: > 15 minutes

**Key Features:**
- Auto-updates timestamp on changes
- View `congestion_zones_active` for current congestion
- Backend routing adds penalty time based on congestion level
- Real-time updates support

**Example Insert:**
```sql
INSERT INTO public.congestion_zones (event_id, name, level, reason, start_time, end_time, edges, estimated_delay_minutes, status)
VALUES (
  '<event_id>',
  'Kemacetan Alun-alun Ponorogo',
  'HEAVY',
  'Tinggi volume pengunjung event Ruwah',
  '2024-06-01 08:00:00+07',
  '2024-06-01 14:00:00+07',
  '[{"from": "node_010", "to": "node_011"}]',
  25,
  'active'
);
```

---

### 5. PARKING SPOTS (Parking Management)
**File:** `05_parking_spots.sql`

**Purpose:** Store parking locations for events

**Columns:**
- `id` (uuid, PK) - Unique spot ID
- `event_id` (uuid, FK) - References events.id
- `name` (text) - Parking location name
- `description` (text) - Details (capacity, amenities, etc)
- `capacity` (integer) - Total parking slots
- `available_slots` (integer) - Available spots now
- `location` (text) - Description of location
- `lat`, `lng` (double) - Coordinates
- `is_active` (boolean) - Currently available
- `created_at`, `updated_at` (timestamptz) - Timestamps

**Key Features:**
- Linked to specific events
- Public visibility for active spots
- Frontend can show parking availability
- Indexes for fast location queries

**Example Insert:**
```sql
INSERT INTO public.parking_spots (event_id, name, description, capacity, available_slots, location, lat, lng, is_active)
VALUES (
  '<event_id>',
  'Parkir A - Alun-alun',
  'Area parkir utama dengan keamanan 24 jam',
  500,
  250,
  'Alun-alun Ponorogo',
  -7.8705,
  111.4945,
  true
);
```

---

### 6. SEJARAH (History/Background)
**File:** `06_information_pages.sql`

**Purpose:** Store historical/background information about the event

**Columns:**
- `id` (uuid, PK)
- `title` (text) - Section title
- `description` (text) - Content
- `order_index` (integer) - Display order
- `is_active` (boolean) - Visibility
- `created_at`, `updated_at` (timestamptz)

**Sample Data Included:**
- Asal Usul Spiritual
- Transformasi Publik (1980-an)
- Modernisasi & Adaptasi Digital

**Key Features:**
- Admin-only write access
- Public read access
- Ordered by `order_index`

---

### 7. TENTANG (How-To Guides)
**File:** `06_information_pages.sql`

**Purpose:** Store usage guides and how-to instructions

**Columns:** Same as Sejarah

**Sample Data Included:**
- Pilih Lokasi
- Pilih Metode Transportasi
- Sistem Menghitung Rute
- Ikuti Panduan Navigasi

**Key Features:**
- Same as Sejarah
- Appears in frontend "About" section

---

### 8. POSTER (Media/Images)
**File:** `08_poster_table.sql`

**Purpose:** Store poster/promotional materials

**Columns:**
- `id` (uuid, PK)
- `title` (text) - Poster title
- `description` (text) - Caption
- `image_url` (text) - URL to image in storage bucket
- `event_id` (uuid, FK) - References events.id
- `is_active` (boolean) - Visibility
- `created_at`, `updated_at` (timestamptz)

**Key Features:**
- Images stored in 'posters' bucket (in storage)
- Authenticated users can upload
- Public read access for active posters

---

## Storage Buckets
**File:** `07_storage.sql`

### Bucket Configuration

| Bucket | Max Size | File Types | Access |
|--------|----------|-----------|--------|
| posters | 5MB | Images | Public read, Auth upload |
| events | 5MB | Images | Public read, Auth upload |
| profiles | 5MB | Images | Public read, Auth upload |

### File Path Conventions

```
posters/event_id/poster_id.jpg
events/event_id/event_image.jpg
profiles/user_id/avatar.jpg
```

---

## Key Concepts

### Row Level Security (RLS)

All tables have RLS enabled with policies:
- **Public data** (events, closures, etc) → Anyone can read active items
- **User data** (profiles) → Users can only see their own
- **Admin data** (sejarah, tentang) → Only admins can write

### Views

- `events_active` - Only events currently happening
- `closures_active` - Only active road closures
- `congestion_zones_active` - Only current congestion

These views are used by the backend API for efficiency.

### Triggers & Functions

- `handle_new_user()` - Auto-creates profile when user signs up
- `is_admin()` - Helper function to check if current user is admin
- `set_updated_at_congestion()` - Auto-updates timestamp on changes

---

## Quick Setup Checklist

- [ ] Run 01_authentication.sql
- [ ] Run 02_events.sql
- [ ] Run 03_road_closures.sql
- [ ] Run 04_congestion_zones.sql
- [ ] Run 05_parking_spots.sql
- [ ] Run 06_information_pages.sql
- [ ] Run 07_storage.sql
- [ ] Run 08_poster_table.sql
- [ ] Create admin user in Supabase Auth (email: admin@rutesuro.com)
- [ ] Run admin setup query from 01_authentication.sql
- [ ] Test by creating a sample event

---

## Common Queries for API

### Get All Active Events
```sql
SELECT * FROM events_active ORDER BY start_time ASC;
```

### Get Closures for Specific Event
```sql
SELECT * FROM closures_active 
WHERE event_id = '<event_id>';
```

### Get Congestion for Routing
```sql
SELECT edges, level, estimated_delay_minutes 
FROM congestion_zones_active;
```

### Check if User is Admin
```sql
SELECT public.is_admin();
```

### Get Parking for Event
```sql
SELECT * FROM parking_spots 
WHERE event_id = '<event_id>' AND is_active = true;
```

---

## Troubleshooting

### Error: "relation does not exist"
- Make sure you executed the SQL files in order
- Check if auth functions like `is_admin()` exist
- Verify table names (case-sensitive in PostgreSQL)

### Error: "RLS policy violation"
- Check user is authenticated for protected tables
- Verify role matches policy requirements
- For admin tables, ensure user has admin role

### Foreign Key Errors
- Make sure parent tables exist before child tables
- Use correct UUID format when inserting

---

## Backend Integration

The backend FastAPI application uses these tables through:
- `/events` endpoint - Uses `events_active` view
- `/closures` endpoint - Uses `closures_active` view
- `/congestion_zones` endpoint - Uses `congestion_zones_active` view
- `/parking` endpoint - Queries `parking_spots` directly
- `/info` endpoints - Queries `sejarah` and `tentang` tables

---

## Support & Questions

For issues with Supabase setup:
1. Check if RLS policies are correct
2. Verify foreign key relationships
3. Ensure storage buckets have correct policies
4. Test with simple SELECT queries first
5. Check Supabase logs for detailed errors

---

**Version:** 1.0  
**Last Updated:** 2024  
**For:** Rute Suro Routing Optimization System
