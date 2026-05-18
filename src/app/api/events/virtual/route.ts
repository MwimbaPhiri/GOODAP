import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { eventId, meetingType, participants, agenda } = await request.json()

    // Get event details
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: { name: true, email: true }
        },
        attendees: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Generate meeting link using AI
    const zai = await ZAI.create()
    
    const meetingPrompt = `Generate a professional virtual meeting setup for:
    Event: ${event.title}
    Type: ${meetingType}
    Participants: ${participants}
    Agenda: ${agenda}
    
    Create:
    1. A Google Meet link (mock for demo)
    2. Meeting ID
    3. Password
    4. Host instructions
    5. Participant guidelines
    
    Format as JSON with: meetLink, meetingId, password, hostInstructions, participantGuidelines`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a virtual meeting coordinator. Generate professional meeting details and always respond with valid JSON.'
        },
        {
          role: 'user',
          content: meetingPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const meetingDetails = JSON.parse(completion.choices[0].message.content)

    // Update event with virtual link
    await db.event.update({
      where: { id: eventId },
      data: {
        virtualLink: meetingDetails.meetLink,
        isVirtual: true
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        userId: event.organizerId,
        action: 'CREATE_VIRTUAL_MEETING',
        entityType: 'EVENT',
        entityId: eventId,
        eventId,
        metadata: JSON.stringify({
          meetingType,
          participants,
          meetLink: meetingDetails.meetLink
        })
      }
    })

    return NextResponse.json({
      success: true,
      meetingDetails,
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        organizer: event.organizer,
        attendees: event.attendees
      }
    })
  } catch (error) {
    console.error('Virtual meeting creation error:', error)
    
    // Fallback meeting details
    const fallbackDetails = {
      meetLink: `https://meet.google.com/mock-${Date.now()}`,
      meetingId: `mock-${Date.now().toString(36)}`,
      password: 'goodap2024',
      hostInstructions: [
        'Start the meeting 10 minutes early',
        'Test your audio and video',
        'Share your screen for presentations',
        'Record the meeting for participants'
      ],
      participantGuidelines: [
        'Join 5 minutes early',
        'Mute yourself when not speaking',
        'Use the chat for questions',
        'Keep your video on if possible'
      ]
    }

    return NextResponse.json({
      success: true,
      meetingDetails: fallbackDetails,
      message: 'Meeting created with fallback settings'
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID required' },
        { status: 400 }
      )
    }

    const event = await db.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        virtualLink: true,
        isVirtual: true,
        date: true,
        organizer: {
          select: { name: true, email: true }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Virtual meeting fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}