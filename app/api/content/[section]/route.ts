import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readContent, writeContent } from '@/lib/content'

export async function PUT(request: Request, { params }: { params: Promise<{ section: string }> }) {
  try {
    const cookieStore = await cookies()
    if (!cookieStore.get('admin-auth')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { section } = await params
    const { data } = await request.json()
    const content = readContent()

    const validSections = ['hero', 'doctor', 'locations', 'treatments', 'testimonials', 'blog', 'faq', 'cta', 'results', 'images']
    if (!validSections.includes(section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    (content as Record<string, any>)[section] = data
    writeContent(content)

    return NextResponse.json({ success: true, section, data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}
