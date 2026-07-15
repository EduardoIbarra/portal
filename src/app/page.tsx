import { 
  ArrowUpRight, 
  ShoppingCart, 
  FileCheck, 
  TrendingUp,
  Package,
  Activity,
  Clock,
  CheckCircle2,
  FileText,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'
import { getDictionary, getLocale } from '@/lib/get-dictionary'
import { cn } from '@/lib/utils'
import { getUser, getProfile } from '@/lib/auth-utils'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { MonthlyBillingChart } from '@/components/charts/MonthlyBillingChart'
import { InvoiceStatusChart } from '@/components/charts/InvoiceStatusChart'

import { TopProductsChart } from '@/components/charts/TopProductsChart'

export default async function Dashboard() {
  const lang = await getLocale()
  const dict = await getDictionary()
  const user = await getUser()
  const profile = await getProfile()
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || dict.common.distributor

  const supabase = await createClient()
  let facturas: any[] = []
  let topProducts: { name: string, value: number }[] = []
  let latestCartaUrl: string | null = null


  if (profile?.client_id) {
    const { data } = await supabase
      .from('facturas_cliente')
      .select('*')
      .eq('cliente_id', profile.client_id)
      .order('fecha_expedicion', { ascending: false })
    
    if (data) facturas = data
    
    if (facturas.length > 0) {
      const { data: factProd } = await supabase
        .from('factura_productos')
        .select('producto_nombre, importe, productos(nombre_lista)')
        .in('factura_id', facturas.map(f => f.id))
        
      if (factProd) {
        const pMap: any = {}
        factProd.forEach(p => {
          const name = (p.productos as any)?.nombre_lista || p.producto_nombre
          pMap[name] = (pMap[name] || 0) + Number(p.importe)
        })
        topProducts = Object.entries(pMap)
          .map(([name, value]) => ({ name, value: value as number }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
      }
    }

    // Retrieve client RFC to query the distribution letter
    const { data: clientInfo } = await supabase
      .from('clientes')
      .select('rfc')
      .eq('id', profile.client_id)
      .maybeSingle()

    if (clientInfo?.rfc) {
      const { data: erpClient } = await supabase
        .from('clients')
        .select('id')
        .eq('rfc', clientInfo.rfc)
        .maybeSingle()

      const { data: latestCarta } = await supabase
        .from('cartas_distribucion')
        .select('letter_url')
        .or(`rfc.eq.${clientInfo.rfc}${erpClient ? `,client_id.eq.${erpClient.id}` : ''}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestCarta?.letter_url) {
        latestCartaUrl = latestCarta.letter_url
      }
    }
  }

  const pendientes = facturas.filter(f => f.estado === 'pendiente')
  const pagadas = facturas.filter(f => f.estado === 'pagada')
  const montoPendiente = pendientes.reduce((acc, f) => acc + Number(f.total), 0)

  // Calulate Growth (Crecimiento) roughly by comparing this month vs last month
  const today = new Date()
  const thisMonth = facturas.filter(f => new Date(f.fecha_expedicion).getMonth() === today.getMonth() && new Date(f.fecha_expedicion).getFullYear() === today.getFullYear())
  const lastMonth = facturas.filter(f => new Date(f.fecha_expedicion).getMonth() === (today.getMonth() === 0 ? 11 : today.getMonth() - 1) && new Date(f.fecha_expedicion).getFullYear() === (today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear()))
  
  const thisMonthSales = thisMonth.reduce((acc, f) => acc + Number(f.total), 0)
  const lastMonthSales = lastMonth.reduce((acc, f) => acc + Number(f.total), 0)
  const growthPercent = lastMonthSales ? ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100 : 0

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in">
      <header className="animate-slide-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-dark leading-tight">
          {dict.common.welcome}, <span className="gradient-text">{userName}</span>
        </h1>
        <p className="text-dark-500 mt-1 md:mt-2 text-base md:text-lg font-medium">
          Aquí está el resumen de tus facturas y pedidos
        </p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard 
          label="Facturas Pendientes" 
          value={pendientes.length} 
          change={`${pagadas.length} pagadas`}
          icon={Clock}
          trend="up"
          color="warning"
        />
        <StatsCard 
          label="Total Facturas" 
          value={facturas.length} 
          change="Todas tus facturas"
          icon={FileText}
          color="brand"
        />
        <StatsCard 
          label="Ventas del Mes" 
          value={`$${thisMonthSales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
          change={`${growthPercent >= 0 ? '+' : ''}${growthPercent.toFixed(1)}% vs mes ant.`}
          icon={TrendingUp}
          trend={growthPercent >= 0 ? "up" : "down"}
          color="success"
        />
        <StatsCard 
          label="Monto Pendiente" 
          value={`$${montoPendiente.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
          change="Por pagar"
          icon={DollarSign}
          trend="down"
          color="warning"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <section className="card !p-5 md:!p-6 flex flex-col justify-between bg-white border border-slate-100 rounded-3xl shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-dark">Facturación Mensual</h2>
            </div>
            <MonthlyBillingChart facturas={facturas} />
          </div>
        </section>

        <section className="card !p-5 md:!p-6 flex flex-col justify-between bg-white border border-slate-100 rounded-3xl shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-dark">Productos Más Comprados</h2>
            </div>
            <div className="h-[300px] w-full">
              <TopProductsChart data={topProducts} />
            </div>
          </div>
        </section>

        <section className="card !p-5 md:!p-6 flex flex-col justify-between bg-white border border-slate-100 rounded-3xl shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-dark">Estado de Facturas</h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <InvoiceStatusChart facturas={facturas} />
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <section className="card !p-5 md:!p-8">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-dark">
                <Activity className="w-5 h-5 text-brand-500" />
                Facturas Recientes
              </h2>
              <Link href="/orders" className="btn-ghost text-sm">
                {dict.common.viewAll}
              </Link>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              {facturas.slice(0, 4).map((factura) => (
                <Link key={factura.id} href={`/orders/${factura.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 rounded-2xl bg-surface-2 border border-border-2 hover:border-brand-300 transition-all group gap-4 cursor-pointer block">
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className={cn(
                      "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-sm border border-border group-hover:scale-105 transition-transform flex-shrink-0",
                      factura.estado === 'pagada' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
                    )}>
                      <FileText className="w-5 h-5 md:w-6 md:h-6 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-dark truncate text-sm md:text-base">Factura #{factura.numero_factura}</p>
                      <p className="text-xs text-dark-500 font-medium truncate">{new Date(factura.fecha_expedicion).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                    <p className="font-black text-dark text-base md:text-lg">${Number(factura.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <span className={cn(
                      "text-[9px] md:text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                      factura.estado === 'pagada' ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
                    )}>
                      {factura.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
                    </span>
                  </div>
                </Link>
              ))}
              {facturas.length === 0 && (
                <div className="text-center py-10 text-dark-300 italic">
                  No tienes facturas recientes.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="space-y-6">
          <div className="bg-brand-500 rounded-[2rem] p-6 md:p-8 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-black mb-2 tracking-tight">{dict.dashboard.needLetter}</h3>
              <p className="text-brand-100 mb-6 md:mb-8 font-medium text-sm md:text-base">{dict.dashboard.letterDescription}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                {latestCartaUrl ? (
                  <a 
                    href={latestCartaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white text-brand-500 px-6 py-3 rounded-xl font-black inline-flex items-center justify-center gap-2 hover:bg-brand-50 transition-all active:scale-95 shadow-lg text-sm md:text-base flex-1 sm:flex-initial"
                  >
                    {dict.common.download}
                    <ArrowUpRight className="w-5 h-5" />
                  </a>
                ) : (
                  <Link 
                    href="/distributor-letter"
                    className="bg-white text-brand-500 px-6 py-3 rounded-xl font-black inline-flex items-center justify-center gap-2 hover:bg-brand-50 transition-all active:scale-95 shadow-lg text-sm md:text-base flex-1 sm:flex-initial"
                  >
                    Ver Cartas
                    <ArrowUpRight className="w-5 h-5" />
                  </Link>
                )}
                <Link 
                  href="/distributor-letter/request"
                  className="bg-brand-600 hover:bg-brand-700 text-white border border-brand-400/50 px-6 py-3 rounded-xl font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg text-sm md:text-base flex-1 sm:flex-initial"
                >
                  Solicitar Carta
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              <FileCheck className="w-40 h-40 md:w-56 md:h-56" />
            </div>
          </div>

          <section className="card !p-6 md:!p-8">
            <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-dark tracking-tight">{dict.common.quickLinks}</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/orders" className="text-sm font-semibold text-dark-500 hover:text-brand-500 flex items-center justify-between group transition-colors">
                  Todas mis Facturas
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-sm font-semibold text-dark-500 hover:text-brand-500 flex items-center justify-between group transition-colors">
                  {dict.common.shop}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ label, value, change, icon: Icon, trend, color = 'brand' }: any) {
  const colorMap: any = {
    brand: 'text-brand-500 bg-brand-50',
    warning: 'text-warning bg-warning-bg',
    success: 'text-success bg-success-bg',
  }
  
  return (
    <div className="card-hover card !p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-lg border border-slate-100 rounded-3xl bg-white min-h-[130px]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-dark-500 font-bold text-xs uppercase tracking-wider">{label}</span>
        <div className={cn("p-2 rounded-xl flex items-center justify-center flex-shrink-0", colorMap[color] || colorMap.brand)}>
          <Icon className="w-4 h-4 md:w-5 h-5" />
        </div>
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-black text-dark tracking-tight mb-1">{value}</h3>
        <div className="flex items-center gap-2">
          {trend && (
            <span className={cn(
              "text-[9px] md:text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
              trend === 'up' ? 'text-success bg-success-bg' : 'text-warning bg-warning-bg'
            )}>
              {trend === 'up' ? '↑' : '↓'} <span className="inline">{change}</span>
            </span>
          )}
          {!trend && (
            <span className="text-[10px] font-semibold text-dark-300">
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
