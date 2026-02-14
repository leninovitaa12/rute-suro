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
    <section className="min-h-screen bg-red-800 text-white relative overflow-hidden pt-20 flex items-center">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes drawLine {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .hero-title { animation: fadeInUp 0.6s ease-out 0.1s backwards; }
        .hero-subtitle { animation: fadeInUp 0.6s ease-out 0.2s backwards; }
        .hero-buttons { animation: fadeInUp 0.6s ease-out 0.3s backwards; }
        .hero-visual { animation: fadeInUp 0.6s ease-out 0.4s backwards; }
        .path-line { animation: drawLine 0.6s ease-out forwards; transform-origin: left; }
        .path-node { opacity: 0; animation: fadeInUp 0.4s ease-out forwards; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 md:px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="hero-title">
              <h1 className="text-6xl md:text-7xl font-black leading-tight mb-6 text-white">
                RUTE SURO
              </h1>
              <p className="text-2xl font-bold text-red-200 mb-4">Optimasi Jalur Budaya Ponorogo</p>
            </div>

            <p className="hero-subtitle text-lg md:text-lg opacity-90 mb-8 leading-relaxed max-w-md">
              Navigasi cerdas menggunakan algoritma A* untuk memastikan perjalanan Grebeg Suro berjalan lancar, efisien, dan tepat sesuai kebutuhan masyarakat.
            </p>

            <div className="hero-buttons flex flex-col sm:flex-row gap-4">
              <Link to="/map" className="px-8 py-3 bg-white text-red-700 font-bold rounded hover:shadow-lg transition-all duration-300 inline-block text-center">
                Mulai Optimasi
              </Link>
              <Link to="/jadwal" className="px-8 py-3 bg-transparent text-white font-bold border-2 border-white rounded hover:bg-white hover:text-red-700 transition-all duration-300 inline-block text-center">
                Lihat Jadwal
              </Link>
            </div>
          </div>

          <div className="hero-visual relative hidden md:block">
            <div className="relative w-full aspect-square bg-white rounded-2xl shadow-2xl p-8">
              <div className="absolute top-10 left-10 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                A
              </div>
              <div className="absolute bottom-10 right-10 w-10 h-10 bg-red-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                B
              </div>

              <svg width="100%" height="100%" className="absolute top-0 left-0" style={{pointerEvents: 'none'}}>
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#dc2626', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#991b1b', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                <line x1="24%" y1="24%" x2="76%" y2="76%" stroke="url(#pathGradient)" strokeWidth="3" className="path-line" style={{animationDelay: '0.5s'}} />
                {pathNodes.map((node, idx) => (
                  <circle key={idx} cx={`${node.x}%`} cy={`${node.y}%`} r="5" fill="#fca5a5" className="path-node" style={{animationDelay: `${0.6 + idx * 0.1}s`}} />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
