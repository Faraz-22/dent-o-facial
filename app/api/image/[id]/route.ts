import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ImageModel } from '@/lib/models'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    await connectToDatabase()
    
    const imageDoc = await ImageModel.findOne({ id })
    if (!imageDoc) {
      return new NextResponse('Image not found', { status: 404 })
    }

    const dataUri = imageDoc.dataUri
    
    if (dataUri.startsWith('data:')) {
      const matches = dataUri.match(/^data:([A-Za-z0-9-+\/.]+);base64,(.+)$/)
      if (matches && matches.length === 3) {
        const contentType = matches[1]
        const buffer = Buffer.from(matches[2], 'base64')
        
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable'
          }
        })
      }
    }

    return new NextResponse('Invalid image data', { status: 500 })
  } catch (err) {
    console.error('Failed to fetch image:', err)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
