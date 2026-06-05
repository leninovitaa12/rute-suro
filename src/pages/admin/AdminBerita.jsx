import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit2, AlertCircle, ExternalLink, MapPin, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import dayjs from 'dayjs'

const KATEGORI_LIST = ['Festival', 'System', 'Destinasi', 'Lalu Lintas', 'Budaya', 'Umum']

const EMPTY_FORM = {
  id: null, judul: '', isi: '', kategori: 'Umum',
  embed_url: '', thumbnail: '',
  lokasi_lat: '', lokasi_lng: '', lokasi_nama: '',
  published: true,
}

export default function AdminBerita() {
  const [list, setList]       = useState([])
  const [form, setForm]       = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [msg, setMsg]         = useState({ text: '', type: 'success' })

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  function showMsg(text, type = 'success') {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: 'success' }), 4000)
  }

  // ── Fetch (admin lihat semua, termasuk draft) ──────────────────
  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('berita')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) showMsg('Gagal muat: ' + error.message, 'error')
    else setList(data || [])
  }, [])

  useEffect(() => { load() }, [load])

  // ── Save ───────────────────────────────────────────────────────
  async function save() {
    if (!form.judul.trim()) { showMsg('Judul wajib diisi', 'error'); return }
    if (!form.isi.trim())   { showMsg('Isi berita wajib diisi', 'error'); return }

    const payload = {
      judul:       form.judul.trim(),
      isi:         form.isi.trim(),
      kategori:    form.kategori,
      embed_url:   form.embed_url.trim()  || null,
      thumbnail:   form.thumbnail.trim()  || null,
      lokasi_lat:  form.lokasi_lat !== '' ? parseFloat(form.lokasi_lat) : null,
      lokasi_lng:  form.lokasi_lng !== '' ? parseFloat(form.lokasi_lng) : null,
      lokasi_nama: form.lokasi_nama.trim() || null,
      published:   form.published,
    }

    setLoading(true)
    try {
      if (form.id) {
        // UPDATE
        const { data, error } = await supabase
          .from('berita')
          .update(payload)
          .eq('id', form.id)
          .select()
        if (error) throw error
        if (!data || data.length === 0) throw new Error('Update gagal: tidak ada baris yang diperbarui. Cek RLS policy di Supabase.')
        showMsg('Berita diperbarui ✅')
      } else {
        // INSERT
        const { data, error } = await supabase
          .from('berita')
          .insert([payload])
          .select()
        if (error) throw error
        if (!data || data.length === 0) throw new Error('Insert gagal: cek RLS policy di Supabase.')
        showMsg('Berita disimpan ✅')
      }
      resetForm()
      await load()
    } catch (e) {
      showMsg('Gagal simpan: ' + e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────
  async function del(id) {
    if (!confirm('Yakin hapus berita ini?')) return
    const { error } = await supabase.from('berita').delete().eq('id', id)
    if (error) showMsg('Gagal hapus: ' + error.message, 'error')
    else { showMsg('Berita dihapus'); await load() }
  }

  // ── Toggle published ───────────────────────────────────────────
  async function togglePublished(item) {
    const { error } = await supabase
      .from('berita')
      .update({ published: !item.published })
      .eq('id', item.id)
    if (error) showMsg('Gagal update: ' + error.message, 'error')
    else await load()
  }

  function editItem(item) {
    setForm({
      id:          item.id,
      judul:       item.judul,
      isi:         item.isi,
      kategori:    item.kategori,
      embed_url:   item.embed_url   || '',
      thumbnail:   item.thumbnail   || '',
      lokasi_lat:  item.lokasi_lat  ?? '',
      lokasi_lng:  item.lokasi_lng  ?? '',
      lokasi_nama: item.lokasi_nama || '',
      published:   item.published,
    })
    setPreview(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() { setForm(EMPTY_FORM); setPreview(false) }

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"

  const KATEGORI_COLOR = {
    'Festival':     'bg-red-100 text-red-700',
    'System':       'bg-blue-100 text-blue-700',
    'Destinasi':    'bg-purple-100 text-purple-700',
    'Lalu Lintas':  'bg-orange-100 text-orange-700',
    'Budaya':       'bg-pink-100 text-pink-700',
    'Umum':         'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-6">

      {/* Alert */}
      {msg.text && (
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${
          msg.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{msg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── FORM ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">{form.id ? 'Edit Berita' : 'Tambah Berita Baru'}</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Judul *</label>
              <input className={inputCls} placeholder="Judul berita" value={form.judul}
                onChange={e => f('judul', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Isi / Ringkasan *</label>
              <textarea className={inputCls + ' resize-none'} rows={4} placeholder="Isi ringkasan berita..."
                value={form.isi} onChange={e => f('isi', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
              <select className={inputCls} value={form.kategori} onChange={e => f('kategori', e.target.value)}>
                {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                URL Thumbnail <span className="font-normal text-xs text-gray-400">(opsional)</span>
              </label>
              <input className={inputCls} placeholder="https://..." value={form.thumbnail}
                onChange={e => f('thumbnail', e.target.value)} />
              {form.thumbnail && (
                <img src={form.thumbnail} alt="preview" className="mt-2 w-full h-24 object-cover rounded-lg" onError={e => e.target.style.display='none'} />
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Link Berita / Embed URL <span className="font-normal text-xs text-gray-400">(opsional)</span>
              </label>
              <input className={inputCls} type="url" placeholder="https://..." value={form.embed_url}
                onChange={e => f('embed_url', e.target.value)} />
              {form.embed_url && (
                <button onClick={() => setPreview(v => !v)}
                  className="flex items-center gap-1 mt-1 text-xs text-primary hover:underline">
                  <ExternalLink size={11} /> {preview ? 'Sembunyikan' : 'Preview Embed'}
                </button>
              )}
              {preview && form.embed_url && (
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <iframe src={form.embed_url} title="preview" className="w-full" style={{ height: 180 }} loading="lazy" />
                </div>
              )}
            </div>

            {/* Lokasi */}
            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-semibold text-blue-900 flex items-center gap-1">
                <MapPin size={14} /> Lokasi Terkait
                <span className="font-normal text-xs text-blue-500 ml-1">(opsional)</span>
              </p>
              <input className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nama lokasi" value={form.lokasi_nama} onChange={e => f('lokasi_nama', e.target.value)} />
              <div className="flex gap-2">
                <input type="number" step="any" placeholder="Lat"
                  className="w-1/2 px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={form.lokasi_lat} onChange={e => f('lokasi_lat', e.target.value)} />
                <input type="number" step="any" placeholder="Lng"
                  className="w-1/2 px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={form.lokasi_lng} onChange={e => f('lokasi_lng', e.target.value)} />
              </div>
            </div>

            {/* Toggle Published */}
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => f('published', !form.published)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.published ? 'bg-green-600' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.published ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-semibold text-gray-700">{form.published ? 'Published' : 'Draft'}</span>
            </div>

            <div className="space-y-2 pt-2">
              <button onClick={save} disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold text-sm disabled:opacity-60">
                <Plus size={16} /> {form.id ? 'Update Berita' : 'Simpan Berita'}
              </button>
              <button onClick={resetForm}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm">
                Reset Form
              </button>
            </div>
          </div>
        </div>

        {/* ── DAFTAR BERITA ─────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Daftar Berita ({list.length})</h3>
              <button onClick={load} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {list.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">Belum ada berita.</p>
            ) : (
              <div className="space-y-3">
                {list.map(item => (
                  <div key={item.id}
                    className="flex items-start justify-between gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {item.published ? 'Published' : 'Draft'}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${KATEGORI_COLOR[item.kategori] || 'bg-gray-100 text-gray-600'}`}>
                          {item.kategori}
                        </span>
                        <span className="text-xs text-gray-400">
                          {dayjs(item.created_at).format('DD/MM/YY HH:mm')}
                        </span>
                      </div>
                      <p className="font-bold text-gray-800 text-sm truncate">{item.judul}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.isi}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        {item.embed_url && (
                          <a href={item.embed_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <ExternalLink size={11} /> Link
                          </a>
                        )}
                        {item.lokasi_lat && item.lokasi_lng && (
                          <span className="flex items-center gap-1 text-xs text-blue-600">
                            <MapPin size={11} /> {item.lokasi_nama || 'Ada Lokasi'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => togglePublished(item)} title={item.published ? 'Jadikan Draft' : 'Publish'}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                        {item.published ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => editItem(item)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => del(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}