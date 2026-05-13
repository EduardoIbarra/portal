import { getDictionary, Locale } from '@/lib/get-dictionary'
import OrdersClient from './OrdersClient'

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)

  return <OrdersClient dict={dict} />
}
