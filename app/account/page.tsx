'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, Clock, MapPin, Sparkles, LogOut, FileText, Phone, MessageCircle } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { useSiteContent } from '@/hooks/useSiteContent'

export default function PatientDashboard() {
  const { data } = useSiteContent()
  const cta = data?.cta as Record<string, unknown> | undefined
  const whatsappNumber = cta?.whatsappNumber as string || (data?.hero as any)?.whatsappNumber || '917488404161'
  const phoneNumber = cta?.phoneNumber as string || '+91 98765 43210'
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [aftercare, setAftercare] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    // Check auth
    fetch('/api/auth/check', { cache: 'no-store' })
      .then(res => res.json())
      .then(auth => {
        if (!auth.ok || auth.role !== 'user') {
          router.push('/login')
          return
        }
        setUser({ name: auth.name, email: auth.email, avatar: auth.avatar })
        
        // Fetch appointments & records matching this user's email
        return Promise.all([
          fetch('/api/appointments', { cache: 'no-store' }).then(r => r.json()),
          fetch(`/api/records?email=${auth.email}`, { cache: 'no-store' }).then(r => r.json()),
          fetch(`/api/aftercare?email=${auth.email}`, { cache: 'no-store' }).then(r => r.json())
        ]).then(([apptsData, recordsData, aftercareData]) => {
            const myAppts = apptsData.filter((a: any) => a.email === auth.email)
            setAppointments(myAppts)
            setRecords(recordsData)
            setAftercare(aftercareData.aftercare || '')
            setLoading(false)
          })
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }

  const handleAvatarUpload = async (file: File | undefined) => {
    if (!file) return
    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const result = await res.json()
      
      const updateRes = await fetch('/api/auth/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, avatar: result.url })
      })
      if (updateRes.ok) {
        setUser({ ...user, avatar: result.url })
      }
    } catch {
      alert('Failed to upload avatar.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-ivory pt-32 flex justify-center text-charcoal-muted">Loading dashboard...</div>
  }

  return (
    <div className="min-h-screen bg-ivory pt-32 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
          <div>
            <h1 className="font-playfair text-4xl text-charcoal mb-2">{t('account.dashboard')}</h1>
            <p className="text-charcoal-muted">Welcome back, {user.name}.</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-charcoal-muted hover:text-red-500 transition px-4 py-2 border border-cream rounded-full bg-white shadow-sm">
            <LogOut size={16} /> {t('auth.logout')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-cream-dark pb-4">
              <h2 className="font-playfair text-2xl text-charcoal">{t('account.appointments')}</h2>
              <Link href="/book" className="btn-outline px-4 py-2 rounded-full text-xs">{t('nav.book')}</Link>
            </div>

            {appointments.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center border border-cream shadow-sm">
                <Calendar size={32} className="text-cream-dark mx-auto mb-4" />
                <p className="text-charcoal-muted mb-4">You have no upcoming appointments.</p>
                <Link href="/book" className="btn-gold px-6 py-2 rounded-full text-sm">{t('nav.book')}</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map(appt => (
                  <div key={appt.id} className="bg-white p-6 rounded-2xl border border-cream shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition hover:shadow-md">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-semibold text-charcoal-muted uppercase tracking-widest block mb-1">Treatment</span>
                        <div className="flex items-center gap-2 text-charcoal font-medium">
                          <Sparkles size={16} className="text-gold" />
                          {appt.treatment}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-charcoal-muted uppercase tracking-widest block mb-1">Clinic</span>
                        <div className="flex items-center gap-2 text-charcoal font-medium">
                          <MapPin size={16} className="text-gold" />
                          {appt.clinic}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-charcoal-muted uppercase tracking-widest block mb-1">Date & Time</span>
                        <div className="flex items-center gap-4 text-charcoal font-medium">
                          <span className="flex items-center gap-1"><Calendar size={14} className="text-gold" /> {new Date(appt.preferredDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock size={14} className="text-gold" /> {appt.preferredTime.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        appt.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        appt.status === 'Visited' ? 'bg-gray-100 text-gray-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-b border-cream-dark pb-4 mt-12">
              <h2 className="font-playfair text-2xl text-charcoal">Medical Records & Prescriptions</h2>
            </div>
            
            {records.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center border border-cream shadow-sm">
                <FileText size={32} className="text-cream-dark mx-auto mb-4" />
                <p className="text-charcoal-muted">No medical records or prescriptions have been uploaded yet.</p>
                <p className="text-xs text-charcoal-muted/70 mt-2">Dr. Hadi Raza will upload your records here after your consultation.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map(record => (
                  <div key={record.id} className="bg-white p-6 rounded-2xl border border-cream shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition hover:shadow-md">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-semibold text-charcoal-muted uppercase tracking-widest block mb-1">Record Type</span>
                        <div className="flex items-center gap-2 text-charcoal font-medium capitalize">
                          <FileText size={16} className="text-gold" />
                          {record.type}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-charcoal-muted uppercase tracking-widest block mb-1">Date</span>
                        <div className="flex items-center gap-2 text-charcoal font-medium">
                          <Calendar size={16} className="text-gold" />
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </div>
                      {record.notes && (
                        <div className="sm:col-span-2">
                          <span className="text-xs font-semibold text-charcoal-muted uppercase tracking-widest block mb-1">Notes</span>
                          <p className="text-sm text-charcoal-muted">{record.notes}</p>
                        </div>
                      )}
                    </div>
                    <a href={`/api/records/${record.id}`} target="_blank" rel="noopener noreferrer" className="btn-outline px-6 py-2.5 rounded-full text-xs font-medium shrink-0 whitespace-nowrap">
                      View Document
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-cream shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <h3 className="font-playfair text-xl text-charcoal flex items-center gap-2">
                  <User size={18} className="text-gold" /> {t('account.profile')}
                </h3>
                <div className="flex flex-col items-center gap-2 relative group">
                  <div className="w-16 h-16 rounded-full bg-ivory border-2 border-gold/20 overflow-hidden flex items-center justify-center shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gold-dark font-bold text-xl">
                        {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <label className="text-[10px] font-bold text-gold uppercase tracking-wider cursor-pointer hover:text-gold-dark transition">
                    {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingAvatar} onChange={e => handleAvatarUpload(e.target.files?.[0])} />
                  </label>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-charcoal-muted block">{t('form.name')}</span>
                  <span className="font-medium text-charcoal">{user.name}</span>
                </div>
                <div>
                  <span className="text-charcoal-muted block">{t('form.email')}</span>
                  <span className="font-medium text-charcoal">{user.email}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-cream shadow-sm">
              <h3 className="font-playfair text-xl text-charcoal mb-4">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                <Link href="/book" className="flex items-center justify-between p-3 rounded-xl border border-cream hover:border-gold hover:bg-ivory transition group">
                  <span className="text-sm font-medium text-charcoal group-hover:text-gold-dark">{t('nav.book')}</span>
                  <Calendar size={16} className="text-gold" />
                </Link>
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl border border-cream hover:border-green-500 hover:bg-green-50 transition group">
                  <span className="text-sm font-medium text-charcoal group-hover:text-green-700">WhatsApp Clinic</span>
                  <MessageCircle size={16} className="text-green-500" />
                </a>
                <a href={`tel:${phoneNumber.replace(/\s/g, '')}`} className="flex items-center justify-between p-3 rounded-xl border border-cream hover:border-blue-500 hover:bg-blue-50 transition group">
                  <span className="text-sm font-medium text-charcoal group-hover:text-blue-700">{t('btn.call')}</span>
                  <Phone size={16} className="text-blue-500" />
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-cream shadow-sm">
              <h3 className="font-playfair text-xl text-charcoal mb-4 flex items-center gap-2">
                <FileText size={18} className="text-gold" /> {t('account.aftercare')}
              </h3>
              <p className="text-sm text-charcoal-muted leading-relaxed whitespace-pre-wrap">
                {aftercare || "Stay hydrated, avoid direct sun exposure immediately after skin treatments, and follow any specific guidelines provided by Dr. Hadi Raza."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
