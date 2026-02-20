// src/components/CTASection.jsx

import { Link } from 'react-router-dom'

const IconCalendar = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IconMap = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
)

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#7f1d1d] via-[#991b1b] to-[#b91c1c] py-20 px-6 text-center">

      {/* dot pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* decorative orbs */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/[0.04]" />
      <div className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 w-40 h-40 rounded-full bg-white/[0.03]" />

      {/* content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight tracking-tight">
          Rasakan Langsung Megahnya Tradisi
        </h2>
        <p className="text-white/70 text-base leading-relaxed mb-10">
          Lihat jadwal festival tahun ini dan temukan rute perjalananmu menuju jantung budaya Jawa.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/jadwal"
            className="inline-flex items-center gap-2 px-7 py-3 bg-white text-[#991b1b] font-bold text-[15px] rounded-[7px] border-2 border-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(0,0,0,0.18)] hover:bg-gray-50"
          >
            <IconCalendar />
            Lihat Jadwal
          </Link>
          <Link
            to="/map"
            className="inline-flex items-center gap-2 px-7 py-3 bg-white/10 text-white font-bold text-[15px] rounded-[7px] border-2 border-white/40 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:border-white/80"
          >
            <IconMap />
            Lihat Peta
          </Link>
        </div>
      </div>
    </section>
  )
}