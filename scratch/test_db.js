if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const fs = require('fs');
  const content = fs.readFileSync('.env.local', 'utf8');
  content.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.includes('=')) return;
    const parts = line.split('=');
    const key = parts[0].trim();
    let val = parts.slice(1).join('=').trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  });
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testInsert() {
  console.log('Testing insert on solicitudes_carta_distribucion...');
  const { data, error } = await supabase
    .from('solicitudes_carta_distribucion')
    .insert({
      client_id: 'a9de42e4-3a40-498b-a112-222ba33ea86c',
      user_id: '5268a36c-dff6-4330-a312-401dbce422e1',
      lineas_producto: ['UBE', 'SPINE'],
      estados: ['Ciudad de México (CDMX)'],
      hospital: 'TEST HOS',
      hospital_email: 'test@example.com',
      hospital_phone: '1234567890',
      status: 'pending'
    })
    .select()
    .single();

  console.log('Insert error:', error);
  console.log('Inserted data:', data);

  // If inserted, clean it up
  if (data) {
    console.log('Cleaning up...');
    const { error: delErr } = await supabase
      .from('solicitudes_carta_distribucion')
      .delete()
      .eq('id', data.id);
    console.log('Delete error:', delErr);
  }
}
testInsert();
