import { getDictionary, Locale } from '@/lib/get-dictionary'
import PricesClient from './PricesClient'

export default async function PricesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)

  return <PricesClient dict={dict} />
}
