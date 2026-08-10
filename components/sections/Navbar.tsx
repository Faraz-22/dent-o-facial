'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Phone, Globe, User } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'
import { useLanguage } from '@/components/providers/LanguageProvider'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/treatments', label: 'Treatments' },
  { href: '/results', label: 'Results' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

interface NavbarProps {
  isLoggedInAdmin?: boolean
  userSession?: { name: string } | null
  onLogout?: () => void
}

export default function Navbar({ 
  isLoggedInAdmin = false, 
  userSession = null,
  onLogout 
}: NavbarProps) {
  const { data } = useSiteContent()
  const cta = data?.cta as Record<string, unknown> | undefined
  const whatsappNumber = cta?.whatsappNumber as string || ''
  const whatsappMessage = cta?.whatsappMessage as string || 'Hello, I would like to book an appointment.'
  const phoneNumber = cta?.phoneNumber as string || ''
  const heroData = data?.hero as Record<string, unknown> | undefined
  const logoUrl = heroData?.logoUrl as string | undefined

  const { language, setLanguage, t } = useLanguage()

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
        isLoggedInAdmin ? (scrolled ? 'top-8 bg-ivory/95 backdrop-blur-md shadow-sm border-b border-gold/10' : 'top-8 bg-transparent') : (scrolled ? 'top-0 bg-ivory/95 backdrop-blur-md shadow-sm border-b border-gold/10' : 'top-0 bg-transparent')
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4">
            {logoUrl && (
              <img src={logoUrl} alt="Dent-O-Facial Logo" className="h-16 md:h-[4.5rem] w-auto object-contain" />
            )}
            <div className="flex flex-col justify-center pt-1">
              <span className="font-playfair text-2xl md:text-[1.6rem] font-bold text-charcoal tracking-wide mb-1 leading-none">
                Dent-O-Facial
              </span>
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="text-[8px] md:text-[9.5px] text-gold-dark tracking-[0.2em] uppercase font-inter font-bold leading-tight">
                  Dr. Hadi Raza
                </span>
                <span className="w-1 h-1 rounded-full bg-gold/50" />
                <span className="text-[8px] md:text-[9.5px] text-gold-dark tracking-[0.2em] uppercase font-inter font-bold leading-tight">
                  Dr. Nahid Raza
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-inter font-medium text-charcoal-light hover:text-gold-dark transition-colors duration-200 tracking-wide"
              >
                {t(`nav.${link.label.toLowerCase()}`)}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {phoneNumber && (
              <a
                href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gold/10 text-gold-dark hover:bg-gold hover:text-white transition-colors"
                aria-label="Call Dent-O-Facial"
                title={`Call ${phoneNumber}`}
              >
                <Phone size={14} />
              </a>
            )}
            {isLoggedInAdmin && (
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 border border-amber-600 text-amber-600 rounded-full text-xs font-semibold hover:bg-amber-600 hover:text-white transition duration-200"
              >
                Dashboard
              </Link>
            )}
            {userSession ? (
              <div className="flex items-center gap-3">
                <Link href="/account" className="flex items-center gap-1.5 text-xs font-semibold text-charcoal bg-gold/15 hover:bg-gold/25 transition px-3 py-1.5 rounded-full border border-gold/20">
                  <User size={12} className="text-gold-dark" />
                  {t('account.title')}
                </Link>
                <button
                  onClick={onLogout}
                  className="text-xs font-medium text-red-500 hover:text-red-700 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              !isLoggedInAdmin && (
                <Link
                  href="/login"
                  className="text-sm font-medium text-charcoal-muted hover:text-gold-dark transition-colors"
                >
                  Sign In
                </Link>
              )
            )}
            
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1 text-sm text-charcoal-muted hover:text-gold-dark transition"
              title="Toggle Language"
            >
              <Globe size={16} />
              <span className="font-semibold">{language.toUpperCase()}</span>
            </button>

            <Link
              href="/book"
              className="btn-gold px-5 py-2.5 text-sm rounded-full"
            >
              {t('nav.book')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-ivory border-t border-gold/10 px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-base font-medium text-charcoal py-2 border-b border-cream-dark"
            >
              {t(`nav.${link.label.toLowerCase()}`)}
            </Link>
          ))}
          {isLoggedInAdmin && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMenuOpen(false)}
              className="text-base font-semibold text-amber-600 py-2 border-b border-cream-dark"
            >
              Admin Dashboard
            </Link>
          )}
          {userSession ? (
            <div className="flex items-center justify-between py-2 border-b border-cream-dark">
              <Link href="/account" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-charcoal underline">
                Hi, {userSession.name}
              </Link>
              <button
                onClick={() => { setMenuOpen(false); onLogout?.(); }}
                className="text-sm font-medium text-red-500 hover:text-red-700 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            !isLoggedInAdmin && (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-base font-medium text-charcoal py-2 border-b border-cream-dark"
              >
                Sign In
              </Link>
            )
          )}
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => {
                setLanguage(language === 'en' ? 'hi' : 'en')
                setMenuOpen(false)
              }}
              className="flex items-center gap-2 text-sm text-charcoal font-medium"
            >
              <Globe size={16} />
              Switch to {language === 'en' ? 'Hindi' : 'English'}
            </button>
          </div>
          
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            className="btn-gold px-5 py-3 text-sm rounded-full text-center mt-2"
          >
            {t('nav.book')}
          </Link>
        </div>
      )}
    </header>
  )
}
