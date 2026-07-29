import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { UserTestimonial, SiteContent } from '@/lib/models'
import { readContent, writeContent } from '@/lib/content'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { name, email, avatar, rating, review, treatment } = await request.json()

    if (!name || !email || !rating || !review) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectToDatabase()

    const testimonialId = `testimonial-${Date.now()}`

    // 1. Save to UserTestimonial collection for tracking
    await UserTestimonial.create({
      id: testimonialId,
      patientName: name,
      email,
      avatar,
      rating,
      review,
      treatment,
      status: 'Approved' // The user wants them to go live immediately
    })

    // 2. Inject directly into SiteContent so it goes live on the landing page immediately
    const liveTestimonial = {
      id: testimonialId,
      name,
      location: 'Verified Patient',
      treatment: treatment || 'General Consultation',
      rating,
      text: review
    }

    try {
      // Find the main SiteContent document
      const siteContent = await SiteContent.findOne({ id: 'main' })
      if (siteContent) {
        // Ensure testimonials array exists
        const currentTestimonials = Array.isArray(siteContent.testimonials) ? siteContent.testimonials : []
        
        // Add new testimonial to the top of the list
        const updatedTestimonials = [liveTestimonial, ...currentTestimonials]
        
        // Save back to DB
        await SiteContent.findOneAndUpdate(
          { id: 'main' },
          { $set: { testimonials: updatedTestimonials } },
          { strict: false }
        )
      } else {
        // Fallback for JSON
        const content = readContent()
        if (content) {
          const currentTestimonials = Array.isArray(content.testimonials) ? content.testimonials : []
          ;(content as any).testimonials = [liveTestimonial, ...currentTestimonials]
          writeContent(content)
        }
      }
    } catch (dbErr) {
      console.warn('Failed to inject testimonial into SiteContent', dbErr)
    }

    return NextResponse.json({ success: true, message: 'Testimonial added successfully' })
  } catch (err) {
    console.error('Testimonial submission failed:', err)
    return NextResponse.json({ error: 'Failed to submit testimonial' }, { status: 500 })
  }
}
