'use server'

import { cookies } from 'next/headers'
import { isAdmin } from '@/lib/auth-utils'

export async function setImpersonation(clientId: string) {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const cookieStore = await cookies()
  cookieStore.set('impersonated_client_id', clientId, { 
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 1 day
  })
}

export async function clearImpersonation() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized')
  }

  const cookieStore = await cookies()
  cookieStore.delete('impersonated_client_id')
}
