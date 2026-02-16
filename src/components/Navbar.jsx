import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-red-800 text-white shadow-lg navbar-enter backdrop-blur-sm bg-red-800/95">
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

        @keyframes navLinkUnderline {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            text-shadow: 0 0 5px rgba(255, 255, 255, 0);
          }
          50% {
            text-shadow: 0 0 8px rgba(252, 165, 165, 0.5);
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .navbar-enter {
          animation: slideDown 0.6s ease-out;
        }

        .nav-link {
          position: relative;
          transition: all 0.3s ease;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #FCA5A5, #FEC2C2);
          transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 10px rgba(252, 165, 165, 0.5);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-link:hover {
          color: #FCA5A5;
          transform: translateY(-2px);
        }

        .mobile-menu-enter {
          animation: slideDown 0.4s ease-out;
        }

        .menu-item {
          animation: slideInRight 0.5s ease-out forwards;
        }

        .menu-item:nth-child(1) { animation-delay: 0.05s; }
        .menu-item:nth-child(2) { animation-delay: 0.1s; }
        .menu-item:nth-child(3) { animation-delay: 0.15s; }
        .menu-item:nth-child(4) { animation-delay: 0.2s; }
        .menu-item:nth-child(5) { animation-delay: 0.25s; }
        .menu-item:nth-child(6) { animation-delay: 0.3s; }

        .logo-glow:hover {
          animation: glowPulse 1.5s ease-in-out;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link 
            to="/" 
            onClick={() => setIsMenuOpen(false)}
            className="font-black text-2xl text-white hover:text-red-100 transition-all duration-300 transform hover:scale-110 logo-glow relative"
          >
            RUTE SURO
            <span className="absolute inset-0 rounded-lg bg-red-500 opacity-0 hover:opacity-20 blur transition-opacity duration-300"></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="nav-link text-white font-medium hover:text-red-100 transition-colors duration-300">
              Home
            </Link>
            <Link to="/map" className="nav-link text-white font-medium hover:text-red-100 transition-colors duration-300">
              Map
            </Link>
            <Link to="/tentang" className="nav-link text-white font-medium hover:text-red-100 transition-colors duration-300">
              Tentang
            </Link>
            <Link to="/sejarah" className="nav-link text-white font-medium hover:text-red-100 transition-colors duration-300">
              Sejarah
            </Link>
            <Link to="/jadwal" className="nav-link text-white font-medium hover:text-red-100 transition-colors duration-300">
              Jadwal
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link 
              to="/admin" 
              className="hidden md:block px-6 py-2 btn-red-outline rounded font-medium"
            >
              Admin Login
            </Link>

            <button
              className="md:hidden text-white text-3xl p-2 hover:text-red-100 transition-all duration-300 hover:scale-110 active:scale-95"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-red-700 bg-red-900 mobile-menu-enter">
            <div className="px-4 py-4 space-y-2">
              <Link to="/" className="menu-item block px-4 py-3 text-white hover:bg-red-700 rounded transition-all duration-300 hover:translate-x-2 hover:shadow-lg" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/map" className="menu-item block px-4 py-3 text-white hover:bg-red-700 rounded transition-all duration-300 hover:translate-x-2 hover:shadow-lg" onClick={() => setIsMenuOpen(false)}>
                Map
              </Link>
              <Link to="/tentang" className="menu-item block px-4 py-3 text-white hover:bg-red-700 rounded transition-all duration-300 hover:translate-x-2 hover:shadow-lg" onClick={() => setIsMenuOpen(false)}>
                Tentang
              </Link>
              <Link to="/sejarah" className="menu-item block px-4 py-3 text-white hover:bg-red-700 rounded transition-all duration-300 hover:translate-x-2 hover:shadow-lg" onClick={() => setIsMenuOpen(false)}>
                Sejarah
              </Link>
              <Link to="/jadwal" className="menu-item block px-4 py-3 text-white hover:bg-red-700 rounded transition-all duration-300 hover:translate-x-2 hover:shadow-lg" onClick={() => setIsMenuOpen(false)}>
                Jadwal
              </Link>
              <Link to="/admin" className="menu-item block px-4 py-3 btn-red-outline rounded btn-primary-hover hover:translate-x-2" onClick={() => setIsMenuOpen(false)}>
                Admin Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
