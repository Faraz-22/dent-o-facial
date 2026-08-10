'use client'

import { useState } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

interface Testimonial {
  id: string
  name: string
  location: string
  treatment: string
  rating: number
  text: string
}

export default function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0)
  const { data } = useSiteContent()
  const testimonials: Testimonial[] = data?.testimonials || []

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  const next = () => setCurrent((c) => (c + 1) % testimonials.length)

  if (!testimonials.length) return null

  const totalReviews = testimonials.length > 0 ? `${testimonials.length}+` : '0'
  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((acc, curr) => acc + curr.rating, 0) / testimonials.length).toFixed(1)
    : '5.0'

  return (
    <section className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-gold" />
            <span className="section-label">Patient Stories</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h2 className="font-playfair text-4xl lg:text-5xl text-charcoal mb-4">
            What Our Patients Say
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} className="text-gold fill-gold" />
            ))}
            <span className="text-charcoal-muted text-sm ml-2">{averageRating} average · {totalReviews} reviews</span>
          </div>
        </div>

        <div className="relative">
          <div className="max-w-3xl mx-auto">
            {testimonials.map((t, idx) => (
              <div
                key={t.id}
                className={`transition-all duration-500 ${idx === current ? 'block' : 'hidden'}`}
              >
                <div className="luxury-card rounded-3xl p-10 lg:p-14 text-center relative">
                  <div className="absolute top-8 left-10">
                    <Quote size={40} className="text-gold/20" />
                  </div>

                  <div className="flex justify-center gap-1 mb-6">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-gold fill-gold" />
                    ))}
                  </div>

                  <p className="font-playfair text-xl lg:text-2xl text-charcoal leading-relaxed italic mb-8">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center mb-2">
                      <span className="font-playfair text-gold font-semibold text-sm">
                        {t.name.charAt(0)}
                      </span>
                    </div>
                    <p className="font-medium text-charcoal">{t.name}</p>
                    <p className="text-charcoal-muted text-sm">{t.location}</p>
                    <span className="treatment-tag mt-2">{t.treatment}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-charcoal hover:bg-gold hover:text-charcoal hover:border-gold transition-all duration-300"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === current ? 'w-8 bg-gold' : 'w-1.5 bg-gold/30'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-charcoal hover:bg-gold hover:text-charcoal hover:border-gold transition-all duration-300"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
