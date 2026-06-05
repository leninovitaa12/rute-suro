import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function DestinationSection() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('destinasi_sejarah')
        .select('id, nama, deskripsi, kategori, gambar_url, urutan')
        .eq('aktif', true)
        .order('urutan', { ascending: true })
        .limit(3)

      if (!error) setDestinations(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center text-gray-400">
        Memuat destinasi...
      </div>
    </section>
  )

  if (destinations.length === 0) return null

  const large = destinations[0]
  const small = destinations.slice(1, 3)

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-1.5 bg-green-700 rounded-full" />
              <span className="text-xs font-bold tracking-widest uppercase text-[#922626]">Spiritual Landmarks</span>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Destinasi Sejarah</h2>
          </div>
          <p className="text-gray-400 max-w-xs text-sm italic">
            Menjelajahi titik-titik energi dan sejarah yang membentuk identitas kultural Ponorogo.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: small.length > 0 ? '2fr 1fr' : '1fr',
          gridTemplateRows: small.length > 0 ? '1fr 1fr' : '1fr',
          gap: '20px',
          height: '480px',
        }}>

          {/* Large card */}
          <div
            style={{
              gridRow: small.length > 0 ? '1 / 3' : '1',
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#1a1a2e',
            }}
            className="group shadow-md"
          >
            {large.gambar_url ? (
              <img
                src={large.gambar_url}
                alt={large.nama}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                className="group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1e293b, #0f172a)' }} />
            )}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px',
            }}>
              {large.kategori && (
                <span style={{
                  background: '#15803d', color: 'white', fontSize: '10px', fontWeight: 700,
                  padding: '4px 12px', borderRadius: '999px', width: 'fit-content', marginBottom: '10px',
                  textTransform: 'uppercase',
                }}>
                  {large.kategori}
                </span>
              )}
              <h4 style={{ color: 'white', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
                {large.nama}
              </h4>
              {large.deskripsi && (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', maxWidth: '360px' }}>
                  {large.deskripsi}
                </p>
              )}
            </div>
          </div>

          {/* Small cards */}
          {small.map((dest) => (
            <div
              key={dest.id}
              style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#2d1b1b' }}
              className="group shadow-md"
            >
              {dest.gambar_url ? (
                <img
                  src={dest.gambar_url}
                  alt={dest.nama}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  className="group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1e293b, #0f172a)' }} />
              )}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 60%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px',
              }}>
                <h4 style={{ color: 'white', fontSize: '17px', fontWeight: 700 }}>{dest.nama}</h4>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  )
}