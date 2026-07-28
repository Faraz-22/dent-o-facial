'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle2, User, Calendar, Activity } from 'lucide-react'

export function NotificationsViewer() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setNotifications(data)
        setLoading(false)
      })
  }, [])

  const markRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true })
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className="p-4 text-gray-400">Loading notifications...</div>

  if (notifications.length === 0) return <div className="p-4 text-gray-400">No notifications.</div>

  const getIcon = (type: string) => {
    switch (type) {
      case 'Appointment': return <Calendar size={18} className="text-blue-400" />
      case 'Lead': return <User size={18} className="text-green-400" />
      case 'System': return <Activity size={18} className="text-amber-400" />
      default: return <Bell size={18} className="text-gray-400" />
    }
  }

  return (
    <div className="space-y-3">
      {notifications.map(n => (
        <div key={n.id} className={`p-4 rounded-2xl border transition flex items-start gap-4 ${n.read ? 'bg-[#1a1a2e]/50 border-gray-800/50 opacity-75' : 'bg-[#1a1a2e] border-gray-700'}`}>
          <div className={`mt-1 p-2 rounded-full ${n.read ? 'bg-gray-900' : 'bg-gray-800'}`}>
            {getIcon(n.type)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <h4 className={`font-medium ${n.read ? 'text-gray-400' : 'text-white'}`}>{n.title}</h4>
              <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-gray-400">{n.message}</p>
          </div>
          {!n.read && (
            <button 
              onClick={() => markRead(n.id)}
              className="text-gray-500 hover:text-green-400 transition flex items-center justify-center p-2"
              title="Mark as read"
            >
              <CheckCircle2 size={18} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
