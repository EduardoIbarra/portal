'use client'

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
  AlertCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useOrders } from '@/hooks/useOrders'
import { cn } from '@/lib/utils'

export default function OrdersClient({ dict }: { dict: any }) {
  const router = useRouter()
  const { orders, loading, error } = useOrders()

  const statusMap = {
    pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning-bg', label: dict.orders.status.pending },
    processing: { icon: Loader2, color: 'text-brand-500', bg: 'bg-brand-50', label: dict.orders.status.processing },
    shipped: { icon: Truck, color: 'text-brand-500', bg: 'bg-brand-50', label: dict.orders.status.shipped },
    delivered: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success-bg', label: dict.orders.status.delivered },
    cancelled: { icon: XCircle, color: 'text-danger', bg: 'bg-danger-bg', label: dict.orders.status.cancelled },
  }

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 animate-slide-left">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-dark leading-tight">{dict.orders.title}</h1>
          <p className="text-dark-500 font-medium max-w-xl text-sm md:text-base">{dict.orders.subtitle}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="relative group w-full sm:w-64 md:w-80">
            <Search className="crm-input-icon" />
            <input 
              type="text" 
              placeholder={dict.orders.searchPlaceholder}
              className="crm-input pl-11 md:pl-12 py-3 md:py-3.5 !rounded-xl md:!rounded-2xl"
            />
          </div>
          <button className="btn-secondary !p-3 rounded-xl md:!rounded-2xl border-blue-100 flex-shrink-0">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="card-hover card !p-5 md:!p-8 flex items-center gap-4 md:gap-6">
           <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
              <Package className="w-6 h-6 md:w-8 md:h-8" />
           </div>
           <div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-dark-300 mb-0.5 md:mb-1">{dict.orders.totalOrders}</p>
              <p className="text-2xl md:text-3xl font-black text-dark tracking-tighter leading-none">{orders.length}</p>
           </div>
        </div>
        <div className="card-hover card !p-5 md:!p-8 flex items-center gap-4 md:gap-6">
           <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-warning-bg flex items-center justify-center text-warning flex-shrink-0">
              <Clock className="w-6 h-6 md:w-8 md:h-8" />
           </div>
           <div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-dark-300 mb-0.5 md:mb-1">{dict.orders.inTransit}</p>
              <p className="text-2xl md:text-3xl font-black text-dark tracking-tighter leading-none">{orders.filter(o => o.status === 'shipped').length}</p>
           </div>
        </div>
        <div className="card-hover card !p-5 md:!p-8 flex items-center gap-4 md:gap-6 sm:col-span-2 lg:col-span-1">
           <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-success-bg flex items-center justify-center text-success flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
           </div>
           <div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-dark-300 mb-0.5 md:mb-1">{dict.orders.delivered}</p>
              <p className="text-2xl md:text-3xl font-black text-dark tracking-tighter leading-none">{orders.filter(o => o.status === 'delivered').length}</p>
           </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="card rounded-[2.5rem] overflow-hidden min-h-[500px] relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
          </div>
        )}

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[700px] md:min-w-full">
            <thead>
              <tr className="bg-surface-2 border-b border-border">
                <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">{dict.orders.table.orderId}</th>
                <th className="hidden sm:table-cell px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">{dict.orders.table.date}</th>
                <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">{dict.orders.table.destination}</th>
                <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">{dict.orders.table.status}</th>
                <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300 text-right">{dict.orders.table.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-2">
              {orders.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center text-dark-300 italic">
                    {dict.orders.table.noOrders}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const status = statusMap[order.status as keyof typeof statusMap] || statusMap.pending
                  return (
                    <tr 
                      key={order.id} 
                      onClick={() => router.push(`/es/orders/${order.id}`)}
                      className="hover:bg-brand-50/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-4 md:px-10 py-5 md:py-8">
                        <span className="font-black text-xs md:text-sm text-dark tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</span>
                        <div className="sm:hidden mt-0.5">
                          <span className="text-[9px] text-dark-500 font-bold">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 md:px-10 py-5 md:py-8">
                        <span className="text-sm text-dark-500 font-bold">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 md:px-10 py-5 md:py-8">
                        <p className="text-xs md:text-sm font-black text-dark truncate max-w-[120px] md:max-w-none">{order.hospitals?.name || dict.orders.table.generalInventory}</p>
                        <p className="text-[9px] md:text-[10px] text-dark-300 font-bold uppercase tracking-widest">Mexico City, MX</p>
                      </td>
                      <td className="px-4 md:px-10 py-5 md:py-8">
                        <div className={cn("inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-border-2", status.bg, status.color)}>
                          <status.icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4", order.status === 'processing' && 'animate-spin')} />
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-10 py-5 md:py-8 text-right">
                        <span className="font-black text-dark text-base md:text-lg font-mono">
                          ${order.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
