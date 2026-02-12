import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import HomePage from './pages/HomePage.jsx'
import UserMapPage from './pages/UserMapPage.jsx'
import TentangPage from './pages/TentangPage.jsx'
import SejarahPage from './pages/SejarahPage.jsx'
import JadwalPage from './pages/JadwalPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminLogin from './pages/AdminLogin.jsx'

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-secondary">
        <div className="bg-primary text-white py-4 shadow-md">
          <div className="container">
            <div className="flex items-center justify-between">
              <Link to="/" className="font-extrabold text-xl text-white">
                RUTE SURO
              </Link>
              <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">Admin Mode</span>
            </div>
          </div>
        </div>
        
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    )
  }

  return (
    <div>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary-dark shadow-lg">
        <div className="container">
          <div className="flex items-center justify-between py-4 gap-8">
            <Link to="/" className="font-extrabold text-xl text-white hover:translate-y-[-2px] transition-transform duration-300">
              RUTE SURO
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-0 justify-center flex-1">
              <Link to="/" className={`px-6 py-3 font-medium text-white/80 relative transition-all duration-300 hover:text-white group ${location.pathname === '/' ? 'text-white' : ''}`}>
                Home
                <span className={`absolute bottom-0 left-1/2 h-0.75 bg-white transition-all duration-300 transform -translate-x-1/2 ${location.pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              <Link to="/map" className={`px-6 py-3 font-medium text-white/80 relative transition-all duration-300 hover:text-white group ${location.pathname === '/map' ? 'text-white' : ''}`}>
                Map
                <span className={`absolute bottom-0 left-1/2 h-0.75 bg-white transition-all duration-300 transform -translate-x-1/2 ${location.pathname === '/map' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              <Link to="/tentang" className={`px-6 py-3 font-medium text-white/80 relative transition-all duration-300 hover:text-white group ${location.pathname === '/tentang' ? 'text-white' : ''}`}>
                Tentang
                <span className={`absolute bottom-0 left-1/2 h-0.75 bg-white transition-all duration-300 transform -translate-x-1/2 ${location.pathname === '/tentang' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              <Link to="/sejarah" className={`px-6 py-3 font-medium text-white/80 relative transition-all duration-300 hover:text-white group ${location.pathname === '/sejarah' ? 'text-white' : ''}`}>
                Sejarah
                <span className={`absolute bottom-0 left-1/2 h-0.75 bg-white transition-all duration-300 transform -translate-x-1/2 ${location.pathname === '/sejarah' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              <Link to="/jadwal" className={`px-6 py-3 font-medium text-white/80 relative transition-all duration-300 hover:text-white group ${location.pathname === '/jadwal' ? 'text-white' : ''}`}>
                Jadwal
                <span className={`absolute bottom-0 left-1/2 h-0.75 bg-white transition-all duration-300 transform -translate-x-1/2 ${location.pathname === '/jadwal' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/admin" className="btn-admin hidden md:inline-block">
                Admin Login
              </Link>
              
              <button 
                className="md:hidden flex items-center justify-center w-10 h-10 text-white text-xl transition-transform duration-300 hover:scale-110"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="fixed top-16 left-0 right-0 bg-gradient-to-b from-primary to-primary-dark flex flex-col py-4 gap-0 shadow-lg md:hidden">
              <Link 
                to="/" 
                className={`px-4 py-4 text-white/80 transition-all duration-300 font-medium relative ${location.pathname === '/' ? 'text-white bg-white/10' : 'hover:bg-white/10'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`absolute left-0 top-0 bottom-0 w-0.75 bg-white transition-all duration-300 ${location.pathname === '/' ? 'block' : ''}`}></span>
                Home
              </Link>
              <Link 
                to="/map" 
                className={`px-4 py-4 text-white/80 transition-all duration-300 font-medium relative ${location.pathname === '/map' ? 'text-white bg-white/10' : 'hover:bg-white/10'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`absolute left-0 top-0 bottom-0 w-0.75 bg-white transition-all duration-300 ${location.pathname === '/map' ? 'block' : ''}`}></span>
                Map
              </Link>
              <Link 
                to="/tentang" 
                className={`px-4 py-4 text-white/80 transition-all duration-300 font-medium relative ${location.pathname === '/tentang' ? 'text-white bg-white/10' : 'hover:bg-white/10'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`absolute left-0 top-0 bottom-0 w-0.75 bg-white transition-all duration-300 ${location.pathname === '/tentang' ? 'block' : ''}`}></span>
                Tentang
              </Link>
              <Link 
                to="/sejarah" 
                className={`px-4 py-4 text-white/80 transition-all duration-300 font-medium relative ${location.pathname === '/sejarah' ? 'text-white bg-white/10' : 'hover:bg-white/10'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`absolute left-0 top-0 bottom-0 w-0.75 bg-white transition-all duration-300 ${location.pathname === '/sejarah' ? 'block' : ''}`}></span>
                Sejarah
              </Link>
              <Link 
                to="/jadwal" 
                className={`px-4 py-4 text-white/80 transition-all duration-300 font-medium relative ${location.pathname === '/jadwal' ? 'text-white bg-white/10' : 'hover:bg-white/10'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`absolute left-0 top-0 bottom-0 w-0.75 bg-white transition-all duration-300 ${location.pathname === '/jadwal' ? 'block' : ''}`}></span>
                Jadwal
              </Link>
              <Link 
                to="/admin" 
                className="px-4 py-4 text-white/80 transition-all duration-300 font-medium hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Login
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<UserMapPage />} />
        <Route path="/tentang" element={<TentangPage />} />
        <Route path="/sejarah" element={<SejarahPage />} />
        <Route path="/jadwal" element={<JadwalPage />} />
      </Routes>

      {/* Footer */}
      <footer className="bg-text-primary text-white py-12 mt-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="flex flex-col gap-3">
              <h4 className="text-lg font-bold mb-2">RUTE SURO</h4>
              <p className="opacity-80 text-sm leading-6">
                Sistem navigasi cerdas untuk optimasi jalur budaya Ponorogo selama Grebeg Suro.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <h4 className="text-lg font-bold mb-2">Link Cepat</h4>
              <Link to="/" className="opacity-80 text-sm hover:opacity-100 transition-opacity">Home</Link>
              <Link to="/map" className="opacity-80 text-sm hover:opacity-100 transition-opacity">Map & Route Finder</Link>
              <Link to="/tentang" className="opacity-80 text-sm hover:opacity-100 transition-opacity">Tentang</Link>
              <Link to="/jadwal" className="opacity-80 text-sm hover:opacity-100 transition-opacity">Jadwal Acara</Link>
            </div>
            
            <div className="flex flex-col gap-3">
              <h4 className="text-lg font-bold mb-2">Kontak</h4>
              <p className="opacity-80 text-sm">Kabupaten Ponorogo</p>
              <p className="opacity-80 text-sm">Jawa Timur, Indonesia</p>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-sm opacity-70 mb-3">&copy; 2024 Pemerintah Kabupaten Ponorogo. Dashboard Optimasi Rute Suro.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Kebijakan Privasi</a>
              <span className="opacity-30">•</span>
              <a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Syarat & Ketentuan</a>
              <span className="opacity-30">•</span>
              <Link to="/admin" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Kontak Kami</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
