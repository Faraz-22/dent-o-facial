import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { cookies } from 'next/headers'

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

    const data = await fs.readFile(AFTERCARE_FILE, 'utf-8')
    const aftercare = JSON.parse(data)
    
    if (email) {
      return NextResponse.json({ aftercare: aftercare[email] || '' })
    }
    
    return NextResponse.json(aftercare)
  } catch (error) {
    return NextResponse.json({})
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
    const { email, aftercareText } = body

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    let aftercareData: any = {}
    try {
      const data = await fs.readFile(AFTERCARE_FILE, 'utf-8')
      aftercareData = JSON.parse(data)
    } catch (e) {
      aftercareData = {}
    }

    aftercareData[email] = aftercareText
    await fs.writeFile(AFTERCARE_FILE, JSON.stringify(aftercareData, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Aftercare POST Error:', error)
    return NextResponse.json({ error: 'Failed to save aftercare' }, { status: 500 })
  }
}
