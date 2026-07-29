import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/mongodb'
import { RecordModel } from '@/lib/models'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    // Auth Check
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin-auth')
    const userAuth = cookieStore.get('user-auth')
    
    let isAuthorized = false
    let query: any = {}

    if (adminAuth?.value === 'true') {
      isAuthorized = true
      query = email ? { patientEmail: email } : {} // Admin can fetch all or filter by email
    } else if (userAuth?.value) {
      try {
        const user = JSON.parse(userAuth.value)
        if (user.email) {
          isAuthorized = true
          query = { patientEmail: user.email } // Patient can ONLY fetch their own records, ignoring requested email
        }
      } catch (e) {}
    }
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const records = await RecordModel.find(query).sort({ createdAt: -1 }).lean()
    return NextResponse.json(records)
  } catch (error) {
    console.error('Failed to get records:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    const { patientEmail, type, fileUrl, notes, date, title, mimeType, size, storageKey } = body

    if (!patientEmail || !type || !fileUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const id = Date.now().toString()
    
    await connectToDatabase()
    const newRecord = await RecordModel.create({
      id,
      patientEmail,
      type,
      title,
      fileUrl,
      storageKey,
      mimeType,
      size,
      notes,
      uploadedBy: 'admin',
      date: date || new Date().toISOString(),
      createdAt: new Date()
    })
    
    return NextResponse.json({ success: true, record: newRecord })
  } catch (error) {
    console.error('Failed to create record:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    await connectToDatabase()
    // Ideally, we should also delete from Cloudinary here using deleteFromCloudinary(record.storageKey)
    const record = await RecordModel.findOneAndDelete({ id })
    
    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete record:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
