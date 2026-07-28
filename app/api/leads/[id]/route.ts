import { NextResponse } from 'next/server'
import { getLeads, saveLead } from '@/lib/db'

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const data = await request.json()
    const leads = getLeads()
    const index = leads.findIndex(l => l.id === params.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }
    
    const updated = { ...leads[index], ...data }
    saveLead(updated)
    
    return NextResponse.json({ success: true, lead: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}
