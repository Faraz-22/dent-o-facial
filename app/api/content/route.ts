export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { readContent } from '@/lib/content'
import { connectToDatabase } from '@/lib/mongodb'
import { SiteContent } from '@/lib/models'

export async function GET() {
  try {
    try {
      await connectToDatabase()
      let content = await SiteContent.findOne({ id: 'main' }).lean()
      if (content) {
        // Strip out the mongoose _id
        const { _id, id, __v, ...cleanContent } = content as any
        
        // Ensure all required sections exist by merging with defaults
        const defaults = readContent()
        return NextResponse.json({ ...defaults, ...cleanContent })
      }
    } catch (dbErr) {
      console.warn('MongoDB connection failed for content, falling back to JSON', dbErr)
    }

    // Fallback to local JSON seed data
    const content = readContent()
    return NextResponse.json(content)
  } catch {
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 })
  }
}
