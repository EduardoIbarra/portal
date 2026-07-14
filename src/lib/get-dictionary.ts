import 'server-only'
import { cookies } from 'next/headers'

const dictionaries = {
  es: () => import('../dictionaries/es.json').then((module) => module.default),
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  zh: () => import('../dictionaries/zh.json').then((module) => module.default),
}

export type Locale = keyof typeof dictionaries

export const getLocale = async () => {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value as Locale
  return dictionaries[locale] ? locale : 'es'
}

export const getDictionary = async () => {
  const locale = await getLocale()
  return dictionaries[locale]()
}
