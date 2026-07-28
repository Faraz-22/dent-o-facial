import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

interface User {
  name: string
  email: string
  password?: string
  registeredAt?: string
}

function readUsers(): User[] {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(raw) as User[]
  } catch {
    return []
  }
}

function writeUsers(users: User[]): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing name, email, or password' }, { status: 400 })
    }

    const users = readUsers()
    
    // Check if email already registered
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase())
    if (exists) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Add new user
    const newUser: User = { name, email, password, registeredAt: new Date().toISOString() }
    users.push(newUser)
    writeUsers(users)

    // Log them in immediately
    const cookieStore = await cookies()
    const userData = { name: newUser.name, email: newUser.email }
    cookieStore.set('user-auth', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    
    // Clear admin session if exists
    cookieStore.delete('admin-auth')

    return NextResponse.json({ success: true, role: 'user', name: newUser.name })
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
