import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { connectToDatabase } from '@/lib/mongodb'
import { User as UserModel } from '@/lib/models'

export const dynamic = 'force-dynamic'

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

interface User {
  name: string
  email: string
  password?: string
  registeredAt?: string
  avatar?: string
}

function readUsers(): User[] {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(raw) as User[]
  } catch {
    return []
  }
}

export async function GET() {
  // Only admins can view user list
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin-auth')
  if (adminAuth?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const users = await UserModel.find({}, { password: 0 }).sort({ registeredAt: -1 })
    return NextResponse.json(users)
  } catch (err) {
    console.warn('MongoDB connection failed, falling back to JSON', err)
    const users = readUsers()
    // Return users WITHOUT passwords
    const safeUsers = users.map(({ password, ...rest }) => rest)
    return NextResponse.json(safeUsers)
  }
}

export async function DELETE(request: Request) {
  // Only admins can delete users
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin-auth')
  if (adminAuth?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    try {
      await connectToDatabase()
      const result = await UserModel.deleteOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true })
    } catch (dbErr) {
      console.warn('MongoDB connection failed, falling back to JSON', dbErr)
      const users = readUsers()
      const filtered = users.filter(u => u.email.toLowerCase() !== email.toLowerCase())
      
      if (filtered.length === users.length) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      fs.writeFileSync(USERS_FILE, JSON.stringify(filtered, null, 2), 'utf-8')
      return NextResponse.json({ success: true, remaining: filtered.length })
    }
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies()
  const userAuth = cookieStore.get('user-auth')
  if (!userAuth || !userAuth.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { email, avatar } = await request.json()
    // Make sure they are updating their own avatar
    const userCookie = JSON.parse(userAuth.value)
    const loggedInEmail = userCookie.email
    if (!loggedInEmail || loggedInEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
      await connectToDatabase()
      const updatedUser = await UserModel.findOneAndUpdate(
        { email: { $regex: new RegExp(`^${email}$`, 'i') } },
        { avatar },
        { new: true }
      )
      if (!updatedUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, avatar })
    } catch (dbErr) {
      console.warn('MongoDB connection failed, falling back to JSON', dbErr)
      const users = readUsers()
      const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase())
      
      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      users[userIndex].avatar = avatar
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
      
      return NextResponse.json({ success: true, avatar })
    }
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
