import { useState } from 'react'

// Reusable CRUD Manager Component
function ContentManager({ title, description, itemName }) {
  const [showForm, setShowForm] = useState(false)
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1', description: 'Deskripsi item 1', date: '2024-01-15' },
    { id: 2, name: 'Item 2', description: 'Deskripsi item 2', date: '2024-01-20' }
  ])
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', date: '' })

  // Animation styles
  const styles = `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from { 
        opacity: 0;
        transform: scale(0.95);
      }
      to { 
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .content-header { animation: slideInUp 0.5s ease-out; }
    .content-button { animation: slideInUp 0.6s ease-out 0.1s backwards; }
    .form-modal { animation: fadeIn 0.3s ease-out; }
    .form-input:focus {
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }
    .table-row { animation: slideInRight 0.3s ease-out; }
    .table-row:nth-child(1) { animation-delay: 0s; }
    .table-row:nth-child(2) { animation-delay: 0.05s; }
    .table-row:nth-child(3) { animation-delay: 0.1s; }
    .table-row:nth-child(4) { animation-delay: 0.15s; }
    .table-row:nth-child(5) { animation-delay: 0.2s; }
  `

  const handleAddClick = () => {
    setFormData({ name: '', description: '', date: '' })
    setEditingId(null)
    setShowForm(true)
  }

  const handleEditClick = (item) => {
    setFormData(item)
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      setItems(items.map(item => 
        item.id === editingId 
          ? { ...formData, id: editingId }
          : item
      ))
    } else {
      setItems([...items, { ...formData, id: Date.now() }])
    }
    setShowForm(false)
    setFormData({ name: '', description: '', date: '' })
  }

  return (
    <div>
      <style>{styles}</style>

      {/* Header */}
      <div className="content-header mb-10">
        <h1 className="text-4xl font-black text-gray-900 mb-3">{title}</h1>
        <p className="text-lg text-gray-600">{description}</p>
      </div>

      {/* Button Add New */}
      <div className="mb-8">
        <button
          onClick={handleAddClick}
          className="content-button group relative px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 overflow-hidden"
        >
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Tambah {itemName} Baru
          </span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="form-modal bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
            <style>{`
              @keyframes slideInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              @keyframes fadeIn {
                from { 
                  opacity: 0;
                  transform: scale(0.95);
                }
                to { 
                  opacity: 1;
                  transform: scale(1);
                }
              }
              .form-modal { animation: fadeIn 0.3s ease-out; }
              .form-input:focus {
                box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
              }
            `}</style>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-gray-900">
                {editingId ? 'Edit' : 'Tambah'} {itemName}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nama</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Masukkan nama"
                  className="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Masukkan deskripsi"
                  rows="4"
                  className="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  className="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  Simpan {itemName}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Nama</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Deskripsi</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Tanggal</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-gray-500 font-medium">Belum ada {itemName.toLowerCase()}</p>
                      <p className="text-gray-400 text-sm">Tambahkan yang baru untuk memulai</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id} className="table-row hover:bg-red-50/30 transition-colors duration-300 border-b border-gray-100 last:border-0" style={{animationDelay: `${idx * 0.05}s`}}>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs" title={item.description}>{item.description.substring(0, 40)}{item.description.length > 40 ? '...' : ''}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm space-x-2 flex">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="group relative px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 hover:shadow transition-all duration-300 flex items-center gap-1.5 overflow-hidden"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="group relative px-4 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 hover:shadow transition-all duration-300 flex items-center gap-1.5 overflow-hidden"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function AdminSejarah() {
  return (
    <ContentManager 
      title="Manajemen Sejarah" 
      description="Kelola konten sejarah Grebeg Suro"
      itemName="Sejarah"
    />
  )
}

export function AdminJadwal() {
  return (
    <ContentManager 
      title="Manajemen Jadwal" 
      description="Kelola jadwal acara Grebeg Suro"
      itemName="Jadwal"
    />
  )
}

export function AdminTentang() {
  return (
    <ContentManager 
      title="Manajemen Tentang" 
      description="Kelola informasi tentang Rute Suro"
      itemName="Tentang"
    />
  )
}
