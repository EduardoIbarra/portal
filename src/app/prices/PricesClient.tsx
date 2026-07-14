'use client'

import { useState } from 'react'
import { 
  Search, 
  Info,
  ChevronDown,
  LayoutGrid,
  List,
  Filter,
  Package,
  TrendingDown,
  Building2,
  Tag
} from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { cn } from '@/lib/utils'

export default function PricesClient({ dict }: { dict: any }) {
  const [search, setSearch] = useState('')
  const [selectedHospital, setSelectedHospital] = useState('base')
  const { products, loading, error } = useProducts(selectedHospital === 'base' ? undefined : selectedHospital)

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 animate-slide-left">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-dark leading-tight">{dict.prices.title}</h1>
          <p className="text-dark-500 font-medium max-w-xl text-sm md:text-base">{dict.prices.subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="relative group w-full sm:w-64 md:w-80">
            <Search className="crm-input-icon" />
            <input 
              type="text" 
              placeholder={dict.prices.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="crm-input pl-11 md:pl-12 py-3 md:py-3.5 !rounded-xl md:!rounded-2xl"
            />
          </div>
          
          <div className="flex items-center gap-3 px-4 py-3 md:py-3.5 rounded-xl md:rounded-2xl border border-border bg-surface shadow-sm w-full sm:w-auto">
             <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-dark-300 whitespace-nowrap">{dict.prices.viewPricesFor}:</span>
             <select 
               value={selectedHospital}
               onChange={(e) => setSelectedHospital(e.target.value)}
               className="bg-transparent font-bold text-brand-500 outline-none cursor-pointer text-sm md:text-base flex-1"
             >
               <option value="base">{dict.prices.distributorBase}</option>
               <option value="h1">Hospital Angeles</option>
               <option value="h2">ABC Medical Center</option>
             </select>
          </div>
        </div>
      </header>

      <div className="card rounded-[2.5rem] overflow-hidden relative min-h-[500px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="font-black text-xs uppercase tracking-[0.2em] text-dark-300">{dict.common.loading}</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
            <thead>
              <tr className="bg-surface-2 border-b border-border">
                <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">{dict.prices.table.productDetails}</th>
                <th className="hidden sm:table-cell px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">{dict.prices.table.category}</th>
                <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">{dict.prices.table.basePrice}</th>
                <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">{dict.prices.table.agreementPrice}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-2">
              {filteredProducts.length === 0 && !loading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center text-dark-300 italic">
                    {dict.prices.table.noProducts}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-brand-50/30 transition-colors group">
                    <td className="px-4 md:px-10 py-5 md:py-8">
                      <div className="flex items-center gap-3 md:gap-6">
                        <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-surface-2 flex items-center justify-center text-dark-100 group-hover:scale-110 group-hover:bg-white transition-all shadow-sm border border-border-2 flex-shrink-0">
                           {product.image_url ? (
                             <img src={product.image_url} alt="" className="w-7 h-7 md:w-10 md:h-10 object-contain" />
                           ) : (
                             <Package className="w-5 h-5 md:w-8 md:h-8" />
                           )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-dark text-sm md:text-lg leading-tight mb-0.5 md:mb-1 truncate">{product.name}</p>
                          <p className="text-[9px] md:text-[10px] font-black text-dark-300 uppercase tracking-widest">{product.sku || dict.prices.table.noSku}</p>
                          <div className="sm:hidden mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-surface-2 text-[8px] font-black uppercase tracking-widest text-dark-500 border border-border">
                              {product.category || dict.prices.table.general}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 md:px-10 py-5 md:py-8">
                      <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-surface-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-dark-500 border border-border">
                        {product.category || dict.prices.table.general}
                      </span>
                    </td>
                    <td className="px-4 md:px-10 py-5 md:py-8">
                      <p className="text-xs md:text-xl font-black text-dark-300 line-through decoration-dark-100 opacity-50 mb-0.5 md:mb-1 font-mono">
                        ${(product.basePrice * 1.3).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm md:text-2xl font-black text-dark font-mono">
                        ${product.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-4 md:px-10 py-5 md:py-8">
                      {selectedHospital !== 'base' ? (
                        <div className="flex flex-col gap-0.5 md:gap-1">
                          <div className="flex items-center gap-1 md:gap-2 text-success">
                            <TrendingDown className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="font-black text-lg md:text-3xl font-mono">${(product.basePrice * 0.85).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-success-bg px-1 md:px-1.5 py-0.5 rounded bg-success inline-block w-fit">{dict.prices.table.specialAgreement}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] md:text-xs font-bold text-dark-300 italic uppercase tracking-wider">{dict.prices.table.noSpecialPrice}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 md:p-8 rounded-2xl md:rounded-[2rem] bg-brand-50 border border-brand-100 flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white flex items-center justify-center text-brand-500 flex-shrink-0 shadow-sm">
          <Info className="w-6 h-6 md:w-7 md:h-7" />
        </div>
        <p className="text-xs md:text-sm text-dark-500 font-medium leading-relaxed text-center md:text-left">
          {dict.prices.infoNote}
        </p>
      </div>
    </div>
  )
}
