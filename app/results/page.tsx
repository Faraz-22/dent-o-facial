'use client'

import { useState } from 'react'
import CTASection from '@/components/sections/CTASection'
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider'
import { useSiteContent } from '@/hooks/useSiteContent'

type Category = 'all' | 'dermatology' | 'dental'

interface Result {
  id: string
  label: string
  duration: string
  note: string
  category: 'dermatology' | 'dental'
  beforeImage?: string
  afterImage?: string
}

export default function ResultsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const { data } = useSiteContent()
  const results = data?.results as { dermatology: Result[]; dental: Result[] } | undefined

  const dermaResults = (results?.dermatology || []).map(r => ({ ...r, category: 'dermatology' as const }))
  const dentalResults = (results?.dental || []).map(r => ({ ...r, category: 'dental' as const }))

  const allResults: Result[] = [
    ...dermaResults,
    ...dentalResults,
  ]

  const filtered = activeCategory === 'all'
    ? allResults
    : allResults.filter(r => r.category === activeCategory)

  return (
    <>
      <section className="pt-32 pb-16 bg-ivory">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10 bg-gold" />
            <span className="section-label">Transformations</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h1 className="font-playfair text-5xl lg:text-6xl text-charcoal mb-5">
            Patient Results
          </h1>
          <p className="text-charcoal-muted text-lg max-w-xl mx-auto leading-relaxed">
            Real results from real patients. Explore the transformations achieved at Dent-O-Facial under Dr. Hadi Raza&apos;s expert care.
          </p>
        </div>
      </section>

      <section className="pb-10 bg-ivory sticky top-20 z-30 border-b border-cream-dark">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {(['all', 'dermatology', 'dental'] as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-charcoal text-ivory'
                    : 'border border-charcoal/20 text-charcoal-muted hover:border-gold hover:text-gold-dark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((result) => (
              <div key={result.id} className="luxury-card rounded-3xl overflow-hidden">
                <BeforeAfterSlider
                  label={result.label}
                  category={result.category}
                  beforeImage={result.beforeImage}
                  afterImage={result.afterImage}
                />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-playfair text-lg text-charcoal font-medium">{result.label}</h3>
                      <p className="text-charcoal-muted text-sm mt-1">{result.note}</p>
                    </div>
                    <span className="treatment-tag">{result.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-charcoal-muted/60 text-xs mt-12 max-w-lg mx-auto">
            * All before and after images are from actual patients. Individual results may vary. Images shown with patient consent.
          </p>
        </div>
      </section>

      <CTASection />
    </>
  )
}
