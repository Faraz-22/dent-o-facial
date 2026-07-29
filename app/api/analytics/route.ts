import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { connectToDatabase } from '@/lib/mongodb'
import { Analytics, User as UserModel } from '@/lib/models'

export const dynamic = 'force-dynamic'

const ANALYTICS_FILE = path.join(process.cwd(), 'data', 'analytics.json')
const MAX_EVENTS = 5000 // Cap to prevent unbounded growth

interface AnalyticsEvent {
  type: string
  page?: string
  treatment?: string
  method?: string
  userEmail?: string
  timestamp: string
}

function readEvents(): AnalyticsEvent[] {
  try {
    const raw = fs.readFileSync(ANALYTICS_FILE, 'utf-8')
    return JSON.parse(raw) as AnalyticsEvent[]
  } catch {
    return []
  }
}

function writeEvents(events: AnalyticsEvent[]): void {
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(events, null, 2), 'utf-8')
}

// POST — Log an event (public, lightweight)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, page, treatment, method } = body

    if (!type) {
      return NextResponse.json({ error: 'Event type required' }, { status: 400 })
    }

    // Try to identify logged-in user
    let userEmail: string | undefined
    try {
      const cookieStore = await cookies()
      const userAuth = cookieStore.get('user-auth')
      if (userAuth?.value) {
        const user = JSON.parse(userAuth.value)
        userEmail = user.email
      }
    } catch { /* ignore */ }

    try {
      await connectToDatabase()
      await Analytics.create({
        type,
        ...(page && { page }),
        ...(treatment && { treatment }),
        ...(method && { method }),
        ...(userEmail && { userEmail }),
        timestamp: new Date()
      })
    } catch (dbErr) {
      console.warn('MongoDB connection failed in analytics POST, falling back to JSON', dbErr)
      const event: AnalyticsEvent = {
        type,
        ...(page && { page }),
        ...(treatment && { treatment }),
        ...(method && { method }),
        ...(userEmail && { userEmail }),
        timestamp: new Date().toISOString(),
      }
      const events = readEvents()
      events.push(event)
      const trimmed = events.length > MAX_EVENTS ? events.slice(-MAX_EVENTS) : events
      writeEvents(trimmed)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })
  }
}

// GET — Retrieve analytics (admin only)
export async function GET() {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin-auth')
  if (adminAuth?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let events: AnalyticsEvent[] = []
  let users: { name: string; email: string; registeredAt?: string }[] = []

  try {
    await connectToDatabase()
    events = await Analytics.find().sort({ timestamp: -1 }).limit(MAX_EVENTS).lean()
    const dbUsers = await UserModel.find({}, { name: 1, email: 1, registeredAt: 1 }).lean()
    users = dbUsers.map(u => ({ name: u.name, email: u.email, registeredAt: u.registeredAt?.toISOString() }))
  } catch (dbErr) {
    console.warn('MongoDB connection failed in analytics GET, falling back to JSON', dbErr)
    events = readEvents()
    try {
      const usersFile = path.join(process.cwd(), 'data', 'users.json')
      const raw = fs.readFileSync(usersFile, 'utf-8')
      users = JSON.parse(raw).map(({ password, ...rest }: { password?: string; name: string; email: string; registeredAt?: string }) => rest)
    } catch { /* ignore */ }
  }

  return NextResponse.json({ events, users })
}
