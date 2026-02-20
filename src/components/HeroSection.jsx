// src/components/HeroSection.jsx
// ✅ Mobile: swipe gesture only (no arrows) | Hapus badge "Kabupaten Ponorogo"

import { Link } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'

const FLIP_WORDS = ['Budaya', 'Wisata', 'Tradisi', 'Warisan']

// ─── CAROUSEL SLIDES ─────────────────────────────────────────────────────────
// Ganti src dengan path gambar Anda di folder public/images/
const SLIDES = [
  { src: '/images/grebeg-suro-1.jpg' },
  { src: '/images/grebeg-suro-2.jpg' },
  { src: '/images/grebeg-suro-3.jpg' },
  { src: '/images/grebeg-suro-4.jpg' },
]

const PARTICLES = [
  { left: '6%',  size: 5, dur: '7s',   delay: '0s'   },
  { left: '18%', size: 3, dur: '9s',   delay: '1.8s' },
  { left: '29%', size: 4, dur: '6.5s', delay: '3.2s' },
  { left: '53%', size: 3, dur: '8s',   delay: '0.6s' },
  { left: '69%', size: 4, dur: '10s',  delay: '2.2s' },
  { left: '83%', size: 3, dur: '7.5s', delay: '4.1s' },
  { left: '94%', size: 4, dur: '9s',   delay: '1.1s' },
]

