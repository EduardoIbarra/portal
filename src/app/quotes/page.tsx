import { getProfile } from '@/lib/auth-utils'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { FileText, Plus, ClipboardList } from 'lucide-react'

export default async function QuotesPage() {
  const profile = await getProfile()
  const supabase = await createClient()

  let quotes: any[] = []
  if (profile?.client_id) {
    const { data } = await supabase
      .from('quotes')
      .select('*')
      .eq('client_id', profile.client_id)
      .order('created_at', { ascending: false })
    if (data) quotes = data
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-dark flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-brand-500" />
            Mis Cotizaciones
          </h1>
          <p className="text-dark-500 mt-1 font-medium">
            Consulta tus cotizaciones y crea nuevas fácilmente.
          </p>
        </div>
        <Link href="/quotes/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nueva Cotización
        </Link>
      </header>

      <section className="card !p-0 overflow-hidden">
        {quotes.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-brand-500" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-2">No tienes cotizaciones</h3>
            <p className="text-dark-500 mb-6">Crea tu primera cotización para empezar.</p>
            <Link href="/quotes/new" className="btn-primary inline-flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Crear Cotización
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {quotes.map((quote) => (
              <div key={quote.id} className="p-5 md:p-6 hover:bg-surface-2 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark text-lg">Cotización #{quote.id.split('-')[0]}</h3>
                    <p className="text-sm text-dark-500">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <p className="font-black text-xl text-dark">
                    ${Number(quote.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    {quote.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
