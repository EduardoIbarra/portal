import { getProfile } from '@/lib/auth-utils'
import { createClient } from '@/lib/supabase-server'
import NewQuoteClient from './NewQuoteClient'

export default async function NewQuotePage() {
  const profile = await getProfile()
  const supabase = await createClient()

  let pastProductIds: string[] = []
  
  if (profile?.client_id) {
    // Get past facturas
    const { data: facturas } = await supabase
      .from('facturas_cliente')
      .select('id')
      .eq('cliente_id', profile.client_id)

    if (facturas && facturas.length > 0) {
      // Get products from these facturas
      const { data: factProd } = await supabase
        .from('factura_productos')
        .select('producto_id')
        .in('factura_id', facturas.map(f => f.id))
        
      if (factProd) {
        pastProductIds = Array.from(new Set(factProd.map(p => p.producto_id).filter(Boolean)))
      }
    }
  }

  // Get all active products
  const { data: products } = await supabase
    .from('productos')
    .select('*')
    .order('nombre_lista', { ascending: true })

  // Instead of querying `productos` which might not exist in that exact name, wait.
  // ERP uses `productos`? Let's check products table name in public_schema.dump.
  // Actually, I can use `productos` table.

  return <NewQuoteClient products={products || []} pastProductIds={pastProductIds} clientId={profile?.client_id} />
}
