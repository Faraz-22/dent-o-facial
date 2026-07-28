export function buildWhatsAppUrl(phone: string, text: string): string {
  // Ensure phone has only digits, keeping the country code if provided, otherwise default to India 91
  const cleanPhone = phone.replace(/\D/g, '')
  const targetPhone = cleanPhone.startsWith('91') || cleanPhone.length > 10 
    ? cleanPhone 
    : `91${cleanPhone}`
    
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`
}

export const WA_MESSAGES = {
  bookingConfirmation: (name: string, clinic: string, treatment: string, date: string, time: string) => 
    `Hello, I want to confirm my appointment at Dent-O-Facial.\nName: ${name}\nClinic: ${clinic}\nTreatment: ${treatment}\nDate: ${date}\nTime: ${time}`,
    
  treatmentInquiry: (treatmentName: string) =>
    `Hello Dent-O-Facial, I am interested in learning more about ${treatmentName}. Please guide me.`,
    
  clinicInquiry: (clinicName: string) =>
    `Hello Dent-O-Facial, I would like to book an appointment at the ${clinicName} clinic.`,
    
  adminFollowUp: (name: string, treatment: string) =>
    `Hello ${name}, this is Dent-O-Facial. We received your interest in ${treatment}. When would you like to visit us?`
}
