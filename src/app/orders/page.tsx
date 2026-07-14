import { getDictionary } from '@/lib/get-dictionary'
import { getProfile } from '@/lib/auth-utils'
import OrdersClient from './OrdersClient'

export default async function OrdersPage() {
  const dict = await getDictionary()
  const profile = await getProfile()

  return <OrdersClient dict={dict} clientId={profile?.client_id} />
}

