# 🎯 Supabase SQL Execution Order - PENTING!

## ⚠️ JANGAN JALANKAN SEKALIGUS! IKUTI URUTAN INI!

Anda HARUS menjalankan file SQL dalam urutan ini untuk menghindari error!

---

## STEP 1: Setup Schema (WAJIB PERTAMA)

**File:** `sql/00_SCHEMA_COMPLETE_FIXED.sql`

**Apa yang dilakukan:**
- ✅ Membuat semua tabel (profiles, events, closures, dll)
- ✅ Membuat trigger dan functions
- ✅ Membuat views
- ✅ Membuat indexes
- ✅ Setup RLS policies
- ✅ Setup storage buckets

**Cara menjalankan di Supabase:**

1. Buka Supabase Dashboard
2. Click "SQL Editor" di sebelah kiri
3. Click tombol "+" untuk query baru
4. Copy-paste SELURUH isi file `00_SCHEMA_COMPLETE_FIXED.sql`
5. Klik "Run" atau tekan Ctrl+Enter
6. **TUNGGU sampai selesai** (tidak ada error)

**Waktu:** ~30 detik - 1 menit

**Kesalahan yang mungkin:**
- ❌ "Table already exists" - OK, ini normal (IF NOT EXISTS)
- ❌ "Column 'status' does not exist" - ERROR! Cek apakah Step 1 sudah selesai

---

## STEP 2: Buat Admin User (WAJIB KEDUA)

**Lokasi:** Di Supabase Dashboard Auth > Users

**Cara:**
1. Buka Supabase Dashboard
2. Click "Authentication" di sebelah kiri
3. Click tab "Users"
4. Klik tombol "+ Create new user"
5. Isi:
   - Email: `admin@rutesuro.com`
   - Password: (set your password, contoh: `AdminRuteSuro123!`)
   - Auto-confirm user: centang ✓
6. Klik "Create user"
7. **CATAT UUID-nya** (akan dipakai step 3)

**Contoh UUID:** `550e8400-e29b-41d4-a716-446655440000`

---

## STEP 3: Konfirmasi Admin User (WAJIB KETIGA)

**File:** `sql/10_ADMIN_USER_SETUP.sql`

**Cara menjalankan:**

1. Buka Supabase SQL Editor (atau tab baru)
2. Copy-paste isi file `10_ADMIN_USER_SETUP.sql`
3. Klik "Run"
4. **Verifikasi hasil:**
   - Seharusnya muncul 1 baris dengan email `admin@rutesuro.com` dan role `admin`

**Verifikasi query:**
```sql
SELECT id, email, full_name, role, is_active 
FROM public.profiles 
WHERE email = 'admin@rutesuro.com';
```

**Expected hasil:**
```
id                                   | email                | role  | is_active
550e8400-e29b-41d4-a716-446655440000 | admin@rutesuro.com   | admin | true
```

---

## STEP 4: Insert Sample Data (OPSIONAL)

**File:** `sql/11_SAMPLE_DATA.sql`

**Apa yang dilakukan:**
- ✅ Membuat 2 sample events (Hardiknas, Pameran)
- ✅ Membuat sample closures
- ✅ Membuat sample congestion zones
- ✅ Membuat sample parking spots
- ✅ Membuat sample information pages

**Cara menjalankan:**

1. Copy-paste isi file `11_SAMPLE_DATA.sql`
2. Klik "Run"
3. Verifikasi di akhir akan muncul 5 result sets

**Gunakan ini untuk testing frontend!**

---

## 📊 Timeline Lengkap

```
┌─────────────────────────────────────────┐
│ STEP 1: Schema Setup (00_*.sql)          │
│ - Jalankan 1x, JANGAN DIULANG           │
│ - Waktu: ~1 menit                        │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ STEP 2: Create Admin User di Auth       │
│ - Buat user via Supabase Dashboard      │
│ - CATAT UUID-nya                        │
│ - Waktu: ~1 menit                        │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ STEP 3: Confirm Admin (10_*.sql)        │
│ - Jalankan SQL untuk set role=admin     │
│ - Verifikasi dengan SELECT query        │
│ - Waktu: ~10 detik                       │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ STEP 4: Sample Data (11_*.sql)          │
│ - OPSIONAL, untuk testing               │
│ - Waktu: ~10 detik                       │
└─────────────────────────────────────────┘
```

**Total waktu: ~3 menit**

---

## ✅ Checklist Sebelum Production

- [ ] Schema sudah dibuat (STEP 1)
- [ ] Admin user sudah dibuat (STEP 2)
- [ ] Admin role sudah di-confirm (STEP 3)
- [ ] Sample data sudah diinsert (STEP 4, optional)
- [ ] Backend sudah setting SUPABASE_URL dan SUPABASE_KEY
- [ ] Frontend sudah setting koneksi ke backend (port 8000)
- [ ] Semua test cases passed

---

## 🚨 TROUBLESHOOTING

### Error: "Table already exists"
**Solusi:** NORMAL! Ini karena `IF NOT EXISTS`. Lanjut ke step berikutnya.

### Error: "Column 'status' does not exist"
**Solusi:** Step 1 tidak selesai dengan baik. Cek:
1. Apakah ada error saat menjalankan 00_*.sql?
2. Jalankan verification query di Supabase:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'events';
   ```
3. Jika tidak ada, jalankan ulang Step 1

### Error: "Admin user not found"
**Solusi:**
1. Cek apakah email `admin@rutesuro.com` sudah dibuat di Auth > Users
2. Cek format email (harus lowercase)
3. Jalankan ulang Step 3

### Error: "Permission denied" saat insert data
**Solusi:**
1. Pastikan admin user sudah dibuat dan memiliki role 'admin'
2. Jalankan ulang Step 3
3. Cek RLS policies pada tabel

---

## 📝 File Summary

| File | Purpose | Mandatory? |
|------|---------|-----------|
| `00_SCHEMA_COMPLETE_FIXED.sql` | Create all tables & functions | ✅ YES |
| `10_ADMIN_USER_SETUP.sql` | Set admin role | ✅ YES |
| `11_SAMPLE_DATA.sql` | Insert sample data | ❌ NO (optional) |

---

## 🎯 Setelah Setup Lengkap

Lanjut ke:
- **Backend setup:** `backend/INSTALLATION.md`
- **Frontend setup:** `QUICKSTART.md`
- **API testing:** `API_REFERENCE.md`
