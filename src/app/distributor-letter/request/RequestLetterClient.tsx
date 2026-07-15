'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useHospitals } from '@/hooks/useHospitals'
import { 
  FileCheck, 
  ArrowLeft, 
  Search, 
  Check, 
  X, 
  ChevronDown, 
  Loader2, 
  Building,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createSolicitudAction } from '@/app/actions/solicitudes'

// Mexico states list
const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 
  'Chihuahua', 'Coahuila', 'Colima', 'Ciudad de México (CDMX)', 'Durango', 
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México (Edomex)', 
  'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 
  'Yucatán', 'Zacatecas'
]

// Product lines derived from database
const LINEAS_PRODUCTO = [
  'SPORTS MEDICINE',
  'SPINE',
  'UBE',
  'ENT',
  'URO & GYN',
  'Lentes'
]

interface RequestLetterClientProps {
  profile: any
  clientInfo: any
}

export default function RequestLetterClient({ profile, clientInfo }: RequestLetterClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const { hospitals, loading: loadingHospitals } = useHospitals()

  // Form states
  const [selectedLines, setSelectedLines] = useState<string[]>([])
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [hospitalInput, setHospitalInput] = useState('')
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null)
  const [hospitalEmail, setHospitalEmail] = useState('')
  const [hospitalPhone, setHospitalPhone] = useState('')

  // Autocomplete source from database
  const [destinatarios, setDestinatarios] = useState<string[]>([])

  const searchParams = useSearchParams()
  const cloneId = searchParams.get('clone')

  // UI dropdown states
  const [stateSearch, setStateSearch] = useState('')
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false)
  const [hospitalSearch, setHospitalSearch] = useState('')
  const [isHospitalDropdownOpen, setIsHospitalDropdownOpen] = useState(false)

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stateDropdownRef = useRef<HTMLDivElement>(null)
  const hospitalDropdownRef = useRef<HTMLDivElement>(null)

  // Load clone request details if cloneId query parameter is present
  useEffect(() => {
    async function loadClonedRequest() {
      if (!cloneId) return
      const { data, error } = await supabase
        .from('solicitudes_carta_distribucion')
        .select('*')
        .eq('id', cloneId)
        .single()
      
      if (data && !error) {
        setSelectedLines(data.lineas_producto || [])
        setSelectedStates(data.estados || [])
        setHospitalInput(data.hospital || '')
        setHospitalSearch(data.hospital || '')
        setHospitalEmail(data.hospital_email || '')
        setHospitalPhone(data.hospital_phone || '')
      }
    }
    loadClonedRequest()
  }, [cloneId, supabase])

  // Fetch unique destinatarios from cartas_distribucion
  useEffect(() => {
    async function fetchDestinatarios() {
      const { data } = await supabase
        .from('cartas_distribucion')
        .select('destinatario')
      
      if (data) {
        const uniqueDest = new Set<string>()
        data.forEach((item: any) => {
          const val = item.destinatario
          if (val && typeof val === 'string') {
            const cleanVal = val.trim()
            const norm = cleanVal.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim()
            if (
              norm !== 'a quien corresponda' && 
              norm !== 'aquiencorresponda' && 
              norm !== 'a quiien corresponda' && 
              norm !== 'test' && 
              norm !== ''
            ) {
              // Strip trailing period if present
              let formatted = cleanVal
              if (formatted.endsWith('.')) {
                formatted = formatted.substring(0, formatted.length - 1).trim()
              }
              uniqueDest.add(formatted)
            }
          }
        })
        setDestinatarios(Array.from(uniqueDest).sort((a, b) => a.localeCompare(b)))
      }
    }
    fetchDestinatarios()
  }, [supabase])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
        setIsStateDropdownOpen(false)
      }
      if (hospitalDropdownRef.current && !hospitalDropdownRef.current.contains(event.target as Node)) {
        setIsHospitalDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Line selection handler
  const toggleLine = (line: string) => {
    setSelectedLines(prev => 
      prev.includes(line) ? prev.filter(l => l !== line) : [...prev, line]
    )
  }

  // State selection handler
  const toggleState = (state: string) => {
    setSelectedStates(prev => 
      prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
    )
  }

  // Filtered states based on search
  const filteredStates = ESTADOS_MEXICO.filter(state => 
    state.toLowerCase().includes(stateSearch.toLowerCase())
  )

  // Combine and deduplicate hospitals and destinatarios
  const combinedHospitals = (() => {
    const seen = new Set<string>()
    const list: Array<{ id: string; name: string; info: string }> = []
    
    // Add unique destinatarios first
    destinatarios.forEach(name => {
      const key = name.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (!seen.has(key)) {
        seen.add(key)
        list.push({ id: `dest-${name}`, name, info: 'Destinatario frecuente' })
      }
    })
    
    // Add database hospitals
    hospitals.forEach(h => {
      const key = h.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (!seen.has(key)) {
        seen.add(key)
        list.push({ 
          id: h.id, 
          name: h.name, 
          info: h.state ? `${h.city || ''}, ${h.state}` : 'Hospital' 
        })
      }
    })
    
    return list
  })()

  // Filtered hospitals based on search
  const filteredHospitals = combinedHospitals.filter(h => 
    h.name.toLowerCase().includes(hospitalSearch.toLowerCase())
  )

  const handleSelectHospital = (id: string, name: string) => {
    setSelectedHospitalId(id)
    setHospitalInput(name)
    setHospitalSearch(name)
    setIsHospitalDropdownOpen(false)
  }

  const handleCustomHospital = (name: string) => {
    setSelectedHospitalId(null)
    setHospitalInput(name)
    setIsHospitalDropdownOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (selectedLines.length === 0) {
      setError('Por favor selecciona al menos una línea de producto.')
      return
    }

    if (selectedStates.length === 0) {
      setError('Por favor selecciona al menos un estado de la República.')
      return
    }

    const finalHospital = hospitalInput.trim() || hospitalSearch.trim()
    if (!finalHospital) {
      setError('Por favor especifica el Hospital o Institución Médica.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await createSolicitudAction({
        clientId: clientInfo?.id || profile.client_id,
        lineasProducto: selectedLines,
        estados: selectedStates,
        hospital: finalHospital,
        hospitalEmail: hospitalEmail.trim() || undefined,
        hospitalPhone: hospitalPhone.trim() || undefined
      })

      if (!res.success) throw new Error('Ocurrió un error al procesar tu solicitud.')

      setSuccess(true)
      setTimeout(() => {
        router.push('/distributor-letter')
      }, 3000)
    } catch (err: any) {
      console.error('Error submitting request:', err)
      setError(err.message || 'Ocurrió un error al enviar tu solicitud. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6 animate-fade-in">
        <div className="w-24 h-24 bg-success-bg text-success rounded-full flex items-center justify-center mx-auto shadow-lg shadow-success/10 animate-bounce">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-dark tracking-tight">¡Solicitud Enviada!</h1>
        <p className="text-dark-500 font-medium max-w-md mx-auto">
          Tu solicitud de carta de distribución ha sido registrada con éxito. Un administrador revisará la información y emitirá la carta correspondiente a la brevedad.
        </p>
        <div className="pt-4 text-xs text-dark-300">
          Redirigiendo de vuelta a Cartas de Distribución...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      <header className="space-y-4">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-bold text-dark-500 hover:text-brand-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-dark flex items-center gap-3">
            <FileCheck className="w-8 h-8 md:w-10 md:h-10 text-brand-500" />
            Nueva Solicitud de Carta
          </h1>
          <p className="text-dark-500 font-medium text-sm sm:text-base">
            Ingresa las líneas de producto, los estados de vigencia y el hospital de destino para tu nueva carta de distribución.
          </p>
        </div>
      </header>

      {/* Info card of current client */}
      {clientInfo && (
        <div className="card bg-surface-2 border border-border flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-dark-300">Empresa / Distribuidor</p>
            <h3 className="font-bold text-lg text-dark">{clientInfo.nombre}</h3>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-dark-300">RFC</p>
            <p className="font-mono text-sm text-dark font-bold tracking-wider">{clientInfo.rfc}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-danger-bg border border-danger/10 text-danger flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card bg-white border border-border p-6 md:p-10 space-y-8">
        
        {/* 1. PRODUCT LINES MULTI SELECT */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-widest text-dark-400">
            1. Líneas de Producto Autorizadas *
          </label>
          <p className="text-xs text-dark-500">Selecciona una o más líneas de producto que requieras incluir en la carta:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {LINEAS_PRODUCTO.map(line => {
              const isSelected = selectedLines.includes(line)
              return (
                <button
                  key={line}
                  type="button"
                  onClick={() => toggleLine(line)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border text-sm font-bold transition-all text-left",
                    isSelected 
                      ? "border-brand-500 bg-brand-50 text-brand-600 ring-2 ring-brand-500/20" 
                      : "border-border bg-white hover:border-dark-300 text-dark-500"
                  )}
                >
                  {line}
                  {isSelected && <Check className="w-4 h-4 text-brand-500" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. STATES OF MEXICO MULTI SELECT WITH SEARCH */}
        <div className="space-y-3" ref={stateDropdownRef}>
          <label className="block text-xs font-black uppercase tracking-widest text-dark-400">
            2. Estados de Cobertura / Vigencia *
          </label>
          <p className="text-xs text-dark-500">Selecciona los estados de la República Mexicana en donde tiene validez la distribución:</p>
          
          <div className="relative">
            <div 
              onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
              className="crm-input min-h-[50px] py-2 px-3 flex flex-wrap items-center gap-2 cursor-pointer border border-border rounded-xl focus-within:ring-2 focus-within:ring-brand-500/20"
            >
              {selectedStates.length === 0 ? (
                <span className="text-sm text-dark-400 font-medium pl-2 select-none">Seleccionar estados...</span>
              ) : (
                selectedStates.map(state => (
                  <span 
                    key={state} 
                    className="inline-flex items-center gap-1 text-xs font-bold bg-brand-50 text-brand-600 border border-brand-100 px-2.5 py-1 rounded-md"
                  >
                    {state}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleState(state)
                      }}
                      className="hover:bg-brand-100 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
              <ChevronDown className="w-4 h-4 text-dark-400 ml-auto mr-1" />
            </div>

            {isStateDropdownOpen && (
              <div className="absolute z-30 mt-2 w-full bg-white border border-border rounded-xl shadow-xl p-3 space-y-3 animate-slide-down">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input
                    type="text"
                    placeholder="Buscar estado..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="crm-input pl-9 py-2 text-sm !rounded-lg"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-border-2 scrollbar-thin">
                  {filteredStates.map(state => {
                    const isSelected = selectedStates.includes(state)
                    return (
                      <div
                        key={state}
                        onClick={() => toggleState(state)}
                        className="flex items-center justify-between py-2.5 px-3 hover:bg-surface-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <span className="text-sm font-semibold text-dark">{state}</span>
                        {isSelected && <Check className="w-4 h-4 text-brand-500" />}
                      </div>
                    )
                  })}
                  {filteredStates.length === 0 && (
                    <div className="py-4 text-center text-xs text-dark-400 italic">
                      No se encontraron resultados
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. HOSPITAL / MEDICAL INSTITUTION */}
        <div className="space-y-3" ref={hospitalDropdownRef}>
          <label className="block text-xs font-black uppercase tracking-widest text-dark-400">
            3. Hospital o Institución Médica de Destino *
          </label>
          <p className="text-xs text-dark-500">Ingresa o selecciona el hospital al que va dirigida la carta:</p>
          
          <div className="relative">
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Escribe el nombre del Hospital o busca uno existente..."
                value={hospitalSearch}
                onFocus={() => setIsHospitalDropdownOpen(true)}
                onChange={(e) => {
                  setHospitalSearch(e.target.value)
                  setHospitalInput(e.target.value)
                  setSelectedHospitalId(null)
                  setIsHospitalDropdownOpen(true)
                }}
                className="crm-input pl-10 py-3.5"
              />
              {hospitalSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setHospitalSearch('')
                    setHospitalInput('')
                    setSelectedHospitalId(null)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-2 rounded-full"
                >
                  <X className="w-4 h-4 text-dark-400" />
                </button>
              )}
            </div>

            {isHospitalDropdownOpen && (hospitalSearch.trim() !== '' || destinatarios.length > 0 || hospitals.length > 0) && (
              <div className="absolute z-20 mt-2 w-full bg-white border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-border-2 scrollbar-thin">
                {filteredHospitals.map(h => (
                  <div
                    key={h.id}
                    onClick={() => handleSelectHospital(h.id, h.name)}
                    className="flex items-center gap-3 py-3 px-4 hover:bg-surface-2 cursor-pointer transition-colors"
                  >
                    <Building className="w-4 h-4 text-brand-500" />
                    <div>
                      <p className="text-sm font-bold text-dark">{h.name}</p>
                      <p className="text-[10px] text-dark-400 font-semibold">{h.info}</p>
                    </div>
                  </div>
                ))}

                {hospitalSearch.trim() !== '' && !filteredHospitals.some(h => h.name.toLowerCase() === hospitalSearch.toLowerCase()) && (
                  <div
                    onClick={() => handleCustomHospital(hospitalSearch)}
                    className="flex items-center gap-3 py-3 px-4 hover:bg-brand-50/50 cursor-pointer transition-colors text-brand-600"
                  >
                    <Building className="w-4 h-4 text-brand-500" />
                    <div>
                      <p className="text-sm font-bold">Usar: "{hospitalSearch}"</p>
                      <p className="text-[10px] text-dark-400 font-semibold">Institución nueva personalizada</p>
                    </div>
                  </div>
                )}

                {filteredHospitals.length === 0 && hospitalSearch.trim() === '' && (
                  <div className="py-4 text-center text-xs text-dark-400 italic">
                    Escribe para buscar o ingresar un hospital
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hospital Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest text-dark-400">
              Email del Hospital (Opcional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="email"
                placeholder="ejemplo@hospital.com"
                value={hospitalEmail}
                onChange={(e) => setHospitalEmail(e.target.value)}
                className="crm-input pl-10 py-3.5"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest text-dark-400">
              Teléfono del Hospital (Opcional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="tel"
                placeholder="+52 55 1234 5678"
                value={hospitalPhone}
                onChange={(e) => setHospitalPhone(e.target.value)}
                className="crm-input pl-10 py-3.5"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-border mt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto btn-ghost py-3.5 px-6 font-bold"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto btn-primary py-3.5 px-8 font-black flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Solicitud'
            )}
          </button>
        </div>

      </form>
    </div>
  )
}
