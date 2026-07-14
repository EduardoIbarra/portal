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
    <main className="container mx-auto px-4 md:px-8 py-8 md:py-16">
      <TrackingDetailClient id={id} dict={dict} />
    </main>
  )
}
