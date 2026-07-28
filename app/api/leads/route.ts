import { NextResponse } from 'next/server'
import { getLeads, saveLead, Lead as JSONLead, createNotification } from '@/lib/db'
import { connectToDatabase } from '@/lib/mongodb'
import { Lead as LeadModel, Notification as NotificationModel } from '@/lib/models'
import { sendEmail } from '@/lib/email'

export async function GET() {
  try {
    await connectToDatabase()
    const leads = await LeadModel.find({}).sort({ createdAt: -1 })
    return NextResponse.json(leads)
  } catch (err) {
    console.warn('MongoDB connection failed, falling back to JSON', err)
    const leads = getLeads()
    return NextResponse.json(leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    try {
      await connectToDatabase()
      
      let lead = await LeadModel.findOne({ phone: data.phone })
      if (lead) {
        // Update existing lead
        lead = await LeadModel.findOneAndUpdate(
          { phone: data.phone },
          {
            ...data,
            status: data.status || lead.status,
            lastInteraction: new Date().toISOString()
          },
          { new: true }
        )
      } else {
        // Create new lead
        lead = await LeadModel.create({
          id: Date.now().toString(),
          name: data.name,
          phone: data.phone,
          email: data.email,
          treatment: data.treatment,
          clinic: data.clinic,
          source: data.source || 'Unknown',
          status: 'New',
          priority: data.priority || 'Medium',
          lastInteraction: new Date().toISOString(),
          userId: data.userId
        })

        await NotificationModel.create({
          id: Date.now().toString(),
          title: 'New Lead',
          message: `Lead captured from ${lead.source}: ${lead.name}`,
          type: 'Lead',
          read: false
        })

        if (process.env.ADMIN_EMAIL) {
          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: 'New Lead Captured - Dent-O-Facial',
            html: `<p>New lead captured from <strong>${lead.source}</strong>.</p><p>Name: ${lead.name}<br/>Phone: ${lead.phone}<br/>Treatment: ${lead.treatment || 'N/A'}</p>`
          })
        }
      }

      return NextResponse.json({ success: true, lead })
    } catch (dbErr) {
      console.warn('MongoDB connection failed, falling back to JSON', dbErr)
      
      // JSON Fallback Logic
      const allLeads = getLeads()
      const existingIndex = allLeads.findIndex(l => l.phone === data.phone)
      
      let lead: JSONLead
      if (existingIndex >= 0) {
        lead = {
          ...allLeads[existingIndex],
          ...data,
          status: data.status || allLeads[existingIndex].status,
          lastInteraction: new Date().toISOString()
        }
      } else {
        lead = {
          id: Date.now().toString(),
          name: data.name,
          phone: data.phone,
          email: data.email,
          treatment: data.treatment,
          clinic: data.clinic,
          source: data.source || 'Unknown',
          status: 'New',
          priority: data.priority || 'Medium',
          lastInteraction: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          userId: data.userId
        }
        createNotification('New Lead', `Lead captured from ${lead.source}: ${lead.name}`, 'Lead')
        if (process.env.ADMIN_EMAIL) {
          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: 'New Lead Captured - Dent-O-Facial',
            html: `<p>New lead captured from <strong>${lead.source}</strong>.</p><p>Name: ${lead.name}<br/>Phone: ${lead.phone}<br/>Treatment: ${lead.treatment || 'N/A'}</p>`
          })
        }
      }
      
      saveLead(lead)
      
      return NextResponse.json({ success: true, lead })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}
