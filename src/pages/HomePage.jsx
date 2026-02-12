import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="page">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 radial-gradient pointer-events-none" style={{background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)'}}></div>
        <div className="container">
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-6 border border-white/30 hover:bg-white/30 hover:scale-105 transition-all duration-300">
              POWERED BY A* ALGORITHM
            </div>
            <h1 className="text-5xl font-extrabold leading-tight mb-4 tracking-tight">
              RUTE SURO: Optimasi Jalur Budaya Ponorogo
            </h1>
            <p className="text-xl opacity-95 mb-8 leading-7">
              Navigasi cerdas menggunakan algoritma A* untuk memastikan 
              perjalanan Grebeg Suro berjalan lancar, efisien, dan tetap khidmat bagi 
              seluruh masyarakat.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/map" className="btn-primary">
                Mulai Optimasi
              </Link>
              <Link to="/jadwal" className="btn-secondary">
                Lihat Jadwal Acara
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-5xl font-extrabold text-text-primary mb-3 transition-all duration-300">Fitur Utama Dashboard</h2>
            <p className="text-lg text-text-secondary leading-7 transition-all duration-300">
              Solusi teknologi canggih untuk mendukung kelancaran tradisi budaya di Ponorogo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-secondary p-8 rounded-2xl border border-border transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-primary">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 transition-all duration-500"></div>
              <h3 className="text-2xl font-bold text-text-primary mb-3 transition-all duration-300 hover:text-primary">Optimasi A*</h3>
              <p className="text-text-secondary leading-7 transition-all duration-300">
                Memanfaatkan data real-time dan algoritma A* untuk menentukan rute 
                terpendek, tercepat, dan paling efisien menuju lokasi Grebeg Suro 
                dengan akurasi tinggi. Sistem menghindari hambatan jalan secara otomatis.
              </p>
            </div>

            <div className="bg-secondary p-8 rounded-2xl border border-border transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-primary">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 transition-all duration-500"></div>
              <h3 className="text-2xl font-bold text-text-primary mb-3 transition-all duration-300 hover:text-primary">Trafik Real-time</h3>
              <p className="text-text-secondary leading-7 transition-all duration-300">
                Integrasi data lalu lintas langsung dan pembaruan kondisi jalan secara 
                real-time. Monitor kemacetan dan jalur alternatif untuk menghindari 
                penundaan perjalanan Anda.
              </p>
            </div>

            <div className="bg-secondary p-8 rounded-2xl border border-border transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-primary">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 transition-all duration-500"></div>
              <h3 className="text-2xl font-bold text-text-primary mb-3 transition-all duration-300 hover:text-primary">Acara Budaya</h3>
              <p className="text-text-secondary leading-7 transition-all duration-300">
                Informasi jadwal dan lokasi lengkap acara Grebeg Suro, kirab pusaka, 
                dan penampilan Reog. Tetap update dengan notifikasi acara terbaru 
                dan perubahan jadwal real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-secondary">
        <div className="container">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-5xl font-extrabold text-text-primary mb-3">Siap Menjelajahi Ponorogo?</h2>
            <p className="text-lg text-text-secondary leading-7">
              Gunakan sistem navigasi berbasis algoritma kami untuk pengalaman optimal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-2xl border border-border relative py-8 pl-20 transition-all duration-300 relative overflow-hidden hover:-translate-y-1.5 hover:shadow-lg hover:border-primary">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="absolute left-8 top-8 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 hover:scale-115 hover:rotate-5 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 transition-all duration-300 hover:text-primary">Pilih Lokasi</h3>
              <p className="text-text-secondary leading-7 transition-all duration-300">
                Tentukan titik awal dan tujuan Anda di peta interaktif. Bisa klik langsung 
                di peta atau pilih dari daftar acara yang tersedia.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-border relative py-8 pl-20 transition-all duration-300 relative overflow-hidden hover:-translate-y-1.5 hover:shadow-lg hover:border-primary">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="absolute left-8 top-8 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 hover:scale-115 hover:rotate-5 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 transition-all duration-300 hover:text-primary">Pilih Metode</h3>
              <p className="text-text-secondary leading-7 transition-all duration-300">
                Pilih preferensi transportasi Anda: jalan kaki, motor, mobil, atau 
                transportasi umum sesuai kebutuhan.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-border relative py-8 pl-20 transition-all duration-300 relative overflow-hidden hover:-translate-y-1.5 hover:shadow-lg hover:border-primary">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="absolute left-8 top-8 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 hover:scale-115 hover:rotate-5 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2 transition-all duration-300 hover:text-primary">Cari Rute Optimal</h3>
              <p className="text-text-secondary leading-7 transition-all duration-300">
                Algoritma A* kami menganalisis dan menentukan rute terbaik dengan 
                mempertimbangkan jarak, waktu, dan kondisi lalu lintas aktual.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/map" className="btn-primary-large">
              Mulai Cari Rute
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-5xl font-extrabold text-text-primary mb-3">Fitur Utama</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="p-8 bg-secondary rounded-2xl border border-border transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-primary">
              <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-radial-gradient opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{background: 'radial-gradient(circle, rgba(139, 26, 26, 0.08) 0%, transparent 70%)'}}></div>
              <div className="text-text-secondary mb-4 transition-all duration-300 inline-block hover:scale-120 hover:-rotate-5">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 6L28 14H36L30 19L32 27L24 22L16 27L18 19L12 14H20L24 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M24 30V42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3 transition-all duration-300 hover:text-primary">Optimasi Route</h3>
              <p className="text-text-secondary text-sm leading-6 transition-all duration-300">
                Menggunakan data graph dengan algoritma A* untuk menghitung rute 
                tercepat dan terpendek.
              </p>
            </div>

            <div className="p-8 bg-secondary rounded-2xl border border-border transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-primary">
              <div className="text-text-secondary mb-4 transition-all duration-300 inline-block hover:scale-120 hover:-rotate-5">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M12 32V12H16V32M22 32V8H26V32M32 32V18H36V32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 36H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3 transition-all duration-300 hover:text-primary">Real-time Traffic</h3>
              <p className="text-text-secondary text-sm leading-6 transition-all duration-300">
                Integrasi live traffic updates dan sensor IoT untuk memantau kondisi jalan.
              </p>
            </div>

            <div className="p-8 bg-secondary rounded-2xl border border-border transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-primary">
              <div className="text-text-secondary mb-4 transition-all duration-300 inline-block hover:scale-120 hover:-rotate-5">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
                  <path d="M24 12V24L32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 24H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M40 24H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3 transition-all duration-300 hover:text-primary">Road Closures</h3>
              <p className="text-text-secondary text-sm leading-6 transition-all duration-300">
                Informasi dan manajemen penutupan jalan akibat kirab atau event khusus.
              </p>
            </div>

            <div className="p-8 bg-secondary rounded-2xl border border-border transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-primary">
              <div className="text-text-secondary mb-4 transition-all duration-300 inline-block hover:scale-120 hover:-rotate-5">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M12 8H36C37.1 8 38 8.9 38 10V40C38 41.1 37.1 42 36 42H12C10.9 42 10 41.1 10 40V10C10 8.9 10.9 8 12 8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M14 12H34V20H14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <line x1="18" y1="26" x2="30" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18" y1="32" x2="30" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3 transition-all duration-300 hover:text-primary">Event Schedules</h3>
              <p className="text-text-secondary text-sm leading-6 transition-all duration-300">
                Kalender lengkap jadwal acara Grebeg Suro dengan notifikasi real-time.
              </p>
            </div>

            <div className="p-8 bg-secondary rounded-2xl border border-border transition-all duration-300 relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:border-primary">
              <div className="text-text-secondary mb-4 transition-all duration-300 inline-block hover:scale-120 hover:-rotate-5">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M12 8H36C37.1 8 38 8.9 38 10V40C38 41.1 37.1 42 36 42H12C10.9 42 10 41.1 10 40V10C10 8.9 10.9 8 12 8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M14 12H34V20H14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3 transition-all duration-300 hover:text-primary">Admin Panel</h3>
              <p className="text-text-secondary text-sm leading-6 transition-all duration-300">
                Manajemen event dan rekayasa lalu lintas untuk admin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)'}}></div>
        <div className="container">
          <div className="text-center max-w-2xl mx-auto relative z-10">
            <h2 className="text-5xl font-extrabold mb-4 tracking-tight transition-all duration-300">
              Siap merasakan rute budaya Anda?
            </h2>
            <p className="text-lg opacity-95 mb-8 leading-7 transition-all duration-300">
              Manfaatkan teknologi canggih untuk mengoptimalkan perjalanan Anda ke 
              seluruh lokasi acara budaya di Ponorogo.
            </p>
            <Link to="/map" className="btn-cta">
              Cari Rute Sekarang
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
