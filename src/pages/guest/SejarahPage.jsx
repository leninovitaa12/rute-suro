// src/pages/guest/SejarahPage.jsx

import React, { useState, useEffect, useRef } from 'react'
import { getSejarah } from '../../lib/backendApi'
import CTASection from '../../components/CTASection'

// ── SVG Icons ──
const IconSpirituality = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L9.5 8.5H3l5.5 4-2 6.5L12 15l5.5 4-2-6.5L21 8.5h-6.5z" />
  </svg>
)
const IconCommunity = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconPreservation = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const IconCastle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21V7l3-4 3 4V5l3-2 3 2V7l3-4 3 4v14H3z" /><rect x="9" y="14" width="6" height="7" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const IconSword = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" /><line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" /><line x1="19" y1="21" x2="21" y2="19" />
  </svg>
)
const IconScroll = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)
const IconGlobe = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)
const IconChevronDown = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const IconLightbulb = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
)

// ── Static Data ──
const NILAI = [
  { Icon: IconSpirituality, label: 'Spiritualitas', desc: 'Pendekatan diri kepada Sang Pencipta' },
  { Icon: IconCommunity,    label: 'Gotong Royong', desc: 'Kebersamaan tanpa memandang golongan' },
  { Icon: IconPreservation, label: 'Pelestarian',   desc: 'Menjaga seni budaya Reog tetap menyala' },
]

const TIMELINE_STATIC = [
  { era: 'Abad ke-15',   side: 'left',  Icon: IconCastle, desc: 'Awal mula ritual Suro sebagai bentuk syukur dan pemurnian diri para warak di Ponorogo setelah masa panen.' },
  { era: 'Era Kolonial', side: 'right', Icon: IconSword,  desc: 'Tradisi tetap dipertahankan secara sembunyi-sembunyi sebagai simbol perlawanan budaya dan perekat semangat yang rekat.' },
  { era: 'Tahun 1987',  side: 'left',  Icon: IconScroll, desc: 'Pemerintah Kabupaten Ponorogo meresmikan Grebeg Suro sebagai festival budaya resmi yang melibatkan parade kolosal.' },
  { era: 'Era Modern',  side: 'right', Icon: IconGlobe,  desc: 'Grebeg Suro bertransformasi menjadi Festival Nasional Reog Ponorogo (FNRP), menarik wisatawan dari seluruh penjuru dunia.' },
]

