'use client'

import { GraduationCap, Award, Heart, Stethoscope, Users, Star } from 'lucide-react'
import CTASection from '@/components/sections/CTASection'
import { useSiteContent } from '@/hooks/useSiteContent'

const iconMap: Record<string, React.ElementType> = { GraduationCap, Award, Heart, Stethoscope, Star, Users }

export default function AboutPage() {
  const { data } = useSiteContent()
  const doctor = data?.doctor as Record<string, unknown> | undefined

  const name = doctor?.name as string || 'Dr. Hadi Raza'
  const title = doctor?.title as string || 'Dermatology & Dental Surgery Specialist'
  const longBio = (doctor?.longBio as string) || ''
  const quote = doctor?.quote as string || ''
  const aboutCredentials = (doctor?.aboutCredentials as Array<{ icon: string; title: string; desc: string }>) || []
  const values = (doctor?.values as Array<{ icon: string; title: string; desc: string }>) || []

  const bioParagraphs = longBio.split('\n\n').filter(Boolean)

  return (
    <>
      <section className="pt-32 pb-20 bg-ivory relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-cream to-transparent opacity-70" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-gold" />
              <span className="section-label">About the Doctor</span>
            </div>
            <h1 className="font-playfair text-5xl lg:text-7xl text-charcoal leading-tight mb-6">
              {name.split(' ').slice(0, 1).join(' ')} <br />
              <span className="italic text-gold-dark">{name.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-charcoal-muted text-lg leading-relaxed max-w-xl">
              {title} serving Purnea and Banmankhi, Bihar.
              Committed to transforming lives through exceptional, personalized medical care.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="relative">
              <div
                className="rounded-3xl overflow-hidden relative"
                style={{ height: '560px', background: 'linear-gradient(135deg, #E8E3D8 0%, #D6B98C22 100%)' }}
              >
                {(data?.images as Record<string, string>)?.aboutImage ? (
                  <img
                    src={(data.images as Record<string, string>).aboutImage}
                    alt={name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-gold/20 flex items-center justify-center mb-4">
                      <Users size={48} className="text-gold" />
                    </div>
                    <p className="text-charcoal-muted text-sm">Doctor Portrait</p>
                    <p className="text-charcoal-muted/60 text-xs mt-1">Upload via Admin Panel</p>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-5 -right-5 w-32 h-32 border-r-2 border-b-2 border-gold/30 rounded-br-3xl" />
            </div>

            <div className="lg:pt-4">
              <span className="section-label mb-4 block">The Journey</span>
              <h2 className="font-playfair text-3xl lg:text-4xl text-charcoal mb-6">
                Why I Became a Doctor
              </h2>

              <div className="space-y-5 text-charcoal-muted leading-relaxed">
                {bioParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {quote && (
                <blockquote className="mt-8 pl-6 border-l-2 border-gold">
                  <p className="font-playfair text-lg text-charcoal italic">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <cite className="text-gold-dark text-sm font-medium mt-2 block not-italic">
                    — {name}
                  </cite>
                </blockquote>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label block mb-4">Qualifications</span>
            <h2 className="font-playfair text-3xl lg:text-4xl text-charcoal">
              Professional Credentials
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutCredentials.map(({ icon, title: credTitle, desc }) => {
              const Icon = iconMap[icon] || Award
              return (
                <div key={credTitle} className="luxury-card rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <Icon size={20} className="text-gold-dark" />
                  </div>
                  <h3 className="font-playfair text-lg text-charcoal font-medium mb-2">{credTitle}</h3>
                  <p className="text-charcoal-muted text-sm leading-relaxed">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-charcoal">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label text-gold/70 block mb-4">Our Foundation</span>
            <h2 className="font-playfair text-3xl lg:text-4xl text-ivory">
              Clinic Vision & Values
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map(({ icon, title: valTitle, desc }) => {
              const Icon = iconMap[icon] || Star
              return (
                <div key={valTitle} className="border border-charcoal-light rounded-2xl p-8 hover:border-gold/30 transition-colors duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-5">
                    <Icon size={20} className="text-gold" />
                  </div>
                  <h3 className="font-playfair text-xl text-ivory font-medium mb-3">{valTitle}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
