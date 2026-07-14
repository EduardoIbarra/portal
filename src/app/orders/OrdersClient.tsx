'use client'

import { useState } from 'react'
import { 
  Package, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  Loader2,
  AlertCircle,
  FileText,
  ClipboardList,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useOrders } from '@/hooks/useOrders'
import { cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

export default function OrdersClient({ dict, clientId }: { dict: any; clientId?: string }) {
  const router = useRouter()
  const { orders: facturas, quotes, loading, error } = useOrders(clientId)
  
  const [activeTab, setActiveTab] = useState<'facturado' | 'no_facturado'>('facturado')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const statusMap = {
    pagada: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success-bg', label: 'Pagada' },
    pendiente: { icon: Clock, color: 'text-warning', bg: 'bg-warning-bg', label: 'Pendiente' },
    cancelada: { icon: XCircle, color: 'text-danger', bg: 'bg-danger-bg', label: 'Cancelada' },
  }

  const surtidoMap = {
    completa: { icon: Package, color: 'text-brand-500', bg: 'bg-brand-50', label: 'Surtida' },
    no_surtida: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning-bg', label: 'No Surtida' },
  }

  const quoteStatusMap = {
    draft: { icon: Clock, color: 'text-dark-400', bg: 'bg-surface-2', label: 'Borrador' },
    pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning-bg', label: 'Pendiente' },
    approved: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success-bg', label: 'Aprobada' },
    sent: { icon: CheckCircle2, color: 'text-brand-500', bg: 'bg-brand-50', label: 'Enviada' },
    rejected: { icon: XCircle, color: 'text-danger', bg: 'bg-danger-bg', label: 'Rechazada' },
  }

  // Handle Tab Switch
  const handleTabChange = (tab: 'facturado' | 'no_facturado') => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearch('')
  }

  // Filtered Data based on Active Tab and Search
  const filteredData = activeTab === 'facturado' 
    ? facturas.filter(f => 
        f.numero_factura?.toLowerCase().includes(search.toLowerCase()) ||
        new Date(f.fecha_expedicion).toLocaleDateString().includes(search) ||
        f.total?.toString().includes(search)
      )
    : quotes.filter(q => 
        q.id?.toLowerCase().includes(search.toLowerCase()) ||
        new Date(q.created_at).toLocaleDateString().includes(search) ||
        q.total_amount?.toString().includes(search) ||
        q.status?.toLowerCase().includes(search.toLowerCase())
      )

  // Pagination Logic
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems)
  const paginatedData = filteredData.slice(startIndex, ITEMS_PER_PAGE * currentPage)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 animate-slide-left">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-dark leading-tight">
            {activeTab === 'facturado' ? dict.orders.title : 'Mis Cotizaciones'}
          </h1>
          <p className="text-dark-500 font-medium max-w-xl text-sm md:text-base">
            {activeTab === 'facturado' ? dict.orders.subtitle : 'Consulta tus cotizaciones y lleva un registro de tus solicitudes sin facturar.'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="relative group w-full sm:w-64 md:w-80">
            <Search className="crm-input-icon" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder={activeTab === 'facturado' ? dict.orders.searchPlaceholder : 'Buscar cotizaciones...'}
              className="crm-input pl-11 md:pl-12 py-3 md:py-3.5 !rounded-xl md:!rounded-2xl"
            />
          </div>
        </div>
      </header>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => handleTabChange('facturado')}
          className={cn(
            "pb-4 text-sm md:text-base font-black transition-all relative",
            activeTab === 'facturado' 
              ? "text-brand-500 border-b-2 border-brand-500" 
              : "text-dark-300 hover:text-dark"
          )}
        >
          Facturado
        </button>
        <button
          onClick={() => handleTabChange('no_facturado')}
          className={cn(
            "pb-4 text-sm md:text-base font-black transition-all relative",
            activeTab === 'no_facturado' 
              ? "text-brand-500 border-b-2 border-brand-500" 
              : "text-dark-300 hover:text-dark"
          )}
        >
          No facturado
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {activeTab === 'facturado' ? (
          <>
            <div className="card-hover card !p-5 md:!p-8 flex items-center gap-4 md:gap-6">
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                  <FileText className="w-6 h-6 md:w-8 md:h-8" />
               </div>
               <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-dark-300 mb-0.5 md:mb-1">{dict.orders.totalOrders}</p>
                  <p className="text-2xl md:text-3xl font-black text-dark tracking-tighter leading-none">{facturas.length}</p>
               </div>
            </div>
            <div className="card-hover card !p-5 md:!p-8 flex items-center gap-4 md:gap-6">
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-warning-bg flex items-center justify-center text-warning flex-shrink-0">
                  <Clock className="w-6 h-6 md:w-8 md:h-8" />
               </div>
               <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-dark-300 mb-0.5 md:mb-1">Pendientes</p>
                  <p className="text-2xl md:text-3xl font-black text-dark tracking-tighter leading-none">{facturas.filter(o => o.estado === 'pendiente').length}</p>
               </div>
            </div>
            <div className="card-hover card !p-5 md:!p-8 flex items-center gap-4 md:gap-6 sm:col-span-2 lg:col-span-1">
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-success-bg flex items-center justify-center text-success flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
               </div>
               <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-dark-300 mb-0.5 md:mb-1">Pagadas</p>
                  <p className="text-2xl md:text-3xl font-black text-dark tracking-tighter leading-none">{facturas.filter(o => o.estado === 'pagada').length}</p>
               </div>
            </div>
          </>
        ) : (
          <>
            <div className="card-hover card !p-5 md:!p-8 flex items-center gap-4 md:gap-6">
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                  <ClipboardList className="w-6 h-6 md:w-8 md:h-8" />
               </div>
               <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-dark-300 mb-0.5 md:mb-1">Total Cotizaciones</p>
                  <p className="text-2xl md:text-3xl font-black text-dark tracking-tighter leading-none">{quotes.length}</p>
               </div>
            </div>
            <div className="card-hover card !p-5 md:!p-8 flex items-center gap-4 md:gap-6">
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-warning-bg flex items-center justify-center text-warning flex-shrink-0">
                  <Clock className="w-6 h-6 md:w-8 md:h-8" />
               </div>
               <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-dark-300 mb-0.5 md:mb-1">Borradores</p>
                  <p className="text-2xl md:text-3xl font-black text-dark tracking-tighter leading-none">{quotes.filter(q => q.status === 'draft').length}</p>
               </div>
            </div>
            <div className="card-hover card !p-5 md:!p-8 flex items-center gap-4 md:gap-6 sm:col-span-2 lg:col-span-1">
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-success-bg flex items-center justify-center text-success flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
               </div>
               <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-dark-300 mb-0.5 md:mb-1">Aprobadas</p>
                  <p className="text-2xl md:text-3xl font-black text-dark tracking-tighter leading-none">{quotes.filter(q => q.status === 'approved').length}</p>
               </div>
            </div>
          </>
        )}
      </div>

      {/* Orders / Quotes List */}
      <div className="card rounded-[2.5rem] overflow-hidden min-h-[400px] relative flex flex-col justify-between">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
          </div>
        )}

        <div className="overflow-x-auto scrollbar-hide">
          {activeTab === 'facturado' ? (
            <table className="w-full text-left border-collapse min-w-[800px] md:min-w-full">
              <thead>
                <tr className="bg-surface-2 border-b border-border">
                  <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">Factura</th>
                  <th className="hidden sm:table-cell px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">Fecha</th>
                  <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">Pago</th>
                  <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">Surtido</th>
                  <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-2">
                {paginatedData.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center text-dark-300 italic">
                      {dict.orders.table.noOrders}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((factura) => {
                    const status = statusMap[factura.estado as keyof typeof statusMap] || statusMap.pendiente
                    const surtido = surtidoMap[factura.estado_surtido as keyof typeof surtidoMap] || surtidoMap.no_surtida
                    
                    return (
                      <tr 
                        key={factura.id} 
                        onClick={() => router.push(`/orders/${factura.id}`)}
                        className="hover:bg-brand-50/30 transition-colors group cursor-pointer"
                      >
                        <td className="px-4 md:px-10 py-5 md:py-8">
                          <span className="font-black text-xs md:text-sm text-dark tracking-tight">#{factura.numero_factura}</span>
                          <div className="sm:hidden mt-0.5">
                            <span className="text-[9px] text-dark-500 font-bold">
                              {new Date(factura.fecha_expedicion).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-10 py-5 md:py-8">
                          <span className="text-sm text-dark-500 font-bold">
                            {new Date(factura.fecha_expedicion).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 md:px-10 py-5 md:py-8">
                          <div className={cn("inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-border-2", status.bg, status.color)}>
                            <status.icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4")} />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-10 py-5 md:py-8">
                          <div className={cn("inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-border-2", surtido.bg, surtido.color)}>
                            <surtido.icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4")} />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{surtido.label}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-10 py-5 md:py-8 text-right">
                          <span className="font-black text-dark text-base md:text-lg font-mono">
                            ${Number(factura.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px] md:min-w-full">
              <thead>
                <tr className="bg-surface-2 border-b border-border">
                  <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">Cotización</th>
                  <th className="hidden sm:table-cell px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">Fecha</th>
                  <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">Estado</th>
                  <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-2">
                {paginatedData.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center text-dark-300 italic">
                      No se encontraron cotizaciones.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((quote) => {
                    const status = quoteStatusMap[quote.status as keyof typeof quoteStatusMap] || quoteStatusMap.pending
                    
                    return (
                      <tr 
                        key={quote.id} 
                        className="hover:bg-brand-50/30 transition-colors group"
                      >
                        <td className="px-4 md:px-10 py-5 md:py-8">
                          <span className="font-black text-xs md:text-sm text-dark tracking-tight">Cotización #{quote.id.split('-')[0]}</span>
                          <div className="sm:hidden mt-0.5">
                            <span className="text-[9px] text-dark-500 font-bold">
                              {new Date(quote.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-10 py-5 md:py-8">
                          <span className="text-sm text-dark-500 font-bold">
                            {new Date(quote.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 md:px-10 py-5 md:py-8">
                          <div className={cn("inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-border-2", status.bg, status.color)}>
                            <status.icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4")} />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-10 py-5 md:py-8 text-right">
                          <span className="font-black text-dark text-base md:text-lg font-mono">
                            ${Number(quote.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 md:px-10 py-4 md:py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-2/30">
            <span className="text-xs md:text-sm text-dark-400 font-semibold">
              Mostrando <strong className="text-dark">{startIndex + 1}</strong> a <strong className="text-dark">{endIndex}</strong> de <strong className="text-dark">{totalItems}</strong> resultados
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-secondary !p-2 rounded-xl disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={cn(
                    "w-9 h-9 rounded-xl font-bold text-sm transition-all flex items-center justify-center",
                    currentPage === page
                      ? "bg-brand-500 text-white shadow-sm shadow-brand-500/20"
                      : "text-dark-500 hover:bg-brand-50 hover:text-brand-500"
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-secondary !p-2 rounded-xl disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
