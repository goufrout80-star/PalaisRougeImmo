import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
})

export type UploadFolder = 'properties' | 'blog' | 'agents'

export async function uploadImage(
  file: string,
  folder: UploadFolder
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder: `palaisrouge/${folder}`,
    resource_type: 'image',
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  })
  return { url: result.secure_url, publicId: result.public_id }
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export function generateSignature(
  paramsToSign: Record<string, string>
) {
  return cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  )
}
