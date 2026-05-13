import { getDictionary } from '@/lib/get-dictionary'
import OrderDetailClient from './OrderDetailClient'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string; lang: string }>
}) {
  const { id, lang } = await params
  const dict = await getDictionary(lang as any)

  return (
    <main className="container mx-auto px-4 md:px-8 py-8 md:py-16">
      <OrderDetailClient id={id} dict={dict} />
    </main>
  )
}