// ── Hook ──
function useInView() {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

export default function SejarahPage() {
  const [sejarahItems, setSejarahItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const [introRef,  introInView]  = useInView()
  const [legendRef, legendInView] = useInView()
  const [tlRef,     tlInView]     = useInView()

  useEffect(() => { loadSejarah() }, [])

  const loadSejarah = async () => {
    try {
      setLoading(true)
      const data = await getSejarah()
      setSejarahItems(data)
    } catch (err) {
      console.error('[SejarahPage] Error:', err)
      setError('Gagal memuat data sejarah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        .s-hero {
          min-height: 90vh;
          background:
            linear-gradient(160deg, rgba(60,3,3,0.92) 0%, rgba(110,8,8,0.78) 45%, rgba(15,1,1,0.62) 100%),
            url('/images/sejarah-1.jpg') center/cover no-repeat;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; color: white;
          padding: 100px 24px 60px;
          position: relative; overflow: hidden;
        }
        .s-hero::after {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        @keyframes bounceY {
          0%,100% { transform: translateY(0); opacity: .4; }
          50%      { transform: translateY(10px); opacity: .9; }
        }
        .scroll-caret { animation: bounceY 2.2s ease-in-out infinite; position: relative; z-index: 1; color: rgba(255,255,255,.45); }

        .s-card {
          position: relative; overflow: hidden;
          background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px;
          transition: border-color .4s, transform .4s cubic-bezier(.34,1.4,.64,1), box-shadow .4s;
        }
        .s-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #dc2626, #f87171, transparent);
          transform: translateX(-100%); transition: transform .6s cubic-bezier(.4,0,.2,1);
        }
        .s-card::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(220,38,38,.04) 0%, transparent 65%);
          opacity: 0; transition: opacity .4s; pointer-events: none;
        }
        .s-card:hover { border-color: rgba(153,27,27,.30); transform: translateY(-4px); box-shadow: 0 16px 36px rgba(153,27,27,.08); }
        .s-card:hover::before { transform: translateX(100%); }
        .s-card:hover::after  { opacity: 1; }

        .nilai-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 0; border-bottom: 1px solid #f3f4f6;
          transition: transform .2s ease;
        }
        .nilai-row:last-child { border-bottom: none; }
        .nilai-row:hover { transform: translateX(4px); }
        .nilai-icon {
          width: 36px; height: 36px; border-radius: 9px;
          background: rgba(153,27,27,.07); color: #991b1b;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* TIMELINE */
        .tl-wrap { position: relative; }
        .tl-axis {
          position: absolute; left: 50%; transform: translateX(-50%);
          width: 2px; top: 0; bottom: 0;
          background: linear-gradient(to bottom, transparent, #dc2626 12%, #dc2626 88%, transparent);
        }
        @media (max-width: 767px) {
          .tl-axis { left: 22px; transform: none; }
          .tl-row  { grid-template-columns: 48px 1fr !important; }
          .tl-left-cell { display: none !important; }
          .tl-center-cell { justify-content: flex-start !important; }
        }
        .tl-row {
          display: grid; grid-template-columns: 1fr 60px 1fr;
          align-items: center; margin-bottom: 48px;
          position: relative; z-index: 1;
        }
        .tl-center-cell { display: flex; justify-content: center; }
        .tl-dot {
          width: 46px; height: 46px; border-radius: 50%;
          background: linear-gradient(135deg, #991b1b, #dc2626);
          border: 4px solid white;
          box-shadow: 0 0 0 3px rgba(153,27,27,.18), 0 6px 20px rgba(153,27,27,.28);
          display: flex; align-items: center; justify-content: center;
          color: white; flex-shrink: 0;
          transition: transform .3s cubic-bezier(.34,1.6,.64,1), box-shadow .3s;
        }
        .tl-dot:hover { transform: scale(1.18); box-shadow: 0 0 0 5px rgba(153,27,27,.14), 0 8px 26px rgba(153,27,27,.36); }
        .tl-card {
          background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px;
          padding: 20px; position: relative; overflow: hidden;
          transition: border-color .4s, transform .4s cubic-bezier(.34,1.4,.64,1), box-shadow .4s;
        }
        .tl-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #dc2626, #f87171, transparent);
          transform: translateX(-100%); transition: transform .6s cubic-bezier(.4,0,.2,1);
        }
        .tl-card:hover { border-color: rgba(153,27,27,.30); transform: translateY(-4px); box-shadow: 0 14px 34px rgba(153,27,27,.08); }
        .tl-card:hover::before { transform: translateX(100%); }
        .tl-ghost { display: flex; align-items: center; justify-content: center; opacity: .08; min-height: 80px; color: #991b1b; }

        .cms-card {
          background: #f9fafb; border: 1.5px solid #f3f4f6; border-radius: 13px;
          padding: 20px; position: relative; overflow: hidden;
          transition: border-color .4s, transform .4s cubic-bezier(.34,1.4,.64,1), box-shadow .4s;
        }
        .cms-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #dc2626, #f87171, transparent);
          transform: translateX(-100%); transition: transform .6s cubic-bezier(.4,0,.2,1);
        }
        .cms-card:hover { border-color: rgba(153,27,27,.24); transform: translateY(-4px); box-shadow: 0 12px 32px rgba(153,27,27,.07); }
        .cms-card:hover::before { transform: translateX(100%); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu { opacity: 0; }
        .fu.on { animation: fadeUp .55s ease-out forwards; }
        .fu.d1 { animation-delay: .08s; }
        .fu.d2 { animation-delay: .18s; }
        .fu.d3 { animation-delay: .28s; }
        .fu.d4 { animation-delay: .38s; }
      `}</style>

      {/* ══ 1. HERO ══ */}
      <section className="s-hero">
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[2.5px] text-white/85 mb-6">
          Warisan Budaya Dunia
        </div>
        <h1
          className="relative z-10 text-white font-black leading-[1.04] mb-3"
          style={{ fontSize: 'clamp(38px,7.5vw,82px)', letterSpacing: '-1.5px' }}
        >
          Menelusuri Jejak
          <span
            className="block italic"
            style={{ background: 'linear-gradient(135deg,#fca5a5,#f87171)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            Grebeg Suro
          </span>
        </h1>
        <p className="relative z-10 text-white/70 max-w-lg leading-relaxed mb-10" style={{ fontSize: 'clamp(14px,2.5vw,17px)' }}>
          Kisah keberanian, spiritualitas, dan tradisi adiluhung yang membentuk identitas masyarakat Ponorogo selama berabad-abad.
        </p>
        <div className="scroll-caret"><IconChevronDown /></div>
      </section>

      {/* ══ 2. INTRO ══ */}
      <section ref={introRef} className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-start">

            {/* Left */}
            <div className={`lg:col-span-3 fu${introInView ? ' on' : ''}`}>
              <h2
                className="font-black text-gray-900 leading-tight mb-4"
                style={{ fontSize: 'clamp(22px,4vw,36px)', letterSpacing: '-0.5px' }}
              >
                Lebih dari Sekadar Perayaan,<br />
                Sebuah <span className="text-[#991b1b]">Manifestasi Syukur.</span>
              </h2>
              <p className="text-gray-600 leading-relaxed text-base mb-7">
                Grebeg Suro merupakan tradisi tahunan masyarakat Ponorogo yang bertepatan dengan malam 1 Suro (1 Muharram). Perayaan ini tidak hanya menjadi pesta rakyat, namun juga merupakan paduan antara nilai religius, seni budaya Reog yang mendunia, dan penghormatan terhadap leluhur.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {['/images/sejarah-2.jpg', '/images/sejarah-3.jpg'].map((src, i) => (
                  <div key={i} className="rounded-xl overflow-hidden h-48 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                    <img src={src} alt="Budaya Ponorogo" className="w-full h-full object-cover block" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div className={`lg:col-span-2 fu d2${introInView ? ' on' : ''} flex flex-col gap-4`}>
              <div className="s-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#991b1b]"><IconLightbulb /></span>
                  <span className="text-[9px] font-extrabold uppercase tracking-[2.5px] text-[#991b1b]">Tahukah Anda?</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Istilah <strong>"Grebeg"</strong> berasal dari kata <em>"Gumerebeg"</em> yang menggambarkan suasana riuh rendah dan semangat kebersamaan masyarakat Jawa, menyambut malam pergantian tahun Jawa.
                </p>
              </div>
              <div className="s-card p-6">
                <p className="text-sm font-extrabold text-gray-900 mb-3 tracking-wide">Nilai Inti</p>
                {NILAI.map(({ Icon, label, desc }, i) => (
                  <div key={i} className="nilai-row">
                    <div className="nilai-icon"><Icon /></div>
                    <div>
                      <span className="font-bold text-[#991b1b] text-sm">{label}: </span>
                      <span className="text-sm text-gray-500">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ 3. LEGENDA ══ */}
      <section ref={legendRef} className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="font-black text-gray-900 mb-3"
              style={{ fontSize: 'clamp(22px,4vw,34px)', letterSpacing: '-0.4px' }}
            >
              Legenda Kelono Sewandono
            </h2>
            <div className="w-11 h-0.5 mx-auto rounded-full" style={{ background: 'linear-gradient(90deg,#991b1b,#dc2626)' }} />
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch fu${legendInView ? ' on' : ''}`}>
            {/* Image — taller */}
            <div className="rounded-2xl overflow-hidden shadow-xl transition-transform duration-500 hover:scale-[1.01]" style={{ minHeight: '480px' }}>
              <img
                src="/images/sejarah-1.jpg"
                alt="Wayang Ponorogo"
                className="w-full h-full object-cover block"
                style={{ minHeight: '480px' }}
              />
            </div>
            {/* Text */}
            <div className="flex flex-col justify-center gap-5">
              <p className="text-gray-700 leading-[1.85] text-[15px]">
                Akar dari Grebeg Suro tak lepas dari legenda Prabu Kelono Sewandono dari Kerajaan Bantarangin. Kisahnya melamar Dewi Sanggalangit dari Kediri menciptakan syarat berupa pertunjukan seni yang belum pernah ada sebelumnya.
              </p>
              <p className="text-gray-500 leading-[1.85] text-[15px]">
                Perjalanan sang Prabu yang diiringi oleh pasukan berkuda Jatil dan Bujang Ganong inilah yang kemudian menjadi cikal bakal kesenian Reog Ponorogo yang megah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 4. TIMELINE ══ */}
      <section id="timeline" ref={tlRef} className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className={`text-center mb-12 fu${tlInView ? ' on' : ''}`}>
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#991b1b]/[0.06] border border-[#991b1b]/[0.14] text-[10px] font-bold uppercase tracking-[2px] text-[#991b1b] mb-3">
              Perjalanan Waktu
            </div>
            <h2
              className="font-black text-gray-900 mb-2"
              style={{ fontSize: 'clamp(22px,4vw,34px)', letterSpacing: '-0.4px' }}
            >
              Evolusi Tradisi
            </h2>
            <p className="text-gray-400 text-[15px]">Transformasi Grebeg Suro dari masa ke masa</p>
          </div>

          <div className="tl-wrap">
            <div className="tl-axis" />
            {TIMELINE_STATIC.map(({ era, side, Icon, desc }, idx) => (
              <div key={idx} className={`tl-row fu${tlInView ? ' on' : ''} d${idx + 1}`}>
                <div className="tl-left-cell" style={{ paddingRight: '24px', textAlign: 'right' }}>
                  {side === 'left' ? (
                    <div className="tl-card text-left">
                      <p className="text-[11px] font-extrabold text-[#991b1b] uppercase tracking-wide mb-1.5">{era}</p>
                      <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  ) : (
                    <div className="tl-ghost"><Icon /></div>
                  )}
                </div>
                <div className="tl-center-cell">
                  <div className="tl-dot"><Icon /></div>
                </div>
                <div style={{ paddingLeft: '24px' }}>
                  {side === 'right' ? (
                    <div className="tl-card">
                      <p className="text-[11px] font-extrabold text-[#991b1b] uppercase tracking-wide mb-1.5">{era}</p>
                      <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  ) : (
                    <div className="tl-ghost"><Icon /></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CMS data */}
          {!loading && !error && sejarahItems.length > 0 && (
            <div className="mt-14 pt-12 border-t border-gray-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#991b1b]/[0.06] border border-[#991b1b]/[0.14] text-[10px] font-bold uppercase tracking-[2px] text-[#991b1b] mb-2.5">
                  Dari Arsip Admin
                </div>
                <h3 className="font-extrabold text-gray-900" style={{ fontSize: 'clamp(18px,3vw,26px)', letterSpacing: '-0.3px' }}>
                  Catatan Sejarah
                </h3>
              </div>
              <div className="flex flex-col gap-3.5">
                {sejarahItems.map((item, idx) => (
                  <div key={item.id} className="cms-card">
                    <div className="flex gap-3.5 items-start">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#991b1b,#dc2626)', boxShadow: '0 4px 12px rgba(153,27,27,.20)' }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-[15px] font-extrabold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-gray-500 leading-relaxed text-sm whitespace-pre-wrap">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {loading && <div className="text-center py-10 text-gray-400">Memuat data sejarah...</div>}
          {error   && <div className="text-center p-8 bg-red-50 rounded-xl text-[#991b1b] font-semibold mt-6">{error}</div>}

        </div>
      </section>

      {/* ══ 5. QUOTE ══ */}
      <section className="bg-gray-50 py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-[54px] text-gray-200 leading-none mb-4 font-serif">"</div>
          <p className="font-semibold text-gray-900 leading-relaxed mb-5" style={{ fontSize: 'clamp(16px,2.5vw,20px)' }}>
            Grebeg Suro bukan sekadar upacara tradisional, tetapi juga simbol persatuan, doa bersama, dan komitmen masyarakat Ponorogo untuk menjaga warisan leluhur sambil melangkah maju ke masa depan.
          </p>
          <p className="text-gray-400 font-semibold text-[13px] tracking-widest">— Tokoh Budaya Ponorogo</p>
        </div>
      </section>

      {/* ══ 6. CTA ══ */}
      <CTASection />

    </div>
  )
}