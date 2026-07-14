import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Database } from '@/types/database'

type TicketUpdate = Database['public']['Tables']['ticket_updates']['Row']

export function useTicketUpdates(ticketId: string | null) {
  const [updates, setUpdates] = useState<TicketUpdate[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (ticketId) {
      fetchUpdates()
    } else {
      setUpdates([])
    }
  }, [ticketId])

  const fetchUpdates = async () => {
    if (!ticketId) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ticket_updates')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setUpdates(data || [])
    } catch (err) {
      console.error('Error fetching ticket updates:', err)
    } finally {
      setLoading(false)
    }
  }

  const addUpdate = async (content: string) => {
    if (!ticketId) return null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      const { data, error } = await supabase
        .from('ticket_updates')
        .insert({
          ticket_id: ticketId,
          content,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error
      
      setUpdates(prev => [...prev, data])
      return data
    } catch (err) {
      console.error('Error adding ticket update:', err)
      throw err
    }
  }

  return { updates, loading, addUpdate, refresh: fetchUpdates }
}
