import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function HeroSection() {
  const [pathNodes, setPathNodes] = useState([])

  useEffect(() => {
    setTimeout(() => {
      const nodes = [
        { x: 15, y: 15, label: 'A' },
        { x: 35, y: 30, label: '1' },
        { x: 55, y: 45, label: '2' },
        { x: 75, y: 65, label: '3' },
        { x: 85, y: 85, label: 'B' }
      ]
      setPathNodes(nodes)
    }, 500)
  }, [])

  return (
    <section className="min-h-screen bg-red-800 text-white relative overflow-hidden pt-20 flex items-center scroll-mt-16">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes drawLine {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes pulseDot {
          0%, 100% { r: 6; opacity: 1; }
          50% { r: 10; opacity: 0.6; }
        }
        @keyframes glowNode {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(220, 38, 38, 0.6)); }
          50% { filter: drop-shadow(0 0 8px rgba(220, 38, 38, 0.9)); }
        }
        .hero-title { animation: fadeInUp 0.6s ease-out 0.1s backwards; }
        .hero-subtitle { animation: fadeInUp 0.6s ease-out 0.2s backwards; }
        .hero-buttons { animation: fadeInUp 0.6s ease-out 0.3s backwards; }
        .hero-visual { animation: fadeInUp 0.6s ease-out 0.4s backwards; }
        .path-line { animation: drawLine 0.8s ease-out forwards; transform-origin: left; }
        .path-node { 
          opacity: 0; 
          animation: fadeInUp 0.5s ease-out forwards, glowNode 2s ease-in-out infinite;
          filter: drop-shadow(0 0 4px rgba(220, 38, 38, 0.6));
        }
        .path-node-pulse {
          animation: pulseDot 2s ease-in-out infinite !important;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="hero-title">
              <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 text-white">
                RUTE SURO
              </h1>
              <p className="text-xl font-bold text-red-200 mb-4">Optimasi Jalur Budaya Ponorogo</p>
            </div>

            <p className="hero-subtitle text-base md:text-lg opacity-90 mb-8 leading-relaxed max-w-md">
              Navigasi cerdas menggunakan algoritma A* untuk memastikan perjalanan Grebeg Suro berjalan lancar, efisien, dan tepat sesuai kebutuhan masyarakat.
            </p>

            <div className="hero-buttons flex flex-col sm:flex-row gap-4">
              <Link to="/map" className="px-8 py-3 bg-white text-red-700 font-bold rounded btn-primary-hover hover:shadow-lg hover:bg-gray-50 inline-block text-center">
                Mulai Optimasi
              </Link>
              <Link to="/jadwal" className="px-8 py-3 btn-red-outline rounded inline-block text-center">
                Lihat Jadwal
              </Link>
            </div>
          </div>

          <div className="hero-visual relative hidden md:flex md:justify-center">
            <div className="relative w-80 h-80 bg-white rounded-2xl shadow-2xl p-6 flex-shrink-0">
              <div className="absolute top-8 left-8 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg">
                A
              </div>
              <div className="absolute bottom-8 right-8 w-8 h-8 bg-red-900 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg">
                B
              </div>

              <svg width="100%" height="100%" className="absolute top-0 left-0" style={{pointerEvents: 'none'}}>
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#dc2626', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#991b1b', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                <line x1="24%" y1="24%" x2="76%" y2="76%" stroke="url(#pathGradient)" strokeWidth="2.5" className="path-line" style={{animationDelay: '0.5s'}} />
                {pathNodes.map((node, idx) => (
                  <g key={idx}>
                    <circle cx={`${node.x}%`} cy={`${node.y}%`} r="6" fill="none" stroke="#dc2626" strokeWidth="1.5" opacity="0.3" className="path-node-pulse" style={{animationDelay: `${0.6 + idx * 0.1}s`}} />
                    <circle cx={`${node.x}%`} cy={`${node.y}%`} r="4" fill="#fca5a5" className="path-node" style={{animationDelay: `${0.6 + idx * 0.1}s`}} />
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
