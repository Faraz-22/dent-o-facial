'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Globe, LayoutDashboard, MessageSquare, Stethoscope, MapPin,
  FileText, User, Users, Bell, LogOut, ChevronRight,
  Eye, Star, Settings, Save, CheckCircle, RefreshCw,
  Check, X, ExternalLink, Plus, Trash2, ChevronLeft, Mail, Clock,
  ImageIcon, BarChart3, TrendingUp, Activity, MousePointerClick, Calendar
} from 'lucide-react'

import { AppointmentsEditor } from './AppointmentsEditor'
import { LeadsEditor } from './LeadsEditor'
import { NotificationsViewer } from './NotificationsViewer'
import { PatientsCRM } from './PatientsCRM'
import { compressImage } from '@/lib/imageUtils'

// ─── Section metadata ─────────────────────────────────────────────────────────
const SECTIONS = [
  { key: 'dashboard',    label: 'Dashboard',       href: '/admin/dashboard',                icon: LayoutDashboard },
  { key: 'hero',        label: 'Hero Section',    href: '/admin/dashboard?section=hero',   icon: Eye },
  { key: 'testimonials',label: 'Testimonials',     href: '/admin/dashboard?section=testimonials', icon: MessageSquare },
  { key: 'treatments',  label: 'Treatments',       href: '/admin/dashboard?section=treatments', icon: Stethoscope },
  { key: 'doctor',      label: 'Doctor Info',      href: '/admin/dashboard?section=doctor',  icon: User },
  { key: 'locations',   label: 'Locations',       href: '/admin/dashboard?section=locations', icon: MapPin },
  { key: 'blog',        label: 'Blog Posts',        href: '/admin/dashboard?section=blog',   icon: FileText },
  { key: 'faq',         label: 'FAQs',              href: '/admin/dashboard?section=faq',     icon: Bell },
  { key: 'cta',         label: 'CTA & Contact',     href: '/admin/dashboard?section=cta',    icon: Settings },
  { key: 'results',     label: 'Results Gallery',   href: '/admin/dashboard?section=results', icon: Star },
  { key: 'images',      label: 'Image Manager',     href: '/admin/dashboard?section=images',  icon: ImageIcon },
  { key: 'users',       label: 'Registered Users',  href: '/admin/dashboard?section=users',   icon: Users },
  { key: 'patient-records', label: 'Patient Records', href: '/admin/dashboard?section=patient-records', icon: FileText },
  { key: 'appointments',label: 'Appointments',      href: '/admin/dashboard?section=appointments', icon: Calendar },
  { key: 'leads',       label: 'Leads CRM',         href: '/admin/dashboard?section=leads',   icon: Users },
  { key: 'notifications',label: 'Notifications',    href: '/admin/dashboard?section=notifications', icon: Bell },
  { key: 'analytics',   label: 'Analytics',          href: '/admin/dashboard?section=analytics', icon: BarChart3 },
]

const SECTION_DESC: Record<string, string> = {
  hero:        'Homepage headline, tagline, description, and stats',
  testimonials: 'Patient reviews on homepage and testimonials page',
  treatments:  'All dermatology and dental procedures',
  doctor:      'Doctor bio, credentials, and about page content',
  locations:   'Clinic addresses, phone numbers, hours, and Google Maps',
  blog:        'Health articles — titles, excerpts, categories',
  faq:         'Frequently asked questions on the contact page',
  cta:         'Call-to-action buttons, WhatsApp number, and phone',
  results:     'Before/after gallery items for the results page',
  users:       'All patients who have created an account on the website',
  'patient-records': 'Upload and manage medical records & prescriptions',
  images:      'Manage hero, doctor, about, and blog images via URL',
  analytics:   'User onboarding trends, treatment interest, and site engagement',
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Treatment { id: string; name: string; shortDesc: string; duration: string; benefits: string[]; tag: string; images?: string[] }
interface Testimonial { id: string; name: string; location: string; treatment: string; rating: number; text: string }
interface BlogPost { slug: string; title: string; excerpt: string; category: string; date: string; readTime: string; featured: boolean; imageUrl?: string }
interface Location { id: string; name: string; address: string; phone: string; hours: string; hoursDetail: string; mapUrl: string; primary: boolean }
interface Faq { id: string; q: string; a: string }
interface ResultsItem { id: string; label: string; duration: string; note: string; beforeImage?: string; afterImage?: string }
interface ResultsData { dermatology: ResultsItem[]; dental: ResultsItem[] }

// ─── Input ───────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, multiline, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          rows={3} className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-gray-700 text-white placeholder-gray-600
            focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none text-sm transition" />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-gray-700 text-white placeholder-gray-600
            focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition" />
      )}
    </div>
  )
}

// ─── Section Editors ─────────────────────────────────────────────────────────

