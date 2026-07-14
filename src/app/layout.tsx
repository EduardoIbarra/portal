import { Inter } from "next/font/google"
import "./globals.css"
import { getDictionary, getLocale } from "@/lib/get-dictionary"
import { MainLayout } from "@/components/MainLayout"
import { getUser, isAdmin } from "@/lib/auth-utils"
import { cookies } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const lang = await getLocale()
  const dict = await getDictionary()
  const user = await getUser()
  const admin = await isAdmin()
  
  const cookieStore = await cookies()
  const impersonatedId = cookieStore.get('impersonated_client_id')?.value

  return (
    <html lang={lang}>
      <body className={inter.className}>
        <MainLayout 
          lang={lang} 
          dict={dict} 
          user={user}
          isAdmin={admin}
          impersonatedId={impersonatedId}
        >
          {children}
        </MainLayout>
      </body>
    </html>
  )
}
