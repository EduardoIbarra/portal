import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const lang = searchParams.get('lang') ?? 'es'
  const next = searchParams.get('next') ?? `/${lang}`

  // Determine the correct origin for redirection
  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') ?? (host?.includes('localhost') ? 'http' : 'https')
  const origin = host ? `${protocol}://${host}` : new URL(request.url).origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      const user = data.user
      
      // 1. Ensure client record exists (required for orders)
      // We check first to avoid unnecessary writes if columns differ from our guess
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingClient) {
        await supabase.from('clients').insert({
          id: user.id,
          name: user.user_metadata.full_name || user.email || 'New Client',
        })
      }

      // 2. Ensure user_profile record exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        await supabase.from('user_profiles').insert({
          id: user.id,
          full_name: user.user_metadata.full_name,
          avatar_url: user.user_metadata.avatar_url,
          role: 'customer'
        })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/${lang}/login?error=Could not authenticate user`)
}
