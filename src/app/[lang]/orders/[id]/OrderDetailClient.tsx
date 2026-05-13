'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  ChevronLeft, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  Loader2,
  Calendar,
  Hash,
  CreditCard
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function OrderDetailClient({ id, dict }: { id: string, dict: any }) {
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const statusMap = {
    pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning-bg', label: dict.orders.status.pending },
    processing: { icon: Loader2, color: 'text-brand-500', bg: 'bg-brand-50', label: dict.orders.status.processing },
    shipped: { icon: Truck, color: 'text-brand-500', bg: 'bg-brand-50', label: dict.orders.status.shipped },
    delivered: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success-bg', label: dict.orders.status.delivered },
    cancelled: { icon: XCircle, color: 'text-danger', bg: 'bg-danger-bg', label: dict.orders.status.cancelled },
  }

  useEffect(() => {
    async function fetchOrderDetail() {
      try {
        setLoading(true)
        
        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single()

        if (orderError) throw orderError
        setOrder(orderData)

        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id)

        if (itemsError) throw itemsError
        
        // Fetch products separately to avoid relationship error
        if (itemsData && itemsData.length > 0) {
          const productIds = itemsData.map((item: any) => item.product_id)
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('id, name, sku, image_url')
            .in('id', productIds)

          if (!productsError && productsData) {
            const itemsWithProducts = itemsData.map((item: any) => ({
              ...item,
              products: productsData.find((p: any) => p.id === item.product_id)
            }))
            setItems(itemsWithProducts)
          } else {
            setItems(itemsData)
          }
        } else {
          setItems([])
        }
      } catch (err) {
        console.error('Error fetching order:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetail()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <XCircle className="w-16 h-16 text-danger" />
        <h2 className="text-2xl font-black text-dark">Order not found</h2>
        <a href="/es/orders" className="text-brand-500 font-bold hover:underline">{dict.orders.detail.back}</a>
      </div>
    )
  }

  const status = statusMap[order.status as keyof typeof statusMap] || statusMap.pending

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-12 animate-fade-in">
      <header className="space-y-6">
        <a 
          href="/es/orders" 
          className="inline-flex items-center gap-2 text-dark-500 font-bold hover:text-brand-500 transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          {dict.orders.detail.back}
        </a>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-dark">{dict.orders.detail.title}</h1>
              <div className={cn("px-4 py-1.5 rounded-full border border-border-2 flex items-center gap-2", status.bg, status.color)}>
                <status.icon className={cn("w-4 h-4", order.status === 'processing' && 'animate-spin')} />
                <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
              </div>
            </div>
            <p className="text-dark-500 font-medium flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Hash className="w-4 h-4" />
                #{order.id.slice(0, 8).toUpperCase()}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(order.created_at).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section className="card rounded-[2.5rem] overflow-hidden">
            <div className="p-6 md:p-8 bg-surface-2 border-b border-border">
              <h3 className="font-black text-lg text-dark flex items-center gap-3">
                <Package className="w-6 h-6 text-brand-500" />
                {dict.orders.detail.items}
              </h3>
            </div>
            <div className="divide-y divide-border-2">
              {items.map((item) => (
                <div key={item.id} className="p-6 md:p-8 flex gap-6 group hover:bg-brand-50/30 transition-colors">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-surface-2 rounded-3xl flex items-center justify-center flex-shrink-0 border border-border group-hover:scale-105 transition-transform">
                    {item.products?.image_url ? (
                      <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover rounded-3xl" />
                    ) : (
                      <Package className="w-10 h-10 text-dark-100" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-base text-dark line-clamp-1">{item.products?.name}</h4>
                    <p className="text-[10px] text-dark-300 font-black uppercase tracking-widest">{item.products?.sku}</p>
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-dark-500 text-sm">
                        <span className="font-black text-dark">{item.quantity}</span> x ${item.unit_price.toLocaleString()}
                      </p>
                      <p className="font-black text-brand-500 text-lg">${item.total_price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="card rounded-[2.5rem] p-8 md:p-10 space-y-8 bg-dark text-white border-none shadow-2xl shadow-brand-500/20">
            <h3 className="font-black text-xl flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-brand-500" />
              {dict.orders.detail.summary}
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-dark-300 font-bold uppercase tracking-widest">{dict.orders.detail.subtotal}</span>
                <span className="font-mono font-bold">${(order.total_amount / 1.16).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-300 font-bold uppercase tracking-widest">{dict.orders.detail.tax}</span>
                <span className="font-mono font-bold">${(order.total_amount - (order.total_amount / 1.16)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="h-px bg-white/10 my-6" />
              <div className="flex justify-between items-end">
                <span className="text-sm font-black uppercase tracking-[0.2em] text-brand-500">{dict.orders.detail.total}</span>
                <span className="text-4xl font-black tracking-tighter">
                  ${order.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </section>

          <section className="card rounded-[2.5rem] p-8 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-300">{dict.orders.detail.status}</p>
              <p className="text-lg font-black text-dark">{status.label}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-300">{dict.orders.detail.date}</p>
              <p className="text-lg font-black text-dark">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
