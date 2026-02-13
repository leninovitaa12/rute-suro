import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-red-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link 
            to="/" 
            onClick={() => setIsMenuOpen(false)}
            className="font-black text-2xl text-white hover:text-red-100 transition-colors"
          >
            RUTE SURO
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-white font-medium hover:text-red-100 transition-colors duration-300">
              Home
            </Link>
            <Link to="/map" className="text-white font-medium hover:text-red-100 transition-colors duration-300">
              Map
            </Link>
            <Link to="/tentang" className="text-white font-medium hover:text-red-100 transition-colors duration-300">
              Tentang
            </Link>
            <Link to="/sejarah" className="text-white font-medium hover:text-red-100 transition-colors duration-300">
              Sejarah
            </Link>
            <Link to="/jadwal" className="text-white font-medium hover:text-red-100 transition-colors duration-300">
              Jadwal
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link 
              to="/admin" 
              className="hidden md:block px-6 py-2 border-2 border-white text-white font-medium rounded hover:bg-white hover:text-red-800 transition-all duration-300"
            >
              Admin Login
            </Link>

            <button
              className="md:hidden text-white text-3xl p-2 hover:text-red-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-red-700 bg-red-900">
            <div className="px-4 py-4 space-y-2">
              <Link to="/" className="block px-4 py-3 text-white hover:bg-red-700 rounded transition-colors" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/map" className="block px-4 py-3 text-white hover:bg-red-700 rounded transition-colors" onClick={() => setIsMenuOpen(false)}>
                Map
              </Link>
              <Link to="/tentang" className="block px-4 py-3 text-white hover:bg-red-700 rounded transition-colors" onClick={() => setIsMenuOpen(false)}>
                Tentang
              </Link>
              <Link to="/sejarah" className="block px-4 py-3 text-white hover:bg-red-700 rounded transition-colors" onClick={() => setIsMenuOpen(false)}>
                Sejarah
              </Link>
              <Link to="/jadwal" className="block px-4 py-3 text-white hover:bg-red-700 rounded transition-colors" onClick={() => setIsMenuOpen(false)}>
                Jadwal
              </Link>
              <Link to="/admin" className="block px-4 py-3 text-white border-2 border-white rounded hover:bg-white hover:text-red-800 transition-all" onClick={() => setIsMenuOpen(false)}>
                Admin Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
