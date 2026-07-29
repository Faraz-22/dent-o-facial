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

    const hashedPassword = bcrypt.hashSync(password, 10)

    try {
      await connectToDatabase()
      
      const existingUser = await UserModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
      if (existingUser) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
      }

      await UserModel.create({
        name,
        email,
        password: hashedPassword,
        registeredAt: new Date()
      })
    } catch (dbErr) {
      console.error('MongoDB connection failed in register', dbErr)
      return NextResponse.json({ error: 'Internal server error. Registration failed.' }, { status: 500 })
    }

    // Log them in immediately
    const cookieStore = await cookies()
    const userData = { name, email }
    cookieStore.set('user-auth', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    
    // Clear admin session if exists
    cookieStore.delete('admin-auth')

    return NextResponse.json({ success: true, role: 'user', name })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
