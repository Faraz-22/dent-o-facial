import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/mongodb'
import { ImageModel, RecordModel } from '@/lib/models'
import { uploadToCloudinary } from '@/lib/storage'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin-auth')
    const isUser = cookieStore.get('user-auth')
    
    // Extract userId or adminId for auditing
    const uploadedBy = isAdmin ? 'admin' : (isUser ? isUser.value : 'unknown')

    if (!isAdmin && !isUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const purpose = formData.get('purpose') as string || 'public' // 'public' or 'private'
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Security check: Only admins can upload public marketing images
    if (purpose === 'public' && !isAdmin) {
      return NextResponse.json({ error: 'Only admins can upload public media' }, { status: 403 })
    }
    
    // Only users/admins can upload avatars
    if (purpose === 'avatar' && !isAdmin && !isUser) {
      return NextResponse.json({ error: 'Unauthorized avatar upload' }, { status: 403 })
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const mimeType = file.type || 'application/octet-stream'
    const originalName = file.name
    const size = file.size

    // Determine Cloudinary folder and privacy based on purpose
    const folder = purpose === 'private' ? 'dentofacial/records' : 'dentofacial/public'
    const isPrivate = purpose === 'private'

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, folder, isPrivate)

    await connectToDatabase()
    
    const id = crypto.randomUUID()

    // If it's a private record, we don't save it to ImageModel, the calling API will save it to PatientRecord.
    // Wait, the client calling /api/upload expects a URL back so it can save it to its own schema.
    // To maintain compatibility, we save public images to ImageModel for gallery picking.
    if (purpose === 'public') {
      await ImageModel.create({
        id,
        url: uploadResult.url,
        storageKey: uploadResult.storageKey,
        originalName,
        mimeType,
        size,
        uploadedBy,
        purpose
      })
    }

    // Return the actual Cloudinary URL (or a local wrapper if we want to obscure it, but direct URL is fine for public)
    // For private files, we return the URL but it should only be accessible via signed URLs if we use 'authenticated' type.
    return NextResponse.json({ 
      url: uploadResult.url,
      storageKey: uploadResult.storageKey,
      id 
    })
    
  } catch (err) {
    console.error('File upload failed:', err)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
