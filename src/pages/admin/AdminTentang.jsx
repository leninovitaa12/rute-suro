import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react'
import { api } from '../../lib/api'

const EMPTY_FORM = { id: null, title: '', content: '', order: 0 }

export default function AdminTentang() {
  const [list, setList] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: 'success' })

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  function showMsg(text, type = 'success') {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: 'success' }), 4000)
  }

  async function load() {
    try {
      const res = await api.get('/tentang')
      setList(res.data || [])
    } catch (e) {
      showMsg('Gagal memuat: ' + e.message, 'error')
    }
  }

  useEffect(() => { load() }, [])

  async function save() {
    if (!form.title.trim()) { showMsg('Judul wajib diisi', 'error'); return }
    setLoading(true)
    try {
      const payload = {
        title:   form.title.trim(),
        content: form.content || '',
        order:   parseInt(form.order) || 0,
      }
      if (form.id) {
        await api.put(`/tentang/${form.id}`, payload)
        showMsg('Berhasil diperbarui')
      } else {
        await api.post('/tentang', payload)
        showMsg('Berhasil ditambahkan')
      }
      setForm(EMPTY_FORM)
      load()
    } catch (e) {
      showMsg('Gagal menyimpan: ' + e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function remove(id) {
    if (!confirm('Hapus konten ini?')) return
    try {
      await api.delete(`/tentang/${id}`)
      showMsg('Berhasil dihapus')
      load()
    } catch (e) {
      showMsg('Gagal menghapus', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Konten Tentang</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola informasi tentang Rute Suro</p>
      </div>

      {msg.text && (
        <div className={`p-3 rounded-xl text-sm font-semibold flex items-center gap-2
          ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <AlertCircle size={16} /> {msg.text}
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="font-black text-gray-900 mb-4">{form.id ? 'Edit Konten' : 'Tambah Konten'}</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Judul *</label>
            <input
              value={form.title}
              onChange={e => f('title', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Isi</label>
            <textarea
              value={form.content}
              onChange={e => f('content', e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Urutan</label>
            <input
              type="number"
              value={form.order}
              onChange={e => f('order', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={save}
            disabled={loading}
            className="flex items-center gap-2 bg-red-800 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-red-900 disabled:bg-gray-300 transition-all"
          >
            <Plus size={16} /> {loading ? 'Menyimpan...' : (form.id ? 'Simpan' : 'Tambah')}
          </button>
          {form.id && (
            <button
              onClick={() => setForm(EMPTY_FORM)}
              className="px-5 py-2 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Batal
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900">Daftar Konten ({list.length})</h2>
        </div>
        {list.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Belum ada konten tentang</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {list.map(item => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 truncate">{item.content?.substring(0, 80)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setForm({ ...item })}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-all"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}