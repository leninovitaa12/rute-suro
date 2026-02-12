import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const [adminEmail, setAdminEmail] = useState('')
  const [events, setEvents] = useState([
    { id: 1, name: 'Pembukaan Resmi', date: '2024-02-10', location: 'Alun-alun Ponorogo', status: 'Terjadwal' },
    { id: 2, name: 'Parade Kuda Hias', date: '2024-02-10', location: 'Jalan Utama', status: 'Terjadwal' },
    { id: 3, name: 'Pertunjukan Seni', date: '2024-02-10', location: 'Pendopo Ponorogo', status: 'Terjadwal' },
  ])
  const [newEvent, setNewEvent] = useState({ name: '', date: '', location: '', status: 'Terjadwal' })
  const [editingId, setEditingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn')
    const email = localStorage.getItem('adminEmail')
    
    if (!loggedIn) {
      navigate('/admin')
    } else {
      setAdminEmail(email)
    }
  }, [navigate])

  const handleAddEvent = (e) => {
    e.preventDefault()
    if (newEvent.name && newEvent.date && newEvent.location) {
      if (editingId) {
        setEvents(events.map(evt => evt.id === editingId ? { ...newEvent, id: editingId } : evt))
        setEditingId(null)
      } else {
        const id = Math.max(...events.map(e => e.id), 0) + 1
        setEvents([...events, { ...newEvent, id }])
      }
      setNewEvent({ name: '', date: '', location: '', status: 'Terjadwal' })
    }
  }

  const handleEditEvent = (event) => {
    setNewEvent(event)
    setEditingId(event.id)
  }

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(evt => evt.id !== id))
  }

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminEmail')
    navigate('/')
  }

  return (
    <main className="min-h-screen bg-secondary py-8">
      <div className="container">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-text-primary">
              Admin Dashboard
            </h1>
            <p className="text-text-secondary">Selamat datang, {adminEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-error text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <p className="text-text-secondary text-sm font-semibold mb-2">Total Events</p>
            <p className="text-4xl font-extrabold text-primary">{events.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <p className="text-text-secondary text-sm font-semibold mb-2">Terjadwal</p>
            <p className="text-4xl font-extrabold text-success">{events.filter(e => e.status === 'Terjadwal').length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <p className="text-text-secondary text-sm font-semibold mb-2">Selesai</p>
            <p className="text-4xl font-extrabold text-text-primary">{events.filter(e => e.status === 'Selesai').length}</p>
          </div>
        </div>

        {/* Add/Edit Form */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            {editingId ? 'Edit Event' : 'Tambah Event Baru'}
          </h2>
          
          <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Nama Event"
              value={newEvent.name}
              onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Lokasi"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={newEvent.status}
              onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option>Terjadwal</option>
              <option>Sedang Berlangsung</option>
              <option>Selesai</option>
            </select>
            <button
              type="submit"
              className="btn-primary"
            >
              {editingId ? 'Update' : 'Tambah'}
            </button>
          </form>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">#</th>
                <th className="px-6 py-4 text-left font-semibold">Nama Event</th>
                <th className="px-6 py-4 text-left font-semibold">Tanggal</th>
                <th className="px-6 py-4 text-left font-semibold">Lokasi</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, idx) => (
                <tr key={event.id} className={`border-t ${idx % 2 === 0 ? 'bg-white' : 'bg-secondary'} hover:bg-gray-100 transition-colors`}>
                  <td className="px-6 py-4 font-semibold text-text-primary">{idx + 1}</td>
                  <td className="px-6 py-4 text-text-primary">{event.name}</td>
                  <td className="px-6 py-4 text-text-secondary">{event.date}</td>
                  <td className="px-6 py-4 text-text-secondary">{event.location}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      event.status === 'Terjadwal' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'Sedang Berlangsung' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="px-4 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="px-4 py-1 bg-error text-white rounded hover:bg-red-700 transition-colors text-sm font-semibold"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Map */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Peta Event
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="bg-secondary rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-text-secondary font-semibold">
                  Integrasi Peta akan ditampilkan di sini
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
