import React from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import dayjs from 'dayjs'

export default function JadwalPage() {
  const [events, setEvents] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState('all')

  React.useEffect(() => {
    async function loadEvents() {
      try {
        const res = await api.get('/events')
        setEvents(res.data || [])
      } catch (error) {
        console.error('Error loading events:', error)
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [])

  const now = dayjs()
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return event.start_time && dayjs(event.start_time).isAfter(now)
    if (filter === 'past') return event.end_time && dayjs(event.end_time).isBefore(now)
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-red-800 text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Jadwal Acara Grebeg Suro</h1>
          <p className="text-xl text-red-100">
            Temukan dan ikuti rangkaian acara lengkap Grebeg Suro yang penuh makna dan budaya
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Buttons */}
          <div className="flex gap-4 mb-8 flex-wrap">
            {['all', 'upcoming', 'past'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  filter === f
                    ? 'bg-red-800 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-800 hover:text-red-800'
                }`}
              >
                {f === 'all' && 'Semua Event'}
                {f === 'upcoming' && 'Akan Datang'}
                {f === 'past' && 'Selesai'}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Memuat jadwal acara...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <div className="text-6xl mb-4 opacity-50">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Event</h3>
              <p className="text-gray-600">Saat ini belum ada jadwal event yang tersedia. Silakan cek kembali nanti atau hubungi admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {filteredEvents.map(event => {
                const startTime = event.start_time ? dayjs(event.start_time) : null
                const endTime = event.end_time ? dayjs(event.end_time) : null
                const isUpcoming = startTime && startTime.isAfter(now)
                const isPast = endTime && endTime.isBefore(now)
                
                return (
                  <div key={event.id} className="bg-white rounded-lg shadow hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                    {/* Badge */}
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                      {isPast && <span className="px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded">Selesai</span>}
                      {isUpcoming && <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded">Akan Datang</span>}
                      {!isPast && !isUpcoming && <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded">Berlangsung</span>}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{event.name}</h3>
                      
                      {event.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                      )}
                      
                      <div className="space-y-3 mb-6">
                        {startTime && (
                          <div className="text-sm">
                            <p className="text-gray-500 font-medium">Tanggal & Waktu</p>
                            <p className="text-gray-900 font-semibold">{startTime.format('DD MMM YYYY, HH:mm')} WIB</p>
                            {endTime && (
                              <p className="text-gray-600 text-xs">s/d {endTime.format('DD MMM YYYY, HH:mm')} WIB</p>
                            )}
                          </div>
                        )}
                        
                        <div className="text-sm">
                          <p className="text-gray-500 font-medium">Lokasi</p>
                          <p className="text-gray-900 font-semibold font-mono text-xs">{event.lat.toFixed(5)}, {event.lng.toFixed(5)}</p>
                        </div>
                      </div>

                      <Link
                        to={`/map?eventId=${event.id}`}
                        className="w-full block text-center px-4 py-2 bg-red-800 text-white font-medium rounded-lg hover:bg-red-700 hover:shadow-lg active:scale-95 transition-all duration-300"
                      >
                        Lihat di Map
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Main Events */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Acara Utama Grebeg Suro</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  image: 'https://images.unsplash.com/photo-1533461502511-0a882bc1fcc1?w=600&h=400&fit=crop',
                  badge: 'UNGGULAN',
                  title: 'Pertunjukan Reog Ponorogo',
                  time: '08:00 - 12:00 WIB',
                  location: 'Alun-alun Ponorogo'
                },
                {
                  image: 'https://images.unsplash.com/photo-1514991642331-c93f5fabd185?w=600&h=400&fit=crop',
                  badge: 'UNGGULAN',
                  title: 'Festival Grebeg Suro',
                  time: '19:00 - 22:00 WIB',
                  location: 'Panggung Utama'
                },
                {
                  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
                  badge: 'EVENT',
                  title: 'Kirab Pusaka',
                  time: '13:00 - 16:00 WIB',
                  location: 'Kawasan Kota Lama'
                },
                {
                  image: 'https://images.unsplash.com/photo-1496024840928-4c417e47f168?w=600&h=400&fit=crop',
                  badge: 'EVENT',
                  title: 'Pasar Malam Ponorogo',
                  time: '17:00 - 23:00 WIB',
                  location: 'Alun-alun Tengah'
                }
              ].map((event, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transform hover:scale-105 transition-all duration-300 border border-gray-200">
                  <div className="relative h-48 bg-gray-300 overflow-hidden">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                    <div className="absolute top-4 right-4 bg-red-700 text-white text-xs font-bold px-3 py-1 rounded">
                      {event.badge}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{event.title}</h3>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-red-700 font-bold">🕐</span>
                        <span className="text-sm">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-red-700 font-bold">📍</span>
                        <span className="text-sm">{event.location}</span>
                      </div>
                    </div>
                    <button className="w-full bg-red-800 text-white font-semibold py-2 rounded-lg hover:bg-red-700 hover:shadow-lg active:scale-95 transition-all duration-300">
                      Pilih Event sebagai Tujuan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-800 text-white py-12 sm:py-16 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Dampak pada Mobilitas Kota</h2>
            <p className="text-red-100 mb-8 text-lg max-w-3xl mx-auto leading-relaxed">
              Selama acara Grebeg Suro berlangsung, beberapa ruas jalan akan ditutup atau dialihkan. Gunakan aplikasi Rute Suro untuk menemukan jalur alternatif dan menghindari kemacetan.
            </p>
            <Link to="/map" className="inline-block px-8 py-3 bg-white text-red-800 font-bold rounded-lg hover:bg-red-50 hover:shadow-lg active:scale-95 transition-all duration-300">
              Cek Rute Alternatif
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
