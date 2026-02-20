import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/map', label: 'Map' },
    { to: '/tentang', label: 'Tentang' },
    { to: '/sejarah', label: 'Sejarah' },
    { to: '/jadwal', label: 'Jadwal' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="sticky top-0 z-50 bg-red-800 text-white shadow-lg backdrop-blur-sm bg-red-800/95">
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        @keyframes glowPulse {
          0%,100% { text-shadow: 0 0 5px rgba(255,255,255,0); }
          50%      { text-shadow: 0 0 8px rgba(252,165,165,0.5); }
        }

        .navbar-enter { animation: slideDown 0.5s ease-out; }

        /* ── desktop nav link ── */
        .nav-link {
          position: relative;
          font-weight: 600;
          font-size: 15px;
          color: white;
          text-decoration: none;
          padding-bottom: 4px;
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

        /* active state — underline always visible */
        .nav-link.active { color: #fca5a5; }
        .nav-link.active::after { width: 100%; }

        /* ── mobile menu ── */
        .mobile-menu-enter { animation: slideDown 0.35s ease-out; }
        .menu-item { animation: slideInRight 0.4s ease-out forwards; opacity: 0; }
        .menu-item:nth-child(1) { animation-delay: 0.05s; }
        .menu-item:nth-child(2) { animation-delay: 0.10s; }
        .menu-item:nth-child(3) { animation-delay: 0.15s; }
        .menu-item:nth-child(4) { animation-delay: 0.20s; }
        .menu-item:nth-child(5) { animation-delay: 0.25s; }
        .menu-item:nth-child(6) { animation-delay: 0.30s; }

        /* mobile active link */
        .mobile-link {
          display: block;
          padding: 12px 16px;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          position: relative;
          transition: background 0.25s, transform 0.2s, box-shadow 0.2s;
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

        /* admin button */
        .btn-admin {
          padding: 8px 22px;
          border: 1.5px solid rgba(255,255,255,0.5);
          border-radius: 6px;
          color: white;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          background: transparent;
          position: relative; overflow: hidden;
          transition: color 0.25s, border-color 0.25s, transform 0.2s, box-shadow 0.2s;
        }
        .btn-admin::before {
          content: '';
          position: absolute; inset: 0;
          background: rgba(255,255,255,0.15);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s ease;
        }
        .btn-admin:hover::before { transform: scaleX(1); }
        .btn-admin:hover { border-color: white; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.2); }

        .logo-hover { transition: opacity 0.2s, transform 0.2s; }
        .logo-hover:hover { opacity: 0.85; transform: scale(1.05); }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 navbar-enter">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="font-black text-xl text-white logo-hover"
          >
            RUTE SURO
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
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

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link to="/admin" className="btn-admin hidden md:inline-flex items-center">
              Admin Login
            </Link>
            <button
              className="md:hidden text-white p-2 text-2xl transition-transform hover:scale-110 active:scale-95"
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
              <Link
                to="/admin"
                className="menu-item mobile-link mt-1"
                style={{ border: '1.5px solid rgba(255,255,255,0.3)', textAlign: 'center' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}