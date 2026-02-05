import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import HomePage from './HomePage.jsx'
import UserMapPage from './UserMapPage.jsx'
import TentangPage from './TentangPage.jsx'
import SejarahPage from './SejarahPage.jsx'
import JadwalPage from './JadwalPage.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import AdminLogin from './AdminLogin.jsx'

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')

  if (isAdminPage) {
    return (
      <div className="admin-layout">
        <div className="admin-nav">
          <div className="container">
            <div className="admin-nav-content">
              <Link to="/" className="admin-brand">
                <span className="brand-icon">📍</span>
                RUTE SURO
              </Link>
              <div className="admin-nav-right">
                <span className="admin-badge">Admin Mode</span>
              </div>
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
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <Link to="/" className="navbar-brand">
              <span className="brand-icon">📍</span>
              RUTE SURO
            </Link>

            {/* Desktop Menu */}
            <div className="navbar-menu desktop-menu">
              <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>
                Home
              </Link>
              <Link to="/map" className={location.pathname === '/map' ? 'nav-link active' : 'nav-link'}>
                Map
              </Link>
              <Link to="/tentang" className={location.pathname === '/tentang' ? 'nav-link active' : 'nav-link'}>
                Tentang
              </Link>
              <Link to="/sejarah" className={location.pathname === '/sejarah' ? 'nav-link active' : 'nav-link'}>
                Sejarah
              </Link>
              <Link to="/jadwal" className={location.pathname === '/jadwal' ? 'nav-link active' : 'nav-link'}>
                Jadwal
              </Link>
            </div>

            <div className="navbar-actions">
              <Link to="/admin" className="btn-admin">
                Admin Login
              </Link>
              
              {/* Mobile Menu Button */}
              <button 
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="mobile-menu">
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'mobile-nav-link active' : 'mobile-nav-link'}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/map" 
                className={location.pathname === '/map' ? 'mobile-nav-link active' : 'mobile-nav-link'}
                onClick={() => setMobileMenuOpen(false)}
              >
                Map
              </Link>
              <Link 
                to="/tentang" 
                className={location.pathname === '/tentang' ? 'mobile-nav-link active' : 'mobile-nav-link'}
                onClick={() => setMobileMenuOpen(false)}
              >
                Tentang
              </Link>
              <Link 
                to="/sejarah" 
                className={location.pathname === '/sejarah' ? 'mobile-nav-link active' : 'mobile-nav-link'}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sejarah
              </Link>
              <Link 
                to="/jadwal" 
                className={location.pathname === '/jadwal' ? 'mobile-nav-link active' : 'mobile-nav-link'}
                onClick={() => setMobileMenuOpen(false)}
              >
                Jadwal
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
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4 className="footer-title">RUTE SURO</h4>
              <p className="footer-text">
                Sistem navigasi cerdas untuk optimasi jalur budaya Ponorogo selama Grebeg Suro.
              </p>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-title">Link Cepat</h4>
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/map" className="footer-link">Map & Route Finder</Link>
              <Link to="/tentang" className="footer-link">Tentang</Link>
              <Link to="/jadwal" className="footer-link">Jadwal Acara</Link>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-title">Kontak</h4>
              <p className="footer-text">Kabupaten Ponorogo</p>
              <p className="footer-text">Jawa Timur, Indonesia</p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 Pemerintah Kabupaten Ponorogo. Dashboard Optimasi Rute Suro.</p>
            <div className="footer-links">
              <a href="#" className="footer-link-small">Kebijakan Privasi</a>
              <span className="separator">•</span>
              <a href="#" className="footer-link-small">Syarat & Ketentuan</a>
              <span className="separator">•</span>
              <Link to="/admin" className="footer-link-small">Kontak Kami</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}