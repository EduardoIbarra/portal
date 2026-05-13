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
        
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        const clientId = profile?.client_id || user.id

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('client_id', clientId)
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
