export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getMergedContent } from '@/lib/content'

export async function GET() {
  try {
    const content = await getMergedContent()
    return NextResponse.json(content)
  } catch {
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 })
  }
}
