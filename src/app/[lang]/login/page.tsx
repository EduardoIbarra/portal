import { getDictionary, Locale } from '@/lib/get-dictionary'
import LoginClient from './LoginClient'

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)

  return <LoginClient lang={lang} dict={dict} />
}
