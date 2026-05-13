'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HOKLogo } from '@/components/HOKLogo'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '🎓' },
  { href: '/admin/questions', label: 'HOK Vragen', icon: '📝' },
  { href: '/play', label: 'Meedoen', icon: '🚀' },
]

// Verberg nav op de volledige game-schermen van de speler
const HIDE_ON = ['/play/']

export function Nav() {
  const pathname = usePathname()
  if (HIDE_ON.some(p => pathname.startsWith(p))) return null

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <HOKLogo size={22} className="text-hok-orange" />
          <span className="font-black text-hok-navy text-sm hidden sm:block tracking-tight">
            EHBO Quiz
          </span>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? 'bg-hok-orange text-white shadow-md shadow-hok-orange/30'
                    : 'text-gray-500 hover:text-hok-navy hover:bg-gray-100'
                }`}
              >
                <span>{icon}</span>
                <span className="hidden sm:block">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* HOK admin badge */}
        <Link
          href="/admin"
          className="flex items-center gap-1.5 bg-hok-navy text-white text-xs font-black px-3 py-1.5 rounded-xl hover:bg-hok-navy-light transition-colors shrink-0"
        >
          <HOKLogo size={12} className="text-hok-orange" />
          <span className="hidden sm:block">HOK Beheer</span>
          <span className="sm:hidden">Admin</span>
        </Link>
      </div>
    </header>
  )
}
