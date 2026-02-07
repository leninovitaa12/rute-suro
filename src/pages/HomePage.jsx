import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge"> POWERED BY A* ALGORITHM</div>
            <h1 className="hero-title">
              RUTE SURO: Optimasi Jalur Budaya Ponorogo
            </h1>
            <p className="hero-description">
              Navigasi cerdas menggunakan algoritma A* untuk memastikan 
              perjalanan Grebeg Suro berjalan lancar, efisien, dan tetap khidmat bagi 
              seluruh masyarakat.
            </p>
            <div className="hero-actions">
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
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Fitur Utama Dashboard</h2>
            <p className="section-description">
              Solusi teknologi canggih untuk mendukung kelancaran tradisi budaya di Ponorogo.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              {/* <div className="feature-icon">🎯</div> */}
              <h3 className="feature-title">Optimasi A*</h3>
              <p className="feature-description">
                Memanfaatkan data real-time dan algoritma A* untuk menentukan rute 
                terpendek, tercepat, dan paling efisien menuju lokasi Grebeg Suro 
                dengan akurasi tinggi. Sistem menghindari hambatan jalan secara otomatis.
              </p>
            </div>

            <div className="feature-card">
              {/* <div className="feature-icon">💹</div> */}
              <h3 className="feature-title">Trafik Real-time</h3>
              <p className="feature-description">
                Integra si data lalu lintas langsung dan pembaruan kondisi jalan secara 
                real-time. Monitor kemacetan dan jalur alternatif untuk menghindari 
                penundaan perjalanan Anda.
              </p>
            </div>

            <div className="feature-card">
              {/* <div className="feature-icon">🏛️</div> */}
              <h3 className="feature-title">Acara Budaya</h3>
              <p className="feature-description">
                Informasi jadwal dan lokasi lengkap acara Grebeg Suro, kirab pusaka, 
                dan penampilan Reog. Tetap update dengan notifikasi acara terbaru 
                dan perubahan jadwal real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Siap Menjelajahi Ponorogo?</h2>
            <p className="section-description">
              Gunakan sistem navigasi berbasis algoritma kami untuk pengalaman optimal.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              {/* <div className="step-icon">📍</div> */}
              <h3 className="step-title">Pilih Lokasi</h3>
              <p className="step-description">
                Tentukan titik awal dan tujuan Anda di peta interaktif. Bisa klik langsung 
                di peta atau pilih dari daftar acara yang tersedia.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              {/* <div className="step-icon">🗺️</div> */}
              <h3 className="step-title">Pilih Metode</h3>
              <p className="step-description">
                Pilih preferensi transportasi Anda: jalan kaki, motor, mobil, atau 
                transportasi umum sesuai kebutuhan.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              {/* <div className="step-icon">⚡</div> */}
              <h3 className="step-title">Cari Rute Optimal</h3>
              <p className="step-description">
                Algoritma A* kami menganalisis dan menentukan rute terbaik dengan 
                mempertimbangkan jarak, waktu, dan kondisi lalu lintas aktual.
              </p>
            </div>
          </div>

          <div className="cta-section">
            <Link to="/map" className="btn-primary-large">
               Mulai Cari Rute
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="main-features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Fitur Utama</h2>
          </div>

          <div className="main-features-grid">
            <div className="main-feature-item">
              <div className="main-feature-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 6L28 14H36L30 19L32 27L24 22L16 27L18 19L12 14H20L24 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M24 30V42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="main-feature-title">Optimasi Route</h3>
              <p className="main-feature-description">
                Menggunakan data graph dengan algoritma A* untuk menghitung rute 
                tercepat dan terpendek. Sistem otomatis menghindari ruas jalan yang 
                ditutup atau macet.
              </p>
            </div>

            <div className="main-feature-item">
              <div className="main-feature-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M12 32V12H16V32M22 32V8H26V32M32 32V18H36V32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 36H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="main-feature-title">Real-time Traffic</h3>
              <p className="main-feature-description">
                Integrasi live traffic updates dan sensor IoT untuk memantau kondisi 
                jalan secara langsung dan memberikan rekomendasi rute alternatif.
              </p>
            </div>

            <div className="main-feature-item">
              <div className="main-feature-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
                  <path d="M24 12V24L32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 24H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M40 24H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="main-feature-title">Road Closures</h3>
              <p className="main-feature-description">
                Informasi dan manajemen penutupan jalan akibat kirab atau event khusus. 
                Admin dapat dengan mudah mengatur rekayasa lalu lintas.
              </p>
            </div>

            <div className="main-feature-item">
              <div className="main-feature-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M12 8H36C37.1 8 38 8.9 38 10V40C38 41.1 37.1 42 36 42H12C10.9 42 10 41.1 10 40V10C10 8.9 10.9 8 12 8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M14 12H34V20H14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <line x1="18" y1="26" x2="30" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18" y1="32" x2="30" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="main-feature-title">Event Schedules</h3>
              <p className="main-feature-description">
                Kalender lengkap jadwal acara Grebeg Suro. Dapatkan notifikasi dan 
                update terbaru tentang perubahan waktu atau lokasi event.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Siap merasakan rute budaya Anda?</h2>
            <p className="cta-description">
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
