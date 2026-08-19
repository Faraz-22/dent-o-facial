'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Star, Award, MapPin, Users } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'
import { useLanguage } from '@/components/providers/LanguageProvider'

export default function HeroSection() {
  const { data, isLoading } = useSiteContent()
  const hero = data?.hero as Record<string, any> | undefined
  const stats = (hero?.stats as Record<string, string>) || {}
  const heroImages = (data?.images as Record<string, any>)?.heroImages as string[] | undefined
  const testimonials = (data?.testimonials as any[]) || []

  // Dynamic calculations
  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((acc, curr) => acc + curr.rating, 0) / testimonials.length).toFixed(1)
    : stats.rating || '4.9'

  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    if (!heroImages || heroImages.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % heroImages.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [heroImages])

  const { language } = useLanguage()

  // Manual translations fallback
  const isHi = language === 'hi'
  const manualHeadline = isHi && hero?.heroHeadlineHi
  const manualSubHeadline = isHi && hero?.heroSubHeadlineHi

  const label = hero?.label || 'Premium Medical Care · Bihar'
  const headline = manualHeadline || hero?.headline || 'Luxury Dermatology & Dental Care'
  const subHeadline = manualSubHeadline || hero?.subHeadline || 'in Purnea'
  const description = hero?.description || 'Experience world-class skin and dental treatments with Dr. Hadi Raza. Advanced technology, personalized care, and transformative results — right here in Bihar.'

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-ivory">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cream to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gold/8 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-80 h-80 border border-gold/10 rounded-full" />
        <div className="absolute top-32 right-32 w-56 h-56 border border-gold/10 rounded-full" />
        <div className="absolute top-0 left-1/2 w-px h-32 bg-gradient-to-b from-transparent to-gold/20" />
      </div>

      <div className="absolute top-20 left-0 right-0 w-full overflow-hidden whitespace-nowrap border-y-2 border-gold/50 py-5 bg-gradient-to-r from-charcoal via-[#2A2A2A] to-charcoal shadow-2xl flex z-30">
        <div className="inline-flex animate-marquee shrink-0">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="text-2xl md:text-4xl lg:text-5xl tracking-[0.2em] font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-white to-gold-dark uppercase font-playfair mx-12 shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {label}
            </span>
          ))}
        </div>
        <div className="inline-flex animate-marquee shrink-0">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="text-2xl md:text-4xl lg:text-5xl tracking-[0.2em] font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-white to-gold-dark uppercase font-playfair mx-12 shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-40 pb-16 lg:pt-48">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">


            <h1 className={`font-playfair text-5xl lg:text-6xl xl:text-7xl text-charcoal leading-[1.1] mb-6 ${manualHeadline ? 'notranslate' : ''}`}>
              {headline.split(' ').slice(0, 1).join(' ')}{' '}
              <em className="italic text-gold-dark not-italic">{headline.split(' ').slice(1).join(' ')}</em>
              <br />
              <span className={`text-3xl lg:text-4xl font-normal text-charcoal-muted ${manualSubHeadline ? 'notranslate' : ''}`}>{subHeadline}</span>
            </h1>

            <p className="text-charcoal-muted text-lg leading-relaxed mb-10 max-w-lg font-inter font-light">
              {description}
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <a
                href={`https://wa.me/${(data?.cta as any)?.whatsappNumber || hero?.whatsappNumber || ''}?text=${encodeURIComponent(hero?.whatsappMessage || 'Hello, I want to book an appointment.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold px-8 py-4 rounded-full text-sm font-medium tracking-wide flex items-center gap-2"
              >
                Book Appointment
                <ArrowRight size={16} />
              </a>
              <Link
                href="/treatments"
                className="btn-outline px-8 py-4 rounded-full text-sm font-medium tracking-wide"
              >
                View Treatments
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-cream-dark">
              <div>
                <p className="font-playfair text-3xl text-charcoal font-semibold">{stats.patients || '500+'}</p>
                <p className="text-xs text-charcoal-muted tracking-wide mt-1">Happy Patients</p>
              </div>
              <div className="w-px h-12 bg-gold/20" />
              <div>
                <p className="font-playfair text-3xl text-charcoal font-semibold">{averageRating}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="text-gold fill-gold" />
                  ))}
                </div>
              </div>
              <div className="w-px h-12 bg-gold/20" />
              <div>
                <p className="font-playfair text-3xl text-charcoal font-semibold">{stats.locations || '2'}</p>
                <p className="text-xs text-charcoal-muted tracking-wide mt-1">Clinic Locations</p>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <div
                className="relative w-80 h-96 lg:w-96 lg:h-[480px] rounded-3xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #E8E3D8 0%, #D6B98C33 100%)' }}
              >
                {heroImages && heroImages.length > 0 ? (
                  heroImages.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt={`Hero Image ${i + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        i === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                    />
                  ))
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gold/20 flex items-center justify-center mb-4">
                      <Users size={48} className="text-gold" />
                    </div>
                    <p className="text-charcoal-muted text-sm font-inter">Doctor Photo</p>
                    <p className="text-charcoal-muted/60 text-xs mt-1">Replace in CMS</p>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-charcoal/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-playfair text-xl text-white font-medium">Dr. Hadi Raza</p>
                  <p className="text-gold-light text-xs tracking-wide mt-1">Dermatology & Dental Surgery</p>
                </div>
              </div>



              <div className="absolute -bottom-4 -left-4 w-24 h-24 border-l-2 border-b-2 border-gold/40 rounded-bl-3xl" />
              <div className="absolute -top-4 -right-4 w-24 h-24 border-r-2 border-t-2 border-gold/40 rounded-tr-3xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-charcoal-muted tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  )
}
