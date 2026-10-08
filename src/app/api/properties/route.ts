import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/apiAuth'

const editable = new Set([
  'title_fr','title_en','title_ar','description_fr','description_en','description_ar',
  'price','currency','listing_type','property_type','status','location','city',
  'city_slug','neighborhood','area_sqm','bedrooms','bathrooms','images','features',
  'is_published','is_featured','latitude','longitude','year_built','agent_name'
])

function fields(input: Record<string, unknown>, role: string) {
  return Object.fromEntries(Object.entries(input).filter(([key]) =>
    editable.has(key) && (role === 'admin' || !['is_published','is_featured'].includes(key))
  ))
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin','agent'])
  if (auth.error) return auth.error
  try {
    const input = await req.json()
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return NextResponse.json({error:'Invalid payload'}, {status:400})
    }
    const sb = await createClient()
    const dataToInsert = {...fields(input,auth.role),agent_id:auth.user.id,
      ...(auth.role === 'agent' ? {is_published:false,is_featured:false} : {})}
    const {data,error} = await sb.from('properties').insert(dataToInsert).select().single()
    if (error) return NextResponse.json({error:error.message},{status:400})
    return NextResponse.json(data,{status:201})
  } catch { return NextResponse.json({error:'Invalid request'},{status:400}) }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req, ['admin','agent'])
  if (auth.error) return auth.error
  try {
    const input = await req.json()
    if (!input || typeof input.id !== 'string') {
      return NextResponse.json({error:'Missing ID'}, {status:400})
    }
    const updates = fields(input,auth.role)
    if (!Object.keys(updates).length) return NextResponse.json({error:'No changes'}, {status:400})
    const sb = await createClient()
    const {data,error} = await sb.from('properties').update(updates).eq('id',input.id).select().single()
    if (error) return NextResponse.json({error:error.message},{status:400})
    return NextResponse.json(data)
  } catch { return NextResponse.json({error:'Invalid request'},{status:400}) }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req, ['admin','agent'])
  if (auth.error) return auth.error
  try {
    const input = await req.json()
    if (!input || typeof input.id !== 'string') {
      return NextResponse.json({error:'Missing ID'},{status:400})
    }
    const sb = await createClient()
    const {data,error} = await sb.from('properties').delete().eq('id',input.id).select('id').maybeSingle()
    if (error) return NextResponse.json({error:error.message},{status:400})
    if (!data) return NextResponse.json({error:'Not found'},{status:404})
    return NextResponse.json({success:true})
  } catch { return NextResponse.json({error:'Invalid request'},{status:400}) }
}
