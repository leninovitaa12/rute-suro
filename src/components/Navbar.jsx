'use client';

import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Brand */}
          <a href="/" className="navbar-brand" onClick={closeMenu}>
            <span className="brand-icon">RUTE</span>
            <span>SURO</span>
          </a>

          {/* Desktop Menu */}
          <div className="navbar-menu">
            <div className="desktop-menu">
              <a href="#" className="nav-link active">
                Home
              </a>
              <a href="#map" className="nav-link">
                Map
              </a>
              <a href="#about" className="nav-link">
                Tentang
              </a>
              <a href="#schedule" className="nav-link">
                Jadwal
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            <a href="#admin" className="btn-admin">
              Admin Login
            </a>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-btn"
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {isMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <a href="#" className="mobile-nav-link active" onClick={closeMenu}>
            Home
          </a>
          <a href="#map" className="mobile-nav-link" onClick={closeMenu}>
            Map
          </a>
          <a href="#about" className="mobile-nav-link" onClick={closeMenu}>
            Tentang
          </a>
          <a href="#schedule" className="mobile-nav-link" onClick={closeMenu}>
            Jadwal
          </a>
          <a href="#admin" className="mobile-nav-link" onClick={closeMenu}>
            Admin Login
          </a>
        </div>
      </div>
    </nav>
  );
}
