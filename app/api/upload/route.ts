import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/mongodb'
import { ImageModel } from '@/lib/models'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin-auth')
    const isUser = cookieStore.get('user-auth')
    if (!isAdmin && !isUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Determine mime type from file type or fallback to jpeg
    const mimeType = file.type || 'image/jpeg'
    
    // Create a base64 Data URI string
    const base64Data = buffer.toString('base64')
    const dataUri = `data:${mimeType};base64,${base64Data}`

    await connectToDatabase()
    
    // Save to database
    const id = crypto.randomUUID()
    await ImageModel.create({
      id,
      dataUri
    })

    // Return the image endpoint instead of the full string
    return NextResponse.json({ url: `/api/image/${id}` })
    
  } catch (err) {
    console.error('File upload failed:', err)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
