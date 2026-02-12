# 🔧 DEVELOPMENT GUIDE - Rute Suro

Panduan lengkap untuk mengembangkan project Rute Suro lebih lanjut.

---

## 🚀 Memulai Development

### 1. Sebelum Memulai
```bash
# Pastikan berada di folder project
cd rute-suro-new

# Install dependencies (jika belum)
npm install

# Jalankan dev server
npm run dev
```

### 2. Buka Browser DevTools
- Tekan **F12** atau **Ctrl+Shift+I**
- Tab **Console** untuk melihat errors
- Tab **Elements** untuk inspect HTML
- Tab **Network** untuk debug API calls

---

## 📝 Mengedit & Membuat Component

### Edit File Existing

**Contoh: Mengubah warna tombol di HomePage**

1. Buka `src/pages/HomePage.jsx`
2. Cari class `btn-primary`
3. Edit tailwind classes (misal: ganti `bg-primary` dengan `bg-blue-600`)
4. Save file (Ctrl+S)
5. Browser akan auto-refresh (HMR)

### Membuat Component Baru

**Contoh: Membuat component Card**

1. Buat file baru `src/components/Card.jsx`:
```jsx
export default function Card({ title, description, icon }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary">{description}</p>
    </div>
  )
}
```

2. Gunakan di component lain:
```jsx
import Card from '../components/Card'

<Card icon="🎯" title="Title" description="Description" />
```

---

## 🎨 Styling dengan Tailwind CSS

### Tailwind Class Examples

```jsx
// Colors
<div className="bg-primary text-white">Primary</div>
<div className="bg-secondary text-text-primary">Secondary</div>

// Spacing
<div className="p-6 m-4">Padding & Margin</div>
<div className="gap-4">Gap (untuk flex/grid)</div>

// Typography
<h1 className="text-4xl font-extrabold">Heading</h1>
<p className="text-text-secondary">Text</p>

// Layout
<div className="flex items-center justify-between">Flexbox</div>
<div className="grid grid-cols-2 md:grid-cols-3 gap-4">Grid</div>

// Responsive
<div className="hidden md:block">Visible only on tablet+</div>
<div className="md:grid-cols-2 lg:grid-cols-3">Change cols on breakpoint</div>

// Hover & Transitions
<button className="hover:bg-primary-dark transition-colors duration-300">
  Hover Button
</button>

// Shadows & Borders
<div className="shadow-lg rounded-lg border border-border">Card</div>
```

### Custom Colors
Semua custom colors sudah di-define di `tailwind.config.js`:
```javascript
primary: { DEFAULT: '#8b1a1a', dark: '#6b1414', light: '#a52222' }
secondary: '#f9fafb'
'text-primary': '#111827'
'text-secondary': '#6b7280'
border: '#e5e7eb'
error: '#991b1b'
success: '#059669'
warning: '#d97706'
```

Gunakan di component: `className="text-primary bg-secondary"`

---

## 📚 Adding Pages

### Step 1: Buat Component
`src/pages/KamuPage.jsx`:
```jsx
export default function KamuPage() {
  return (
    <main className="min-h-screen bg-white pt-12">
      <div className="container">
        <h1 className="text-4xl font-extrabold text-text-primary mb-6">
          Kamu Page
        </h1>
        {/* Content */}
      </div>
    </main>
  )
}
```

### Step 2: Add Route
Di `src/App.jsx`:
```jsx
import KamuPage from './pages/KamuPage.jsx'

// Di dalam component App:
<Routes>
  {/* Routes lainnya */}
  <Route path="/kamu" element={<KamuPage />} />
</Routes>
```

### Step 3: Add Link di Navbar
Di `src/App.jsx` (dalam navbar section):
```jsx
<Link to="/kamu" className={`px-6 py-3 font-medium ...`}>
  Kamu
</Link>
```

---

## 🔗 API Integration

### Contoh: Fetch Data dari API

```jsx
import { useState, useEffect } from 'react'

export default function DataPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('https://api.example.com/data')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

---

## 💾 Using localStorage

### Save Data
```jsx
// Save
localStorage.setItem('key', JSON.stringify(data))

// Get
const data = JSON.parse(localStorage.getItem('key'))

// Remove
localStorage.removeItem('key')
```

**Catatan:** Gunakan ini hanya untuk demo. Untuk production, gunakan database!

---

## 🗺️ Leaflet Map Integration

### Replace Placeholder Map

Di `src/pages/UserMapPage.jsx`:

```jsx
import { useEffect, useRef } from 'react'
import L from 'leaflet'

export default function UserMapPage() {
  const mapRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([-7.5, 111.45], 13)

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Add markers
    L.marker([-7.5, 111.45])
      .bindPopup('Alun-alun Ponorogo')
      .addTo(map)
  }, [])

  return <div ref={mapRef} className="w-full h-screen" />
}
```

---

## ✅ Form Handling

### Form dengan State

```jsx
import { useState } from 'react'