function TestimonialsEditor({ data, onChange }: { data: Testimonial[]; onChange: (v: Testimonial[]) => void }) {
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPending = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/testimonials')
        const all = await res.json()
        if (Array.isArray(all)) {
          setPending(all.filter(t => t.status === 'Pending'))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchPending()
  }, [])

  const moderate = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch('/api/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      if (res.ok) {
        setPending(prev => prev.filter(t => t.id !== id))
        if (status === 'Approved') {
          // If approved, trigger a refetch of the main content so it shows in the live list below
          // The easiest way is to let the user refresh, or we can fetch it manually, 
          // but they can also see it on the live site.
          alert('Testimonial Approved and published to live site!')
        }
      }
    } catch (e) {
      alert('Failed to moderate testimonial')
    }
  }

  if (!Array.isArray(data)) return <p className="text-gray-500 text-sm p-4">No data.</p>
  const update = (id: string, field: keyof Testimonial, value: string | number) =>
    onChange(data.map(t => t.id === id ? { ...t, [field]: value } : t))
  return (
    <div className="space-y-8">
      {/* Pending Moderation Queue */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Pending User Reviews ({pending.length})
          </h3>
          {pending.map((t) => (
            <div key={t.id} className="p-5 rounded-2xl bg-[#2a1b1b] border border-red-900/30 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-white">{t.patientName}</p>
                  <p className="text-xs text-gray-400">{t.email} • {t.treatment || 'General'}</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-300 italic">"{t.review}"</p>
              <div className="flex gap-3 pt-3 border-t border-gray-800">
                <button onClick={() => moderate(t.id, 'Approved')} className="text-xs font-semibold bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition">Approve & Publish</button>
                <button onClick={() => moderate(t.id, 'Rejected')} className="text-xs font-semibold bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Testimonials */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Live Testimonials</h3>
      {data.map((t, i) => (
        <div key={t.id} className="p-5 rounded-2xl bg-[#1a1a2e] border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 bg-amber-900/30 px-3 py-1 rounded-full">#{i + 1}</span>
            <button onClick={() => onChange(data.filter(x => x.id !== t.id))} className="text-gray-500 hover:text-red-400 transition">
              <Trash2 size={15} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Name" value={t.name} onChange={v => update(t.id, 'name', v)} placeholder="Patient name" />
            <Field label="Location" value={t.location} onChange={v => update(t.id, 'location', v)} placeholder="City" />
            <Field label="Treatment" value={t.treatment} onChange={v => update(t.id, 'treatment', v)} placeholder="Treatment" />
          </div>
          <Field label="Testimonial Text" value={t.text} onChange={v => update(t.id, 'text', v)} multiline placeholder="What the patient said..." />
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Rating:</span>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => update(t.id, 'rating', n)} className="hover:scale-110 transition">
                <Star size={20} className={n <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'} />
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...data, { id: Date.now().toString(), name: '', location: '', treatment: '', rating: 5, text: '' }])}
        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:text-white hover:border-gray-500 transition text-sm w-full justify-center">
        <Plus size={14} /> Add Manual Testimonial
      </button>
      </div>
    </div>
  )
}

function TreatmentsEditor({ data, onChange }: { data: { dermatology: Treatment[]; dental: Treatment[] }; onChange: (v: typeof data) => void }) {
  if (!data) return <p className="text-gray-500 text-sm p-4">No data.</p>
  const CategoryList = ({ cat, items }: { cat: 'dermatology' | 'dental'; items: Treatment[] }) => {
    const update = (id: string, field: keyof Treatment, value: any) =>
      onChange({ ...data, [cat]: items.map(t => t.id === id ? { ...t, [field]: value } : t) })
    const remove = (id: string) => onChange({ ...data, [cat]: items.filter(t => t.id !== id) })
    const addBenefit = (id: string, idx: number, val: string) =>
      onChange({ ...data, [cat]: items.map(t => t.id === id ? { ...t, benefits: t.benefits.map((b, i) => i === idx ? val : b) } : t) })
    
    const [uploading, setUploading] = useState<string | null>(null)
    const onFileChange = async (id: string, file: File | undefined) => {
      if (!file) return
      setUploading(id)
      try {
        const compressedFile = await compressImage(file)
        const formData = new FormData()
        formData.append('file', compressedFile)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!res.ok) throw new Error('Upload failed')
        const result = await res.json()
        const t = items.find(t => t.id === id)
        const currentImages = t?.images || []
        update(id, 'images', [...currentImages, result.url])
      } catch {
        alert('Failed to upload image.')
      } finally {
        setUploading(null)
      }
    }
    const removeImage = (id: string, idx: number) => {
      const t = items.find(t => t.id === id)
      if (t) update(id, 'images', (t.images || []).filter((_, i) => i !== idx))
    }
    return (
      <div className="space-y-3">
        <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${cat === 'dermatology' ? 'bg-blue-900/50 text-blue-300' : 'bg-green-900/50 text-green-300'}`}>
          {cat === 'dermatology' ? 'Dermatology' : 'Dental'}
        </span>
        {(items || []).map((t) => (
          <div key={t.id} className="p-5 rounded-2xl bg-[#1a1a2e] border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">{t.name || 'New Treatment'}</span>
              <button onClick={() => remove(t.id)} className="text-gray-500 hover:text-red-400 transition"><Trash2 size={14} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Name" value={t.name} onChange={v => update(t.id, 'name', v)} placeholder="Treatment name" />
              <Field label="Duration" value={t.duration} onChange={v => update(t.id, 'duration', v)} placeholder="e.g. 4–8 weeks" />
            </div>
            <Field label="Short Description" value={t.shortDesc} onChange={v => update(t.id, 'shortDesc', v)} multiline />
            <Field label="Tag (optional)" value={t.tag} onChange={v => update(t.id, 'tag', v)} placeholder="e.g. Most Popular" />
            <div>
              <span className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Benefits (4)</span>
              <div className="grid grid-cols-2 gap-2">
                {(t.benefits || []).map((b, idx) => (
                  <input key={idx} value={b} onChange={e => addBenefit(t.id, idx, e.target.value)}
                    placeholder={`Benefit ${idx + 1}`}
                    className="px-3 py-2 rounded-lg bg-[#12122a] border border-gray-700 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500 transition" />
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-gray-800">
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Treatment Images</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => onFileChange(t.id, e.target.files?.[0])}
                disabled={uploading === t.id}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-900/30 file:text-amber-400 hover:file:bg-amber-900/50 transition cursor-pointer"
              />
              {uploading === t.id && <span className="text-xs text-amber-500 mt-2 block animate-pulse">Uploading...</span>}
              
              {t.images && t.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                  {t.images.map((url, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-700 aspect-square">
                      <img src={url} alt={`Treatment ${i + 1}`} className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(t.id, i)} className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center text-red-400 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <button onClick={() => onChange({ ...data, [cat]: [...(items || []), { id: Date.now().toString(), name: '', shortDesc: '', duration: '', benefits: ['', '', '', ''], tag: '' }] })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:text-white hover:border-gray-500 transition text-sm w-full justify-center">
          <Plus size={13} /> Add Treatment
        </button>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <CategoryList cat="dermatology" items={data.dermatology} />
      <CategoryList cat="dental" items={data.dental} />
    </div>
  )
}

function LocationsEditor({ data, onChange }: { data: Location[]; onChange: (v: Location[]) => void }) {
  if (!Array.isArray(data)) return <p className="text-gray-500 text-sm p-4">No data.</p>
  const update = (id: string, field: keyof Location, value: unknown) =>
    onChange(data.map(l => l.id === id ? { ...l, [field]: value } : l))
  return (
    <div className="space-y-4">
      {data.map((loc, i) => (
        <div key={loc.id} className="p-5 rounded-2xl bg-[#1a1a2e] border border-gray-800 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-bold text-amber-400 bg-amber-900/30 px-3 py-1 rounded-full">{loc.name}</span>
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input type="checkbox" checked={!!loc.primary} onChange={e => update(loc.id, 'primary', e.target.checked)}
                className="w-4 h-4 rounded bg-[#12122a] border-gray-700 text-amber-500 focus:ring-amber-500" />
              Primary
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Clinic Name" value={loc.name} onChange={v => update(loc.id, 'name', v)} />
            <Field label="Phone" value={loc.phone} onChange={v => update(loc.id, 'phone', v)} />
            <Field label="Address" value={loc.address} onChange={v => update(loc.id, 'address', v)} />
            <Field label="Hours (short)" value={loc.hours} onChange={v => update(loc.id, 'hours', v)} />
          </div>
          <Field label="Hours (detailed)" value={loc.hoursDetail} onChange={v => update(loc.id, 'hoursDetail', v)} multiline />
          <Field label="Google Maps Embed URL" value={loc.mapUrl} onChange={v => update(loc.id, 'mapUrl', v)} multiline />
        </div>
      ))}
    </div>
  )
}

function BlogEditor({ data, onChange }: { data: BlogPost[]; onChange: (v: BlogPost[]) => void }) {
  const [uploading, setUploading] = useState<string | null>(null)

  if (!Array.isArray(data)) return <p className="text-gray-500 text-sm p-4">No data.</p>
  const update = (slug: string, field: keyof BlogPost, value: string | boolean) =>
    onChange(data.map(p => p.slug === slug ? { ...p, [field]: value } : p))

  const onFileChange = async (slug: string, file: File | undefined) => {
    if (!file) return
    setUploading(slug)
    try {
      const compressedFile = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressedFile)
      
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const result = await res.json()
      update(slug, 'imageUrl', result.url)
    } catch {
      alert('Failed to upload image.')
    } finally {
      setUploading(null)
    }
  }
  return (
    <div className="space-y-4">
      {data.map((post) => (
        <div key={post.slug} className="p-5 rounded-2xl bg-[#1a1a2e] border border-gray-800 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${post.category === 'Dermatology' ? 'bg-blue-900/50 text-blue-300' : 'bg-green-900/50 text-green-300'}`}>{post.category}</span>
              {post.featured && <span className="text-xs font-bold text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded-full">Featured</span>}
            </div>
            <button onClick={() => onChange(data.filter(p => p.slug !== post.slug))} className="text-gray-500 hover:text-red-400 transition"><Trash2 size={15} /></button>
          </div>
          <Field label="Slug" value={post.slug} onChange={v => update(post.slug, 'slug', v)} placeholder="url-slug" />
          <Field label="Title" value={post.title} onChange={v => update(post.slug, 'title', v)} placeholder="Blog title" />
          <Field label="Excerpt" value={post.excerpt} onChange={v => update(post.slug, 'excerpt', v)} multiline />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" value={post.category} onChange={v => update(post.slug, 'category', v)} />
            <Field label="Read Time" value={post.readTime} onChange={v => update(post.slug, 'readTime', v)} />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Cover Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => onFileChange(post.slug, e.target.files?.[0])}
              disabled={uploading === post.slug}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-900/30 file:text-amber-400 hover:file:bg-amber-900/50 transition cursor-pointer"
            />
            {uploading === post.slug && <span className="text-xs text-amber-500 block animate-pulse">Uploading...</span>}
            {post.imageUrl && (
              <div className="mt-2 flex items-center gap-4">
                <img src={post.imageUrl} alt="Cover preview" className="h-12 w-16 object-cover rounded-lg border border-gray-700" />
                <button onClick={() => update(post.slug, 'imageUrl', '')} className="text-xs text-gray-500 hover:text-red-400 transition flex items-center gap-1">
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={!!post.featured} onChange={e => update(post.slug, 'featured', e.target.checked)}
              className="w-4 h-4 rounded bg-[#12122a] border-gray-700 text-amber-500 focus:ring-amber-500" />
            Featured post
          </label>
        </div>
      ))}
      <button onClick={() => onChange([...data, { slug: `post-${Date.now()}`, title: '', excerpt: '', category: 'Dermatology', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), readTime: '5 min read', featured: false, imageUrl: '' }])}
        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:text-white hover:border-gray-500 transition text-sm w-full justify-center">
        <Plus size={14} /> Add Blog Post
      </button>
    </div>
  )
}

