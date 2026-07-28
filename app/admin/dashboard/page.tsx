'use client'

import { Suspense } from 'react'
import AdminShell from '@/components/admin/AdminShell'

function LoadingShell() {
  return (
    <div className="flex h-screen bg-gray-950">
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Loading admin panel...</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <AdminShell />
    </Suspense>
  )
}
