'use client'

import { GraduationCap, Award, Heart, Stethoscope, Users, Star } from 'lucide-react'
import CTASection from '@/components/sections/CTASection'
import { useSiteContent } from '@/hooks/useSiteContent'

const iconMap: Record<string, React.ElementType> = { GraduationCap, Award, Heart, Stethoscope, Star, Users }

const defaultDoctors = [
  {
    id: 'hadi',
    name: 'Dr. Hadi Raza',
    title: 'Dermatology & Dental Surgery Specialist',
    longBio: 'Dr. Hadi Raza brings a rare combination of expertise in both dermatology and dental surgery, offering comprehensive facial aesthetic care under one roof.\n\nHis journey began with a passion for understanding the intricate relationship between facial aesthetics, dental health, and overall well-being. After completing rigorous training in both disciplines, he established this clinic to provide a holistic approach to patient care.\n\nToday, he is recognized for his meticulous attention to detail and his compassionate bedside manner.',
    quote: 'True aesthetics is the perfect balance of science, art, and empathy.',
    imageKey: 'aboutImage',
    aboutCredentials: [
      { icon: 'GraduationCap', title: 'Medical Degree', desc: 'MBBS from top medical university' },
      { icon: 'Award', title: 'Specialization', desc: 'Board certified in Dermatology' },
      { icon: 'Stethoscope', title: 'Dental Surgery', desc: 'Advanced training in implantology' },
      { icon: 'Heart', title: 'Experience', desc: 'Over 10 years of clinical practice' },
    ],
    values: [
      { icon: 'Heart', title: 'Patient-First', desc: 'Your comfort and goals are our priority.' },
      { icon: 'Award', title: 'Excellence', desc: 'State-of-the-art tech and methods.' },
      { icon: 'Users', title: 'Integrity', desc: 'Honest, transparent treatment plans.' },
    ]
  },
  {
    id: 'nahid',
    name: 'Dr. Nahid Raza',
    title: 'Senior Dental Surgeon',
    longBio: 'Dr. Nahid Raza is a highly skilled dental surgeon with a profound dedication to restorative and cosmetic dentistry.\n\nShe believes that a healthy smile is the foundation of confidence. Her expertise spans across advanced endodontics, cosmetic smile makeovers, and pediatric dental care.\n\nKnown for her gentle touch, Dr. Nahid ensures that even the most anxious patients feel completely at ease during their treatments.',
    quote: 'A beautiful smile is a universal language of kindness and confidence.',
    imageKey: 'aboutNahidImage',
    aboutCredentials: [
      { icon: 'GraduationCap', title: 'Dental Degree', desc: 'BDS with Honors' },
      { icon: 'Award', title: 'Cosmetic Dentistry', desc: 'Certified in advanced smile design' },
      { icon: 'Stethoscope', title: 'Endodontics', desc: 'Specialized in pain-free root canals' },
      { icon: 'Heart', title: 'Experience', desc: 'Over 8 years of clinical excellence' },
    ],
    values: [
      { icon: 'Heart', title: 'Compassion', desc: 'Gentle, anxiety-free dental care.' },
      { icon: 'Star', title: 'Precision', desc: 'Meticulous attention to dental aesthetics.' },
      { icon: 'Users', title: 'Family Care', desc: 'Dedicated to treating patients of all ages.' },
    ]
  }
]

