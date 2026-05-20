import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [contentMenuOpen, setContentMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setContentMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => { setContentMenuOpen(false) }, [location.pathname])

  const mainMenuItems = [
    {
      name: 'Rekayasa Lalu Lintas',
      path: '/admin/dashboard/traffic',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
    },
    {
      name: 'Manajemen Event',
      path: '/admin/dashboard/event',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
  ]

  const contentMenuItems = [
    {
      name: 'Sejarah',
      path: '/admin/dashboard/sejarah',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    },
    {
      name: 'Tentang',
      path: '/admin/dashboard/tentang',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
  ]

  async function handleLogout() {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Konfirmasi Logout',
      text: 'Anda akan keluar dari dashboard admin.',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
    })
    if (!result.isConfirmed) return
    await Swal.fire({
      icon: 'success', title: 'Berhasil Logout', text: 'Sampai jumpa kembali!',
      timer: 1500, timerProgressBar: true, showConfirmButton: false,
    })
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminEmail')
    localStorage.removeItem('adminUserId')
    navigate('/admin')
  }

  const isActive        = (path) => location.pathname === path
  const isContentActive = contentMenuItems.some((item) => isActive(item.path))

  const activePageName =
    mainMenuItems.find((i) => isActive(i.path))?.name ||
    (isActive('/admin/dashboard') ? 'Dashboard' : '') ||
    (isContentActive ? 'Manajemen Konten' : 'Dashboard Admin')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <style>{`
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes dropIn   { from { transform: translateY(-8px);  opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .navbar-slide { animation: slideDown 0.4s ease-out; }
        .drop-in      { animation: dropIn 0.18s ease-out; }

        .leaflet-pane,
        .leaflet-top,
        .leaflet-bottom,
        .leaflet-control,
        .leaflet-overlay-pane,
        .leaflet-tile-pane,
        .leaflet-marker-pane,
        .leaflet-popup-pane,
        .leaflet-shadow-pane { z-index: 1 !important; }
        .leaflet-tooltip-pane { z-index: 2 !important; }
        .leaflet-popup-pane   { z-index: 3 !important; }

        /* ── Navbar links: UNDERLINE ONLY, zero background ─────────────────── */
        .nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          padding-bottom: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          background: transparent !important;
          border: none;
          white-space: nowrap;
          transition: color 0.15s;
        }
        .nav-link:hover {
          color: #ffffff;
          background: transparent !important;
        }
        .nav-link.active {
          color: #ffffff;
          font-weight: 700;
          background: transparent !important;
        }
        /* underline hanya di active */
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0px;
          left: 14px;
          right: 14px;
          height: 2.5px;
          border-radius: 2px 2px 0 0;
          background: #ffffff;
        }

        /* ── Navbar dropdown trigger button ─────────────────────────────────── */
        .nav-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          padding-bottom: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255,255,255,0.65);
          background: transparent !important;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          transition: color 0.15s;
        }
        .nav-btn:hover {
          color: #ffffff;
          background: transparent !important;
        }
        .nav-btn.active {
          color: #ffffff;
          font-weight: 700;
          background: transparent !important;
        }
        .nav-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0px;
          /* exclude the chevron icon from underline width */
          left: 14px;
          right: 34px;
          height: 2.5px;
          border-radius: 2px 2px 0 0;
          background: #ffffff;
        }

        /* ── Dropdown items ──────────────────────────────────────────────────── */
        .dd-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          text-decoration: none;
          transition: background 0.12s, color 0.12s;
          cursor: pointer;
        }
        .dd-item:hover {
          background: #fef2f2;
          color: #b91c1c;
        }
        .dd-item.active {
          background: #fef2f2;
          color: #b91c1c;
          font-weight: 700;
          border-left: 3px solid #b91c1c;
          padding-left: 13px;
        }
      `}</style>

      <header className="navbar-slide sticky top-0 bg-red-800 shadow-lg" style={{ zIndex: 9999 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <span className="text-white font-black text-lg tracking-tight">RUTE SURO</span>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              <Link
                to="/admin/dashboard"
                className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>

              {mainMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  {item.icon}{item.name}
                </Link>
              ))}

              {/* Content dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className={`nav-btn ${isContentActive ? 'active' : ''}`}
                  onClick={() => setContentMenuOpen(prev => !prev)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Manajemen Konten
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${contentMenuOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {contentMenuOpen && (
                  <div
                    className="drop-in absolute top-[calc(100%+4px)] left-0 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                    style={{ zIndex: 10000 }}
                  >
                    {contentMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`dd-item ${isActive(item.path) ? 'active' : ''}`}
                      >
                        <span className={isActive(item.path) ? 'text-red-600' : 'text-gray-400'}>
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Logout */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-700 text-sm font-bold rounded-lg hover:bg-red-50 active:scale-95 transition-all duration-150 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumb bar */}
        <div className="bg-black/15 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-white/40 text-xs">Admin</span>
            <svg className="w-3 h-3 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white/85 text-xs font-semibold">{activePageName}</span>
          </div>
        </div>
      </header>

      <main
        className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8"
        style={{ isolation: 'isolate' }}
      >
        {children}
      </main>

      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Dinas Perhubungan — RUTE SURO Admin Panel</p>
          <p className="text-xs text-gray-300">v1.0.0</p>
        </div>
      </footer>
    </div>
  )
}