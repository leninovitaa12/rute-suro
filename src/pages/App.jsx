import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// ── Guest pages ────────────────────────────────────────────────
import HomePage    from './guest/HomePage'
import UserMapPage from './guest/UserMapPage'
import JadwalPage  from './guest/JadwalPage'
import TentangPage from './guest/TentangPage'
import SejarahPage from './guest/SejarahPage'
import BeritaPage  from './guest/BeritaPage'

// ── Admin pages ────────────────────────────────────────────────
import AdminLogin              from './admin/AdminLogin'
import AdminLayout             from './admin/AdminLayout'
import AdminDashboard          from './admin/AdminDashboard'
import AdminDashboardTraffic   from './admin/AdminDashboardTraffic'
import AdminEvent              from './admin/AdminEvent'
import AdminBerita             from './admin/AdminBerita'
import AdminDestinasi          from './admin/AdminDestinasi'
import AdminSejarah            from './admin/AdminDashboardContent'
import AdminTentang            from './admin/AdminTentang'

// ── Auth guard ─────────────────────────────────────────────────
function RequireAuth({ children }) {
  const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'
  if (!isLoggedIn) return <Navigate to="/admin" replace />
  return children
}

// ── Public layout (Navbar + Footer) ───────────────────────────
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

// ── Admin layout wrapper ───────────────────────────────────────
function AdminLayoutWrapper({ children }) {
  return (
    <RequireAuth>
      <AdminLayout>{children}</AdminLayout>
    </RequireAuth>
  )
}

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route element={<PublicLayout />}>
        <Route path="/"        element={<HomePage />} />
        <Route path="/map"     element={<UserMapPage />} />
        <Route path="/jadwal"  element={<JadwalPage />} />
        <Route path="/tentang" element={<TentangPage />} />
        <Route path="/sejarah" element={<SejarahPage />} />
        <Route path="/berita"  element={<BeritaPage />} />
      </Route>

      {/* ── Admin login ── */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* ── Admin dashboard (dilindungi auth) ── */}
      <Route
        path="/admin/dashboard"
        element={<AdminLayoutWrapper><AdminDashboard /></AdminLayoutWrapper>}
      />
      <Route
        path="/admin/dashboard/traffic"
        element={<AdminLayoutWrapper><AdminDashboardTraffic /></AdminLayoutWrapper>}
      />
      <Route
        path="/admin/dashboard/event"
        element={<AdminLayoutWrapper><AdminEvent /></AdminLayoutWrapper>}
      />
      <Route
        path="/admin/dashboard/berita"
        element={<AdminLayoutWrapper><AdminBerita /></AdminLayoutWrapper>}
      />
      <Route
        path="/admin/dashboard/destinasi"
        element={<AdminLayoutWrapper><AdminDestinasi /></AdminLayoutWrapper>}
      />
      <Route
        path="/admin/dashboard/sejarah"
        element={<AdminLayoutWrapper><AdminSejarah /></AdminLayoutWrapper>}
      />
      <Route
        path="/admin/dashboard/tentang"
        element={<AdminLayoutWrapper><AdminTentang /></AdminLayoutWrapper>}
      />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}