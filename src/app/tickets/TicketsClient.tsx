'use client'

import { useState } from 'react'
import { 
  LifeBuoy, 
  Search, 
  Filter, 
  Plus, 
  X,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Send
} from 'lucide-react'
import { useTickets } from '@/hooks/useTickets'
import { useTicketUpdates } from '@/hooks/useTicketUpdates'
import { cn } from '@/lib/utils'
import { Database } from '@/types/database'

type Ticket = Database['public']['Tables']['tickets']['Row']

export default function TicketsClient({ dict }: { dict: any }) {
  const { tickets, loading, createTicket, updateTicket } = useTickets()
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  
  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignee, setAssignee] = useState('Unassigned')
  const [status, setStatus] = useState<'open' | 'in_progress' | 'resolved' | 'closed'>('open')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { updates, loading: updatesLoading, addUpdate } = useTicketUpdates(editingTicket?.id || null)
  const [newUpdate, setNewUpdate] = useState('')
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false)

  const statusMap = {
    open: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning-bg', label: 'Abierto' },
    in_progress: { icon: PlayCircle, color: 'text-brand-500', bg: 'bg-brand-50', label: 'En Progreso' },
    resolved: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success-bg', label: 'Resuelto' },
    closed: { icon: X, color: 'text-dark-300', bg: 'bg-surface-2', label: 'Cerrado' },
  }

  const assignees = ['Unassigned', 'BONSS', 'Eduardo']

  const handleOpenModal = (ticket?: Ticket) => {
    if (ticket) {
      setEditingTicket(ticket)
      setTitle(ticket.title)
      setDescription(ticket.description || '')
      setAssignee(ticket.assignee || 'Unassigned')
      setStatus(ticket.status)
    } else {
      setEditingTicket(null)
      setTitle('')
      setDescription('')
      setAssignee('Unassigned')
      setStatus('open')
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTicket(null)
    setNewUpdate('')
  }

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return
    setIsSubmittingUpdate(true)
    try {
      await addUpdate(newUpdate)
      setNewUpdate('')
    } catch (err) {
      console.error(err)
      alert('Error agregando actualización')
    } finally {
      setIsSubmittingUpdate(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      if (editingTicket) {
        await updateTicket(editingTicket.id, {
          title,
          description,
          assignee,
          status
        })
      } else {
        await createTicket(title, description)
      }
      handleCloseModal()
    } catch (err) {
      console.error('Error saving ticket:', err)
      alert('Error saving ticket. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.assignee?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 animate-slide-left">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-dark leading-tight">
            Tickets de Soporte
          </h1>
          <p className="text-dark-500 font-medium max-w-xl text-sm md:text-base">
            Reporta problemas y mantén un seguimiento de su resolución.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="relative group w-full sm:w-64 md:w-80">
            <Search className="crm-input-icon" />
            <input 
              type="text" 
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="crm-input pl-11 md:pl-12 py-3 md:py-3.5 !rounded-xl md:!rounded-2xl"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="btn-primary !p-3.5 rounded-xl md:!rounded-2xl flex-shrink-0 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold">Nuevo Ticket</span>
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {Object.entries(statusMap).map(([key, config]) => {
          const count = tickets.filter(t => t.status === key).length
          const Icon = config.icon
          return (
            <div key={key} className="card-hover card !p-5 flex items-center gap-4">
               <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", config.bg, config.color)}>
                  <Icon className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-dark-300 mb-0.5">{config.label}</p>
                  <p className="text-2xl font-black text-dark tracking-tighter leading-none">{count}</p>
               </div>
            </div>
          )
        })}
      </div>

      {/* Tickets List */}
      <div className="card rounded-[2.5rem] overflow-hidden min-h-[400px] relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
          </div>
        )}

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[800px] md:min-w-full">
            <thead>
              <tr className="bg-surface-2 border-b border-border">
                <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">Asunto</th>
                <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">Estado</th>
                <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">Responsable</th>
                <th className="px-4 md:px-10 py-4 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-dark-300">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-2">
              {filteredTickets.length === 0 && !loading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center text-dark-300 italic">
                    No se encontraron tickets
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const statusInfo = statusMap[ticket.status] || statusMap.open
                  const Icon = statusInfo.icon
                  
                  return (
                    <tr 
                      key={ticket.id} 
                      onClick={() => handleOpenModal(ticket)}
                      className="hover:bg-brand-50/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-4 md:px-10 py-5 md:py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-sm text-dark tracking-tight">{ticket.title}</span>
                          <span className="text-xs text-dark-400 mt-1 line-clamp-1">{ticket.description}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-10 py-5 md:py-6">
                        <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-2", statusInfo.bg, statusInfo.color)}>
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{statusInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-10 py-5 md:py-6">
                        <span className="text-sm font-bold text-dark-500 bg-surface-2 px-3 py-1 rounded-lg">
                          {ticket.assignee || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-4 md:px-10 py-5 md:py-6">
                        <span className="text-sm text-dark-500 font-medium">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-900/40 backdrop-blur-sm" onClick={handleCloseModal} />
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-in zoom-in-95 duration-200">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-2 text-dark-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black tracking-tight text-dark mb-6">
              {editingTicket ? 'Editar Ticket' : 'Nuevo Ticket'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-dark-300">
                  Asunto
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="crm-input w-full disabled:bg-surface-2 disabled:text-dark-500 disabled:cursor-not-allowed"
                  placeholder="Ej. Problema con pedido..."
                  disabled={!!editingTicket}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-dark-300">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="crm-input w-full min-h-[100px] py-3 resize-y disabled:bg-surface-2 disabled:text-dark-500 disabled:cursor-not-allowed"
                  placeholder="Describe el problema en detalle..."
                  disabled={!!editingTicket}
                />
              </div>

              {editingTicket && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-dark-300">
                      Estado
                    </label>
                    <input
                      type="text"
                      disabled
                      value={statusMap[status]?.label || 'Abierto'}
                      className="crm-input w-full bg-surface-2 text-dark-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-dark-300">
                      Responsable
                    </label>
                    <input
                      type="text"
                      disabled
                      value={assignee}
                      className="crm-input w-full bg-surface-2 text-dark-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              {!editingTicket && (
                <div className="pt-4 flex justify-end gap-3 border-t border-border-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Crear Ticket'
                    )}
                  </button>
                </div>
              )}
            </form>

            {editingTicket && (
              <div className="mt-8 pt-6 border-t border-border-2 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-dark-300">Actualizaciones</h3>
                
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {updatesLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-brand-500" /></div>
                  ) : updates.length === 0 ? (
                    <p className="text-sm text-dark-400 italic">No hay actualizaciones aún.</p>
                  ) : (
                    updates.map(update => (
                      <div key={update.id} className="bg-surface-2 p-4 rounded-2xl">
                        <p className="text-sm text-dark">{update.content}</p>
                        <p className="text-[10px] font-bold text-dark-400 mt-2 uppercase tracking-wide">
                          {new Date(update.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newUpdate}
                    onChange={e => setNewUpdate(e.target.value)}
                    placeholder="Escribe una actualización..."
                    className="crm-input flex-1"
                    onKeyDown={e => e.key === 'Enter' && handleAddUpdate()}
                  />
                  <button 
                    onClick={handleAddUpdate}
                    disabled={isSubmittingUpdate || !newUpdate.trim()}
                    className="btn-primary !p-3 rounded-xl flex-shrink-0"
                  >
                    {isSubmittingUpdate ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
