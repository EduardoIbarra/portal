import { getDictionary, getLocale } from '@/lib/get-dictionary'
import LoginClient from './LoginClient'

export default async function LoginPage() {
  const lang = await getLocale()
  const dict = await getDictionary()

  return <LoginClient lang={lang} dict={dict} />
}
