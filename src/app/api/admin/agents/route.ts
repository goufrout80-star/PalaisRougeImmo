import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/apiAuth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['admin'])
  if (auth.error) return auth.error

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    // The admin directory must stay readable while advanced account-management
    // credentials are being configured. Only publicly permitted profile data is used.
    const session = await createSessionClient()
    const {data,error} = await session.from('agent_profiles').select('id,full_name')
    if (error) return NextResponse.json({error:'Répertoire des agents indisponible.'},{status:503})
    return NextResponse.json({
      agents:(data??[]).map(p=>({id:p.id,name:p.full_name,email:''})),
      warning:'La gestion des comptes agents nécessite la clé serveur Supabase.',
    })
  }

  const server = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,serviceKey)
  const {data,error} = await server.auth.admin.listUsers()
  if (error) return NextResponse.json({error:'Impossible de charger les comptes agents.'},{status:503})
  return NextResponse.json({
    agents:(data.users??[])
      .filter(user=>user.app_metadata?.role==='agent')
      .map(user=>({
        id:user.id,
        name:user.user_metadata?.name??user.user_metadata?.full_name??user.email??'Agent',
        email:user.email??'',
      })),
  })
}
