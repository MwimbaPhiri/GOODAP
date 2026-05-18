import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [submissions, executions, auditEvents] = await Promise.all([
      db.governanceSubmission.findMany({
        include: { verification: true, executions: { orderBy: { createdAt: 'desc' }, take: 1 } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      db.governanceExecution.findMany({
        include: { submission: { select: { taskTitle: true, agentName: true, status: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      db.governanceAudit.findMany({
        include: { submission: { select: { taskTitle: true, agentName: true, status: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ])

    const counts = {
      total: submissions.length,
      pass: submissions.filter((submission) => submission.status === 'PASS').length,
      review: submissions.filter((submission) => submission.status === 'REVIEW').length,
      fail: submissions.filter((submission) => submission.status === 'FAIL').length,
      executed: executions.filter((execution) => execution.status === 'EXECUTED' || execution.status === 'OVERRIDDEN').length,
      blocked: executions.filter((execution) => execution.status === 'BLOCKED').length,
    }

    const averageTrustScore = submissions.length
      ? Math.round(submissions.reduce((sum, submission) => sum + (submission.verification?.finalTrustScore ?? 0), 0) / submissions.length)
      : 0

    return NextResponse.json({ counts, averageTrustScore, submissions, executions, auditEvents })
  } catch (error) {
    console.error('Governance summary error:', error)
    return NextResponse.json({ error: 'Failed to load governance summary' }, { status: 500 })
  }
}
