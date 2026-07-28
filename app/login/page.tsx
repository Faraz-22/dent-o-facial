'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/LanguageProvider'

type LoginResult = {
  role: 'admin' | 'user'
  name: string
} | null

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loginResult, setLoginResult] = useState<LoginResult>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()

  useEffect(() => {
    fetch('/api/auth/check', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          router.replace(data.role === 'admin' ? '/admin/dashboard' : '/account')
        } else {
          setCheckingAuth(false)
        }
      })
      .catch(() => { setCheckingAuth(false) })
  }, [router])

  // Automatic redirect effect
  useEffect(() => {
    if (loginResult) {
      const next = searchParams.get('next')
      const target = loginResult.role === 'admin' ? '/admin/dashboard' : (next?.startsWith('/') ? next : '/account')
      
      const timer = setTimeout(() => {
        router.push(target)
        router.refresh()
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [loginResult, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth'
      const payload = isRegister ? { name, email, password } : { email, password }
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setLoginResult({ role: data.role, name: data.name })
      } else {
        setError(data.error || 'Authentication failed. Please check your credentials.')
      }
    } catch {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  // Success state — role-based redirect options
  if (loginResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cream to-transparent opacity-60" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gold/8 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10 text-center">
          {/* Animated check icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 border-2 border-green-400 flex items-center justify-center animate-[scaleIn_0.3s_ease-out]">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-playfair text-2xl text-charcoal mb-2">
            Welcome, {loginResult.name}!
          </h1>
          <p className="text-charcoal-muted text-sm mb-8 font-inter font-light">
            {loginResult.role === 'admin'
              ? 'You are signed in as Administrator. Where would you like to go?'
              : 'You\'re signed in successfully. Explore our services and book your appointment.'}
          </p>

          {loginResult.role === 'admin' ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="w-full py-3.5 px-6 rounded-xl bg-charcoal hover:bg-charcoal/90 text-white font-medium text-sm tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Open Admin Portal
              </button>
              <button
                onClick={() => { router.push('/'); router.refresh(); }}
                className="w-full py-3.5 px-6 rounded-xl bg-gold hover:bg-gold-dark text-white font-medium text-sm tracking-wider uppercase transition shadow-md flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go to Landing Page
              </button>
            </div>
          ) : (
            <div className="w-full py-3.5 px-6 rounded-xl bg-gold text-white font-medium text-sm tracking-wider uppercase shadow-md opacity-80 cursor-default flex items-center justify-center gap-2">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirecting...
            </div>
          )}
        </div>
      </div>
    )
  }


  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory py-16 px-6 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cream to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gold/8 rounded-full blur-3xl" />
        <div className="absolute top-0 left-1/2 w-px h-32 bg-gradient-to-b from-transparent to-gold/20" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center leading-none">
            <span className="font-playfair text-3xl font-semibold text-charcoal tracking-wide mb-1">
              Dent-O-Facial
            </span>
            <span className="text-xs text-gold-dark tracking-[0.2em] uppercase font-inter font-semibold">
              Dr. Hadi Raza
            </span>
          </Link>
          <p className="text-charcoal-muted text-sm mt-4 font-inter font-light">
            {isRegister ? 'Join our luxury dermatology and dental family' : 'Sign in to access your appointments and records.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gold/15 rounded-3xl p-8 shadow-xl">
          {/* Tabs */}
          <div className="flex border-b border-cream-dark mb-6">
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 pb-3 text-sm font-medium tracking-wide border-b-2 transition-all ${
                !isRegister ? 'border-gold text-charcoal' : 'border-transparent text-charcoal-muted hover:text-charcoal'
              }`}
            >
              {t('auth.signin')}
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 pb-3 text-sm font-medium tracking-wide border-b-2 transition-all ${
                isRegister ? 'border-gold text-charcoal' : 'border-transparent text-charcoal-muted hover:text-charcoal'
              }`}
            >
              {t('auth.create')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-4 py-3 rounded-xl bg-ivory border border-gold/10 text-charcoal placeholder-charcoal-muted/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 rounded-xl bg-ivory border border-gold/10 text-charcoal placeholder-charcoal-muted/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-ivory border border-gold/10 text-charcoal placeholder-charcoal-muted/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition"
                required
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-inter">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 px-6 rounded-xl bg-charcoal hover:bg-black text-white font-medium text-sm tracking-widest uppercase transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : isRegister ? t('auth.create') : t('auth.signin')}
            </button>
          </form>
        </div>

        {/* Demo profiles help info */}
        <div className="mt-8 p-5 bg-cream/50 border border-gold/10 rounded-2xl text-center text-xs text-charcoal-muted leading-relaxed font-inter font-light">
          <p className="font-semibold text-charcoal mb-1">Demo Access Credentials</p>
          <div className="grid grid-cols-2 gap-3 mt-2 text-left">
            <div>
              <p className="text-gold-dark font-medium">Administrator</p>
              <p>Email: <code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">admin@dentofacial.com</code></p>
              <p>Pass: <code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">dentofacial2024</code></p>
            </div>
            <div>
              <p className="text-gold-dark font-medium">Demo Patient</p>
              <p>Email: <code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">priya@example.com</code></p>
              <p>Pass: <code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">patient123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
