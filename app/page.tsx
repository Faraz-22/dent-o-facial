import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import TreatmentsGrid from '@/components/sections/TreatmentsGrid'
import DoctorSection from '@/components/sections/DoctorSection'
import TestimonialsCarousel from '@/components/sections/TestimonialsCarousel'
import CTASection from '@/components/sections/CTASection'
import HighlightsSection from '@/components/sections/HighlightsSection'
import LocationSection from '@/components/sections/LocationSection'

export const metadata: Metadata = {
  title: 'Dent-O-Facial | Best Dermatologist & Dental Clinic in Purnea, Bihar',
  description: 'Dr. Hadi Raza offers luxury dermatology and dental treatments in Purnea and Banmankhi. Acne treatment, laser therapy, smile design, dental implants and more.',
  alternates: {
    canonical: 'https://dentofacial.in',
  },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HighlightsSection />
      <TreatmentsGrid />
      <DoctorSection />
      <TestimonialsCarousel />
      <LocationSection />
      <CTASection />
    </>
  )
}
