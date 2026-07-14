import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: facturaId } = await params
    const supabase = await createClient()

    // 1. Fetch factura info
    const { data: factura, error: facturaErr } = await supabase
      .from('facturas_cliente')
      .select('id, numero_factura, cliente_nombre, estado, estado_surtido, tracking_id')
      .eq('id', facturaId)
      .single()

    if (facturaErr || !factura) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    // 2. Fetch tracking details if exists
    let trackingInfo = null
    if (factura.tracking_id) {
      const { data: tracking, error: trackingErr } = await supabase
        .from('factura_tracking')
        .select('*')
        .eq('id', factura.tracking_id)
        .single()
      
      if (!trackingErr) {
        trackingInfo = tracking
      }
    }

    // 3. Fetch tracking updates
    const { data: updates, error: updatesErr } = await supabase
      .from('factura_tracking_updates')
      .select('*')
      .eq('factura_id', facturaId)
      .order('event_date', { ascending: false })

    return NextResponse.json({
      factura,
      tracking: trackingInfo,
      updates: updates || []
    })
  } catch (error: any) {
    console.error('Error fetching tracking info:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: facturaId } = await params
    const body = await request.json()
    const { action, carrier, trackingNumber, status, description, location, estimatedDelivery, deliveryAddress, eventDate } = body
    const supabase = await createClient()

    // Fetch the factura first
    const { data: factura, error: facturaErr } = await supabase
      .from('facturas_cliente')
      .select('*')
      .eq('id', facturaId)
      .single()

    if (facturaErr || !factura) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    // Action: update_carrier (set DHL/FedEx/etc. tracking details)
    if (action === 'update_carrier') {
      if (!carrier || !trackingNumber) {
        return NextResponse.json({ error: 'Falta transportista o número de rastreo' }, { status: 400 })
      }

      // Check if a tracking record with the same carrier and tracking number already exists
      const { data: existingTracking } = await supabase
        .from('factura_tracking')
        .select('id')
        .eq('carrier', carrier)
        .eq('tracking_number', trackingNumber)
        .limit(1)
        .maybeSingle()

      let trackingId = existingTracking?.id

      if (!trackingId) {
        // Create new tracking record
        const { data: newTracking, error: createErr } = await supabase
          .from('factura_tracking')
          .insert({ 
            carrier, 
            tracking_number: trackingNumber,
            estimated_delivery: estimatedDelivery || null,
            delivery_address: deliveryAddress || null
          })
          .select('id')
          .single()

        if (createErr) throw createErr
        trackingId = newTracking.id
      } else {
        // Update existing tracking record with estimated delivery and address if provided
        const updateData: any = {}
        if (estimatedDelivery) updateData.estimated_delivery = estimatedDelivery
        if (deliveryAddress) updateData.delivery_address = deliveryAddress
        if (Object.keys(updateData).length > 0) {
          await supabase
            .from('factura_tracking')
            .update(updateData)
            .eq('id', trackingId)
        }
      }

      // Update factura to point to this tracking record
      const { error: updateFacturaErr } = await supabase
        .from('facturas_cliente')
        .update({ tracking_id: trackingId })
        .eq('id', facturaId)

      if (updateFacturaErr) throw updateFacturaErr

      // Add an automatic tracking update if not exists
      const { error: updateLogErr } = await supabase
        .from('factura_tracking_updates')
        .insert({
          factura_id: facturaId,
          status: 'shipped',
          description: `Se asignó el envío con ${carrier} (Rastreo: ${trackingNumber})`,
          location: 'Centro de Distribución'
        })

      if (updateLogErr) {
        console.error('Error adding automatic update log:', updateLogErr)
      }

      return NextResponse.json({ success: true, trackingId })
    }

    // Action: add_update (add status step: e.g. Preparando, En camino, Entregado)
    if (action === 'add_update') {
      if (!status || !description) {
        return NextResponse.json({ error: 'Falta estado o descripción' }, { status: 400 })
      }

      const { data: newUpdate, error: insertErr } = await supabase
        .from('factura_tracking_updates')
        .insert({
          factura_id: facturaId,
          status,
          description,
          location: location || null,
          event_date: eventDate || new Date().toISOString()
        })
        .select('*')
        .single()

      if (insertErr) throw insertErr

      return NextResponse.json({ success: true, update: newUpdate })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in POST tracking:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
