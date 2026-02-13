import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-16 md:py-20 relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-radial-gradient opacity-10 pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center relative z-10">
            {/* Badge */}
            <div className="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-semibold mb-6 border border-white border-opacity-30 hover:bg-opacity-30 hover:scale-105 transition-all duration-300 animate-fade-in">
              POWERED BY A* ALGORITHM
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight animate-fade-in-delay-2">
              RUTE SURO: Optimasi Jalur Budaya Ponorogo
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl opacity-95 mb-8 leading-relaxed animate-fade-in-delay-3">
              Navigasi cerdas menggunakan algoritma A* untuk memastikan 
              perjalanan Grebeg Suro berjalan lancar, efisien, dan tetap khidmat bagi 
              seluruh masyarakat.
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap pt-4">
              <Link to="/map" className="px-8 py-3 bg-white text-red-800 font-bold text-lg rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 inline-block">
                Mulai Optimasi
              </Link>
              <Link to="/jadwal" className="px-8 py-3 bg-transparent text-white font-bold text-lg border-2 border-white rounded-lg hover:bg-white hover:text-red-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 inline-block">
                Lihat Jadwal Acara
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3 transition-all duration-300">
              Fitur Utama Dashboard
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed transition-all duration-300">
              Solusi teknologi canggih untuk mendukung kelancaran tradisi budaya di Ponorogo.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Card 1 */}
            <div className="bg-secondary p-8 rounded-lg border border-border hover:border-primary hover:-translate-y-2 hover:shadow-hover-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-xl font-bold text-text-primary mb-3 transition-colors duration-300 hover:text-primary">
                Optimasi A*
              </h3>
              <p className="text-text-secondary leading-relaxed transition-all duration-300">
                Memanfaatkan data real-time dan algoritma A* untuk menentukan rute 
                terpendek, tercepat, dan paling efisien menuju lokasi Grebeg Suro 
                dengan akurasi tinggi. Sistem menghindari hambatan jalan secara otomatis.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-secondary p-8 rounded-lg border border-border hover:border-primary hover:-translate-y-2 hover:shadow-hover-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-xl font-bold text-text-primary mb-3 transition-colors duration-300 hover:text-primary">
                Trafik Real-time
              </h3>
              <p className="text-text-secondary leading-relaxed transition-all duration-300">
                Integrasi data lalu lintas langsung dan pembaruan kondisi jalan secara 
                real-time. Monitor kemacetan dan jalur alternatif untuk menghindari 
                penundaan perjalanan Anda.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-secondary p-8 rounded-lg border border-border hover:border-primary hover:-translate-y-2 hover:shadow-hover-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-xl font-bold text-text-primary mb-3 transition-colors duration-300 hover:text-primary">
                Acara Budaya
              </h3>
              <p className="text-text-secondary leading-relaxed transition-all duration-300">
                Informasi jadwal dan lokasi lengkap acara Grebeg Suro, kirab pusaka, 
                dan penampilan Reog. Tetap update dengan notifikasi acara terbaru 
                dan perubahan jadwal real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              Siap Menjelajahi Ponorogo?
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              Gunakan sistem navigasi berbasis algoritma kami untuk pengalaman optimal.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-lg border border-border hover:border-primary hover:-translate-y-2 hover:shadow-hover-lg transition-all duration-300 relative overflow-hidden pl-20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/2 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="absolute left-6 top-6 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md hover:scale-115 hover:rotate-5 transition-all duration-300">
                1
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2 transition-colors duration-300 hover:text-primary">
                Pilih Lokasi
              </h3>
              <p className="text-text-secondary leading-relaxed transition-all duration-300">
                Tentukan titik awal dan tujuan Anda di peta interaktif. Bisa klik langsung 
                di peta atau pilih dari daftar acara yang tersedia.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-lg border border-border hover:border-primary hover:-translate-y-2 hover:shadow-hover-lg transition-all duration-300 relative overflow-hidden pl-20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/2 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="absolute left-6 top-6 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md hover:scale-115 hover:rotate-5 transition-all duration-300">
                2
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2 transition-colors duration-300 hover:text-primary">
                Pilih Metode
              </h3>
              <p className="text-text-secondary leading-relaxed transition-all duration-300">
                Pilih preferensi transportasi Anda: jalan kaki, motor, mobil, atau 
                transportasi umum sesuai kebutuhan.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-lg border border-border hover:border-primary hover:-translate-y-2 hover:shadow-hover-lg transition-all duration-300 relative overflow-hidden pl-20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/2 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <div className="absolute left-6 top-6 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md hover:scale-115 hover:rotate-5 transition-all duration-300">
                3
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2 transition-colors duration-300 hover:text-primary">
                Cari Rute Optimal
              </h3>
              <p className="text-text-secondary leading-relaxed transition-all duration-300">
                Algoritma A* kami menganalisis dan menentukan rute terbaik dengan 
                mempertimbangkan jarak, waktu, dan kondisi lalu lintas aktual.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link to="/map" className="inline-block px-10 py-4 bg-primary text-white font-bold text-lg rounded hover:bg-primary-dark hover:shadow-hover-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden btn-ripple">
              Mulai Cari Rute
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
              Fitur Utama
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-secondary p-8 rounded-lg border border-border hover:border-primary hover:-translate-y-2 hover:shadow-hover-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-primary/8 to-transparent transition-all duration-300 hover:top-12 hover:-right-12"></div>
              <div className="inline-block mb-4 text-text-primary hover:scale-120 hover:rotate-minus-5 transition-all duration-300">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 6L28 14H36L30 19L32 27L24 22L16 27L18 19L12 14H20L24 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M24 30V42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3 transition-colors duration-300 hover:text-primary">
                Optimasi Route
              </h3>
              <p className="text-text-secondary leading-relaxed transition-all duration-300">
                Menggunakan data graph dengan algoritma A* untuk menghitung rute 
                tercepat dan terpendek. Sistem otomatis menghindari ruas jalan yang 
                ditutup atau macet.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-secondary p-8 rounded-lg border border-border hover:border-primary hover:-translate-y-2 hover:shadow-hover-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-primary/8 to-transparent transition-all duration-300 hover:top-12 hover:-right-12"></div>
              <div className="inline-block mb-4 text-text-primary hover:scale-120 hover:rotate-minus-5 transition-all duration-300">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M12 32V12H16V32M22 32V8H26V32M32 32V18H36V32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 36H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3 transition-colors duration-300 hover:text-primary">
                Real-time Traffic
              </h3>
              <p className="text-text-secondary leading-relaxed transition-all duration-300">
                Integrasi live traffic updates dan sensor IoT untuk memantau kondisi 
                jalan secara langsung dan memberikan rekomendasi rute alternatif.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-secondary p-8 rounded-lg border border-border hover:border-primary hover:-translate-y-2 hover:shadow-hover-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-primary/8 to-transparent transition-all duration-300 hover:top-12 hover:-right-12"></div>
              <div className="inline-block mb-4 text-text-primary hover:scale-120 hover:rotate-minus-5 transition-all duration-300">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
                  <path d="M24 12V24L32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 24H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M40 24H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3 transition-colors duration-300 hover:text-primary">
                Road Closures
              </h3>
              <p className="text-text-secondary leading-relaxed transition-all duration-300">
                Informasi dan manajemen penutupan jalan akibat kirab atau event khusus. 
                Admin dapat dengan mudah mengatur rekayasa lalu lintas.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-secondary p-8 rounded-lg border border-border hover:border-primary hover:-translate-y-2 hover:shadow-hover-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-primary/8 to-transparent transition-all duration-300 hover:top-12 hover:-right-12"></div>
              <div className="inline-block mb-4 text-text-primary hover:scale-120 hover:rotate-minus-5 transition-all duration-300">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M12 8H36C37.1 8 38 8.9 38 10V40C38 41.1 37.1 42 36 42H12C10.9 42 10 41.1 10 40V10C10 8.9 10.9 8 12 8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M14 12H34V20H14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <line x1="18" y1="26" x2="30" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18" y1="32" x2="30" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3 transition-colors duration-300 hover:text-primary">
                Event Schedules
              </h3>
              <p className="text-text-secondary leading-relaxed transition-all duration-300">
                Kalender lengkap jadwal acara Grebeg Suro. Dapatkan notifikasi dan 
                update terbaru tentang perubahan waktu atau lokasi event.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-primary-dark text-white py-20 md:py-28 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-block px-5 py-2 bg-white bg-opacity-20 rounded-full text-sm font-semibold mb-6 border border-white border-opacity-30 hover:bg-opacity-30 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
              🚀 Teknologi A* untuk Kemudahan Anda
            </div>
            
            {/* Main Heading */}
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-balance">
              Siap Merasakan Rute Budaya Anda?
            </h2>
            
            {/* Subheading */}
            <p className="text-lg md:text-2xl opacity-90 mb-10 leading-relaxed text-balance">
              Manfaatkan teknologi canggih untuk mengoptimalkan perjalanan Anda ke seluruh lokasi acara budaya di Ponorogo dengan efisien dan menyenangkan.
            </p>

            {/* CTA Button - Enhanced */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/map" 
                className="group relative px-12 py-4 bg-white text-primary font-bold text-lg rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden inline-block"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Mulai Eksplorasi Rute
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              
              <Link 
                to="/jadwal" 
                className="group relative px-12 py-4 bg-transparent text-white font-bold text-lg border-2 border-white rounded-lg hover:bg-white hover:text-primary hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  Lihat Jadwal Lengkap
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-col sm:flex-row gap-8 justify-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span>Rute Optimal dengan A*</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span>Real-time Traffic</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📍</span>
                <span>Navigasi Akurat</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
