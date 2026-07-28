'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'hi'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.treatments': 'Treatments',
    'nav.results': 'Results',
    'nav.testimonials': 'Testimonials',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.book': 'Book Appointment',
    'auth.signin': 'Sign In',
    'auth.create': 'Create Account',
    'auth.logout': 'Logout',
    'account.title': 'My Account',
    'account.dashboard': 'Patient Dashboard',
    'account.appointments': 'Appointments',
    'account.interests': 'Treatment Interests',
    'account.aftercare': 'Aftercare',
    'account.profile': 'Profile',
    'form.date': 'Preferred Date',
    'form.time': 'Preferred Time',
    'form.name': 'Name',
    'form.phone': 'Phone',
    'form.email': 'Email',
    'btn.submit': 'Submit',
    'btn.continue': 'Continue',
    'btn.call': 'Call Now',
  },
  hi: {
    'nav.home': 'होम',
    'nav.about': 'हमारे बारे में',
    'nav.treatments': 'उपचार',
    'nav.results': 'परिणाम',
    'nav.testimonials': 'प्रशंसापत्र',
    'nav.blog': 'ब्लॉग',
    'nav.contact': 'संपर्क करें',
    'nav.book': 'अपॉइंटमेंट बुक करें',
    'auth.signin': 'साइन इन करें',
    'auth.create': 'खाता बनाएँ',
    'auth.logout': 'लॉग आउट',
    'account.title': 'मेरा खाता',
    'account.dashboard': 'रोगी डैशबोर्ड',
    'account.appointments': 'अपॉइंटमेंट',
    'account.interests': 'उपचार रुचियाँ',
    'account.aftercare': 'देखभाल',
    'account.profile': 'प्रोफ़ाइल',
    'form.date': 'पसंदीदा तारीख',
    'form.time': 'पसंदीदा समय',
    'form.name': 'नाम',
    'form.phone': 'फ़ोन',
    'form.email': 'ईमेल',
    'btn.submit': 'जमा करें',
    'btn.continue': 'जारी रखें',
    'btn.call': 'अभी कॉल करें',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({})

  useEffect(() => {
    // Fetch dynamic overrides from site-content.json
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data && data.translations) {
          setDynamicTranslations(data.translations)
        }
      })
      .catch(() => {})

    const saved = localStorage.getItem('site_lang') as Language
    
    // Also check Google Translate cookie just in case
    const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/)
    const gtLang = match ? match[1] : null
    
    if (saved && (saved === 'en' || saved === 'hi')) {
      setLanguageState(saved)
    } else if (gtLang === '/en/hi') {
      setLanguageState('hi')
      localStorage.setItem('site_lang', 'hi')
    }
    
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('site_lang', lang)
    
    // Manage Google Translate cookie
    if (lang === 'hi') {
      document.cookie = 'googtrans=/en/hi; path=/;'
      document.cookie = 'googtrans=/en/hi; path=/; domain=' + window.location.hostname + ';'
    } else {
      document.cookie = 'googtrans=/en/en; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
      document.cookie = 'googtrans=/en/en; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    }
    
    // Reload to apply Google Translate changes cleanly
    window.location.reload()
  }

  const t = (key: string): string => {
    if (language === 'hi' && dynamicTranslations[key]) {
      return dynamicTranslations[key]
    }
    const dict = translations[language] as Record<string, string>
    return dict[key] || translations['en'][key as keyof typeof translations['en']] || key
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Return a dummy context if used outside provider during SSR
    return { language: 'en' as Language, setLanguage: () => {}, t: (k: string) => k }
  }
  return context
}
