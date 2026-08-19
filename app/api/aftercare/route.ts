import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/mongodb'
import { Aftercare } from '@/lib/models'

const AFTERCARE_FILE = path.join(process.cwd(), 'data/aftercare.json')

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    // Auth Check
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin-auth')
    const userAuth = cookieStore.get('user-auth')
    
    let isAuthorized = false
    if ((adminAuth?.value === 'true' || adminAuth?.value === 'staff')) {
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
      if (email) {
        const aftercare = await Aftercare.findOne({ email }).lean()
        return NextResponse.json({ aftercare: aftercare ? aftercare.aftercareText : '' })
      }
      
      const allAftercare = await Aftercare.find({}).lean()
      const aftercareMap: Record<string, string> = {}
      allAftercare.forEach(item => {
        aftercareMap[item.email] = item.aftercareText
      })
      return NextResponse.json(aftercareMap)
    } catch (dbErr) {
      console.warn('MongoDB failed for aftercare GET, falling back to JSON', dbErr)
      let data = '{}'
      try {
        data = await fs.readFile(AFTERCARE_FILE, 'utf-8')
      } catch (e) {}
      
      const aftercare = JSON.parse(data)
      
      if (email) {
        return NextResponse.json({ aftercare: aftercare[email] || '' })
      }
      return NextResponse.json(aftercare)
    }
  } catch (error) {
    return NextResponse.json({})
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin-auth')
    if ((adminAuth?.value !== 'true' && adminAuth?.value !== 'staff')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, aftercareText } = body

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    try {
      await connectToDatabase()
      await Aftercare.findOneAndUpdate(
        { email },
        { aftercareText, updatedAt: new Date() },
        { upsert: true, new: true }
      )
      return NextResponse.json({ success: true })
    } catch (dbErr) {
      console.warn('MongoDB failed for aftercare POST, falling back to JSON', dbErr)
      let aftercareData: any = {}
      try {
        const data = await fs.readFile(AFTERCARE_FILE, 'utf-8')
        aftercareData = JSON.parse(data)
      } catch (e) {
        aftercareData = {}
      }

      aftercareData[email] = aftercareText
      
      try {
        await fs.writeFile(AFTERCARE_FILE, JSON.stringify(aftercareData, null, 2))
      } catch (fsErr) {
        return NextResponse.json({ error: 'Failed to save aftercare (Read-only FS)' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Aftercare POST Error:', error)
    return NextResponse.json({ error: 'Failed to save aftercare' }, { status: 500 })
  }
}
