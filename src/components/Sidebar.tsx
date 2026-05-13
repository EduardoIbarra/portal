'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Tag, 
  FileText, 
  ShoppingCart, 
  Package,
  Settings,
  LogOut,
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  lang: string
  dict: any
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

interface SidebarContentProps {
  lang: string
  dict: any
  collapsed: boolean
  setMobileOpen: (open: boolean) => void
  pathname: string
}

function SidebarContent({ lang, dict, collapsed, setMobileOpen, pathname }: SidebarContentProps) {
  const navItems = [
    { href: `/${lang}`, icon: LayoutDashboard, label: dict.common.dashboard },
    { href: `/${lang}/prices`, icon: Tag, label: dict.common.prices },
    { href: `/${lang}/distributor-letter`, icon: FileText, label: dict.common.distributorLetter },
    { href: `/${lang}/shop`, icon: ShoppingCart, label: dict.common.shop },
    { href: `/${lang}/orders`, icon: Package, label: dict.common.orders },
  ]

  const isActive = (href: string) =>
    href === `/${lang}` ? pathname === href : pathname.startsWith(href)

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-blue-100">
        {collapsed ? (
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-brand-50">
            <img
              src="https://arthromed.mx/wp-content/uploads/2024/01/logoOrigPag.png"
              alt="Arthromed"
              className="h-8 w-auto object-contain object-left"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="https://arthromed.mx/wp-content/uploads/2024/01/logoOrigPag.png"
              alt="Arthromed Portal"
              className="h-9 w-auto object-contain flex-shrink-0"
            />
            <span
              className="text-[10px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0 bg-brand-500 text-white tracking-widest"
            >
              PORTAL
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group border",
                active 
                  ? "bg-brand-50 border-brand-100 text-brand-500" 
                  : "border-transparent text-dark-500 hover:bg-brand-50/50 hover:text-brand-500"
              )}
            >
              <Icon
                size={20}
                className={cn("flex-shrink-0", active ? "text-brand-500" : "text-dark-300 group-hover:text-brand-500")}
              />
              {!collapsed && (
                <span className="text-sm font-bold truncate tracking-tight">{item.label}</span>
              )}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full pulse-dot bg-brand-500" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Settings */}
      <div className="p-3 border-t border-blue-100 space-y-1">
        <Link
          href={`/${lang}/settings`}
          title={collapsed ? dict.common.settings : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group border border-transparent text-dark-500 hover:bg-brand-50/50 hover:text-brand-500"
          )}
        >
          <Settings size={20} className="flex-shrink-0 text-dark-300 group-hover:text-brand-500" />
          {!collapsed && <span className="text-sm font-bold tracking-tight">{dict.common.settings}</span>}
        </Link>
        
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-danger hover:bg-danger-bg transition-all border border-transparent group"
          title={collapsed ? dict.common.logout : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-bold tracking-tight">{dict.common.logout}</span>}
        </button>
      </div>
    </div>
  )
}

export function Sidebar({ lang, dict, collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-50 p-2 rounded-xl bg-white border border-blue-100 shadow-sm text-brand-500"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-blue-100 shadow-2xl transform transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-dark-300 hover:bg-brand-50 hover:text-brand-500 transition-all"
        >
          <X size={20} />
        </button>
        <SidebarContent 
          lang={lang} 
          dict={dict} 
          collapsed={false} 
          setMobileOpen={setMobileOpen} 
          pathname={pathname} 
        />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-white border-r border-blue-100 shadow-sm transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent 
          lang={lang} 
          dict={dict} 
          collapsed={collapsed} 
          setMobileOpen={setMobileOpen} 
          pathname={pathname} 
        />
        
        {/* Collapse button (desktop) */}
        <div className="p-3 border-t border-blue-100 bg-surface-2 mt-auto">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg hover:bg-brand-50 text-dark-300 hover:text-brand-500 transition-all text-xs font-black uppercase tracking-widest"
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          >
            {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> {dict.common.collapse || 'COLLAPSE'}</>}
          </button>
        </div>
      </aside>
    </>
  )
}
