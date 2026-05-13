'use client'

import LanguageSwitcher from '@/components/LanguageSwitcher'
import { Bell, Search } from 'lucide-react'
import Link from 'next/link'

export default function Header({ lang, dict }: { lang: string, dict: any }) {
  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-2 md:gap-4 px-4 md:px-6 py-2.5 md:py-3 bg-white border-b border-blue-100"
      style={{ boxShadow: '0 1px 4px rgba(7,99,169,0.06)' }}
    >
      {/* Spacer for mobile hamburger */}
      <div className="w-10 lg:hidden flex-shrink-0" />

      {/* Search bar - hidden on very small screens or made compact */}
      <Link
        href={`/${lang}/shop`}
        className="flex-1 max-w-md flex items-center gap-2 px-3 py-2 rounded-xl border border-blue-100 bg-blue-50/60 text-sm transition-colors hover:border-brand-500/40 min-w-0"
        style={{ color: '#8a8b8d' }}
      >
        <Search size={16} className="flex-shrink-0" />
        <span className="truncate font-medium">
          <span className="hidden sm:inline">{dict.common.search || 'Search products...'}</span>
          <span className="sm:hidden">{dict.common.searchShort || 'Search...'}</span>
        </span>
      </Link>

      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        <div className="hidden xs:block">
          <LanguageSwitcher lang={lang} />
        </div>
        
        <button
          className="p-2 rounded-xl transition-colors hover:bg-blue-50 text-dark-500"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        
        {/* Avatar */}
        <div
          className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-brand-500/20 flex-shrink-0"
          style={{ background: '#0763a9' }}
        >
          D
        </div>
      </div>
    </header>
  )
}
