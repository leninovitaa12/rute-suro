import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTentang } from '../../lib/backendApi'

export default function TentangPage() {
  const [tentangItems, setTentangItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadTentang()
  }, [])

  const loadTentang = async () => {
    try {
      setLoading(true)
      const data = await getTentang()
      setTentangItems(data)
    } catch (err) {
      console.error('[v0] Error loading tentang:', err)
      setError('Gagal memuat data tentang')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-red-800 text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Tentang Aplikasi Rute Suro</h1>
          <p className="text-xl text-red-100">
            Solusi teknologi canggih untuk mendukung kelancaran tradisi budaya di Ponorogo
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Memuat data tentang...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-12 text-center">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Konten Tentang Aplikasi</h2>
                
                {tentangItems.length === 0 ? (
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center">
                    <p className="text-gray-600">Belum ada konten tentang</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {tentangItems.map((step) => (
                      <div key={step.id} className="flex gap-6 group">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-red-800 text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-all">
                            {tentangItems.indexOf(step) + 1}
                          </div>
                        </div>
                        <div className="flex-1 transform group-hover:translate-x-1 transition-transform duration-300">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Info Box */}
                {tentangItems.length > 0 && (
                  <div className="mt-12 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg transform hover:translate-x-1 transition-transform duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Tambahan</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Aplikasi Rute Suro dirancang khusus untuk memudahkan pengunjung Grebeg Suro menemukan rute terbaik dengan teknologi navigasi terkini dan algoritma pencarian jalur yang efisien.
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 transform hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Fitur Unggulan</h3>
                  <div className="space-y-4">
                    {[
                      { 
                        title: 'Algoritma A*', 
                        desc: 'Perhitungan rute tercepat dengan akurasi tinggi' 
                      },
                      { 
                        title: 'Peta Interaktif', 
                        desc: 'Visualisasi real-time dengan tampilan yang intuitif' 
                      },
                      { 
                        title: 'Real-time Traffic', 
                        desc: 'Informasi lalu lintas langsung dan akurat' 
                      },
                      { 
                        title: 'Event Integration', 
                        desc: 'Terintegrasi dengan jadwal Grebeg Suro' 
                      },
                      { 
                        title: 'Admin Panel', 
                        desc: 'Manajemen event dan rekayasa lalu lintas' 
                      }
                    ].map((feature, i) => (
                      <div key={i} className="pb-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 p-2 rounded transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-red-800 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm font-bold">{i + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                            <p className="text-sm text-gray-600">{feature.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 transform hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Teknologi</h3>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Leaflet', 'A* Algorithm', 'OpenStreetMap', 'Real-time Data', 'Supabase'].map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full hover:bg-red-200 transition-colors">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-12 sm:py-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Pertanyaan Umum (FAQ)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { q: 'Apakah data rute akurat?', a: 'Ya, sistem kami menggunakan data dari OpenStreetMap yang terus diperbarui dan dikombinasikan dengan algoritma A* untuk memberikan rute paling akurat dan efisien berdasarkan kondisi aktual.' },
              { q: 'Seberapa akurat estimasi waktu perjalanan?', a: 'Estimasi waktu dihitung berdasarkan jarak, kondisi jalan, dan data traffic real-time. Akurasi mencapai 85-90% tergantung kondisi lalu lintas yang dapat berubah sewaktu-waktu.' },
              { q: 'Apakah sistem dapat menghindari jalan yang ditutup?', a: 'Tentu! Sistem secara otomatis mendeteksi dan menghindari jalan yang ditutup akibat acara atau rekayasa lalu lintas. Admin dapat mengelola penutupan jalan melalui dashboard khusus.' },
              { q: 'Bagaimana cara mengakses info jadwal acara?', a: 'Anda dapat mengakses jadwal lengkap acara Grebeg Suro melalui menu "Jadwal" di navigasi atas. Informasi mencakup waktu, lokasi, dan detail setiap acara.' },
              { q: 'Apakah bisa digunakan offline?', a: 'Saat ini aplikasi memerlukan koneksi internet untuk mengakses data peta dan traffic real-time. Fitur offline sedang dalam pengembangan untuk versi mendatang.' },
              { q: 'Siapa yang dapat mengakses Admin Panel?', a: 'Admin Panel hanya dapat diakses oleh petugas berwenang dari Pemerintah Kabupaten Ponorogo yang memiliki kredensial login khusus untuk mengelola event dan rekayasa lalu lintas.' }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-lg hover:shadow-md transform hover:scale-105 transition-all duration-300">
                <h3 className="font-semibold text-gray-900 mb-3">{item.q}</h3>
                <p className="text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-800 text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap untuk Memulai?</h2>
          <p className="text-red-100 mb-8 text-lg">Temukan rute terbaik untuk perjalanan Anda</p>
          <Link to="/map" className="inline-block px-8 py-3 bg-white text-red-800 font-bold rounded-lg btn-primary-hover hover:bg-red-50 hover:shadow-lg">
            Mulai Navigasi
          </Link>
        </div>
      </section>
    </div>
  )
}
