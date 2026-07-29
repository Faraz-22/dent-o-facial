import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/mongodb'
import { UserTestimonial, SiteContent } from '@/lib/models'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin-auth')?.value === 'true'
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    // Admin gets all testimonials to moderate
    const testimonials = await UserTestimonial.find().sort({ createdAt: -1 }).lean()
    
    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Failed to get testimonials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, avatar, rating, review, treatment } = await request.json()

    if (!name || !email || !rating || !review) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectToDatabase()

    const testimonialId = `testimonial-${Date.now()}`

    // Save to UserTestimonial collection for tracking - strictly as Pending
    const newTestimonial = await UserTestimonial.create({
      id: testimonialId,
      patientName: name,
      email,
      avatar,
      rating,
      review,
      treatment,
      status: 'Pending'
    })

    return NextResponse.json({ success: true, message: 'Testimonial submitted for review', testimonial: newTestimonial })
  } catch (err) {
    console.error('Testimonial submission failed:', err)
    return NextResponse.json({ error: 'Failed to submit testimonial' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin-auth')?.value === 'true'
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectToDatabase()

    const testimonial = await UserTestimonial.findOneAndUpdate(
      { id },
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    )

    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    // If it's being approved, inject it into SiteContent
    if (status === 'Approved') {
      const liveTestimonial = {
        id: testimonial.id,
        name: testimonial.patientName,
        location: 'Verified Patient',
        treatment: testimonial.treatment || 'General Consultation',
        rating: testimonial.rating,
        text: testimonial.review
      }

      const siteContent = await SiteContent.findOne({ id: 'main' })
      if (siteContent) {
        const currentTestimonials = Array.isArray(siteContent.testimonials) ? siteContent.testimonials : []
        // Check if it already exists to avoid duplicates if approved multiple times
        const exists = currentTestimonials.some(t => t.id === testimonial.id)
        if (!exists) {
          const updatedTestimonials = [liveTestimonial, ...currentTestimonials]
          await SiteContent.findOneAndUpdate(
            { id: 'main' },
            { $set: { testimonials: updatedTestimonials } },
            { strict: true }
          )
        }
      }
    }

    return NextResponse.json({ success: true, testimonial })
  } catch (err) {
    console.error('Testimonial moderation failed:', err)
    return NextResponse.json({ error: 'Failed to moderate testimonial' }, { status: 500 })
  }
}
