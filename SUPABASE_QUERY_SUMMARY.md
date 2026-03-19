# Rute Suro - Supabase Query Organization Summary

## Quick Navigation

Anda telah menerima **9 file SQL yang sudah diorganisir berdasarkan fungsi/kebutuhan tabel**. Berikut adalah ringkasannya:

---

## File Organization (Terpisah per Fungsi)

### 1️⃣ **01_authentication.sql** (Autentikasi & Profil Pengguna)
```
Tabel: profiles
Fungsi: User management, role-based access control (RBAC)
Berisi: User profiles, admin checker, auto-trigger saat user baru daftar
Ukuran: 85 baris
```

### 2️⃣ **02_events.sql** (Manajemen Event/Acara)
```
Tabel: events, events_active (view)
Fungsi: Menyimpan data event/acara dengan lokasi dan waktu
Berisi: Event info, RLS policies, indexes, sample comments
Ukuran: 69 baris
```

### 3️⃣ **03_road_closures.sql** (Penutupan Jalan/Rekayasa)
```
Tabel: closures, closures_active (view)
Fungsi: Track closed/restricted roads untuk routing optimization
Berisi: Road closure data dengan edge format untuk A* algorithm
Ukuran: 74 baris
```

### 4️⃣ **04_congestion_zones.sql** (Zona Kemacetan Real-time)
```
Tabel: congestion_zones, congestion_zones_active (view)
Fungsi: Track traffic congestion dengan severity levels (LOW/MODERATE/HEAVY)
Berisi: Congestion data, delay estimates, auto-update timestamp trigger
Ukuran: 88 baris
```

### 5️⃣ **05_parking_spots.sql** (Titik Parkir)
```
Tabel: parking_spots
Fungsi: Menyimpan lokasi parkir untuk event-specific
Berisi: Parking locations dengan capacity tracking
Ukuran: 71 baris
```

### 6️⃣ **06_information_pages.sql** (Halaman Informasi)
```
Tabel: sejarah, tentang
Fungsi: Menyimpan konten history & how-to guides
Berisi: Sample data sejarah Ruwah Ponorogo & panduan penggunaan
Ukuran: 115 baris
```

### 7️⃣ **07_storage.sql** (Konfigurasi File Storage)
```
Buckets: posters, events, profiles
Fungsi: Configure storage buckets & RLS policies untuk gambar
Berisi: 3 bucket configurations dengan 9 RLS policies
Ukuran: 83 baris
```

### 8️⃣ **08_poster_table.sql** (Tabel Poster/Media)
```
Tabel: poster
Fungsi: Menyimpan poster event & promotional materials
Berisi: Poster data dengan reference ke storage bucket
Ukuran: 63 baris
```

### 9️⃣ **supabase_queries_complete.sql** (Lengkap - Semua dalam 1 File)
```
Tabel: Semua 8 tabel + storage
Fungsi: File lengkap jika ingin run semua sekaligus
Berisi: Gabungan dari file 1-8
Ukuran: 489 baris
```

---

## Execution Order (Urutan Eksekusi)

**PENTING: Eksekusi dalam urutan ini karena ada foreign key dependencies!**

```
1. 01_authentication.sql    ← User profiles & auth system
2. 02_events.sql            ← Event management (diperlukan oleh tabel lain)
3. 03_road_closures.sql     ← Road closures (FK ke events)
4. 04_congestion_zones.sql  ← Congestion zones (FK ke events)
5. 05_parking_spots.sql     ← Parking spots (FK ke events)
6. 06_information_pages.sql ← Sejarah & tentang (independent)
7. 07_storage.sql           ← Storage buckets & policies
8. 08_poster_table.sql      ← Poster table (FK ke events)
```

**Total Execution Time:** ~5-10 detik untuk semua file

---

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────┐
│          SUPABASE AUTH (auth.users)                 │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│  1. PROFILES (User Management & RBAC)               │
│  - id (PK), email, full_name, avatar_url, role     │
│  - Trigger: auto-create pada user baru              │
│  - Function: is_admin()                             │
└─────────────────────────────────────────────────────┘
                 ↑
    ┌────────────┼────────────┐
    │            │            │
    ↓            ↓            ↓
┌──────┐   ┌──────────┐  ┌──────────┐
│      │   │          │  │          │
│ 6-7. │   │ 2.EVENTS │  │6-7. Info│
│      │   │          │  │   Pages  │
└──────┘   └────┬─────┘  └──────────┘
                │
     ┌──────────┼──────────┐
     │          │          │
     ↓          ↓          ↓
┌─────────┐ ┌──────────┐ ┌──────────┐
│3.       │ │4.        │ │5.        │
│CLOSURES │ │CONGESTION│ │PARKING   │
│         │ │ZONES     │ │SPOTS     │
└─────────┘ └──────────┘ └──────────┘
     
     ┌──────────┐
     │8. POSTER │
     └──────────┘
     
