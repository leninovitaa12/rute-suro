import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Trash2, Edit2, ExternalLink, MapPin, Eye, EyeOff, RefreshCw, Upload, X, Image } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

// ─── Konstanta ────────────────────────────────────────────────
const KATEGORI_LIST = ['Festival', 'Destinasi', 'Lalu Lintas', 'Budaya', 'Umum']
const BUCKET = 'berita-thumbnails' // nama bucket Supabase Storage

const EMPTY_FORM = {
  id: null, judul: '', isi: '', kategori: 'Umum',
  embed_url: '',
  lokasi_lat: '', lokasi_lng: '', lokasi_nama: '',
  published: true,
  thumbnail: '',          // URL thumbnail yang sudah tersimpan (saat edit)
}

// Ekstrak thumbnail dari YouTube
function extractYoutubeThumbnail(url) {
  if (!url) return null
  try {
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
    return null
  } catch { return null }
}

// ─── Komponen Utama ───────────────────────────────────────────
export default function AdminBerita() {
  const [list, setList]             = useState([])
  const [form, setForm]             = useState(EMPTY_FORM)
  const [loading, setLoading]       = useState(false)
  const [preview, setPreview]       = useState(false)

  // State khusus upload gambar
  const [imageFile, setImageFile]   = useState(null)   // File object
  const [imagePreview, setImagePreview] = useState('') // Base64 preview lokal
  const [uploadLoading, setUploadLoading] = useState(false)
  const fileInputRef                = useRef(null)

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  // ── SweetAlert helpers ──────────────────────────────────────
  function showSuccess(text) {
    Swal.fire({
      icon: 'success', title: 'Berhasil', text,
      timer: 2000, showConfirmButton: false,
      toast: true, position: 'top-end',
      customClass: { container: 'swal-on-top' },
    })
  }
  function showError(text) {
    Swal.fire({
      icon: 'error', title: 'Gagal', text,
      confirmButtonColor: '#b91c1c',
      customClass: { container: 'swal-on-top' },
    })
  }

  // ── Load Data ───────────────────────────────────────────────
  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('berita')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) showError('Gagal muat: ' + error.message)
    else setList(data || [])
  }, [])

  useEffect(() => { load() }, [load])

  // ── Handle Pilih File Gambar ────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    // Validasi tipe
    if (!file.type.startsWith('image/')) {
      showError('File harus berupa gambar (JPG, PNG, WEBP, dll)')
      return
    }
    // Validasi ukuran maks 3 MB
    if (file.size > 3 * 1024 * 1024) {
      showError('Ukuran gambar maksimal 3 MB')
      return
    }

    setImageFile(file)

    // Buat preview lokal pakai FileReader
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview('')
    f('thumbnail', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Upload Gambar ke Supabase Storage ───────────────────────
  async function uploadImage(beritaId) {
    if (!imageFile) return form.thumbnail || null

    setUploadLoading(true)
    try {
      // Nama file unik: beritaId_timestamp.ext
      const ext  = imageFile.name.split('.').pop()
      const path = `${beritaId}_${Date.now()}.${ext}`

      // Hapus file lama jika edit dan ada thumbnail sebelumnya
      if (form.thumbnail && form.id) {
        const oldPath = form.thumbnail.split(`/${BUCKET}/`)[1]
        if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath])
      }

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, imageFile, { upsert: true, contentType: imageFile.type })

      if (upErr) throw upErr

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
      return urlData.publicUrl
    } catch (e) {
      showError('Gagal upload gambar: ' + e.message)
      return null
    } finally {
      setUploadLoading(false)
    }
  }

  // ── Simpan / Update Berita ──────────────────────────────────
  async function save() {
    if (!form.judul.trim()) { showError('Judul wajib diisi'); return }
    if (!form.isi.trim())   { showError('Isi berita wajib diisi'); return }

    setLoading(true)
    try {
      // Prioritas thumbnail:
      // 1. Gambar upload baru (imageFile)
      // 2. Thumbnail existing di form (saat edit, tidak ganti gambar)
      // 3. Auto-detect dari YouTube embed URL
      // 4. null
      let thumbnailUrl = form.thumbnail || extractYoutubeThumbnail(form.embed_url) || null

      // Untuk insert baru, kita perlu ID dulu jika upload gambar
      // Cara: insert dulu → dapat ID → upload → update thumbnail
      if (form.id) {
        // ── UPDATE ──
        // Upload gambar dulu pakai ID yang sudah ada
        if (imageFile) {
          const uploaded = await uploadImage(form.id)
          if (uploaded) thumbnailUrl = uploaded
        }

        const payload = {
          judul:       form.judul.trim(),
          isi:         form.isi.trim(),
          kategori:    form.kategori,
          embed_url:   form.embed_url.trim() || null,
          thumbnail:   thumbnailUrl,
          lokasi_lat:  form.lokasi_lat !== '' ? parseFloat(form.lokasi_lat) : null,
          lokasi_lng:  form.lokasi_lng !== '' ? parseFloat(form.lokasi_lng) : null,
          lokasi_nama: form.lokasi_nama.trim() || null,
          published:   form.published,
        }

        const { data, error } = await supabase
          .from('berita').update(payload).eq('id', form.id).select()
        if (error) throw error
        if (!data || data.length === 0) throw new Error('Update gagal: cek RLS policy di Supabase.')
        showSuccess('Berita berhasil diperbarui!')

      } else {
        // ── INSERT ──
        // Insert dulu tanpa thumbnail untuk dapat ID
        const payloadFirst = {
          judul:       form.judul.trim(),
          isi:         form.isi.trim(),
          kategori:    form.kategori,
          embed_url:   form.embed_url.trim() || null,
          thumbnail:   thumbnailUrl, // bisa null dulu
          lokasi_lat:  form.lokasi_lat !== '' ? parseFloat(form.lokasi_lat) : null,
          lokasi_lng:  form.lokasi_lng !== '' ? parseFloat(form.lokasi_lng) : null,
          lokasi_nama: form.lokasi_nama.trim() || null,
          published:   form.published,
        }

        const { data: inserted, error: insErr } = await supabase
          .from('berita').insert([payloadFirst]).select()
        if (insErr) throw insErr
        if (!inserted || inserted.length === 0) throw new Error('Insert gagal: cek RLS policy di Supabase.')

        const newId = inserted[0].id

        // Jika ada file gambar → upload sekarang pakai ID baru
        if (imageFile) {
          const uploaded = await uploadImage(newId)
          if (uploaded) {
            await supabase.from('berita').update({ thumbnail: uploaded }).eq('id', newId)
          }
        }

        showSuccess('Berita berhasil disimpan!')
      }

      resetForm()
      await load()
    } catch (e) {
      showError('Gagal simpan: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Hapus Berita ────────────────────────────────────────────
  async function del(item) {
    const result = await Swal.fire({
      title: 'Hapus Berita?',
      text: 'Berita yang dihapus tidak dapat dikembalikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b91c1c',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: { container: 'swal-on-top' },
    })
    if (!result.isConfirmed) return

    // Hapus file dari storage jika ada
    if (item.thumbnail && item.thumbnail.includes(BUCKET)) {
      const oldPath = item.thumbnail.split(`/${BUCKET}/`)[1]
      if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath])
    }

    const { error } = await supabase.from('berita').delete().eq('id', item.id)
    if (error) showError('Gagal hapus: ' + error.message)
    else { showSuccess('Berita berhasil dihapus!'); await load() }
  }

  // ── Toggle Published ────────────────────────────────────────
  async function togglePublished(item) {
    const { error } = await supabase
      .from('berita').update({ published: !item.published }).eq('id', item.id)
    if (error) showError('Gagal update: ' + error.message)
    else { showSuccess(item.published ? 'Berita dijadikan draft.' : 'Berita dipublish!'); await load() }
  }

  // ── Edit Item ───────────────────────────────────────────────
  function editItem(item) {
    setForm({
      id:          item.id,
      judul:       item.judul,
      isi:         item.isi,
      kategori:    item.kategori,
      embed_url:   item.embed_url   || '',
      lokasi_lat:  item.lokasi_lat  ?? '',
      lokasi_lng:  item.lokasi_lng  ?? '',
      lokasi_nama: item.lokasi_nama || '',
      published:   item.published,
      thumbnail:   item.thumbnail   || '',
    })
    // Reset file input (gambar baru belum dipilih)
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setPreview(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setPreview(false)
  }

  // ── Style helpers ───────────────────────────────────────────
  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"

  const KATEGORI_COLOR = {
    'Festival':    'bg-red-100 text-red-700',
    'Destinasi':   'bg-purple-100 text-purple-700',
    'Lalu Lintas': 'bg-orange-100 text-orange-700',
    'Budaya':      'bg-pink-100 text-pink-700',
    'Umum':        'bg-gray-100 text-gray-600',
  }

  // Thumbnail yang tampil di form preview area
  const previewThumb = imagePreview || form.thumbnail || extractYoutubeThumbnail(form.embed_url)

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <style>{`
        .swal-on-top { z-index: 99999 !important; }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ════ FORM ════ */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">
              {form.id ? 'Edit Berita' : 'Tambah Berita Baru'}
            </h3>

            {/* Judul */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Judul *</label>
              <input className={inputCls} placeholder="Judul berita" value={form.judul}
                onChange={e => f('judul', e.target.value)} />
            </div>

            {/* Isi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Isi / Ringkasan *</label>
              <textarea className={inputCls + ' resize-none'} rows={4}
                placeholder="Isi ringkasan berita..."
                value={form.isi} onChange={e => f('isi', e.target.value)} />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
              <select className={inputCls} value={form.kategori} onChange={e => f('kategori', e.target.value)}>
                {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            {/* ── Upload Thumbnail (OPSIONAL) ── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Thumbnail Gambar
                <span className="font-normal text-xs text-gray-400 ml-1">(opsional, maks 3 MB)</span>
              </label>

              {/* Area Preview / Drop Zone */}
              {previewThumb ? (
                <div className="relative w-full h-36 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={previewThumb}
                    alt="thumbnail preview"
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  {/* Overlay info sumber */}
                  {!imagePreview && form.thumbnail && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                      <span className="text-white text-[10px]">Thumbnail tersimpan</span>
                    </div>
                  )}
                  {!imagePreview && !form.thumbnail && extractYoutubeThumbnail(form.embed_url) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                      <span className="text-white text-[10px]">Otomatis dari YouTube</span>
                    </div>
                  )}
                  {imagePreview && (
                    <div className="absolute bottom-0 left-0 right-0 bg-green-600/80 px-2 py-1">
                      <span className="text-white text-[10px]">✓ Gambar baru dipilih</span>
                    </div>
                  )}
                  {/* Tombol hapus gambar */}
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                    title="Hapus gambar"
                  >
                    <X size={12} />
                  </button>
                  {/* Tombol ganti gambar */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 text-white rounded-lg px-2 py-1 text-xs transition-colors flex items-center gap-1"
                  >
                    <Upload size={11} /> Ganti
                  </button>
                </div>
              ) : (
                /* Drop zone kosong */
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-28 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary"
                >
                  <Image size={24} />
                  <span className="text-xs font-medium">Klik untuk pilih gambar</span>
                  <span className="text-[10px]">JPG, PNG, WEBP • Maks 3 MB</span>
                </button>
              )}

              {/* Input file tersembunyi */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Info file yang dipilih */}
              {imageFile && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Upload size={11} /> {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>

            {/* Link Berita */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Link Berita / Embed URL
                <span className="font-normal text-xs text-gray-400 ml-1">(opsional)</span>
              </label>
              <input className={inputCls} type="url" placeholder="https://..."
                value={form.embed_url} onChange={e => f('embed_url', e.target.value)} />

              {form.embed_url && (
                <button onClick={() => setPreview(v => !v)}
                  className="flex items-center gap-1 mt-1 text-xs text-primary hover:underline">
                  <ExternalLink size={11} /> {preview ? 'Sembunyikan' : 'Preview Embed'}
                </button>
              )}
              {preview && form.embed_url && (
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <iframe src={form.embed_url} title="preview" className="w-full"
                    style={{ height: 180 }} loading="lazy" />
                </div>
              )}
            </div>

            {/* Lokasi */}
            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-semibold text-blue-900 flex items-center gap-1">
                <MapPin size={14} /> Lokasi Terkait
                <span className="font-normal text-xs text-blue-500 ml-1">(opsional)</span>
              </p>
              <input
                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nama lokasi" value={form.lokasi_nama}
                onChange={e => f('lokasi_nama', e.target.value)} />
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
              <span className="text-sm font-semibold text-gray-700">
                {form.published ? 'Published' : 'Draft'}
              </span>
            </div>

            {/* Tombol aksi */}
            <div className="space-y-2 pt-2">
              <button onClick={save} disabled={loading || uploadLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold text-sm disabled:opacity-60">
                {loading || uploadLoading
                  ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Menyimpan...</>
                  : <><Plus size={16} /> {form.id ? 'Update Berita' : '+ Simpan Berita'}</>
                }
              </button>
              <button onClick={resetForm}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm">
                Reset Form
              </button>
            </div>
          </div>
        </div>

        {/* ════ DAFTAR BERITA ════ */}
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
                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">

                    {/* Mini thumbnail di list */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt="" className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none' }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image size={20} className="text-gray-300" />
                        </div>
                      )}
                    </div>

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
                      <button onClick={() => del(item)}
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