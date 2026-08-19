import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Sparkles, CheckCircle2 } from 'lucide-react'
import { getMergedContent } from '@/lib/content'

// Fetch statically during build or on demand
async function getTreatment(slug: string) {
  try {
    const data = await getMergedContent()
    const allTreatments = [
      ...(data.treatments?.dermatology || []),
      ...(data.treatments?.dental || []),
      ...(data.treatments?.orthodontics || []),
      ...(data.treatments?.facialTrauma || [])
    ]
    return (allTreatments as any[]).find(t => t.id === slug)
  } catch (err) {
    return null
  }
}

export default async function TreatmentDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const treatment = await getTreatment(params.slug)

  if (!treatment) {
    notFound()
  }

  const category = (treatment as any).category || 'Treatment'
  const benefits = treatment.benefits || []

  return (
    <div className="min-h-screen bg-ivory pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/treatments" className="inline-flex items-center gap-2 text-sm text-charcoal-muted hover:text-gold transition mb-8">
          <ArrowLeft size={16} />
          Back to Treatments
        </Link>
        
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-cream-dark">
          <div className="flex items-center gap-3 mb-6">
            <span className="treatment-tag bg-gold/10 text-gold-dark px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-widest">{category}</span>
            {treatment.tag && <span className="text-xs text-charcoal-muted">{treatment.tag}</span>}
          </div>
          
          <h1 className="font-playfair text-4xl md:text-5xl text-charcoal mb-6">{treatment.name}</h1>
          <p className="text-charcoal-muted text-lg leading-relaxed mb-8">{treatment.shortDesc}</p>
          
          {treatment.images && treatment.images.length > 0 && (
            <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-12 bg-[#fdfbf7] border border-[#f5efde] flex items-center justify-center">
              <img src={treatment.images[0]} alt={treatment.name} className="w-full h-full object-contain" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h2 className="font-playfair text-2xl text-charcoal mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-gold" />
                Key Benefits
              </h2>
              <ul className="space-y-3">
                {benefits.map((benefit: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-charcoal-muted">
                    <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-cream/30 p-8 rounded-2xl border border-cream h-fit">
              <h2 className="font-playfair text-xl text-charcoal mb-4 flex items-center gap-2">
                <Clock size={20} className="text-gold" />
                Treatment Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-charcoal-muted uppercase tracking-widest mb-1">Duration</p>
                  <p className="text-charcoal font-medium">{treatment.duration || 'Consult doctor for details'}</p>
                </div>
                {/* Fallbacks for future fields */}
                <div>
                  <p className="text-xs text-charcoal-muted uppercase tracking-widest mb-1">Recovery Time</p>
                  <p className="text-charcoal font-medium">{treatment.recovery || 'Minimal to no downtime'}</p>
                </div>
              </div>
              
              <div className="mt-8">
                <Link href="/book" className="w-full btn-gold py-4 rounded-xl text-sm font-medium tracking-wide flex justify-center text-center">
                  Book This Treatment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
