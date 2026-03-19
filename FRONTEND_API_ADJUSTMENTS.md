# Frontend API Adjustments untuk Rute-Suro Backend Baru

## 📋 Ringkasan Perubahan

Frontend Anda **SUDAH KOMPATIBEL** dengan backend FastAPI baru! Namun ada **beberapa penyesuaian kecil** yang perlu dilakukan untuk integrasi sempurna.

---

## ✅ Yang TIDAK Perlu Diubah

### 1. **Maps (Leaflet)**
- ✅ Tetap menggunakan `react-leaflet` 
- ✅ Semua komponen map: `MapContainer`, `TileLayer`, `MapLayers`, `MapOverlays`
- ✅ Geolocation & tracking functionality tetap sama
- ✅ Visual elements: icons, overlays, decorations

### 2. **UI Components**
- ✅ Navbar, RightDockPanel, EventPicker, BottomSheet
- ✅ Tailwind styling tetap sama
- ✅ Semua page: HomePage, JadwalPage, SejarahPage, TentangPage, UserMapPage

### 3. **Authentication (Supabase)**
- ✅ `src/lib/auth.js` dan `src/lib/authService.js` tetap sama
- ✅ Admin login flow tetap sama
- ✅ RLS policies di database otomatis handle authorization

---

## ⚠️ Perubahan KECIL yang Perlu Dilakukan

### **1. API Base URL** 
**File: `src/lib/api.js` dan `src/lib/backendApi.js`**

#### Perubahan:
- **LAMA**: Port 5000 (Flask)
- **BARU**: Port 8000 (FastAPI)

**Di `src/lib/api.js` baris 1-3:**
```javascript
// ❌ LAMA:
const API_BASE_URL = 
  import.meta.env.VITE_API_BASE ||
  "http://127.0.0.1:5000";  // ← Port 5000

// ✅ BARU:
const API_BASE_URL = 
  import.meta.env.VITE_API_BASE ||
  "http://127.0.0.1:8000";  // ← Port 8000
```

**Di `src/lib/backendApi.js` baris 3:**
```javascript
// ❌ LAMA:
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

// ✅ BARU:
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
```

---

### **2. Route Endpoint** 
**File: `src/pages/guest/UserMapPage.jsx`**

#### Perubahan di Baris 251 (findRoute function):

```javascript
// ❌ LAMA:
const { data } = await api.post('/route', { start: s, end: e, mode: 'both' })

// ✅ BARU:
// Sama persis, tidak ada perubahan!
// Backend FastAPI sudah menerima format yang sama
const { data } = await api.post('/route', { start: s, end: e, mode: 'both' })
```

**NOTE**: API endpoint tetap `/route` dengan request body sama!

---

### **3. Route Response Format**
**Perubahan di `src/pages/guest/UserMapPage.jsx` Baris 252-256:**

```javascript
// ❌ LAMA (Flask):
const fast = data.fastest || null, short = data.shortest || null
setRoutes({ fastest: fast, shortest: short })

// ✅ BARU (FastAPI - SAMA):
// Response format sama persis:
// {
//   "fastest": { "polyline": [...], "steps": [...], "total_time_sec": 123, ... },
//   "shortest": { "polyline": [...], "steps": [...], "total_distance_m": 456, ... }
// }
const fast = data.fastest || null, short = data.shortest || null
setRoutes({ fastest: fast, shortest: short })
```

**TL;DR**: Response structure tetap sama, tidak ada perubahan kode diperlukan!

---

### **4. Map Bootstrap Endpoint**
**File: `src/pages/guest/UserMapPage.jsx` Baris 182:**

```javascript
// ✅ SAMA - Tidak ada perubahan
const { data } = await api.get('/map_bootstrap')
setEvents(Array.isArray(data.events) ? data.events : [])
const cl = Array.isArray(data.closures_active) ? data.closures_active : []
setClosures(cl)
```

