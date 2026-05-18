import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'tickets' or 'merchandise'
    const eventId = searchParams.get('eventId')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (type === 'tickets') {
      const tickets = await db.ticket.findMany({
        where: {
          isForSale: true,
          ...(eventId && { eventId })
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true
            }
          },
          owner: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })

      return NextResponse.json({ tickets })
    }

    if (type === 'merchandise') {
      const merchandise = await db.merchandise.findMany({
        where: {
          isActive: true,
          ...(eventId && { eventId })
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true
            }
          },
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })

      return NextResponse.json({ merchandise })
    }

    // Return both if no type specified
    const [tickets, merchandise] = await Promise.all([
      db.ticket.findMany({
        where: { isForSale: true },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true
            }
          },
          owner: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      db.merchandise.findMany({
        where: { isActive: true },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true
            }
          },
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    return NextResponse.json({ tickets, merchandise })
  } catch (error) {
    console.error('Marketplace fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, itemId, buyerId, paymentMethod } = await request.json()

    if (type === 'ticket') {
      const ticket = await db.ticket.findUnique({
        where: { id: itemId },
        include: { event: true }
      })

      if (!ticket || !ticket.isForSale) {
        return NextResponse.json(
          { error: 'Ticket not available for sale' },
          { status: 400 }
        )
      }

      // Create purchase record
      const purchase = await db.purchase.create({
        data: {
          buyerId,
          ticketId: itemId,
          amount: ticket.currentPrice,
          currency: ticket.currency,
          paymentMethod,
          status: 'COMPLETED'
        }
      })

      // Update ticket ownership
      await db.ticket.update({
        where: { id: itemId },
        data: {
          ownerId: buyerId,
          isForSale: false
        }
      })

      return NextResponse.json({ purchase }, { status: 201 })
    }

    if (type === 'merchandise') {
      const merchandise = await db.merchandise.findUnique({
        where: { id: itemId }
      })

      if (!merchandise || !merchandise.isActive || merchandise.inventory <= 0) {
        return NextResponse.json(
          { error: 'Merchandise not available' },
          { status: 400 }
        )
      }

      // Create purchase record
      const purchase = await db.purchase.create({
        data: {
          buyerId,
          merchandiseId: itemId,
          amount: merchandise.price,
          currency: merchandise.currency,
          paymentMethod,
          status: 'COMPLETED'
        }
      })

      // Update inventory
      await db.merchandise.update({
        where: { id: itemId },
        data: {
          inventory: merchandise.inventory - 1
        }
      })

      return NextResponse.json({ purchase }, { status: 201 })
    }

    return NextResponse.json(
      { error: 'Invalid item type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}