export default function FormPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', form)
    // Send to API or localStorage
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Nama"
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        placeholder="Message"
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button type="submit" className="btn-primary">
        Submit
      </button>
    </form>
  )
}
```

---

## 🔒 Authentication (Demo)

Project ini sudah punya demo authentication. Untuk production:

### Option 1: Firebase
```bash
npm install firebase
```

```jsx
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = { /* ... */ }
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
```

### Option 2: Supabase
```bash
npm install @supabase/supabase-js
```

```jsx
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
)
```

### Option 3: Custom Backend
Implementasikan API endpoint di backend Anda sendiri.

---

## 🧪 Debugging Tips

### Console.log untuk Debug
```jsx
const [data, setData] = useState([])

useEffect(() => {
  console.log('[DEBUG] Component mounted')
  console.log('[DEBUG] Data:', data)
}, [data])
```

### React DevTools Extension
1. Install: https://react-devtools.io/
2. Buka DevTools (F12)
3. Tab "Components" untuk inspect component tree

### Network Debugging
1. Buka DevTools (F12)
2. Tab "Network"
3. Lihat semua API calls
4. Check status code, response, dll

---

## 📦 Adding New Dependencies

### Contoh: Tambah Axios untuk HTTP

```bash
npm install axios
```

```jsx
import axios from 'axios'

axios.get('https://api.example.com/data')
  .then(res => console.log(res.data))
  .catch(err => console.error(err))
```

### Contoh: Tambah Date Library

```bash
npm install date-fns
```

```jsx
import { format } from 'date-fns'

const formatted = format(new Date(), 'dd/MM/yyyy')
```

---

## 🎯 Performance Tips

### 1. Use React.memo untuk component yang sering di-render
```jsx
const Card = React.memo(({ title }) => (
  <div>{title}</div>
))
```

### 2. Lazy Load Components
```jsx
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./Heavy'))

<Suspense fallback={<div>Loading...</div>}>
  <HeavyComponent />
</Suspense>
```

### 3. Optimize Images
```jsx
// Don't:
<img src="large-image.jpg" />

// Do:
<img src="image.webp" loading="lazy" alt="Description" />
```

---

## 🚀 Deployment Checklist

Sebelum deploy:

- [ ] Test semua halaman
- [ ] Test di mobile (DevTools)
- [ ] Check console untuk errors
- [ ] Update `index.html` meta tags (title, description)
- [ ] Optimize images
- [ ] Remove console.log untuk production
- [ ] Update environment variables
- [ ] Build project: `npm run build`
- [ ] Test production build: `npm run preview`

---

## 📋 File Structure Best Practices

```
src/
├── components/        # Reusable components
│   ├── Header.jsx
│   ├── Card.jsx
│   └── ...
├── pages/            # Page components
│   ├── HomePage.jsx
│   ├── AdminPage.jsx
│   └── ...
├── utils/            # Helper functions
│   ├── api.js
│   ├── helpers.js
│   └── ...
├── hooks/            # Custom React hooks
│   ├── useFetch.js
│   └── ...
├── App.jsx
├── main.jsx
└── index.css
```

---

## 🔑 Environment Variables

### Buat `.env` file
```bash
VITE_API_URL=https://api.example.com
VITE_API_KEY=your-key-here
```

### Gunakan di Component
```jsx
const API_URL = import.meta.env.VITE_API_URL
```

---

## 💡 Common Patterns

### Infinite Scroll
```jsx
const [page, setPage] = useState(1)

useEffect(() => {
  window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      setPage(prev => prev + 1)
    }
  })
}, [])
```

### Dark Mode
```jsx
const [isDark, setIsDark] = useState(false)

return (
  <div className={isDark ? 'dark' : 'light'}>
    {/* Content */}
  </div>
)
```

### Search Filter
```jsx
const [search, setSearch] = useState('')
const filtered = data.filter(item =>
  item.name.toLowerCase().includes(search.toLowerCase())
)
```

---

## 📚 Resources

- **React Docs:** https://react.dev
- **Tailwind Docs:** https://tailwindcss.com
- **Vite Docs:** https://vitejs.dev
- **React Router:** https://reactrouter.com
- **MDN Web Docs:** https://developer.mozilla.org

---

## 🎓 Next Level Learning

1. **TypeScript** - Type-safe development
2. **Next.js** - React fullstack framework
3. **Testing** - Jest, React Testing Library
4. **State Management** - Redux, Zustand, Context API
5. **GraphQL** - Alternative to REST API
6. **Database** - Firebase, Supabase, MongoDB

---

## 🆘 Troubleshooting Development

### HMR tidak bekerja
```bash
# Restart dev server
Ctrl+C
npm run dev
```

### Memory leak warning
```jsx
// Clean up di useEffect
useEffect(() => {
  const handler = () => console.log('event')
  window.addEventListener('resize', handler)

  return () => {
    window.removeEventListener('resize', handler)
  }
}, [])
```

### Build error
```bash
# Clear cache dan rebuild
rm -rf node_modules dist
npm install
npm run build
```

---

## 📞 Need Help?

1. **Check documentation** - Docs sudah sangat lengkap
2. **Read error messages** - Error messages biasanya membantu
3. **Search online** - Google/Stack Overflow
4. **Ask community** - Reddit, Discord, GitHub Discussions

---

**Happy Developing! 🚀**

Untuk pertanyaan lebih lanjut, baca README.md dan INSTALLATION.md
