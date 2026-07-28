'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSiteContent } from '@/hooks/useSiteContent'
import { trackEvent } from '@/lib/analytics'
import { Calendar, Clock, MapPin, User, Phone, Sparkles } from 'lucide-react'

export default function BookAppointmentPage() {
  const router = useRouter()
  const { data, isLoading } = useSiteContent()
  
  const [formData, setFormData] = useState({
    clinic: '',
    treatment: '',
    preferredDate: '',
    preferredTime: '',
    patientName: '',
    phone: '',
    email: '',
    message: ''
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const clinics = (data?.locations as any[]) || [
    { name: 'Purnea Clinic', id: 'purnea' },
    { name: 'Banmankhi Clinic', id: 'banmankhi' }
  ]
  
  const treatmentsList = data?.treatments 
    ? [...(data.treatments.dermatology || []), ...(data.treatments.dental || [])]
    : []

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    
    try {
      // 1. Create Appointment
      const apptRes = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!apptRes.ok) throw new Error('Failed to book appointment')
      
      // 2. Create Lead
      const leadRes = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.patientName,
          phone: formData.phone,
          email: formData.email,
          treatment: formData.treatment,
          clinic: formData.clinic,
          source: 'Appointment Form'
        })
      })
      if (!leadRes.ok) throw new Error('Failed to capture lead')

      // 3. Track Event
      trackEvent({
        type: 'booking_submitted',
        clinic: formData.clinic,
        treatment: formData.treatment
      })
      
      // Store in session storage to show on success page
      sessionStorage.setItem('lastBooking', JSON.stringify(formData))
      
      router.push('/book/success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-ivory">Loading...</div>

  return (
    <div className="min-h-screen bg-ivory pt-32 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl text-charcoal mb-4">Book Your Appointment</h1>
          <p className="text-charcoal-muted">Schedule your visit with Dr. Hadi Raza. We'll confirm your slot shortly.</p>
        </div>
        
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-cream-dark">
          {error && (
            <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Clinic & Treatment */}
            <div className="space-y-6">
              <h2 className="text-lg font-playfair font-medium text-charcoal border-b border-cream pb-2">1. Select Clinic & Treatment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-charcoal-muted mb-2">
                    <MapPin size={16} className="text-gold" />
                    Clinic Location *
                  </label>
                  <select
                    name="clinic"
                    required
                    value={formData.clinic}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-ivory focus:outline-none focus:border-gold transition"
                  >
                    <option value="">Select Clinic</option>
                    {clinics.map(c => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-charcoal-muted mb-2">
                    <Sparkles size={16} className="text-gold" />
                    Treatment *
                  </label>
                  <select
                    name="treatment"
                    required
                    value={formData.treatment}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-ivory focus:outline-none focus:border-gold transition"
                  >
                    <option value="">Select Treatment</option>
                    <option value="General Consultation">General Consultation</option>
                    {treatmentsList.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Date & Time */}
            <div className="space-y-6">
              <h2 className="text-lg font-playfair font-medium text-charcoal border-b border-cream pb-2">2. Preferred Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-charcoal-muted mb-2">
                    <Calendar size={16} className="text-gold" />
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.preferredDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-ivory focus:outline-none focus:border-gold transition"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-charcoal-muted mb-2">
                    <Clock size={16} className="text-gold" />
                    Preferred Time *
                  </label>
                  <select
                    name="preferredTime"
                    required
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-ivory focus:outline-none focus:border-gold transition"
                  >
                    <option value="">Select Time</option>
                    <option value="Morning (10AM - 1PM)">Morning (10AM - 1PM)</option>
                    <option value="Afternoon (1PM - 4PM)">Afternoon (1PM - 4PM)</option>
                    <option value="Evening (4PM - 7PM)">Evening (4PM - 7PM)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Patient Details */}
            <div className="space-y-6">
              <h2 className="text-lg font-playfair font-medium text-charcoal border-b border-cream pb-2">3. Patient Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-charcoal-muted mb-2">
                    <User size={16} className="text-gold" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    required
                    placeholder="Your Name"
                    value={formData.patientName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-ivory focus:outline-none focus:border-gold transition"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-charcoal-muted mb-2">
                    <Phone size={16} className="text-gold" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-ivory focus:outline-none focus:border-gold transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-muted mb-2">Email Address (Optional)</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-ivory focus:outline-none focus:border-gold transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-muted mb-2">Additional Message (Optional)</label>
                <textarea
                  name="message"
                  placeholder="Any specific concerns?"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-ivory focus:outline-none focus:border-gold transition resize-none"
                />
              </div>
            </div>
            
            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-gold py-4 rounded-xl text-sm font-medium tracking-wide flex items-center justify-center gap-2"
              >
                {submitting ? 'Booking...' : 'Confirm Appointment Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
