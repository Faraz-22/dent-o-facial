import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/mongodb'
import { User, Appointment, RecordModel, Lead, Notification, Analytics } from '@/lib/models'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin-auth')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const [
      users,
      appointments,
      records,
      leads,
      notifications,
      analytics
    ] = await Promise.all([
      User.countDocuments(),
      Appointment.countDocuments(),
      RecordModel.countDocuments(),
      Lead.countDocuments(),
      Notification.countDocuments(),
      Analytics.countDocuments()
    ])

    return NextResponse.json({
      users,
      appointments,
      records,
      leads,
      notifications,
      analytics
    })
  } catch (err) {
    console.error('Failed to fetch stats:', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
