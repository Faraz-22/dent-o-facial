import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary globally (will use CLOUDINARY_URL from env if available)
// Cloudinary configuration can also be set explicitly:
// cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, ... })

export interface UploadResult {
  url: string
  storageKey: string
  format: string
  size: number
}

/**
 * Uploads a buffer directly to Cloudinary using upload_stream
 * @param buffer The file buffer
 * @param folder The folder to store the file in Cloudinary (e.g., 'public_images' or 'patient_records')
 * @param isPrivate Whether the asset should be marked private/authenticated in Cloudinary
 * @returns The upload result with URL and storageKey (public_id)
 */
export async function uploadToCloudinary(buffer: Buffer, folder: string, isPrivate: boolean = false): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    // If no Cloudinary config is present, we could throw, but we should let the uploader try.
    // Ensure CLOUDINARY_URL is in .env.local
    if (!process.env.CLOUDINARY_URL) {
      console.warn('CLOUDINARY_URL is not set in environment variables!')
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Auto detects image/pdf/raw
        type: isPrivate ? 'authenticated' : 'upload', // 'authenticated' requires signed URLs to access
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          return reject(error)
        }
        if (!result) {
          return reject(new Error('Cloudinary returned no result'))
        }
        resolve({
          url: result.secure_url,
          storageKey: result.public_id,
          format: result.format,
          size: result.bytes
        })
      }
    )

    // Write buffer to stream
    uploadStream.end(buffer)
  })
}

/**
 * Deletes a file from Cloudinary using its storageKey (public_id)
 * @param storageKey The Cloudinary public_id
 */
export async function deleteFromCloudinary(storageKey: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(storageKey)
    return result.result === 'ok'
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return false
  }
}
