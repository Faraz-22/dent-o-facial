'use client'

import { useState, useEffect } from 'react'
import { Calendar, Phone, Check, X, Clock, MessageCircle, Search, Filter } from 'lucide-react'
import { buildWhatsAppUrl, WA_MESSAGES } from '@/lib/whatsapp'

export function AppointmentsEditor() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    patientName: '', phone: '', email: '', treatment: 'Consultation', clinic: 'Purnea', preferredDate: new Date().toISOString().split('T')[0], preferredTime: '10:00'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = () => {
    fetch('/api/appointments', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setAppointments(data)
        setLoading(false)
      })
  }

  const handleBookWalkIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm)
      })
      if (res.ok) {
        setShowBookingModal(false)
        setBookingForm({ patientName: '', phone: '', email: '', treatment: 'Consultation', clinic: 'Purnea', preferredDate: new Date().toISOString().split('T')[0], preferredTime: '10:00' })
        fetchAppointments()
      } else {
        alert('Failed to book appointment')
      }
    } catch (err) {
      alert('Error booking appointment')
    } finally {
      setSaving(false)
    }
  }

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

  const filteredAppointments = appointments.filter(appt => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      appt.patientName?.toLowerCase().includes(searchString) ||
      appt.phone?.includes(searchTerm) ||
      appt.opdNumber?.toString() === searchTerm ||
      appt.patientSerialCode?.toLowerCase().includes(searchString);
      
    const matchesStatus = statusFilter === 'All' || appt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-4 text-gray-400">Loading appointments...</div>

  if (appointments.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end mb-4">
          <button onClick={() => setShowBookingModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition">
            + Book Walk-in Appointment
          </button>
        </div>
        <div className="p-4 text-gray-400">No appointments found.</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-white">Appointments</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search name, phone, OPD or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#1a1a2e] border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Visited">Visited</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Follow-up Needed">Follow-up Needed</option>
          </select>
          <button onClick={() => setShowBookingModal(true)} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition flex items-center justify-center gap-2 whitespace-nowrap">
            <span className="text-lg leading-none">+</span> Book
          </button>
        </div>
      </div>
      {filteredAppointments.length === 0 && (
        <div className="p-8 text-center text-gray-500 border border-gray-800 rounded-2xl bg-[#1a1a2e]">
          No appointments found matching your filters.
        </div>
      )}
      {filteredAppointments.map(appt => {
        const waUrl = buildWhatsAppUrl(appt.phone, WA_MESSAGES.adminFollowUp(appt.patientName, appt.treatment))
        return (
          <div key={appt.id} className="p-5 rounded-2xl bg-[#1a1a2e] border border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h3 className="text-white font-medium text-lg">{appt.patientName}</h3>
                  {appt.opdNumber && (
                    <span className="bg-amber-600/20 text-amber-500 px-2 py-0.5 rounded text-xs font-bold border border-amber-600/30">
                      OPD: {appt.opdNumber}
                    </span>
                  )}
                  {appt.patientSerialCode && (
                    <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-xs font-medium border border-blue-600/30">
                      ID: #{appt.patientSerialCode}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm flex items-center gap-2">
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

      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12122a] border border-gray-800 p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Book Walk-In Appointment</h2>
            <form onSubmit={handleBookWalkIn} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1">Patient Name *</label>
                <input required value={bookingForm.patientName} onChange={e => setBookingForm({...bookingForm, patientName: e.target.value})} className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Phone Number *</label>
                <input required value={bookingForm.phone} onChange={e => setBookingForm({...bookingForm, phone: e.target.value})} className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Email (Optional)</label>
                <input type="email" value={bookingForm.email} onChange={e => setBookingForm({...bookingForm, email: e.target.value})} className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Treatment *</label>
                  <input required value={bookingForm.treatment} onChange={e => setBookingForm({...bookingForm, treatment: e.target.value})} placeholder="e.g. Consultation" className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Clinic *</label>
                  <select value={bookingForm.clinic} onChange={e => setBookingForm({...bookingForm, clinic: e.target.value})} className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-3 py-2 text-white">
                    <option value="Purnea">Purnea</option>
                    <option value="Banmankhi">Banmankhi</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Date *</label>
                  <input type="date" required value={bookingForm.preferredDate} onChange={e => setBookingForm({...bookingForm, preferredDate: e.target.value})} className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Time *</label>
                  <input type="time" required value={bookingForm.preferredTime} onChange={e => setBookingForm({...bookingForm, preferredTime: e.target.value})} className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-3 py-2 text-white" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button type="button" onClick={() => setShowBookingModal(false)} className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 font-medium hover:bg-gray-800 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-500 transition disabled:opacity-50">
                  {saving ? 'Booking...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
