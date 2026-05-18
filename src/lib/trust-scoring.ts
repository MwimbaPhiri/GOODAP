export type VerificationEvidence = {
  taskTitle?: string
  deliverables?: string[]
  submittedText?: string
  fileNames?: string[]
  proofTypes?: string[]
  submittedAt?: string
  dueAt?: string
  expectedKeywords?: string[]
}

export type VerificationSignal = {
  name: string
  score: number
  explanation: string
}

export type VerificationDecision = "approved" | "review" | "rejected"

export type VerificationResult = {
  score: number
  decision: VerificationDecision
  explanation: string
  signals: VerificationSignal[]
  fraudFlags: string[]
  recommendedAction: string
  model: string
}

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const textIncludes = (text: string, item: string) => text.toLowerCase().includes(item.toLowerCase())

export function scoreVerificationEvidence(evidence: VerificationEvidence): VerificationResult {
  const deliverables = evidence.deliverables ?? []
  const submittedText = evidence.submittedText ?? ""
  const fileNames = evidence.fileNames ?? []
  const proofTypes = evidence.proofTypes ?? []
  const expectedKeywords = evidence.expectedKeywords ?? []
  const combinedEvidence = `${submittedText} ${fileNames.join(" ")} ${proofTypes.join(" ")}`

  const deliverableMatches = deliverables.filter((deliverable) => textIncludes(combinedEvidence, deliverable))
  const keywordMatches = expectedKeywords.filter((keyword) => textIncludes(combinedEvidence, keyword))

  const coverageBase = deliverables.length === 0 ? 72 : (deliverableMatches.length / deliverables.length) * 100
  const keywordBoost = expectedKeywords.length === 0 ? 8 : (keywordMatches.length / expectedKeywords.length) * 12
  const deliverableCoverage = clamp(coverageBase + keywordBoost)

  const evidenceVariety = new Set(proofTypes.map((proof) => proof.toLowerCase())).size
  const fileStrength = Math.min(fileNames.length * 12, 48)
  const evidenceAuthenticity = clamp(42 + evidenceVariety * 16 + fileStrength)

  const wordCount = submittedText.trim().split(/\s+/).filter(Boolean).length
  const hasSpecificNumbers = /\d/.test(submittedText)
  const textQuality = clamp(Math.min(wordCount * 2.4, 72) + (hasSpecificNumbers ? 14 : 0) + (fileNames.length ? 8 : 0))

  const fraudFlags: string[] = []
  const duplicateLikeFiles = fileNames.length - new Set(fileNames.map((file) => file.toLowerCase())).size
  if (duplicateLikeFiles > 0) fraudFlags.push("Duplicate proof filenames detected")
  if (submittedText.toLowerCase().includes("placeholder")) fraudFlags.push("Placeholder language found in proof note")
  if (submittedText.length < 80) fraudFlags.push("Proof note is too short for confident verification")

  if (evidence.submittedAt && evidence.dueAt) {
    const submittedAt = new Date(evidence.submittedAt).getTime()
    const dueAt = new Date(evidence.dueAt).getTime()
    if (Number.isFinite(submittedAt) && Number.isFinite(dueAt) && submittedAt > dueAt) {
      fraudFlags.push("Submission arrived after milestone due time")
    }
  }

  const fraudResistance = clamp(96 - fraudFlags.length * 18)
  const score = clamp(deliverableCoverage * 0.34 + evidenceAuthenticity * 0.28 + textQuality * 0.2 + fraudResistance * 0.18)

  const decision: VerificationDecision = score >= 80 && fraudFlags.length <= 1 ? "approved" : score >= 58 ? "review" : "rejected"

  const recommendedAction =
    decision === "approved"
      ? "Release the milestone payment and add a positive reputation event."
      : decision === "review"
        ? "Hold escrow and route the task to a human reviewer with the flagged evidence."
        : "Keep funds locked, request new proof, and notify both parties of the failed checks."

  return {
    score,
    decision,
    explanation: buildExplanation(score, decision, deliverableMatches.length, deliverables.length, fraudFlags),
    signals: [
      {
        name: "Deliverable coverage",
        score: deliverableCoverage,
        explanation: `${deliverableMatches.length} of ${Math.max(deliverables.length, 1)} requested deliverables were referenced in the proof package.`,
      },
      {
        name: "Evidence authenticity",
        score: evidenceAuthenticity,
        explanation: `${fileNames.length} file references and ${evidenceVariety} proof categories were supplied.`,
      },
      {
        name: "Text and file quality",
        score: textQuality,
        explanation: `The completion note contains ${wordCount} words${hasSpecificNumbers ? " with measurable details" : ""}.`,
      },
      {
        name: "Fraud risk resistance",
        score: fraudResistance,
        explanation: fraudFlags.length ? fraudFlags.join("; ") : "No major fraud pattern was detected by the deterministic checks.",
      },
    ],
    fraudFlags,
    recommendedAction,
    model: process.env.OPENAI_API_KEY ? "openai-gpt-with-agent-trust-heuristics" : "agent-trust-heuristic-v1",
  }
}

function buildExplanation(
  score: number,
  decision: VerificationDecision,
  matchedDeliverables: number,
  totalDeliverables: number,
  fraudFlags: string[],
) {
  const verdict =
    decision === "approved"
      ? "passed verification"
      : decision === "review"
        ? "needs human review"
        : "failed automated verification"

  const coverage = totalDeliverables
    ? `${matchedDeliverables}/${totalDeliverables} deliverables matched`
    : "deliverable coverage was inferred from proof quality"

  const risk = fraudFlags.length ? `Risk flags: ${fraudFlags.join("; ")}.` : "No critical fraud flags were found."

  return `The task ${verdict} with a ${score}/100 trust score because ${coverage}. ${risk}`
}

export async function requestOpenAIExplanation(evidence: VerificationEvidence, heuristic: VerificationResult) {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are Agent Trust's escrow verification analyst. Return JSON with concise fields: explanation, risks, missingEvidence, reviewerSummary.",
        },
        {
          role: "user",
          content: JSON.stringify({ evidence, heuristic }),
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI verification request failed with ${response.status}`)
  }

  const payload = await response.json()
  const content = payload?.choices?.[0]?.message?.content
  return content ? JSON.parse(content) : null
}