export default function HeroSection() {
  const [wordIndex, setWordIndex]         = useState(0)
  const [animState, setAnimState]         = useState('visible')
  const [mouse, setMouse]                 = useState({ x: 35, y: 45 })
  const [current, setCurrent]             = useState(0)
  const [nextSlide, setNextSlide]         = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const autoplayRef = useRef(null)

  // ── swipe touch refs ──
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  // ── carousel nav ──
  const goTo = useCallback((idx) => {
    if (transitioning || idx === current) return
    setNextSlide(idx)
    setTransitioning(true)
    setTimeout(() => {
      setCurrent(idx)
      setNextSlide(null)
      setTransitioning(false)
    }, 700)
  }, [transitioning, current])

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo])
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo])

  // autoplay
  useEffect(() => {
    autoplayRef.current = setInterval(next, 5000)
    return () => clearInterval(autoplayRef.current)
  }, [next])

  // text flip
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

  // mouse spotlight
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

  // ── swipe handlers ──
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    // hanya proses swipe horizontal (bukan scroll vertikal)
    if (Math.abs(dx) > 50 && dy < 80) {
      if (dx < 0) next()
      else prev()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  const flipStyle = {
    display: 'inline-block',
    transition: 'opacity 0.32s cubic-bezier(0.4,0,0.2,1), transform 0.32s cubic-bezier(0.4,0,0.2,1)',
    opacity: animState !== 'visible' ? 0 : 1,
    transform:
      animState === 'exit'  ? 'translateY(-16px) rotateX(25deg)' :
      animState === 'enter' ? 'translateY(16px) rotateX(-25deg)' :
                              'translateY(0) rotateX(0deg)',
    color: '#fca5a5',
    fontStyle: 'italic',
  }

  return (
    <section
      id="hero-sec"
      className="min-h-screen text-white relative overflow-hidden flex items-center scroll-mt-16"
      style={{ paddingTop: '80px' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          15%  { opacity: 0.45; }
          85%  { opacity: 0.18; }
          100% { transform: translateY(-130px) translateX(12px); opacity: 0; }
        }
        @keyframes kenburns {
          0%   { transform: scale(1)    translate(0px, 0px); }
          33%  { transform: scale(1.07) translate(-10px, -5px); }
          66%  { transform: scale(1.04) translate(8px, -8px); }
          100% { transform: scale(1)    translate(0px, 0px); }
        }
        @keyframes slideReveal {
          from { opacity: 0; transform: scale(1.07); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes progressGrow {
          from { width: 0%; }
          to   { width: 100%; }
        }

        .hero-title    { animation: fadeInUp 0.6s ease-out 0.10s backwards; }
        .hero-subtitle { animation: fadeInUp 0.6s ease-out 0.22s backwards; }
        .hero-buttons  { animation: fadeInUp 0.6s ease-out 0.34s backwards; }
        .hero-dots-row { animation: fadeInUp 0.6s ease-out 0.44s backwards; }

        .particle {
          position: absolute; border-radius: 50%;
          background: rgba(252,165,165,0.3);
          animation: floatUp linear infinite;
          pointer-events: none;
        }

        /* carousel bg */
        .cbg { position: absolute; inset: 0; background-size: cover; background-position: center; }
        .cbg-current { animation: kenburns 14s ease-in-out infinite; }
        .cbg-next {
          animation: slideReveal 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
          z-index: 1;
        }

        /* ── CTA BUTTONS ── */
        .btn-solid {
          display: inline-block; text-align: center;
          padding: 14px 32px;
          background: white; color: #991b1b;
          font-weight: 800; font-size: 15px;
          border-radius: 6px; text-decoration: none;
          transition: background 0.2s, box-shadow 0.2s, transform 0.18s;
        }
        .btn-solid:hover {
          background: #f9fafb;
          box-shadow: 0 8px 28px rgba(0,0,0,0.3);
          transform: translateY(-2px);
        }
        .btn-ghost {
          display: inline-block; text-align: center;
          padding: 13px 32px;
          border: 2px solid rgba(255,255,255,0.5);
          color: white; font-weight: 700; font-size: 15px;
          border-radius: 6px; text-decoration: none;
          backdrop-filter: blur(6px);
          background: rgba(255,255,255,0.07);
          transition: background 0.2s, border-color 0.2s, transform 0.18s;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.16);
          border-color: rgba(255,255,255,0.85);
          transform: translateY(-2px);
        }

        /* ── ARROWS: tampil hanya di desktop ── */
        .c-arrow {
          position: absolute;
          top: 50%; transform: translateY(-50%);
          z-index: 10;
          background: none; border: none; padding: 8px;
          color: rgba(255,255,255,0.5);
          font-size: 30px; font-weight: 300; line-height: 1;
          cursor: pointer; outline: none;
          transition: color 0.2s, transform 0.2s;
          user-select: none;
        }
        .c-arrow:hover { color: #fff; transform: translateY(-50%) scale(1.2); }
        .c-arrow-left  { left: 14px; }
        .c-arrow-right { right: 14px; }

        /* ── MOBILE: sembunyikan arrow sepenuhnya ── */
        @media (max-width: 767px) {
          .c-arrow { display: none !important; }
          .c-num   { display: none !important; }
        }

        /* dots */
        .c-dot-pill {
          height: 4px; border-radius: 9999px; border: none; padding: 0;
          background: rgba(255,255,255,0.32);
          cursor: pointer;
          transition: background 0.3s, width 0.38s cubic-bezier(0.4,0,0.2,1);
          width: 24px;
        }
        .c-dot-pill.on { background: #fca5a5; width: 56px; }

        /* progress bar */
        .c-progress {
          position: absolute; bottom: 0; left: 0;
          height: 3px; z-index: 10;
          background: linear-gradient(to right, #fca5a5, #ef4444);
          border-radius: 0 2px 0 0;
        }
        .c-progress.run { animation: progressGrow 5s linear forwards; }

        /* slide counter (desktop only) */
        .c-num {
          position: absolute; bottom: 22px; right: 28px; z-index: 10;
          font-size: 11px; letter-spacing: 2px;
          color: rgba(255,255,255,0.45); font-weight: 600;
        }
      `}</style>

      {/* ══ FULLSCREEN CAROUSEL BG ══ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <div className="cbg cbg-current" style={{ backgroundImage: `url(${SLIDES[current].src})` }} />
        {nextSlide !== null && (
          <div className="cbg cbg-next" style={{ backgroundImage: `url(${SLIDES[nextSlide].src})` }} />
        )}
      </div>

      {/* ══ OVERLAY ══ */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(125deg, rgba(90,4,4,0.84) 0%, rgba(70,4,4,0.68) 40%, rgba(20,2,2,0.52) 100%)',
      }} />

      {/* bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '180px',
        background: 'linear-gradient(to bottom, transparent, rgba(50,3,3,0.65))',
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* ══ DOT GRID ══ */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%)',
      }} />

      {/* ══ DIAGONAL LINES ══ */}
      <svg style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        zIndex: 2, opacity: 0.04, pointerEvents: 'none',
      }} preserveAspectRatio="none">
        <line x1="0"   y1="0" x2="25%"  y2="100%" stroke="white" strokeWidth="1" />
        <line x1="8%"  y1="0" x2="33%"  y2="100%" stroke="white" strokeWidth="0.5" />
        <line x1="78%" y1="0" x2="100%" y2="62%"   stroke="white" strokeWidth="1" />
        <line x1="87%" y1="0" x2="112%" y2="78%"   stroke="white" strokeWidth="0.5" />
      </svg>

      {/* ══ MOUSE SPOTLIGHT ══ */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        background: `radial-gradient(480px circle at ${mouse.x}% ${mouse.y}%, rgba(255,255,255,0.055) 0%, transparent 70%)`,
        transition: 'background 0.08s linear',
      }} />

      {/* ══ PARTICLES ══ */}
      {PARTICLES.map((p, i) => (
        <div key={i} className="particle" style={{
          left: p.left, bottom: '8%',
          width: p.size, height: p.size,
          animationDuration: p.dur, animationDelay: p.delay, zIndex: 3,
        }} />
      ))}

      {/* ══ ARROWS (desktop only — hidden on mobile via CSS) ══ */}
      <button className="c-arrow c-arrow-left"  onClick={prev} aria-label="Previous">‹</button>
      <button className="c-arrow c-arrow-right" onClick={next} aria-label="Next">›</button>

      {/* ══ PROGRESS BAR ══ */}
      <div key={`prog-${current}`} className="c-progress run" style={{ width: 0 }} />

      {/* ══ SLIDE COUNTER (desktop only) ══ */}
      <div className="c-num">
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div style={{
        position: 'relative', zIndex: 5,
        maxWidth: '1152px', margin: '0 auto',
        padding: '0 28px', width: '100%',
      }}>
        <div style={{ maxWidth: '600px' }}>

          {/* Heading */}
          <div className="hero-title">
            <h1 style={{
              fontSize: 'clamp(40px, 7vw, 82px)',
              fontWeight: 900, lineHeight: 1.04,
              letterSpacing: '-1.5px',
              color: '#fff', marginBottom: '14px',
              textShadow: '0 2px 24px rgba(0,0,0,0.45)',
            }}>
              RUTE SURO
            </h1>
            <div style={{ perspective: '600px', marginBottom: '20px' }}>
              <p style={{ fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 700, color: '#fecaca' }}>
                Optimasi Jalur{' '}
                <span style={flipStyle}>{FLIP_WORDS[wordIndex]}</span>
                {' '}Ponorogo
              </p>
            </div>
          </div>

          {/* Subtitle */}
          <p className="hero-subtitle" style={{
            fontSize: 'clamp(14px, 3.5vw, 17px)', lineHeight: 1.78,
            color: 'rgba(255,255,255,0.80)',
            maxWidth: '500px', marginBottom: '36px',
            textShadow: '0 1px 10px rgba(0,0,0,0.35)',
          }}>
            Navigasi cerdas menggunakan algoritma A* untuk memastikan perjalanan
            Grebeg Suro berjalan lancar, efisien, dan tepat sesuai kebutuhan masyarakat.
          </p>

          {/* Buttons */}
          <div className="hero-buttons" style={{
            display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '32px',
          }}>
            <Link to="/map" className="btn-solid">Mulai Optimasi</Link>
            <Link to="/jadwal" className="btn-ghost">Lihat Jadwal</Link>
          </div>

          {/* Dot nav */}
          <div className="hero-dots-row" style={{ display: 'flex', gap: '8px' }}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`c-dot-pill${i === current ? ' on' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}