export default function AboutPage() {
  const { data } = useSiteContent()
  const rawDoctors = data?.doctors as any[]
  
  // Fallback to single doctor data if array is not present, else default
  const doctors = rawDoctors && rawDoctors.length > 0 
    ? rawDoctors 
    : (data?.doctor ? [data.doctor, defaultDoctors[1]] : defaultDoctors)

  return (
    <>
      <section className="pt-32 pb-10 bg-ivory relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-cream to-transparent opacity-70" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-gold" />
              <span className="section-label">Our Specialists</span>
            </div>
            <h1 className="font-playfair text-5xl lg:text-7xl text-charcoal leading-tight mb-6">
              Meet the <br />
              <span className="italic text-gold-dark">Doctors</span>
            </h1>
            <p className="text-charcoal-muted text-lg leading-relaxed max-w-xl">
              Committed to transforming lives through exceptional, personalized medical and dental care.
            </p>
          </div>
        </div>
      </section>

      {doctors.map((doctor, index) => {
        const name = doctor.name || 'Doctor Name'
        const title = doctor.title || 'Specialist'
        const longBio = doctor.longBio || ''
        const quote = doctor.quote || ''
        const imageKey = doctor.imageKey || 'aboutImage'
        const imageUrl = (data?.images as Record<string, string>)?.[imageKey]
        const aboutCredentials = doctor.aboutCredentials || []
        const values = doctor.values || []
        const bioParagraphs = longBio.split('\n\n').filter(Boolean)
        const isEven = index % 2 === 0

        return (
          <div key={doctor.id || index} className="mb-20">
            {/* The Journey Section */}
            <section className={`py-16 ${isEven ? 'bg-cream' : 'bg-ivory'}`}>
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                  
                  {/* Image Column */}
                  <div className={`relative ${isEven ? 'order-1' : 'order-1 lg:order-2'}`}>
                    <div
                      className="rounded-3xl overflow-hidden relative"
                      style={{ height: '560px', background: 'linear-gradient(135deg, #E8E3D8 0%, #D6B98C22 100%)' }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="w-28 h-28 rounded-full bg-gold/20 flex items-center justify-center mb-4">
                            <Users size={48} className="text-gold" />
                          </div>
                          <p className="text-charcoal-muted text-sm">Portrait Missing</p>
                        </div>
                      )}
                    </div>
                    <div className={`absolute -bottom-5 w-32 h-32 border-b-2 border-gold/30 ${isEven ? '-right-5 border-r-2 rounded-br-3xl' : '-left-5 border-l-2 rounded-bl-3xl'}`} />
                  </div>

                  {/* Text Column */}
                  <div className={`lg:pt-4 ${isEven ? 'order-2' : 'order-2 lg:order-1'}`}>
                    <span className="section-label mb-4 block">{title}</span>
                    <h2 className="font-playfair text-3xl lg:text-5xl text-charcoal mb-6">
                      {name}
                    </h2>

                    <div className="space-y-5 text-charcoal-muted leading-relaxed">
                      {bioParagraphs.map((p: string, i: number) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>

                    {quote && (
                      <blockquote className="mt-8 pl-6 border-l-2 border-gold">
                        <p className="font-playfair text-lg text-charcoal italic">
                          &ldquo;{quote}&rdquo;
                        </p>
                      </blockquote>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Qualifications Section */}
            {aboutCredentials.length > 0 && (
              <section className={`py-16 ${isEven ? 'bg-ivory' : 'bg-cream'}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                  <div className="text-center mb-10">
                    <h3 className="font-playfair text-2xl lg:text-3xl text-charcoal">
                      Credentials & Expertise
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {aboutCredentials.map(({ icon, title: credTitle, desc }: any, idx: number) => {
                      const Icon = iconMap[icon] || Award
                      return (
                        <div key={idx} className="luxury-card rounded-2xl p-6 text-center bg-white/50 backdrop-blur-sm">
                          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                            <Icon size={20} className="text-gold-dark" />
                          </div>
                          <h4 className="font-playfair text-lg text-charcoal font-medium mb-2">{credTitle}</h4>
                          <p className="text-charcoal-muted text-sm leading-relaxed">{desc}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Values Section */}
            {values.length > 0 && (
              <section className="py-16 bg-charcoal text-ivory">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                  <div className="text-center mb-10">
                    <h3 className="font-playfair text-2xl lg:text-3xl">
                      Core Values
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {values.map(({ icon, title: valTitle, desc }: any, idx: number) => {
                      const Icon = iconMap[icon] || Star
                      return (
                        <div key={idx} className="border border-charcoal-light rounded-2xl p-8 hover:border-gold/30 transition-colors duration-300">
                          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-5">
                            <Icon size={20} className="text-gold" />
                          </div>
                          <h4 className="font-playfair text-xl font-medium mb-3">{valTitle}</h4>
                          <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )}
          </div>
        )
      })}

      <CTASection />
    </>
  )
}
