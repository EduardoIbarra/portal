import { getDictionary } from '@/lib/get-dictionary'
import TicketsClient from './TicketsClient'

export default async function TicketsPage() {
  const dict = await getDictionary()

  return <TicketsClient dict={dict} />
}
