import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export function useOrders(initialClientId?: string) {
  const [orders, setOrders] = useState<any[]>([])
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchOrdersAndQuotes() {
      try {
        setLoading(true)
        
        let clientId = initialClientId

        if (!clientId) {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return

          // Fetch the profile to get the client_id
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('client_id')
            .eq('id', user.id)
            .single()
          
          if (profileError && profileError.code !== 'PGRST116') {
             console.error('Error fetching profile:', profileError)
          }

          clientId = profile?.client_id
        }
        
        if (!clientId) {
          setOrders([])
          setQuotes([])
          return
        }

        // Fetch facturas (orders)
        const { data: facturasData, error: facturasError } = await supabase
          .from('facturas_cliente')
          .select('*')
          .eq('cliente_id', clientId)
          .order('created_at', { ascending: false })

        if (facturasError) throw facturasError

        // Fetch quotes (cotizaciones)
        const { data: quotesData, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })

        if (quotesError) throw quotesError

        setOrders(facturasData || [])
        setQuotes(quotesData || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrdersAndQuotes()
  }, [initialClientId])

  return { orders, quotes, loading, error }
}


