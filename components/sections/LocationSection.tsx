'use client'

import { MapPin, Clock, Phone } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

interface Location {
  id: string
  name: string
  address: string
  phone: string
  hours: string
  mapUrl: string
  primary: boolean
}

export default function LocationSection() {
  const { data } = useSiteContent()
  const locations: Location[] = data?.locations || []
  
  // Reverse the array so the second location (e.g., Banmankhi) shows up first
  const reversedLocations = [...locations].reverse()
  const cta = data?.cta as Record<string, unknown> | undefined
  const whatsappNumber = cta?.whatsappNumber as string || (data?.hero as any)?.whatsappNumber || '917488404161'

  const defaultLocations: Location[] = [
    {
      id: 'banmankhi',
      name: 'Banmankhi Clinic',
      address: 'Station Road, Banmankhi, Bihar 854202',
      phone: '+91 98765 43210',
      hours: 'Tue, Thu, Sat: 11am – 5pm',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28953.12!2d87.1906!3d25.8927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef5b0000000001%3A0x0!2sBanmankhi%2C%20Bihar!5e0!3m2!1sen!2sin!4v1620000000001!5m2!1sen!2sin',
      primary: false,
    },
    {
      id: 'purnea',
      name: 'Purnea Clinic',
      address: 'Main Road, Purnea, Bihar 854301',
      phone: '+91 98765 43210',
      hours: 'Mon–Sat: 10am – 7pm',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57912.31!2d87.4753!3d25.7771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef5a4b7f5c2a1d%3A0x0!2sPurnea%2C%20Bihar!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin',
      primary: true,
    },
  ]

  const displayLocations = reversedLocations.length > 0 ? reversedLocations : defaultLocations

  return (
    <section className="py-24 bg-ivory">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-gold" />
            <span className="section-label">Find Us</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h2 className="font-playfair text-4xl lg:text-5xl text-charcoal mb-4">
            Our Clinic Locations
          </h2>
          <p className="text-charcoal-muted max-w-md mx-auto">
            Visit us at either of our conveniently located clinics in Purnea and Banmankhi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {displayLocations.map((loc) => (
            <div key={loc.id} className="luxury-card rounded-3xl overflow-hidden">
              <div className="h-56 bg-cream-dark relative overflow-hidden">
                <iframe
                  src={loc.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map for ${loc.name}`}
                />
              </div>

              <div className="p-8">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-playfair text-xl text-charcoal font-medium">{loc.name}</h3>
                    {loc.primary && (
                      <span className="treatment-tag mt-1 inline-block">Main Clinic</span>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <MapPin size={18} className="text-gold-dark" />
                  </div>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <MapPin size={14} className="text-gold mt-0.5 shrink-0" />
                    <span className="text-charcoal-muted text-sm">{loc.address}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone size={14} className="text-gold shrink-0" />
                    <a href={`tel:${loc.phone.replace(/\s/g, '')}`} className="text-charcoal-muted text-sm hover:text-gold-dark transition-colors">
                      {loc.phone}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock size={14} className="text-gold shrink-0" />
                    <span className="text-charcoal-muted text-sm">{loc.hours}</span>
                  </li>
                </ul>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=Hello%2C%20I%20want%20to%20book%20at%20${encodeURIComponent(loc.name)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 btn-gold px-6 py-3 rounded-full text-sm inline-block"
                >
                  Book at This Clinic
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
