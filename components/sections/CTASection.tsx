'use client'

import { ArrowRight, Phone } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

export default function CTASection() {
  const { data } = useSiteContent()
  const cta = data?.cta as Record<string, unknown> | undefined

  const headline = cta?.headline as string || 'Book Your Consultation'
  const subHeadline = cta?.subHeadline as string || 'Take the first step toward your transformation. Consult with Dr. Hadi Raza and discover what premium dermatology and dental care can do for you.'
  const whatsappNumber = cta?.whatsappNumber as string || (data?.hero as any)?.whatsappNumber || ''
  const whatsappMessage = cta?.whatsappMessage as string || 'Hello, I would like to book a consultation with Dr. Hadi Raza.'
  const phoneNumber = cta?.phoneNumber as string || '+91 98765 43210'
  const trustIndicators = (cta?.trustIndicators as string[]) || ['Free Initial Consultation', 'Personalized Treatment Plans', 'EMI Available', '2 Clinic Locations']

  return (
    <section className="py-24 bg-charcoal relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-gold/5 rounded-full" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-10 bg-gold" />
          <span className="section-label text-gold/70">Take the First Step</span>
          <div className="h-px w-10 bg-gold" />
        </div>

        <h2 className="font-playfair text-4xl lg:text-6xl text-ivory mb-6 leading-[1.15]">
          {headline}
        </h2>

        <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          {subHeadline}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold px-10 py-4 rounded-full text-sm font-medium flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Book via WhatsApp
            <ArrowRight size={16} />
          </a>
          <a
            href={`tel:${phoneNumber.replace(/\s/g, '')}`}
            className="flex items-center gap-3 text-ivory border border-ivory/20 px-8 py-4 rounded-full text-sm font-medium hover:bg-ivory/5 transition-all duration-300 w-full sm:w-auto justify-center"
          >
            <Phone size={15} className="text-gold" />
            Call Now: {phoneNumber}
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 mt-14 pt-10 border-t border-charcoal-light">
          {trustIndicators.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="text-gray-400 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
