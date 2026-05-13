import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type ProductPrice = Database['public']['Tables']['product_prices']['Row']
type HospitalPrice = Database['public']['Tables']['hospital_prices']['Row']

export function useProducts(hospitalId?: string) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        
        // 1. Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')

        if (productsError) throw productsError

        // 2. Fetch base prices
        const { data: pricesData, error: pricesError } = await supabase
          .from('product_prices')
          .select('*')

        if (pricesError) throw pricesError

        // 3. Fetch hospital prices if hospitalId is provided
        let hospitalPricesData: HospitalPrice[] = []
        if (hospitalId) {
          const { data, error } = await supabase
            .from('hospital_prices')
            .select('*')
            .eq('hospital_id', hospitalId)
          
          if (error) throw error
          hospitalPricesData = data || []
        }

        // Combine data
        const combined = (productsData as any[]).map((p: any) => {
          const basePrice = (pricesData as ProductPrice[]).find(price => price.product_id === p.id)
          const hospPrice = hospitalPricesData.find(hp => hp.product_id === p.id)
          
          return {
            ...p,
            name: p.description || p.name || 'No description',
            sku: p.model || p.order_code || p.sku || 'N/A',
            category: p.line || p.type || p.category || 'General',
            basePrice: basePrice?.price || (p.sale_price ? parseFloat(p.sale_price.toString()) : 0),
            hospitalPrice: hospPrice?.price || (p.base_hospital_price ? parseFloat(p.base_hospital_price.toString()) : null)
          }
        })

        setProducts(combined)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [hospitalId])

  return { products, loading, error }
}
