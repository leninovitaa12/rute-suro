// src/pages/admin/AdminTentang.jsx
import { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'
import {
  getTentang, createTentang, updateTentang, deleteTentang,
  getPoster,  createPoster,  updatePoster,  deletePoster,
  uploadPosterImage, deletePosterImage,
} from '../../lib/backendApi'

// ── Helpers ───────────────────────────────────────────────────────────────────
const toast = (icon, title) =>
  Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    // Pastikan SweetAlert muncul di atas navbar
    customClass: { container: 'swal-above-navbar' },
    didOpen: (toast) => {
      // z-index tinggi agar di atas navbar
      const container = toast.closest('.swal2-container')
      if (container) container.style.zIndex = '99999'
    },
  }).fire({ icon, title })

const confirmDel = (name) =>
  Swal.fire({
    title: 'Hapus Data?',
    html: `<span style="color:#6b7280;font-size:14px">${name}</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#991b1b',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
    // Pastikan SweetAlert muncul di atas navbar
    customClass: { container: 'swal-above-navbar' },
    didOpen: () => {
      const container = document.querySelector('.swal2-container')
      if (container) container.style.zIndex = '99999'
    },
  }).then(r => r.isConfirmed)

const cls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 transition"

// ── Tab tanpa ikon, teks profesional ─────────────────────────────────────────
const Tab = ({ active, onClick, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all
      ${active ? 'bg-red-800 text-white shadow' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
  >
    {label}
    <span className={`text-xs px-1.5 py-0.5 rounded-full font-black
      ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
      {count}
    </span>
  </button>
)

// ── Komponen Upload Gambar ────────────────────────────────────────────────────
function ImageUploader({ currentUrl, onFileChange, onClear }) {
  const ref = useRef()

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        Gambar Poster <span className="text-red-500">*</span>
      </label>

      <div
        onClick={() => ref.current.click()}
        className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer
          hover:border-red-400 hover:bg-red-50/20 transition-all group"
        style={{ minHeight: 160 }}
      >
        {currentUrl ? (
          <>
            <img
              src={currentUrl}
              alt="preview"
              className="w-full object-contain max-h-56"
              onError={e => { e.target.src = 'https://placehold.co/400x600/f9fafb/9ca3af?text=Error' }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity
              flex flex-col items-center justify-center gap-1">
              <p className="text-white text-xs font-bold">Klik untuk ganti gambar</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-10 px-4">
            <p className="text-sm font-semibold text-gray-400">Klik untuk pilih gambar</p>
            <p className="text-xs text-gray-300">JPG, PNG, WEBP — maks. 5 MB</p>
          </div>
        )}
      </div>

      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files[0]; if (f) onFileChange(f); e.target.value = '' }}
      />

      {currentUrl && (
        <button
          type="button"
          onClick={onClear}
          className="mt-1.5 text-xs text-red-500 hover:underline"
        >
          Hapus gambar
        </button>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
export default function AdminTentang() {
  const [tab, setTab] = useState('tentang')

  // ── State Tentang ──────────────────────────────────────────────────────────
  const [tentangList, setTentangList] = useState([])
  const [tForm, setTForm] = useState({ id: null, title: '', description: '' })
  const [tBusy, setTBusy] = useState(false)

  // ── State Poster ───────────────────────────────────────────────────────────
  const [posterList, setPosterList]   = useState([])
  const [pForm, setPForm]             = useState({ id: null, title: '', description: '', image_url: '' })
  const [imgFile, setImgFile]         = useState(null)
  const [preview, setPreview]         = useState('')
  const [pBusy, setPBusy]             = useState(false)

  const [loading, setLoading] = useState(true)

  const tf = (k, v) => setTForm(p => ({ ...p, [k]: v }))
  const pf = (k, v) => setPForm(p => ({ ...p, [k]: v }))

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([getTentang(), getPoster()])
      .then(([t, p]) => { setTentangList(t); setPosterList(p) })
      .catch(() => toast('error', 'Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [])

  // ── CRUD Tentang ───────────────────────────────────────────────────────────
  async function saveTentang() {
    if (!tForm.title.trim()) return toast('error', 'Judul wajib diisi')
    setTBusy(true)
    try {
      const payload = { title: tForm.title.trim(), description: tForm.description }
      if (tForm.id) {
        await updateTentang(tForm.id, payload)
        toast('success', 'Langkah diperbarui')
      } else {
        await createTentang(payload)
        toast('success', 'Langkah ditambahkan')
      }
      setTForm({ id: null, title: '', description: '' })
      setTentangList(await getTentang())
    } catch (e) {
      toast('error', 'Gagal: ' + e.message)
    } finally {
      setTBusy(false)
    }
  }

  async function delTentang(item) {
    if (!await confirmDel(item.title)) return
    try {
      await deleteTentang(item.id)
      toast('success', 'Langkah dihapus')
      setTentangList(p => p.filter(x => x.id !== item.id))
      if (tForm.id === item.id) setTForm({ id: null, title: '', description: '' })
    } catch (e) {
      toast('error', 'Gagal: ' + e.message)
    }
  }

  // ── CRUD Poster ────────────────────────────────────────────────────────────
  function handleFileChange(file) {
    setImgFile(file)
    setPreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setImgFile(null)
    setPreview('')
    pf('image_url', '')
  }

  function editPoster(item) {
    setPForm({ ...item })
    setPreview(item.image_url)
    setImgFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetPoster() {
    setPForm({ id: null, title: '', description: '', image_url: '' })
    setImgFile(null)
    setPreview('')
  }

  async function savePoster() {
    if (!pForm.title.trim()) return toast('error', 'Judul wajib diisi')
    if (!imgFile && !pForm.image_url) return toast('error', 'Pilih gambar terlebih dahulu')

    setPBusy(true)
    try {
      let image_url = pForm.image_url

      if (imgFile) {
        if (pForm.id && pForm.image_url) {
          await deletePosterImage(pForm.image_url)
        }
        image_url = await uploadPosterImage(imgFile)
      }

      const payload = {
        title:       pForm.title.trim(),
        description: pForm.description,
        image_url,
      }

      if (pForm.id) {
        await updatePoster(pForm.id, payload)
        toast('success', 'Poster diperbarui')
      } else {
        await createPoster(payload)
        toast('success', 'Poster ditambahkan')
      }

      resetPoster()
      setPosterList(await getPoster())
    } catch (e) {
      toast('error', 'Gagal: ' + e.message)
    } finally {
      setPBusy(false)
    }
  }

  async function delPoster(item) {
    if (!await confirmDel(item.title)) return
    try {
      if (item.image_url) await deletePosterImage(item.image_url)
      await deletePoster(item.id)
      toast('success', 'Poster dihapus')
      setPosterList(p => p.filter(x => x.id !== item.id))
      if (pForm.id === item.id) resetPoster()
    } catch (e) {
      toast('error', 'Gagal: ' + e.message)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Konten Tentang</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola konten halaman Tentang Rute Suro</p>
      </div>

      {/* Tab — tanpa ikon */}
      <div className="flex gap-2 flex-wrap">
        <Tab
          active={tab === 'tentang'}
          onClick={() => setTab('tentang')}
          label="Cara Kerja"
          count={tentangList.length}
        />
        <Tab
          active={tab === 'poster'}
          onClick={() => setTab('poster')}
          label="Poster Infografis"
          count={posterList.length}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" /> Memuat data...
        </div>
      )}

      {/* ═══════════════ TAB TENTANG ═══════════════ */}
      {!loading && tab === 'tentang' && (
        <>
          {/* Form Tentang */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-black text-gray-900 mb-4">
              {tForm.id ? 'Edit Langkah' : 'Tambah Langkah Cara Kerja'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  value={tForm.title}
                  onChange={e => tf('title', e.target.value)}
                  className={cls}
                  placeholder="cth: Masukkan Titik Asal & Tujuan"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi</label>
                <textarea
                  value={tForm.description}
                  onChange={e => tf('description', e.target.value)}
                  rows={3}
                  className={cls}
                  placeholder="Penjelasan langkah yang tampil di halaman guest..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={saveTentang}
                disabled={tBusy}
                className="bg-red-800 text-white px-5 py-2 rounded-xl text-sm font-bold
                  hover:bg-red-900 disabled:opacity-50 transition-all"
              >
                {tBusy ? 'Menyimpan...' : tForm.id ? 'Simpan' : 'Tambah'}
              </button>
              {tForm.id && (
                <button
                  onClick={() => setTForm({ id: null, title: '', description: '' })}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50"
                >
                  Batal
                </button>
              )}
            </div>
          </div>

          {/* List Tentang */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 font-black text-gray-900">
              Daftar Langkah ({tentangList.length})
            </div>
            {tentangList.length === 0
              ? <p className="p-10 text-center text-gray-400 text-sm">Belum ada langkah</p>
              : tentangList.map((item, i) => (
                <div key={item.id}
                  className="flex items-start gap-3 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 group transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-red-800 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setTForm({ ...item }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => delTentang(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </>
      )}

      {/* ═══════════════ TAB POSTER ═══════════════ */}
      {!loading && tab === 'poster' && (
        <>
          {/* Form Poster */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h2 className="font-black text-gray-900 mb-4">
              {pForm.id ? 'Edit Poster' : 'Tambah Poster Infografis'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Kolom kiri: upload gambar */}
              <ImageUploader
                currentUrl={preview}
                onFileChange={handleFileChange}
                onClear={clearImage}
              />

              {/* Kolom kanan: field teks */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Judul Poster <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={pForm.title}
                    onChange={e => pf('title', e.target.value)}
                    className={cls}
                    placeholder="cth: Panduan Rute Grebeg Suro"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi (opsional)</label>
                  <textarea
                    value={pForm.description}
                    onChange={e => pf('description', e.target.value)}
                    rows={4}
                    className={cls}
                    placeholder="Keterangan poster yang muncul saat hover..."
                  />
                </div>
                {pForm.id && !imgFile && pForm.image_url && (
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                    Biarkan kosong untuk tetap pakai gambar lama. Klik gambar di kiri untuk menggantinya.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={savePoster}
                disabled={pBusy}
                className="bg-red-800 text-white px-5 py-2 rounded-xl text-sm font-bold
                  hover:bg-red-900 disabled:opacity-50 transition-all"
              >
                {pBusy
                  ? (imgFile ? 'Mengupload...' : 'Menyimpan...')
                  : (pForm.id ? 'Simpan Perubahan' : 'Tambah Poster')
                }
              </button>
              {pForm.id && (
                <button
                  onClick={resetPoster}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50"
                >
                  Batal
                </button>
              )}
            </div>
          </div>

          {/* Grid Poster */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 font-black text-gray-900">
              Daftar Poster ({posterList.length})
            </div>
            {posterList.length === 0
              ? <p className="p-10 text-center text-gray-400 text-sm">Belum ada poster</p>
              : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
                  {posterList.map(item => (
                    <div key={item.id}
                      className="border border-gray-100 rounded-xl overflow-hidden group hover:border-red-200 hover:shadow-md transition-all">
                      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '2/3' }}>
                        <img
                          src={item.image_url}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => { e.target.src = 'https://placehold.co/400x600/f9fafb/9ca3af?text=Poster' }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity
                          flex items-center justify-center gap-2">
                          <button
                            onClick={() => editPoster(item)}
                            className="px-3 py-1.5 bg-white text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 shadow transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => delPoster(item)}
                            className="px-3 py-1.5 bg-white text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 shadow transition"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-bold text-gray-900 truncate">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </>
      )}
    </div>
  )
}