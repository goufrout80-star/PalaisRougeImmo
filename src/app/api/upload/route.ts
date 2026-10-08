import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, deleteImage, type UploadFolder } from '@/lib/cloudinary'
import { requireAuth } from '@/lib/apiAuth'

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_FOLDERS = ['properties', 'blog', 'agents'] as const
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const

function isImageSignature(bytes: Buffer, mime: string): boolean {
  if (mime === 'image/jpeg') return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (mime === 'image/png') return bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
  if (mime === 'image/webp') return bytes.length > 12 && bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP'
  return false
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin', 'agent'])
  if (auth.error) return auth.error
  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY ||
      !(process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)) {
    return NextResponse.json({error:'Stockage des images non configuré.'},{status:503})
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const folder = formData.get('folder') ?? 'properties'
    if (!(file instanceof File) || typeof folder !== 'string' ||
        !ALLOWED_FOLDERS.includes(folder as UploadFolder)) {
      return NextResponse.json({error:'Fichier ou dossier invalide.'},{status:400})
    }
    if (!ALLOWED_MIME.includes(file.type as typeof ALLOWED_MIME[number]) ||
        file.size === 0 || file.size > MAX_BYTES) {
      return NextResponse.json({error:'JPG, PNG ou WebP, taille maximum 10 Mo.'},{status:400})
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    if (!isImageSignature(buffer,file.type)) {
      return NextResponse.json({error:'Le fichier ne correspond pas à son format image.'},{status:400})
    }
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`
    const {url,publicId} = await uploadImage(dataUri,folder as UploadFolder)
    return NextResponse.json({url,publicId})
  } catch (err) {
    console.error('[Upload] Error:',err)
    return NextResponse.json({error:'Impossible de sauvegarder cette image.'},{status:500})
  }
}

// Destructive media deletion is restricted to admins and scoped to our own folder.
// The ordinary image editor removes images from the listing without deleting Cloudinary files.
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req, ['admin'])
  if (auth.error) return auth.error
  try {
    const {publicId} = await req.json()
    if (typeof publicId !== 'string' ||
        !/^kamarimmob\/(properties|blog|agents)\/[a-zA-Z0-9_-]+$/.test(publicId)) {
      return NextResponse.json({error:'Identifiant de média invalide.'},{status:400})
    }
    await deleteImage(publicId)
    return NextResponse.json({success:true})
  } catch(err) {
    console.error('[Upload] Delete error:',err)
    return NextResponse.json({error:'Suppression impossible.'},{status:500})
  }
}
