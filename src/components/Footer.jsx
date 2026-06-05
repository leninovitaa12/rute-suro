import { Link } from 'react-router-dom'
import { MapPin, Mail, ChevronRight } from 'lucide-react'

const NAV_LINKS = [
  { to: '/',        label: 'Beranda' },
  { to: '/map',     label: 'Peta Rute' },
  { to: '/jadwal',  label: 'Jadwal' },
  { to: '/berita',  label: 'Berita' },
  { to: '/tentang', label: 'Tentang' },
]

const SUPPORT_LINKS = [
  { href: '#', label: 'Kebijakan Privasi' },
  { href: '#', label: 'Syarat & Ketentuan' },
  { href: '#', label: 'Hubungi Kami' },
]

export default function Footer() {
  return (
    <footer className="relative bg-gray-900 text-white overflow-hidden">

      {/* Decorative top border */}
      <div className="h-1 w-full bg-gradient-to-r from-[#922626] via-[#c0392b] to-[#7c1d1d]" />

      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#922626]/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-10">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-14">

          {/* Brand col */}
          <div className="md:col-span-4">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white">Rute Suro</span>
                <p className="text-[11px] text-gray-400 font-medium tracking-widest uppercase -mt-0.5">Ponorogo</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Sistem navigasi cerdas untuk perayaan budaya Grebeg Suro — membantu warga dan wisatawan menjelajahi Ponorogo dengan aman dan efisien.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                  <MapPin size={13} />
                </div>
                Ponorogo, Jawa Timur
              </div>
            </div>
          </div>

          {/* Navigasi col */}
          <div className="md:col-span-3 md:col-start-6">
            <h4 className="text-xs font-bold tracking-widest uppercase text-[#e87070] mb-5">Navigasi</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronRight
                      size={13}
                      className="text-[#922626] opacity-0 group-hover:opacity-100 -ml-1 transition-opacity"
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Dukungan col */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold tracking-widest uppercase text-[#e87070] mb-5">Dukungan</h4>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="group flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronRight
                      size={13}
                      className="text-[#922626] opacity-0 group-hover:opacity-100 -ml-1 transition-opacity"
                    />
                    {label}
                  </a>
                </li>
              ))}
            </ul>

          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-7">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Rute Suro. Navigasi Cerdas untuk Budaya Ponorogo.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-600">Dibuat</span>
            <span className="text-xs text-gray-600">untuk Ponorogo</span>
          </div>
        </div>

      </div>
    </footer>
  )
}