'use client';

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
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Jadwal Acara Grebeg Suro</h1>
          <p className="page-subtitle">
            Temukan dan ikuti rangkaian acara lengkap Grebeg Suro yang penuh makna dan budaya
          </p>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          {/* Filter */}
          <div className="jadwal-filter">
            <button 
              className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('all')}
            >
              Semua Event
            </button>
            <button 
              className={filter === 'upcoming' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('upcoming')}
            >
              Akan Datang
            </button>
            <button 
              className={filter === 'past' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('past')}
            >
              Selesai
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Memuat jadwal acara...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaCalendar style={{ fontSize: '4rem', opacity: 0.5 }} />
              </div>
              <h3 className="empty-title">Belum Ada Event</h3>
              <p className="empty-description">
                Saat ini belum ada jadwal event yang tersedia. 
                Silakan cek kembali nanti atau hubungi admin.
              </p>
            </div>
          ) : (
            <div className="jadwal-grid">
              {filteredEvents.map(event => {
                const startTime = event.start_time ? dayjs(event.start_time) : null
                const endTime = event.end_time ? dayjs(event.end_time) : null
                const isUpcoming = startTime && startTime.isAfter(now)
                const isPast = endTime && endTime.isBefore(now)
                
                return (
                  <div key={event.id} className="jadwal-card">
                    <div className="jadwal-card-header">
                      {isPast && <span className="jadwal-badge past">Selesai</span>}
                      {isUpcoming && <span className="jadwal-badge upcoming">Akan Datang</span>}
                      {!isPast && !isUpcoming && <span className="jadwal-badge ongoing">Berlangsung</span>}
                    </div>
                    
                    <div className="jadwal-card-body">
                      <h3 className="jadwal-event-title">{event.name}</h3>
                      
                      {event.description && (
                        <p className="jadwal-event-description">{event.description}</p>
                      )}
                      
                      <div className="jadwal-details">
                        {startTime && (
                          <div className="jadwal-detail-item">
                            <div className="jadwal-detail-icon">
                              <FaCalendar />
                            </div>
                            <div>
                              <div className="jadwal-detail-label">Tanggal & Waktu</div>
                              <div className="jadwal-detail-value">
                                {startTime.format('DD MMMM YYYY, HH:mm')} WIB
                              </div>
                              {endTime && (
                                <div className="jadwal-detail-value small">
                                  s/d {endTime.format('DD MMMM YYYY, HH:mm')} WIB
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="jadwal-detail-item">
                          <div className="jadwal-detail-icon">
                            <FaMapMarkerAlt />
                          </div>
                          <div>
                            <div className="jadwal-detail-label">Lokasi</div>
                            <div className="jadwal-detail-value">
                              {event.lat.toFixed(5)}, {event.lng.toFixed(5)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="jadwal-card-footer">
                      <Link 
                        to={`/map?eventId=${event.id}`} 
                        className="jadwal-btn-primary"
                      >
                        Lihat di Map
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Info Acara Utama */}
          <div className="main-events-section">
            <h2 className="section-title">Acara Utama Grebeg Suro</h2>
            
            <div className="main-events-grid">
              <div className="main-event-card">
                <div className="main-event-icon">
                  <FaLandmark />
                </div>
                <h3 className="main-event-title">Kirab Pusaka</h3>
                <p className="main-event-time">08:00 - 12:00 WIB</p>
                <p className="main-event-description">
                  Prosesi kirab pusaka keliling kota yang dimulai dari Alun-alun Ponorogo 
                  dengan melibatkan ratusan peserta dalam busana adat tradisional.
                </p>
                <div className="main-event-location">
                  <FaMapMarkerAlt className="location-icon" />
                  Alun-alun Ponorogo &rarr; Jalan Raya Ponorogo
                </div>
              </div>

              <div className="main-event-card">
                <div className="main-event-icon">
                  <FaMusic />
                </div>
                <h3 className="main-event-title">Pertunjukan Reog Ponorogo</h3>
                <p className="main-event-time">13:00 - 16:00 WIB</p>
                <p className="main-event-description">
                  Pementasan seni tari Reog Ponorogo oleh berbagai paguyuban dengan 
                  menampilkan atraksi barongan yang memukau dan penuh makna filosofis.
                </p>
                <div className="main-event-location">
                  <FaMapMarkerAlt className="location-icon" />
                  Pendopo Kabupaten Ponorogo
                </div>
              </div>

              <div className="main-event-card">
                <div className="main-event-icon">
                  <FaShoppingBag />
                </div>
                <h3 className="main-event-title">Festival Grebeg Suro</h3>
                <p className="main-event-time">18:00 - 22:00 WIB</p>
                <p className="main-event-description">
                  Festival budaya dengan bazaar kuliner khas Ponorogo, pameran kerajinan 
                  lokal, dan pertunjukan seni tradisional yang menghibur pengunjung.
                </p>
                <div className="main-event-location">
                  <FaMapMarkerAlt className="location-icon" />
                  Area Alun-alun Ponorogo
                </div>
              </div>

              <div className="main-event-card">
                <div className="main-event-icon">
                  <FaShoppingBag />
                </div>
                <h3 className="main-event-title">Pasar Malam Ponorogo</h3>
                <p className="main-event-time">17:00 - 23:00 WIB</p>
                <p className="main-event-description">
                  Pasar malam dengan berbagai wahana permainan, kuliner street food, dan 
                  hiburan keluarga yang meriah sepanjang minggu acara Grebeg Suro.
                </p>
                <div className="main-event-location">
                  <FaMapMarkerAlt className="location-icon" />
                  Lapangan Terbuka Ponorogo
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="jadwal-cta">
            <div className="jadwal-cta-content">
              <h2 className="jadwal-cta-title">Dampak pada Mobilitas Kota</h2>
              <p className="jadwal-cta-description">
                Selama acara Grebeg Suro berlangsung, beberapa ruas jalan akan ditutup 
                atau dialihkan. Gunakan aplikasi Rute Suro untuk menemukan jalur alternatif 
                dan menghindari kemacetan.
              </p>
              <Link to="/map" className="btn-primary">
                Cek Rute Alternatif
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}