import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [contentMenuOpen, setContentMenuOpen] = useState(false)

  const mainMenuItems = [
    { name: 'Rekayasa Lalu Lintas', path: '/admin/dashboard/traffic', icon: '🚦' },
    { name: 'Manajemen Event', path: '/admin/dashboard/events', icon: '📅' }
  ]

  const contentMenuItems = [
    { name: 'Sejarah', path: '/admin/dashboard/sejarah' },
    { name: 'Jadwal', path: '/admin/dashboard/jadwal' },
    { name: 'Tentang', path: '/admin/dashboard/tentang' }
  ]

  function handleLogout() {
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminEmail')
    navigate('/admin')
  }

  const isActive = (path) => location.pathname === path
  const isContentActive = contentMenuItems.some(item => isActive(item.path))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-md" style={{animation: 'slideDown 0.6s ease-out'}}>
        <style>{`
          @keyframes slideDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }

          .submenu-enter { animation: fadeIn 0.3s ease-out; }
        `}</style>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin/dashboard" className="text-2xl font-bold text-gray-900 hover:text-red-700 transition-colors duration-300">RUTE SURO</Link>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/admin/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-300 py-2">Home</Link>
              {mainMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-all duration-300 relative py-2 ${
                    isActive(item.path)
                      ? 'text-red-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                  {isActive(item.path) && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-700"></div>}
                </Link>
              ))}

              {/* Manajemen Konten Dropdown */}
              <div className="relative group">
                <button
                  onClick={() => setContentMenuOpen(!contentMenuOpen)}
                  className={`text-sm font-medium transition-all duration-300 relative py-2 flex items-center gap-1 ${
                    isContentActive
                      ? 'text-red-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Manajemen Konten
                  <svg className={`w-4 h-4 transition-transform duration-300 ${contentMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {contentMenuOpen && (
                  <div className="submenu-enter absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {contentMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setContentMenuOpen(false)}
                        className={`block px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-red-50 ${
                          isActive(item.path) ? 'text-red-700 bg-red-50 border-r-2 border-red-700' : 'text-gray-700'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Logout */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Konfirmasi Logout</h2>
            </div>
            <p className="text-gray-600 mb-6 text-sm">Apakah Anda yakin ingin keluar dari dashboard?</p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
