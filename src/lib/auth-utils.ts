import { createClient } from '@/lib/supabase-server'
import { cache } from 'react'
import { cookies } from 'next/headers'

export const getSession = cache(async () => {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
})

export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export const getProfile = cache(async () => {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile && (profile.role === 'admin' || profile.role === 'superadmin')) {
    const cookieStore = await cookies()
    const impersonatedId = cookieStore.get('impersonated_client_id')?.value
    if (impersonatedId) {
      profile.client_id = impersonatedId
      profile.is_impersonating = true // helpful flag
    }
  }

  return profile
})

export const isAdmin = cache(async () => {
  const profile = await getProfile()
  return profile?.role === 'admin' || profile?.role === 'superadmin'
})
