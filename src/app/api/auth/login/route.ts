import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SecurityUtils, rateLimiters } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    if (!rateLimiters.auth(ip)) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 })
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email: SecurityUtils.sanitizeInput(String(email).toLowerCase()) },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        name: true,
        role: true,
        trustScore: true,
        country: true,
        phone: true,
        organizationName: true,
        kycStatus: true,
        createdAt: true,
      },
    })

    if (!user?.passwordHash || !(await SecurityUtils.verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const { passwordHash, ...safeUser } = user

    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        metadata: JSON.stringify({ email: user.email }),
      },
    })

    return NextResponse.json({ user: safeUser })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}
