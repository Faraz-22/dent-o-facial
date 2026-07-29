import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/mongodb'
import { RecordModel } from '@/lib/models'

const RECORDS_FILE = path.join(process.cwd(), 'data/records.json')

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    // Auth Check
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin-auth')
    const userAuth = cookieStore.get('user-auth')
    
    let isAuthorized = false
    if (adminAuth?.value === 'true') {
      isAuthorized = true
    } else if (userAuth?.value) {
      try {
        const user = JSON.parse(userAuth.value)
        if (user.email === email || !email) {
          isAuthorized = true
        }
      } catch (e) {}
    }
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      await connectToDatabase()
      const query = email ? { patientEmail: email } : {}
      // Exclude fileUrl from the list to prevent Vercel 4.5MB payload limit errors
      const records = await RecordModel.find(query).select('-fileUrl').sort({ createdAt: -1 }).lean()
      return NextResponse.json(records)
    } catch (dbErr) {
      console.warn('MongoDB failed for records GET, falling back to JSON', dbErr)
      let data = '[]'
      try {
        data = await fs.readFile(RECORDS_FILE, 'utf-8')
      } catch (e) {}
      const records = JSON.parse(data)
            
      if (email) {
        const filtered = records.filter((r: any) => r.patientEmail === email)
        return NextResponse.json(filtered)
      }
      return NextResponse.json(records)
    }
  } catch (error) {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin-auth')
    if (adminAuth?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { patientEmail, type, fileUrl, notes, date } = body

    if (!patientEmail || !type || !fileUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const id = Date.now().toString()
    
    try {
      await connectToDatabase()
      const newRecord = await RecordModel.create({
        id,
        patientEmail,
        type, // 'prescription' or 'record'
        fileUrl,
        notes,
        date: date || new Date().toISOString(),
        createdAt: new Date()
      })
      return NextResponse.json({ success: true, record: newRecord })
    } catch (dbErr) {
      console.warn('MongoDB failed for records POST, falling back to JSON', dbErr)
      
      let records = []
      try {
        const data = await fs.readFile(RECORDS_FILE, 'utf-8')
        records = JSON.parse(data)
      } catch (e) {
        records = []
      }

      const newRecord = {
        id,
        patientEmail,
        type,
        fileUrl,
        notes,
        date: date || new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      records.push(newRecord)
      
      try {
        await fs.writeFile(RECORDS_FILE, JSON.stringify(records, null, 2))
      } catch (fsErr) {
        console.error('Failed to save record to FS', fsErr)
        return NextResponse.json({ error: 'Failed to create record (Read-only FS)' }, { status: 500 })
      }

      return NextResponse.json({ success: true, record: newRecord })
    }
  } catch (error) {
    console.error('Record POST Error:', error)
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin-auth')
    if (adminAuth?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    try {
      await connectToDatabase()
      await RecordModel.findOneAndDelete({ id })
      return NextResponse.json({ success: true })
    } catch (dbErr) {
      console.warn('MongoDB failed for records DELETE, falling back to JSON', dbErr)
      let records = []
      try {
        const data = await fs.readFile(RECORDS_FILE, 'utf-8')
        records = JSON.parse(data)
      } catch (e) {
        return NextResponse.json({ error: 'Failed to read records' }, { status: 500 })
      }

      records = records.filter((r: any) => r.id !== id)
      
      try {
        await fs.writeFile(RECORDS_FILE, JSON.stringify(records, null, 2))
      } catch (fsErr) {
        return NextResponse.json({ error: 'Failed to delete record (Read-only FS)' }, { status: 500 })
      }
      
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 })
  }
}
