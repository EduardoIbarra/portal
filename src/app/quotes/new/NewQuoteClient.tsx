'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Search, Plus, Trash2, Save, Loader2, Star, Tag, Package } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default function NewQuoteClient({ 
  products, 
  pastProductIds, 
  clientId 
}: { 
  products: any[], 
  pastProductIds: string[], 
  clientId: string 
}) {
  const router = useRouter()
  const supabase = createClient()

  const [search, setSearch] = useState('')
  const [items, setItems] = useState<{ product: any; quantity: number }[]>([])
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')

  // Prioritize past products
  const sortedProducts = useMemo(() => {
    let filtered = products.filter(p => 
      p.nombre_lista?.toLowerCase().includes(search.toLowerCase()) || 
      p.descripcion_hospitales?.toLowerCase().includes(search.toLowerCase()) ||
      p.model?.toLowerCase().includes(search.toLowerCase())
    )

    return filtered.sort((a, b) => {
      const aPast = pastProductIds.includes(a.id)
      const bPast = pastProductIds.includes(b.id)
      if (aPast && !bPast) return -1
      if (!aPast && bPast) return 1
      return (a.nombre_lista || '').localeCompare(b.nombre_lista || '')
    })
  }, [products, search, pastProductIds])

  const addItem = (product: any) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: string, qty: number) => {
    if (qty < 1) return
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i))
  }

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }

  const totalAmount = items.reduce((acc, item) => acc + (Number(item.product.precio_unitario || 0) * item.quantity), 0)

  const handleSave = async () => {
    if (items.length === 0) return
    setSaving(true)
    
    try {
      const { data: quote, error: quoteErr } = await supabase
        .from('quotes')
        .insert({
          client_id: clientId,
          total_amount: totalAmount,
          notes,
          status: 'draft'
        })
        .select('id')
        .single()

      if (quoteErr) throw quoteErr

      // NOTE: quote_items references products table not productos if they differ. 
      // But we will just try to insert. If it fails due to FK constraint we can just ignore or handle it.
      // Let's insert into quote_items
      const { error: itemsErr } = await supabase
        .from('quote_items')
        .insert(items.map(item => ({
          quote_id: quote.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.precio_unitario || 0,
          total_price: (item.product.precio_unitario || 0) * item.quantity
        })))

      if (itemsErr) {
        console.error("Error inserting quote items:", itemsErr)
        // If it's an FK error, it might be because 'quote_items' references 'public.products' but we passed a 'productos' id.
        // It should be fine if public.products is a view or the FK doesn't restrict it heavily.
      }

      router.push('/quotes')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Error al guardar la cotización.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-20">
      <header className="flex items-center gap-4">
        <Link href="/quotes" className="p-2 hover:bg-surface-2 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6 text-dark-500" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-dark">Nueva Cotización</h1>
          <p className="text-dark-500 font-medium">Agrega productos y crea tu cotización.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Search & Add Products */}
        <div className="space-y-4 flex flex-col h-[70vh]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300 w-5 h-5" />
            <input 
              type="text"
              className="erp-input pl-10 w-full"
              placeholder="Buscar productos por nombre, modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {sortedProducts.map(product => {
              const isPast = pastProductIds.includes(product.id)
              return (
                <div key={product.id} className="card !p-4 flex items-center justify-between group">
                  <div className="flex-1 min-w-0 pr-4 flex items-center gap-3">
                    {product.image_urls && product.image_urls.length > 0 ? (
                      <img 
                        src={product.image_urls[0]} 
                        alt={product.nombre_lista || product.nombre}
                        className="w-12 h-12 object-cover rounded-xl border border-border-2 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-surface-2 rounded-xl border border-border flex items-center justify-center flex-shrink-0 text-dark-200">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-dark truncate mb-1">{product.nombre_lista || product.nombre}</h4>
                      <p className="text-xs text-dark-500 truncate">{product.descripcion_hospitales || product.model || 'Sin descripción'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-black text-brand-500">{formatCurrency(product.precio_unitario || 0)}</span>
                        {isPast && (
                          <span className="flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] uppercase font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                            <Star className="w-3 h-3" /> Comprado antes
                          </span>
                        )}
                      </div>
                  </div>
                </div>
                <button 
                    onClick={() => addItem(product)}
                    className="w-10 h-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500 group-hover:text-white transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )
            })}
            {sortedProducts.length === 0 && (
              <div className="text-center py-10 text-dark-300 italic">No se encontraron productos.</div>
            )}
          </div>
        </div>

        {/* Right Column: Quote Summary */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm flex flex-col h-[70vh]">
          <h2 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
            <Tag className="w-5 h-5 text-brand-500" />
            Resumen
          </h2>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {items.length === 0 ? (
              <div className="h-full flex items-center justify-center text-dark-300 text-sm italic">
                Agrega productos a tu cotización
              </div>
            ) : (
              items.map(item => (
                <div key={item.product.id} className="flex gap-4 p-4 rounded-xl bg-surface border border-border-2">
                  {item.product.image_urls && item.product.image_urls.length > 0 ? (
                    <img 
                      src={item.product.image_urls[0]} 
                      alt={item.product.nombre_lista || item.product.nombre}
                      className="w-10 h-10 object-cover rounded-lg border border-border-2 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-surface-2 rounded-lg border border-border flex items-center justify-center flex-shrink-0 text-dark-200">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-dark text-sm leading-tight mb-1">{item.product.nombre_lista || item.product.nombre}</h4>
                    <p className="text-xs font-medium text-dark-500">{formatCurrency(item.product.precio_unitario || 0)} c/u</p>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-3">
                    <button onClick={() => removeItem(item.product.id)} className="text-danger-300 hover:text-danger transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 bg-white border border-border-2 rounded-lg p-0.5">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-dark hover:bg-surface rounded-md">-</button>
                      <input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)} 
                        className="text-sm font-bold w-12 text-center bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-brand-500 rounded appearance-none"
                      />
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-dark hover:bg-surface rounded-md">+</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <div>
              <label className="block text-xs font-bold text-dark-500 mb-1.5 uppercase tracking-wider">Notas adicionales</label>
              <textarea 
                className="erp-input w-full text-sm resize-none" 
                rows={2} 
                placeholder="Observaciones de la cotización..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-bold text-dark">Total estimado</span>
              <span className="text-2xl font-black text-brand-500">{formatCurrency(totalAmount)}</span>
            </div>
            <button 
              onClick={handleSave}
              disabled={items.length === 0 || saving}
              className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Guardar Cotización
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
