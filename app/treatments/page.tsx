'use client'

import { ArrowRight, Clock, CheckCircle2 } from 'lucide-react'
import CTASection from '@/components/sections/CTASection'
import { useSiteContent } from '@/hooks/useSiteContent'

interface Treatment {
  id: string
  name: string
  shortDesc: string
  duration: string
  benefits: string[]
  tag: string
}

function TreatmentCard({ treatment, category, whatsappNumber, whatsappMessage }: {
  treatment: Treatment; category: string; whatsappNumber: string; whatsappMessage: string
}) {
  const message = whatsappMessage
    ? whatsappMessage.replace('{treatment}', treatment.name)
    : `Hello, I am interested in ${treatment.name}. Please guide me.`

  return (
    <div id={treatment.id} className="luxury-card rounded-3xl p-8 lg:p-10 scroll-mt-28">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <span className="treatment-tag mb-3 inline-block">{category}</span>
          <h3 className="font-playfair text-2xl text-charcoal font-medium">{treatment.name}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          {treatment.tag && (
            <span className="text-xs text-gold-dark font-semibold bg-gold/10 px-3 py-1 rounded-full">{treatment.tag}</span>
          )}
          <div className="flex items-center gap-1.5 text-charcoal-muted text-xs">
            <Clock size={12} />
            <span>{treatment.duration}</span>
          </div>
        </div>
      </div>

      <p className="text-charcoal-muted leading-relaxed mb-6">{treatment.shortDesc}</p>

      <div className="grid grid-cols-2 gap-2 mb-8">
        {treatment.benefits.map((b) => (
          <div key={b} className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-gold shrink-0" />
            <span className="text-sm text-charcoal-muted">{b}</span>
          </div>
        ))}
      </div>

      <a
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-gold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2"
      >
        Book This Treatment <ArrowRight size={14} />
      </a>
    </div>
  )
}

export default function TreatmentsPage() {
  const { data } = useSiteContent()
  const treatments = data?.treatments as { dermatology: Treatment[]; dental: Treatment[] } | undefined
  const cta = data?.cta as Record<string, unknown> | undefined
  const whatsappNumber = (cta?.whatsappNumber as string) || (data?.hero as any)?.whatsappNumber || '916201231060'
  const whatsappMessage = (cta?.treatmentBookingMessage as string) || 'Hello, I am interested in {treatment}. Please guide me.'
  const dermatology = treatments?.dermatology || []
  const dental = treatments?.dental || []

  return (
    <>
      <section className="pt-32 pb-16 bg-ivory">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10 bg-gold" />
            <span className="section-label">What We Offer</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h1 className="font-playfair text-5xl lg:text-6xl text-charcoal mb-5">
            Our Treatments
          </h1>
          <p className="text-charcoal-muted text-lg max-w-xl mx-auto leading-relaxed">
            A comprehensive range of dermatology and dental procedures, each performed with precision and care by Dr. Hadi Raza.
          </p>
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-gold/20" />
            <h2 className="font-playfair text-3xl text-charcoal px-4">Dermatology</h2>
            <div className="h-px flex-1 bg-gold/20" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dermatology.map((t) => (
              <TreatmentCard key={t.id} treatment={t} category="Dermatology" whatsappNumber={whatsappNumber} whatsappMessage={whatsappMessage} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-ivory">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-gold/20" />
            <h2 className="font-playfair text-3xl text-charcoal px-4">Dental</h2>
            <div className="h-px flex-1 bg-gold/20" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dental.map((t) => (
              <TreatmentCard key={t.id} treatment={t} category="Dental" whatsappNumber={whatsappNumber} whatsappMessage={whatsappMessage} />
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
