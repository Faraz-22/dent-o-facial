export type AnalyticsEventType = 
  | 'page_view'
  | 'treatment_view'
  | 'treatment_booking_click'
  | 'whatsapp_click'
  | 'phone_click'
  | 'booking_started'
  | 'booking_submitted'
  | 'user_registered'
  | 'lead_created'
  | 'appointment_status_changed'

export interface AnalyticsEventPayload {
  type: AnalyticsEventType
  page?: string
  treatment?: string
  method?: string
  userEmail?: string
  clinic?: string
  [key: string]: any
}

export async function trackEvent(payload: AnalyticsEventPayload) {
  try {
    // Only track in browser
    if (typeof window === 'undefined') return
    
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error('Analytics tracking failed:', error)
  }
}
