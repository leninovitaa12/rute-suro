import React from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import dayjs from 'dayjs'
import { FaCalendar, FaMapMarkerAlt, FaLandmark, FaMusic, FaShoppingBag } from 'react-icons/fa'

export default function JadwalPage() {
  const [events, setEvents] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState('all') // all, upcoming, past

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
    if (filter === 'upcoming') {
      return event.start_time && dayjs(event.start_time).isAfter(now)
    }
    if (filter === 'past') {
      return event.end_time && dayjs(event.end_time).isBefore(now)
    }
    return true
  })

  return (
    <div className="page">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Jadwal Acara Grebeg Suro</h1>
          <p className="text-lg text-white/95 leading-7">
            Temukan dan ikuti rangkaian acara lengkap Grebeg Suro yang penuh makna dan budaya
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {/* Filter */}
          <div className="flex gap-3 mb-8 justify-center flex-wrap">
            <button 
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'btn' : 'btn secondary'}
            >
              Semua Event
            </button>
            <button 
              onClick={() => setFilter('upcoming')}
              className={filter === 'upcoming' ? 'btn' : 'btn secondary'}
            >
              Akan Datang
            </button>
            <button 
              onClick={() => setFilter('past')}
              className={filter === 'past' ? 'btn' : 'btn secondary'}
            >
              Selesai
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-text-secondary">Memuat jadwal acara...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl opacity-50 mb-4">
                <FaCalendar />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Belum Ada Event</h3>
              <p className="text-text-secondary text-center">
                Saat ini belum ada jadwal event yang tersedia. 
                Silakan cek kembali nanti atau hubungi admin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredEvents.map(event => {
                const startTime = event.start_time ? dayjs(event.start_time) : null
                const endTime = event.end_time ? dayjs(event.end_time) : null
                const isUpcoming = startTime && startTime.isAfter(now)
                const isPast = endTime && endTime.isBefore(now)
                
                return (
                  <div key={event.id} className="bg-white border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary">
                    <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4">
                      {isPast && <span className="inline-block px-3 py-1 bg-white/30 rounded-full text-xs font-semibold">Selesai</span>}
                      {isUpcoming && <span className="inline-block px-3 py-1 bg-white/30 rounded-full text-xs font-semibold">Akan Datang</span>}
                      {!isPast && !isUpcoming && <span className="inline-block px-3 py-1 bg-white/30 rounded-full text-xs font-semibold">Berlangsung</span>}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-text-primary mb-3">{event.name}</h3>
                      
                      {event.description && (
                        <p className="text-text-secondary text-sm mb-4 line-clamp-2">{event.description}</p>
                      )}
                      
                      <div className="space-y-3 mb-4">
                        {startTime && (
                          <div className="flex gap-2">
                            <div className="text-primary text-lg flex-shrink-0">
                              <FaCalendar />
                            </div>
                            <div>
                              <div className="text-xs text-text-secondary font-semibold">Tanggal & Waktu</div>
                              <div className="text-sm text-text-primary font-medium">
                                {startTime.format('DD MMMM YYYY, HH:mm')} WIB
                              </div>
                              {endTime && (
                                <div className="text-xs text-text-secondary">
                                  s/d {endTime.format('DD MMMM YYYY, HH:mm')} WIB
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <div className="text-primary text-lg flex-shrink-0">
                            <FaMapMarkerAlt />
                          </div>
                          <div>
                            <div className="text-xs text-text-secondary font-semibold">Lokasi</div>
                            <div className="text-sm text-text-primary font-medium">
                              {event.lat.toFixed(5)}, {event.lng.toFixed(5)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-border p-4">
                      <Link 
                        to={`/map?eventId=${event.id}`} 
                        className="block w-full px-4 py-2 bg-primary text-white text-center rounded-lg font-semibold transition-all duration-300 hover:bg-primary-dark"
                      >
                        Lihat di Map
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Main Events Section */}
          <div className="mt-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-8 text-center">Acara Utama Grebeg Suro</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-secondary p-6 rounded-2xl border border-border transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                <div className="text-4xl text-primary mb-4">
                  <FaLandmark />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Kirab Pusaka</h3>
                <p className="text-text-secondary font-semibold mb-2">08:00 - 12:00 WIB</p>
                <p className="text-text-secondary text-sm mb-4 leading-6">
                  Prosesi kirab pusaka keliling kota yang dimulai dari Alun-alun Ponorogo 
                  dengan melibatkan ratusan peserta dalam busana adat tradisional.
                </p>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <FaMapMarkerAlt className="text-primary flex-shrink-0 mt-0.5" />
                  <span>Alun-alun Ponorogo → Jalan Raya Ponorogo</span>
                </div>
              </div>

              <div className="bg-secondary p-6 rounded-2xl border border-border transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                <div className="text-4xl text-primary mb-4">
                  <FaMusic />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Pertunjukan Reog Ponorogo</h3>
                <p className="text-text-secondary font-semibold mb-2">13:00 - 16:00 WIB</p>
                <p className="text-text-secondary text-sm mb-4 leading-6">
                  Pementasan seni tari Reog Ponorogo oleh berbagai paguyuban dengan 
                  menampilkan atraksi barongan yang memukau dan penuh makna filosofis.
                </p>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <FaMapMarkerAlt className="text-primary flex-shrink-0 mt-0.5" />
                  <span>Pendopo Kabupaten Ponorogo</span>
                </div>
              </div>

              <div className="bg-secondary p-6 rounded-2xl border border-border transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                <div className="text-4xl text-primary mb-4">
                  <FaShoppingBag />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Festival Grebeg Suro</h3>
                <p className="text-text-secondary font-semibold mb-2">18:00 - 22:00 WIB</p>
                <p className="text-text-secondary text-sm mb-4 leading-6">
                  Festival budaya dengan bazaar kuliner khas Ponorogo, pameran kerajinan 
                  lokal, dan pertunjukan seni tradisional yang menghibur pengunjung.
                </p>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <FaMapMarkerAlt className="text-primary flex-shrink-0 mt-0.5" />
                  <span>Area Alun-alun Ponorogo</span>
                </div>
              </div>

              <div className="bg-secondary p-6 rounded-2xl border border-border transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                <div className="text-4xl text-primary mb-4">
                  <FaShoppingBag />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Pasar Malam Ponorogo</h3>
                <p className="text-text-secondary font-semibold mb-2">17:00 - 23:00 WIB</p>
                <p className="text-text-secondary text-sm mb-4 leading-6">
                  Pasar malam dengan berbagai wahana permainan, kuliner street food, dan 
                  hiburan keluarga yang meriah sepanjang minggu acara Grebeg Suro.
                </p>
                <div className="flex items-start gap-2 text-sm text-text-secondary">
                  <FaMapMarkerAlt className="text-primary flex-shrink-0 mt-0.5" />
                  <span>Lapangan Terbuka Ponorogo</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Dampak pada Mobilitas Kota</h2>
            <p className="text-lg text-white/95 mb-8 leading-7 max-w-2xl mx-auto">
              Selama acara Grebeg Suro berlangsung, beberapa ruas jalan akan ditutup 
              atau dialihkan. Gunakan aplikasi Rute Suro untuk menemukan jalur alternatif 
              dan menghindari kemacetan.
            </p>
            <Link to="/map" className="inline-block px-7 py-3.5 bg-white text-primary rounded-lg font-bold transition-all duration-300 hover:-translate-y-0.75 hover:shadow-2xl">
              Cek Rute Alternatif
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
