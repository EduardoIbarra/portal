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
  CreditCard,
  AlertCircle,
  FileText,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function OrderDetailClient({ id, dict }: { id: string, dict: any }) {
  const [factura, setFactura] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [planesPago, setPlanesPago] = useState<any[]>([])
  const [receipts, setReceipts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const statusMap = {
    pagada: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success-bg', label: 'Pagada' },
    pendiente: { icon: Clock, color: 'text-warning', bg: 'bg-warning-bg', label: 'Pendiente' },
    cancelada: { icon: XCircle, color: 'text-danger', bg: 'bg-danger-bg', label: 'Cancelada' },
  }

  const surtidoMap = {
    completa: { icon: Package, color: 'text-brand-500', bg: 'bg-brand-50', label: 'Surtida' },
    no_surtida: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning-bg', label: 'No Surtida' },
  }

  const fetchFacturaDetail = async () => {
    try {
      setLoading(true)
      
      const { data: facturaData, error: facturaError } = await supabase
        .from('facturas_cliente')
        .select('*')
        .eq('id', id)
        .single()

      if (facturaError) throw facturaError
      setFactura(facturaData)

      const { data: itemsData, error: itemsError } = await supabase
        .from('factura_productos')
        .select('*, productos(nombre_lista)')
        .eq('factura_id', id)

      if (itemsError) throw itemsError
      setItems(itemsData || [])

      // Fetch payment plans
      const { data: planesData } = await supabase
        .from('planes_pago')
        .select('*, parcialidades(*)')
        .eq('factura_id', id)
      
      if (planesData) setPlanesPago(planesData)

      // Fetch receipts
      const { data: receiptsData } = await supabase
        .from('factura_receipts')
        .select('*')
        .eq('factura_id', id)
      
      if (receiptsData) setReceipts(receiptsData)

    } catch (err) {
      console.error('Error fetching factura:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFacturaDetail()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
      </div>
    )
  }

  if (!factura) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <XCircle className="w-16 h-16 text-danger" />
        <h2 className="text-2xl font-black text-dark">Factura not found</h2>
        <a href="/orders" className="text-brand-500 font-bold hover:underline">{dict.orders.detail.back}</a>
      </div>
    )
  }

  const status = statusMap[factura.estado as keyof typeof statusMap] || statusMap.pendiente
  const surtido = surtidoMap[factura.estado_surtido as keyof typeof surtidoMap] || surtidoMap.no_surtida

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-12 animate-fade-in">
      <header className="space-y-6">
        <a 
          href="/orders" 
          className="inline-flex items-center gap-2 text-dark-500 font-bold hover:text-brand-500 transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          {dict.orders.detail.back}
        </a>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-dark">Factura #{factura.numero_factura}</h1>
              <div className={cn("px-4 py-1.5 rounded-full border border-border-2 flex items-center gap-2", status.bg, status.color)}>
                <status.icon className={cn("w-4 h-4")} />
                <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
              </div>
              <div className={cn("px-4 py-1.5 rounded-full border border-border-2 flex items-center gap-2", surtido.bg, surtido.color)}>
                <surtido.icon className={cn("w-4 h-4")} />
                <span className="text-[10px] font-black uppercase tracking-widest">{surtido.label}</span>
              </div>
            </div>
            <p className="text-dark-500 font-medium flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Hash className="w-4 h-4" />
                {factura.id.slice(0, 8).toUpperCase()}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(factura.fecha_expedicion).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* Tracking Quick Banner */}
      <div className="card rounded-[2rem] p-6 bg-gradient-to-r from-brand-500/10 via-brand-500/5 to-transparent border border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-dark text-base">Rastreo de Envío</h4>
            <p className="text-xs text-dark-500 font-medium">Consulte el estado actual de entrega de su mercancía en tiempo real.</p>
          </div>
        </div>
        <a 
          href={`/orders/${id}/tracking`} 
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-6 py-3 rounded-2xl transition-all text-center hover:scale-105"
        >
          Rastrear Envío
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section className="card rounded-[2.5rem] overflow-hidden">
            <div className="p-6 md:p-8 bg-surface-2 border-b border-border flex items-center justify-between">
              <h3 className="font-black text-lg text-dark flex items-center gap-3">
                <Package className="w-6 h-6 text-brand-500" />
                {dict.orders.detail.items}
              </h3>
            </div>
            <div className="divide-y divide-border-2">
              {items.map((item) => (
                <div key={item.id} className="p-6 md:p-8 flex gap-6 group hover:bg-brand-50/30 transition-colors">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-surface-2 rounded-3xl flex items-center justify-center flex-shrink-0 border border-border group-hover:scale-105 transition-transform">
                    <Package className="w-10 h-10 text-dark-100" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-base text-dark line-clamp-1">{item.productos?.nombre_lista || item.producto_nombre}</h4>
                    <p className="text-[10px] text-dark-300 font-black uppercase tracking-widest">{item.producto_codigo}</p>
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-dark-500 text-sm">
                        <span className="font-black text-dark">{item.cantidad_facturada}</span> x ${Number(item.precio_unitario).toLocaleString()}
                      </p>
                      <p className="font-black text-brand-500 text-lg">${Number(item.importe).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="p-10 text-center text-dark-300 italic">
                  No se encontraron productos para esta factura.
                </div>
              )}
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
                <span className="font-mono font-bold">${Number(factura.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-300 font-bold uppercase tracking-widest">{dict.orders.detail.tax}</span>
                <span className="font-mono font-bold">${Number(factura.iva).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="h-px bg-white/10 my-6" />
              <div className="flex justify-between items-end gap-2 flex-wrap">
                <span className="text-sm font-black uppercase tracking-[0.2em] text-brand-500">{dict.orders.detail.total}</span>
                <span className="text-2xl sm:text-3xl font-black tracking-tighter break-all text-right">
                  ${Number(factura.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </section>

          <section className="card rounded-[2.5rem] p-8 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-300">Pago</p>
              <p className="text-lg font-black text-dark">{status.label}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-300">Surtido</p>
              <p className="text-lg font-black text-dark">{surtido.label}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-300">Vencimiento</p>
              <p className="text-lg font-black text-dark">{new Date(factura.fecha_vencimiento).toLocaleDateString()}</p>
            </div>
            {factura.metodo_pago && (
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-300">Método de Pago</p>
                <p className="text-lg font-black text-dark">{factura.metodo_pago}</p>
              </div>
            )}
          </section>

          {planesPago.length > 0 && (
            <section className="card rounded-[2.5rem] p-8 space-y-6">
              <h3 className="font-black text-xl text-dark flex items-center gap-3">
                <Calendar className="w-5 h-5 text-brand-500" />
                Plan de Pagos
              </h3>
              <div className="space-y-4">
                {planesPago.map(plan => (
                  <div key={plan.id} className="space-y-3">
                    {plan.parcialidades?.sort((a: any, b: any) => a.numero - b.numero).map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-2">
                        <div>
                          <p className="text-sm font-bold text-dark">Pago #{p.numero}</p>
                          <p className="text-xs text-dark-500 font-medium">Vence: {new Date(p.fecha_vencimiento).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-brand-500">${Number(p.monto).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mt-1", p.pagado ? "bg-success-bg text-success" : "bg-warning-bg text-warning")}>
                            {p.pagado ? "Pagado" : "Pendiente"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="card rounded-[2.5rem] p-8 space-y-6">
            <h3 className="font-black text-xl text-dark flex items-center gap-3">
              <FileText className="w-5 h-5 text-brand-500" />
              Comprobantes
            </h3>
            <div className="space-y-3">
              {receipts.map(r => (
                <a key={r.id} href={r.receipt_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:bg-surface-2 transition-colors">
                  <span className="text-sm font-bold text-brand-500 underline line-clamp-1">Ver Comprobante</span>
                  <span className="text-xs text-dark-500">{new Date(r.created_at).toLocaleDateString()}</span>
                </a>
              ))}
              {receipts.length === 0 && <p className="text-sm text-dark-300 italic">No hay comprobantes adjuntos.</p>}
            </div>
            
            <div className="pt-4 border-t border-border">
              <label className="btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer group">
                <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                Adjuntar Comprobante
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,.pdf" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      // Get current user manually since profile isn't available
                      const { data: { user } } = await supabase.auth.getUser()
                      if (!user) throw new Error("No user")
                      
                      const fileName = `${factura.id}/${Date.now()}_${file.name}`
                      const { data: uploadData, error: uploadErr } = await supabase.storage
                        .from('documents')
                        .upload(fileName, file)
                      if (uploadErr) throw uploadErr

                      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
                      
                      const { error: insertErr } = await supabase.from('factura_receipts').insert({
                        factura_id: factura.id,
                        receipt_url: urlData.publicUrl,
                        uploaded_by: user.id
                      })
                      if (insertErr) throw insertErr
                      
                      await fetchFacturaDetail()
                      alert("Comprobante subido exitosamente.")
                    } catch (err) {
                      console.error("Error al subir:", err)
                      alert("Error al subir el comprobante.")
                    }
                  }} 
                />
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
