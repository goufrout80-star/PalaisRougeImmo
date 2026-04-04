import { NextRequest, NextResponse } from 'next/server'
import { generateSignature } from '@/lib/cloudinary'
import { requireAuth } from '@/lib/apiAuth'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['admin', 'agent'])
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const folder    = searchParams.get('folder') ?? 'properties'
  const timestamp = String(Math.round(Date.now() / 1000))

  const paramsToSign = {
    folder: `palaisrouge/${folder}`,
    timestamp,
  }

  const signature = generateSignature(paramsToSign)

  return NextResponse.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey:    process.env.CLOUDINARY_API_KEY,
    folder:    `palaisrouge/${folder}`,
  })
}
