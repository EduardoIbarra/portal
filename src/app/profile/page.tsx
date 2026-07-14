import { getProfile } from '@/lib/auth-utils'
import { createClient } from '@/lib/supabase-server'
import { User, Mail, MapPin, Phone, Hash, FileText } from 'lucide-react'
import { AddressManager } from './AddressManager'


export default async function ProfilePage() {
  const profile = await getProfile()
  const supabase = await createClient()

  let clientInfo: any = null

  if (profile?.client_id) {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', profile.client_id)
      .maybeSingle()
    
    if (data) clientInfo = data
  }

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in max-w-4xl mx-auto">
      <header className="animate-slide-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-dark flex items-center gap-3 leading-tight">
          <User className="w-8 h-8 md:w-10 md:h-10 text-brand-500" />
          Mi Perfil
        </h1>
        <p className="text-dark-500 mt-2 text-base md:text-lg font-medium">
          Información general de tu cuenta y datos fiscales.
        </p>
      </header>

      {clientInfo ? (
        <div className="card !p-0 overflow-hidden bg-white shadow-sm border border-border">
          <div className="p-8 md:p-10 border-b border-border bg-surface flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-brand-50 rounded-full flex items-center justify-center flex-shrink-0 text-brand-500 shadow-inner">
              <span className="text-4xl md:text-5xl font-black tracking-tighter">
                {clientInfo.nombre.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-dark">{clientInfo.nombre}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-border-2 rounded-full text-xs font-bold text-dark-500 uppercase tracking-widest shadow-sm">
                  <Hash className="w-3.5 h-3.5" />
                  ID Cliente
                </span>
                <span className="text-sm font-mono text-dark-300">
                  {clientInfo.id.split('-')[0].toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-8 space-y-8">
              <h3 className="font-bold text-lg text-dark flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-brand-500" />
                Datos de Contacto
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-dark-300 mb-0.5">Correo Electrónico</p>
                    <p className="text-dark font-medium">{clientInfo.correo || 'No especificado'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-dark-300 mb-0.5">Teléfono</p>
                    <p className="text-dark font-medium">{clientInfo.telefono || 'No especificado'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-dark-300 mb-0.5">Dirección</p>
                    <p className="text-dark font-medium">{clientInfo.direccion || 'No especificada'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8 bg-surface-2">
              <h3 className="font-bold text-lg text-dark flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-brand-500" />
                Datos Fiscales
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-border text-dark-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="font-black text-sm">RFC</span>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-dark-300 mb-0.5">Registro Federal de Contribuyentes</p>
                    <p className="text-dark font-bold font-mono text-lg tracking-wider">{clientInfo.rfc || 'No especificado'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-border text-dark-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-dark-300 mb-0.5">Régimen Fiscal</p>
                    <p className="text-dark font-medium">{clientInfo.regimen_fiscal || 'No especificado'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-border text-dark-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-dark-300 mb-0.5">Código Postal</p>
                    <p className="text-dark font-medium">{clientInfo.codigo_postal || 'No especificado'}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-border mt-8">
                <p className="text-xs text-dark-400 italic">
                  Para actualizar tu información fiscal o de contacto, por favor comunícate con tu agente de ventas o soporte.
                </p>
              </div>
            </div>
          </div>

          <div className="card p-8 md:p-10 bg-white shadow-sm border border-border rounded-3xl mt-6">
            <AddressManager clientId={clientInfo.id} initialAddresses={clientInfo.addresses || []} />
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center flex flex-col items-center">
          <User className="w-16 h-16 text-dark-200 mb-4" />
          <h2 className="text-xl font-bold text-dark mb-2">Información no disponible</h2>
          <p className="text-dark-500">No pudimos encontrar la información de tu perfil de cliente. Contacta a soporte si el problema persiste.</p>
        </div>
      )}
    </div>
  )
}
