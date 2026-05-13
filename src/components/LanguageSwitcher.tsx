'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Languages } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LanguageSwitcher({ lang }: { lang: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const switchLanguage = (newLang: string) => {
    const segments = pathname.split('/')
    segments[1] = newLang
    router.push(segments.join('/'))
  }

  return (
    <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border shadow-sm">
      {[
        { code: 'es', label: 'ES' },
        { code: 'en', label: 'EN' },
        { code: 'zh', label: 'ZH' }
      ].map((l) => (
        <button
          key={l.code}
          onClick={() => switchLanguage(l.code)}
          className={cn(
            "px-2.5 py-1 rounded-lg text-[10px] font-black transition-all",
            lang === l.code
              ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
              : "text-dark-500 hover:bg-brand-50 hover:text-brand-500"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
