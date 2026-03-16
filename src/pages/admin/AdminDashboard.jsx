import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getEvents, getClosures, getSejarah, getTentang, getParkingSpots } from '../../lib/backendApi'
import { api } from '../../lib/api'

// ─── Konfigurasi stat cards & quick actions (data-driven, tidak perlu JSX per-item) ──
const STATS = [
  { key: 'totalEvents',    label: 'Total Event',     desc: 'Event terdaftar',        bg: 'bg-red-100',    color: 'text-red-600',    path: '/admin/dashboard/event',   d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { key: 'activeClosures', label: 'Rekayasa Aktif',  desc: 'Penutupan & pengalihan', bg: 'bg-orange-100', color: 'text-orange-600', path: '/admin/dashboard/traffic', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { key: 'totalSejarah',   label: 'Konten Sejarah',  desc: 'Artikel sejarah',        bg: 'bg-blue-100',   color: 'text-blue-600',   path: '/admin/dashboard/sejarah', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { key: 'totalTentang',   label: 'Konten Tentang',  desc: 'Informasi tentang',      bg: 'bg-green-100',  color: 'text-green-600',  path: '/admin/dashboard/tentang', d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'totalParking',   label: 'Titik Parkir',    desc: 'Parkir semua event',     bg: 'bg-indigo-100', color: 'text-indigo-600', path: '/admin/dashboard/event',   d: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
  { key: 'totalCongestion',label: 'Zona Macet',      desc: 'Kemacetan terdaftar',    bg: 'bg-amber-100',  color: 'text-amber-600',  path: '/admin/dashboard/traffic', d: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' },
]

const ACTIONS = [
  { label: 'Rekayasa Lalu Lintas', desc: 'Kelola penutupan jalan dan pengalihan rute', path: '/admin/dashboard/traffic', bg: 'bg-orange-100', color: 'text-orange-600', d: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { label: 'Manajemen Event',      desc: 'Tambah, kelola event dan titik parkir',     path: '/admin/dashboard/event',   bg: 'bg-red-100',    color: 'text-red-600',    d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'Kelola Sejarah',       desc: 'Edit konten sejarah Grebeg Suro',           path: '/admin/dashboard/sejarah', bg: 'bg-blue-100',   color: 'text-blue-600',   d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { label: 'Kelola Tentang',       desc: 'Edit informasi tentang Rute Suro',          path: '/admin/dashboard/tentang', bg: 'bg-green-100',  color: 'text-green-600',  d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
]

// ─── Tiny icon helper — tidak perlu import SVG library ───────────────────────
const Ico = ({ d, cls = 'w-6 h-6' }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
)

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats,   setStats]   = useState(Object.fromEntries(STATS.map(s => [s.key, null])))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getEvents(), getClosures(false), getSejarah(), getTentang(), getParkingSpots(), api.get('/congestion_zones'),
    ]).then(results => {
      const vals = results.map((r, i) =>
        r.status !== 'fulfilled' ? 0 : i === 5 ? (r.value?.data?.length ?? 0) : (r.value?.length ?? 0)
      )
      setStats(Object.fromEntries(STATS.map((s, i) => [s.key, vals[i]])))
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-8">
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}.fade-up{animation:fadeUp .45s ease-out both}`}</style>

      {/* Header */}
      <div className="fade-up">
        <h1 className="text-3xl font-black text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">Pantau dan kelola sistem RUTE SURO Grebeg Suro</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 fade-up" style={{ animationDelay: '0.08s' }}>
        {STATS.map(({ key, label, desc, bg, color, path, d }) => (
          <button key={key} onClick={() => navigate(path)}
            className="bg-white rounded-2xl border border-gray-100 p-6 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
            <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
              <Ico d={d} />
            </div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
            <h3 className="text-3xl font-black text-gray-900 mb-0.5">
              {loading ? <span className="inline-block w-10 h-8 rounded-lg bg-gray-100 animate-pulse align-middle" /> : (stats[key] ?? '—')}
            </h3>
            <p className="text-gray-400 text-xs">{desc}</p>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="fade-up" style={{ animationDelay: '0.18s' }}>
        <h2 className="text-lg font-black text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACTIONS.map(({ label, desc, path, bg, color, d }) => (
            <button key={path} onClick={() => navigate(path)}
              className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group flex flex-col gap-3">
              <div className={`w-11 h-11 ${bg} ${color} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                <Ico d={d} />
              </div>
              <div>
                <p className="font-black text-sm text-gray-900 leading-tight">{label}</p>
                <p className="text-gray-400 text-xs mt-1 leading-snug">{desc}</p>
              </div>
              <div className="flex items-center gap-1 mt-auto">
                <span className={`text-xs font-bold ${color}`}>Buka</span>
                <svg className={`w-3.5 h-3.5 ${color} group-hover:translate-x-0.5 transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="fade-up bg-gradient-to-r from-red-900 to-red-700 rounded-2xl p-6 text-white flex items-center gap-5" style={{ animationDelay: '0.28s' }}>
        <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
          <Ico d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" cls="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-black text-base">Selamat datang di Panel Admin RUTE SURO</p>
          <p className="text-red-200 text-sm mt-0.5">Gunakan menu navigasi di atas untuk mengelola event, rekayasa lalu lintas, dan konten informasi publik.</p>
        </div>
      </div>
    </div>
  )
}