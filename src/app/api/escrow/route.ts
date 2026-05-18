import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SecurityUtils } from '@/lib/security'

const allowedActions = ['fund', 'release', 'refund', 'split'] as const

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = String(body.action || 'fund').toLowerCase()

    if (!allowedActions.includes(action as any)) {
      return NextResponse.json({ error: 'Invalid escrow action' }, { status: 400 })
    }

    const amount = Number(body.amount)
    if (Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }

    const currency = SecurityUtils.sanitizeInput(body.currency || 'ZMW').toUpperCase()
    const provider = SecurityUtils.sanitizeInput(body.provider || 'Airtel Money')

    if (!body.taskId) {
      return NextResponse.json({
        status: 'simulated',
        action,
        amount,
        currency,
        provider,
        escrowReference: `sim-escrow-${Date.now().toString(36)}`,
        message: 'Escrow movement simulated without a persisted task.',
      })
    }

    const escrowAccount = await db.escrowAccount.upsert({
      where: { taskId: body.taskId },
      update: {
        balance: action === 'fund' ? { increment: amount } : { decrement: amount },
        status: action === 'release' ? 'PARTIALLY_RELEASED' : action === 'refund' ? 'REFUNDING' : 'FUNDED',
      },
      create: {
        taskId: body.taskId,
        balance: action === 'fund' ? amount : 0,
        currency,
        status: action === 'fund' ? 'FUNDED' : 'PENDING',
        providerRef: `provider-${Date.now().toString(36)}`,
        contractAddress: body.contractAddress || `sim-${Date.now().toString(36)}`,
        fundedAt: action === 'fund' ? new Date() : null,
      },
    })

    const transaction = await db.escrowTransaction.create({
      data: {
        escrowAccountId: escrowAccount.id,
        type: action.toUpperCase() as any,
        amount,
        currency,
        status: 'COMPLETED',
        provider,
        externalRef: body.externalRef || `${action}-${Date.now().toString(36)}`,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      },
    })

    return NextResponse.json({ escrowAccount, transaction })
  } catch (error) {
    console.error('Escrow simulation error:', error)
    return NextResponse.json({ error: 'Failed to process escrow action' }, { status: 500 })
  }
}
