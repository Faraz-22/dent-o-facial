import { NextResponse } from 'next/server'
import { getAppointments, saveAppointment, Appointment as JSONAppointment, createNotification } from '@/lib/db'
import { connectToDatabase } from '@/lib/mongodb'
import { Appointment as AppointmentModel, Notification as NotificationModel, PatientProfile, Counter } from '@/lib/models'
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

    let newAppointment;
    let isDbConnected = false;
    let patientSerialCode = '';

    // 1. Create Appointment
    try {
      await connectToDatabase()
      isDbConnected = true;

      // Calculate OPD Number (reset daily per clinic)
      const opdCount = await AppointmentModel.countDocuments({
        clinic: data.clinic,
        preferredDate: data.preferredDate
      });
      const opdNumber = opdCount + 1;

      // Handle Sequential Serial Code
      const identifier = data.email ? { email: data.email } : { phone: data.phone }
      const profile = await PatientProfile.findOne(identifier)
      
      if (profile && profile.serialCode) {
        patientSerialCode = profile.serialCode;
      } else {
        const counter = await Counter.findOneAndUpdate(
          { id: 'patientSerial' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        patientSerialCode = counter.seq.toString().padStart(6, '0');
        
        if (profile) {
          await PatientProfile.updateOne(identifier, { serialCode: patientSerialCode });
        }
      }
      
      newAppointment = await AppointmentModel.create({
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
        opdNumber,
        patientSerialCode,
        userId: data.userId
      })
    } catch (dbErr) {
      console.warn('MongoDB connection/insert failed, falling back to JSON', dbErr)
      isDbConnected = false;
      
      // Basic fallback if DB is entirely down (no persistent opd/serial code generation easily possible without DB)
      newAppointment = {
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
      
      try {
        saveAppointment(newAppointment as JSONAppointment)
      } catch (fsErr) {
        console.error('Failed to save appointment to JSON fallback:', fsErr)
      }
    }

    // 2. Perform Side Effects (Notifications, Profiles, Emails)
    // Wrap in try-catch so they don't fail the main request
    try {
      if (isDbConnected) {
        try {
          await NotificationModel.create({
            id: Date.now().toString(),
            title: 'New Appointment',
            message: `${data.patientName} booked an appointment for ${data.treatment} at ${data.clinic}.`,
            type: 'Appointment',
            read: false
          })
        } catch (notifErr) {
          console.error('Failed to create notification in DB:', notifErr)
        }

        try {
          // Auto-create treatment plan based on email or phone
          const identifier = data.email ? { email: data.email } : { phone: data.phone }
          const profile = await PatientProfile.findOne(identifier)
          
          if (profile) {
            const hasTreatment = profile.treatments?.some((t: any) => t.name === data.treatment)
            if (!hasTreatment) {
              await PatientProfile.updateOne(
                identifier,
                {
                  $push: {
                    treatments: {
                      id: 'treatment-' + Date.now(),
                      name: data.treatment,
                      totalCost: 0,
                      paymentHistory: [],
                      sessionsRequired: 0,
                      sessionsCompleted: 0,
                      createdAt: new Date()
                    }
                  }
                }
              )
            }
          } else {
            // Create new profile with this treatment
            await PatientProfile.create({
               ...(data.email ? { email: data.email } : {}),
               phone: data.phone,
               name: data.patientName,
               serialCode: patientSerialCode,
               treatments: [{
                  id: 'treatment-' + Date.now(),
                  name: data.treatment,
                  totalCost: 0,
                  paymentHistory: [],
                  sessionsRequired: 0,
                  sessionsCompleted: 0,
                  createdAt: new Date()
               }]
            })
          }
        } catch (profileErr) {
          console.error('Failed to update patient profile:', profileErr)
        }
      } else {
        try {
          createNotification('New Appointment', `${data.patientName} booked an appointment for ${data.treatment} at ${data.clinic}.`, 'Appointment')
        } catch (notifFsErr) {
          console.error('Failed to save notification to JSON:', notifFsErr)
        }
      }

      // Emails
      try {
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
      } catch (emailErr) {
        console.error('Failed to send emails:', emailErr)
      }

    } catch (sideEffectsErr) {
      console.error('Unexpected error during side effects:', sideEffectsErr)
    }

    return NextResponse.json({ success: true, appointment: newAppointment })
  } catch (error) {
    console.error('Fatal error in POST /api/appointments:', error)
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}
