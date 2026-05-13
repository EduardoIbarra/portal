import { Inter } from "next/font/google"
import "../globals.css"
import { getDictionary, Locale } from "@/lib/get-dictionary"
import { MainLayout } from "@/components/MainLayout"
import { getUser } from "@/lib/auth-utils"

const inter = Inter({ subsets: ["latin"] })

export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }, { lang: 'zh' }]
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)
  const user = await getUser()

  return (
    <html lang={lang}>
      <body className={inter.className}>
        <MainLayout lang={lang} dict={dict} user={user}>
          {children}
        </MainLayout>
      </body>
    </html>
  )
}
