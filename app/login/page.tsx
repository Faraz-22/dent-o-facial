'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

type LoginResult = {
  role: 'admin' | 'staff' | 'user'
  name: string
} | null

import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-ivory"><div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div></div>}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset'>('login')
  const [showPassword, setShowPassword] = useState(false)
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
          router.replace((data.role === 'admin' || data.role === 'staff') ? '/admin/dashboard' : '/account')
        } else {
          setCheckingAuth(false)
        }
      })
      .catch(() => { setCheckingAuth(false) })
      
    // Check if we are in reset mode
    if (searchParams.get('reset')) {
      setView('reset')
      setCheckingAuth(false) // Bypass check auth to allow reset
    }
  }, [router, searchParams])

  // Automatic redirect effect
  useEffect(() => {
    if (loginResult) {
      const next = searchParams.get('next')
      const target = (loginResult.role === 'admin' || loginResult.role === 'staff') ? '/admin/dashboard' : (next?.startsWith('/') ? next : '/account')
      
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
      if (view === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (res.ok) {
          setError('If that email exists, we have sent a reset link to it. Please check your inbox.')
        } else {
          setError('Failed to process request.')
        }
        setLoading(false)
        return
      }

      if (view === 'reset') {
        const token = searchParams.get('reset')
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword: password }),
        })
        const data = await res.json()
        if (res.ok) {
          setError('Password reset successful! You can now log in.')
          setView('login')
          setPassword('')
        } else {
          setError(data.error || 'Failed to reset password.')
        }
        setLoading(false)
        return
      }

      const endpoint = view === 'register' ? '/api/auth/register' : '/api/auth'
      const payload = view === 'register' ? { name, email, password } : { email, password }
      
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
            {view === 'register' ? 'Join our luxury dermatology and dental family' : 
             view === 'forgot' ? 'Enter your email to receive a password reset link.' :
             view === 'reset' ? 'Enter your new password below.' :
             'Sign in to access your appointments and records.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gold/15 rounded-3xl p-8 shadow-xl">
          {/* Tabs */}
          {(view === 'login' || view === 'register') && (
            <div className="flex border-b border-cream-dark mb-6">
              <button
                onClick={() => { setView('login'); setError(''); }}
                className={`flex-1 pb-3 text-sm font-medium tracking-wide border-b-2 transition-all ${
                  view === 'login' ? 'border-gold text-charcoal' : 'border-transparent text-charcoal-muted hover:text-charcoal'
                }`}
              >
                {t('auth.signin')}
              </button>
              <button
                onClick={() => { setView('register'); setError(''); }}
                className={`flex-1 pb-3 text-sm font-medium tracking-wide border-b-2 transition-all ${
                  view === 'register' ? 'border-gold text-charcoal' : 'border-transparent text-charcoal-muted hover:text-charcoal'
                }`}
              >
                {t('auth.create')}
              </button>
            </div>
          )}
          {(view === 'forgot' || view === 'reset') && (
            <div className="flex border-b border-cream-dark mb-6">
              <div className="flex-1 pb-3 text-sm font-medium tracking-wide border-b-2 border-gold text-charcoal text-center">
                {view === 'forgot' ? 'Reset Password' : 'Set New Password'}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'register' && (
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

            {view !== 'reset' && (
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
            )}

            {view !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider">
                    {view === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {view === 'login' && (
                    <button type="button" onClick={() => { setView('forgot'); setError(''); }} className="text-xs text-gold-dark hover:text-gold transition">
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-ivory border border-gold/10 text-charcoal placeholder-charcoal-muted/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-sm transition pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

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
              {loading ? 'Processing...' : 
               view === 'register' ? t('auth.create') : 
               view === 'forgot' ? 'Send Reset Link' :
               view === 'reset' ? 'Update Password' :
               t('auth.signin')}
            </button>
            
            {view === 'forgot' && (
              <button
                type="button"
                onClick={() => { setView('login'); setError(''); }}
                className="w-full mt-3 py-3.5 px-6 rounded-xl border border-gray-200 hover:bg-gray-50 text-charcoal font-medium text-sm tracking-widest uppercase transition"
              >
                Back to Login
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
