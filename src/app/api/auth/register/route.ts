import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SecurityUtils, rateLimiters } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    // Check rate limit
    if (!rateLimiters.auth(ip)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const { email, password, name, walletAddress, phone, country, role, organizationName } = await request.json()

    // Input validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!SecurityUtils.isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Validate wallet address if provided
    if (walletAddress && !SecurityUtils.isValidWalletAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedName = SecurityUtils.sanitizeInput(name)
    const sanitizedEmail = SecurityUtils.sanitizeInput(email.toLowerCase())

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: sanitizedEmail },
          walletAddress ? { walletAddress } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or wallet address already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await SecurityUtils.hashPassword(password)
    const normalizedRole = typeof role === 'string' ? role.toUpperCase() : 'CLIENT'
    const allowedRoles = ['CLIENT', 'WORKER', 'AI_AGENT', 'REVIEWER', 'ADMIN']

    // Create user
    const user = await db.user.create({
      data: {
        email: sanitizedEmail,
        name: sanitizedName,
        passwordHash: hashedPassword,
        walletAddress,
        phone: phone ? SecurityUtils.sanitizeInput(phone) : null,
        country: country ? SecurityUtils.sanitizeInput(country) : 'Zambia',
        role: allowedRoles.includes(normalizedRole) ? normalizedRole as any : 'CLIENT',
        organizationName: organizationName ? SecurityUtils.sanitizeInput(organizationName) : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        role: true,
        trustScore: true,
        kycStatus: true,
        createdAt: true
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entityType: 'USER',
        entityId: user.id,
        metadata: JSON.stringify({ email: sanitizedEmail })
      }
    })

    return NextResponse.json({ 
      message: 'User registered successfully',
      user 
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}