'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { setImpersonation, clearImpersonation } from '@/app/actions/impersonate'
import { useRouter } from 'next/navigation'
import { Search, Users, X, Loader2 } from 'lucide-react'
import { useDebounce } from 'use-debounce'

export function CustomerImpersonator({ currentImpersonatedId }: { currentImpersonatedId?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 500)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [impersonatedName, setImpersonatedName] = useState<string>('')
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchImpersonatedName() {
      if (!currentImpersonatedId) {
        setImpersonatedName('')
        return
      }
      const { data } = await supabase
        .from('clientes')
        .select('nombre')
        .eq('id', currentImpersonatedId)
        .single()
      if (data) {
        setImpersonatedName(data.nombre)
      }
    }
    fetchImpersonatedName()
  }, [currentImpersonatedId])


  useEffect(() => {
    async function searchClients() {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setResults([])
        return
      }
      
      setLoading(true)
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nombre, rfc')
        .or(`nombre.ilike.%${debouncedSearch}%,rfc.ilike.%${debouncedSearch}%`)
        .limit(10)
        
      setLoading(false)
      if (data) setResults(data)
    }
    searchClients()
  }, [debouncedSearch])

  const handleImpersonate = async (clientId: string) => {
    setActionLoading(true)
    try {
      await setImpersonation(clientId)
      setIsOpen(false)
      setSearch('')
      router.refresh()
    } finally {
      setActionLoading(false)
    }
  }

  const handleClear = async () => {
    setActionLoading(true)
    try {
      await clearImpersonation()
      router.refresh()
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="relative z-50">
      {/* Banner / Button */}
      <div className="flex items-center gap-2">
        {currentImpersonatedId && (
          <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200">
            <span className="max-w-[200px] truncate" title={impersonatedName}>Impersonando: {impersonatedName || 'Cargando...'}</span>
            <button 
              onClick={handleClear} 
              disabled={actionLoading}
              className="p-1 hover:bg-amber-200 rounded-full transition-colors ml-1 disabled:opacity-50"
              title="Dejar de impersonar"
            >
              {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
            </button>
          </div>
        )}
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-2 border border-border text-dark hover:bg-surface transition-colors"
          title="Cambiar Cliente"
        >
          <Users className="w-5 h-5" />
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-white border border-border rounded-2xl shadow-xl overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-border bg-surface-2">
            <h3 className="font-bold text-dark text-sm mb-3">Buscar Cliente (SuperAdmin)</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input 
                type="text" 
                placeholder="Nombre o RFC..." 
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-border rounded-xl focus:outline-none focus:border-brand-500 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {loading && (
              <div className="p-4 text-center text-dark-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              </div>
            )}
            
            {!loading && debouncedSearch.length >= 2 && results.length === 0 && (
              <div className="p-4 text-center text-sm text-dark-500">
                No se encontraron clientes.
              </div>
            )}

            {!loading && results.map(client => (
              <button
                key={client.id}
                onClick={() => handleImpersonate(client.id)}
                disabled={actionLoading}
                className="w-full text-left p-3 hover:bg-brand-50 border-b border-border last:border-0 transition-colors group flex flex-col disabled:opacity-50"
              >
                <span className="font-bold text-dark text-sm group-hover:text-brand-600 transition-colors line-clamp-1">{client.nombre}</span>
                <span className="text-xs text-dark-500 font-mono mt-0.5">{client.rfc || 'Sin RFC'}</span>
              </button>
            ))}
            
            {!loading && debouncedSearch.length < 2 && (
              <div className="p-6 text-center text-xs text-dark-400 italic">
                Escribe al menos 2 caracteres para buscar...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
