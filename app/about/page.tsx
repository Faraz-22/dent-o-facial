'use client'

import { useRef, useState } from 'react'
import { GraduationCap, Award, Heart, Stethoscope, Users, Star, Quote } from 'lucide-react'
import CTASection from '@/components/sections/CTASection'
import { useSiteContent } from '@/hooks/useSiteContent'

const iconMap: Record<string, React.ElementType> = { GraduationCap, Award, Heart, Stethoscope, Star, Users }

// ---------------------------
// Credentials Carousel Component
// ---------------------------
function CredentialsCarousel({ credentials }: { credentials: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const scrollLeft = scrollRef.current.scrollLeft
    const width = scrollRef.current.clientWidth
    const index = Math.round(scrollLeft / width)
    if (index !== activeIndex) setActiveIndex(index)
  }

  return (
    <section className="py-24 relative overflow-hidden bg-charcoal text-ivory">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="section-label text-gold/70 block mb-3">Expertise</span>
          <h3 className="font-playfair text-3xl lg:text-5xl">
            Credentials & Specializations
          </h3>
        </div>
        
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex lg:grid overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none hide-scrollbar gap-6 pb-4 lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid-cols-4"
        >
          {credentials.map(({ icon, title: credTitle, desc }: any, idx: number) => {
            const Icon = iconMap[icon] || Award
            return (
              <div 
                key={idx} 
                className="w-full shrink-0 snap-center lg:w-auto group relative bg-white/5 backdrop-blur-md rounded-[2rem] p-8 text-center border border-white/5 hover:bg-white/10 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(214,185,140,0.15)] hover:border-gold/30 transition-all duration-500"
              >
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-gold transition-all duration-500">
                  <Icon size={24} className="text-gold group-hover:text-charcoal transition-colors duration-500" />
                </div>
                <h4 className="font-playfair text-xl font-medium mb-3 group-hover:text-gold transition-colors duration-300">{credTitle}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            )
          })}
        </div>

        {/* Pagination Dots (Mobile Only) */}
        <div className="flex justify-center gap-2 mt-8 lg:hidden">
          {credentials.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? 'bg-gold-dark w-4' : 'bg-gold/30 w-1.5'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------
// Clinic Values Carousel Component
// ---------------------------
function ValuesCarousel({ values }: { values: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const scrollLeft = scrollRef.current.scrollLeft
    const width = scrollRef.current.clientWidth
    const index = Math.round(scrollLeft / width)
    if (index !== activeIndex) setActiveIndex(index)
  }

  return (
    <section className="py-24 relative overflow-hidden bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="section-label block mb-3">Our Core Foundation</span>
          <h3 className="font-playfair text-3xl lg:text-5xl text-charcoal">
            Clinic Values
          </h3>
        </div>
        
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex lg:grid overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none hide-scrollbar gap-6 lg:gap-8 pb-4 lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid-cols-3"
        >
          {values.map(({ icon, title: valTitle, desc }: any, idx: number) => {
            const Icon = iconMap[icon] || Star
            return (
              <div 
                key={idx} 
                className="w-full shrink-0 snap-center lg:w-auto group bg-white rounded-[2.5rem] p-10 shadow-lg hover:shadow-2xl border border-transparent hover:border-gold/30 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                
                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mb-6 relative z-10 group-hover:rotate-[10deg] transition-transform duration-300">
                  <Icon size={24} className="text-gold-dark" />
                </div>
                <h4 className="font-playfair text-2xl text-charcoal font-semibold mb-4 relative z-10">{valTitle}</h4>
                <p className="text-charcoal-muted text-base leading-relaxed relative z-10">{desc}</p>
              </div>
            )
          })}
        </div>

        {/* Pagination Dots (Mobile Only) */}
        <div className="flex justify-center gap-2 mt-8 lg:hidden">
          {values.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? 'bg-gold-dark w-4' : 'bg-gold/30 w-1.5'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

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
      {/* Hero Section */}
      <section className="pt-40 pb-24 bg-ivory relative overflow-hidden">
        {/* Luxury Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cream to-transparent opacity-80" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-gold/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in-up" style={{ animationDuration: '1.2s' }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-10 bg-gold" />
              <span className="section-label text-charcoal-muted tracking-[0.3em]">OUR SPECIALISTS</span>
              <div className="h-px w-10 bg-gold" />
            </div>
            <h1 className="font-playfair text-5xl lg:text-7xl text-charcoal leading-tight mb-6">
              Meet the <span className="italic text-gold-dark">Doctors</span>
            </h1>
            <p className="text-charcoal-muted text-lg leading-relaxed max-w-xl mx-auto">
              Committed to transforming lives through exceptional, personalized medical and dental care. Experience the perfect blend of science and art.
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
        const bioParagraphs = longBio.split('\n\n').filter(Boolean)
        const isEven = index % 2 === 0

        return (
          <div key={doctor.id || index} className="mb-0">
            {/* The Journey Section */}
            <section className={`py-24 relative overflow-hidden ${isEven ? 'bg-ivory' : 'bg-cream'}`}>
              {/* Subtle background flourishes */}
              {!isEven && <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />}
              {isEven && <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />}

              <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-0 items-center">
                  
                  {/* Desktop Image Box - Asymmetrical overlapping left side */}
                  <div className={`hidden lg:block w-5/12 relative z-10 ${isEven ? 'order-1 -mr-16' : 'order-2 -ml-16'}`}>
                    <div
                      className="relative rounded-[2rem] overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.02]"
                      style={{ height: '600px', background: 'linear-gradient(135deg, #E8E3D8 0%, #D6B98C22 100%)' }}
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
                          <p className="text-charcoal-muted text-sm font-medium">Portrait Missing</p>
                        </div>
                      )}
                      
                      {/* Inner gold glow */}
                      <div className="absolute inset-0 border-[1px] border-gold/20 rounded-[2rem] pointer-events-none" />
                    </div>
                  </div>

                  {/* Text Content Box */}
                  <div className={`w-full lg:w-8/12 bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 lg:p-16 shadow-xl border border-white/50 relative z-20 ${isEven ? 'order-2' : 'order-1'}`}>
                    
                    <h2 className="font-playfair text-4xl lg:text-6xl text-charcoal mb-2 leading-tight">
                      {name}
                    </h2>
                    <span className="text-gold-dark text-xs font-bold tracking-[0.2em] uppercase mb-8 block">
                      {title}
                    </span>

                    {/* Mobile Image (renders specifically below Title/Name as requested) */}
                    <div className="relative block lg:hidden mb-10">
                      <div
                        className="relative w-full rounded-3xl overflow-hidden shadow-xl"
                        style={{ height: '400px', background: 'linear-gradient(135deg, #E8E3D8 0%, #D6B98C22 100%)' }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-gold/20 flex items-center justify-center mb-4">
                              <Users size={36} className="text-gold" />
                            </div>
                            <p className="text-charcoal-muted text-sm font-medium">Portrait Missing</p>
                          </div>
                        )}
                        <div className="absolute inset-0 border border-gold/10 rounded-3xl pointer-events-none" />
                      </div>
                    </div>

                    {/* Bio Text */}
                    <div className="space-y-6 text-charcoal-muted text-lg leading-relaxed font-light">
                      {bioParagraphs.map((p: string, i: number) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>

                    {quote && (
                      <div className="mt-10 pt-8 border-t border-gold/20 relative">
                        <Quote className="absolute top-4 left-0 text-gold/20" size={40} />
                        <p className="font-playfair text-xl text-charcoal italic pl-8 pr-4">
                          &ldquo;{quote}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Qualifications Section */}
            {aboutCredentials.length > 0 && <CredentialsCarousel credentials={aboutCredentials} />}
          </div>
        )
      })}

      {/* Global Clinic Values Section */}
      {doctors[0]?.values && doctors[0].values.length > 0 && (
        <ValuesCarousel values={doctors[0].values} />
      )}

      <CTASection />
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </>
  )
}
