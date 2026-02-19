// src/components/CTASection.jsx
// TIDAK ADA PERUBAHAN STRUKTUR/KONTEN — hanya tambah visual detail

import { Link } from 'react-router-dom'

export default function CTASection() {
  const steps = [
    { number: '1', title: 'Pilih Lokasi', description: 'Tentukan titik awal dan tujuan Anda di peta interaktif atau pilih dari daftar acara.' },
    { number: '2', title: 'Pilih Metode', description: 'Pilih preferensi transportasi: jalan kaki, motor, mobil, atau transportasi umum.' },
    { number: '3', title: 'Cari Rute Optimal', description: 'Algoritma A* menganalisis dan menentukan rute terbaik dengan mempertimbangkan jarak dan waktu.' }
  ]

  return (
    <section className="py-16 md:py-20 bg-gray-50 relative overflow-hidden">

      {/* ── decorative background shapes ── */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,26,26,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', left: '-60px',
        width: '260px', height: '260px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,26,26,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── subtle dot grid ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(139,26,26,0.08) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)',
      }} />

      <style>{`
        @keyframes ctaFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139,26,26,0.25); }
          50%       { box-shadow: 0 0 0 10px rgba(139,26,26,0); }
        }
        @keyframes stepLineGrow {
          from { width: 0; }
          to   { width: 100%; }
        }
        .cta-card {
          transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .cta-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #8b1a1a, #dc2626);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .cta-card:hover::before {
          transform: scaleX(1);
        }
        .cta-card:hover {
          border-color: #8b1a1a !important;
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(139,26,26,0.12) !important;
        }
        .cta-number {
          animation: ctaPulse 3s ease-in-out infinite;
        }
        .cta-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .cta-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .cta-btn:hover::after { opacity: 1; }
        .cta-btn:hover {
          box-shadow: 0 12px 32px rgba(139,26,26,0.35) !important;
          transform: translateY(-2px);
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 md:px-6" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── heading — sama persis ── */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          {/* NEW: label kecil di atas */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '4px 14px', borderRadius: '999px',
            background: 'rgba(139,26,26,0.08)',
            border: '1px solid rgba(139,26,26,0.15)',
            fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
            color: '#8b1a1a', fontWeight: 700,
            marginBottom: '12px',
          }}>
            <span style={{
              display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
              background: '#8b1a1a',
            }} />
            Cara Menggunakan
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Siap Menjelajahi Ponorogo?
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Gunakan sistem navigasi berbasis algoritma kami untuk pengalaman optimal.
          </p>
        </div>

        {/* ── step cards — sama persis, tambah class cta-card ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          {/* connector lines antara card (desktop only) */}
          <div style={{
            position: 'absolute', top: '50%', left: '33.33%', right: '33.33%',
            height: '2px',
            background: 'linear-gradient(90deg, rgba(139,26,26,0.15), rgba(139,26,26,0.25), rgba(139,26,26,0.15))',
            display: 'none', // hidden by default, shown via media query jika mau
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          {steps.map((step, idx) => (
            <div
              key={idx}
              className="cta-card bg-white p-8 rounded-lg border border-gray-200 pl-20"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* number badge — sama persis + pulse */}
              <div
                className="cta-number absolute left-6 top-6 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md"
                style={{ animationDelay: `${idx * 0.3}s` }}
              >
                {step.number}
              </div>

              {/* NEW: step label */}
              <div style={{
                fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
                color: '#8b1a1a', fontWeight: 700, marginBottom: '6px', opacity: 0.7,
              }}>
                Langkah {step.number}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>

              {/* NEW: decorative corner accent */}
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 60, height: 60, overflow: 'hidden', opacity: 0.04,
              }}>
                <div style={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: '#8b1a1a',
                  position: 'absolute', bottom: '-60px', right: '-60px',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA button — sama persis, tambah class cta-btn ── */}
        <div className="text-center">

          {/* NEW: teks kecil di atas tombol */}
          <p style={{
            fontSize: '13px', color: '#9ca3af', marginBottom: '16px',
            letterSpacing: '0.5px',
          }}>
          </p>

          <Link
            to="/map"
            className="cta-btn inline-flex items-center gap-3 px-10 py-4 bg-red-700 text-white font-bold text-lg rounded hover:bg-red-800"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/>
            </svg>
            Buka Peta Interaktif
          </Link>

          {/* NEW: trust badges */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '24px',
            marginTop: '24px', flexWrap: 'wrap',
          }}>
            {[].map((badge, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', color: '#6b7280',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#8b1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}