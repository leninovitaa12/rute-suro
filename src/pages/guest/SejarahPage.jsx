import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getSejarah } from "../../lib/backendApi"

export default function SejarahPage() {
  const [sejarahItems, setSejarahItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadSejarah()
  }, [])

  const loadSejarah = async () => {
    try {
      setLoading(true)
      const data = await getSejarah()
      setSejarahItems(data)
    } catch (err) {
      console.error('[v0] Error loading sejarah:', err)
      setError('Gagal memuat data sejarah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-red-800 text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Sejarah & Tradisi Event</h1>
          <p className="text-xl text-red-100">
            Menyelami lebih dalam tradisi dan warisan budaya Grebeg Suro yang kaya akan makna dan sejarah
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Memuat data sejarah...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-12 text-center">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : sejarahItems.length === 0 ? (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 mb-12 text-center">
              <p className="text-gray-600">Belum ada konten sejarah</p>
            </div>
          ) : (
            <div className="space-y-12">
              {sejarahItems.map((item, idx) => (
                <div key={item.id}>
                  {idx === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                      <div className="bg-gradient-to-br from-red-700 to-red-800 rounded-lg h-64 flex items-center justify-center text-white shadow-lg">
                        <div className="text-center">
                          <div className="text-6xl font-bold opacity-30 mb-2">KP</div>
                          <p className="font-semibold text-lg">{item.title}</p>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">{item.title}</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Timeline - From Database Items */}
          {!loading && !error && sejarahItems.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Konten Sejarah</h2>
              <div className="space-y-8">
                {sejarahItems.map((item, idx) => (
                  <div key={item.id} className="flex gap-6 transform transition-transform hover:translate-x-1 duration-300">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-800 text-white font-bold shadow-md">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 pb-8 border-l-2 border-gray-300 last:border-l-0 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quote */}
          {!loading && !error && sejarahItems.length > 0 && (
            <div className="mt-16 bg-gradient-to-r from-red-800 to-red-700 text-white rounded-lg p-8 sm:p-12 text-center shadow-lg transform hover:scale-105 transition-all duration-300">
              <p className="text-2xl font-semibold mb-4 leading-relaxed">
                "Grebeg Suro bukan sekadar upacara tradisional, tetapi juga simbol persatuan, doa bersama, dan komitmen masyarakat Ponorogo untuk menjaga warisan leluhur sambil melangkah maju ke masa depan."
              </p>
              <p className="text-red-100">— Tokoh Budaya Ponorogo</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-100 py-12 sm:py-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ingin Melihat Jadwal Lengkap?</h2>
          <p className="text-gray-600 mb-8 text-lg">Temukan semua jadwal acara Grebeg Suro dan rencanakan kunjungan Anda</p>
          <Link to="/jadwal" className="inline-block px-8 py-3 btn-red rounded-lg">
            Lihat Jadwal Event
          </Link>
        </div>
      </section>
    </div>
  )
}
