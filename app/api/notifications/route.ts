import { NextResponse } from 'next/server'
import { getNotifications, saveNotification } from '@/lib/db'
import { connectToDatabase } from '@/lib/mongodb'
import { Notification as NotificationModel } from '@/lib/models'

export async function GET() {
  try {
    await connectToDatabase()
    const notifications = await NotificationModel.find({}).sort({ createdAt: -1 }).lean()
    return NextResponse.json(notifications)
  } catch (err) {
    console.warn('MongoDB connection failed for notifications, falling back to JSON', err)
    try {
      const notifications = getNotifications()
      return NextResponse.json(notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch {
      return NextResponse.json([])
    }
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json()
    const { id, read } = data
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    try {
      await connectToDatabase()
      const updated = await NotificationModel.findOneAndUpdate(
        { id },
        { read },
        { new: true }
      )
      if (!updated) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, notification: updated })
    } catch (dbErr) {
      console.warn('MongoDB connection failed for notifications patch, falling back to JSON', dbErr)
      try {
        const notifications = getNotifications()
        const index = notifications.findIndex(n => n.id === id)
        
        if (index === -1) {
          return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
        }
        
        const updated = { ...notifications[index], read }
        saveNotification(updated)
        
        return NextResponse.json({ success: true, notification: updated })
      } catch (fsErr) {
        console.error('Failed to update notification locally', fsErr)
        return NextResponse.json({ error: 'Failed to update notification (Read-only FS)' }, { status: 500 })
      }
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
