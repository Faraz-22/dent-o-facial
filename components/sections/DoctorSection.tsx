'use client'

import Link from 'next/link'
import { GraduationCap, Award, Heart, ArrowRight, Users } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

const iconMap: Record<string, React.ElementType> = { GraduationCap, Award, Heart }

export default function DoctorSection() {
  const { data } = useSiteContent()
  const doctor = data?.doctor as Record<string, unknown> | undefined

  const name = doctor?.name as string || 'Dr. Hadi Raza'
  const title = doctor?.title as string || 'Dermatology & Dental Surgery Specialist'
  const shortBio = doctor?.shortBio as string || 'Dr. Hadi Raza brings a rare combination of expertise in both dermatology and dental surgery, offering comprehensive facial aesthetic care under one roof.'
  const credentials = (doctor?.credentials as Array<{ icon: string; label: string }>) || [
    { icon: 'GraduationCap', label: 'MBBS — Certified Physician' },
    { icon: 'Award', label: 'Specialist in Dermatology & Aesthetics' },
    { icon: 'Award', label: 'Advanced Dental Surgery Training' },
    { icon: 'Heart', label: 'Patient-Centered Care Philosophy' },
  ]

  return (
    <section className="py-24 bg-charcoal relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div
              className="relative w-full max-w-md mx-auto rounded-3xl overflow-hidden"
              style={{ height: '520px', background: 'linear-gradient(135deg, #2A2A2A 0%, #3A3A3A 100%)' }}
            >
              {(data?.images as Record<string, string>)?.doctorImage ? (
                <img
                  src={(data.images as Record<string, string>).doctorImage}
                  alt={name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                    <Users size={44} className="text-gold" />
                  </div>
                  <p className="text-gray-400 text-sm">Doctor Portrait</p>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-r-2 border-b-2 border-gold/30 rounded-br-3xl" />
          </div>

          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-gold" />
              <span className="section-label text-gold/70">About the Doctor</span>
            </div>

            <h2 className="font-playfair text-4xl lg:text-5xl text-ivory mb-2">
              {name}
            </h2>
            <p className="text-gold text-sm tracking-widest uppercase mb-6 font-medium">
              {title}
            </p>

            <p className="text-gray-300 text-base leading-relaxed mb-4">
              {shortBio}
            </p>

            <div className="space-y-3 mb-10">
              {credentials.map((c) => {
                const Icon = iconMap[c.icon as keyof typeof iconMap] || Award
                return (
                  <div key={c.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-gold" />
                    </div>
                    <span className="text-gray-300 text-sm">{c.label}</span>
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
    </section>
  )
}
