import { getDictionary } from '@/lib/get-dictionary'
import ShopClient from './ShopClient'

export default async function ShopPage() {
  const dict = await getDictionary()

  return <ShopClient dict={dict} />
}
