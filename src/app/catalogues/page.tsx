import { getDictionary } from '@/lib/get-dictionary'
import CataloguesClient from './CataloguesClient'

export default async function CataloguesPage() {
  const dict = await getDictionary()

  return <CataloguesClient dict={dict} />
}
