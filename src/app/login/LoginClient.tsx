'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  Loader2,
  AlertCircle
} from 'lucide-react'

export default function LoginClient({ lang, dict }: { lang: string, dict: any }) {
  const [loading, setLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setEmailLoading(false)
    } else {
      window.location.href = `/`
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-md space-y-10 animate-fade-in">
        <div className="text-center">
          <div className="mb-10 animate-slide-up flex justify-center">
            <img 
              src="https://arthromed.mx/wp-content/uploads/2024/01/logoOrigPag.png" 
              alt="Arthromed" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="text-dark-500 mt-3 font-medium text-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>{dict.common.portalAccess}</p>
        </div>

        <div className="card p-10 shadow-2xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-danger-bg text-danger text-sm flex items-center gap-3 border border-danger/10 animate-shake">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-dark-500 mb-2 pl-1">{dict.common.email}</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-border-2 bg-bg-hover focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-dark placeholder:text-dark-300 font-medium"
                  placeholder="name@arthromed.com.mx"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-dark-500 mb-2 pl-1">{dict.common.password}</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-border-2 bg-bg-hover focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-dark placeholder:text-dark-300 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={emailLoading || loading}
                className="w-full flex items-center justify-center gap-4 px-6 py-4 mt-2 rounded-2xl bg-brand-500 text-white font-bold hover:bg-brand-600 active:scale-[0.98] transition-all duration-200 shadow-xl shadow-brand-500/20 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                {emailLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : dict.common.signIn}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-border-2 flex-1"></div>
              <span className="text-xs font-bold text-dark-400 uppercase tracking-widest">OR</span>
              <div className="h-px bg-border-2 flex-1"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              type="button"
              disabled={loading || emailLoading}
              className="w-full flex items-center justify-center gap-4 px-6 py-4 rounded-2xl border border-border-2 bg-white hover:bg-bg-hover active:scale-[0.98] transition-all duration-200 group relative overflow-hidden shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-base font-bold text-dark tracking-tight">{dict.common.continueWithGoogle}</span>
                </>
              )}
            </button>

            <div className="pt-4 text-center">
              <p className="text-[11px] text-dark-400 font-bold uppercase tracking-[0.1em] leading-relaxed max-w-[280px] mx-auto">
                {dict.common.onlyArthromedEmails}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-dark-300 font-bold uppercase tracking-widest">
            © 2026 Arthromed S.A. de C.V.
          </p>
        </div>
      </div>
    </div>
  )
}
