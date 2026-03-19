# ✅ JAWABAN PERTANYAAN SQL ANDA

## Pertanyaan: "Apakah setiap `-- 9. SAMPLE DATA INSERTION` harus mengrunning query baru?"

### **JAWABAN: TIDAK SEKALIGUS! Jalankan 3 Query terpisah dalam urutan spesifik!**

---

## 🎯 Penjelasan Masalah Error Anda

**Error yang Anda lihat:**
```
Error: Failed to run sql query: ERROR: 42703: column "status" does not exist
```

**Penyebab:**
- File `supabase_queries_complete.sql` yang lama mencoba menjalankan INSERT statement SEBELUM tabel `events` dibuat
- Supabase menjalankan query sesuai urutan dalam file
- Jika ada conflict atau tabel tidak exist, query gagal

---

## 📊 Solusi Yang Sudah Saya Buat

Saya sudah membuat **3 file SQL terpisah** yang HARUS dijalankan dalam urutan:

### **FILE 1: `00_SCHEMA_COMPLETE_FIXED.sql`** ⭐
**Jalankan INI PERTAMA KALI**

```sql
-- Isi: Membuat semua tabel, functions, triggers, indexes
-- Baris: 310 lines
-- Yang dilakukan:
  ✅ CREATE TABLE profiles
  ✅ CREATE TABLE events
  ✅ CREATE TABLE closures
  ✅ CREATE TABLE congestion_zones
  ✅ CREATE TABLE parking_spots
  ✅ CREATE TABLE information_pages
  ✅ CREATE TABLE posters
  ✅ CREATE FUNCTION handle_new_user()
  ✅ CREATE FUNCTION is_admin()
  ✅ CREATE TRIGGER on_auth_user_created
  ✅ ALTER TABLE ... ENABLE ROW LEVEL SECURITY
  ✅ CREATE POLICY ... (RLS policies)
  ✅ CREATE INDEX ...
  ✅ CREATE VIEW events_active
```

**Waktu:** ~1 menit  
**Status:** WAJIB, hanya jalankan 1x

---

### **FILE 2: `10_ADMIN_USER_SETUP.sql`** ⭐
**Jalankan INI SETELAH FILE 1 SELESAI**

```sql
-- Apa yang dilakukan:
  ✅ INSERT INTO public.profiles (untuk admin user)
  ✅ SET role = 'admin'

-- Catatan: Admin user HARUS sudah dibuat di Supabase Auth terlebih dahulu!
-- Cara: Supabase Dashboard > Authentication > Users > Create new user
```

**Waktu:** ~10 detik  
**Status:** WAJIB, hanya jalankan 1x

---

### **FILE 3: `11_SAMPLE_DATA.sql`** ⭐
**Jalankan INI SETELAH FILE 2 SELESAI (OPSIONAL)**

```sql
-- Apa yang dilakukan:
  ✅ INSERT INTO public.events (2 sample events)
  ✅ INSERT INTO public.closures (sample road closures)
  ✅ INSERT INTO public.congestion_zones (sample congestion)
  ✅ INSERT INTO public.parking_spots (sample parking)
  ✅ INSERT INTO public.information_pages (sample info)
```

**Waktu:** ~10 detik  
**Status:** OPSIONAL, gunakan untuk testing

---

## 🚀 Langkah-Langkah Eksekusi

### **LANGKAH 1: Jalankan Schema (1x saja)**

1. Buka Supabase Dashboard
2. Klik "SQL Editor"
3. Klik "+" buat query baru
4. **Copy-paste SELURUH** isi `sql/00_SCHEMA_COMPLETE_FIXED.sql`
5. Klik "Run" atau tekan Ctrl+Enter
6. **TUNGGU sampai selesai** (tidak ada error merah)
7. Verifikasi: Pergi ke "Tables" tab di sebelah, lihat apakah 8 tabel sudah ada

**Screenshot expected:**
```
✅ profiles
✅ events  
✅ closures
✅ congestion_zones
✅ parking_spots
✅ information_pages
✅ posters
```

---

### **LANGKAH 2: Buat Admin User**

1. Di Supabase Dashboard, klik "Authentication" di sebelah kiri
2. Klik tab "Users"
3. Klik tombol biru "+ Create new user"
4. Isi form:
   - **Email:** `admin@rutesuro.com`
   - **Password:** (set yourself, contoh: `AdminRuteSuro123!`)
   - **Auto confirm user:** Check ✓
