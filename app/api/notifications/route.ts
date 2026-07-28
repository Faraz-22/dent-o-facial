import { NextResponse } from 'next/server'
import { getNotifications, saveNotification } from '@/lib/db'

export async function GET() {
  const notifications = getNotifications()
  return NextResponse.json(notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json()
    const { id, read } = data
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    
    const notifications = getNotifications()
    const index = notifications.findIndex(n => n.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }
    
    const updated = { ...notifications[index], read }
    saveNotification(updated)
    
    return NextResponse.json({ success: true, notification: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
