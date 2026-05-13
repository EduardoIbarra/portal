import { getDictionary, Locale } from '@/lib/get-dictionary'
import ShopClient from './ShopClient'

export default async function ShopPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)

  return <ShopClient dict={dict} />
}
