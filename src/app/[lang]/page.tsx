import { 
  ArrowUpRight, 
  ShoppingCart, 
  FileCheck, 
  TrendingUp,
  Package,
  Activity
} from 'lucide-react'
import { getDictionary, Locale } from '@/lib/get-dictionary'
import { cn } from '@/lib/utils'

export default async function Dashboard({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in">
      <header className="animate-slide-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-dark leading-tight">
          {dict.common.welcome}, <span className="gradient-text">{dict.common.distributor}</span>
        </h1>
        <p className="text-dark-500 mt-1 md:mt-2 text-base md:text-lg font-medium">
          {dict.dashboard.subtitle}
        </p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard 
          label={dict.dashboard.stats.activeOrders} 
          value="12" 
          change={`+2 ${dict.dashboard.stats.thisWeek}`}
          icon={ShoppingCart}
          trend="up"
        />
        <StatsCard 
          label={dict.dashboard.stats.productsAuthorized} 
          value="148" 
          change={dict.dashboard.stats.allActive}
          icon={Package}
        />
        <StatsCard 
          label={dict.dashboard.stats.pendingLetters} 
          value="1" 
          change={dict.dashboard.stats.expiringSoon}
          icon={FileCheck}
          trend="down"
          color="warning"
        />
        <StatsCard 
          label={dict.dashboard.stats.currentSavings} 
          value="$4,250" 
          change={dict.dashboard.stats.hospitalAgreements}
          icon={TrendingUp}
          trend="up"
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <section className="card !p-5 md:!p-8">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-dark">
                <Activity className="w-5 h-5 text-brand-500" />
                {dict.dashboard.recentOrders}
              </h2>
              <button className="btn-ghost text-sm">
                {dict.common.viewAll}
              </button>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 rounded-2xl bg-surface-2 border border-border-2 hover:border-brand-300 transition-all group gap-4">
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border group-hover:scale-105 transition-transform flex-shrink-0">
                      <Package className="w-6 h-6 md:w-7 md:h-7 text-dark-300 group-hover:text-brand-500 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-dark truncate">{dict.dashboard.orderNumber} #ORD-10{i}4</p>
                      <p className="text-xs md:text-sm text-dark-500 font-medium truncate">{dict.dashboard.hospital} • May {i + 5}, 2026</p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                    <p className="font-black text-dark text-lg">$12,400.00</p>
                    <span className="badge-active text-[10px] md:text-xs">
                      {dict.dashboard.inTransit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="space-y-6">
          <div className="bg-brand-500 rounded-[2rem] p-6 md:p-8 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-black mb-2 tracking-tight">{dict.dashboard.needLetter}</h3>
              <p className="text-brand-100 mb-6 md:mb-8 font-medium text-sm md:text-base">{dict.dashboard.letterDescription}</p>
              <button className="w-full sm:w-auto bg-white text-brand-500 px-6 md:px-8 py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-brand-50 transition-all active:scale-95 shadow-lg text-sm md:text-base">
                {dict.common.download}
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              <FileCheck className="w-40 h-40 md:w-56 md:h-56" />
            </div>
          </div>

          <section className="card !p-6 md:!p-8">
            <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-dark tracking-tight">{dict.common.quickLinks}</h3>
            <ul className="space-y-4">
              <li>
                <a href={`/${lang}/prices`} className="text-sm font-semibold text-dark-500 hover:text-brand-500 flex items-center justify-between group transition-colors">
                  {dict.common.prices}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </a>
              </li>
              <li>
                <a href={`/${lang}/shop`} className="text-sm font-semibold text-dark-500 hover:text-brand-500 flex items-center justify-between group transition-colors">
                  {dict.common.shop}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </a>
              </li>
              <li>
                <a href={`/${lang}/support`} className="text-sm font-semibold text-dark-500 hover:text-brand-500 flex items-center justify-between group transition-colors">
                  Contact Support
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </a>
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
    <div className="card-hover card !p-5 md:!p-7 flex flex-col justify-between min-h-[140px] md:min-h-0">
      <div className="flex items-start justify-between mb-4 md:mb-5">
        <div className={cn("p-3 md:p-4 rounded-xl md:2xl", colorMap[color] || colorMap.brand)}>
          <Icon className="w-5 h-5 md:w-7 md:h-7" />
        </div>
        {trend && (
          <span className={cn(
            "text-[9px] md:text-xs font-black uppercase tracking-widest px-2 md:px-3 py-1 md:py-1.5 rounded-full",
            trend === 'up' ? 'text-success bg-success-bg' : 'text-warning bg-warning-bg'
          )}>
            {trend === 'up' ? '↑' : '↓'} <span className="hidden xs:inline">{change}</span>
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl md:text-4xl font-black text-dark mb-0.5 md:mb-1 tracking-tighter">{value}</p>
        <p className="text-[10px] md:text-sm text-dark-500 font-bold uppercase tracking-widest leading-tight">{label}</p>
      </div>
    </div>
  )
}
