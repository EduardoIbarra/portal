import { getDictionary } from '@/lib/get-dictionary'
import PricesClient from './PricesClient'

export default async function PricesPage() {
  const dict = await getDictionary()

  return <PricesClient dict={dict} />
}
