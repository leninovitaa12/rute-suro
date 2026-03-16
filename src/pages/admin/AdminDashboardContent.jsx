import { useState, useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import { supabase } from '../../lib/supabase'
import {
  getSejarah, createSejarah, updateSejarah, deleteSejarah,
  getTentang, createTentang, updateTentang, deleteTentang,
  getPoster, createPoster, updatePoster, deletePoster,
} from '../../lib/backendApi'

// Helper SweetAlert
const swal = {
  confirmDelete: (name) => Swal.fire({
    icon: 'warning', title: `Hapus ${name}?`,
    text: 'Data yang dihapus tidak dapat dikembalikan.',
    showCancelButton: true, reverseButtons: true,
    confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal',
  }),
  successDelete: (name) => Swal.fire({
    icon: 'success', title: 'Berhasil Dihapus!', text: `${name} telah dihapus.`,
    timer: 1500, timerProgressBar: true, showConfirmButton: false,
  }),
  successSave: (name, isEdit) => Swal.fire({
    icon: 'success',
    title: isEdit ? 'Berhasil Diperbarui!' : 'Berhasil Ditambahkan!',
    text: `${name}${isEdit ? ' telah diperbarui.' : ' baru telah ditambahkan.'}`,
    timer: 1600, timerProgressBar: true, showConfirmButton: false,
  }),
  error: (msg) => Swal.fire({
    icon: 'error', title: 'Terjadi Kesalahan',
    text: msg || 'Silakan coba lagi.', confirmButtonColor: '#dc2626',
  }),
}

// Shared CSS
const sharedStyles = `
  @keyframes slideInUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn       { from{opacity:0;transform:scale(.95)}       to{opacity:1;transform:scale(1)} }
  @keyframes slideInRight { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes shimmer      { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  .content-header { animation:slideInUp .5s ease-out; }
  .content-button { animation:slideInUp .6s ease-out .1s backwards; }
  .form-modal     { animation:fadeIn .3s ease-out; }
  .table-row      { animation:slideInRight .3s ease-out; }
  .form-input:focus { box-shadow:0 0 0 3px rgba(220,38,38,.1); }
  .poster-adm-card {
    border:1.5px solid #e5e7eb; border-radius:14px;
    background:#fff; overflow:hidden;
    transition:box-shadow .3s, border-color .3s, transform .3s;
  }
  .poster-adm-card:hover {
    border-color:rgba(220,38,38,.4);
    box-shadow:0 12px 32px rgba(153,27,27,.1);
    transform:translateY(-4px);
  }
  .poster-adm-card img { width:100%; aspect-ratio:3/4; object-fit:cover; display:block; }
  .upload-zone {
    border:2px dashed #d1d5db; border-radius:12px;
    padding:28px 16px; text-align:center; cursor:pointer; position:relative;
    transition:border-color .25s, background .25s;
  }
  .upload-zone:hover { border-color:#dc2626; background:#fff5f5; }
  .upload-zone.has-preview { border-color:#dc2626; border-style:solid; padding:0; overflow:hidden; }
  .poster-skeleton {
    width:100%; aspect-ratio:3/4; border-radius:14px;
    background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);
    background-size:200% 100%; animation:shimmer 1.5s infinite;
  }
`

// Reusable CRUD Manager — Sejarah
function ContentManager({ title, description, itemName, contentType }) {
  const [showForm, setShowForm]   = useState(false)
  const [items, setItems]         = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [formData, setFormData]   = useState({ title: '', description: '' })
  const [error, setError]         = useState(null)

  useEffect(() => { loadData() }, [contentType])

  const loadData = async () => {
    try {
      setLoading(true); setError(null)
      const data = contentType === 'sejarah' ? await getSejarah() : await getTentang()
      setItems(data)
    } catch (err) {
      console.error('[v0] load:', err); setError('Gagal memuat data')
    } finally { setLoading(false) }
  }

  const openAdd  = () => { setFormData({ title: '', description: '' }); setEditingId(null); setShowForm(true) }
  const openEdit = (item) => { setFormData(item); setEditingId(item.id); setShowForm(true) }

  const handleDelete = async (id) => {
    const res = await swal.confirmDelete(itemName)
    if (!res.isConfirmed) return
    try {
      contentType === 'sejarah' ? await deleteSejarah(id) : await deleteTentang(id)
      setItems(prev => prev.filter(i => i.id !== id))
      await swal.successDelete(itemName)
    } catch (err) { await swal.error('Gagal menghapus ' + itemName.toLowerCase()) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isEdit = !!editingId
    try {
      if (isEdit) {
        contentType === 'sejarah' ? await updateSejarah(editingId, formData) : await updateTentang(editingId, formData)
        setItems(prev => prev.map(i => i.id === editingId ? { ...i, ...formData } : i))
      } else {
        const newItem = contentType === 'sejarah' ? await createSejarah(formData) : await createTentang(formData)
        if (newItem) setItems(prev => [...prev, newItem])
      }
      setShowForm(false)
      setFormData({ title: '', description: '' })
      await swal.successSave(itemName, isEdit)
    } catch (err) { await swal.error('Gagal menyimpan ' + itemName.toLowerCase()) }
  }

  return (
    <div>
      <style>{sharedStyles}</style>
      <div className="content-header mb-10">
        <h1 className="text-4xl font-black text-gray-900 mb-3">{title}</h1>
        <p className="text-lg text-gray-600">{description}</p>
      </div>
      <div className="mb-8">
        <button onClick={openAdd} className="content-button group relative px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 overflow-hidden">
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"/>
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
            Tambah {itemName} Baru
          </span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="form-modal bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <h2 className="text-2xl font-black text-gray-900">{editingId ? 'Edit' : 'Tambah'} {itemName}</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Judul</label>
                <input type="text" name="title" value={formData.title} onChange={e=>setFormData(p=>({...p,title:e.target.value}))} placeholder="Masukkan judul" className="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300" required/>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi / Konten</label>
                <textarea name="description" value={formData.description} onChange={e=>setFormData(p=>({...p,description:e.target.value}))} placeholder="Masukkan deskripsi atau konten lengkap" rows="6" className="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 resize-none" required/>
              </div>
              <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300">Batal</button>
                <button type="submit" className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">Simpan {itemName}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Judul</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Deskripsi</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="3" className="px-6 py-12 text-center text-gray-500">Memuat data...</td></tr>
              ) : error ? (
                <tr><td colSpan="3" className="px-6 py-12 text-center text-red-600 font-medium">{error}</td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                      <p className="text-gray-500 font-medium">Belum ada {itemName.toLowerCase()}</p>
                      <p className="text-gray-400 text-sm">Tambahkan yang baru untuk memulai</p>
                    </div>
                  </td>
                </tr>
              ) : items.map((item, idx) => (
                <tr key={item.id} className="table-row hover:bg-red-50/30 transition-colors duration-300 border-b border-gray-100 last:border-0" style={{animationDelay:`${idx*.05}s`}}>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs" title={item.description}>{item.description.substring(0,40)}{item.description.length>40?'...':''}</td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button onClick={()=>openEdit(item)} className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 hover:shadow transition-all duration-300 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button onClick={()=>handleDelete(item.id)} className="px-4 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 hover:shadow transition-all duration-300 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// PosterManager — inline di dalam AdminTentang
function PosterManager() {
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview]     = useState(null)
  const [formError, setFormError] = useState(null)
  const [formData, setFormData]   = useState({ title: '', description: '', image_url: '' })
  const fileRef = useRef()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setItems(await getPoster())
    } catch (err) { await swal.error('Gagal memuat data poster') }
    finally { setLoading(false) }
  }

  const openAdd = () => {
    setFormData({ title: '', description: '', image_url: '' })
    setPreview(null); setEditingId(null); setFormError(null); setShowForm(true)
  }

  const openEdit = (item) => {
    setFormData({ title: item.title, description: item.description || '', image_url: item.image_url || '' })
    setPreview(item.image_url || null); setEditingId(item.id); setFormError(null); setShowForm(true)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) { setFormError('Format tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.'); return }
    if (file.size > 5 * 1024 * 1024) { setFormError('Ukuran file maksimal 5 MB.'); return }

    setPreview(URL.createObjectURL(file)); setFormError(null); setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const filePath = `public/poster_${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('posters').upload(filePath, file, { cacheControl: '3600', upsert: false })
      if (upErr) throw upErr
      const { data: urlData } = supabase.storage.from('posters').getPublicUrl(filePath)
      setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }))
    } catch (err) {
      setFormError('Gagal mengupload: ' + (err.message || 'Coba lagi'))
      setPreview(formData.image_url || null)
    } finally { setUploading(false) }
  }

  const handleDelete = async (item) => {
    const res = await swal.confirmDelete('Poster')
    if (!res.isConfirmed) return
    try {
      if (item.image_url?.includes('/posters/')) {
        const fp = item.image_url.split('/posters/')[1]
        if (fp) await supabase.storage.from('posters').remove([fp])
      }
      await deletePoster(item.id)
      setItems(prev => prev.filter(p => p.id !== item.id))
      await swal.successDelete('Poster')
    } catch (err) { await swal.error('Gagal menghapus poster') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.image_url) { setFormError('Gambar poster wajib diupload.'); return }
    const isEdit = !!editingId
    try {
      setFormError(null)
      if (isEdit) {
        await updatePoster(editingId, formData)
        setItems(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } : p))
      } else {
        const newItem = await createPoster(formData)
        if (newItem) setItems(prev => [newItem, ...prev])
      }
      setShowForm(false)
      await swal.successSave('Poster', isEdit)
    } catch (err) { await swal.error('Gagal menyimpan poster') }
  }

  return (
    <div className="mt-14 pt-10 border-t-2 border-dashed border-gray-200">
      {/* Sub-header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Poster &amp; Infografis
          </h2>
          <p className="text-sm text-gray-500 mt-1">Gambar poster yang ditampilkan di halaman Tentang (klik untuk lightbox)</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
          Tambah Poster
        </button>
      </div>

      {/* Form Modal Poster */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="form-modal bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <h2 className="text-2xl font-black text-gray-900">{editingId ? 'Edit' : 'Tambah'} Poster</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {formError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">{formError}</p>
                </div>
              )}

              {/* Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Gambar Poster <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-1">(JPG/PNG/WEBP · maks 5MB · rasio 3:4 ideal)</span>
                </label>
                <div className={`upload-zone ${preview ? 'has-preview' : ''}`} onClick={()=>!uploading&&fileRef.current.click()}>
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" style={{width:'100%',aspectRatio:'3/4',objectFit:'cover',display:'block'}}/>
                      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0)',transition:'background .25s'}}
                        onMouseOver={e=>e.currentTarget.style.background='rgba(0,0,0,0.45)'}
                        onMouseOut={e=>e.currentTarget.style.background='rgba(0,0,0,0)'}>
                        <div style={{color:'white',textAlign:'center',opacity:0,transition:'opacity .25s',pointerEvents:'none'}}
                          ref={el=>{if(el){const p=el.parentElement;p.addEventListener('mouseover',()=>{el.style.opacity=1});p.addEventListener('mouseout',()=>{el.style.opacity=0})}}}>
                          <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{margin:'0 auto 6px'}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01"/></svg>
                          <p style={{fontSize:'13px',fontWeight:700}}>Ganti Gambar</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="pointer-events-none">
                      {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                          <svg className="animate-spin w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                          <p className="text-gray-600 font-medium text-sm">Mengupload gambar...</p>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto mb-3 w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                          <p className="text-gray-600 font-semibold text-sm mb-1">Klik untuk upload gambar poster</p>
                          <p className="text-gray-400 text-xs">JPG, PNG, WEBP — Maks 5MB</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange}/>
              </div>

              {/* Judul */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Judul Poster</label>
                <input type="text" value={formData.title} onChange={e=>setFormData(p=>({...p,title:e.target.value}))} placeholder="Contoh: Panduan Rute Grebeg Suro 2025" className="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300" required/>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi <span className="text-gray-400 font-normal">(opsional)</span></label>
                <textarea value={formData.description} onChange={e=>setFormData(p=>({...p,description:e.target.value}))} placeholder="Deskripsi singkat isi poster" rows="3" className="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 resize-none"/>
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300">Batal</button>
                <button type="submit" disabled={uploading} className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
                  {uploading ? 'Mengupload...' : 'Simpan Poster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid Poster */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i=><div key={i} className="poster-skeleton"/>)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-14 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <p className="text-gray-500 font-semibold">Belum ada poster</p>
          <p className="text-gray-400 text-sm mt-1">Tambahkan poster infografis untuk halaman Tentang</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item, idx) => (
            <div key={item.id} className="poster-adm-card" style={{animation:'slideInRight .3s ease-out both',animationDelay:`${idx*.06}s`}}>
              <img src={item.image_url} alt={item.title} onError={e=>{e.target.src='https://placehold.co/300x400?text=Poster'}}/>
              <div style={{padding:'12px'}}>
                <p style={{fontWeight:700,color:'#111827',fontSize:'13px',marginBottom:'3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={item.title}>{item.title}</p>
                {item.description && <p style={{color:'#9ca3af',fontSize:'11px',marginBottom:'8px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={item.description}>{item.description}</p>}
                <div style={{display:'flex',gap:'6px',marginTop:item.description?0:'8px'}}>
                  <button onClick={()=>openEdit(item)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-100 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Edit
                  </button>
                  <button onClick={()=>handleDelete(item)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold text-xs hover:bg-red-100 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Exports
export function AdminSejarah() {
  return (
    <ContentManager
      title="Manajemen Sejarah"
      description="Kelola konten sejarah Grebeg Suro"
      itemName="Sejarah"
      contentType="sejarah"
    />
  )
}

export function AdminTentang() {
  return (
    <div>
      <ContentManager
        title="Manajemen Tentang"
        description="Kelola informasi langkah cara kerja Rute Suro"
        itemName="Tentang"
        contentType="tentang"
      />
      {/* ── Poster CRUD — satu halaman dengan Tentang ── */}
      <PosterManager />
    </div>
  )
}