┌──────────────────────┐
│7. STORAGE BUCKETS    │
│ - posters            │
│ - events             │
│ - profiles           │
└──────────────────────┘
```

---

## Tabel & Fungsinya (Summary Table)

| No | Tabel | Fungsi | FK Dependencies | Status |
|----|-------|--------|-----------------|--------|
| 1 | profiles | User auth & RBAC | auth.users | Core |
| 2 | events | Event management | profiles.id (organizer) | Core |
| 3 | closures | Road closures | events.id | Core |
| 4 | congestion_zones | Traffic congestion | events.id | Core |
| 5 | parking_spots | Parking locations | events.id | Core |
| 6 | sejarah | History content | None | Info |
| 7 | tentang | How-to guides | None | Info |
| 8 | poster | Poster media | events.id | Media |

---

## Key Features by Table

### 🔐 Authentication & Access Control
- **profiles** table: Store user roles (user/admin)
- **RLS Policies**: Strict role-based access
- **is_admin()** function: Check admin status

### 📍 Location & Events
- **events** table: Store event info dengan coordinates
- **events_active** view: Only happening events
- Public read, authenticated write

### 🛣️ Traffic Management
- **closures** table: Penutupan jalan dengan edges format
- **congestion_zones** table: Kemacetan real-time dengan severity
- **parking_spots** table: Lokasi parkir per event

### 📚 Information & Media
- **sejarah** table: History of event
- **tentang** table: How-to guides
- **poster** table: Event posters & promotional images

### 📦 Storage
- **3 buckets**: posters, events, profiles
- **RLS policies**: Secure public/authenticated access
- **File limits**: 5MB per file, images only

---

## How Backend Uses These Queries

### API Endpoints Integration:

```python
# GET /events - Uses events_active view
SELECT * FROM events_active ORDER BY start_time;

# GET /closures/<event_id> - Uses closures_active view
SELECT * FROM closures_active WHERE event_id = ?;

# GET /congestion_zones - Uses congestion_zones_active view
SELECT edges, level, estimated_delay_minutes FROM congestion_zones_active;

# POST /route - A* algorithm uses:
- events (for waypoints)
- closures (edges to avoid)
- congestion_zones (penalty costs)

# GET /parking/<event_id> - Direct table query
SELECT * FROM parking_spots WHERE event_id = ? AND is_active = true;

# GET /info/history - Uses sejarah table
SELECT * FROM sejarah WHERE is_active = true ORDER BY order_index;

# GET /info/about - Uses tentang table
SELECT * FROM tentang WHERE is_active = true ORDER BY order_index;
```

---

## RLS Security Model

### Public Access (Anyone can read)
- ✅ events (active only)
- ✅ closures (active only)
- ✅ congestion_zones (active only)
- ✅ parking_spots (active only)
- ✅ sejarah (active only)
- ✅ tentang (active only)
- ✅ poster (active only)
- ✅ storage images

### Authenticated Users (Can read/write)
- ✅ events (create/edit own)
- ✅ closures (create/edit)
- ✅ congestion_zones (create/edit)
- ✅ parking_spots (create/edit)
- ✅ poster (upload/delete)

### Admin Only
- ✅ sejarah (write/delete)
- ✅ tentang (write/delete)
- ✅ profiles (manage users)

---

## Setup Checklist

```
□ Copy SQL files ke folder: backend/sql/
□ Login ke Supabase Console
□ Buka SQL Editor

Execution:
□ Run 01_authentication.sql
□ Run 02_events.sql
□ Run 03_road_closures.sql
□ Run 04_congestion_zones.sql
□ Run 05_parking_spots.sql
□ Run 06_information_pages.sql
□ Run 07_storage.sql
□ Run 08_poster_table.sql

Verification:
□ Check all tables created (Table menu)
□ Check views exist (events_active, closures_active, congestion_zones_active)
□ Check storage buckets (Storage menu)
□ Check RLS is enabled on all tables
□ Create test event & verify data

Admin Setup:
□ Create admin user in Supabase Auth (email: admin@rutesuro.com)
□ Run admin setup query from 01_authentication.sql
□ Verify admin role assigned
```

---

## File Locations

```
/vercel/share/v0-project/
├── backend/
│   ├── sql/
│   │   ├── 01_authentication.sql
│   │   ├── 02_events.sql
│   │   ├── 03_road_closures.sql
│   │   ├── 04_congestion_zones.sql
│   │   ├── 05_parking_spots.sql
│   │   ├── 06_information_pages.sql
│   │   ├── 07_storage.sql
│   │   ├── 08_poster_table.sql
│   │
│   ├── supabase_queries_complete.sql  (Lengkap - semua 8 tabel)
│   ├── SQL_SETUP_GUIDE.md             (Dokumentasi lengkap)
│
└── SUPABASE_QUERY_SUMMARY.md          (File ini)
```

---

## Common Issues & Solutions

### ❌ Error: "relation X does not exist"
**Solusi:** Pastikan file dijalankan dalam urutan yang benar

### ❌ Error: "violates foreign key constraint"
**Solusi:** Run parent table queries terlebih dahulu (run dalam order!)

### ❌ RLS policy error
**Solusi:** Check if user authenticated, check role permissions

### ❌ Storage bucket error
**Solusi:** Run 07_storage.sql untuk create buckets & policies

---

## Next Steps

1. **Copy SQL files** ke folder `backend/sql/`
2. **Login ke Supabase** console
3. **Execute files** dalam urutan yang disarankan
4. **Create admin user** dan setup admin role
5. **Test dengan API** - jalankan backend & test endpoints
6. **Check data** di Supabase console

---

## Support

Jika ada masalah:
1. Check Supabase SQL logs
2. Verify execution order
3. Ensure storage buckets created
4. Test dengan query sederhana dulu
5. Check RLS policies

---

**Version:** 1.0  
**Total Files:** 9 (8 organized + 1 complete)  
**Total Lines:** 1,300+ SQL queries  
**For:** Rute Suro Backend + Supabase Integration
