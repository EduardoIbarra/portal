'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from "@/components/Sidebar"
import Header from "@/components/Header"
import { cn } from '@/lib/utils'

export function MainLayout({ 
  children, 
  lang, 
  dict,
  user
}: { 
  children: React.ReactNode, 
  lang: string, 
  dict: any,
  user: any
}) {
  const pathname = usePathname()
  const isLoginPage = pathname?.includes('/login')
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex bg-bg min-h-screen">
      {!isLoginPage && (
        <Sidebar 
          lang={lang} 
          dict={dict} 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
        />
      )}
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 min-w-0",
        !isLoginPage ? (collapsed ? "lg:ml-16" : "lg:ml-60") : "ml-0"
      )}>
        {!isLoginPage && <Header lang={lang} dict={dict} user={user} />}
        
        <main className={cn(
          "flex-1 transition-all duration-300",
          !isLoginPage ? "p-4 md:p-8" : "p-0"
        )}>
          <div className={cn(
            "mx-auto w-full",
            !isLoginPage ? "max-w-7xl" : "max-w-none"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
