import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  const isMapPage = location.pathname.startsWith('/map')

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { to: '/',        label: 'Home' },
    { to: '/map',     label: 'Map' },
    { to: '/sejarah', label: 'Sejarah' },
    { to: '/jadwal',  label: 'Jadwal' },
    { to: '/tentang', label: 'Tentang' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      className={`
        fixed top-0 w-full text-white transition-all duration-300 z-[10000]
        ${isMapPage
          ? 'bg-red-800 shadow-lg'
          : isScrolled
          ? 'bg-red-800/95 shadow-lg backdrop-blur-sm'
          : 'bg-transparent'
        }
      `}
    >
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        .navbar-enter { animation: slideDown 0.5s ease-out; }

        .nav-link {
          position: relative;
          font-weight: 600;
          font-size: 15px;
          color: white;
          text-decoration: none;
          padding-bottom: 4px;
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
          transition: color 0.25s ease, transform 0.2s ease;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 2px;
          background: linear-gradient(90deg, #fca5a5, #fecaca);
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(252,165,165,0.5);
          transition: width 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .nav-link:hover { color: #fca5a5; transform: translateY(-1px); }
        .nav-link:hover::after { width: 100%; }
        .nav-link.active { color: #fca5a5; }
        .nav-link.active::after { width: 100%; }

        .mobile-menu-enter { animation: slideDown 0.35s ease-out; }
        .menu-item { animation: slideInRight 0.4s ease-out forwards; opacity: 0; }
        .menu-item:nth-child(1) { animation-delay: 0.05s; }
        .menu-item:nth-child(2) { animation-delay: 0.10s; }
        .menu-item:nth-child(3) { animation-delay: 0.15s; }
        .menu-item:nth-child(4) { animation-delay: 0.20s; }
        .menu-item:nth-child(5) { animation-delay: 0.25s; }

        .mobile-link {
          display: block;
          padding: 12px 16px;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: background 0.25s, transform 0.2s;
          border-left: 2px solid transparent;
        }
        .mobile-link:hover {
          background: rgba(255,255,255,0.1);
          transform: translateX(4px);
        }
        .mobile-link.active {
          background: rgba(255,255,255,0.12);
          border-left-color: #fca5a5;
          color: #fca5a5;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 navbar-enter">
        <div className="flex items-center h-16">

          {/* Brand — kiri, lebar tetap agar links bisa center */}
          <div className="w-36 flex-shrink-0">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="font-black text-xl text-white"
              style={{ transition: 'opacity 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              RUTE SURO
            </Link>
          </div>

          {/* Desktop links — benar-benar center */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-7">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link${isActive(to) ? ' active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Spacer kanan — sama lebar dengan brand agar links tetap center */}
          <div className="w-36 flex-shrink-0 hidden md:block" />

          {/* Mobile toggle — kanan */}
          <div className="flex-1 flex justify-end md:hidden">
            <button
              className="text-white p-2 text-2xl transition-transform hover:scale-110 active:scale-95"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-red-700 bg-red-900 mobile-menu-enter pb-3">
            <div className="px-2 pt-2 flex flex-col gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`menu-item mobile-link${isActive(to) ? ' active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}