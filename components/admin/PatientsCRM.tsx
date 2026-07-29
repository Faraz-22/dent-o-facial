import { useState, useEffect } from 'react'
import { Search, Filter, Calendar, FileText, Upload, Plus, X, Check, Eye, Trash2 } from 'lucide-react'

export function PatientsCRM() {
  const [patients, setPatients] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [aftercare, setAftercare] = useState<Record<string, string>>({})
  const [draftAftercare, setDraftAftercare] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  
  const [uploading, setUploading] = useState<{ email: string } | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [uploadModal, setUploadModal] = useState<{ isOpen: boolean; email: string }>({ isOpen: false, email: '' })
  const [uploadForm, setUploadForm] = useState({ type: 'prescription', fileUrl: '', notes: '', date: new Date().toISOString().split('T')[0] })
  const [saveStatus, setSaveStatus] = useState<Record<string, 'saving' | 'saved' | 'error'>>({})

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/users', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/appointments', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/records', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/aftercare', { cache: 'no-store' }).then(r => r.json())
    ]).then(([u, a, r, af]) => {
      const userList = u.users || u || []
      const apptList = a || []
      
      // Build patients list strictly from people who have appointments
      const patientMap = new Map()
      apptList.forEach((appt: any) => {
        if (appt.email && !patientMap.has(appt.email)) {
          patientMap.set(appt.email, {
            name: appt.patientName || appt.email.split('@')[0],
            email: appt.email,
            phone: appt.phone || ''
          })
        }
      })
      
      // Update names for those who have officially registered
      userList.forEach((user: any) => {
        if (patientMap.has(user.email)) {
          patientMap.set(user.email, { ...patientMap.get(user.email), name: user.name })
        }
      })

      setPatients(Array.from(patientMap.values()))
      setAppointments(apptList)
      setRecords(r || [])
      setAftercare(af || {})
      setLoading(false)
    }).catch(console.error)
  }, [])

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase())
    if (!dateFilter) return matchesSearch
    
    // Check if patient has any appointment on the selected date
    const patientAppts = appointments.filter(a => a.email === p.email)
    const hasApptOnDate = patientAppts.some(a => a.preferredDate === dateFilter)
    return matchesSearch && hasApptOnDate
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading({ email: uploadModal.email })
    
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const result = await res.json()
      setUploadForm(prev => ({ ...prev, fileUrl: result.url }))
    } catch (e) {
      alert('Failed to upload file')
    } finally {
      setUploading(null)
    }
  }

  const saveAftercare = async (email: string, text: string) => {
    if (aftercare[email] === text) return // No changes

    setSaveStatus(prev => ({ ...prev, [email]: 'saving' }))
    try {
      const res = await fetch('/api/aftercare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, aftercareText: text })
      })
      if (res.ok) {
        setAftercare(prev => ({ ...prev, [email]: text }))
        setSaveStatus(prev => ({ ...prev, [email]: 'saved' }))
        setTimeout(() => {
          setSaveStatus(prev => {
            const next = { ...prev }
            delete next[email]
            return next
          })
        }, 2000)
      } else {
        setSaveStatus(prev => ({ ...prev, [email]: 'error' }))
      }
    } catch (e) {
      setSaveStatus(prev => ({ ...prev, [email]: 'error' }))
    }
  }

  const submitRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.fileUrl) {
      alert('Please upload a file first.')
      return
    }

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientEmail: uploadModal.email,
          ...uploadForm
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        setRecords([...records, data.record])
        setUploadModal({ isOpen: false, email: '' })
        setUploadForm({ type: 'prescription', fileUrl: '', notes: '', date: new Date().toISOString().split('T')[0] })
      } else {
        alert('Failed to save record.')
      }
    } catch (e) {
      alert('Failed to save record.')
    }
  }

  const deleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medical record? This cannot be undone.')) return
    
    try {
      const res = await fetch(`/api/records?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setRecords(records.filter(r => r.id !== id))
      } else {
        alert('Failed to delete record.')
      }
    } catch (e) {
      alert('Failed to delete record.')
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading patients...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search patients by name or email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1a2e] border border-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <input 
            type="date"
            value={dateFilter}
            onClick={(e) => e.currentTarget.showPicker?.()}
            onChange={e => setDateFilter(e.target.value)}
            style={{ colorScheme: 'dark' }}
            className="px-4 py-2.5 rounded-xl bg-[#1a1a2e] border border-gray-800 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="p-2 text-gray-500 hover:text-white transition">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center bg-[#1a1a2e] rounded-2xl border border-gray-800 text-gray-500">
            No patients found matching your criteria.
          </div>
        ) : (
          filteredPatients.map(patient => {
            const patientAppts = appointments.filter(a => a.email === patient.email)
            const patientRecords = records.filter(r => r.patientEmail === patient.email)
            const isExpanded = selectedPatient === patient.email

            return (
              <div key={patient.email} className={`bg-[#1a1a2e] border ${isExpanded ? 'border-amber-900/50' : 'border-gray-800'} rounded-2xl overflow-hidden transition-all duration-300`}>
                <div 
                  className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-800/30"
                  onClick={() => setSelectedPatient(isExpanded ? null : patient.email)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold text-sm">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{patient.name}</h3>
                      <p className="text-xs text-gray-500">{patient.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Appointments</p>
                      <p className="text-sm font-semibold text-white">{patientAppts.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Records</p>
                      <p className="text-sm font-semibold text-white">{patientRecords.length}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setUploadModal({ isOpen: true, email: patient.email }) }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition"
                    >
                      <Upload size={12} /> Upload
                    </button>
                  </div>
                </div>

                <div className={`p-5 border-t border-gray-800 bg-gray-900/30 grid-cols-1 md:grid-cols-2 gap-6 ${isExpanded ? 'grid' : 'hidden'}`}>
                  {/* Appointments Column */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Calendar size={14} className="text-amber-500" />
                      Appointment History
                    </h4>
                    {patientAppts.length > 0 ? (
                      <div className="space-y-2">
                        {patientAppts.map(a => (
                          <div key={a.id} className="p-3 rounded-xl bg-[#12122a] border border-gray-800 text-sm flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{a.treatment}</p>
                              <p className="text-xs text-gray-500">{a.preferredDate} • {a.clinic}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              a.status === 'Completed' ? 'bg-green-900/30 text-green-400' : 
                              a.status === 'Confirmed' ? 'bg-blue-900/30 text-blue-400' : 'bg-gray-800 text-gray-400'
                            }`}>
                              {a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">No appointments found.</p>
                    )}
                  </div>

                  {/* Records Column */}
                  <div className="flex flex-col gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FileText size={14} className="text-amber-500" />
                        Medical Records
                      </h4>
                      {patientRecords.length > 0 ? (
                        <div className="space-y-2">
                          {patientRecords.map(r => (
                            <div key={r.id} className="p-3 rounded-xl bg-[#12122a] border border-gray-800 text-sm">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-white font-medium capitalize">{r.type}</p>
                                <p className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString()}</p>
                              </div>
                              {r.notes && <p className="text-xs text-gray-400 mb-2">{r.notes}</p>}
                              <div className="flex items-center justify-between mt-2">
                                <a href={`/api/records/${r.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 transition">
                                  <Eye size={12} /> View Document
                                </a>
                                <button 
                                  onClick={() => deleteRecord(r.id)}
                                  className="text-gray-500 hover:text-red-500 transition"
                                  title="Delete record"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">No records uploaded yet.</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FileText size={14} className="text-amber-500" />
                        Custom Aftercare Instructions
                      </h4>
                      <div className="relative">
                        <textarea
                          value={draftAftercare[patient.email] ?? aftercare[patient.email] ?? ''}
                          onChange={(e) => setDraftAftercare(prev => ({ ...prev, [patient.email]: e.target.value }))}
                          onBlur={(e) => saveAftercare(patient.email, e.target.value)}
                          placeholder="Type personalized aftercare instructions here. These will appear on the patient's dashboard..."
                          className="w-full px-4 py-3 rounded-xl bg-[#12122a] border border-gray-800 text-sm text-white focus:outline-none focus:border-amber-500 resize-none h-32 pr-10"
                        />
                        <div className="absolute right-3 top-3">
                          {saveStatus[patient.email] === 'saving' && <span className="text-xs text-amber-500 animate-pulse">Saving...</span>}
                          {saveStatus[patient.email] === 'saved' && <Check size={16} className="text-green-500" />}
                          {saveStatus[patient.email] === 'error' && <X size={16} className="text-red-500" />}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                          Auto-saves when you click outside, or click Save.
                        </p>
                        <button
                          onClick={() => saveAftercare(patient.email, draftAftercare[patient.email] ?? aftercare[patient.email] ?? '')}
                          disabled={saveStatus[patient.email] === 'saving'}
                          className={`px-4 py-1.5 rounded-lg disabled:opacity-50 text-white text-xs font-semibold transition flex items-center gap-1.5
                            ${saveStatus[patient.email] === 'saved' 
                              ? 'bg-green-600 hover:bg-green-500' 
                              : 'bg-amber-600 hover:bg-amber-500'}`}
                        >
                          {saveStatus[patient.email] === 'saving' && 'Saving...'}
                          {saveStatus[patient.email] === 'saved' && <><Check size={14} /> Saved!</>}
                          {saveStatus[patient.email] !== 'saving' && saveStatus[patient.email] !== 'saved' && 'Save Instructions'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Upload Modal */}
      {uploadModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-800">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Upload Medical Record</h3>
              <button onClick={() => setUploadModal({ isOpen: false, email: '' })} className="text-gray-500 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitRecord} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Record Type</label>
                <select 
                  value={uploadForm.type}
                  onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#12122a] border border-gray-700 text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="prescription">Prescription</option>
                  <option value="report">Lab Report</option>
                  <option value="xray">X-Ray / Scan</option>
                  <option value="other">Other Medical Record</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Date</label>
                <input 
                  type="date"
                  value={uploadForm.date}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  onChange={e => setUploadForm({ ...uploadForm, date: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                  className="w-full px-4 py-3 rounded-xl bg-[#12122a] border border-gray-700 text-white text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Notes (Optional)</label>
                <textarea 
                  value={uploadForm.notes}
                  onChange={e => setUploadForm({ ...uploadForm, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#12122a] border border-gray-700 text-white text-sm focus:outline-none focus:border-amber-500 resize-none h-20"
                  placeholder="Additional observations..."
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">File (Image/PDF)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    disabled={!!uploading}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-900/30 file:text-amber-400 hover:file:bg-amber-900/50 transition cursor-pointer"
                  />
                  {uploading && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-amber-500 animate-pulse">Uploading...</span>}
                  {uploadForm.fileUrl && !uploading && <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setUploadModal({ isOpen: false, email: '' })} className="flex-1 py-3 rounded-xl border border-gray-700 text-sm font-semibold text-gray-300 hover:bg-gray-800 transition">Cancel</button>
                <button type="submit" disabled={!uploadForm.fileUrl || !!uploading} className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-bold transition">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
