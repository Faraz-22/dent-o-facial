'use client'

import Link from 'next/link'
import { MapPin, Phone, Clock, Instagram } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

interface Location {
  id: string
  name: string
  address: string
  phone: string
  hours: string
}

export default function Footer() {
  const { data } = useSiteContent()
  const cta = data?.cta as Record<string, unknown> | undefined
  const locations = (data?.locations as Location[]) || []
  const phoneNumber = cta?.phoneNumber as string || ''
  return (
    <footer className="bg-charcoal text-ivory">
      {/* Top gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1 flex flex-col justify-between">
            <div className="mb-4 flex flex-col items-start">
              <h3 className="font-playfair text-3xl text-ivory mb-1 tracking-wide">Dent-O-Facial</h3>
              <p className="text-gold text-xs tracking-[0.2em] uppercase font-semibold mt-1">Dr. Hadi Raza</p>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Luxury dermatology and dental care, bringing world-class treatments to Purnea and Banmankhi, Bihar.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-gold/30 rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-charcoal transition-all duration-300"
              >
                <Instagram size={15} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold font-semibold mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: '/about', label: 'About Dr. Raza' },
                { href: '/treatments', label: 'Treatments' },
                { href: '/results', label: 'Patient Results' },
                { href: '/testimonials', label: 'Testimonials' },
                { href: '/blog', label: 'Blog' },
                { href: '/contact', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-gold transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Treatments */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold font-semibold mb-5">Treatments</h4>
            <ul className="space-y-3">
              {[
                'Acne Treatment',
                'Laser Therapy',
                'Skin Rejuvenation',
                'Teeth Whitening',
                'Smile Design',
                'Dental Implants',
              ].map((t) => (
                <li key={t}>
                  <Link href="/treatments" className="text-gray-400 text-sm hover:text-gold transition-colors duration-200">
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold font-semibold mb-5">Contact</h4>
            <ul className="space-y-4">
              {locations.length > 0 && locations.map((loc) => (
                <li key={loc.id} className="flex gap-3">
                  <MapPin size={15} className="text-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-400 text-sm">{loc.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{loc.address}</p>
                  </div>
                </li>
              ))}
              
              {phoneNumber && (
                <li className="flex gap-3">
                  <Phone size={15} className="text-gold mt-0.5 shrink-0" />
                  <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="text-gray-400 text-sm hover:text-gold transition-colors">
                    {phoneNumber}
                  </a>
                </li>
              )}
              
              <li className="flex gap-3">
                <Clock size={15} className="text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">{locations?.[0]?.hours || 'Mon–Sat: 10am – 7pm'}</p>
                  <p className="text-gray-500 text-xs">Sun: By Appointment</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-charcoal-light flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} Dent-O-Facial. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <p className="text-gray-650">
              Designed for Dr. Hadi Raza &middot; Purnea &amp; Banmankhi, Bihar
            </p>
            <span>&middot;</span>
            <Link href="/admin" className="hover:text-gold transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
