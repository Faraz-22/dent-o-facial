'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Zap, Sun, Smile, Star, Activity, ImageIcon } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

const iconMap: Record<string, React.ElementType> = {
  Sparkles, Zap, Sun, Smile, Star, Activity,
}

function TreatmentCard({ treatment, index }: { treatment: any; index: number }) {
  const Icon = iconMap[treatment.iconKey as keyof typeof iconMap] || Sparkles
  const images = treatment.images as string[] | undefined

  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    if (!images || images.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [images])

  return (
    <Link href={`/treatments/${treatment.id}`}>
      <div
        className="luxury-card rounded-2xl p-6 group cursor-pointer h-full flex flex-col"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="relative w-full h-48 rounded-xl overflow-hidden mb-5 bg-[#12122a] flex-shrink-0">
          {images && images.length > 0 ? (
            images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${treatment.name} ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  i === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              />
            ))
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
              <ImageIcon size={32} className="text-gray-400 mb-2" />
              <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">Treatment Image</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="treatment-tag">{treatment.category}</span>
          {treatment.tag && (
            <span className="text-xs text-gold-dark font-medium">{treatment.tag}</span>
          )}
        </div>

        <h3 className="font-playfair text-xl text-charcoal font-medium mb-3">
          {treatment.name}
        </h3>
        <p className="text-charcoal-muted text-sm leading-relaxed mb-6 flex-grow">
          {treatment.shortDesc}
        </p>

        <div className="flex items-center gap-2 text-gold-dark text-sm font-medium group-hover:gap-3 transition-all duration-300 mt-auto">
          <span>Learn More</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  )
}

export default function TreatmentsGrid() {
  const { data } = useSiteContent()
  const treatments = data?.treatments

  const allTreatments = [
    ...((treatments?.dermatology as Array<{ id: string; name: string; shortDesc: string; tag: string }>) || []).map(t => ({ ...t, category: 'Dermatology' })),
    ...((treatments?.dental as Array<{ id: string; name: string; shortDesc: string; tag: string }>) || []).map(t => ({ ...t, category: 'Dental' })),
  ]

  const gridTreatments = allTreatments.slice(0, 6)
  const defaultTreatments = [
    { id: 'acne-treatment', name: 'Acne Treatment', category: 'Dermatology', shortDesc: 'Advanced acne solutions including medical-grade facials, chemical peels, and laser therapy.', tag: 'Most Popular', iconKey: 'Sparkles' },
    { id: 'laser-therapy', name: 'Laser Therapy', category: 'Dermatology', shortDesc: 'State-of-the-art laser treatments for pigmentation, hair removal, and skin resurfacing.', tag: 'Advanced', iconKey: 'Zap' },
    { id: 'skin-rejuvenation', name: 'Skin Rejuvenation', category: 'Dermatology', shortDesc: "Restore your skin's natural glow with our premium rejuvenation protocols.", tag: '', iconKey: 'Sun' },
    { id: 'teeth-whitening', name: 'Teeth Whitening', category: 'Dental', shortDesc: 'Professional whitening treatments for a brighter, more confident smile.', tag: 'Popular', iconKey: 'Star' },
    { id: 'smile-design', name: 'Smile Design', category: 'Dental', shortDesc: 'Comprehensive smile makeovers combining aesthetics with function for your perfect smile.', tag: 'Signature', iconKey: 'Smile' },
    { id: 'dental-implants', name: 'Dental Implants', category: 'Dental', shortDesc: 'Permanent tooth replacement solutions that look, feel, and function like natural teeth.', tag: '', iconKey: 'Activity' },
  ]

  const displayTreatments = gridTreatments.length > 0 ? gridTreatments.map(t => ({
    ...t,
    iconKey: t.id.includes('acne') ? 'Sparkles' : t.id.includes('laser') ? 'Zap' : t.id.includes('rejuvenation') || t.id.includes('skin') ? 'Sun' : t.id.includes('whitening') ? 'Star' : t.id.includes('smile') ? 'Smile' : 'Activity',
    description: t.shortDesc,
  })) : defaultTreatments

  return (
    <section className="py-24 bg-ivory">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-gold" />
            <span className="section-label">Our Specialties</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h2 className="font-playfair text-4xl lg:text-5xl text-charcoal mb-4">
            Treatments We Offer
          </h2>
          <p className="text-charcoal-muted max-w-xl mx-auto leading-relaxed">
            From advanced dermatology to precision dental care, we bring premium treatments to Purnea and Banmankhi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTreatments.map((treatment, index) => (
            <TreatmentCard key={treatment.id} treatment={treatment} index={index} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/treatments" className="btn-outline px-8 py-3.5 rounded-full text-sm inline-block">
            View All Treatments
          </Link>
        </div>
      </div>
    </section>
  )
}
