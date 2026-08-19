'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, MessageCircle, Phone, ArrowLeft, MapPin, Calendar, Clock, Sparkles, User } from 'lucide-react'
import { buildWhatsAppUrl, WA_MESSAGES } from '@/lib/whatsapp'
import { trackEvent } from '@/lib/analytics'

export default function BookingSuccessPage() {
  const [bookingData, setBookingData] = useState<any>(null)

  useEffect(() => {
    const data = sessionStorage.getItem('lastBooking')
    if (data) {
      setBookingData(JSON.parse(data))
    }
  }, [])

  const handleWaClick = () => {
    trackEvent({ type: 'whatsapp_click', method: 'booking_success', clinic: bookingData?.clinic })
  }

  const handlePhoneClick = () => {
    trackEvent({ type: 'phone_click', method: 'booking_success', clinic: bookingData?.clinic })
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-ivory pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="text-charcoal-muted mb-4">No recent booking found.</p>
          <Link href="/book" className="btn-gold px-6 py-2 rounded-full text-sm">Book an Appointment</Link>
        </div>
      </div>
    )
  }

  // Get dynamic phone numbers if available from sessionStorage or fallback to empty string
  const clinicPhone = bookingData.clinic.includes('Banmankhi') ? '' : ''
  const waMessage = WA_MESSAGES.bookingConfirmation(
    bookingData.patientName,
    bookingData.clinic,
    bookingData.treatment,
    bookingData.preferredDate,
    bookingData.preferredTime
  )
  const waUrl = buildWhatsAppUrl(clinicPhone, waMessage)

  return (
    <div className="min-h-screen bg-ivory pt-32 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 md:p-12 text-center shadow-sm border border-cream-dark">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          
          <h1 className="font-playfair text-3xl md:text-4xl text-charcoal mb-4">Appointment Request Sent!</h1>
          <p className="text-charcoal-muted leading-relaxed mb-8">
            Thank you, {bookingData.patientName.split(' ')[0]}. We have received your request.
            Please connect with us on WhatsApp to confirm your slot instantly.
          </p>

          <div className="bg-cream/30 rounded-2xl p-6 text-left space-y-4 mb-8 border border-cream">
            <h3 className="font-medium text-charcoal text-sm uppercase tracking-widest border-b border-cream-dark pb-3 mb-4">Request Summary</h3>
            <div className="flex items-center gap-3 text-sm text-charcoal-muted">
              <MapPin size={16} className="text-gold" />
              <span>{bookingData.clinic}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-charcoal-muted">
              <Sparkles size={16} className="text-gold" />
              <span>{bookingData.treatment}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-charcoal-muted">
              <Calendar size={16} className="text-gold" />
              <span>{new Date(bookingData.preferredDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-charcoal-muted">
              <Clock size={16} className="text-gold" />
              <span>{bookingData.preferredTime}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWaClick}
              className="bg-[#25D366] text-white px-8 py-4 rounded-xl text-sm font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition"
            >
              <MessageCircle size={18} />
              Confirm via WhatsApp
            </a>
            <a 
              href={`tel:+91${clinicPhone}`}
              onClick={handlePhoneClick}
              className="bg-charcoal text-ivory px-8 py-4 rounded-xl text-sm font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-charcoal-light transition"
            >
              <Phone size={18} />
              Call Clinic
            </a>
          </div>

          <div className="mt-12 pt-8 border-t border-cream-dark">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-charcoal-muted hover:text-gold transition">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
