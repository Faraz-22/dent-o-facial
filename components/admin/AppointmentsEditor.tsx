'use client'

import { useState, useEffect } from 'react'
import { Calendar, Phone, Check, X, Clock, MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl, WA_MESSAGES } from '@/lib/whatsapp'

export function AppointmentsEditor() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/appointments', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setAppointments(data)
        setLoading(false)
      })
  }, [])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className="p-4 text-gray-400">Loading appointments...</div>

  if (appointments.length === 0) return <div className="p-4 text-gray-400">No appointments found.</div>

  return (
    <div className="space-y-4">
      {appointments.map(appt => {
        const waUrl = buildWhatsAppUrl(appt.phone, WA_MESSAGES.adminFollowUp(appt.patientName, appt.treatment))
        return (
          <div key={appt.id} className="p-5 rounded-2xl bg-[#1a1a2e] border border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h3 className="text-white font-medium text-lg">{appt.patientName}</h3>
                <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                  <Phone size={14} /> {appt.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  appt.status === 'New' ? 'bg-blue-900/50 text-blue-400' :
                  appt.status === 'Confirmed' ? 'bg-green-900/50 text-green-400' :
                  appt.status === 'Cancelled' ? 'bg-red-900/50 text-red-400' :
                  'bg-gray-800 text-gray-400'
                }`}>
                  {appt.status}
                </span>
                <select 
                  value={appt.status} 
                  onChange={e => updateStatus(appt.id, e.target.value)}
                  className="bg-gray-800 text-white text-xs rounded-lg px-2 py-1 border border-gray-700 outline-none"
                >
                  <option value="New">New</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Visited">Visited</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Follow-up Needed">Follow-up Needed</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm bg-[#12122a] p-4 rounded-xl mb-4 border border-gray-800">
              <div>
                <span className="text-gray-500 block mb-1 text-xs uppercase">Treatment</span>
                <span className="text-gray-300">{appt.treatment}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1 text-xs uppercase">Clinic</span>
                <span className="text-gray-300">{appt.clinic}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1 text-xs uppercase">Date</span>
                <span className="text-gray-300 flex items-center gap-1"><Calendar size={14} className="text-amber-500" /> {appt.preferredDate}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1 text-xs uppercase">Time</span>
                <span className="text-gray-300 flex items-center gap-1"><Clock size={14} className="text-amber-500" /> {appt.preferredTime}</span>
              </div>
            </div>

            {appt.message && (
              <div className="mb-4 text-sm text-gray-400">
                <span className="text-gray-500 font-medium">Message:</span> {appt.message}
              </div>
            )}

            <div className="flex gap-2">
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-[#25D366]/20 text-[#25D366] rounded-lg text-xs font-medium hover:bg-[#25D366]/30 transition">
                <MessageCircle size={14} /> WhatsApp
              </a>
              <a href={`tel:${appt.phone}`} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-700 transition">
                <Phone size={14} /> Call
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}
