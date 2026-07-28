import Script from 'next/script'
import type { Metadata } from 'next'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'
import { LanguageProvider } from '@/components/providers/LanguageProvider'

export const metadata: Metadata = {
  title: 'Dent-O-Facial | Luxury Dermatology & Dental Clinic in Purnea, Bihar',
  description: 'Expert dermatology and dental care by Dr. Hadi Raza in Purnea and Banmankhi, Bihar. Advanced skin treatments, smile design, and dental implants.',
  keywords: 'dermatologist in purnea, best dental clinic banmankhi, skin specialist bihar, teeth whitening purnea, acne treatment purnea',
  openGraph: {
    title: 'Dent-O-Facial | Luxury Dermatology & Dental Clinic',
    description: 'Premium skin and dental care in Purnea, Bihar',
    type: 'website',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">

      <body>
        <div id="google_translate_element"></div>
        <Script 
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" 
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'hi,en',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        <LanguageProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </LanguageProvider>
      </body>
    </html>
  )
}
