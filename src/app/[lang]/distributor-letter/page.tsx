import { getDictionary, Locale } from '@/lib/get-dictionary'
import LetterClient from './LetterClient'

export default async function DistributorLetterPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)

  return <LetterClient dict={dict} />
}
