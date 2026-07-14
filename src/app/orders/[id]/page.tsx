import { getDictionary } from '@/lib/get-dictionary'
import OrderDetailClient from './OrderDetailClient'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dict = await getDictionary()

  return (
    <div className="container mx-auto py-4">
      <OrderDetailClient id={id} dict={dict} />
    </div>
  )
}