Backend response format:
```json
{
  "events": [...],
  "closures_active": [...],
  "parking_spots": [...],
  "congestion_active": [...]
}
```

---

### **5. Nearest Street Endpoint**
**File: `src/pages/guest/UserMapPage.jsx` Baris 384:**

```javascript
// ✅ SAMA - Tidak ada perubahan
api.get(`/nearest_street?lat=${myPos.lat}&lng=${myPos.lng}`)
  .then(res => setCurrentStreet(res?.data?.street_name || ''))
```

---

## 🔧 Checklist Penyesuaian

### Frontend Changes Required:
- [ ] Update `src/lib/api.js` - change port 5000 → 8000
- [ ] Update `src/lib/backendApi.js` - change port 5000 → 8000

### Tidak Perlu Diubah:
- ✅ UserMapPage.jsx - endpoint tetap sama
- ✅ Map components - tetap sama
- ✅ UI components - tetap sama
- ✅ Authentication - tetap sama
- ✅ Supabase integration - tetap sama

---

## 🚀 Cara Implementasi

### **Step 1: Update API Base URLs**

**`src/lib/api.js`:**
```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE ||
  "http://127.0.0.1:8000";  // ← Ubah dari 5000 ke 8000
```

**`src/lib/backendApi.js`:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000'  // ← Ubah dari 5000 ke 8000
```

### **Step 2: Dalam `.env` atau di Vercel Settings:**
```
VITE_API_BASE=http://localhost:8000    # Untuk development
VITE_API_BASE=https://backend.yourdomain.com  # Untuk production
```

### **Step 3: Test**
```bash
npm run dev
# Buka browser ke http://localhost:5173
# Coba fitur routing - seharusnya berfungsi normal
```

---

## 📡 API Endpoint Comparison

| Endpoint | Method | Lama (Flask) | Baru (FastAPI) | Status |
|----------|--------|------|----------|--------|
| `/route` | POST | ✅ | ✅ | Sama persis |
| `/map_bootstrap` | GET | ✅ | ✅ | Sama persis |
| `/nearest_street` | GET | ✅ | ✅ | Sama persis |
| `/events` | GET | ✅ | ✅ | Sama persis |
| `/closures` | GET | ✅ | ✅ | Sama persis |
| `/congestion` | GET | - | ✅ | Baru |
| `/parking_spots` | GET | - | ✅ | Baru |

---

## 🎯 Summary

**Kabar Baik:**
- Frontend tetap hampir 100% sama
- Maps functionality tetap sama
- UI components tetap sama
- Supabase integration tetap sama
- **HANYA 2 file yang perlu minor update** (port change)

**Waktu Update:** ~5 menit

**Testing:** Semua fitur seharusnya berfungsi identik dengan backend lama!

---

## 📚 Additional Files

Jika ada environment variable issues:
- Cek: `src/lib/supabase.js` - pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` ada
- Cek: `.env` file - pastikan semua variables tersedia

---

## ❓ Troubleshooting

**Error: "Failed to fetch /route"**
- ✅ Check port 8000 is running: `python backend/main.py`
- ✅ Check `API_BASE_URL` in api.js and backendApi.js
- ✅ Check CORS is enabled (it is by default)

**Error: "Cannot read property 'data' of undefined"**
- ✅ Backend response format mungkin berbeda - check browser console network tab
- ✅ Cek `/map_bootstrap` response di backend test

**Map tidak muncul**
- ✅ Leaflet dependency sudah ada di package.json
- ✅ Check browser console untuk errors
- ✅ Pastikan API responses returning correct data

---

## 📖 Reference

- **New Backend Docs**: `/COMPLETE_README.md`, `/API_REFERENCE.md`
- **Installation Guide**: `/INSTALLATION.md`
- **Test Suite**: `backend/test_api.py`

Done! Frontend adjustment minimal dan system siap go-live! 🚀
