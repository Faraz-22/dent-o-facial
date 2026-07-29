import { NextResponse } from 'next/server'
import { getAppointments, saveAppointment } from '@/lib/db'
import { connectToDatabase } from '@/lib/mongodb'
import { Appointment as AppointmentModel } from '@/lib/models'

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const data = await request.json()
    
    try {
      await connectToDatabase()
      const updatedAppt = await AppointmentModel.findOneAndUpdate(
        { id: params.id },
        { $set: data },
        { new: true }
      )
      
      if (!updatedAppt) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
      }
      
      return NextResponse.json({ success: true, appointment: updatedAppt })
    } catch (dbErr) {
      console.warn('MongoDB connection failed, falling back to JSON', dbErr)
      const appointments = getAppointments()
      const index = appointments.findIndex(a => a.id === params.id)
      
      if (index === -1) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
      }
      
      const updated = { ...appointments[index], ...data }
      saveAppointment(updated)
      
      return NextResponse.json({ success: true, appointment: updated })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}
