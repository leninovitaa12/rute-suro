// src/components/HeroSection.jsx

import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const FLIP_WORDS = ['Budaya', 'Wisata', 'Tradisi', 'Warisan']

// Generate meteor data sekali
const METEORS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 60}%`,
  left: `${Math.random() * 100}%`,
  duration: `${2.5 + Math.random() * 3}s`,
  delay: `${Math.random() * 8}s`,
  width: `${80 + Math.random() * 120}px`,
  opacity: 0.25 + Math.random() * 0.45,
}))

export default function HeroSection() {
  const [pathNodes, setPathNodes] = useState([])
  const [wordIndex, setWordIndex] = useState(0)
  const [animState, setAnimState] = useState('visible')
  const [mouse, setMouse] = useState({ x: 35, y: 45 })

  // Path nodes
  useEffect(() => {
    setTimeout(() => {
      setPathNodes([
        { x: 15, y: 15 },
        { x: 35, y: 30 },
        { x: 55, y: 45 },
        { x: 75, y: 65 },
        { x: 85, y: 85 },
      ])
    }, 500)
  }, [])

  // Text flip
  useEffect(() => {
    const iv = setInterval(() => {
      setAnimState('exit')
      setTimeout(() => {
        setWordIndex(i => (i + 1) % FLIP_WORDS.length)
        setAnimState('enter')
        setTimeout(() => setAnimState('visible'), 380)
      }, 320)
    }, 2800)
    return () => clearInterval(iv)
  }, [])

  // Mouse spotlight
  useEffect(() => {
    const fn = (e) => {
      const el = document.getElementById('hero-sec')
      if (!el) return
      const r = el.getBoundingClientRect()
      setMouse({
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      })
    }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  const flipStyle = {
    display: 'inline-block',
    transition: 'opacity 0.32s cubic-bezier(0.4,0,0.2,1), transform 0.32s cubic-bezier(0.4,0,0.2,1)',
    opacity: animState !== 'visible' ? 0 : 1,
    transform:
      animState === 'exit'   ? 'translateY(-16px) rotateX(25deg)' :
      animState === 'enter'  ? 'translateY(16px) rotateX(-25deg)' :
                               'translateY(0) rotateX(0deg)',
    color: '#fca5a5',
    fontStyle: 'italic',
  }

  return (
    <section
      id="hero-sec"
      className="min-h-screen bg-red-800 text-white relative overflow-hidden pt-20 flex items-center scroll-mt-16"
    >
      <style>{`
        /* === existing === */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes drawLine {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes pulseDot {
          0%, 100% { r: 6; opacity: 1; }
          50%       { r: 10; opacity: 0.6; }
        }
        @keyframes glowNode {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(220,38,38,0.6)); }
          50%       { filter: drop-shadow(0 0 8px rgba(220,38,38,0.9)); }
        }
        .hero-title    { animation: fadeInUp 0.6s ease-out 0.1s backwards; }
        .hero-subtitle { animation: fadeInUp 0.6s ease-out 0.2s backwards; }
        .hero-buttons  { animation: fadeInUp 0.6s ease-out 0.3s backwards; }
        .hero-visual   { animation: fadeInUp 0.6s ease-out 0.4s backwards; }
        .hero-badge    { animation: fadeInUp 0.5s ease-out 0.05s backwards; }
        .path-line     { animation: drawLine 0.8s ease-out forwards; transform-origin: left; }
        .path-node {
          opacity: 0;
          animation: fadeInUp 0.5s ease-out forwards, glowNode 2s ease-in-out infinite;
          filter: drop-shadow(0 0 4px rgba(220,38,38,0.6));
        }
        .path-node-pulse { animation: pulseDot 2s ease-in-out infinite !important; }

        /* === METEOR === */
        @keyframes meteorFall {
          0% {
            transform: rotate(215deg) translateX(0);
            opacity: 1;
          }
          70% { opacity: 1; }
          100% {
            transform: rotate(215deg) translateX(500px);
            opacity: 0;
          }
        }
        .meteor {
          position: absolute;
          height: 1.5px;
          background: linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0));
          border-radius: 9999px;
          animation: meteorFall linear infinite;
          pointer-events: none;
          transform: rotate(215deg);
        }
        .meteor::before {
          content: '';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: 0;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 6px 1px rgba(255,255,255,0.6);
        }

        /* === floating particles === */
        @keyframes floatUp {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          15%  { opacity: 0.45; }
          85%  { opacity: 0.18; }
          100% { transform: translateY(-130px) translateX(12px); opacity: 0; }
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(252,165,165,0.35);
          animation: floatUp linear infinite;
          pointer-events: none;
        }

        /* badge dot pulse */
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(252,165,165,0.7); }
          50%       { box-shadow: 0 0 0 5px rgba(252,165,165,0); }
        }
      `}</style>

      {/* ══ SPOTLIGHT PUTIH mengikuti mouse ══ */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(480px circle at ${mouse.x}% ${mouse.y}%, rgba(255,255,255,0.07) 0%, transparent 70%)`,
        transition: 'background 0.08s linear',
        zIndex: 2,
      }} />

      {/* ══ SPOTLIGHT PUTIH STATIC kiri atas ══ */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(380px circle at 10% 20%, rgba(255,255,255,0.055) 0%, transparent 65%)',
        zIndex: 2,
      }} />

      {/* ══ GRID DOT PATTERN ══ */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        zIndex: 0,
        maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%)',
      }} />

      {/* ══ DIAGONAL LINES ══ */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0, opacity: 0.05 }} preserveAspectRatio="none">
        <line x1="0"   y1="0" x2="25%"  y2="100%" stroke="white" strokeWidth="1" />
        <line x1="8%"  y1="0" x2="33%"  y2="100%" stroke="white" strokeWidth="0.5" />
        <line x1="78%" y1="0" x2="100%" y2="62%"   stroke="white" strokeWidth="1" />
        <line x1="87%" y1="0" x2="112%" y2="78%"   stroke="white" strokeWidth="0.5" />
      </svg>

      {/* ══ METEORS ══ */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {METEORS.map(m => (
          <span key={m.id} className="meteor" style={{
            top: m.top,
            left: m.left,
            width: m.width,
            opacity: m.opacity,
            animationDuration: m.duration,
            animationDelay: m.delay,
          }} />
        ))}
      </div>

      {/* ══ FLOATING PARTICLES ══ */}
      {[
        { left: '6%',  size: 5, dur: '7s',   delay: '0s'   },
        { left: '18%', size: 3, dur: '9s',   delay: '1.8s' },
        { left: '29%', size: 4, dur: '6.5s', delay: '3.2s' },
        { left: '53%', size: 3, dur: '8s',   delay: '0.6s' },
        { left: '69%', size: 4, dur: '10s',  delay: '2.2s' },
        { left: '83%', size: 3, dur: '7.5s', delay: '4.1s' },
        { left: '94%', size: 4, dur: '9s',   delay: '1.1s' },
      ].map((p, i) => (
        <div key={i} className="particle" style={{
          left: p.left, bottom: '8%',
          width: p.size, height: p.size,
          animationDuration: p.dur,
          animationDelay: p.delay,
          zIndex: 1,
        }} />
      ))}

      {/* ══ BOTTOM FADE ══ */}
      <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, transparent, rgba(107,20,20,0.45))',
        zIndex: 1,
      }} />

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 w-full" style={{ position: 'relative', zIndex: 3 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>

            {/* Badge */}
            <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              fontSize: '12px', letterSpacing: '2px',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)',
            }}>
              <span style={{
                display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                background: '#fca5a5',
                animation: 'badgePulse 2s ease-in-out infinite',
              }} />
              Kabupaten Ponorogo
            </div>

            {/* Judul */}
            <div className="hero-title">
              <h1 className="text-5xl md:text-6xl font-black leading-tight mb-3 text-white">
                RUTE SURO
              </h1>
              {/* Text flip */}
              <div className="mb-4" style={{ perspective: '600px' }}>
                <p className="text-xl font-bold text-red-200">
                  Optimasi Jalur{' '}
                  <span style={flipStyle}>{FLIP_WORDS[wordIndex]}</span>
                  {' '}Ponorogo
                </p>
              </div>
            </div>

            {/* Subtitle — tidak diubah */}
            <p className="hero-subtitle text-base md:text-lg opacity-90 mb-8 leading-relaxed max-w-md">
              Navigasi cerdas menggunakan algoritma A* untuk memastikan perjalanan Grebeg Suro berjalan lancar, efisien, dan tepat sesuai kebutuhan masyarakat.
            </p>

            {/* Buttons — tidak diubah */}
            <div className="hero-buttons flex flex-col sm:flex-row gap-4">
              <Link to="/map" className="px-8 py-3 bg-white text-red-700 font-bold rounded btn-primary-hover hover:shadow-lg hover:bg-gray-50 inline-block text-center">
                Mulai Optimasi
              </Link>
              <Link to="/jadwal" className="px-8 py-3 btn-red-outline rounded inline-block text-center">
                Lihat Jadwal
              </Link>
            </div>

          </div>

          {/* Visual card — tidak diubah sama sekali */}
          <div className="hero-visual relative hidden md:flex md:justify-center">
            <div className="relative w-80 h-80 bg-white rounded-2xl shadow-2xl p-6 flex-shrink-0">
              <div className="absolute top-8 left-8 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg">
                A
              </div>
              <div className="absolute bottom-8 right-8 w-8 h-8 bg-red-900 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg">
                B
              </div>
              <svg width="100%" height="100%" className="absolute top-0 left-0" style={{ pointerEvents: 'none' }}>
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#991b1b', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <line x1="24%" y1="24%" x2="76%" y2="76%"
                  stroke="url(#pathGradient)" strokeWidth="2.5"
                  className="path-line" style={{ animationDelay: '0.5s' }} />
                {pathNodes.map((node, idx) => (
                  <g key={idx}>
                    <circle cx={`${node.x}%`} cy={`${node.y}%`} r="6"
                      fill="none" stroke="#dc2626" strokeWidth="1.5" opacity="0.3"
                      className="path-node-pulse"
                      style={{ animationDelay: `${0.6 + idx * 0.1}s` }} />
                    <circle cx={`${node.x}%`} cy={`${node.y}%`} r="4"
                      fill="#fca5a5" className="path-node"
                      style={{ animationDelay: `${0.6 + idx * 0.1}s` }} />
                  </g>
                ))}
              </svg>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}