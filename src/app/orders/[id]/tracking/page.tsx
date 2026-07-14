import { getDictionary } from '@/lib/get-dictionary'
import TrackingDetailClient from './TrackingDetailClient'

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dict = await getDictionary()

  return (
    <div className="container mx-auto py-4">
      <TrackingDetailClient id={id} dict={dict} />
    </div>
  )
}
