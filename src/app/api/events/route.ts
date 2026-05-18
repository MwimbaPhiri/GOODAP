import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SecurityUtils, rateLimiters } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const trending = searchParams.get('trending')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Cap at 50

    let whereClause: any = {}
    
    if (type && type !== 'all') {
      const upperType = type.toUpperCase()
      if (['SOCIAL', 'CORPORATE', 'HYBRID', 'WORKSHOP', 'CONFERENCE', 'NETWORKING', 'ENTERTAINMENT'].includes(upperType)) {
        whereClause.type = upperType
      } else {
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400 }
        )
      }
    }

    if (trending === 'true') {
      // Get events with most attendees in the last 7 days
      const events = await db.event.findMany({
        where: {
          ...whereClause,
          status: 'PUBLISHED'
        },
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          _count: {
            select: {
              attendees: true
            }
          }
        },
        orderBy: [
          {
            attendees: {
              _count: 'desc'
            }
          },
          {
            createdAt: 'desc'
          }
        ],
        take: limit
      })

      return NextResponse.json({ events })
    }

    const events = await db.event.findMany({
      where: {
        ...whereClause,
        status: 'PUBLISHED'
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            attendees: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      },
      take: limit
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Events fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    // Check rate limit
    if (!rateLimiters.events(ip)) {
      return NextResponse.json(
        { error: 'Too many event creation attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const eventData = await request.json()

    // Validate event data
    const validation = SecurityUtils.validateEventInput(eventData)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid event data', details: validation.errors },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedData = {
      title: SecurityUtils.sanitizeInput(eventData.title),
      description: SecurityUtils.sanitizeInput(eventData.description),
      type: eventData.type.toUpperCase(),
      category: SecurityUtils.sanitizeInput(eventData.category),
      date: new Date(eventData.date),
      duration: parseInt(eventData.duration),
      location: eventData.location ? SecurityUtils.sanitizeInput(eventData.location) : null,
      isVirtual: Boolean(eventData.isVirtual),
      virtualLink: eventData.virtualLink ? SecurityUtils.sanitizeInput(eventData.virtualLink) : null,
      maxAttendees: eventData.maxAttendees ? parseInt(eventData.maxAttendees) : null,
      price: parseFloat(eventData.price) || 0,
      currency: eventData.currency || 'USD',
      tags: eventData.tags && eventData.tags.length > 0 ? JSON.stringify(eventData.tags.slice(0, 10)) : null, // Limit to 10 tags
      status: 'DRAFT',
      organizerId: eventData.organizerId
    }

    // Create event
    const event = await db.event.create({
      data: sanitizedData,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: eventData.organizerId,
        action: 'CREATE_EVENT',
        entityType: 'EVENT',
        entityId: event.id,
        eventId: event.id,
        metadata: JSON.stringify({ 
          title: sanitizedData.title,
          type: sanitizedData.type,
          category: sanitizedData.category
        })
      }
    })

    return NextResponse.json({ 
      message: 'Event created successfully',
      event 
    }, { status: 201 })
  } catch (error) {
    console.error('Event creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}