import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats] = useState({
    totalEvents: 24,
    activeRoutes: 15,
    totalUsers: 1234,
    systemStatus: 'Optimal'
  })

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
        <p className="text-gray-600">Kelola sistem RUTE SURO dengan mudah</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Event</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalEvents}</h3>
            </div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Rute Aktif</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.activeRoutes}</h3>
            </div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a6 6 0 1112 0v-2a6 6 0 00-12 0v2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Pengguna</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
            </div>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Status Sistem</p>
              <h3 className="text-lg font-bold text-green-600">{stats.systemStatus}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/admin/dashboard/sejarah')}
            className="px-4 py-3 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-all duration-300 text-left border border-red-200"
          >
            Kelola Sejarah
          </button>
          <button
            onClick={() => navigate('/admin/dashboard/jadwal')}
            className="px-4 py-3 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-all duration-300 text-left border border-blue-200"
          >
            Kelola Jadwal
          </button>
          <button
            onClick={() => navigate('/admin/dashboard/tentang')}
            className="px-4 py-3 bg-green-50 text-green-600 font-bold rounded-lg hover:bg-green-100 transition-all duration-300 text-left border border-green-200"
          >
            Kelola Tentang
          </button>
          <button
            onClick={() => navigate('/admin/dashboard/traffic')}
            className="px-4 py-3 bg-purple-50 text-purple-600 font-bold rounded-lg hover:bg-purple-100 transition-all duration-300 text-left border border-purple-200"
          >
            Kelola Trafik
          </button>
        </div>
      </div>
    </div>
  )
}
