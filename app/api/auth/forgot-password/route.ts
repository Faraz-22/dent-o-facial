import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectToDatabase } from '@/lib/mongodb'
import { User as UserModel } from '@/lib/models'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await connectToDatabase()
    
    const user = await UserModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
    if (!user) {
      // Don't leak that the user doesn't exist, just return success
      return NextResponse.json({ success: true })
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour from now

    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = resetPasswordExpires
    await user.save()

    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
    const resetUrl = `${siteUrl}/login?reset=${resetToken}`

    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Dent-O-Facial',
      html: `
        <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; color: #333;">
          <h2 style="color: #cda873;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
          <p>To reset your password, click the button below:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #cda873; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #666; word-break: break-all;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999;">Dent-O-Facial Clinic</p>
        </div>
      `
    })

    if (!emailSent) {
      // If SMTP is not configured, we should probably warn the user in development
      console.warn('Reset email was not sent because SMTP is not configured.')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
