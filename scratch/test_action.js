const fs = require('fs');
// Set env vars
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://lmiymbdnqkvppaalgayr.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtaXltYmRucWt2cHBhYWxnYXlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQ3MTExMywiZXhwIjoyMDk0MDQ3MTEzfQ.i7uV5aOstpUjVYDDtV6pyYipwd-NmbvnzAYB52akSfs";
process.env.RESPOND_API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjkwNDQsInNwYWNlSWQiOjQxNjYxNCwib3JnSWQiOjQwOTc5MywidHlwZSI6ImFwaSIsImlhdCI6MTc4MDI2NzA5MX0.3gEIGgZ6oLKgP8YobcMCoTxGpd_JD_0LXJnwacSoir0";
process.env.RESPOND_CHANNEL_ID = "501682";

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// We emulate createSolicitudAction but print all errors
async function getStaffNumbersForLetters() {
  const { data: configSetting, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'notification_config')
    .single();

  if (error) console.error('app_settings query error:', error);

  if (!configSetting?.value || typeof configSetting.value !== 'object') {
    return [];
  }
  const value = configSetting.value;
  const userIds = value.cartas_distribucion;
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return [];
  }

  const { data: users, error: usersErr } = await supabase
    .from('user_profiles')
    .select('whatsapp')
    .in('id', userIds)
    .not('whatsapp', 'is', null);

  if (usersErr) console.error('user_profiles query error:', usersErr);
  if (!users) return [];
  return users.map(u => u.whatsapp).filter(Boolean);
}

async function notifyStaffNewSolicitud(solicitud, clientName, clientRfc, userEmail) {
  const staffNumbers = await getStaffNumbersForLetters();
  console.log('Staff numbers for notification:', staffNumbers);
  if (staffNumbers.length === 0) return;
  const RESPOND_API_TOKEN = process.env.RESPOND_API_TOKEN;
  const RESPOND_CHANNEL_ID = process.env.RESPOND_CHANNEL_ID;
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
              { type: 'text', text: clientName },
              { type: 'text', text: clientRfc || 'Sin RFC' },
              { type: 'text', text: userEmail.split('@')[0] },
              { type: 'text', text: userEmail },
              { type: 'text', text: solicitud.hospital },
              { type: 'text', text: solicitud.hospital_email || '-' },
              { type: 'text', text: solicitud.hospital_phone || '-' },
              { type: 'text', text: solicitud.lineas_producto.join(', ') },
              { type: 'text', text: solicitud.estados.join(', ') },
              { type: 'text', text: 'https://erp.arthromed.com.mx/cartas-distribuidor' }
            ]
          }
        ]
      }
    }
  };

  const results = await Promise.allSettled(
    staffNumbers.map(async (num) => {
      const cleanNum = num.replace(/\D/g, '');
      const phone = cleanNum.startsWith('52') ? cleanNum : `52${cleanNum}`;
      const target = `phone:+${phone}`;
      const url = `https://api.respond.io/v2/contact/${encodeURIComponent(target)}/message`;
      console.log(`Sending post to respond.io for phone: ${phone}...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESPOND_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Respond.io returned ${response.status}: ${await response.text()}`);
      }
      return response.status;
    })
  );
  console.log('Respond.io send results:', results);
}

async function notifyClientSolicitudUpdate(clientWhatsapp, clientContactName, solicitud, statusLabel, additionalNotes) {
  const RESPOND_API_TOKEN = process.env.RESPOND_API_TOKEN;
  const RESPOND_CHANNEL_ID = process.env.RESPOND_CHANNEL_ID;
  const cleanNum = clientWhatsapp.replace(/\D/g, '');
  const phone = cleanNum.startsWith('52') ? cleanNum : `52${cleanNum}`;
  const target = `phone:+${phone}`;
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
              { type: 'text', text: clientContactName },
              { type: 'text', text: solicitud.hospital },
              { type: 'text', text: statusLabel },
              { type: 'text', text: additionalNotes },
              { type: 'text', text: 'https://cliente.arthromed.com.mx/distributor-letter' }
            ]
          }
        ]
      }
    }
  };
  console.log(`Sending client notification to phone: ${phone}...`);
  const response = await fetch(`https://api.respond.io/v2/contact/${encodeURIComponent(target)}/message`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESPOND_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    console.error(`Client notification respond.io error: ${response.status}: ${await response.text()}`);
  } else {
    console.log('Client notification success.');
  }
}

async function testActionFlow() {
  try {
    const payload = {
      clientId: 'a9de42e4-3a40-498b-a112-222ba33ea86c',
      lineasProducto: ['UBE', 'SPINE', 'SPORTS MEDICINE'],
      estados: ['Ciudad de México (CDMX)'],
      hospital: 'GRUPO ORGOA',
      hospitalEmail: 'prueba@prueba.com',
      hospitalPhone: '5555555555'
    };

    console.log('1. Fetching client...');
    const { data: clientInfo, error: clientErr } = await supabase
      .from('clientes')
      .select('nombre, rfc, telefono')
      .eq('id', payload.clientId)
      .single();

    if (clientErr) console.error('clientErr:', clientErr);
    console.log('clientInfo:', clientInfo);

    console.log('2. Inserting request...');
    const { data: solicitud, error: insertErr } = await supabase
      .from('solicitudes_carta_distribucion')
      .insert({
        client_id: payload.clientId,
        user_id: '5268a36c-dff6-4330-a312-401dbce422e1',
        lineas_producto: payload.lineasProducto,
        estados: payload.estados,
        hospital: payload.hospital,
        hospital_email: payload.hospitalEmail || null,
        hospital_phone: payload.hospitalPhone || null,
        status: 'pending'
      })
      .select()
      .single();

    if (insertErr) console.error('insertErr:', insertErr);
    console.log('solicitud:', solicitud);

    if (solicitud && clientInfo) {
      console.log('3. Triggering staff notification...');
      await notifyStaffNewSolicitud(
        solicitud,
        clientInfo.nombre,
        clientInfo.rfc || '',
        'eduardo@arthromed.com.mx'
      );

      console.log('4. Triggering client notification...');
      const clientPhone = '8110182368'; // test phone
      await notifyClientSolicitudUpdate(
        clientPhone,
        'Eduardo',
        solicitud,
        'Pendiente',
        'Tu solicitud ha sido recibida y se encuentra en proceso de revisión.'
      );
    }

    // Cleanup
    if (solicitud) {
      await supabase
        .from('solicitudes_carta_distribucion')
        .delete()
        .eq('id', solicitud.id);
    }
  } catch (err) {
    console.error('Fatal crash:', err);
  }
}
testActionFlow();
