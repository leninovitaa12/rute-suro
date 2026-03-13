import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getEvents, getClosures, getSejarah, getTentang, getParkingSpots } from '../../lib/backendApi'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalEvents:    null,
    activeClosures: null,
    totalSejarah:   null,
    totalTentang:   null,
    totalParking:   null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [events, closures, sejarah, tentang, parking] = await Promise.allSettled([
          getEvents(),
          getClosures(false),
          getSejarah(),
          getTentang(),
          getParkingSpots(),
        ])
        setStats({
          totalEvents:    events.status   === 'fulfilled' ? (events.value?.length   ?? 0) : 0,
          activeClosures: closures.status === 'fulfilled' ? (closures.value?.length ?? 0) : 0,
          totalSejarah:   sejarah.status  === 'fulfilled' ? (sejarah.value?.length  ?? 0) : 0,
          totalTentang:   tentang.status  === 'fulfilled' ? (tentang.value?.length  ?? 0) : 0,
          totalParking:   parking.status  === 'fulfilled' ? (parking.value?.length  ?? 0) : 0,
        })
      } catch {
        // biarkan null
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statCards = [
    {
      label:     'Total Event',
      value:     stats.totalEvents,
      desc:      'Event terdaftar',
      iconBg:    'bg-red-100',
      iconColor: 'text-red-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      // FIXED: path harus sama dengan route yang didaftarkan di router
      action: () => navigate('/admin/dashboard/event'),
    },
    {
      label:     'Rekayasa Aktif',
      value:     stats.activeClosures,
      desc:      'Penutupan & pengalihan',
      iconBg:    'bg-orange-100',
      iconColor: 'text-orange-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      action: () => navigate('/admin/dashboard/traffic'),
    },
    {
      label:     'Konten Sejarah',
      value:     stats.totalSejarah,
      desc:      'Artikel sejarah',
      iconBg:    'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      action: () => navigate('/admin/dashboard/sejarah'),
    },
    {
      label:     'Konten Tentang',
      value:     stats.totalTentang,
      desc:      'Informasi tentang',
      iconBg:    'bg-green-100',
      iconColor: 'text-green-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      action: () => navigate('/admin/dashboard/tentang'),
    },
    {
      label:     'Titik Parkir',
      value:     stats.totalParking,
      desc:      'Parkir semua event',
      iconBg:    'bg-indigo-100',
      iconColor: 'text-indigo-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      action: () => navigate('/admin/dashboard/event'),
    },
  ]

  const quickActions = [
    {
      label:       'Rekayasa Lalu Lintas',
      description: 'Kelola penutupan jalan dan pengalihan rute',
      path:        '/admin/dashboard/traffic',
      accent:      'bg-orange-600',
      iconBg:      'bg-orange-100',
      iconColor:   'text-orange-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      label:       'Manajemen Event',
      description: 'Tambah, kelola event dan titik parkir',
      // FIXED: path yang benar menuju AdminEvent
      path:        '/admin/dashboard/event',
      accent:      'bg-red-600',
      iconBg:      'bg-red-100',
      iconColor:   'text-red-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label:       'Kelola Sejarah',
      description: 'Edit konten sejarah Grebeg Suro',
      path:        '/admin/dashboard/sejarah',
      accent:      'bg-blue-600',
      iconBg:      'bg-blue-100',
      iconColor:   'text-blue-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      label:       'Kelola Tentang',
      description: 'Edit informasi tentang Rute Suro',
      path:        '/admin/dashboard/tentang',
      accent:      'bg-green-600',
      iconBg:      'bg-green-100',
      iconColor:   'text-green-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.45s ease-out both; }
      `}</style>

      {/* Welcome */}
      <div className="fade-up" style={{ animationDelay: '0s' }}>
        <h1 className="text-3xl font-black text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">Pantau dan kelola sistem RUTE SURO Grebeg Suro</p>
      </div>

      {/* Stat Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 fade-up"
        style={{ animationDelay: '0.08s' }}
      >
        {statCards.map((card) => (
          <button
            key={card.label}
            onClick={card.action}
            className="bg-white rounded-2xl border border-gray-100 p-6 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className={`w-12 h-12 ${card.iconBg} ${card.iconColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
              {card.icon}
            </div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">{card.label}</p>
            <h3 className="text-3xl font-black text-gray-900 mb-0.5">
              {loading ? (
                <span className="inline-block w-10 h-8 rounded-lg bg-gray-100 animate-pulse align-middle" />
              ) : (
                card.value ?? '—'
              )}
            </h3>
            <p className="text-gray-400 text-xs">{card.desc}</p>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="fade-up" style={{ animationDelay: '0.18s' }}>
        <h2 className="text-lg font-black text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group flex flex-col gap-3"
            >
              <div className={`w-11 h-11 ${action.iconBg} ${action.iconColor} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                {action.icon}
              </div>
              <div>
                <p className="font-black text-sm text-gray-900 leading-tight">{action.label}</p>
                <p className="text-gray-400 text-xs mt-1 leading-snug">{action.description}</p>
              </div>
              <div className="flex items-center gap-1 mt-auto">
                <span className={`text-xs font-bold ${action.iconColor}`}>Buka</span>
                <svg className={`w-3.5 h-3.5 ${action.iconColor} group-hover:translate-x-0.5 transition-transform duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div
        className="fade-up bg-gradient-to-r from-red-900 to-red-700 rounded-2xl p-6 text-white flex items-center gap-5"
        style={{ animationDelay: '0.28s' }}
      >
        <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="font-black text-base">Selamat datang di Panel Admin RUTE SURO</p>
          <p className="text-red-200 text-sm mt-0.5">
            Gunakan menu navigasi di atas untuk mengelola event, rekayasa lalu lintas, dan konten informasi publik.
          </p>
        </div>
      </div>
    </div>
  )
}