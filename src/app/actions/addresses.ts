'use server'

import { createAdminClient } from '@/lib/supabase-server'
import { getProfile } from '@/lib/auth-utils'

export async function getAddresses(clientId: string) {
  const profile = await getProfile()
  if (!profile || profile.client_id !== clientId) {
    throw new Error('Unauthorized')
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('addresses')
    .eq('id', clientId)
    .single()

  if (error) {
    console.error('Error fetching addresses:', error)
    throw new Error('Error fetching addresses')
  }

  return (data?.addresses || []) as any[]
}

export async function updateAddresses(clientId: string, addresses: any[]) {
  const profile = await getProfile()
  if (!profile || profile.client_id !== clientId) {
    throw new Error('Unauthorized')
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('clientes')
    .update({ addresses })
    .eq('id', clientId)

  if (error) {
    console.error('Error updating addresses:', error)
    throw new Error('Error updating addresses')
  }

  return { success: true }
}
