'use client'

import { Shield, Microscope, Heart, LucideIcon } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'
import { useRef, useState } from 'react'

const defaultHighlights = [
  {
    icon: 'Microscope',
    title: 'Advanced Dermatology',
    description: 'Cutting-edge skin treatments using the latest medical technology for acne, pigmentation, laser therapy, and skin rejuvenation.',
    stat: '15+ Treatments',
  },
  {
    icon: 'Shield',
    title: 'Modern Dental Care',
    description: 'Comprehensive dental solutions from routine care to advanced smile design, implants, and cosmetic procedures.',
    stat: '10+ Procedures',
  },
  {
    icon: 'Heart',
    title: 'Personalized Approach',
    description: 'Every patient receives a tailored treatment plan designed specifically for their unique needs, goals, and skin or dental profile.',
    stat: '500+ Patients',
  },
]

const iconMap: Record<string, LucideIcon> = {
  Microscope,
  Shield,
  Heart,
}

export default function HighlightsSection() {
  const { data } = useSiteContent()
  const heroData = data?.hero as Record<string, any> | undefined
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Use CMS highlights if available and valid, otherwise fallback
  const rawHighlights = heroData?.highlights && Array.isArray(heroData.highlights) && heroData.highlights.length > 0
    ? heroData.highlights
    : defaultHighlights

  // Ensure exactly 3 items are rendered to keep the layout intact
  const highlights = rawHighlights.slice(0, 3)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const scrollLeft = scrollRef.current.scrollLeft
    const width = scrollRef.current.clientWidth
    const index = Math.round(scrollLeft / width)
    if (index !== activeIndex) {
      setActiveIndex(index)
    }
  }

  return (
    <section className="py-20 bg-cream relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Mobile: Swipable Flexbox | Desktop: Grid */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-3 md:gap-8 -mx-6 md:mx-0"
        >
          {highlights.map((h: any, idx: number) => {
            const Icon = iconMap[h.icon as string] || Heart
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center group min-w-full md:min-w-0 shrink-0 snap-center relative px-6 md:px-0"
              >
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-ivory border border-gold/20 flex items-center justify-center mb-5 group-hover:bg-gold/10 group-hover:border-gold/40 transition-all duration-300 shadow-sm">
                  <Icon size={26} className="text-gold-dark" />
                </div>

                {/* Stat */}
                <span className="treatment-tag mb-3">{h.stat}</span>

                {/* Title */}
                <h3 className="font-playfair text-xl text-charcoal font-medium mb-3">
                  {h.title}
                </h3>

                {/* Description */}
                <p className="text-charcoal-muted text-sm leading-relaxed px-4 md:px-0">
                  {h.description}
                </p>

                {/* Separator (not for last, only visible on desktop) */}
                {idx < highlights.length - 1 && (
                  <div className="hidden md:block absolute right-[-1rem] xl:right-[-2rem] top-1/2 -translate-y-1/2 w-px h-32 bg-gold/10" />
                )}
              </div>
            )
          })}
        </div>

        {/* Pagination Dots (Mobile Only) */}
        <div className="flex justify-center gap-2 mt-8 md:hidden">
          {highlights.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? 'bg-gold-dark w-4' : 'bg-gold/30 w-1.5'}`}
            />
          ))}
        </div>
      </div>
      
      {/* Hide scrollbar styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  )
}
