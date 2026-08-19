import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/mongodb'
import { PatientProfile } from '@/lib/models'

const PROFILES_FILE = path.join(process.cwd(), 'data/patient-profiles.json')

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    // Auth Check
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin-auth')
    const userAuth = cookieStore.get('user-auth')
    
    let isAuthorized = false
    if (adminAuth?.value === 'true') {
      isAuthorized = true
    } else if (userAuth?.value) {
      try {
        const user = JSON.parse(userAuth.value)
        if (user.email === email || !email) {
          isAuthorized = true
        }
      } catch (e) {}
    }
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      await connectToDatabase()
      if (email) {
        const profile = await PatientProfile.findOne({ email }).lean()
        return NextResponse.json({ profile: profile || {} })
      }
      
      const allProfiles = await PatientProfile.find({}).lean()
      const profileMap: Record<string, any> = {}
      
      const migrateLegacyToTreatments = (item: any) => {
        if (item.treatments && item.treatments.length > 0) return item.treatments;
        
        // If no treatments array but has legacy data
        if (item.totalCost > 0 || item.totalPayments > 0 || item.sessionsRequired > 0 || item.paymentHistory?.length > 0) {
          return [{
            id: 'general-' + Date.now(),
            name: 'General Treatment (Legacy)',
            totalCost: item.totalCost || 0,
            paymentHistory: item.paymentHistory || [],
            sessionsRequired: item.sessionsRequired || 0,
            sessionsCompleted: item.sessionsCompleted || 0,
            createdAt: item.updatedAt || new Date().toISOString()
          }];
        }
        return [];
      };

      allProfiles.forEach((item: any) => {
        profileMap[item.email] = {
          totalCost: item.totalCost || 0,
          paymentHistory: item.paymentHistory || [],
          totalPayments: item.totalPayments || 0,
          dues: item.dues || 0,
          sessionsRequired: item.sessionsRequired || 0,
          sessionsCompleted: item.sessionsCompleted || 0,
          treatments: migrateLegacyToTreatments(item)
        }
      })
      return NextResponse.json(profileMap)
    } catch (dbErr) {
      console.warn('MongoDB failed for patient profiles GET, falling back to JSON', dbErr)
      let data = '{}'
      try {
        data = await fs.readFile(PROFILES_FILE, 'utf-8')
      } catch (e) {}
      
      const profiles = JSON.parse(data)
      
      if (email) {
        return NextResponse.json({ profile: profiles[email] || {} })
      }
      
      // We don't migrate JSON fallback dynamically right now as it's just a fallback, but we can do a simple map
      const mappedProfiles: any = {}
      Object.keys(profiles).forEach(k => {
        const item = profiles[k]
        mappedProfiles[k] = {
           ...item,
           treatments: item.treatments || []
        }
      })
      
      return NextResponse.json(mappedProfiles)
    }
  } catch (error) {
    return NextResponse.json({})
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const adminAuth = cookieStore.get('admin-auth')
    if (adminAuth?.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, totalPayments, dues, totalCost, paymentHistory, sessionsRequired, sessionsCompleted, treatments } = body

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    try {
      await connectToDatabase()
      await PatientProfile.findOneAndUpdate(
        { email },
        { 
          totalCost: Number(totalCost) || 0,
          paymentHistory: Array.isArray(paymentHistory) ? paymentHistory : [],
          totalPayments: Number(totalPayments) || 0, 
          dues: Number(dues) || 0, 
          sessionsRequired: Number(sessionsRequired) || 0, 
          sessionsCompleted: Number(sessionsCompleted) || 0,
          treatments: Array.isArray(treatments) ? treatments : [],
          updatedAt: new Date() 
        },
        { upsert: true, new: true }
      )
      return NextResponse.json({ success: true })
    } catch (dbErr) {
      console.warn('MongoDB failed for patient profiles POST, falling back to JSON', dbErr)
      let profilesData: any = {}
      try {
        const data = await fs.readFile(PROFILES_FILE, 'utf-8')
        profilesData = JSON.parse(data)
      } catch (e) {
        profilesData = {}
      }

      profilesData[email] = {
        totalCost: Number(totalCost) || 0,
        paymentHistory: Array.isArray(paymentHistory) ? paymentHistory : [],
        totalPayments: Number(totalPayments) || 0,
        dues: Number(dues) || 0,
        sessionsRequired: Number(sessionsRequired) || 0,
        sessionsCompleted: Number(sessionsCompleted) || 0,
        treatments: Array.isArray(treatments) ? treatments : [],
        updatedAt: new Date().toISOString()
      }
      
      try {
        await fs.writeFile(PROFILES_FILE, JSON.stringify(profilesData, null, 2))
      } catch (fsErr) {
        return NextResponse.json({ error: 'Failed to save patient profile (Read-only FS)' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Patient Profile POST Error:', error)
    return NextResponse.json({ error: 'Failed to save patient profile' }, { status: 500 })
  }
}
