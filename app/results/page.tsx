'use client'

import { useState } from 'react'
import CTASection from '@/components/sections/CTASection'
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider'
import { useSiteContent } from '@/hooks/useSiteContent'

type Category = 'all' | 'dermatology' | 'dental' | 'orthodontics' | 'facialTrauma'

interface Result {
  id: string
  label: string
  duration: string
  note: string
  category: 'dermatology' | 'dental' | 'orthodontics' | 'facialTrauma'
  beforeImage?: string
  afterImage?: string
}

export default function ResultsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const { data } = useSiteContent()
  const results = data?.results as { dermatology: Result[]; dental: Result[]; orthodontics?: Result[]; facialTrauma?: Result[] } | undefined

  const dermaResults = (results?.dermatology || []).map(r => ({ ...r, category: 'dermatology' as const }))
  const dentalResults = (results?.dental || []).map(r => ({ ...r, category: 'dental' as const }))
  const orthoResults = (results?.orthodontics || []).map(r => ({ ...r, category: 'orthodontics' as const }))
  const traumaResults = (results?.facialTrauma || []).map(r => ({ ...r, category: 'facialTrauma' as const }))

  const allResults: Result[] = [
    ...dermaResults,
    ...dentalResults,
    ...orthoResults,
    ...traumaResults,
  ]

  const filtered = activeCategory === 'all'
    ? allResults
    : allResults.filter(r => r.category === activeCategory)

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'dermatology', label: 'Dermatology' },
    { id: 'dental', label: 'Dental' },
    { id: 'orthodontics', label: 'Orthodontics' },
    { id: 'facialTrauma', label: 'Facial Trauma' }
  ]

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
          {/* Scrollable container for mobile */}
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2 sm:pb-0">
            {filterTabs.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id as Category)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeCategory === id
                    ? 'bg-charcoal text-ivory'
                    : 'border border-charcoal/20 text-charcoal-muted hover:border-gold hover:text-gold-dark'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-cream min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {filtered.length > 0 ? (
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
          ) : (
            <div className="text-center py-20 bg-white/50 rounded-3xl border border-gold/10">
              <p className="text-charcoal-muted text-lg font-medium">More results for this category will be uploaded soon.</p>
            </div>
          )}

          <p className="text-center text-charcoal-muted/60 text-xs mt-12 max-w-lg mx-auto">
            * All before and after images are from actual patients. Individual results may vary. Images shown with patient consent.
          </p>
        </div>
      </section>

      <CTASection />

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </>
  )
}
