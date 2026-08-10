'use client'

import { Star, Quote } from 'lucide-react'
import CTASection from '@/components/sections/CTASection'
import { useSiteContent } from '@/hooks/useSiteContent'

interface Testimonial {
  id: string
  name: string
  location: string
  treatment: string
  rating: number
  text: string
}

export default function TestimonialsPage() {
  const { data } = useSiteContent()
  const testimonials: Testimonial[] = data?.testimonials || []
  const heroStats = data?.hero?.stats || { patients: '500+', locations: '2' }

  // Dynamic calculations
  const totalReviews = testimonials.length > 0 ? `${testimonials.length}+` : '0'
  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((acc, curr) => acc + curr.rating, 0) / testimonials.length).toFixed(1)
    : '5.0'

  return (
    <>
      <section className="pt-32 pb-16 bg-ivory">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10 bg-gold" />
            <span className="section-label">Patient Stories</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h1 className="font-playfair text-5xl lg:text-6xl text-charcoal mb-5">
            Testimonials
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="text-gold fill-gold" />
            ))}
          </div>
          <p className="text-charcoal-muted text-lg max-w-xl mx-auto">
            Trusted by {heroStats.patients} patients across Purnea and Banmankhi. Here&apos;s what they say.
          </p>
        </div>
      </section>

      <section className="py-10 bg-charcoal">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: heroStats.patients, label: 'Happy Patients' },
              { value: averageRating, label: 'Average Rating' },
              { value: totalReviews, label: 'Reviews' },
              { value: heroStats.locations, label: 'Clinic Locations' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-playfair text-3xl text-gold font-semibold">{value}</p>
                <p className="text-gray-400 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="luxury-card rounded-3xl p-8 relative">
                <Quote size={36} className="text-gold/15 absolute top-6 right-6" />

                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-gold fill-gold" />
                  ))}
                </div>

                <p className="text-charcoal leading-relaxed mb-6 font-inter">{t.text}</p>

                <div className="flex items-center gap-3 pt-4 border-t border-cream-dark">
                  <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                    <span className="font-playfair text-gold font-semibold">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal text-sm">{t.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-charcoal-muted text-xs">{t.location}</span>
                      <span className="text-gold/40">·</span>
                      <span className="treatment-tag text-xs">{t.treatment}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label block mb-4">Video Testimonials</span>
            <h2 className="font-playfair text-3xl text-charcoal">Hear From Our Patients</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((v) => (
              <div key={v} className="luxury-card rounded-2xl overflow-hidden">
                <div className="h-48 bg-cream-dark flex items-center justify-center relative">
                  <div className="w-14 h-14 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[14px] border-transparent border-l-gold ml-1" />
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs text-charcoal-muted/60">Patient Video {v}</span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-charcoal-muted">Video testimonial — upload via Sanity CMS</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
