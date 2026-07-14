'use client'

import { useState } from 'react'
import { MapPin, Plus, Trash2, Loader2, Home } from 'lucide-react'
import { updateAddresses } from '@/app/actions/addresses'

interface Address {
  name: string
  zip_code: string
  address: string
  is_dhl: boolean
}

export function AddressManager({ 
  clientId, 
  initialAddresses 
}: { 
  clientId: string
  initialAddresses: Address[] 
}) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses || [])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Form states
  const [name, setName] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [address, setAddress] = useState('')
  const [isDhl, setIsDhl] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !address.trim()) return

    const newAddress: Address = {
      name: name.trim(),
      zip_code: zipCode.trim(),
      address: address.trim(),
      is_dhl: isDhl
    }

    const updated = [...addresses, newAddress]
    setLoading(true)
    try {
      await updateAddresses(clientId, updated)
      setAddresses(updated)
      // Reset form
      setName('')
      setZipCode('')
      setAddress('')
      setIsDhl(false)
      setShowAddForm(false)
    } catch (err) {
      console.error(err)
      alert('Error al guardar la dirección')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (index: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta dirección?')) return

    const updated = addresses.filter((_, i) => i !== index)
    setLoading(true)
    try {
      await updateAddresses(clientId, updated)
      setAddresses(updated)
    } catch (err) {
      console.error(err)
      alert('Error al eliminar la dirección')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-dark flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-500" />
          Direcciones de Entrega Adicionales
        </h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 rounded-xl"
            disabled={loading}
          >
            <Plus className="w-4 h-4" /> Agregar Nueva
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="p-5 bg-surface-2 rounded-3xl border border-border-2 space-y-4 animate-slide-down">
          <div className="flex justify-between items-center pb-2 border-b border-border-2">
            <p className="text-xs font-black uppercase tracking-wider text-dark-500">Nueva Dirección de Entrega</p>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="text-xs font-bold text-dark-400 hover:text-dark-600"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-dark-300">Alias / Identificador</label>
              <input
                type="text"
                className="w-full bg-white border border-border p-3 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                placeholder="Ej. Sucursal GDL o Matriz"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-dark-300">Código Postal</label>
              <input
                type="text"
                className="w-full bg-white border border-border p-3 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                placeholder="Ej. 64000"
                maxLength={5}
                value={zipCode}
                onChange={e => setZipCode(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-dark-300">Dirección Completa</label>
            <input
              type="text"
              className="w-full bg-white border border-border p-3 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 outline-none text-sm"
              placeholder="Calle, Número, Colonia, Municipio, Estado"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer selection:bg-transparent">
              <input
                type="checkbox"
                className="w-4 h-4 text-brand-500 border-border rounded focus:ring-brand-500 cursor-pointer"
                checked={isDhl}
                onChange={e => setIsDhl(e.target.checked)}
              />
              <span className="text-xs font-bold text-dark-500 flex items-center gap-1">
                Es una sucursal <span className="text-[#ffcc00] font-black bg-[#d30005] px-1 py-0.5 rounded text-[10px] tracking-tight">DHL</span> Ocurre
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2 rounded-xl"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Dirección'}
            </button>
          </div>
        </form>
      )}

      {loading && !showAddForm && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      )}

      {!loading && addresses.length === 0 && (
        <div className="p-8 text-center border border-dashed border-border-2 rounded-3xl bg-surface-2">
          <p className="text-sm italic text-dark-400">No hay direcciones adicionales registradas.</p>
        </div>
      )}

      {!loading && addresses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr, idx) => (
            <div key={idx} className="p-4 bg-white border border-border-2 rounded-3xl flex items-start justify-between gap-3 hover:border-brand-300 transition-colors shadow-sm relative group">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-brand-500 flex items-center gap-1">
                    {addr.is_dhl ? (
                      <span className="text-[#ffcc00] font-black bg-[#d30005] px-1 py-0.5 rounded text-[8px] tracking-tight">DHL</span>
                    ) : (
                      <Home className="w-3.5 h-3.5 text-brand-500" />
                    )}
                    {addr.name}
                  </span>
                  {addr.zip_code && (
                    <span className="text-[9px] bg-brand-50 text-brand-500 px-2 py-0.5 rounded-full font-bold">
                      CP {addr.zip_code}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-dark-600 leading-relaxed">{addr.address}</p>
              </div>

              <button
                onClick={() => handleDelete(idx)}
                className="text-danger p-1.5 rounded-xl hover:bg-danger-bg opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar dirección"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
