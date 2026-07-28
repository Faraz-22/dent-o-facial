'use client'

import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

interface Location {
  id: string
  name: string
  address: string
  phone: string
  hoursDetail: string
  mapUrl: string
  primary: boolean
}

interface Faq {
  id: string
  q: string
  a: string
}

export default function ContactPage() {
  const { data } = useSiteContent()
  const locations: Location[] = data?.locations || []
  const faqs: Faq[] = data?.faq || []
  const cta = data?.cta as Record<string, unknown> | undefined
  const whatsappNumber = cta?.whatsappNumber as string || (data?.hero as any)?.whatsappNumber || '917488404161'
  const whatsappMessage = cta?.whatsappMessage as string || 'Hello, I want to book an appointment.'
  const phoneNumber = cta?.phoneNumber as string || '+91 98765 43210'

  const defaultFaqs: Faq[] = [
    { id: '1', q: 'How do I book an appointment?', a: 'You can book via WhatsApp (click the floating button) or call us directly at +91 98765 43210. We respond to WhatsApp messages within minutes during clinic hours.' },
    { id: '2', q: 'Are initial consultations free?', a: 'Yes, we offer free initial consultations for new patients. Dr. Raza will assess your needs and recommend a personalized treatment plan.' },
    { id: '3', q: 'Which clinic should I visit?', a: 'Both clinics offer the same quality of care. Choose based on your location. Purnea clinic operates Mon–Sat and Banmankhi operates Tue, Thu, Sat.' },
    { id: '4', q: 'Do you offer EMI or payment plans?', a: 'Yes, we offer flexible EMI options for most procedures. Please discuss with our team at the time of consultation.' },
  ]

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs
  const displayLocations = locations.length > 0 ? locations : [
    { id: 'purnea', name: 'Purnea Clinic', address: 'Main Road, Purnea, Bihar 854301', phone: '+91 98765 43210', hoursDetail: 'Monday – Saturday: 10:00 AM – 7:00 PM', mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57912.31!2d87.4753!3d25.7771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef5a4b7f5c2a1d%3A0x0!2sPurnea%2C+Bihar!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin', primary: true },
    { id: 'banmankhi', name: 'Banmankhi Clinic', address: 'Station Road, Banmankhi, Bihar 854202', phone: '+91 98765 43210', hoursDetail: 'Tuesday, Thursday, Saturday: 11:00 AM – 5:00 PM', mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28953.12!2d87.1906!3d25.8927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef5b0000000001%3A0x0!2sBanmankhi%2C+Bihar!5e0!3m2!1sen!2sin!4v1620000000001!5m2!1sen!2sin', primary: false },
  ]

  return (
    <>
      <section className="pt-32 pb-16 bg-ivory">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10 bg-gold" />
            <span className="section-label">Get in Touch</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h1 className="font-playfair text-5xl lg:text-6xl text-charcoal mb-5">
            Contact Us
          </h1>
          <p className="text-charcoal-muted text-lg max-w-xl mx-auto">
            Ready to begin your transformation? Reach out via WhatsApp, call us, or visit either of our clinics in Purnea or Banmankhi.
          </p>
        </div>
      </section>

      <section className="py-10 bg-charcoal">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-[#20BA5A] transition-colors w-full sm:w-auto justify-center"
            >
              <MessageCircle size={18} />
              WhatsApp: Book Now
            </a>
            <a
              href={`tel:${phoneNumber.replace(/\s/g, '')}`}
              className="flex items-center gap-3 border border-gold/30 text-ivory px-8 py-4 rounded-full text-sm font-medium hover:bg-gold hover:text-charcoal hover:border-gold transition-all w-full sm:w-auto justify-center"
            >
              <Phone size={18} />
              Call: {phoneNumber}
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {displayLocations.map((loc) => (
              <div key={loc.id} className="luxury-card rounded-3xl overflow-hidden">
                <div className="h-64">
                  <iframe
                    src={loc.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${loc.name} Map`}
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="treatment-tag">{loc.primary ? 'Main Clinic' : 'Satellite Clinic'}</span>
                    <h2 className="font-playfair text-xl text-charcoal font-medium">{loc.name.replace(' Clinic', '')}</h2>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <MapPin size={16} className="text-gold mt-0.5 shrink-0" />
                      <div>
                        <p className="text-charcoal text-sm font-medium">Address</p>
                        <p className="text-charcoal-muted text-sm">{loc.address}</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <Phone size={16} className="text-gold mt-0.5 shrink-0" />
                      <div>
                        <p className="text-charcoal text-sm font-medium">Phone</p>
                        <a href={`tel:${loc.phone}`} className="text-charcoal-muted text-sm hover:text-gold-dark">{loc.phone}</a>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <Clock size={16} className="text-gold mt-0.5 shrink-0" />
                      <div>
                        <p className="text-charcoal text-sm font-medium">Working Hours</p>
                        <p className="text-charcoal-muted text-sm">{loc.hoursDetail}</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-ivory">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label block mb-4">Common Questions</span>
            <h2 className="font-playfair text-3xl text-charcoal">FAQs</h2>
          </div>
          <div className="space-y-4">
            {displayFaqs.map((faq) => (
              <div key={faq.id} className="luxury-card rounded-2xl p-6">
                <h3 className="font-medium text-charcoal mb-2">{faq.q}</h3>
                <p className="text-charcoal-muted text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
