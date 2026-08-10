'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Award, Heart, ArrowRight, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

const iconMap: Record<string, React.ElementType> = { GraduationCap, Award, Heart }

const defaultDoctors = [
  {
    id: 'hadi',
    name: 'Dr. Hadi Raza',
    title: 'Dermatology & Dental Surgery Specialist',
    shortBio: 'Dr. Hadi Raza brings a rare combination of expertise in both dermatology and dental surgery, offering comprehensive facial aesthetic care under one roof.',
    imageKey: 'doctorImage',
    credentials: [
      { icon: 'GraduationCap', label: 'MBBS — Certified Physician' },
      { icon: 'Award', label: 'Specialist in Dermatology & Aesthetics' },
      { icon: 'Award', label: 'Advanced Dental Surgery Training' },
      { icon: 'Heart', label: 'Patient-Centered Care Philosophy' },
    ]
  },
  {
    id: 'nahid',
    name: 'Dr. Nahid Raza',
    title: 'Senior Dental Surgeon',
    shortBio: 'Dr. Nahid Raza specializes in advanced dental procedures, ensuring every patient leaves with a confident, beautiful smile and optimal oral health.',
    imageKey: 'doctorNahidImage',
    credentials: [
      { icon: 'GraduationCap', label: 'BDS — Certified Dental Surgeon' },
      { icon: 'Award', label: 'Specialist in Cosmetic Dentistry' },
      { icon: 'Award', label: 'Advanced Endodontics Training' },
      { icon: 'Heart', label: 'Compassionate Family Care' },
    ]
  }
]

export default function DoctorSection() {
  const { data } = useSiteContent()
  const [current, setCurrent] = useState(0)
  
  const rawDoctors = data?.doctors as any[]
  // Fallback to single doctor data if array is not present, else default
  const doctors = rawDoctors && rawDoctors.length > 0 
    ? rawDoctors 
    : (data?.doctor ? [data.doctor, defaultDoctors[1]] : defaultDoctors)

  const prev = () => setCurrent((c) => (c - 1 + doctors.length) % doctors.length)
  const next = () => setCurrent((c) => (c + 1) % doctors.length)

  return (
    <section className="py-24 bg-charcoal relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Carousel Controls */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-gold" />
            <span className="section-label text-gold/70">Meet Our Specialists</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-ivory hover:bg-gold hover:text-charcoal transition-all duration-300 relative z-20"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-ivory hover:bg-gold hover:text-charcoal transition-all duration-300 relative z-20"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="relative">
          {doctors.map((doctor, idx) => {
            const name = doctor?.name || 'Doctor Name'
            const title = doctor?.title || 'Specialist'
            const shortBio = doctor?.shortBio || ''
            const credentials = (doctor?.credentials as Array<{ icon: string; label: string }>) || []
            const imageKey = doctor?.imageKey || 'doctorImage'
            const imageUrl = (data?.images as Record<string, string>)?.[imageKey]

            return (
              <div 
                key={idx} 
                className={idx === current ? 'block animate-fade-in' : 'hidden'}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                  
                  {/* Desktop Image */}
                  <div className="relative hidden lg:block">
                    <div
                      className="relative w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl"
                      style={{ height: '520px', background: 'linear-gradient(135deg, #2A2A2A 0%, #3A3A3A 100%)' }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="w-28 h-28 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                            <Users size={44} className="text-gold" />
                          </div>
                          <p className="text-gray-400 text-sm">Portrait Missing</p>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 border-r-2 border-b-2 border-gold/30 rounded-br-3xl" />
                  </div>

                  {/* Content Column */}
                  <div>
                    <h2 className="font-playfair text-4xl lg:text-5xl text-ivory mb-2">
                      {name}
                    </h2>
                    <p className="text-gold text-sm tracking-widest uppercase mb-6 font-medium">
                      {title}
                    </p>

                    {/* Mobile Image */}
                    <div className="relative block lg:hidden mb-8">
                      <div
                        className="relative w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-xl"
                        style={{ height: '400px', background: 'linear-gradient(135deg, #2A2A2A 0%, #3A3A3A 100%)' }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                              <Users size={36} className="text-gold" />
                            </div>
                            <p className="text-gray-400 text-sm">Portrait Missing</p>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
                      </div>
                      <div className="absolute -bottom-4 right-2 w-24 h-24 border-r-2 border-b-2 border-gold/30 rounded-br-3xl" />
                    </div>

                    <p className="text-gray-300 text-base leading-relaxed mb-6">
                      {shortBio}
                    </p>

                    <div className="space-y-4 mb-10">
                      {credentials.map((c) => {
                        const Icon = iconMap[c.icon as keyof typeof iconMap] || Award
                        return (
                          <div key={c.label} className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                              <Icon size={14} className="text-gold" />
                            </div>
                            <span className="text-gray-300 text-sm font-medium">{c.label}</span>
                          </div>
                        )
                      })}
                    </div>

                    <Link
                      href="/about"
                      className="inline-flex items-center gap-2 btn-gold px-7 py-3.5 rounded-full text-sm"
                    >
                      Read Full Story <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
