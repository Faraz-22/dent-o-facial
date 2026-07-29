import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'
import { User as UserModel } from '@/lib/models'

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

interface User {
  name: string
  email: string
  password?: string
}

function readUsers(): User[] {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(raw) as User[]
  } catch {
    return []
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const password = body.password
    const email = body.email || ''
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dentofacial.com'
    const adminPassword = process.env.ADMIN_PASSWORD

    // 1. Check Admin Credentials
    if (adminPassword && password === adminPassword && (email.toLowerCase() === adminEmail.toLowerCase() || email === 'admin')) {
      const cookieStore = await cookies()
      cookieStore.set('admin-auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
      cookieStore.delete('user-auth')
      return NextResponse.json({ success: true, role: 'admin', name: 'Admin' })
    }

    // 2. Check User Credentials
    if (email) {
      let matchedUser = null;
      let isMatch = false;

      try {
        await connectToDatabase()
        matchedUser = await UserModel.findOne({ 
          email: { $regex: new RegExp(`^${email}$`, 'i') }
        });
        
        if (matchedUser && matchedUser.password) {
          isMatch = bcrypt.compareSync(password, matchedUser.password)
        }
      } catch (dbErr) {
        console.warn('MongoDB connection failed, falling back to JSON', dbErr)
        const users = readUsers()
        matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
        if (matchedUser && matchedUser.password) {
          // In fallback mode, handle both bcrypt and plaintext for older accounts during migration
          isMatch = matchedUser.password.startsWith('$2a$') 
            ? bcrypt.compareSync(password, matchedUser.password)
            : matchedUser.password === password;
        }
      }

      if (matchedUser && isMatch) {
        const cookieStore = await cookies()
        const userData = { name: matchedUser.name, email: matchedUser.email }
        cookieStore.set('user-auth', JSON.stringify(userData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        })
        cookieStore.delete('admin-auth')
        return NextResponse.json({ success: true, role: 'user', name: matchedUser.name })
      }
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-auth')
  cookieStore.delete('user-auth')
  return NextResponse.json({ success: true })
}