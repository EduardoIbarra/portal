import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const locales = ['es', 'en', 'zh']
const defaultLocale = 'es'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protect all routes except login and auth callback
  const isLoginPage = locales.some(locale => pathname === `/${locale}/login`)
  const isAuthCallback = pathname.startsWith('/api/auth')
  const isPublicAsset = pathname.startsWith('/_next') || 
                        pathname.startsWith('/favicon.ico') ||
                        pathname.includes('.')

  if (!user && !isLoginPage && !isAuthCallback && !isPublicAsset) {
    // Determine locale or fallback to default
    const locale = locales.find(l => pathname.startsWith(`/${l}/`)) || defaultLocale
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    const locale = locales.find(l => pathname.startsWith(`/${l}/`)) || defaultLocale
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}`
    return NextResponse.redirect(url)
  }

  // Handle i18n redirection if locale is missing
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale && !isPublicAsset && !isAuthCallback) {
    const url = new URL(`/${defaultLocale}${pathname}`, request.url)
    url.search = request.nextUrl.search
    
    const redirectResponse = NextResponse.redirect(url)
    
    // Transfer updated session cookies to the new redirect response
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
