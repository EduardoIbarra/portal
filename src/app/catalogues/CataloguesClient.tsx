'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { BookOpen, FileText, Download, ExternalLink } from 'lucide-react'

interface Catalogue {
  id: string
  name: string
  description: string
  pdf_url: string
  created_at: string
}

export default function CataloguesClient({ dict }: { dict: any }) {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchCatalogues() {
      try {
        const { data, error } = await supabase
          .from('catalogos')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setCatalogues(data || [])
      } catch (error) {
        console.error('Error fetching catalogues:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCatalogues()
  }, [])

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-dark tracking-tight mb-2 flex items-center gap-3">
            <div className="p-3 bg-brand-50 rounded-xl text-brand-500">
              <BookOpen size={28} />
            </div>
            Catálogos
          </h1>
          <p className="text-dark-500 text-lg font-medium">Explora nuestros catálogos de productos y especialidades.</p>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card !p-6 h-64 animate-pulse flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-surface-2 rounded-xl mb-4" />
                <div className="h-6 bg-surface-2 rounded w-3/4 mb-2" />
                <div className="h-4 bg-surface-2 rounded w-full mb-2" />
                <div className="h-4 bg-surface-2 rounded w-2/3" />
              </div>
              <div className="h-12 bg-surface-2 rounded-xl w-full mt-6" />
            </div>
          ))}
        </div>
      ) : catalogues.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-8 bg-white rounded-[2rem] border border-blue-100/50 shadow-sm">
          <BookOpen className="w-16 h-16 text-dark-300 mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-dark mb-2">No hay catálogos disponibles</h3>
          <p className="text-dark-500 max-w-sm">Vuelve más tarde para consultar nuestros catálogos actualizados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogues.map((cat) => (
            <div 
              key={cat.id} 
              className="card !p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-transparent hover:border-brand-200"
            >
              <div>
                <div className="w-12 h-12 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <h3 className="text-xl font-black text-dark mb-2 tracking-tight group-hover:text-brand-500 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-dark-500 text-sm font-medium line-clamp-3 leading-relaxed">
                  {cat.description || 'Sin descripción'}
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border-2">
                <a 
                  href={cat.pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  Ver PDF
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