function FaqEditor({ data, onChange }: { data: Faq[]; onChange: (v: Faq[]) => void }) {
  if (!Array.isArray(data)) return <p className="text-gray-500 text-sm p-4">No data.</p>
  const update = (id: string, field: keyof Faq, value: string) =>
    onChange(data.map(f => f.id === id ? { ...f, [field]: value } : f))
  return (
    <div className="space-y-4">
      {data.map((faq, i) => (
        <div key={faq.id} className="p-5 rounded-2xl bg-[#1a1a2e] border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">#{i + 1}</span>
            <button onClick={() => onChange(data.filter(f => f.id !== faq.id))} className="text-gray-500 hover:text-red-400 transition"><Trash2 size={15} /></button>
          </div>
          <Field label="Question" value={faq.q} onChange={v => update(faq.id, 'q', v)} placeholder="Enter question..." />
          <Field label="Answer" value={faq.a} onChange={v => update(faq.id, 'a', v)} multiline placeholder="Enter answer..." />
        </div>
      ))}
      <button onClick={() => onChange([...data, { id: Date.now().toString(), q: '', a: '' }])}
        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:text-white hover:border-gray-500 transition text-sm w-full justify-center">
        <Plus size={14} /> Add FAQ
      </button>
    </div>
  )
}

function HeroEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) {
  const [uploading, setUploading] = useState(false)
  if (!data) return <p className="text-gray-500 text-sm p-4">No data.</p>
  const set = (key: string, value: unknown) => onChange({ ...data, [key]: value })
  const stats = (data.stats as Record<string, string>) || {}
  
  const handleLogoUpload = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const compressedFile = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressedFile)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const result = await res.json()
      set('logoUrl', result.url)
    } catch {
      alert('Failed to upload logo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-[#1a1a2e] border border-gray-800">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Brand Logo (Top Left Corner)</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => handleLogoUpload(e.target.files?.[0])}
          disabled={uploading}
          className="w-full text-sm text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-900/30 file:text-amber-400 hover:file:bg-amber-900/50 transition cursor-pointer"
        />
        {uploading && <span className="text-xs text-amber-500 mt-2 block animate-pulse">Uploading logo...</span>}
        {data.logoUrl && (
          <div className="mt-3 flex items-center gap-4">
            <img src={data.logoUrl as string} alt="Logo preview" className="h-10 object-contain bg-white rounded p-1" />
            <button onClick={() => set('logoUrl', '')} className="text-xs text-gray-500 hover:text-red-400 transition flex items-center gap-1">
              Remove Logo
            </button>
          </div>
        )}
      </div>
      <Field label="Top Label" value={data.label as string || ''} onChange={v => set('label', v)} />
      <Field label="Headline" value={data.headline as string || ''} onChange={v => set('headline', v)} />
      <Field label="Sub-Headline" value={data.subHeadline as string || ''} onChange={v => set('subHeadline', v)} />
      <Field label="Description" value={data.description as string || ''} onChange={v => set('description', v)} multiline />
      <div className="grid grid-cols-3 gap-3">
        <Field label="Patients" value={stats.patients || ''} onChange={v => set('stats', { ...stats, patients: v })} />
        <Field label="Rating" value={stats.rating || ''} onChange={v => set('stats', { ...stats, rating: v })} />
        <Field label="Locations" value={stats.locations || ''} onChange={v => set('stats', { ...stats, locations: v })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="WhatsApp Number" value={data.whatsappNumber as string || ''} onChange={v => set('whatsappNumber', v)} />
        <Field label="WhatsApp Message" value={data.whatsappMessage as string || ''} onChange={v => set('whatsappMessage', v)} />
      </div>
    </div>
  )
}

function DoctorEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) {
  if (!data) return <p className="text-gray-500 text-sm p-4">No data.</p>
  const set = (key: string, value: unknown) => onChange({ ...data, [key]: value })
  const creds = (data.credentials as Array<{icon:string;label:string}>) || []
  const aboutCreds = (data.aboutCredentials as Array<{icon:string;title:string;desc:string}>) || []
  const values = (data.values as Array<{icon:string;title:string;desc:string}>) || []
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Basic Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Full Name" value={data.name as string || ''} onChange={v => set('name', v)} />
          <Field label="Title / Specialty" value={data.title as string || ''} onChange={v => set('title', v)} />
        </div>
        <Field label="Short Bio" value={data.shortBio as string || ''} onChange={v => set('shortBio', v)} multiline />
        <Field label="Long Bio" value={data.longBio as string || ''} onChange={v => set('longBio', v)} multiline />
        <Field label="Quote" value={data.quote as string || ''} onChange={v => set('quote', v)} multiline />
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Homepage Credentials ({creds.length})</h3>
        {creds.map((c, i) => (
          <div key={i} className="flex gap-2">
            <input value={c.icon} onChange={e => { const u=[...creds]; u[i]={...u[i],icon:e.target.value}; set('credentials',u) }}
              placeholder="Icon" className="w-32 px-3 py-2 rounded-lg bg-[#1a1a2e] border border-gray-700 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500" />
            <input value={c.label} onChange={e => { const u=[...creds]; u[i]={...u[i],label:e.target.value}; set('credentials',u) }}
              placeholder="Label" className="flex-1 px-3 py-2 rounded-lg bg-[#1a1a2e] border border-gray-700 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">About Credentials ({aboutCreds.length})</h3>
        {aboutCreds.map((c, i) => (
          <div key={i} className="p-4 rounded-xl bg-[#1a1a2e] border border-gray-800 space-y-2">
            <div className="flex gap-2">
              <input value={c.icon} onChange={e => { const u=[...aboutCreds]; u[i]={...u[i],icon:e.target.value}; set('aboutCredentials',u) }}
                placeholder="Icon" className="w-32 px-3 py-2 rounded-lg bg-[#12122a] border border-gray-700 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500" />
              <input value={c.title} onChange={e => { const u=[...aboutCreds]; u[i]={...u[i],title:e.target.value}; set('aboutCredentials',u) }}
                placeholder="Title" className="flex-1 px-3 py-2 rounded-lg bg-[#12122a] border border-gray-700 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500" />
            </div>
            <input value={c.desc} onChange={e => { const u=[...aboutCreds]; u[i]={...u[i],desc:e.target.value}; set('aboutCredentials',u) }}
              placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-[#12122a] border border-gray-700 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clinic Values ({values.length})</h3>
        {values.map((v, i) => (
          <div key={i} className="p-4 rounded-xl bg-[#1a1a2e] border border-gray-800 space-y-2">
            <div className="flex gap-2">
              <input value={v.icon} onChange={e => { const u=[...values]; u[i]={...u[i],icon:e.target.value}; set('values',u) }}
                placeholder="Icon" className="w-32 px-3 py-2 rounded-lg bg-[#12122a] border border-gray-700 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500" />
              <input value={v.title} onChange={e => { const u=[...values]; u[i]={...u[i],title:e.target.value}; set('values',u) }}
                placeholder="Title" className="flex-1 px-3 py-2 rounded-lg bg-[#12122a] border border-gray-700 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500" />
            </div>
            <textarea value={v.desc} onChange={e => { const u=[...values]; u[i]={...u[i],desc:e.target.value}; set('values',u) }}
              rows={2} placeholder="Description"
              className="w-full px-3 py-2 rounded-lg bg-[#12122a] border border-gray-700 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500 resize-none" />
          </div>
        ))}
      </div>
    </div>
  )
}

function CtaEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) {
  if (!data) return <p className="text-gray-500 text-sm p-4">No data.</p>
  const set = (key: string, value: unknown) => onChange({ ...data, [key]: value })
  const indicators = (data.trustIndicators as string[]) || []
  return (
    <div className="space-y-5">
      <Field label="Headline" value={data.headline as string || ''} onChange={v => set('headline', v)} />
      <Field label="Sub-headline" value={data.subHeadline as string || ''} onChange={v => set('subHeadline', v)} multiline />
      <div className="grid grid-cols-2 gap-3">
        <Field label="WhatsApp Number" value={data.whatsappNumber as string || ''} onChange={v => set('whatsappNumber', v)} />
        <Field label="Phone Number" value={data.phoneNumber as string || ''} onChange={v => set('phoneNumber', v)} />
      </div>
      <Field label="WhatsApp Message" value={data.whatsappMessage as string || ''} onChange={v => set('whatsappMessage', v)} multiline />
      <div className="p-4 rounded-xl bg-[#12122a] border border-gray-800 space-y-3">
        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Treatment Booking</h4>
        <p className="text-xs text-gray-500">This message is used when patients click &quot;Book This Treatment&quot; on any treatment card. Use <code className="text-amber-400 bg-gray-800 px-1 py-0.5 rounded">{'{treatment}'}</code> as a placeholder — it will be replaced with the treatment name.</p>
        <Field label="Treatment Booking Message" value={data.treatmentBookingMessage as string || ''} onChange={v => set('treatmentBookingMessage', v)} multiline placeholder="Hello, I am interested in {treatment}. Please guide me." />
      </div>
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Trust Indicators ({indicators.length})</h3>
        {indicators.map((t, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input value={t} onChange={e => { const u=[...indicators]; u[i]=e.target.value; set('trustIndicators',u) }}
              className="flex-1 px-3 py-2 rounded-lg bg-[#1a1a2e] border border-gray-700 text-white text-sm focus:outline-none focus:border-amber-500" />
          </div>
        ))}
      </div>
    </div>
  )
}

const CategoryList = ({ 
  cat, 
  items, 
  data, 
  onChange 
}: { 
  cat: 'dermatology' | 'dental'; 
  items: ResultsItem[];
  data: ResultsData;
  onChange: (v: ResultsData) => void;
}) => {
  const [uploading, setUploading] = useState<{ id: string; side: 'before' | 'after' } | null>(null)
  
  const update = (id: string, field: keyof ResultsItem, value: any) =>
    onChange({ ...data, [cat]: items.map(t => t.id === id ? { ...t, [field]: value } : t) })

  const onFileChange = async (id: string, side: 'before' | 'after', file: File | undefined) => {
    if (!file) return
    setUploading({ id, side })
    try {
      const compressedFile = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressedFile)
      
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const result = await res.json()
      update(id, side === 'before' ? 'beforeImage' : 'afterImage', result.url)
    } catch {
      alert('Failed to upload image.')
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-3">
      <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${cat === 'dermatology' ? 'bg-blue-900/50 text-blue-300' : 'bg-green-900/50 text-green-300'}`}>
        {cat === 'dermatology' ? 'Dermatology' : 'Dental'}
      </span>
      {(items || []).map((r) => (
        <div key={r.id} className="p-4 rounded-xl bg-[#1a1a2e] border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">{r.label || 'New Result'}</span>
            <button onClick={() => onChange({ ...data, [cat]: items.filter(t => t.id !== r.id) })}
              className="text-gray-500 hover:text-red-400 transition"><Trash2 size={14} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Label" value={r.label} onChange={v => update(r.id, 'label', v)} />
            <Field label="Duration" value={r.duration} onChange={v => update(r.id, 'duration', v)} />
            <Field label="Note" value={r.note} onChange={v => update(r.id, 'note', v)} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-800">
            {/* Before Image */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Before Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => onFileChange(r.id, 'before', e.target.files?.[0])}
                disabled={uploading?.id === r.id && uploading.side === 'before'}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-900/30 file:text-amber-400 hover:file:bg-amber-900/50 transition cursor-pointer"
              />
              {uploading?.id === r.id && uploading.side === 'before' && <span className="text-xs text-amber-500 block animate-pulse">Uploading...</span>}
              {r.beforeImage && (
                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-700 mt-2">
                  <img src={r.beforeImage} alt="Before" className="w-full h-full object-cover" />
                  <button onClick={() => update(r.id, 'beforeImage', '')} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              )}
            </div>

            {/* After Image */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">After Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => onFileChange(r.id, 'after', e.target.files?.[0])}
                disabled={uploading?.id === r.id && uploading.side === 'after'}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-900/30 file:text-amber-400 hover:file:bg-amber-900/50 transition cursor-pointer"
              />
              {uploading?.id === r.id && uploading.side === 'after' && <span className="text-xs text-amber-500 block animate-pulse">Uploading...</span>}
              {r.afterImage && (
                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-700 mt-2">
                  <img src={r.afterImage} alt="After" className="w-full h-full object-cover" />
                  <button onClick={() => update(r.id, 'afterImage', '')} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => onChange({ ...data, [cat]: [...(items || []), { id: Date.now().toString(), label: '', duration: '', note: '' }] })}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:text-white hover:border-gray-500 transition text-sm w-full justify-center">
        <Plus size={13} /> Add Result
      </button>
    </div>
  )
}

function ResultsEditor({ data, onChange }: { data: ResultsData; onChange: (v: ResultsData) => void }) {
  if (!data) return <p className="text-gray-500 text-sm p-4">No data.</p>
  return (
    <div className="space-y-6">
      <CategoryList cat="dermatology" items={data.dermatology} data={data} onChange={onChange} />
      <CategoryList cat="dental" items={data.dental} data={data} onChange={onChange} />
    </div>
  )
}

// ─── Users Viewer ────────────────────────────────────────────────────────────
interface UserRecord {
  name: string
  email: string
  registeredAt?: string
}

function UsersViewer() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/users', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleDelete = async (email: string) => {
    if (!confirm(`Remove user "${email}"? This cannot be undone.`)) return
    setDeleting(email)
    try {
      const res = await fetch('/api/auth/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.email !== email))
      }
    } catch { /* ignore */ }
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Registered Patients</h3>
          <p className="text-gray-500 text-xs mt-0.5">{users.length} user{users.length !== 1 ? 's' : ''} registered on your website</p>
        </div>
        <button onClick={fetchUsers}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs font-medium transition">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {users.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#1a1a2e] border border-gray-800 text-center">
          <Users size={36} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No users have registered yet.</p>
          <p className="text-gray-600 text-xs mt-1">When patients sign up, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.email}
              className="p-4 rounded-2xl bg-[#1a1a2e] border border-gray-800 flex items-center justify-between gap-4 hover:border-gray-700 transition">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-gray-400 truncate">
                      <Mail size={10} className="shrink-0" />
                      {user.email}
                    </span>
                    {user.registeredAt && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                        <Clock size={10} />
                        {new Date(user.registeredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(user.email)}
                disabled={deleting === user.email}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-red-400 hover:bg-red-900/20 border border-transparent hover:border-red-800 transition disabled:opacity-50"
              >
                <Trash2 size={12} />
                {deleting === user.email ? 'Removing...' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Images Editor ───────────────────────────────────────────────────────────
const IMAGE_FIELDS: { key: string; label: string; hint: string; isArray?: boolean }[] = [
  { key: 'heroImages', label: 'Hero Section Images (Slideshow)', hint: 'Upload multiple images to create an auto-sliding slideshow on the homepage. Recommended: 800×1000 portrait.', isArray: true },
  { key: 'doctorImage', label: 'Doctor Section Image', hint: 'Portrait in the "About the Doctor" section on homepage. Recommended: 600×800.' },
  { key: 'aboutImage', label: 'About Page Image', hint: 'Full portrait on the About page. Recommended: 600×800.' },
  { key: 'clinicImage', label: 'Clinic Image', hint: 'Exterior or interior shot of the clinic. Optional, for future use.' },
]

function ImagesEditor({ data, onChange }: { data: Record<string, any>; onChange: (v: Record<string, any>) => void }) {
  const [uploading, setUploading] = useState<string | null>(null)

  if (!data) return <p className="text-gray-500 text-sm p-4">No data.</p>

  const onFileChange = async (key: string, file: File | undefined, isArray: boolean) => {
    if (!file) return
    setUploading(key)
    try {
      const compressedFile = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressedFile)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const result = await res.json()
      
      if (isArray) {
        const currentArr = Array.isArray(data[key]) ? data[key] : []
        onChange({ ...data, [key]: [...currentArr, result.url] })
      } else {
        onChange({ ...data, [key]: result.url })
      }
    } catch {
      alert('Failed to upload image.')
    } finally {
      setUploading(null)
    }
  }

  const removeArrayImage = (key: string, indexToRemove: number) => {
    const currentArr = Array.isArray(data[key]) ? data[key] : []
    onChange({ ...data, [key]: currentArr.filter((_: any, i: number) => i !== indexToRemove) })
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-900/20 to-rose-800/10 border border-rose-800/30">
        <div className="flex items-center gap-3 mb-2">
          <ImageIcon size={18} className="text-rose-400" />
          <h3 className="text-sm font-bold text-white">Image Manager</h3>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Upload images directly from your computer. They will automatically be served on your live site.
        </p>
      </div>

      {IMAGE_FIELDS.map(({ key, label, hint, isArray }) => {
        const value = data[key]
        const hasValue = isArray ? (Array.isArray(value) && value.length > 0) : !!value

        return (
          <div key={key} className="p-5 rounded-2xl bg-[#1a1a2e] border border-gray-800 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">{label}</h4>
              <p className="text-xs text-gray-500">{hint}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                {isArray ? 'Upload Another Image' : 'Upload Image'}
              </label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => onFileChange(key, e.target.files?.[0], !!isArray)}
                disabled={uploading === key}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-900/30 file:text-amber-400 hover:file:bg-amber-900/50 transition cursor-pointer"
              />
              {uploading === key && <span className="text-xs text-amber-500 mt-2 block animate-pulse">Uploading...</span>}
            </div>
            
            {hasValue ? (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Preview</span>
                {isArray ? (
                  <div className="grid grid-cols-2 gap-4">
                    {(value as string[]).map((url, i) => (
                      <div key={i} className="space-y-2">
                        <div className="relative w-full h-32 rounded-xl overflow-hidden bg-[#12122a] border border-gray-700">
                          <img src={url} alt={`${label} ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                        <button
                          onClick={() => removeArrayImage(key, i)}
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-[#12122a] border border-gray-700">
                      <img src={value as string} alt={label} className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={() => onChange({ ...data, [key]: '' })}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition"
                    >
                      <Trash2 size={11} /> Remove image
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-32 rounded-xl bg-[#12122a] border border-dashed border-gray-700 flex flex-col items-center justify-center">
                <ImageIcon size={24} className="text-gray-700 mb-2" />
                <p className="text-xs text-gray-600">No images uploaded</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Analytics Dashboard ─────────────────────────────────────────────────────
interface AnalyticsEvent {
  type: string
  page?: string
  treatment?: string
  method?: string
  userEmail?: string
  timestamp: string
}

function AnalyticsDashboard() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [users, setUsers] = useState<{ name: string; email: string; registeredAt?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d')

  useEffect(() => {
    fetch('/api/analytics', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setEvents(data.events || [])
        setUsers(data.users || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Filter events by time range
  const now = Date.now()
  const rangeMs = timeRange === '7d' ? 7 * 86400000 : timeRange === '30d' ? 30 * 86400000 : Infinity
  const filtered = events.filter(e => now - new Date(e.timestamp).getTime() < rangeMs)

  // ── Compute stats ──
  const pageViews = filtered.filter(e => e.type === 'page_view')
  const treatmentClicks = filtered.filter(e => e.type === 'treatment_view' || e.type === 'treatment_click')
  const bookingClicks = filtered.filter(e => e.type === 'booking_click' || e.type === 'cta_click')
  const uniqueVisitors = new Set(filtered.map(e => e.userEmail).filter(Boolean)).size

  // Page view breakdown
  const pageBreakdown: Record<string, number> = {}
  pageViews.forEach(e => {
    const pg = e.page || 'unknown'
    pageBreakdown[pg] = (pageBreakdown[pg] || 0) + 1
  })
  const topPages = Object.entries(pageBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxPageCount = topPages.length > 0 ? topPages[0][1] : 1

  // Treatment interest
  const treatmentBreakdown: Record<string, number> = {}
  treatmentClicks.forEach(e => {
    const tr = e.treatment || 'unknown'
    treatmentBreakdown[tr] = (treatmentBreakdown[tr] || 0) + 1
  })
  const topTreatments = Object.entries(treatmentBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxTreatmentCount = topTreatments.length > 0 ? topTreatments[0][1] : 1

  // Booking methods
  const methodBreakdown: Record<string, number> = {}
  bookingClicks.forEach(e => {
    const m = e.method || e.type || 'unknown'
    methodBreakdown[m] = (methodBreakdown[m] || 0) + 1
  })

  // Recent registrations
  const recentUsers = [...users]
    .filter(u => u.registeredAt)
    .sort((a, b) => new Date(b.registeredAt!).getTime() - new Date(a.registeredAt!).getTime())
    .slice(0, 5)

  const barColors = ['bg-amber-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-rose-500', 'bg-teal-500', 'bg-orange-500', 'bg-indigo-500']

  const hasData = filtered.length > 0 || users.length > 0

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Analytics Overview</h3>
          <p className="text-gray-500 text-xs mt-0.5">{filtered.length} events{uniqueVisitors > 0 ? ` · ${uniqueVisitors} identified visitor${uniqueVisitors !== 1 ? 's' : ''}` : ''}</p>
        </div>
        <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
          {(['7d', '30d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                timeRange === range ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="p-10 rounded-2xl bg-[#1a1a2e] border border-gray-800 text-center">
          <BarChart3 size={36} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No analytics data yet.</p>
          <p className="text-gray-600 text-xs mt-1">Data will appear as visitors use the site.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Page Views', count: pageViews.length, icon: Eye, color: 'from-blue-600 to-blue-700' },
              { label: 'Treatment Interest', count: treatmentClicks.length, icon: Stethoscope, color: 'from-green-600 to-green-700' },
              { label: 'Booking Clicks', count: bookingClicks.length, icon: MousePointerClick, color: 'from-amber-600 to-amber-700' },
              { label: 'Registered Users', count: users.length, icon: Users, color: 'from-purple-600 to-purple-700' },
            ].map(card => (
              <div key={card.label} className={`p-4 rounded-2xl bg-gradient-to-br ${card.color}`}>
                <card.icon size={16} className="text-white/80 mb-2" />
                <p className="text-2xl font-bold text-white">{card.count}</p>
                <p className="text-white/70 text-xs mt-0.5">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Page Views Chart */}
          {topPages.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#1a1a2e] border border-gray-800 space-y-4">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-blue-400" />
                <h4 className="text-sm font-bold text-white">Top Pages</h4>
              </div>
              <div className="space-y-2.5">
                {topPages.map(([page, count], i) => (
                  <div key={page} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-24 truncate shrink-0">{page}</span>
                    <div className="flex-1 h-6 bg-[#12122a] rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full ${barColors[i % barColors.length]} rounded-lg transition-all duration-500`}
                        style={{ width: `${Math.max((count / maxPageCount) * 100, 8)}%` }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/80">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Treatment Interest Chart */}
          {topTreatments.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#1a1a2e] border border-gray-800 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-green-400" />
                <h4 className="text-sm font-bold text-white">Treatment Interest</h4>
              </div>
              <div className="space-y-2.5">
                {topTreatments.map(([treatment, count], i) => (
                  <div key={treatment} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-32 truncate shrink-0">{treatment}</span>
                    <div className="flex-1 h-6 bg-[#12122a] rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full ${barColors[(i + 2) % barColors.length]} rounded-lg transition-all duration-500`}
                        style={{ width: `${Math.max((count / maxTreatmentCount) * 100, 8)}%` }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/80">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking Methods */}
          {Object.keys(methodBreakdown).length > 0 && (
            <div className="p-5 rounded-2xl bg-[#1a1a2e] border border-gray-800 space-y-4">
              <div className="flex items-center gap-2">
                <MousePointerClick size={14} className="text-amber-400" />
                <h4 className="text-sm font-bold text-white">Booking Methods</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(methodBreakdown).map(([method, count]) => (
                  <div key={method} className="p-3 rounded-xl bg-[#12122a] border border-gray-800 text-center">
                    <p className="text-xl font-bold text-white">{count}</p>
                    <p className="text-xs text-gray-400 mt-1 capitalize">{method.replace(/_/g, ' ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Registrations */}
          {recentUsers.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#1a1a2e] border border-gray-800 space-y-4">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-purple-400" />
                <h4 className="text-sm font-bold text-white">Recent Registrations</h4>
              </div>
              <div className="space-y-2">
                {recentUsers.map(u => (
                  <div key={u.email} className="flex items-center justify-between p-3 rounded-xl bg-[#12122a] border border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-[10px]">
                          {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    {u.registeredAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(u.registeredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Events */}
          <div className="p-5 rounded-2xl bg-[#1a1a2e] border border-gray-800 space-y-4">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-rose-400" />
              <h4 className="text-sm font-bold text-white">Recent Events</h4>
            </div>
            {filtered.length === 0 ? (
              <p className="text-gray-600 text-xs">No events in this time range.</p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {filtered.slice(-20).reverse().map((ev, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#12122a] text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 font-medium shrink-0">
                        {ev.type.replace(/_/g, ' ')}
                      </span>
                      {ev.page && <span className="text-gray-500 truncate">{ev.page}</span>}
                      {ev.treatment && <span className="text-green-400 truncate">{ev.treatment}</span>}
                      {ev.userEmail && <span className="text-purple-400 truncate">{ev.userEmail}</span>}
                    </div>
                    <span className="text-gray-600 shrink-0 ml-2">
                      {new Date(ev.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main Shell Component ────────────────────────────────────────────────────
export default function AdminShell() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const section = searchParams.get('section') || 'dashboard'
  const sectionRef = useRef(section)
  useEffect(() => { sectionRef.current = section }, [section])

  const [content, setContent] = useState<Record<string, unknown> | null>(null)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [localData, setLocalData] = useState<unknown>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  const currentSection = SECTIONS.find(s => s.key === section) || SECTIONS[0]
  const SectionIcon = currentSection.icon

  // Fetch content and stats
  useEffect(() => {
    Promise.all([
      fetch('/api/content', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/stats', { cache: 'no-store' }).then(r => r.json()).catch(() => ({}))
    ])
      .then(([contentData, statsData]) => {
        setContent(contentData)
        setLocalData(contentData[section] ?? null)
        if (!statsData.error) setStats(statsData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When section changes, load data for that section
  useEffect(() => {
    if (content && section !== 'dashboard') {
      setLocalData(content[section] ?? null)
      setSaveStatus('idle')
      setSaveError(null)
    }
  }, [content, section])

  const handleSave = useCallback(async () => {
    if (!localData || saveStatus === 'saving') return
    const currentSectionKey = sectionRef.current
    setSaveStatus('saving')
    setSaveError(null)
    try {
      const res = await fetch(`/api/content/${currentSectionKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: localData }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Save failed')
      setSaveStatus('saved')
      setContent(prev => prev ? { ...prev, [currentSectionKey]: localData } : prev)
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err) {
      setSaveStatus('error')
      setSaveError(err instanceof Error ? err.message : 'Save failed')
      setTimeout(() => setSaveStatus('idle'), 5000)
    }
  }, [localData, saveStatus])

  const handleDataChange = useCallback((newData: unknown) => {
    setLocalData(newData)
    if (saveStatus === 'saved') setSaveStatus('idle')
  }, [saveStatus])

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin')
    router.refresh()
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-950">
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // ── Dashboard home cards ──
  const counts = {
    testimonials: (content?.testimonials as Testimonial[] || []).length,
    treatments: ((content?.treatments as {dermatology:Treatment[];dental:Treatment[]})?.dermatology?.length || 0) + ((content?.treatments as {dermatology:Treatment[];dental:Treatment[]})?.dental?.length || 0),
    blog: (content?.blog as BlogPost[] || []).length,
    locations: (content?.locations as Location[] || []).length,
    faq: (content?.faq as Faq[] || []).length,
    translations: Object.keys(content?.translations || {}).length,
    images: Object.keys(content?.images || {}).length,
  }

  const cardColors = ['from-blue-600 to-blue-700','from-green-600 to-green-700','from-purple-600 to-purple-700','from-red-600 to-red-700','from-amber-600 to-amber-700','from-teal-600 to-teal-700','from-pink-600 to-pink-700','from-indigo-600 to-indigo-700','from-orange-600 to-orange-700']

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-56'} shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">DF</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-bold text-sm text-white truncate">Dent-O-Facial</p>
              <p className="text-xs text-gray-500 truncate">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto space-y-0.5">
          {SECTIONS.map(({ key, label, href, icon: Icon }) => {
            const isActive = section === key || (key === 'dashboard' && section === 'dashboard')
            return (
              <Link key={key} href={href}
                className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-amber-600/20 text-amber-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-800 p-2 space-y-0.5">
          <a href="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
            <ExternalLink size={16} className="shrink-0" />
            {!collapsed && <span>View Site</span>}
          </a>
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors">
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 right-0 translate-x-1/2 w-6 h-6 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center hover:bg-gray-600 transition z-10">
          {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
        </button>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header bar */}
        <header className="bg-gray-950 border-b border-gray-800 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <SectionIcon size={16} className="text-amber-400 shrink-0" />
            <h1 className="text-sm font-bold text-white truncate">
              {section === 'dashboard' ? 'Dashboard' : currentSection.label}
            </h1>
            {section !== 'dashboard' && SECTION_DESC[section] && (
              <span className="hidden md:inline text-xs text-gray-500 truncate">— {SECTION_DESC[section]}</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-900/50 border border-green-700 text-green-300 text-xs">
                <Check size={11} /> Saved!
              </div>
            )}
            {['hero', 'testimonials', 'treatments', 'doctor', 'locations', 'blog', 'faq', 'cta', 'results', 'images', 'translations'].includes(section) && (
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500
                  disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
              >
                {saveStatus === 'saving' ? (
                  <><RefreshCw size={13} className="animate-spin" /> Saving...</>
                ) : (
                  <><Save size={13} /> Save</>
                )}
              </button>
            )}
          </div>
        </header>

        {/* Global Error Toast */}
        {saveStatus === 'error' && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl bg-red-950 border-2 border-red-600 text-red-200 animate-in slide-in-from-bottom-5">
            <X size={20} className="text-red-500" /> 
            <div>
              <p className="font-bold text-sm">Save Failed</p>
              <p className="text-xs opacity-90">{saveError}</p>
            </div>
          </div>
        )}

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">

            {/* Dashboard home */}
            {section === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Welcome Back</h2>
                  <p className="text-gray-400 text-sm mt-1">Manage your website content below.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label:'Testimonials', count: counts.testimonials, icon: MessageSquare, section:'testimonials', color: cardColors[0] },
                    { label:'Treatments', count: counts.treatments, icon: Stethoscope, section:'treatments', color: cardColors[1] },
                    { label:'Blog Posts', count: counts.blog, icon: FileText, section:'blog', color: cardColors[2] },
                    { label:'Locations', count: counts.locations, icon: MapPin, section:'locations', color: cardColors[3] },
                    { label:'FAQs', count: counts.faq, icon: Bell, section:'faq', color: cardColors[4] },
                    { label:'Doctor Info', count: 1, icon: User, section:'doctor', color: cardColors[5] },
                    { label:'Hero Section', count: 1, icon: Eye, section:'hero', color: cardColors[6] },
                    { label:'CTA & Contact', count: 1, icon: Settings, section:'cta', color: cardColors[7] },
                    { label:'Results Gallery', count: 1, icon: Star, section:'results', color: cardColors[8] },
                    { label:'Manual Translations', count: counts.translations || 0, icon: Globe, section:'translations', color: 'from-blue-800 to-blue-900' },
                    { label:'Image Manager', count: counts.images || 0, icon: ImageIcon, section:'images', color: 'from-rose-600 to-rose-700' },
                    { label:'Registered Users', count: stats.users ?? '—', icon: Users, section:'users', color: 'from-cyan-600 to-cyan-700' },
                    { label:'Patient Records', count: stats.records ?? '—', icon: FileText, section:'patient-records', color: 'from-blue-600 to-blue-700' },
                    { label:'Appointments', count: stats.appointments ?? '—', icon: Calendar, section:'appointments', color: 'from-emerald-600 to-emerald-700' },
                    { label:'Leads CRM', count: stats.leads ?? '—', icon: Users, section:'leads', color: 'from-fuchsia-600 to-fuchsia-700' },
                    { label:'Notifications', count: stats.notifications ?? '—', icon: Bell, section:'notifications', color: 'from-sky-600 to-sky-700' },
                    { label:'Analytics', count: stats.analytics ?? '—', icon: BarChart3, section:'analytics', color: 'from-violet-600 to-violet-700' },
                  ].map(card => (
                    <Link key={card.label} href={`/admin/dashboard?section=${card.section}`}
                      className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} hover:opacity-85 transition group block`}>
                      <card.icon size={20} className="text-white/80 mb-2" />
                      <p className="text-2xl font-bold text-white">{card.count}</p>
                      <p className="text-white/70 text-xs mt-0.5 group-hover:underline">{card.label}</p>
                    </Link>
                  ))}
                </div>
                <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800">
                  <p className="text-gray-400 text-sm leading-relaxed">
                    <span className="text-white font-medium">Tip:</span> All changes save to <code className="text-amber-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs">data/site-content.json</code> and go live instantly.
                  </p>
                </div>
              </div>
            )}

            {/* Section editors */}
            {section === 'hero' && localData && (
              <HeroEditor data={localData as Record<string, unknown>} onChange={handleDataChange} />
            )}
            {section === 'testimonials' && (
              <TestimonialsEditor data={localData as Testimonial[]} onChange={handleDataChange} />
            )}
            {section === 'treatments' && (
              <TreatmentsEditor data={localData as { dermatology: Treatment[]; dental: Treatment[] }} onChange={handleDataChange} />
            )}
            {section === 'doctor' && localData && (
              <DoctorEditor data={localData as Record<string, unknown>} onChange={handleDataChange} />
            )}
            {section === 'locations' && (
              <LocationsEditor data={localData as Location[]} onChange={handleDataChange} />
            )}
            {section === 'blog' && (
              <BlogEditor data={localData as BlogPost[]} onChange={handleDataChange} />
            )}
            {section === 'faq' && (
              <FaqEditor data={localData as Faq[]} onChange={handleDataChange} />
            )}
            {section === 'cta' && localData && (
              <CtaEditor data={localData as Record<string, unknown>} onChange={handleDataChange} />
            )}
            {section === 'results' && (
              <ResultsEditor data={localData as ResultsData} onChange={handleDataChange} />
            )}
            {section === 'images' && localData && (
              <ImagesEditor data={localData as Record<string, string>} onChange={handleDataChange} />
            )}
            { section === 'users' && (
              <UsersViewer />
            )}
            {section === 'patient-records' && (
              <PatientsCRM />
            )}
            {section === 'translations' && localData && (
              <TranslationsEditor data={localData as Record<string, any>} onChange={handleDataChange} />
            )}
            {section === 'appointments' && (
              <AppointmentsEditor />
            )}
            {section === 'leads' && (
              <LeadsEditor />
            )}
            {section === 'notifications' && (
              <NotificationsViewer />
            )}
            {section === 'analytics' && (
              <AnalyticsDashboard />
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
