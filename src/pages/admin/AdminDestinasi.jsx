import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Plus, Trash2, Edit2, AlertCircle, MapPin, Image, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const DEFAULT_CENTER = [-7.871, 111.462]
const KATEGORI_LIST  = ['Pusat Budaya', 'Situs Sejarah', 'Wisata Alam', 'Kesenian', 'Lainnya']

const EMPTY_FORM = {
  id: null, nama: '', deskripsi: '', kategori: 'Pusat Budaya',
  gambar_url: '', lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1],
  urutan: 0, aktif: true,
}

function MapPicker({ lat, lng, onPick }) {
  useMapEvents({ click(e) { onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) } })
  return <Marker position={[lat, lng]} />
}

export default function AdminDestinasi() {
  const [list, setList]         = useState([])
  const [form, setForm]         = useState(EMPTY_FORM)
  const [loading, setLoading]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg]           = useState({ text: '', type: 'success' })

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  function showMsg(text, type = 'success') {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: 'success' }), 4000)
  }

  // ── Fetch (tanpa filter aktif agar admin bisa lihat semua) ──────
  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('destinasi_sejarah')
      .select('*')
      .order('urutan', { ascending: true })
    if (error) showMsg('Gagal muat: ' + error.message, 'error')
    else setList(data || [])
  }, [])

  useEffect(() => { load() }, [load])

  // ── Upload gambar ke Supabase Storage ──────────────────────────
  async function uploadGambar(file) {
    if (!file) return
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `destinasi/${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('destinasi-images')
        .upload(path, file, { upsert: true })
      if (error) { showMsg('Upload gambar gagal: ' + error.message, 'error'); return }
      const { data } = supabase.storage.from('destinasi-images').getPublicUrl(path)
      f('gambar_url', data.publicUrl)
      showMsg('Gambar berhasil diupload ✅')
    } catch (e) { showMsg('Upload error: ' + e.message, 'error') }
    finally { setUploading(false) }
  }

  // ── Save (Insert / Update) ─────────────────────────────────────
  async function save() {
    if (!form.nama.trim()) { showMsg('Nama destinasi wajib diisi', 'error'); return }
    if (!form.lat || !form.lng) { showMsg('Koordinat wajib diisi (klik peta)', 'error'); return }

    const payload = {
      nama:       form.nama.trim(),
      deskripsi:  form.deskripsi.trim() || null,
      kategori:   form.kategori,
      gambar_url: form.gambar_url.trim() || null,
      lat:        parseFloat(form.lat),
      lng:        parseFloat(form.lng),
      urutan:     parseInt(form.urutan) || 0,
      aktif:      form.aktif,
    }

    setLoading(true)
    try {
      if (form.id) {
        // UPDATE
        const { data, error } = await supabase
          .from('destinasi_sejarah')
          .update(payload)
          .eq('id', form.id)
          .select()
        if (error) throw error
        if (!data || data.length === 0) throw new Error('Update gagal: tidak ada baris yang diperbarui. Cek RLS policy di Supabase.')
        showMsg('Destinasi diperbarui ✅')
      } else {
        // INSERT
        const { data, error } = await supabase
          .from('destinasi_sejarah')
          .insert([payload])
          .select()
        if (error) throw error
        if (!data || data.length === 0) throw new Error('Insert gagal: cek RLS policy di Supabase.')
        showMsg('Destinasi ditambahkan ✅')
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
    if (!confirm('Yakin hapus destinasi ini?')) return
    const { error } = await supabase
      .from('destinasi_sejarah')
      .delete()
      .eq('id', id)
    if (error) showMsg('Gagal hapus: ' + error.message, 'error')
    else { showMsg('Destinasi dihapus'); await load() }
  }

  // ── Toggle aktif ───────────────────────────────────────────────
  async function toggleAktif(item) {
    const { error } = await supabase
      .from('destinasi_sejarah')
      .update({ aktif: !item.aktif })
      .eq('id', item.id)
    if (error) showMsg('Gagal update: ' + error.message, 'error')
    else await load()
  }

  // ── Ubah urutan ────────────────────────────────────────────────
  async function moveOrder(item, dir) {
    const newUrutan = item.urutan + dir
    const { error } = await supabase
      .from('destinasi_sejarah')
      .update({ urutan: newUrutan })
      .eq('id', item.id)
    if (error) showMsg('Gagal ubah urutan: ' + error.message, 'error')
    else await load()
  }

  function editItem(item) {
    setForm({ ...item, gambar_url: item.gambar_url || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() { setForm(EMPTY_FORM) }

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"

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
            <h3 className="text-lg font-bold text-gray-800">{form.id ? 'Edit Destinasi' : 'Tambah Destinasi Baru'}</h3>

            {/* Nama */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Destinasi *</label>
              <input className={inputCls} placeholder="Nama destinasi" value={form.nama}
                onChange={e => f('nama', e.target.value)} />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
              <textarea className={inputCls + ' resize-none'} rows={3} placeholder="Deskripsi singkat"
                value={form.deskripsi} onChange={e => f('deskripsi', e.target.value)} />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
              <select className={inputCls} value={form.kategori} onChange={e => f('kategori', e.target.value)}>
                {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            {/* Gambar — Upload atau URL manual */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Gambar
                <span className="ml-1 text-xs font-normal text-gray-400">(upload file atau paste URL)</span>
              </label>
              <div className="flex items-center gap-2 mb-2">
                <label className={`flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm cursor-pointer transition-colors ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                  <Image size={15} className="text-gray-600" />
                  {uploading ? 'Mengupload...' : 'Pilih File'}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => uploadGambar(e.target.files[0])} />
                </label>
                {form.gambar_url && (
                  <img src={form.gambar_url} alt="preview" className="w-10 h-10 object-cover rounded" />
                )}
              </div>
              <input className={inputCls} placeholder="https://... (URL gambar)" value={form.gambar_url}
                onChange={e => f('gambar_url', e.target.value)} />
            </div>

            {/* Urutan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Urutan Tampil</label>
              <input type="number" className={inputCls} value={form.urutan}
                onChange={e => f('urutan', e.target.value)} />
            </div>

            {/* Koordinat + Map picker kecil */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Koordinat <span className="font-normal text-gray-400 text-xs">(klik peta)</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input className={inputCls} type="number" step="any" placeholder="Lat"
                  value={form.lat} onChange={e => f('lat', e.target.value)} />
                <input className={inputCls} type="number" step="any" placeholder="Lng"
                  value={form.lng} onChange={e => f('lng', e.target.value)} />
              </div>
              <div style={{ height: 180, borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <MapContainer
                  center={[parseFloat(form.lat) || DEFAULT_CENTER[0], parseFloat(form.lng) || DEFAULT_CENTER[1]]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  key={`map-${form.id}`}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
                  <MapPicker
                    lat={parseFloat(form.lat) || DEFAULT_CENTER[0]}
                    lng={parseFloat(form.lng) || DEFAULT_CENTER[1]}
                    onPick={p => { f('lat', p.lat); f('lng', p.lng) }}
                  />
                </MapContainer>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                <MapPin size={11} className="inline mr-1" />
                {Number(form.lat).toFixed(5)}, {Number(form.lng).toFixed(5)}
              </p>
            </div>

            {/* Toggle Aktif */}
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => f('aktif', !form.aktif)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.aktif ? 'bg-green-600' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.aktif ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-semibold text-gray-700">{form.aktif ? 'Aktif (tampil di Home)' : 'Nonaktif (disembunyikan)'}</span>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              <button onClick={save} disabled={loading || uploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold text-sm disabled:opacity-60">
                <Plus size={16} /> {form.id ? 'Update Destinasi' : 'Simpan Destinasi'}
              </button>
              <button onClick={resetForm}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm">
                Reset Form
              </button>
            </div>
          </div>
        </div>

        {/* ── DAFTAR ───────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Daftar Destinasi ({list.length})</h3>
              <button onClick={load} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {list.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">Belum ada destinasi. Tambahkan melalui form di kiri.</p>
            ) : (
              <div className="space-y-3">
                {list.map(item => (
                  <div key={item.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    {/* Thumbnail */}
                    <div style={{
                      width: 72, height: 72, flexShrink: 0, borderRadius: 10,
                      background: item.gambar_url
                        ? `url(${item.gambar_url}) center/cover no-repeat`
                        : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    }} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.aktif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {item.aktif ? 'Aktif' : 'Nonaktif'}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-50 text-red-700 font-semibold">
                          {item.kategori}
                        </span>
                        <span className="text-xs text-gray-400">urutan: {item.urutan}</span>
                      </div>
                      <p className="font-bold text-gray-800 text-sm">{item.nama}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{item.deskripsi}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <MapPin size={11} />
                        <span>{item.lat?.toFixed(5)}, {item.lng?.toFixed(5)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button onClick={() => editItem(item)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => toggleAktif(item)}
                        className={`p-1.5 rounded-lg transition-colors text-xs font-semibold ${item.aktif ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        title={item.aktif ? 'Nonaktifkan' : 'Aktifkan'}>
                        {item.aktif ? '⬜' : '✅'}
                      </button>
                      <button onClick={() => moveOrder(item, -1)}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Naikan urutan">
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => moveOrder(item, 1)}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Turunkan urutan">
                        <ArrowDown size={14} />
                      </button>
                      <button onClick={() => del(item.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
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