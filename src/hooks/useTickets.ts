import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Database } from '@/types/database'

type Ticket = Database['public']['Tables']['tickets']['Row']

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .or(`reporter_id.eq.${user.id},assignee_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (err: any) {
      console.error('Error fetching tickets:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createTicket = async (title: string, description: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          title,
          description,
          reporter_id: user.id
        })
        .select()
        .single()

      if (error) throw error
      
      setTickets(prev => [data, ...prev])
      return data
    } catch (err: any) {
      console.error('Error creating ticket:', err)
      throw err
    }
  }

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setTickets(prev => prev.map(t => t.id === id ? data : t))
      return data
    } catch (err: any) {
      console.error('Error updating ticket:', err)
      throw err
    }
  }

  return { tickets, loading, error, createTicket, updateTicket, refresh: fetchTickets }
}
