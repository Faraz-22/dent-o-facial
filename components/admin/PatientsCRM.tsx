import { useState, useEffect } from 'react'
import { Search, Filter, Calendar, FileText, Upload, Plus, X, Check, Eye, Trash2, IndianRupee, Activity, CreditCard, ChevronRight, Printer, Phone } from 'lucide-react'
import { compressImage } from '@/lib/imageUtils'

export function PatientsCRM() {
  const [patients, setPatients] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [aftercare, setAftercare] = useState<Record<string, string>>({})
  const [draftAftercare, setDraftAftercare] = useState<Record<string, string>>({})
  const [patientProfiles, setPatientProfiles] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  
  const [uploading, setUploading] = useState<{ email: string } | null>(null)
  const [selectedPatientIdentifier, setSelectedPatientIdentifier] = useState<string | null>(null)
  const [uploadModal, setUploadModal] = useState<{ isOpen: boolean; identifier: string }>({ isOpen: false, identifier: '' })
  const [uploadForm, setUploadForm] = useState({ type: 'prescription', fileUrl: '', notes: '', date: new Date().toISOString().split('T')[0] })
  
  const [saveStatus, setSaveStatus] = useState<Record<string, 'saving' | 'saved' | 'error'>>({})
  const [recordSaveStatus, setRecordSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [profileSaveStatus, setProfileSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [draftProfile, setDraftProfile] = useState<any>(null)
  const [newPayment, setNewPayment] = useState({ amount: '', date: new Date().toISOString().split('T')[0], method: 'Cash', notes: '' })
  const [activeTab, setActiveTab] = useState('overview')
  const [printingRecord, setPrintingRecord] = useState<any>(null)
  const [doctorsList, setDoctorsList] = useState<any[]>([])
  const [selectedPrintDoctor, setSelectedPrintDoctor] = useState<string>('hadi')
  
  const handlePrint = (record: any) => {
    setPrintingRecord(record)
    // Add a longer delay (500ms) to ensure the DOM is painted and the image is loaded before print dialogue opens
    setTimeout(() => {
      window.print()
      setPrintingRecord(null)
    }, 500)
  }

  // Preload the banner image so it's instantly available when printing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const img = new Image()
      img.src = "/uploads/prescription-banner.png"
    }
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/users', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/appointments', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/records', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/aftercare', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/patient-profiles', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/content', { cache: 'no-store' }).then(r => r.json())
    ]).then(([u, a, r, af, prof, c]) => {
      const userList = u.users || u || []
      const apptList = a || []
      
      if (c && c.doctors && Array.isArray(c.doctors)) {
        setDoctorsList(c.doctors)
        if (c.doctors.length > 0 && !selectedPrintDoctor) {
          setSelectedPrintDoctor(c.doctors[0].id)
        }
      }
      
      const patientMap = new Map()
      apptList.forEach((appt: any) => {
        const identifier = appt.email || appt.phone
        if (identifier && !patientMap.has(identifier)) {
          patientMap.set(identifier, {
            name: appt.patientName || (appt.email ? appt.email.split('@')[0] : 'Unknown'),
            email: appt.email || '',
            phone: appt.phone || '',
            identifier: identifier
          })
        }
      })
      
      userList.forEach((user: any) => {
        if (user.email && patientMap.has(user.email)) {
          patientMap.set(user.email, { ...patientMap.get(user.email), name: user.name })
        }
      })

      setPatients(Array.from(patientMap.values()))
      setAppointments(apptList)
      setRecords(r || [])
      setAftercare(af || {})
      setPatientProfiles(prof || {})
      setLoading(false)
    }).catch(console.error)
  }, [])

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.email && p.email.toLowerCase().includes(search.toLowerCase())) || (p.phone && p.phone.includes(search))
    if (!dateFilter) return matchesSearch
    
    const patientAppts = appointments.filter(a => (a.email || a.phone) === p.identifier)
    const hasApptOnDate = patientAppts.some(a => a.preferredDate === dateFilter)
    return matchesSearch && hasApptOnDate
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading({ email: uploadModal.identifier })
    
    try {
      const compressedFile = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('purpose', 'private')
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
    if (aftercare[email] === text) return

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

    setRecordSaveStatus('saving')
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientEmail: uploadModal.identifier,
          ...uploadForm
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        setRecords([...records, data.record])
        setRecordSaveStatus('saved')
        setTimeout(() => {
          setUploadModal({ isOpen: false, identifier: '' })
          setUploadForm({ type: 'prescription', fileUrl: '', notes: '', date: new Date().toISOString().split('T')[0] })
          setRecordSaveStatus('idle')
        }, 1500)
      } else {
        setRecordSaveStatus('error')
        setTimeout(() => setRecordSaveStatus('idle'), 3000)
      }
    } catch (e) {
      setRecordSaveStatus('error')
      setTimeout(() => setRecordSaveStatus('idle'), 3000)
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

  const savePatientProfile = async (identifier: string) => {
    if (!draftProfile) return
    setProfileSaveStatus('saving')
    
    try {
      const res = await fetch('/api/patient-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedPatient?.email || '', phone: selectedPatient?.phone || '', ...draftProfile })
      })
      
      if (res.ok) {
        setPatientProfiles(prev => ({ ...prev, [identifier]: draftProfile }))
        setProfileSaveStatus('saved')
        setTimeout(() => setProfileSaveStatus('idle'), 2000)
      } else {
        setProfileSaveStatus('error')
        setTimeout(() => setProfileSaveStatus('idle'), 3000)
      }
    } catch (e) {
      setProfileSaveStatus('error')
      setTimeout(() => setProfileSaveStatus('idle'), 3000)
    }
  }

  const openSlideOver = (patient: any) => {
    setSelectedPatientIdentifier(patient.email)
    const profile = JSON.parse(JSON.stringify(patientProfiles[patient.identifier] || { totalCost: 0, paymentHistory: [], dues: 0, sessionsRequired: 0, sessionsCompleted: 0 }))
    
    if (profile.totalPayments > 0 && (!profile.paymentHistory || profile.paymentHistory.length === 0)) {
      profile.paymentHistory = [{
        id: 'legacy-' + Date.now(),
        amount: profile.totalPayments,
        date: profile.updatedAt ? profile.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
        method: 'Legacy/Unknown',
        notes: 'Migrated from previous system'
      }]
      profile.totalPayments = 0
      const sumPayments = profile.paymentHistory.reduce((sum: number, p: any) => sum + p.amount, 0)
      profile.dues = Math.max(0, (profile.totalCost || 0) - sumPayments)
    }

    setDraftProfile(profile)
    setActiveTab('overview')
  }

  const addPayment = (treatmentId: string) => {
    if (!newPayment.amount || !newPayment.date) return
    const payment = {
      id: Math.random().toString(36).substring(7),
      amount: Number(newPayment.amount),
      date: newPayment.date,
      method: newPayment.method,
      notes: newPayment.notes
    }
    
    const treatments = [...(draftProfile?.treatments || [])]
    const tIndex = treatments.findIndex(t => t.id === treatmentId)
    if (tIndex === -1) return
    
    const t = treatments[tIndex]
    t.paymentHistory = [...(t.paymentHistory || []), payment]
    
    setDraftProfile({ ...draftProfile, treatments })
    setNewPayment({ amount: '', date: new Date().toISOString().split('T')[0], method: 'Cash', notes: '' })
  }

  const removePayment = (treatmentId: string, paymentId: string) => {
    const treatments = [...(draftProfile?.treatments || [])]
    const tIndex = treatments.findIndex(t => t.id === treatmentId)
    if (tIndex === -1) return

    const t = treatments[tIndex]
    t.paymentHistory = (t.paymentHistory || []).filter((p: any) => p.id !== paymentId)
    
    setDraftProfile({ ...draftProfile, treatments })
  }

  const handleCostChange = (treatmentId: string, val: number) => {
    const treatments = [...(draftProfile?.treatments || [])]
    const tIndex = treatments.findIndex(t => t.id === treatmentId)
    if (tIndex === -1) return

    treatments[tIndex].totalCost = val
    setDraftProfile({ ...draftProfile, treatments })
  }

  const handleSessionsChange = (treatmentId: string, field: 'completed' | 'required', val: number) => {
    const treatments = [...(draftProfile?.treatments || [])]
    const tIndex = treatments.findIndex(t => t.id === treatmentId)
    if (tIndex === -1) return

    if (field === 'completed') treatments[tIndex].sessionsCompleted = val
    else treatments[tIndex].sessionsRequired = val
    setDraftProfile({ ...draftProfile, treatments })
  }

  const createNewTreatment = () => {
    const name = prompt("Enter the name of the new treatment (e.g. Skin Rejuvenation):")
    if (!name) return
    
    const treatments = [...(draftProfile?.treatments || [])]
    treatments.push({
      id: 'treatment-' + Date.now(),
      name,
      totalCost: 0,
      paymentHistory: [],
      sessionsRequired: 0,
      sessionsCompleted: 0,
      createdAt: new Date().toISOString()
    })
    setDraftProfile({ ...draftProfile, treatments })
  }

  const closeSlideOver = () => {
    setSelectedPatientIdentifier(null)
    setDraftProfile(null)
  }

  const selectedPatient = patients.find(p => p.identifier === selectedPatientIdentifier)
  const patientAppts = selectedPatient ? appointments.filter(a => (a.email || a.phone) === selectedPatient.identifier) : []
  const patientRecords = selectedPatient ? records.filter(r => (r.patientEmail || r.phone) === selectedPatient.identifier) : []

  const calculateSuperDues = () => {
    if (!draftProfile?.treatments) return 0
    return draftProfile.treatments.reduce((total: number, t: any) => {
      const sumPayments = (t.paymentHistory || []).reduce((sum: number, p: any) => sum + p.amount, 0)
      const dues = Math.max(0, (t.totalCost || 0) - sumPayments)
      return total + dues
    }, 0)
  }
  
  const superDues = calculateSuperDues()

  const activeDoctor = doctorsList.find(d => d.id === selectedPrintDoctor) || doctorsList[0] || null

  if (loading) return <div className="p-8 text-center text-gray-500">Loading patients...</div>

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 0; }
          body * {
            visibility: hidden;
          }
          #print-prescription-area, #print-prescription-area * {
            visibility: visible;
          }
          #print-prescription-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px 40px;
          }
          /* Hide scrollbars during print */
          ::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>

      {/* Hidden Printable Area */}
      {printingRecord && (
        <div id="print-prescription-area" className="bg-white text-black min-h-[297mm] flex flex-col p-8 max-w-[800px] mx-auto font-sans relative">
          <div className="border-b-2 border-gray-200 pb-4 mb-4 flex justify-between items-start">
            {/* Left Side: Banner and Subtitle */}
            <div className="flex flex-col items-start max-w-[60%]">
              <img src="/uploads/prescription-banner.png" alt="Dent-O-Facial Banner" className="w-[350px] md:w-[450px] h-auto object-contain mb-2 -ml-2" style={{ mixBlendMode: 'multiply' }} />
              <p className="text-sm font-medium text-gray-700 tracking-wide mt-1 pl-2">
                Premium Dental, Braces, Implants and Facial Trauma Centre
              </p>
            </div>
            
            {/* Right Side: Doctor Info */}
            <div className="text-right mt-2 flex flex-col items-end max-w-[40%]">
              <p className="font-bold text-gray-900 text-lg">{activeDoctor?.name || 'Dr. Hadi Raza'}</p>
              <p className="text-xs text-gray-600 font-bold mt-1 text-right">{activeDoctor?.title || (activeDoctor?.name === 'Dr. Nahid Raza' ? 'Senior Dental Surgeon' : 'Dermatology & Dental Surgery Specialist')}</p>
              <p className="text-xs text-gray-500 mt-0.5 text-right">{activeDoctor?.credentials ? activeDoctor.credentials.map((c: any) => c.label.split('—')[0].trim()).join(', ') : 'BDS, MDS (Oral & Maxillofacial)'}</p>
              <div className="mt-3 flex items-center justify-end gap-1.5 text-gray-800">
                <Phone size={14} />
                <p className="text-sm font-bold tracking-wider">+91 7007276542</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6 flex justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Patient Name</p>
              <p className="font-semibold text-gray-900">{selectedPatient?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Email</p>
              <p className="font-semibold text-gray-900">{selectedPatient?.email || selectedPatient?.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Date</p>
              <p className="font-semibold text-gray-900">{new Date(printingRecord.date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mb-12 min-h-[300px]">
            <div className="whitespace-pre-wrap text-gray-800 text-lg leading-relaxed mt-2">
              {printingRecord.notes || ''}
            </div>
          </div>

          <div className="mt-auto pt-16 flex justify-end">
            <div className="text-center">
              <div className="text-3xl" style={{ fontFamily: "'Brush Script MT', cursive" }}>{activeDoctor?.name || 'Dr. Hadi Raza'}</div>
              <div className="w-48 h-px bg-gray-300 my-2"></div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Doctor Signature</p>
            </div>
          </div>
        </div>
      )}

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
            const appts = appointments.filter(a => (a.email || a.phone) === patient.identifier)
            const recs = records.filter(r => (r.patientEmail || r.phone) === patient.identifier)
            const dues = patientProfiles[patient.identifier]?.dues || 0

            return (
              <div 
                key={patient.identifier} 
                onClick={() => openSlideOver(patient)}
                className="bg-[#1a1a2e] border border-gray-800 rounded-2xl overflow-hidden hover:border-amber-900/50 transition-all duration-300 cursor-pointer group"
              >
                <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold text-sm">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold group-hover:text-amber-500 transition">{patient.name}</h3>
                      <p className="text-xs text-gray-500">{patient.email || patient.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {dues > 0 && (
                      <div className="text-center px-3 py-1 bg-red-900/20 rounded-lg">
                        <p className="text-[10px] text-red-500 uppercase tracking-widest mb-0.5">Dues</p>
                        <p className="text-sm font-semibold text-red-400">₹{dues.toLocaleString()}</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Appts</p>
                      <p className="text-sm font-semibold text-white">{appts.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Records</p>
                      <p className="text-sm font-semibold text-white">{recs.length}</p>
                    </div>
                    <ChevronRight size={20} className="text-gray-600 group-hover:text-amber-500 transition" />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Slide-over UI */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSlideOver} />
          
          <div className="relative w-full max-w-4xl bg-[#0f111a]/95 h-full shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col border-l border-white/10 animate-slide-in-right backdrop-blur-2xl">
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-start justify-between shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold text-2xl shadow-lg">
                  {selectedPatient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedPatient.name}</h2>
                  <p className="text-sm text-gray-400">{selectedPatient.email || selectedPatient.phone}</p>
                  {selectedPatient.phone && <p className="text-xs text-gray-500 mt-1">{selectedPatient.phone}</p>}
                </div>
              </div>
              <button onClick={closeSlideOver} className="p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-8 py-5 gap-2 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar">
              {['overview', 'records', 'appointments', 'aftercare'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-300 ${
                    activeTab === tab 
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-900/20' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab === 'overview' ? 'Profile & Billing' : tab === 'records' ? 'Records & Medicines' : tab === 'appointments' ? 'Appointments' : 'Custom Aftercare'}
                </button>
              ))}
            </div>

            {/* Scrollable Content */}
            <div className="p-8 overflow-y-auto flex-1 space-y-8 no-scrollbar">
              
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Super Outstanding Dues */}
                  <div className="bg-gradient-to-r from-red-900/40 to-black/40 border border-red-900/50 rounded-3xl p-6 flex items-center justify-between shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                    <div>
                      <h3 className="text-red-400 font-bold text-lg mb-1 flex items-center gap-2">
                        <Activity size={18} /> Total Outstanding Dues
                      </h3>
                      <p className="text-gray-400 text-sm">Combined dues across all active treatments.</p>
                    </div>
                    <div className="text-4xl font-black text-red-500 tracking-tight">
                      ₹{superDues.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <h3 className="text-lg font-bold text-white">Treatment Plans</h3>
                    <button onClick={createNewTreatment} className="text-amber-500 text-sm font-semibold hover:text-amber-400 transition flex items-center gap-1">
                      <Plus size={16} /> New Treatment
                    </button>
                  </div>

                  {draftProfile?.treatments?.map((treatment: any) => {
                    const tCost = treatment.totalCost || 0
                    const tSum = (treatment.paymentHistory || []).reduce((sum: number, p: any) => sum + p.amount, 0)
                    const tDues = Math.max(0, tCost - tSum)
                    
                    return (
                      <div key={treatment.id} className="bg-white/[0.02] rounded-3xl border border-white/5 p-7 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50 group-hover:bg-amber-500 transition-colors"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="text-xl font-bold text-white mb-1">{treatment.name}</h4>
                            <p className="text-xs text-gray-500">Created: {new Date(treatment.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5 mb-8 bg-black/20 p-5 rounded-2xl border border-white/5">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2">Total Treatment Cost (₹)</label>
                            <input 
                              type="number" 
                              value={treatment.totalCost || ''}
                              onChange={e => handleCostChange(treatment.id, Number(e.target.value))}
                              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-gray-700 font-medium"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2">Outstanding Dues (₹) <span className="text-[10px] text-gray-600 font-normal ml-1">(Auto-calculated)</span></label>
                            <div className="w-full px-4 py-3 rounded-xl bg-red-900/10 border border-red-900/30 text-red-400 text-sm font-bold flex items-center justify-between">
                              <span>₹{tDues.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Sessions */}
                        <div className="mb-8">
                          <h5 className="text-xs font-semibold text-gray-500 mb-3">Sessions Tracking</h5>
                          <div className="grid grid-cols-2 gap-5">
                            <div>
                              <input 
                                type="number" 
                                value={treatment.sessionsCompleted || ''}
                                onChange={e => handleSessionsChange(treatment.id, 'completed', Number(e.target.value))}
                                className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/5 text-white text-sm focus:outline-none focus:border-amber-500"
                                placeholder="Completed (e.g. 1)"
                              />
                            </div>
                            <div>
                              <input 
                                type="number" 
                                value={treatment.sessionsRequired || ''}
                                onChange={e => handleSessionsChange(treatment.id, 'required', Number(e.target.value))}
                                className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/5 text-white text-sm focus:outline-none focus:border-amber-500"
                                placeholder="Total Required (e.g. 5)"
                              />
                            </div>
                          </div>
                          {treatment.sessionsRequired > 0 && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-amber-500 font-bold">{Math.round((treatment.sessionsCompleted / treatment.sessionsRequired) * 100)}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-amber-500 transition-all duration-500" 
                                  style={{ width: `${Math.min((treatment.sessionsCompleted / treatment.sessionsRequired) * 100, 100)}%` }} 
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Payments */}
                        <div>
                          <h5 className="text-xs font-semibold text-white mb-3">Log Payment for {treatment.name}</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
                            <input 
                              type="number" 
                              placeholder="Amount (₹)"
                              value={newPayment.amount}
                              onChange={e => setNewPayment({...newPayment, amount: e.target.value})}
                              className="px-4 py-2.5 rounded-lg bg-[#1a1a2e] border border-white/5 text-white text-sm focus:outline-none focus:border-amber-500"
                            />
                            <input 
                              type="date"
                              style={{ colorScheme: 'dark' }}
                              value={newPayment.date}
                              onChange={e => setNewPayment({...newPayment, date: e.target.value})}
                              className="px-4 py-2.5 rounded-lg bg-[#1a1a2e] border border-white/5 text-white text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                            />
                            <select
                              style={{ colorScheme: 'dark' }}
                              value={newPayment.method}
                              onChange={e => setNewPayment({...newPayment, method: e.target.value})}
                              className="px-4 py-2.5 rounded-lg bg-[#1a1a2e] border border-white/5 text-white text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                            >
                              <option value="Cash" className="bg-[#1a1a2e]">Cash</option>
                              <option value="UPI" className="bg-[#1a1a2e]">UPI</option>
                              <option value="Card" className="bg-[#1a1a2e]">Card</option>
                              <option value="Bank Transfer" className="bg-[#1a1a2e]">Bank Transfer</option>
                            </select>
                            <input 
                              type="text" 
                              placeholder="Notes (Optional)"
                              value={newPayment.notes}
                              onChange={e => setNewPayment({...newPayment, notes: e.target.value})}
                              className="px-4 py-2.5 rounded-lg bg-[#1a1a2e] border border-white/5 text-white text-sm focus:outline-none focus:border-amber-500"
                            />
                            <div className="col-span-2 md:col-span-4 flex justify-end mt-2">
                              <button onClick={() => addPayment(treatment.id)} type="button" className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-lg shadow-green-900/20">
                                <Plus size={14} /> Add Payment to Record
                              </button>
                            </div>
                          </div>
                          
                          {treatment.paymentHistory?.length > 0 && (
                            <div className="mt-4 border border-white/5 rounded-2xl overflow-hidden">
                              <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-white/5 text-xs uppercase text-gray-500">
                                  <tr>
                                    <th className="px-4 py-3 font-semibold">Date</th>
                                    <th className="px-4 py-3 font-semibold">Amount</th>
                                    <th className="px-4 py-3 font-semibold">Method</th>
                                    <th className="px-4 py-3 font-semibold">Notes</th>
                                    <th className="px-4 py-3 text-right font-semibold">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-black/20">
                                  {treatment.paymentHistory.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-white/[0.02] transition">
                                      <td className="px-4 py-3 text-white">{new Date(p.date).toLocaleDateString()}</td>
                                      <td className="px-4 py-3 font-bold text-green-500">₹{p.amount.toLocaleString()}</td>
                                      <td className="px-4 py-3">{p.method}</td>
                                      <td className="px-4 py-3 text-xs">{p.notes || '-'}</td>
                                      <td className="px-4 py-3 text-right">
                                        <button onClick={() => removePayment(treatment.id, p.id)} className="text-red-500/50 hover:text-red-500 transition">
                                          <Trash2 size={14} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  {draftProfile?.treatments?.length === 0 && (
                    <div className="text-center p-8 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-gray-400 mb-4">No treatments found for this patient.</p>
                      <button onClick={createNewTreatment} className="px-6 py-2 bg-amber-500 text-white text-sm font-bold rounded-full hover:bg-amber-400 transition">
                        Create Treatment Plan
                      </button>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => savePatientProfile(selectedPatient.identifier)}
                      disabled={profileSaveStatus === 'saving'}
                      className={`px-8 py-3.5 rounded-full disabled:opacity-50 text-white text-sm font-bold transition-all duration-300 flex items-center gap-2 shadow-lg
                        ${profileSaveStatus === 'saved' ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20' : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-900/20'}`}
                    >
                      {profileSaveStatus === 'saving' && 'Saving Profile...'}
                      {profileSaveStatus === 'saved' && <><Check size={16} /> Saved Successfully!</>}
                      {profileSaveStatus !== 'saving' && profileSaveStatus !== 'saved' && 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'records' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={14} className="text-amber-500" />
                      Prescriptions & Reports
                    </h4>
                    <div className="flex items-center gap-3">
                      {doctorsList.length > 0 && (
                        <select 
                          value={selectedPrintDoctor}
                          onChange={e => setSelectedPrintDoctor(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition border border-gray-700 focus:outline-none focus:border-amber-500"
                        >
                          {doctorsList.map(doc => (
                            <option key={doc.id} value={doc.id}>{doc.name}</option>
                          ))}
                        </select>
                      )}
                      <button 
                        onClick={() => setUploadModal({ isOpen: true, identifier: selectedPatient.identifier })}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition border border-gray-700"
                      >
                        <Plus size={12} /> Add New
                      </button>
                    </div>
                  </div>
                  
                  {patientRecords.length > 0 ? (
                    <div className="space-y-3">
                      {patientRecords.map(r => (
                        <div key={r.id} className="p-4 rounded-xl bg-[#1a1a2e] border border-gray-800">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-white font-medium capitalize text-sm">{r.type}</p>
                              <p className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString()}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-800 text-gray-400 border border-gray-700">{r.type}</span>
                          </div>
                          {r.notes && <p className="text-sm text-gray-400 mb-3 bg-[#12122a] p-3 rounded-lg border border-gray-800/50">{r.notes}</p>}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800/50">
                            <div className="flex gap-2">
                              <a href={`/api/records/${r.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:text-amber-400 transition bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-md">
                                <Eye size={12} /> View Document
                              </a>
                              {(r.type.toLowerCase() === 'prescription' || r.notes) && (
                                <button 
                                  onClick={() => handlePrint(r)}
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-md"
                                >
                                  <Printer size={12} /> Print Prescription
                                </button>
                              )}
                            </div>
                            <button 
                              onClick={() => deleteRecord(r.id)}
                              className="text-gray-500 hover:text-red-500 transition p-1.5 rounded hover:bg-red-500/10"
                              title="Delete record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-[#1a1a2e] rounded-xl border border-dashed border-gray-700 text-gray-500 flex flex-col items-center">
                      <FileText size={32} className="text-gray-700 mb-3" />
                      <p className="text-sm mb-4">No medical records or medicines attached.</p>
                      <button 
                        onClick={() => setUploadModal({ isOpen: true, identifier: selectedPatient.identifier })}
                        className="px-4 py-2 rounded-lg bg-amber-600/10 text-amber-500 text-sm font-semibold transition border border-amber-600/20 hover:bg-amber-600/20"
                      >
                        Upload First Document
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="space-y-4 animate-fade-in">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Calendar size={14} className="text-amber-500" />
                    Appointment History
                  </h4>
                  {patientAppts.length > 0 ? (
                    <div className="space-y-3">
                      {patientAppts.map(a => (
                        <div key={a.id} className="p-4 rounded-xl bg-[#1a1a2e] border border-gray-800 flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{a.treatment}</p>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                              <Calendar size={12} /> {a.preferredDate} at {a.preferredTime}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{a.clinic}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            a.status === 'Completed' ? 'bg-green-900/30 text-green-400 border border-green-900/50' : 
                            a.status === 'Confirmed' ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}>
                            {a.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic p-6 text-center bg-[#1a1a2e] rounded-xl border border-gray-800">No appointments found.</p>
                  )}
                </div>
              )}

              {activeTab === 'aftercare' && (
                <div className="space-y-4 animate-fade-in">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <FileText size={14} className="text-amber-500" />
                    Custom Aftercare Instructions
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">These instructions will be securely displayed on the patient's personal dashboard.</p>
                  
                  <div className="relative">
                    <textarea
                      value={draftAftercare[selectedPatient.identifier] ?? aftercare[selectedPatient.identifier] ?? ''}
                      onChange={(e) => setDraftAftercare(prev => ({ ...prev, [selectedPatient.email]: e.target.value }))}
                      onBlur={(e) => saveAftercare(selectedPatient.identifier, e.target.value)}
                      placeholder="Type personalized aftercare instructions here..."
                      className="w-full px-4 py-4 rounded-xl bg-[#1a1a2e] border border-gray-800 text-sm text-white focus:outline-none focus:border-amber-500 resize-none h-64 pr-10 shadow-inner"
                    />
                    <div className="absolute right-4 top-4">
                      {saveStatus[selectedPatient.identifier] === 'saving' && <span className="text-xs text-amber-500 animate-pulse">Saving...</span>}
                      {saveStatus[selectedPatient.identifier] === 'saved' && <Check size={16} className="text-green-500" />}
                      {saveStatus[selectedPatient.identifier] === 'error' && <X size={16} className="text-red-500" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      Auto-saves when you click outside, or click Save.
                    </p>
                    <button
                      onClick={() => saveAftercare(selectedPatient.identifier, draftAftercare[selectedPatient.identifier] ?? aftercare[selectedPatient.identifier] ?? '')}
                      disabled={saveStatus[selectedPatient.identifier] === 'saving'}
                      className={`px-5 py-2 rounded-xl disabled:opacity-50 text-white text-sm font-bold transition flex items-center gap-2
                        ${saveStatus[selectedPatient.identifier] === 'saved' 
                          ? 'bg-green-600 hover:bg-green-500' 
                          : 'bg-amber-600 hover:bg-amber-500'}`}
                    >
                      {saveStatus[selectedPatient.identifier] === 'saving' && 'Saving...'}
                      {saveStatus[selectedPatient.identifier] === 'saved' && <><Check size={16} /> Saved!</>}
                      {saveStatus[selectedPatient.identifier] !== 'saving' && saveStatus[selectedPatient.identifier] !== 'saved' && 'Save Instructions'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal (Overlaps everything) */}
      {uploadModal.isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1a2e] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-800">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Upload Medical Record</h3>
              <button onClick={() => setUploadModal({ isOpen: false, identifier: '' })} className="text-gray-500 hover:text-white transition bg-gray-800/50 hover:bg-gray-800 p-2 rounded-full">
                <X size={16} />
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
                  <option value="prescription">Prescription / Medicine</option>
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
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Notes & Medicines (Optional)</label>
                <textarea 
                  value={uploadForm.notes}
                  onChange={e => setUploadForm({ ...uploadForm, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#12122a] border border-gray-700 text-white text-sm focus:outline-none focus:border-amber-500 resize-none h-24"
                  placeholder="e.g. Prescribed Amoxicillin 500mg, review in 1 week..."
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Attach Document (Image/PDF)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    disabled={!!uploading}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-900/30 file:text-amber-400 hover:file:bg-amber-900/50 transition cursor-pointer"
                  />
                  {uploading && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500 animate-pulse">Uploading...</span>}
                  {uploadForm.fileUrl && !uploading && <Check size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setUploadModal({ isOpen: false, identifier: '' })} className="flex-1 py-3 rounded-xl border border-gray-700 text-sm font-semibold text-gray-300 hover:bg-gray-800 transition">Cancel</button>
                <button 
                  type="submit" 
                  disabled={!uploadForm.fileUrl || !!uploading || recordSaveStatus === 'saving' || recordSaveStatus === 'saved'} 
                  className={`flex-1 py-3 rounded-xl disabled:opacity-50 text-white text-sm font-bold transition flex items-center justify-center gap-2
                    ${recordSaveStatus === 'saved' ? 'bg-green-600 hover:bg-green-500' : 'bg-amber-600 hover:bg-amber-500'}`}
                >
                  {recordSaveStatus === 'saving' && 'Saving...'}
                  {recordSaveStatus === 'saved' && <><Check size={16} /> Saved!</>}
                  {recordSaveStatus !== 'saving' && recordSaveStatus !== 'saved' && 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
