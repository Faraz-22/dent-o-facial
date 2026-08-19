import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'
import { User as UserModel } from '@/lib/models'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const password = body.password
    const email = body.email || ''
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dentofacial.com'
    const adminPassword = process.env.ADMIN_PASSWORD

    // 1. Check Admin Credentials
    // In production, ADMIN_PASSWORD should be set as an env var.
    if (adminPassword && password === adminPassword && (email.trim().toLowerCase() === adminEmail.toLowerCase() || email.trim() === 'admin')) {
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

    // 1.5 Check Staff Credentials
    if (email.trim().toLowerCase() === 'staff@dentofacial.com' && password === 'staff123') {
      const cookieStore = await cookies()
      cookieStore.set('admin-auth', 'staff', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
      cookieStore.delete('user-auth')
      return NextResponse.json({ success: true, role: 'staff', name: 'Staff Admin' })
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
        console.error('MongoDB connection failed during login', dbErr)
        return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
      }

      if (matchedUser && isMatch) {
        const cookieStore = await cookies()
        const userData = { name: matchedUser.name, email: matchedUser.email, id: matchedUser._id.toString() }
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