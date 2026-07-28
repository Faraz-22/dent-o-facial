import { NextResponse } from 'next/server'
import { getAppointments, saveAppointment, Appointment as JSONAppointment, createNotification } from '@/lib/db'
import { connectToDatabase } from '@/lib/mongodb'
import { Appointment as AppointmentModel, Notification as NotificationModel } from '@/lib/models'
import { sendEmail } from '@/lib/email'

export async function GET() {
  try {
    await connectToDatabase()
    const appointments = await AppointmentModel.find({}).sort({ createdAt: -1 })
    return NextResponse.json(appointments)
  } catch (err) {
    console.warn('MongoDB connection failed, falling back to JSON', err)
    const appointments = getAppointments()
    // Ensure recent first
    return NextResponse.json(appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const id = Date.now().toString()

    try {
      await connectToDatabase()
      
      const newAppointment = await AppointmentModel.create({
        id,
        patientName: data.patientName,
        phone: data.phone,
        email: data.email || '',
        clinic: data.clinic,
        treatment: data.treatment,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        message: data.message,
        status: 'New',
        userId: data.userId
      })

      await NotificationModel.create({
        id: Date.now().toString(),
        title: 'New Appointment',
        message: `${data.patientName} booked an appointment for ${data.treatment} at ${data.clinic}.`,
        type: 'Appointment',
        read: false
      })

      if (data.email) {
        await sendEmail({
          to: data.email,
          subject: 'Appointment Confirmation - Dent-O-Facial',
          html: `<p>Dear ${data.patientName},</p><p>Your appointment for <strong>${data.treatment}</strong> at <strong>${data.clinic}</strong> on <strong>${data.preferredDate}</strong> at <strong>${data.preferredTime}</strong> has been received and is currently pending confirmation.</p><p>We will contact you shortly.</p>`
        })
      }
      if (process.env.ADMIN_EMAIL) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: 'New Patient Appointment',
          html: `<p>New appointment booked by ${data.patientName} (${data.phone}) for ${data.treatment}.</p>`
        })
      }

      return NextResponse.json({ success: true, appointment: newAppointment })
    } catch (dbErr) {
      console.warn('MongoDB connection failed, falling back to JSON', dbErr)
      
      const newAppointment: JSONAppointment = {
        id,
        patientName: data.patientName,
        phone: data.phone,
        email: data.email,
        clinic: data.clinic,
        treatment: data.treatment,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        message: data.message,
        status: 'New',
        createdAt: new Date().toISOString(),
        userId: data.userId
      }
      
      saveAppointment(newAppointment)
      createNotification('New Appointment', `${data.patientName} booked an appointment for ${data.treatment} at ${data.clinic}.`, 'Appointment')
      
      if (data.email) {
        await sendEmail({
          to: data.email,
          subject: 'Appointment Confirmation - Dent-O-Facial',
          html: `<p>Dear ${data.patientName},</p><p>Your appointment for <strong>${data.treatment}</strong> at <strong>${data.clinic}</strong> on <strong>${data.preferredDate}</strong> at <strong>${data.preferredTime}</strong> has been received and is currently pending confirmation.</p><p>We will contact you shortly.</p>`
        })
      }
      if (process.env.ADMIN_EMAIL) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: 'New Patient Appointment',
          html: `<p>New appointment booked by ${data.patientName} (${data.phone}) for ${data.treatment}.</p>`
        })
      }
      
      return NextResponse.json({ success: true, appointment: newAppointment })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}
