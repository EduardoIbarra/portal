import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Database } from '@/types/database'

type Hospital = Database['public']['Tables']['hospitals']['Row']

export function useHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchHospitals() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('hospitals')
          .select('*')
          .order('name')

        if (error) throw error
        setHospitals(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchHospitals()
  }, [])

  return { hospitals, loading, error }
}
