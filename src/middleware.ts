import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add security headers
  const response = NextResponse.next()
  
  // Skip all middleware in development for better performance
  if (process.env.NODE_ENV === 'development') {
    // Only add basic CORS for API routes in development
    const path = request.nextUrl.pathname
    if (path.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, { status: 200 })
      }
    }
    
    return response
  }
  
  // Production middleware with full security features
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SecurityUtils } = require('@/lib/security')
    
    // Apply CSP and other security headers
    const securityHeaders = SecurityUtils.getCSPHeaders()
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Rate limiting by IP address
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const path = request.nextUrl.pathname
    
    // Apply different rate limits based on endpoint
    let isRateLimited = false
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { rateLimiters } = require('@/lib/security')
    
    if (path.startsWith('/api/auth')) {
      isRateLimited = !rateLimiters.auth(ip)
    } else if (path.startsWith('/api/events')) {
      isRateLimited = !rateLimiters.events(ip)
    } else if (path.startsWith('/api/ai/templates')) {
      isRateLimited = !rateLimiters.templates(ip)
    } else if (path.startsWith('/api/marketplace')) {
      isRateLimited = !rateLimiters.marketplace(ip)
    }

    if (isRateLimited) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        }
      )
    }

    // CORS handling for API routes
    if (path.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, { status: 200 })
      }
    }
  } catch (error) {
    // If security modules fail, continue with basic response
    console.error('Middleware error:', error)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}