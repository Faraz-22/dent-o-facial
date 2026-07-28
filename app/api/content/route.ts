export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { readContent } from '@/lib/content'

export async function GET() {
  try {
    const content = readContent()
    return NextResponse.json(content)
  } catch {
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 })
  }
}
