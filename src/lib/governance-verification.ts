export type GovernanceEvidence = {
  taskRequirements: string[]
  outputText: string
  explanation: string
  evidenceFiles: string[]
  riskContext?: string | null
}

export type GovernanceDecision = "PASS" | "REVIEW" | "FAIL"

export type GovernanceVerificationResult = {
  completenessScore: number
  relevanceScore: number
  evidenceScore: number
  coherenceScore: number
  hallucinationRisk: number
  finalTrustScore: number
  decision: GovernanceDecision
  explanation: string
  flags: string[]
}

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const contradictionPairs = [
  ["complete", "incomplete"],
  ["approved", "not approved"],
  ["verified", "unverified"],
  ["paid", "unpaid"],
  ["safe", "unsafe"],
  ["exists", "does not exist"],
]

const hallucinationTerms = [
  "guaranteed",
  "definitely",
  "without evidence",
  "i assume",
  "probably",
  "cannot verify",
  "unknown source",
  "placeholder",
  "fake",
]

export function verifyGovernanceSubmission(evidence: GovernanceEvidence): GovernanceVerificationResult {
  const requirements = evidence.taskRequirements.filter(Boolean)
  const output = evidence.outputText || ""
  const explanation = evidence.explanation || ""
  const files = evidence.evidenceFiles.filter(Boolean)
  const combined = `${output} ${explanation} ${files.join(" ")}`.toLowerCase()

  const matchedRequirements = requirements.filter((requirement) => combined.includes(requirement.toLowerCase()))
  const completenessScore = clamp(requirements.length ? (matchedRequirements.length / requirements.length) * 100 : 55)

  const outputWords = output.trim().split(/\s+/).filter(Boolean)
  const explanationWords = explanation.trim().split(/\s+/).filter(Boolean)
  const relevanceScore = clamp(completenessScore * 0.65 + Math.min(outputWords.length * 1.2, 35))
  const evidenceScore = clamp(files.length ? 55 + Math.min(files.length * 15, 45) : 20)

  const contradictionFlags = contradictionPairs
    .filter(([a, b]) => combined.includes(a) && combined.includes(b))
    .map(([a, b]) => `Potential contradiction: "${a}" and "${b}" both appear`)

  const coherenceScore = clamp(85 - contradictionFlags.length * 25 + Math.min(explanationWords.length, 20))

  const hallucinationFlags = hallucinationTerms
    .filter((term) => combined.includes(term))
    .map((term) => `Hallucination risk indicator: "${term}"`)

  if (outputWords.length < 30) hallucinationFlags.push("Output is too short for high-confidence execution")
  if (explanationWords.length < 15) hallucinationFlags.push("Explanation is too thin for auditability")
  if (!files.length) hallucinationFlags.push("No supporting evidence file was provided")

  const hallucinationRisk = clamp(hallucinationFlags.length * 18 + contradictionFlags.length * 20)
  const finalTrustScore = clamp(
    completenessScore * 0.3 +
      relevanceScore * 0.25 +
      evidenceScore * 0.2 +
      coherenceScore * 0.15 +
      (100 - hallucinationRisk) * 0.1,
  )

  const decision: GovernanceDecision = finalTrustScore >= 80 ? "PASS" : finalTrustScore >= 50 ? "REVIEW" : "FAIL"
  const flags = [...contradictionFlags, ...hallucinationFlags]

  return {
    completenessScore,
    relevanceScore,
    evidenceScore,
    coherenceScore,
    hallucinationRisk,
    finalTrustScore,
    decision,
    explanation: buildExplanation(decision, finalTrustScore, matchedRequirements.length, requirements.length, flags),
    flags,
  }
}

function buildExplanation(
  decision: GovernanceDecision,
  score: number,
  matchedRequirements: number,
  totalRequirements: number,
  flags: string[],
) {
  const gate = decision === "PASS" ? "allowed execution" : decision === "REVIEW" ? "blocked execution pending human review" : "blocked execution"
  const coverage = totalRequirements ? `${matchedRequirements}/${totalRequirements} requirements matched` : "requirements were not explicitly provided"
  const risk = flags.length ? `Flags: ${flags.join("; ")}.` : "No major hallucination or contradiction flags were detected."
  return `Agent Trust ${gate} with a ${score}/100 trust score because ${coverage}. ${risk}`
}
