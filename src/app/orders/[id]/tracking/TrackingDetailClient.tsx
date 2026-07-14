'use client'

import { useState, useEffect } from 'react'
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
  MapPin,
  ExternalLink,
  ChevronDown,
  Plus,
  Compass,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TrackingDetailClient({ id, dict }: { id: string, dict: any }) {
  const [factura, setFactura] = useState<any>(null)
  const [tracking, setTracking] = useState<any>(null)
  const [updates, setUpdates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Admin form state
  const [carrier, setCarrier] = useState('DHL')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [estimatedDelivery, setEstimatedDelivery] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [newStatus, setNewStatus] = useState('processing')
  const [newDescription, setNewDescription] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  const steps = [
    { key: 'created', label: 'Creada', icon: Clock },
    { key: 'import_customs', label: 'Aduana', icon: Compass },
    { key: 'import_warehouse', label: 'Hub USA', icon: Package },
    { key: 'import_released', label: 'Liberado MX', icon: CheckCircle2 },
    { key: 'processing', label: 'Preparación', icon: Package },
    { key: 'shipped', label: 'Recolectado', icon: Truck },
    { key: 'in_transit', label: 'En Tránsito', icon: Compass },
    { key: 'delivered', label: 'Entregado', icon: CheckCircle2 }
  ]

  const statusIcons: any = {
    created: Clock,
    import_customs: Compass,
    import_warehouse: Package,
    import_released: CheckCircle2,
    processing: Package,
    shipped: Truck,
    in_transit: Compass,
    delivered: CheckCircle2,
    cancelled: XCircle
  }

  const statusColors: any = {
    created: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    import_customs: 'bg-orange-500/10 text-orange-600 border-orange-200',
    import_warehouse: 'bg-teal-500/10 text-teal-600 border-teal-200',
    import_released: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    processing: 'bg-blue-500/10 text-blue-600 border-blue-200',
    shipped: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    in_transit: 'bg-purple-500/10 text-purple-600 border-purple-200',
    delivered: 'bg-green-500/10 text-green-600 border-green-200',
    cancelled: 'bg-red-500/10 text-red-600 border-red-200'
  }

  const fetchTrackingData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/tracking/${id}`)
      if (!res.ok) throw new Error('Error al cargar datos')
      const data = await res.json()
      setFactura(data.factura)
      setTracking(data.tracking)
      setUpdates(data.updates || [])
      
      if (data.tracking) {
        setCarrier(data.tracking.carrier)
        setTrackingNumber(data.tracking.tracking_number)
        if (data.tracking.estimated_delivery) {
          setEstimatedDelivery(new Date(data.tracking.estimated_delivery).toISOString().split('T')[0])
        }
        setDeliveryAddress(data.tracking.delivery_address || '')
      }
    } catch (err) {
      console.error('Error fetching tracking:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrackingData()
  }, [id])

  const handleUpdateCarrier = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!carrier || !trackingNumber) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/tracking/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_carrier',
          carrier,
          trackingNumber,
          estimatedDelivery: estimatedDelivery || null,
          deliveryAddress: deliveryAddress || null
        })
      })
      if (!res.ok) throw new Error('Error al actualizar transportista')
      await fetchTrackingData()
    } catch (error) {
      console.error(error)
      alert('Error al guardar datos del transportista')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStatus || !newDescription) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/tracking/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_update',
          status: newStatus,
          description: newDescription,
          location: newLocation,
          eventDate: newEventDate ? new Date(newEventDate).toISOString() : null
        })
      })
      if (!res.ok) throw new Error('Error al añadir actualización')
      setNewDescription('')
      setNewLocation('')
      setNewEventDate('')
      await fetchTrackingData()
    } catch (error) {
      console.error(error)
      alert('Error al añadir la actualización')
    } finally {
      setActionLoading(false)
    }
  }

  // Get external tracking URL
  const getCarrierUrl = (c: string, num: string) => {
    const carrierClean = c.toUpperCase().trim()
    if (carrierClean === 'DHL') {
      return `https://www.dhl.com/mx-es/home/rastreo/rastreo-express.html?submit=1&tracking-id=${num}`
    }
    if (carrierClean === 'FEDEX') {
      return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${num}`
    }
    if (carrierClean === 'ESTAFETA') {
      return `https://www.estafeta.com/Herramientas/Rastreo`
    }
    return `https://google.com/search?q=${encodeURIComponent(c + ' ' + num)}`
  }

  const getMappedStatus = (status: string) => {
    if (status === 'out_for_delivery') return 'in_transit'
    return status
  }

  // Determine current active step index
  const getCurrentStepIndex = () => {
    if (updates.length === 0) return 0
    const latestUpdate = updates[0]
    const mappedStatus = getMappedStatus(latestUpdate.status)
    const idx = steps.findIndex(s => s.key === mappedStatus)
    return idx === -1 ? 0 : idx
  }

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
        <h2 className="text-2xl font-black text-dark">Factura no encontrada</h2>
        <a href="/orders" className="text-brand-500 font-bold hover:underline">Volver a los pedidos</a>
      </div>
    )
  }

  const currentStepIdx = getCurrentStepIndex()
  const deliveredUpdate = updates.find(u => u.status === 'delivered')
  const isDelivered = !!deliveredUpdate
  const deliveryDate = deliveredUpdate ? (deliveredUpdate.event_date || deliveredUpdate.created_at) : null
  const displayDate = isDelivered ? deliveryDate : tracking?.estimated_delivery

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <header className="space-y-4">
        <a 
          href={`/orders/${id}`} 
          className="inline-flex items-center gap-2 text-dark-500 font-bold hover:text-brand-500 transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Volver a la factura
        </a>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-dark">Seguimiento de Envío</h1>
            <p className="text-dark-500 font-medium">
              Factura: <span className="font-bold text-dark">#{factura.numero_factura}</span>
            </p>
          </div>
          {tracking && (
            <div className="bg-surface-2 px-4 py-3 rounded-2xl border border-border flex items-center gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-dark-300">Transportista</p>
                <p className="font-black text-brand-500 text-sm">{tracking.carrier} - {tracking.tracking_number}</p>
              </div>
              <a 
                href={getCarrierUrl(tracking.carrier, tracking.tracking_number)}
                target="_blank"
                rel="noreferrer"
                className="bg-brand-500 hover:bg-brand-600 text-white p-2 rounded-xl transition-all hover:scale-105"
                title="Rastrear en sitio oficial"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </header>

      {/* UPS-style Prominent Estimated Delivery Card */}
      {displayDate && (
        <div className={cn(
          "card rounded-[2rem] p-8 text-white border-none shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative group",
          isDelivered 
            ? "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700" 
            : "bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-700"
        )}>
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 pointer-events-none transition-transform group-hover:scale-110 duration-700">
            <Truck className="w-64 h-64" />
          </div>
          <div className="space-y-1 relative z-10">
            <span className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">
              {isDelivered ? 'Fecha de Entrega' : 'Fecha de Entrega Estimada'}
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight capitalize mt-2">
              {new Date(displayDate).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-white/90 text-sm font-semibold mt-1">
              {isDelivered ? 'Entregado con éxito' : 'Antes del final del día'}
            </p>
          </div>
          {tracking.delivery_address && (
            <div className="md:text-right max-w-sm space-y-1 relative z-10 bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/10">
              <span className="text-white/80 text-[9px] font-black uppercase tracking-[0.2em] block">Dirección de Envío</span>
              <p className="font-bold text-xs md:text-sm text-white/95 leading-relaxed">{tracking.delivery_address}</p>
            </div>
          )}
        </div>
      )}

      {/* Progress Stepper Bar (eBay style) */}
      <section className="card rounded-[2rem] p-6 md:p-8 shadow-xl border border-border-2 bg-gradient-to-br from-white to-surface-2">
        <h3 className="font-black text-lg text-dark mb-8 flex items-center gap-2">
          <Truck className="w-5 h-5 text-brand-500" />
          Estado del Envío
        </h3>

        {/* Stepper container */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-5 left-8 right-8 h-1 bg-border-2 -translate-y-1/2 z-0 hidden md:block" />
          <div 
            className="absolute top-5 left-8 h-1 bg-brand-500 -translate-y-1/2 transition-all duration-500 z-0 hidden md:block" 
            style={{ width: `${(currentStepIdx / (steps.length - 1)) * 92}%` }}
          />

          <div className="grid grid-cols-1 md:grid-cols-8 gap-6 md:gap-2 relative z-10">
            {steps.map((step, idx) => {
              const StepIcon = step.icon
              const isCompleted = idx <= currentStepIdx
              const isCurrent = idx === currentStepIdx

              return (
                <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-3 text-center group">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    isCompleted 
                      ? "bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20" 
                      : "bg-white border-border-2 text-dark-300"
                  )}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div className="text-left md:text-center">
                    <p className={cn(
                      "font-bold text-xs md:text-sm transition-colors",
                      isCurrent ? "text-brand-500 font-black scale-105" : isCompleted ? "text-dark" : "text-dark-300"
                    )}>
                      {step.label}
                    </p>
                    {isCurrent && updates.length > 0 && (
                      <p className="text-[10px] text-brand-500 font-bold bg-brand-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                        Actual
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main timeline + Details section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Timeline updates */}
        <div className="md:col-span-2 space-y-6">
          <section className="card rounded-[2rem] p-6 md:p-8">
            <h3 className="font-black text-lg text-dark mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-500" />
              Historial de Tránsito
            </h3>

            {updates.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <AlertCircle className="w-12 h-12 text-dark-200 mx-auto" />
                <p className="text-dark-400 italic">No hay actualizaciones registradas para este pedido aún.</p>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-border-2 space-y-8 ml-3">
                {updates.map((update, idx) => {
                  const UpdateIcon = statusIcons[update.status] || Package
                  const colorClass = statusColors[update.status] || 'bg-dark-100 text-dark-500'

                  return (
                    <div key={update.id} className="relative group">
                      {/* Bullet node on timeline */}
                      <span className={cn(
                        "absolute -left-[39px] top-1 w-6 h-6 rounded-full flex items-center justify-center border transition-all group-hover:scale-110",
                        colorClass
                      )}>
                        <UpdateIcon className="w-3.5 h-3.5" />
                      </span>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-dark-400 font-bold">
                            {new Date(update.event_date || update.created_at).toLocaleString()}
                          </span>
                          {update.location && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-dark-500 bg-surface-3 px-2.5 py-0.5 rounded-full">
                              <MapPin className="w-3 h-3 text-brand-500" />
                              {update.location}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-dark text-sm md:text-base">{update.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* Info card / Summary */}
        <div className="space-y-6">
          <section className="card rounded-[2rem] p-6 space-y-6">
            <h3 className="font-black text-lg text-dark">Información del Pedido</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-dark-300 font-bold uppercase tracking-wider text-[10px]">Cliente</p>
                <p className="font-bold text-dark mt-0.5">{factura.cliente_nombre}</p>
              </div>
              <div className="h-px bg-border-2" />
              <div>
                <p className="text-dark-300 font-bold uppercase tracking-wider text-[10px]">Factura ID</p>
                <p className="font-mono text-xs font-bold text-dark-500 mt-0.5">{factura.id}</p>
              </div>
              {displayDate && (
                <>
                  <div className="h-px bg-border-2" />
                  <div>
                    <p className="text-dark-300 font-bold uppercase tracking-wider text-[10px]">
                      {isDelivered ? 'Fecha de Entrega' : 'Entrega Estimada'}
                    </p>
                    <p className={cn("font-bold mt-0.5", isDelivered ? "text-emerald-600" : "text-brand-500")}>
                      {new Date(displayDate).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
              {tracking?.delivery_address && (
                <>
                  <div className="h-px bg-border-2" />
                  <div>
                    <p className="text-dark-300 font-bold uppercase tracking-wider text-[10px]">Dirección de Entrega</p>
                    <p className="text-xs font-medium text-dark-600 mt-0.5 leading-relaxed">
                      {tracking.delivery_address}
                    </p>
                  </div>
                </>
              )}
              <div className="h-px bg-border-2" />
              <div>
                <p className="text-dark-300 font-bold uppercase tracking-wider text-[10px]">Estado de Surtido</p>
                <p className="font-bold text-dark mt-0.5 capitalize">{factura.estado_surtido.replace('_', ' ')}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Admin Panel controls to simulate status updates */}
      <section className="card rounded-[2rem] border border-dashed border-brand-500/40 bg-brand-50/5 p-6 md:p-8">
        <button 
          onClick={() => setShowAdminPanel(!showAdminPanel)}
          className="w-full flex items-center justify-between font-black text-lg text-dark group"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-500" />
            Panel de Operaciones de Envío (Simular/Editar)
          </span>
          <ChevronDown className={cn("w-5 h-5 text-dark-400 transition-transform", showAdminPanel && "rotate-180")} />
        </button>

        {showAdminPanel && (
          <div className="mt-8 space-y-8 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Set carrier / tracking number */}
              <form onSubmit={handleUpdateCarrier} className="space-y-4">
                <h4 className="font-bold text-dark border-b pb-2">1. Configurar Courier/Transportista</h4>
                <div>
                  <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">Transportista</label>
                  <select 
                    value={carrier} 
                    onChange={e => setCarrier(e.target.value)}
                    className="w-full bg-white border border-border-2 p-3 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="DHL">DHL Express</option>
                    <option value="FedEx">FedEx</option>
                    <option value="Estafeta">Estafeta</option>
                    <option value="Arthromed (Interno)">Arthromed (Interno)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">Número de Rastreo (ID)</label>
                  <input 
                    type="text" 
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="e.g. 1234567890"
                    className="w-full bg-white border border-border-2 p-3 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">Fecha Estimada de Entrega</label>
                  <input 
                    type="date" 
                    value={estimatedDelivery}
                    onChange={e => setEstimatedDelivery(e.target.value)}
                    className="w-full bg-white border border-border-2 p-3 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">Dirección de Entrega</label>
                  <input 
                    type="text" 
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder="Calle, Número, Ciudad, Estado, CP"
                    className="w-full bg-white border border-border-2 p-3 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="bg-dark hover:bg-dark-500 text-white font-bold px-5 py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  Asignar Guía / Transportista
                </button>
              </form>

              {/* Add Tracking log / update */}
              <form onSubmit={handleAddUpdate} className="space-y-4">
                <h4 className="font-bold text-dark border-b pb-2">2. Registrar Actualización de Tránsito</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">Estado</label>
                    <select 
                      value={newStatus} 
                      onChange={e => setNewStatus(e.target.value)}
                      className="w-full bg-white border border-border-2 p-3 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      <option value="created">Orden Creada</option>
                      <option value="import_customs">Aduana/Importación</option>
                      <option value="import_warehouse">En Hub USA</option>
                      <option value="import_released">Liberado MX</option>
                      <option value="processing">En Preparación</option>
                      <option value="shipped">Recolectado</option>
                      <option value="in_transit">En Tránsito</option>
                      <option value="delivered">Entregado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">Ubicación</label>
                    <input 
                      type="text" 
                      value={newLocation}
                      onChange={e => setNewLocation(e.target.value)}
                      placeholder="e.g. Monterrey, NL"
                      className="w-full bg-white border border-border-2 p-3 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">Fecha del Evento (Opcional)</label>
                  <input 
                    type="datetime-local" 
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                    className="w-full bg-white border border-border-2 p-3 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">Descripción del Evento</label>
                  <input 
                    type="text" 
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    placeholder="e.g. Su paquete ha sido recolectado por DHL y está en ruta."
                    className="w-full bg-white border border-border-2 p-3 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  Registrar Evento
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
