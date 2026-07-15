import { getProfile } from '@/lib/auth-utils'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import RequestLetterClient from './RequestLetterClient'

export default async function RequestLetterPage() {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }

  const supabase = await createClient()
  let clientInfo: any = null

  if (profile.client_id) {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', profile.client_id)
      .maybeSingle()
    if (data) {
      clientInfo = data
    }
  }

  return (
    <RequestLetterClient 
      profile={profile}
      clientInfo={clientInfo}
    />
  )
}