5. Klik "Create user"
6. **CATAT UUID yang ditampilkan** (format: `550e8400-e29b-41d4-a716-446655440000`)

---

### **LANGKAH 3: Jalankan Admin Setup Query**

1. Buka SQL Editor (atau tab baru)
2. **Copy-paste** isi `sql/10_ADMIN_USER_SETUP.sql`
3. Klik "Run"
4. Verifikasi: Di bawah harusnya muncul hasil:

```
id                                   | email              | full_name          | role  | is_active
550e8400-e29b-41d4-a716-446655440000 | admin@rutesuro.com | Admin Rute Suro    | admin | true
```

Jika ada hasil, berarti **SUCCESS!** ✅

---

### **LANGKAH 4: Insert Sample Data (OPSIONAL)**

1. Buka SQL Editor
2. **Copy-paste** isi `sql/11_SAMPLE_DATA.sql`
3. Klik "Run"
4. Di bawah harusnya muncul 5 tabel hasil (Events, Closures, Congestion, Parking, Info)

Gunakan data ini untuk testing frontend. Dapat didelete nanti.

---

## 📋 Checklist Saat Setup

- [ ] File `00_SCHEMA_COMPLETE_FIXED.sql` sudah dijalankan (tanpa error)
- [ ] Admin user sudah dibuat di Auth > Users
- [ ] File `10_ADMIN_USER_SETUP.sql` sudah dijalankan (ada hasil)
- [ ] (Optional) File `11_SAMPLE_DATA.sql` sudah dijalankan

---

## 💡 Tips & Tricks

### Q: Bagaimana jika saya ingin jalankan ulang?
A: Aman! Karena ada `IF NOT EXISTS` dan `ON CONFLICT`, bisa dijalankan berkali-kali tanpa masalah.

### Q: Bisakah saya hapus sample data nanti?
A: YES! Jalankan:
```sql
DELETE FROM public.events WHERE name LIKE 'Perayaan%' OR name LIKE 'Pameran%';
DELETE FROM public.congestion_zones WHERE name LIKE 'Zona%';
DELETE FROM public.parking_spots;
DELETE FROM public.information_pages;
```

### Q: Kenapa harus 3 query terpisah?
A: Karena:
1. **FILE 1** harus membuat struktur (tabel, functions, triggers)
2. **FILE 2** harus menunggu admin user ada di Auth (dibuat manual)
3. **FILE 3** hanya sample data, bisa didelete

Jika dijalankan sekaligus, akan error karena tabel belum ada!

---

## ✅ Setelah Setup Selesai

Lanjut ke:
1. **Backend:** Setup Python environment & dependencies
2. **Frontend:** Update API URL ke `localhost:8000`
3. **Test:** Jalankan `backend/test_api.py`

---

## 📞 Jika Ada Error

**Error: "Table already exists"**
- Ini NORMAL dan BUKAN ERROR! Lanjut aja.

**Error: "Column 'status' does not exist"**
- Berarti File 1 belum selesai dijalankan
- Pastikan tidak ada error merah saat menjalankan File 1
- Cek di Tables tab apakah `events` table sudah ada

**Error: "Admin user not found"**
- Berarti admin user belum dibuat di Supabase Auth
- Jalankan LANGKAH 2 dulu sebelum File 2

---

## 📚 File Reference

| File | Baris | Purpose | Jalankan Kali |
|------|-------|---------|--------------|
| `00_SCHEMA_COMPLETE_FIXED.sql` | 310 | Create tables, functions, triggers | **PERTAMA** |
| `10_ADMIN_USER_SETUP.sql` | 29 | Set admin role | **KEDUA** |
| `11_SAMPLE_DATA.sql` | 229 | Sample data untuk testing | **KETIGA (OPT)** |

**TOTAL:** 568 baris SQL yang sudah dioptimasi

---

## 🎉 KESIMPULAN

**TIDAK SEKALIGUS!** Jalankan 3 file terpisah dalam urutan:

```
FILE 1 (00_*.sql) 
    ↓
FILE 2 (10_*.sql)
    ↓
FILE 3 (11_*.sql) [OPTIONAL]
```

Setiap file adalah **1 query terpisah**, jalankan satu persatu!

**Sudah selesai?** Lanjut ke Backend setup! 🚀
