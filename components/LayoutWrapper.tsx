'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'
import FloatingButtons from '@/components/ui/FloatingButtons'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdminPath = pathname?.startsWith('/admin')
  
  const [session, setSession] = useState<{ isLoggedIn: boolean; role: 'admin' | 'user' | null; name: string | null }>({
    isLoggedIn: false,
    role: null,
    name: null
  })

  useEffect(() => {
    if (isAdminPath) return
    fetch('/api/auth/check', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setSession({ isLoggedIn: true, role: data.role, name: data.name })
        } else {
          setSession({ isLoggedIn: false, role: null, name: null })
        }
      })
      .catch(() => setSession({ isLoggedIn: false, role: null, name: null }))
  }, [pathname, isAdminPath])

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    setSession({ isLoggedIn: false, role: null, name: null })
    router.refresh()
    window.location.reload()
  }

  if (isAdminPath) {
    return <main>{children}</main>
  }

  const showAdminBanner = session.isLoggedIn && session.role === 'admin'

  return (
    <>
      {showAdminBanner && (
        <div className="bg-amber-600 text-white text-xs px-6 h-8 flex items-center justify-between font-inter tracking-wide sticky top-0 z-[60] shadow-md select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-medium">Admin Session Active</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="underline hover:text-amber-200 transition font-semibold">
              Go to Admin Dashboard
            </Link>
            <span className="text-white/40">|</span>
            <button onClick={handleLogout} className="underline hover:text-red-200 transition font-medium">
              Logout
            </button>
          </div>
        </div>
      )}
      <Navbar 
        isLoggedInAdmin={showAdminBanner} 
        userSession={session.isLoggedIn && session.role === 'user' ? { name: session.name || '' } : null} 
        onLogout={handleLogout}
      />
      <main>{children}</main>
      <Footer />
      <FloatingButtons />
    </>
  )
}
