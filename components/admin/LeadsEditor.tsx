'use client'

import { useState, useEffect } from 'react'
import { Phone, MessageCircle, AlertCircle, Search } from 'lucide-react'
import { buildWhatsAppUrl, WA_MESSAGES } from '@/lib/whatsapp'

export function LeadsEditor() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/leads', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setLeads(data)
        setLoading(false)
      })
  }, [])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className="p-4 text-gray-400">Loading leads...</div>

  const filtered = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.phone.includes(search) || 
    l.treatment?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-[#1a1a2e] px-4 py-3 rounded-xl border border-gray-800">
        <Search size={18} className="text-gray-500" />
        <input 
          type="text" 
          placeholder="Search leads by name, phone, or treatment..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-white w-full text-sm placeholder-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(lead => {
          const waUrl = buildWhatsAppUrl(lead.phone, WA_MESSAGES.adminFollowUp(lead.name, lead.treatment || 'our clinic'))
          
          return (
            <div key={lead.id} className="p-5 rounded-2xl bg-[#1a1a2e] border border-gray-800 hover:border-gray-700 transition">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium text-lg">{lead.name}</h3>
                    {lead.priority === 'High' && <span className="bg-red-900/50 text-red-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1"><AlertCircle size={10}/> Hot</span>}
                  </div>
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <Phone size={14} /> {lead.phone}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Source: {lead.source}</span>
                  <select 
                    value={lead.status} 
                    onChange={e => updateStatus(lead.id, e.target.value)}
                    className="bg-gray-800 text-white text-xs rounded-lg px-2 py-1.5 border border-gray-700 outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Booked">Booked</option>
                    <option value="Visited">Visited</option>
                    <option value="Lost">Lost</option>
                    <option value="Follow-up Needed">Follow-up Needed</option>
                  </select>
                </div>
              </div>

              <div className="text-sm bg-[#12122a] p-3 rounded-lg text-gray-300 border border-gray-800/50 mb-4 inline-block">
                <span className="text-gray-500 mr-2 text-xs uppercase">Interested in:</span>
                {lead.treatment || 'General Inquiry'} {lead.clinic ? `(${lead.clinic})` : ''}
              </div>

              <div className="flex items-center justify-between border-t border-gray-800 pt-4 mt-2">
                <span className="text-xs text-gray-500">
                  Last interaction: {new Date(lead.lastInteraction).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-[#25D366]/20 text-[#25D366] rounded-lg text-xs font-medium hover:bg-[#25D366]/30 transition">
                    <MessageCircle size={14} /> Message
                  </a>
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-500 bg-[#1a1a2e] rounded-2xl border border-gray-800">
            No leads found.
          </div>
        )}
      </div>
    </div>
  )
}
