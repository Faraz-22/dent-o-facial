'use client'

import Link from 'next/link'
import { ArrowRight, Clock, CheckCircle2, ImageIcon } from 'lucide-react'
import CTASection from '@/components/sections/CTASection'
import { useSiteContent } from '@/hooks/useSiteContent'

interface Treatment {
  id: string
  name: string
  shortDesc: string
  duration: string
  benefits: string[]
  tag: string
  images?: string[]
}

function TreatmentCard({ treatment, category, whatsappNumber, whatsappMessage }: {
  treatment: Treatment; category: string; whatsappNumber: string; whatsappMessage: string
}) {
  const message = whatsappMessage
    ? whatsappMessage.replace('{treatment}', treatment.name)
    : `Hello, I am interested in ${treatment.name}. Please guide me.`

  const imageUrl = treatment.images?.[0]

  return (
    <div id={treatment.id} className="luxury-card rounded-3xl p-8 lg:p-10 scroll-mt-28 flex flex-col h-full">
      {/* Image Placeholder connected to slug page */}
      <Link href={`/treatments/${treatment.id}`} className="block relative w-full h-48 md:h-56 rounded-2xl overflow-hidden mb-6 bg-[#12122a] shrink-0 group">
         {imageUrl ? (
            <img src={imageUrl} alt={treatment.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
         ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors duration-500">
              <ImageIcon size={32} className="text-gray-400 mb-2" />
              <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">Treatment Image</span>
            </div>
         )}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <span className="treatment-tag mb-3 inline-block">{category}</span>
          <Link href={`/treatments/${treatment.id}`}>
            <h3 className="font-playfair text-2xl text-charcoal font-medium hover:text-gold transition-colors">{treatment.name}</h3>
          </Link>
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

      <p className="text-charcoal-muted leading-relaxed mb-6 flex-grow">{treatment.shortDesc}</p>

      <div className="grid grid-cols-2 gap-2 mb-8">
        {treatment.benefits.map((b) => (
          <div key={b} className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-gold shrink-0" />
            <span className="text-sm text-charcoal-muted">{b}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold px-6 py-3 rounded-full text-sm inline-flex items-center justify-center gap-2 w-full sm:w-auto flex-1"
        >
          Book Now <ArrowRight size={14} />
        </a>
        <Link href={`/treatments/${treatment.id}`} className="btn-outline px-6 py-3 rounded-full text-sm text-center w-full sm:w-auto flex-1">
          Learn More
        </Link>
      </div>
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
