import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Database } from '@/types/database'

type Order = Database['public']['Tables']['orders']['Row']

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        
        // In a real app, we'd filter by the current user's client_id
        const { data, error } = await supabase
          .from('orders')
          .select('*, hospitals(name)')
          .order('created_at', { ascending: false })

        if (error) throw error
        setOrders(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  return { orders, loading, error }
}
