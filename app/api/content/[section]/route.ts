import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readContent, writeContent } from '@/lib/content'
import { connectToDatabase } from '@/lib/mongodb'
import { SiteContent } from '@/lib/models'

export async function PUT(request: Request, { params }: { params: Promise<{ section: string }> }) {
  try {
    const cookieStore = await cookies()
    if (!cookieStore.get('admin-auth')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { section } = await params
    const { data } = await request.json()
    const validSections = ['hero', 'doctor', 'locations', 'treatments', 'testimonials', 'blog', 'faq', 'cta', 'results', 'images', 'translations']
    if (!validSections.includes(section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    try {
      await connectToDatabase()
      
      // Update or create main document
      // We rely on the explicitly defined schema fields (hero, doctor, etc) in models.ts
      await SiteContent.findOneAndUpdate(
        { id: 'main' },
        { $set: { [section]: data } },
        { upsert: true, new: true, strict: true }
      )
    } catch (dbErr) {
      console.error('MongoDB connection failed for content PUT', dbErr)
      return NextResponse.json({ error: 'Database unavailable. Changes were not saved.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, section, data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}
