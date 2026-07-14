import { getProfile } from '@/lib/auth-utils'
import { createClient } from '@/lib/supabase-server'
import { FileCheck, Calendar, ArrowUpRight, Hash, Download } from 'lucide-react'

export default async function DistributorLetterPage() {
  const profile = await getProfile()
  const supabase = await createClient()

  let cartas: any[] = []
  if (profile?.client_id) {
    const { data } = await supabase
      .from('cartas_distribucion')
      .select('*')
      .eq('client_id', profile.client_id)
      .order('created_at', { ascending: false })
    
    if (data) cartas = data
  }

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in">
      <header className="animate-slide-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-dark flex items-center gap-3 leading-tight">
          <FileCheck className="w-8 h-8 md:w-10 md:h-10 text-brand-500" />
          Cartas de Distribución
        </h1>
        <p className="text-dark-500 mt-2 text-base md:text-lg font-medium">
          Consulta y descarga tus cartas de autorización de distribución vigentes.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cartas.length === 0 ? (
          <div className="col-span-full card p-10 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center">
              <FileCheck className="w-10 h-10 text-brand-500" />
            </div>
            <h3 className="text-xl font-bold text-dark">No hay cartas disponibles</h3>
            <p className="text-dark-500">Actualmente no cuentas con cartas de distribución emitidas.</p>
          </div>
        ) : (
          cartas.map(carta => {
            const vigenciaDate = new Date(carta.vigencia)
            const isValid = vigenciaDate >= new Date()

            return (
              <div key={carta.id} className="card !p-0 overflow-hidden flex flex-col group hover:border-brand-300 transition-colors">
                <div className="p-6 md:p-8 flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-500 bg-brand-50 px-2 py-1 rounded-full">
                        {carta.codigo || 'S/C'}
                      </span>
                      <h3 className="font-bold text-lg text-dark line-clamp-2">{carta.empresa_nombre}</h3>
                    </div>
                    {isValid ? (
                      <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(22,163,74,0.5)]"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-danger shadow-[0_0_8px_rgba(220,38,38,0.5)]"></span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-dark-500">
                      <Hash className="w-4 h-4 text-dark-300" />
                      <span className="font-medium">RFC: {carta.rfc}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-dark-500">
                      <Calendar className="w-4 h-4 text-dark-300" />
                      <span className="font-medium">
                        Vigencia: <span className={isValid ? "text-dark font-bold" : "text-danger font-bold"}>{vigenciaDate.toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-dark-300">Líneas Autorizadas</p>
                    <div className="flex flex-wrap gap-2">
                      {carta.lineas_producto?.map((linea: string, i: number) => (
                        <span key={i} className="text-xs font-bold px-2 py-1 bg-surface-2 rounded-md border border-border text-dark">
                          {linea}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-border bg-surface-2">
                  {carta.letter_url ? (
                    <a 
                      href={carta.letter_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full btn-secondary py-2.5 text-sm flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Descargar Carta
                    </a>
                  ) : (
                    <button disabled className="w-full btn-secondary py-2.5 text-sm flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                      <FileCheck className="w-4 h-4" />
                      Documento no disponible
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
