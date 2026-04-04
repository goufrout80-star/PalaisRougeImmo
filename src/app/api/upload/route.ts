import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, deleteImage, UploadFolder } from '@/lib/cloudinary'
import { requireAuth } from '@/lib/apiAuth'

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin', 'agent'])
  if (auth.error) return auth.error

  try {
    const formData = await req.formData()
    const file   = formData.get('file') as File | null
    const folder = (formData.get('folder') as UploadFolder) ?? 'properties'

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier.' }, { status: 400 }
      )
    }

    const bytes   = await file.arrayBuffer()
    const base64  = Buffer.from(bytes).toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    const { url, publicId } = await uploadImage(dataUri, folder)
    return NextResponse.json({ url, publicId })
  } catch (err) {
    console.error('[Upload] Error:', err)
    return NextResponse.json(
      { error: 'Erreur upload.' }, { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req, ['admin', 'agent'])
  if (auth.error) return auth.error

  try {
    const { publicId } = await req.json()
    if (!publicId) {
      return NextResponse.json(
        { error: 'publicId requis.' }, { status: 400 }
      )
    }
    await deleteImage(publicId)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Upload] Delete error:', err)
    return NextResponse.json(
      { error: 'Erreur suppression.' }, { status: 500 }
    )
  }
}
