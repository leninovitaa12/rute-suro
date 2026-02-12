import React from 'react'
import { FaLightbulb, FaMap, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa'

export default function TentangPage() {
  return (
    <div className="page">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Tentang Aplikasi Rute Suro</h1>
          <p className="text-lg text-white/95 leading-7">
            Solusi teknologi canggih untuk mendukung kelancaran tradisi budaya di Ponorogo
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-8">Cara Kerja Singkat</h2>
              
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">1</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Pilih Lokasi</h3>
                    <p className="text-text-secondary leading-6">
                      Anda dapat menentukan titik awal dan tujuan dengan cara klik langsung 
                      di peta interaktif atau memilih dari daftar event yang tersedia. 
                      Sistem akan menandai lokasi Anda dengan marker yang jelas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">2</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Pilih Metode Transportasi</h3>
                    <p className="text-text-secondary leading-6">
                      Tentukan preferensi transportasi Anda: jalan kaki, sepeda motor, 
                      mobil, atau transportasi umum. Setiap metode memiliki perhitungan 
                      waktu dan rute yang berbeda untuk kenyamanan maksimal.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">3</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Sistem Menghitung Rute</h3>
                    <p className="text-text-secondary leading-6">
                      Algoritma A* kami menganalisis semua kemungkinan jalur dengan 
                      mempertimbangkan jarak, waktu tempuh, kondisi lalu lintas real-time, 
                      dan penutupan jalan untuk memberikan rute paling optimal.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">4</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Ikuti Panduan Navigasi</h3>
                    <p className="text-text-secondary leading-6">
                      Rute ditampilkan dengan jelas di peta beserta estimasi waktu perjalanan. 
                      Ikuti panduan step-by-step untuk mencapai tujuan Anda dengan lancar 
                      dan efisien.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-8 p-6 bg-secondary border-l-4 border-primary rounded-lg">
                <h3 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                  <FaLightbulb className="text-primary" />
                  Kenapa Menggunakan Algoritma A*?
                </h3>
                <p className="text-text-secondary leading-6">
                  Algoritma A* adalah salah satu algoritma pencarian jalur terbaik yang 
                  menggabungkan kecepatan dan akurasi. Algoritma ini menggunakan heuristic 
                  function untuk memprediksi jarak ke tujuan, sehingga dapat menemukan 
                  rute optimal lebih cepat daripada algoritma tradisional seperti Dijkstra.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Features Card */}
              <div className="bg-white border border-border rounded-2xl p-6">
                <h3 className="text-xl font-bold text-text-primary mb-4">Fitur Unggulan</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="text-primary text-xl flex-shrink-0">
                      <FaLightbulb />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary mb-1">Algoritma A*</h4>
                      <p className="text-sm text-text-secondary">
                        Perhitungan rute tercepat dengan akurasi tinggi
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="text-primary text-xl flex-shrink-0">
                      <FaMap />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary mb-1">Peta Interaktif</h4>
                      <p className="text-sm text-text-secondary">
                        Visualisasi real-time dengan tampilan yang intuitif
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="text-primary text-xl flex-shrink-0">
                      <FaExclamationTriangle />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary mb-1">Real-time Traffic</h4>
                      <p className="text-sm text-text-secondary">
                        Informasi lalu lintas langsung dan akurat
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="text-primary text-xl flex-shrink-0">
                      <FaLightbulb />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary mb-1">Event Integration</h4>
                      <p className="text-sm text-text-secondary">
                        Terintegrasi dengan jadwal Grebeg Suro
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="text-primary text-xl flex-shrink-0">
                      <FaShieldAlt />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary mb-1">Admin Panel</h4>
                      <p className="text-sm text-text-secondary">
                        Manajemen event dan rekayasa lalu lintas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tech Tags Card */}
              <div className="bg-white border border-border rounded-2xl p-6">
                <h3 className="text-xl font-bold text-text-primary mb-4">Teknologi</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Leaflet', 'A* Algorithm', 'OpenStreetMap', 'Real-time Data', 'Supabase'].map(tech => (
                    <span key={tech} className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-secondary">
        <div className="container">
          <h2 className="text-4xl font-bold text-text-primary mb-12 text-center">Pertanyaan Umum (FAQ)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: 'Apakah data rute akurat?',
                a: 'Ya, sistem kami menggunakan data dari OpenStreetMap yang terus diperbarui dan dikombinasikan dengan algoritma A* untuk memberikan rute paling akurat dan efisien berdasarkan kondisi aktual.'
              },
              {
                q: 'Seberapa akurat estimasi waktu perjalanan?',
                a: 'Estimasi waktu dihitung berdasarkan jarak, kondisi jalan, dan data traffic real-time. Akurasi mencapai 85-90% tergantung kondisi lalu lintas yang dapat berubah sewaktu-waktu.'
              },
              {
                q: 'Apakah sistem dapat menghindari jalan yang ditutup?',
                a: 'Tentu! Sistem secara otomatis mendeteksi dan menghindari jalan yang ditutup akibat acara atau rekayasa lalu lintas. Admin dapat mengelola penutupan jalan melalui dashboard khusus.'
              },
              {
                q: 'Bagaimana cara mengakses info jadwal acara?',
                a: 'Anda dapat mengakses jadwal lengkap acara Grebeg Suro melalui menu "Jadwal" di navigasi atas. Informasi mencakup waktu, lokasi, dan detail setiap acara.'
              },
              {
                q: 'Apakah bisa digunakan offline?',
                a: 'Saat ini aplikasi memerlukan koneksi internet untuk mengakses data peta dan traffic real-time. Fitur offline sedang dalam pengembangan untuk versi mendatang.'
              },
              {
                q: 'Siapa yang dapat mengakses Admin Panel?',
                a: 'Admin Panel hanya dapat diakses oleh petugas berwenang dari Pemerintah Kabupaten Ponorogo yang memiliki kredensial login khusus untuk mengelola event dan rekayasa lalu lintas.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg border border-border">
                <h3 className="font-bold text-text-primary mb-2">{item.q}</h3>
                <p className="text-text-secondary text-sm leading-6">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
