# Panduan Instalasi Rute Suro (Project Baru)

## Persyaratan Sistem

Sebelum memulai, pastikan Anda telah menginstal:

1. **Node.js** (versi 16 atau lebih baru)
   - Download dari: https://nodejs.org/
   - Verifikasi: `node -v` dan `npm -v` di terminal

2. **Git** (untuk version control)
   - Download dari: https://git-scm.com/

3. **Text Editor** (pilih salah satu):
   - VSCode (https://code.visualstudio.com/)
   - Sublime Text
   - Atom

---

## Langkah 1: Setup Project

### A. Extract/Copy Project ke Folder Lokal

```bash
# Jika Anda memiliki file ZIP
unzip rute-suro-new.zip

# Atau pindahkan folder ke lokasi yang Anda inginkan
cd rute-suro-new
```

### B. Buka Terminal di Folder Project

```bash
# Windows: Buka folder, tekan Shift+Kanan klik, pilih "Open PowerShell here"
# Mac/Linux: Buka Terminal dan navigate ke folder project
cd /path/to/rute-suro-new
```

---

## Langkah 2: Install Dependencies

Jalankan perintah berikut untuk menginstall semua dependencies yang diperlukan:

```bash
npm install
```

**Apa yang terjadi:**
- npm akan membaca `package.json`
- Mengunduh semua dependencies (React, React Router, Leaflet, Tailwind CSS, dll)
- Membuat folder `node_modules` (ini normal, akan berukuran ~400MB)
- Membuat file `package-lock.json` (jangan dihapus)

**Waktu yang dibutuhkan:** 2-5 menit tergantung kecepatan internet

---

## Langkah 3: Jalankan Development Server

```bash
npm run dev
```

**Output yang akan Anda lihat:**
```
➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

**Langkah selanjutnya:**
- Browser akan otomatis membuka ke http://localhost:5173
- Jika tidak, buka manual dan paste URL tersebut

---

## Langkah 4: Verifikasi Aplikasi Berjalan

Setelah browser terbuka, Anda akan melihat:
1. **HomePage** dengan hero section "Navigasi Cerdas Grebeg Suro"
2. **Navigasi** di atas dengan menu: Home, Map, Tentang, Sejarah, Jadwal
3. **Admin Login** button di navbar (kanan atas)

### Test Semua Fitur:

- Klik menu di navbar untuk navigasi
- Klik "Admin Login" → masukkan password `admin123`
- Akses Admin Dashboard untuk mengelola events

---

## Langkah 5: Build untuk Production

Ketika sudah siap deploy:

```bash
npm run build
```

**Output:**
- Folder `dist` akan dibuat dengan file-file optimized
- Ukuran akan jauh lebih kecil (~150KB untuk production)

---

## Struktur Folder Project

```
rute-suro-new/
├── src/
│   ├── pages/
│   │   ├── HomePage.jsx           ← Halaman utama
│   │   ├── UserMapPage.jsx        ← Peta & navigasi
│   │   ├── TentangPage.jsx        ← Tentang & FAQ
│   │   ├── SejarahPage.jsx        ← Sejarah Grebeg Suro
│   │   ├── JadwalPage.jsx         ← Jadwal acara
│   │   ├── AdminLogin.jsx         ← Admin login
│   │   └── AdminDashboard.jsx     ← Admin panel
│   ├── App.jsx                    ← Main app component (routing)
│   ├── main.jsx                   ← Entry point
│   └── index.css                  ← Global styles (Tailwind)
├── index.html                     ← HTML entry point
├── package.json                   ← Dependencies & scripts
├── vite.config.js                 ← Vite configuration
├── tailwind.config.js             ← Tailwind CSS config
├── postcss.config.js              ← PostCSS config
└── .gitignore                     ← Git ignore rules
```

---

## Troubleshooting

### 1. Error: "npm command not found"
**Solusi:** Install Node.js dari https://nodejs.org/

### 2. Error: "Cannot find module 'react'"
**Solusi:** Jalankan `npm install` lagi

### 3. Port 5173 sudah digunakan
**Solusi:** 
```bash
# Linux/Mac
sudo lsof -i :5173
kill -9 <PID>

# Atau gunakan port lain
npm run dev -- --port 3000
```

### 4. Aplikasi tidak meload
**Solusi:**
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server (Ctrl+C kemudian `npm run dev` lagi)

### 5. Hot Module Replacement (HMR) tidak bekerja
**Solusi:** Buka `vite.config.js` dan pastikan sudah ada konfigurasi HMR, atau restart browser

---

## Fitur yang Tersedia

### ✅ Sudah Diimplementasikan:
- ✓ Responsive navbar dengan mobile menu
- ✓ 6 halaman utama (Home, Map, About, History, Schedule, Admin)
- ✓ Admin login dengan demo password (admin123)
- ✓ Admin dashboard untuk manage events
- ✓ Leaflet map integration (dengan placeholder)
- ✓ FAQ accordion di halaman tentang
- ✓ Jadwal acara dengan filter per hari
- ✓ Footer yang responsive
- ✓ Tailwind CSS styling (semua custom colors)

### 🔄 Untuk Dikembangkan:
- Integrasi database (Supabase/Firebase)
- Real-time map routing
- Authentication system yang lebih robust
- Payment gateway (jika diperlukan)
- Notification system
- Social media integration

---

## Command-Command Penting

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Preview build
npm run preview

# Lihat versi package
npm list
```

---

## Tips Pengembangan

1. **Jangan Edit node_modules** - Ini folder yang di-generated otomatis
2. **Simpan perubahan akan auto-reload** - HMR (Hot Module Replacement) sudah aktif
3. **Gunakan browser DevTools** (F12) untuk debugging
4. **Commit ke Git regularly** untuk backup
5. **Baca dokumentasi Tailwind** untuk styling: https://tailwindcss.com/

---

## Deploy ke Hosting

### Option 1: Vercel (Recommended)
1. Push ke GitHub
2. Buka vercel.com
3. Import project dari GitHub
4. Vercel akan auto-detect Vite dan deploy

### Option 2: Netlify
1. Buka netlify.com
2. Drag & drop folder `dist` atau connect GitHub
3. Selesai!

### Option 3: Manual Hosting
1. Jalankan `npm run build`
2. Upload folder `dist` ke hosting Anda
3. Set server untuk redirect semua request ke `index.html`

---

## Kontak & Support

Jika ada masalah atau pertanyaan, silakan:
- Cek error message di terminal/browser console
- Baca dokumentasi: https://react.dev
- Lihat dokumentasi Tailwind: https://tailwindcss.com/
- Cek Vite docs: https://vitejs.dev/

---

**Selamat! Project Anda sudah siap dikembangkan! 🎉**
