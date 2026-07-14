'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  Package,
  Star,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProducts } from '@/hooks/useProducts'
import { createClient } from '@/lib/supabase'

export default function ShopClient({ dict }: { dict: any }) {
  const [cart, setCart] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [lastOrderId, setLastOrderId] = useState<string | null>(null)
  const { products, loading, error } = useProducts()
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isCartOpen])

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta)
        return { ...item, qty: newQty }
      }
      return item
    }).filter(item => item.qty > 0))
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.basePrice * item.qty), 0)

  const handlePlaceOrder = async () => {
    setIsOrdering(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get the profile to find the associated client_id
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // If profile has no client_id, we fallback to user.id (which we ensure exists in the callback)
      const clientId = profile?.client_id || user.id

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          client_id: clientId,
          total_amount: subtotal * 1.16,
          status: 'pending',
          currency: 'MXN'
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.qty,
        unit_price: item.basePrice,
        total_price: item.basePrice * item.qty
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      setLastOrderId(order.id)
      setShowSuccessModal(true)
      setCart([])
      setIsCartOpen(false)
    } catch (err: any) {
      alert(dict.common.error + ': ' + err.message)
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 relative animate-fade-in">
      <div className="flex-1 space-y-6 md:space-y-10">
        <header className="flex items-center justify-between animate-slide-left gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-dark tracking-tight leading-tight truncate">{dict.shop.title}</h1>
            <p className="text-dark-500 mt-1 font-medium text-sm md:text-base truncate">{dict.shop.subtitle}</p>
          </div>
          <button 
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative p-4 md:p-5 rounded-xl md:2xl bg-surface border border-border shadow-xl shadow-brand-500/5 hover:shadow-brand-500/10 transition-all group active:scale-95 flex-shrink-0"
          >
            <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 text-brand-500" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-brand-500 text-white text-[9px] md:text-[10px] font-black w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-brand-500/30">
                {cart.reduce((acc, i) => acc + i.qty, 0)}
              </span>
            )}
          </button>
        </header>

          {/* Search Input */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-2 border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[350px] md:h-[450px] rounded-2xl md:rounded-[2.5rem] bg-surface-2 animate-pulse border border-border" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-8 rounded-[2rem] bg-danger-bg border border-danger/10 text-danger flex items-center gap-4">
            <AlertCircle className="w-8 h-8" />
            <div>
              <p className="font-bold">{dict.shop.failedLoad}</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
          {products.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((product) => (
            <div key={product.id} className="card !p-0 rounded-2xl md:rounded-[2.5rem] overflow-hidden group hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-500 flex flex-col">
              <div className="aspect-[4/3] bg-surface-2 relative flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                   <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                   <Package className="w-12 h-12 md:w-16 md:h-16 text-dark-100 group-hover:scale-110 transition-transform duration-700" />
                )}
                <div className="absolute top-4 left-4 md:top-6 md:left-6 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[8px] md:text-[10px] font-black uppercase tracking-widest text-brand-500 shadow-sm border border-brand-100">
                  {product.category || dict.prices.table.general}
                </div>
              </div>
              <div className="p-5 md:p-8 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-1 md:mb-2">
                  <h3 className="font-black text-lg md:text-xl text-dark leading-tight group-hover:text-brand-500 transition-colors line-clamp-2">{product.name}</h3>
                </div>
                <p className="text-[9px] md:text-[10px] text-dark-300 mb-4 md:mb-8 font-black uppercase tracking-widest">{product.sku}</p>
                
                <div className="mt-auto flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[9px] md:text-[10px] text-dark-300 font-black uppercase tracking-tighter mb-0.5 md:mb-1">{dict.shop.unitPrice}</p>
                    <p className="text-xl md:text-3xl font-black text-dark tracking-tighter truncate">${product.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  
                  {cart.find(item => item.id === product.id) ? (
                    <div className="flex items-center gap-2 bg-brand-50 rounded-xl p-1 border border-brand-100">
                      <button 
                        onClick={() => updateQty(product.id, -1)}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-brand-500"
                      >
                        <Minus className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <span className="text-sm font-black w-6 text-center text-brand-500">{cart.find(item => item.id === product.id)?.qty}</span>
                      <button 
                        onClick={() => updateQty(product.id, 1)}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-brand-500"
                      >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart(product)}
                      className="p-3 md:p-4 bg-brand-500 text-white rounded-xl md:rounded-2xl hover:bg-brand-600 active:scale-95 transition-all shadow-xl shadow-brand-500/20 flex-shrink-0"
                    >
                      <Plus className="w-6 h-6 md:w-7 md:h-7" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar / Modal Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out",
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsCartOpen(false)}
      />

      <aside className={cn(
        "fixed right-0 top-0 h-screen max-h-screen w-full sm:w-[450px] bg-surface z-[70] transition-transform duration-500 ease-out flex flex-col",
        isCartOpen ? "translate-x-0 shadow-2xl" : "translate-x-full hidden"
      )}>
        <div className="p-6 md:p-8 border-b border-border flex items-center justify-between bg-surface/50 backdrop-blur-md">
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 text-dark">
            <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 text-brand-500" />
            {dict.shop.cart}
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-brand-50 rounded-xl transition-all">
            <Plus className="w-6 h-6 md:w-7 md:h-7 rotate-45 text-dark-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
              <div className="p-8 rounded-full bg-surface-2 border border-border">
                <ShoppingCart className="w-20 h-20 text-dark-300" />
              </div>
              <div>
                <p className="text-xl font-black text-dark">{dict.shop.cartEmpty}</p>
                <p className="text-sm font-medium text-dark-500">{dict.shop.startAdding}</p>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-5 group animate-in slide-in-from-right-4 duration-300">
                <div className="w-24 h-24 bg-surface-2 rounded-3xl flex items-center justify-center flex-shrink-0 border border-border shadow-sm">
                   <Package className="w-10 h-10 text-dark-100" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-sm text-dark leading-tight line-clamp-2">{item.name}</h4>
                  <p className="text-brand-500 font-black text-xl tracking-tighter">${item.basePrice.toLocaleString()}</p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-3 bg-surface-2 rounded-xl p-1.5 border border-border">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:bg-white rounded-lg transition-colors text-dark-500">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black w-6 text-center text-dark">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1.5 hover:bg-white rounded-lg transition-colors text-dark-500">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => updateQty(item.id, -item.qty)} className="p-2 text-dark-300 hover:text-danger hover:bg-danger-bg rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

                {cart.length > 0 ? (
          <div className="p-6 md:p-8 border-t border-border bg-surface-2 space-y-6 md:space-y-8 flex-shrink-0">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-dark-300">
                <span>{dict.shop.subtotal}</span>
                <span className="text-dark font-mono">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-dark-300">
                <span>{dict.shop.tax}</span>
                <span className="text-dark font-mono">${(subtotal * 0.16).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="h-px bg-border my-4" />
              <div className="flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-dark-300">{dict.shop.totalAmount}</span>
                <span className="text-4xl font-black text-dark tracking-tighter">
                  ${(subtotal * 1.16).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={handlePlaceOrder}
                disabled={isOrdering}
                className="btn-primary w-full py-4 md:py-5 rounded-xl md:rounded-[1.5rem] !text-base md:!text-lg !font-black !gap-3 md:!gap-4 shadow-2xl shadow-brand-500/30 group"
              >
                {isOrdering ? <Loader2 className="w-6 h-6 md:w-7 md:h-7 animate-spin" /> : <CreditCard className="w-6 h-6 md:w-7 md:h-7" />}
                {isOrdering ? dict.shop.processing : dict.shop.placeOrder}
                <ArrowRight className={cn("w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform", isOrdering && "hidden")} />
              </button>
              
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="flex -space-x-2">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="w-6 h-6 rounded-full bg-brand-100 border-2 border-white shadow-sm" />
                   ))}
                </div>
                <p className="text-[10px] text-dark-300 font-black uppercase tracking-widest">
                  +12 {dict.shop.activeNow}
                </p>
              </div>
            </div>
            
            <p className="text-[10px] text-center text-dark-300 flex items-center justify-center gap-2 uppercase tracking-[0.2em] font-black">
              <CheckCircle2 className="w-4 h-4 text-success" />
              {dict.shop.fulfillment}
            </p>
          </div>
        ) : null}
          

              


      </aside>
    </div>

    {/* Success Modal */}
    {showSuccessModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowSuccessModal(false)} />
        <div className="bg-surface w-full max-w-md rounded-[2.5rem] p-8 md:p-12 relative z-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-out border border-border">
          <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-success-bg flex items-center justify-center text-success animate-bounce shadow-2xl shadow-success/20">
              <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16" strokeWidth={3} />
            </div>
            
            <div className="space-y-2 md:space-y-4">
              <h2 className="text-3xl md:text-4xl font-black text-dark tracking-tighter">{dict.shop.successModal.title}</h2>
              <p className="text-dark-500 font-medium leading-relaxed">
                {dict.shop.successModal.message}
              </p>
              <div className="inline-block px-4 py-2 rounded-xl bg-surface-2 border border-border mt-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-dark-300">ID: #{lastOrderId?.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>

            <div className="flex flex-col w-full gap-3 md:gap-4 pt-4">
              <a 
                href={`/es/orders/${lastOrderId}`}
                className="btn-primary w-full py-4 md:py-5 rounded-2xl !text-base md:!text-lg !font-black shadow-xl shadow-brand-500/20"
              >
                {dict.shop.successModal.viewOrder}
              </a>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 md:py-5 rounded-2xl text-dark-500 font-black text-base md:text-lg hover:bg-surface-2 transition-all"
              >
                {dict.shop.successModal.continue}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  )
}

function ArrowRight(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
