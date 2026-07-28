'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/check', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => data.ok && data.role === 'admin' ? null : router.push('/admin'))
      .catch(() => router.push('/admin'))
  }, [router])

  return <>{children}</>
}
