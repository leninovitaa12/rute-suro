import { Routes, Route, Link, useLocation } from 'react-router-dom'
import HomePage from './HomePage.jsx'
import UserMapPage from './UserMapPage.jsx'
import TentangPage from './TentangPage.jsx'
import SejarahPage from './SejarahPage.jsx'
import JadwalPage from './JadwalPage.jsx'
import AdminDashboardTraffic from './AdminDashboardTraffic.jsx'
import AdminLogin from './AdminLogin.jsx'
import AdminLayout from '../components/AdminLayout.jsx'
import { AdminSejarah, AdminJadwal, AdminTentang } from './AdminDashboardContent.jsx'
import Navbar from '../components/Navbar.jsx'

export default function App() {
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/admin')

  // Admin pages
  if (isAdminPath) {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      return <AdminLogin />
    }
    if (location.pathname.startsWith('/admin/dashboard')) {
      const section = location.pathname.split('/')[3] || 'traffic'
      return (
        <AdminLayout>
          {section === 'traffic' && <AdminDashboardTraffic section="traffic" />}
          {section === 'events' && <AdminDashboardTraffic section="events" />}
          {section === 'sejarah' && <AdminSejarah />}
          {section === 'jadwal' && <AdminJadwal />}
          {section === 'tentang' && <AdminTentang />}
        </AdminLayout>
      )
    }
    return <AdminLogin />
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<UserMapPage />} />
          <Route path="/tentang" element={<TentangPage />} />
          <Route path="/sejarah" element={<SejarahPage />} />
          <Route path="/jadwal" element={<JadwalPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{background: '#1a1a1a', color: '#fff', padding: '30px 20px'}}>
        <div style={{maxWidth: '1400px', margin: '0 auto'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '30px'}}>
            <div>
              <h4 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '10px'}}>RUTE SURO</h4>
              <p style={{color: '#aaa', fontSize: '14px', lineHeight: '1.6'}}>
                Sistem navigasi cerdas untuk optimasi jalur budaya Ponorogo selama Grebeg Suro.
              </p>
            </div>
            
            <div>
              <h4 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '15px'}}>Link Cepat</h4>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px', color: '#aaa', fontSize: '14px'}}>
                <Link to="/" style={{color: '#aaa', textDecoration: 'none'}} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#aaa'}>Home</Link>
                <Link to="/map" style={{color: '#aaa', textDecoration: 'none'}} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#aaa'}>Map & Route Finder</Link>
                <Link to="/tentang" style={{color: '#aaa', textDecoration: 'none'}} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#aaa'}>Tentang</Link>
                <Link to="/jadwal" style={{color: '#aaa', textDecoration: 'none'}} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#aaa'}>Jadwal Acara</Link>
              </div>
            </div>
            
            <div>
              <h4 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '15px'}}>Kontak</h4>
              <p style={{color: '#aaa', fontSize: '14px'}}>Kabupaten Ponorogo</p>
              <p style={{color: '#aaa', fontSize: '14px'}}>Jawa Timur, Indonesia</p>
            </div>
          </div>
          
          <div style={{borderTop: '1px solid #333', paddingTop: '20px'}}>
            <p style={{color: '#666', fontSize: '13px', textAlign: 'center', marginBottom: '15px'}}>&copy; 2024 Pemerintah Kabupaten Ponorogo. Dashboard Optimasi Rute Suro.</p>
            <div style={{display: 'flex', justifyContent: 'center', gap: '15px', color: '#666', fontSize: '13px'}}>
              <a href="#" style={{color: '#666', textDecoration: 'none'}} onMouseOver={e => e.target.style.color = '#aaa'} onMouseOut={e => e.target.style.color = '#666'}>Kebijakan Privasi</a>
              <span>•</span>
              <a href="#" style={{color: '#666', textDecoration: 'none'}} onMouseOver={e => e.target.style.color = '#aaa'} onMouseOut={e => e.target.style.color = '#666'}>Syarat & Ketentuan</a>
              <span>•</span>
              <Link to="/admin" style={{color: '#666', textDecoration: 'none'}} onMouseOver={e => e.target.style.color = '#aaa'} onMouseOut={e => e.target.style.color = '#666'}>Kontak Kami</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
