import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'
import { User as UserModel } from '@/lib/models'

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json()
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    await connectToDatabase()
    
    // Find user by token and ensure token hasn't expired
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return NextResponse.json({ error: 'Password reset token is invalid or has expired.' }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10)

    // Update user and clear token fields
    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
