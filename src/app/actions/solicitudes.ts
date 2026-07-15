'use server'

import { createAdminClient } from '@/lib/supabase-server'
import { getProfile } from '@/lib/auth-utils'

async function getStaffNumbersForLetters(): Promise<string[]> {
  try {
    const supabase = createAdminClient()
    const { data: configSetting } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'notification_config')
      .single()

    if (!configSetting?.value || typeof configSetting.value !== 'object') {
      return []
    }
    const value = configSetting.value as any
    const userIds = value.cartas_distribucion // List of selected user IDs
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return []
    }

    // Query WhatsApp numbers from user profiles
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('whatsapp')
      .in('id', userIds)
      .not('whatsapp', 'is', null)

    if (error || !users) return []
    return users.map(u => u.whatsapp).filter(Boolean) as string[]
  } catch (error) {
    console.error('Error fetching notification staff:', error)
    return []
  }
}

export async function notifyStaffNewSolicitud(
  solicitud: any, 
  clientName: string, 
  clientRfc: string, 
  userEmail: string
) {
  const staffNumbers = await getStaffNumbersForLetters()
  if (staffNumbers.length === 0) return
  const RESPOND_API_TOKEN = process.env.RESPOND_API_TOKEN
  const RESPOND_CHANNEL_ID = process.env.RESPOND_CHANNEL_ID
  const payload = {
    channelId: RESPOND_CHANNEL_ID ? parseInt(RESPOND_CHANNEL_ID, 10) : undefined,
    message: {
      type: 'whatsapp_template',
      template: {
        name: 'distribuition_letter_staff',
        languageCode: 'es_MX',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName }, // {{1}} Empresa
              { type: 'text', text: clientRfc || 'Sin RFC' }, // {{2}} RFC
              { type: 'text', text: userEmail.split('@')[0] }, // {{3}} Solicitado por
              { type: 'text', text: userEmail }, // {{4}} Email
              { type: 'text', text: solicitud.hospital }, // {{5}} Hospital Destino
              { type: 'text', text: solicitud.hospital_email || '-' }, // {{6}} Email Hospital (Placeholder/Opcional)
              { type: 'text', text: solicitud.hospital_phone || '-' }, // {{7}} Teléfono Hospital (Placeholder/Opcional)
              { type: 'text', text: solicitud.lineas_producto.join(', ') }, // {{8}} Líneas de producto
              { type: 'text', text: solicitud.estados.join(', ') }, // {{9}} Cobertura
              { type: 'text', text: 'https://erp.arthromed.com.mx/cartas-distribuidor' } // {{10}} Link ERP
            ]
          }
        ]
      }
    }
  }

  // Send to all configured staff numbers
  await Promise.allSettled(
    staffNumbers.map(async (num) => {
      const cleanNum = num.replace(/\D/g, '')
      const phone = cleanNum.startsWith('52') ? cleanNum : `52${cleanNum}`
      const target = `phone:+${phone}`
      await fetch(`https://api.respond.io/v2/contact/${encodeURIComponent(target)}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESPOND_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload)
      })
    })
  )
}

export async function notifyClientSolicitudUpdate(
  clientWhatsapp: string,
  clientContactName: string,
  solicitud: any,
  statusLabel: string, // "Pendiente", "Aprobada", "Rechazada"
  additionalNotes: string // Comments or reason of rejection
) {
  if (!clientWhatsapp) return
  const RESPOND_API_TOKEN = process.env.RESPOND_API_TOKEN
  const RESPOND_CHANNEL_ID = process.env.RESPOND_CHANNEL_ID
  const cleanNum = clientWhatsapp.replace(/\D/g, '')
  const phone = cleanNum.startsWith('52') ? cleanNum : `52${cleanNum}`
  const target = `phone:+${phone}`
  const payload = {
    channelId: RESPOND_CHANNEL_ID ? parseInt(RESPOND_CHANNEL_ID, 10) : undefined,
    message: {
      type: 'whatsapp_template',
      template: {
        name: 'distribuition_letter_client',
        languageCode: 'es_MX',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientContactName }, // {{1}} Hola {{1}}
              { type: 'text', text: solicitud.hospital }, // {{2}} Hospital de Destino
              { type: 'text', text: statusLabel }, // {{3}} Estado actual
              { type: 'text', text: additionalNotes }, // {{4}} Comentarios / Notas
              { type: 'text', text: 'https://cliente.arthromed.com.mx/distributor-letter' } // {{5}} Link Portal
            ]
          }
        ]
      }
    }
  }
  await fetch(`https://api.respond.io/v2/contact/${encodeURIComponent(target)}/message`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESPOND_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload)
  })
}

export async function createSolicitudAction(payload: {
  clientId: string
  lineasProducto: string[]
  estados: string[]
  hospital: string
  hospitalEmail?: string
  hospitalPhone?: string
}) {
  const profile = await getProfile()
  if (!profile) {
    throw new Error('Not authenticated')
  }

  const supabase = createAdminClient()
  
  // 1. Fetch client information for the notification
  const { data: clientInfo } = await supabase
    .from('clientes')
    .select('nombre, rfc, telefono')
    .eq('id', payload.clientId)
    .single()

  // 2. Insert request
  const { data: solicitud, error } = await supabase
    .from('solicitudes_carta_distribucion')
    .insert({
      client_id: payload.clientId,
      user_id: profile.id,
      lineas_producto: payload.lineasProducto,
      estados: payload.estados,
      hospital: payload.hospital,
      hospital_email: payload.hospitalEmail || null,
      hospital_phone: payload.hospitalPhone || null,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Error inserting solicitud:', error)
    throw new Error('Error inserting solicitud: ' + error.message)
  }

  // 3. Trigger Staff & Client Notifications asynchronously
  if (solicitud && clientInfo) {
    // Notify staff
    notifyStaffNewSolicitud(
      solicitud,
      clientInfo.nombre,
      clientInfo.rfc || '',
      profile.email || ''
    ).catch(err => console.error('Failed to notify staff:', err))

    // Notify client
    const clientPhone = profile.whatsapp || clientInfo.telefono
    if (clientPhone) {
      notifyClientSolicitudUpdate(
        clientPhone,
        profile.first_name || clientInfo.nombre,
        solicitud,
        'Pendiente',
        'Tu solicitud ha sido recibida y se encuentra en proceso de revisión.'
      ).catch(err => console.error('Failed to notify client:', err))
    }
  }

  return { success: true, data: solicitud }
}
