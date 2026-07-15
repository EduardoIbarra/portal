'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileCheck, Calendar, Hash, Download, Plus, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DistributorLetterClientProps {
  cartas: any[]
  solicitudes: any[]
}

export default function DistributorLetterClient({ cartas, solicitudes }: DistributorLetterClientProps) {
  const [activeTab, setActiveTab] = useState<'letters' | 'requests'>('letters')

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 animate-slide-left">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-dark flex items-center gap-3 leading-tight">
            <FileCheck className="w-8 h-8 md:w-10 md:h-10 text-brand-500" />
            Cartas de Distribución
          </h1>
          <p className="text-dark-500 mt-2 text-base md:text-lg font-medium">
            Consulta y descarga tus cartas de autorización o gestiona tus solicitudes en trámite.
          </p>
        </div>
        
        <Link 
          href="/distributor-letter/request"
          className="btn-primary !p-3.5 rounded-xl md:!rounded-2xl flex-shrink-0 flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">Solicitar Nueva Carta</span>
        </Link>
      </header>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => setActiveTab('letters')}
          className={cn(
            "pb-4 text-sm font-bold border-b-2 transition-all relative",
            activeTab === 'letters'
              ? "border-brand-500 text-brand-600 font-extrabold"
              : "border-transparent text-dark-400 hover:text-dark-600"
          )}
        >
          Cartas Autorizadas ({cartas.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={cn(
            "pb-4 text-sm font-bold border-b-2 transition-all relative",
            activeTab === 'requests'
              ? "border-brand-500 text-brand-600 font-extrabold"
              : "border-transparent text-dark-400 hover:text-dark-600"
          )}
        >
          Solicitudes de Carta ({solicitudes.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'letters' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {cartas.length === 0 ? (
              <div className="col-span-full card p-12 flex flex-col items-center text-center space-y-4">
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {solicitudes.length === 0 ? (
              <div className="col-span-full card p-12 flex flex-col items-center text-center space-y-4 bg-surface-2 italic text-dark-500">
                No tienes solicitudes de cartas de distribución anteriores.
              </div>
            ) : (
              solicitudes.map(sol => {
                const statusConfig = {
                  pending: { bg: 'bg-warning-bg text-warning', label: 'Pendiente' },
                  approved: { bg: 'bg-success-bg text-success', label: 'Aprobada' },
                  rejected: { bg: 'bg-danger-bg text-danger', label: 'Rechazada' },
                }[sol.status as 'pending' | 'approved' | 'rejected'] || { bg: 'bg-dark-100 text-dark-500', label: sol.status }

                return (
                  <div key={sol.id} className="card bg-white border border-border p-6 flex flex-col justify-between hover:border-brand-300 transition-colors">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-dark-300">Hospital / Institución</p>
                          <h3 className="font-bold text-base text-dark line-clamp-2 leading-snug">{sol.hospital}</h3>
                        </div>
                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex-shrink-0", statusConfig.bg)}>
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-dark-300">Líneas de Producto</p>
                        <div className="flex flex-wrap gap-1.5">
                          {sol.lineas_producto.map((linea: string) => (
                            <span key={linea} className="text-[10px] font-bold px-2 py-0.5 bg-surface-2 rounded border border-border text-dark">
                              {linea}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-dark-300">Estados</p>
                        <p className="text-xs font-semibold text-dark-500 line-clamp-2 leading-relaxed">
                          {sol.estados.join(', ')}
                        </p>
                      </div>

                      {sol.acciones && sol.acciones.length > 0 && (
                        <div className="pt-3 mt-3 border-t border-dashed border-border-2 space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-dark-300">Comentarios / Acciones</p>
                          <div className="space-y-2">
                            {sol.acciones.map((acc: any) => (
                              <div key={acc.id} className="text-xs bg-surface-2 rounded-lg p-2.5 border border-border">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className={cn(
                                    "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded",
                                    acc.action === 'reject' ? 'bg-danger-bg text-danger' : 
                                    acc.action === 'approve' ? 'bg-success-bg text-success' : 'bg-brand-50 text-brand-600'
                                  )}>
                                    {acc.action === 'reject' ? 'Rechazada' : acc.action === 'approve' ? 'Aprobada' : acc.action}
                                  </span>
                                  <span className="text-[9px] text-dark-400 font-semibold">{new Date(acc.created_at).toLocaleDateString()}</span>
                                </div>
                                {acc.comment && <p className="text-dark-600 font-medium leading-normal">{acc.comment}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border-2 mt-4 text-[10px] text-dark-400 font-bold flex items-center justify-between gap-4">
                      <span>Solicitado el: {new Date(sol.created_at).toLocaleDateString()}</span>
                      <Link 
                        href={`/distributor-letter/request?clone=${sol.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-dark-600 hover:border-brand-300 hover:text-brand-600 transition-colors shadow-sm font-semibold text-[10px]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Clonar
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
