import fs from 'fs'
import path from 'path'

// ---- Types ----

export interface Appointment {
  id: string
  patientName: string
  phone: string
  email?: string
  clinic: string
  treatment: string
  preferredDate: string
  preferredTime: string
  message?: string
  status: 'New' | 'Confirmed' | 'Visited' | 'Cancelled' | 'Follow-up Needed'
  adminNotes?: string
  createdAt: string
  userId?: string // Link to logged-in user if applicable
}

export interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  treatment?: string
  clinic?: string
  source: string // 'Appointment Form', 'WhatsApp Click', 'Phone Click', 'Treatment Page', 'Registration', 'Contact Page'
  status: 'New' | 'Contacted' | 'Booked' | 'Visited' | 'Lost' | 'Follow-up Needed'
  priority: 'High' | 'Medium' | 'Low'
  lastInteraction: string
  followUpDate?: string
  adminNotes?: string
  createdAt: string
  userId?: string
}

export interface AppNotification {
  id: string
  title: string
  message: string
  type: 'Appointment' | 'Lead' | 'User' | 'System'
  read: boolean
  createdAt: string
}

// ---- File Paths ----

const APPOINTMENTS_FILE = path.join(process.cwd(), 'data', 'appointments.json')
const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json')
const NOTIFICATIONS_FILE = path.join(process.cwd(), 'data', 'notifications.json')

// ---- Helpers ----

function readJson<T>(file: string): T[] {
  try {
    const raw = fs.readFileSync(file, 'utf-8')
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function writeJson<T>(file: string, data: T[]): void {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

// ---- Appointments ----

export function getAppointments(): Appointment[] {
  return readJson<Appointment>(APPOINTMENTS_FILE)
}

export function saveAppointment(appointment: Appointment): void {
  const data = getAppointments()
  const index = data.findIndex(a => a.id === appointment.id)
  if (index >= 0) {
    data[index] = appointment
  } else {
    data.push(appointment)
  }
  writeJson(APPOINTMENTS_FILE, data)
}

// ---- Leads ----

export function getLeads(): Lead[] {
  return readJson<Lead>(LEADS_FILE)
}

export function saveLead(lead: Lead): void {
  const data = getLeads()
  const index = data.findIndex(l => l.id === lead.id)
  if (index >= 0) {
    data[index] = lead
  } else {
    data.push(lead)
  }
  writeJson(LEADS_FILE, data)
}

// ---- Notifications ----

export function getNotifications(): AppNotification[] {
  return readJson<AppNotification>(NOTIFICATIONS_FILE)
}

export function saveNotification(notification: AppNotification): void {
  const data = getNotifications()
  const index = data.findIndex(n => n.id === notification.id)
  if (index >= 0) {
    data[index] = notification
  } else {
    data.push(notification)
  }
  writeJson(NOTIFICATIONS_FILE, data)
}

export function createNotification(title: string, message: string, type: AppNotification['type']) {
  saveNotification({
    id: Date.now().toString(),
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  })
}
