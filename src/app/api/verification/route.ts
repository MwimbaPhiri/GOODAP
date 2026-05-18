import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requestOpenAIExplanation, scoreVerificationEvidence } from '@/lib/trust-scoring'
import { rateLimiters } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    if (!rateLimiters.verification(ip)) {
      return NextResponse.json({ error: 'Too many verification attempts. Please try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const result = scoreVerificationEvidence(body)
    let aiExplanation = null

    try {
      aiExplanation = await requestOpenAIExplanation(body, result)
    } catch (error) {
      console.error('OpenAI explanation fallback:', error)
    }

    const responsePayload = {
      ...result,
      aiExplanation,
      taskId: body.taskId,
      proofSubmissionId: body.proofSubmissionId,
    }

    if (body.taskId) {
      await db.verificationResult.create({
        data: {
          taskId: body.taskId,
          proofSubmissionId: body.proofSubmissionId || null,
          score: result.score,
          decision: result.decision.toUpperCase() as any,
          explanation: aiExplanation?.explanation || result.explanation,
          signals: JSON.stringify(result.signals),
          fraudFlags: JSON.stringify(result.fraudFlags),
          model: result.model,
        },
      })

      await db.task.update({
        where: { id: body.taskId },
        data: {
          status: result.decision === 'approved' ? 'APPROVED' : result.decision === 'review' ? 'DISPUTED' : 'PROOF_SUBMITTED',
          riskLevel: result.fraudFlags.length > 1 ? 'HIGH' : result.decision === 'review' ? 'MEDIUM' : 'LOW',
        },
      })
    }

    return NextResponse.json(responsePayload)
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Failed to verify proof' }, { status: 500 })
  }
}
