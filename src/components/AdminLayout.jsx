import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { name: 'Rekayasa Lalu Lintas', path: '/admin/dashboard/traffic' },
    { name: 'Manajemen Event', path: '/admin/dashboard/events' },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">RUTE SURO</h1>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-8">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isActive(item.path)
                      ? 'text-red-700 border-b-2 border-red-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
