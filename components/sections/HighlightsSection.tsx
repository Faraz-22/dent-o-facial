import { Shield, Microscope, Heart } from 'lucide-react'

const highlights = [
  {
    icon: Microscope,
    title: 'Advanced Dermatology',
    description: 'Cutting-edge skin treatments using the latest medical technology for acne, pigmentation, laser therapy, and skin rejuvenation.',
    stat: '15+ Treatments',
  },
  {
    icon: Shield,
    title: 'Modern Dental Care',
    description: 'Comprehensive dental solutions from routine care to advanced smile design, implants, and cosmetic procedures.',
    stat: '10+ Procedures',
  },
  {
    icon: Heart,
    title: 'Personalized Approach',
    description: 'Every patient receives a tailored treatment plan designed specifically for their unique needs, goals, and skin or dental profile.',
    stat: '500+ Patients',
  },
]

export default function HighlightsSection() {
  return (
    <section className="py-20 bg-cream relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((h, idx) => {
            const Icon = h.icon
            return (
              <div
                key={h.title}
                className="flex flex-col items-center text-center group"
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
                <p className="text-charcoal-muted text-sm leading-relaxed">
                  {h.description}
                </p>

                {/* Separator (not for last) */}
                {idx < highlights.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-32 bg-gold/10" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
