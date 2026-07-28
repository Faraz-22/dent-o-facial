import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

export async function GET() {
  const cookieStore = await cookies()
  
  const adminAuth = cookieStore.get('admin-auth')
  if (adminAuth?.value === 'true') {
    return NextResponse.json({ ok: true, role: 'admin', name: 'Admin' })
  }
  
  const userAuth = cookieStore.get('user-auth')
  if (userAuth?.value) {
    try {
      const userCookie = JSON.parse(userAuth.value)
      
      // Fetch latest user data from users.json to get avatar
      let avatar = undefined
      try {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'))
        const matched = users.find((u: any) => u.email === userCookie.email)
        if (matched && matched.avatar) avatar = matched.avatar
      } catch { }

      return NextResponse.json({ ok: true, role: 'user', name: userCookie.name, email: userCookie.email, avatar })
    } catch {
      // Fallback
    }
  }
  
  return NextResponse.json({ ok: false }, { status: 401 })
}