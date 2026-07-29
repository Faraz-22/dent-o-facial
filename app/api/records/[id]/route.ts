import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/mongodb'
import { RecordModel } from '@/lib/models'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Auth Check
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin-auth')
    const userAuth = cookieStore.get('user-auth')
    
    if (!adminAuth && !userAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    try {
      await connectToDatabase()
      const record = await RecordModel.findOne({ id }).lean()
      if (!record || !record.fileUrl) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 })
      }

      const fileUrl = record.fileUrl
      
      // If it's a base64 data URI, parse it and return as binary response
      if (fileUrl.startsWith('data:')) {
        const matches = fileUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
        if (matches && matches.length === 3) {
          const contentType = matches[1]
          const buffer = Buffer.from(matches[2], 'base64')
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': contentType,
              'Content-Disposition': `inline; filename="record-${id}"`
            }
          })
        }
      }

      // If it's a standard URL, just redirect to it
      return NextResponse.redirect(new URL(fileUrl, request.url))
      
    } catch (dbErr) {
      // Fallback to local JSON
      const RECORDS_FILE = path.join(process.cwd(), 'data/records.json')
      const data = await fs.readFile(RECORDS_FILE, 'utf-8')
      const records = JSON.parse(data)
      const record = records.find((r: any) => r.id === id)
      
      if (!record || !record.fileUrl) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 })
      }
      
      return NextResponse.redirect(new URL(record.fileUrl, request.url))
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
