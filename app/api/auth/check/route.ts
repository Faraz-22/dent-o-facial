import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { connectToDatabase } from '@/lib/mongodb'
import { User as UserModel } from '@/lib/models'

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

export async function GET() {
  const cookieStore = await cookies()
  
  const adminAuth = cookieStore.get('admin-auth')
  if (adminAuth?.value === 'true') {
    return NextResponse.json({ ok: true, role: 'admin', name: 'Admin' })
  }
  if (adminAuth?.value === 'staff') {
    return NextResponse.json({ ok: true, role: 'staff', name: 'Staff Admin' })
  }
  
  const userAuth = cookieStore.get('user-auth')
  if (userAuth?.value) {
    try {
      const userCookie = JSON.parse(userAuth.value)
      
      let avatar = undefined
      let dbName = userCookie.name

      try {
        await connectToDatabase()
        const matched = await UserModel.findOne({ email: userCookie.email })
        if (matched) {
          if (matched.avatar) avatar = matched.avatar
          dbName = matched.name
        }
      } catch (dbErr) {
        console.warn('MongoDB failed in auth/check, fallback to JSON', dbErr)
        try {
          const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'))
          const matched = users.find((u: any) => u.email === userCookie.email)
          if (matched) {
            if (matched.avatar) avatar = matched.avatar
            dbName = matched.name
          }
        } catch { }
      }

      return NextResponse.json({ ok: true, role: 'user', name: dbName, email: userCookie.email, avatar })
    } catch {
      // Fallback
    }
  }
  
  return NextResponse.json({ ok: false }, { status: 401 })
}