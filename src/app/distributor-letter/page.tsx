import { getProfile } from '@/lib/auth-utils'
import { createClient } from '@/lib/supabase-server'
import DistributorLetterClient from './DistributorLetterClient'

export default async function DistributorLetterPage() {
  const profile = await getProfile()
  const supabase = await createClient()

  let cartas: any[] = []
  let solicitudes: any[] = []
  if (profile?.client_id) {
    // 1. Fetch current client's RFC from clientes table
    const { data: clientInfo } = await supabase
      .from('clientes')
      .select('id, rfc')
      .eq('id', profile.client_id)
      .maybeSingle()

    if (clientInfo?.rfc) {
      // 2. Try to find matching clients row in clients table to match client_id
      const { data: erpClient } = await supabase
        .from('clients')
        .select('id')
        .eq('rfc', clientInfo.rfc)
        .maybeSingle()

      // 3. Query letters by matching RFC or erpClient.id
      const { data } = await supabase
        .from('cartas_distribucion')
        .select('*')
        .or(`rfc.eq.${clientInfo.rfc}${erpClient ? `,client_id.eq.${erpClient.id}` : ''}`)
        .order('created_at', { ascending: false })
      
      if (data) cartas = data

      // 4. Query requests
      const { data: solicitudesData } = await supabase
        .from('solicitudes_carta_distribucion')
        .select('*')
        .eq('client_id', clientInfo.id)
        .order('created_at', { ascending: false })

      if (solicitudesData) solicitudes = solicitudesData
    }
  }

  return (
    <DistributorLetterClient 
      cartas={cartas}
      solicitudes={solicitudes}
    />
  )
}
