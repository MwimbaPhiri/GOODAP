import { AlertTriangle, Bot, FileCheck2, QrCode, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AgentTrustShell, GlassPanel } from "@/components/agent-trust/app-shell"
import { scoreVerificationEvidence } from "@/lib/trust-scoring"

const result = scoreVerificationEvidence({
  taskTitle: "Lusaka ecommerce product photos",
  deliverables: ["product photos", "contact sheet", "zip archive", "sku filenames"],
  expectedKeywords: ["48", "SKU", "white background", "Google Drive"],
  proofTypes: ["screenshots", "zip", "link", "metadata"],
  fileNames: ["sku-contact-sheet.pdf", "product-photos.zip", "metadata-report.csv"],
  submittedText:
    "Uploaded 48 edited product photos with SKU filenames, white background exports, a contact sheet, metadata report, and Google Drive backup link. Two missing SKU labels are being corrected.",
})

const examples = [
  { title: "Document completion checking", icon: FileCheck2 },
  { title: "Screenshot verification", icon: ShieldCheck },
  { title: "Delivery proof analysis", icon: QrCode },
  { title: "Fraud pattern detection", icon: AlertTriangle },
]

export default function VerificationPage() {
  return (
    <AgentTrustShell
      eyebrow="AI-powered task verification"
      title="Explainable AI scores proof before money moves."
      subtitle="The MVP combines deterministic checks with an optional OpenAI API explanation layer, so every pass, fail, or dispute recommendation includes a reason."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel>
          <div className="flex items-center justify-between">
            <Bot className="h-10 w-10 text-emerald-300" />
            <Badge className={result.decision === "approved" ? "bg-emerald-400 text-slate-950" : "bg-amber-300 text-slate-950"}>
              {result.decision}
            </Badge>
          </div>
          <p className="mt-8 text-sm uppercase tracking-[0.3em] text-slate-500">Trust score</p>
          <p className="mt-3 text-6xl font-black">{result.score}/100</p>
          <Progress value={result.score} className="mt-5 bg-white/10" />
          <p className="mt-5 text-sm leading-6 text-slate-300">{result.explanation}</p>
          <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
            Recommended action: {result.recommendedAction}
          </div>
        </GlassPanel>

        <GlassPanel>
          <h2 className="text-2xl font-black">Verification signals</h2>
          <div className="mt-5 space-y-5">
            {result.signals.map((signal) => (
              <div key={signal.name}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{signal.name}</span>
                  <span className="text-emerald-200">{signal.score}%</span>
                </div>
                <Progress value={signal.score} className="bg-white/10" />
                <p className="mt-2 text-xs leading-5 text-slate-500">{signal.explanation}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {examples.map((example) => {
          const Icon = example.icon
          return (
            <GlassPanel key={example.title}>
              <Icon className="h-8 w-8 text-emerald-300" />
              <h3 className="mt-4 text-xl font-bold">{example.title}</h3>
              <p className="mt-3 text-sm text-slate-400">Supported by the same trust scoring contract and evidence metadata.</p>
            </GlassPanel>
          )
        })}
      </div>
    </AgentTrustShell>
  )
}
