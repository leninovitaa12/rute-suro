# RUTE SURO - Navigasi Cerdas Grebeg Suro Ponorogo

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/react-18.3.1-blue)
![Vite](https://img.shields.io/badge/vite-5.0.10-green)
![Tailwind](https://img.shields.io/badge/tailwindcss-3.4.1-38B2AC)

Aplikasi web responsif untuk navigasi dan pengelolaan acara Grebeg Suro Ponorogo dengan sistem admin yang lengkap.

## 🎯 Tentang Project

**Rute Suro** adalah platform navigasi cerdas yang dirancang khusus untuk membantu pengunjung Grebeg Suro menemukan rute terbaik dan mengoptimalkan pengalaman mereka. Dengan interface yang intuitif dan fitur yang lengkap, aplikasi ini membuat perjalanan ke Grebeg Suro menjadi lebih mudah dan menyenangkan.

## 🚀 Fitur Utama

### Untuk Pengunjung:
- **Halaman Utama** - Homepage dengan hero section dan informasi event
- **Peta Interaktif** - Integrasi Leaflet untuk navigasi real-time
- **Route Finder** - Pencarian rute tercepat dan terpendek
- **Tentang** - Informasi lengkap tentang Grebeg Suro dengan FAQ
- **Sejarah** - Timeline dan latar belakang budaya Grebeg Suro
- **Jadwal** - Jadwal acara lengkap dengan filter per hari
- **Responsive Design** - Mobile-first design yang responsif di semua device

### Untuk Admin:
- **Admin Login** - Sistem login dengan authentication
- **Event Management** - CRUD untuk manage acara/events
- **Dashboard Statistics** - Statistik acara (Total, Terjadwal, Selesai)
- **Event Editing** - Edit dan update event yang sudah ada
- **Map Integration** - Placeholder untuk peta admin

## 💻 Tech Stack

| Technology | Version | Kegunaan |
|---|---|---|
| **React** | 18.3.1 | Frontend framework |
| **Vite** | 5.0.10 | Build tool & dev server |
| **React Router** | 6.20.1 | Routing & navigation |
| **Tailwind CSS** | 3.4.1 | Styling & design system |
| **Leaflet** | 1.9.4 | Interactive maps |
| **PostCSS** | 8.4.35 | CSS processing |
| **Autoprefixer** | 10.4.18 | CSS vendor prefixes |

## 📁 Struktur Folder

```
rute-suro-new/
├── src/
│   ├── pages/                    # Halaman aplikasi
│   │   ├── HomePage.jsx          # Halaman utama
│   │   ├── UserMapPage.jsx       # Peta & route finder
│   │   ├── TentangPage.jsx       # Tentang & FAQ
│   │   ├── SejarahPage.jsx       # Sejarah Grebeg Suro
│   │   ├── JadwalPage.jsx        # Jadwal acara
│   │   ├── AdminLogin.jsx        # Admin login page
│   │   └── AdminDashboard.jsx    # Admin panel
│   ├── App.jsx                   # Main app (routing)
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles (Tailwind)
├── index.html                    # HTML entry point
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS config
├── postcss.config.js             # PostCSS config
├── package.json                  # Dependencies & scripts
├── INSTALLATION.md               # Panduan instalasi detail
└── README.md                     # File ini
```

## 🛠️ Instalasi & Setup

### Prasyarat
- Node.js 16+ (Download dari https://nodejs.org/)
- npm atau yarn atau pnpm

### Langkah-langkah Instalasi

**1. Clone atau Extract Project**
```bash
cd rute-suro-new
```

**2. Install Dependencies**
```bash
npm install
```

**3. Jalankan Development Server**
```bash
npm run dev
```

**4. Buka di Browser**
```
http://localhost:5173
```

Untuk informasi lebih detail, baca [INSTALLATION.md](./INSTALLATION.md)

## 🎨 Customization

### Mengubah Warna Brand
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    DEFAULT: '#8b1a1a',    // Ubah ke warna Anda
    dark: '#6b1414',
    light: '#a52222',
  },
  // ... warna lainnya
}
```

### Menambah Halaman Baru
1. Buat file `.jsx` di folder `src/pages/`
2. Tambahkan route di `App.jsx`:
```jsx
<Route path="/page-baru" element={<PageBaru />} />
```

### Mengubah Konten
Semua konten dapat diubah langsung di file `.jsx` masing-masing halaman.

## 📝 Admin Demo Credentials

- **Email:** Bebas (bisa input apa saja)
- **Password:** `admin123`

**Catatan:** Ini adalah demo only. Untuk production, implementasikan authentication yang proper.

## 🔄 Scripts Tersedia

```bash
# Development server dengan HMR
npm run dev

# Build untuk production
npm run build

# Preview production build
npm run preview

# Lihat daftar dependencies
npm list
```

## 🚢 Deployment

### Vercel (Recommended)
```bash
# 1. Push ke GitHub
git push origin main

# 2. Buka vercel.com → Import project
# Vercel akan auto-detect Vite dan deploy
```

### Netlify
```bash
# 1. Build project
npm run build

# 2. Upload folder `dist` ke Netlify
# atau connect GitHub untuk auto-deploy
```

### Manual Hosting
```bash
npm run build
# Upload folder `dist` ke hosting Anda
```

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 5173 already in use
```bash
npm run dev -- --port 3000
```

### Styling tidak muncul
```bash
# Clear cache dan restart
npm run dev
# Tekan Ctrl+C untuk stop, kemudian jalankan lagi
```

## 📖 Dokumentasi

- **React:** https://react.dev
- **Vite:** https://vitejs.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **React Router:** https://reactrouter.com/
- **Leaflet:** https://leafletjs.com/

## 🤝 Contributing

1. Fork project
2. Buat branch untuk feature baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Project ini open source dan bebas digunakan untuk keperluan apapun.

## 👨‍💻 Author

Dibuat dengan ❤️ untuk Ponorogo

---

## 📞 Support & Contact

Jika ada pertanyaan atau butuh bantuan:
1. Baca [INSTALLATION.md](./INSTALLATION.md) terlebih dahulu
2. Check browser console untuk error messages (F12)
3. Lihat dokumentasi resmi dari masing-masing library

---

**Happy Coding! 🚀**

Terakhir diupdate: 2024
Version: 1.0.0
