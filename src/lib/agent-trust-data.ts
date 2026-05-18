import {
  AlertTriangle,
  Banknote,
  Bell,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Fingerprint,
  Gavel,
  LayoutDashboard,
  LockKeyhole,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Smartphone,
  UserRoundCheck,
  WalletCards,
} from "lucide-react"

export const appNav = [
  { href: "/", label: "Landing" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/submit", label: "Submit output" },
  { href: "/audit", label: "Audit log" },
  { href: "/executions", label: "Executions" },
]

export const productStats = [
  { label: "Escrow volume simulated", value: "ZMW 4.8M", detail: "Across client, worker, and AI-agent tasks" },
  { label: "AI verification coverage", value: "91%", detail: "Tasks with explainable completion scores" },
  { label: "Dispute prevention", value: "63%", detail: "Risk flagged before payment release" },
  { label: "Supported rails", value: "6", detail: "Airtel Money, MTN MoMo, cards, wallets, bank, stablecoin" },
]

export const trustFlow = [
  {
    title: "Create verified work",
    body: "Clients define deliverables, milestone rules, payout currency, review windows, and proof requirements.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Fund protected escrow",
    body: "Agent Trust simulates locked balances, mobile money intents, wallet references, and smart-contract receipts.",
    icon: LockKeyhole,
  },
  {
    title: "Submit proof",
    body: "Workers, couriers, freelancers, or AI agents upload screenshots, files, delivery photos, text, links, and QR scans.",
    icon: FileCheck2,
  },
  {
    title: "Explainable AI verifies",
    body: "The trust engine checks coverage, quality, fraud indicators, and milestone fit before producing a score.",
    icon: Bot,
  },
  {
    title: "Release or review",
    body: "Approved work releases funds automatically; ambiguous or risky work opens a structured dispute workflow.",
    icon: ShieldCheck,
  },
]

export const featureCards = [
  {
    title: "Escrow wallet simulation",
    copy: "Lock, release, refund, and split payments across ZMW, USD, NGN, KES, USDC, and mobile money rails.",
    icon: WalletCards,
  },
  {
    title: "AI task verification",
    copy: "Analyze documents, screenshots, delivery evidence, file diffs, text quality, milestone completion, and fraud patterns.",
    icon: Bot,
  },
  {
    title: "Trust and reputation scoring",
    copy: "Portable scores combine completion history, dispute rate, verification confidence, and peer reviews.",
    icon: UserRoundCheck,
  },
  {
    title: "WhatsApp-style workspace",
    copy: "Clients and workers coordinate in a chat-first interface with proof cards, receipts, QR checks, and notifications.",
    icon: MessageCircle,
  },
  {
    title: "Dispute resolution",
    copy: "Escalate failed checks into evidence timelines, reviewer queues, settlement suggestions, and final payout decisions.",
    icon: Gavel,
  },
  {
    title: "Fraud risk indicators",
    copy: "Flag reused screenshots, late submissions, mismatched files, suspicious geolocation, duplicate accounts, and weak proof.",
    icon: AlertTriangle,
  },
]

export const dashboardMetrics = [
  { label: "Locked escrow", value: "ZMW 186,420", trend: "+18.4%", icon: Banknote },
  { label: "Tasks verified", value: "1,284", trend: "91.2% pass rate", icon: CheckCircle2 },
  { label: "Risk alerts", value: "23", trend: "7 critical", icon: AlertTriangle },
  { label: "Active reviews", value: "14", trend: "median 42 min", icon: Clock3 },
]

export const activeTasks = [
  {
    id: "AT-2048",
    title: "Lusaka ecommerce product photos",
    client: "CopperCart SME",
    worker: "Mwamba Studio",
    amount: "ZMW 7,500",
    status: "Verification running",
    score: 86,
    risk: "low",
    milestone: "Final image delivery",
  },
  {
    id: "AT-2039",
    title: "Ndola last-mile delivery batch",
    client: "FarmLink Zambia",
    worker: "Rider network",
    amount: "ZMW 12,100",
    status: "Escrow funded",
    score: 72,
    risk: "medium",
    milestone: "QR drop-off proof",
  },
  {
    id: "AT-2024",
    title: "AI agent invoice reconciliation",
    client: "BlueLedger",
    worker: "ReconcileBot-7",
    amount: "USD 480",
    status: "Needs review",
    score: 58,
    risk: "high",
    milestone: "CSV comparison",
  },
]

export const notifications = [
  "Airtel Money escrow intent confirmed for AT-2048.",
  "AI verification found 2 screenshot metadata mismatches.",
  "Worker submitted QR drop-off proof for milestone 3.",
  "Admin review requested by CopperCart SME.",
]

export const chatMessages = [
  { sender: "Client", body: "Please confirm the final images include the white-background set.", time: "09:14" },
  { sender: "Worker", body: "Uploaded the ZIP, contact sheet, and Google Drive link for review.", time: "09:16" },
  { sender: "AI verifier", body: "I matched 48 of 50 requested SKUs. Two files need clearer labels.", time: "09:17" },
  { sender: "Client", body: "Great. Release milestone 2 once the two labels are corrected.", time: "09:19" },
]

export const verificationSignals = [
  { label: "Deliverable coverage", value: 92, detail: "23 of 25 requested items detected" },
  { label: "Evidence authenticity", value: 84, detail: "Screenshots are fresh, no duplicate hashes found" },
  { label: "Text and file quality", value: 88, detail: "Readable, structured, and aligned with task brief" },
  { label: "Fraud risk resistance", value: 76, detail: "Moderate timing anomaly, low metadata risk" },
]

export const reputationProfile = {
  name: "Mwamba Studio",
  role: "Verified creative freelancer",
  location: "Lusaka, Zambia",
  score: 94,
  completed: 128,
  released: "ZMW 420,800",
  disputeRate: "1.8%",
  strengths: ["On-time delivery", "High evidence quality", "Low dispute rate", "Repeat clients"],
}

export const disputeQueue = [
  {
    id: "DSP-118",
    task: "AI agent invoice reconciliation",
    reason: "File comparison mismatch",
    priority: "Critical",
    amount: "USD 480",
    owner: "Admin review",
  },
  {
    id: "DSP-117",
    task: "Kitwe landing page copy",
    reason: "Client quality challenge",
    priority: "Medium",
    amount: "ZMW 3,200",
    owner: "Mediator",
  },
  {
    id: "DSP-116",
    task: "Cold-chain delivery proof",
    reason: "Photo timestamp anomaly",
    priority: "High",
    amount: "ZMW 9,400",
    owner: "Risk team",
  },
]

export const adminRiskIndicators = [
  { label: "Duplicate proof hashes", value: "8", icon: Fingerprint },
  { label: "QR verification failures", value: "5", icon: QrCode },
  { label: "Delayed payout reviews", value: "11", icon: Bell },
  { label: "Mobile money exceptions", value: "3", icon: Smartphone },
]

export const schemaOverview = [
  "User: clients, workers, reviewers, admins, and AI agents with KYC, role, wallet, and trust score fields.",
  "Task: deliverables, status, amount, currency, client, assignee, due date, risk level, and release policy.",
  "Milestone: scoped checkpoints with verification requirements, due dates, and payout percentages.",
  "EscrowAccount and EscrowTransaction: locked funds, mobile money references, releases, refunds, and audit-safe movement logs.",
  "ProofSubmission: uploaded documents, screenshots, QR scans, links, notes, file hashes, and metadata snapshots.",
  "VerificationResult: AI score, pass/fail outcome, explanation, evidence signals, fraud flags, and model version.",
  "Dispute: review workflow, participants, evidence bundle, priority, resolution, and payout decision.",
  "ReputationEvent and ActivityLog: immutable trust score changes and compliance-grade audit trails.",
]

export const apiArchitecture = [
  { method: "POST", path: "/api/auth/register", purpose: "Create a client, worker, reviewer, admin, or AI-agent account." },
  { method: "GET/POST", path: "/api/tasks", purpose: "List or create escrow-backed jobs with milestones and deliverables." },
  { method: "POST", path: "/api/escrow", purpose: "Simulate funding, releasing, refunding, or splitting escrow balances." },
  { method: "POST", path: "/api/verification", purpose: "Run explainable AI verification and trust scoring on submitted proof." },
  { method: "GET/POST", path: "/api/disputes", purpose: "Open review workflows and inspect dispute queues." },
]

export const architectureLayers = [
  {
    title: "Experience layer",
    items: ["Next.js web app", "Mobile-first PWA", "WhatsApp-style task room", "Admin review console"],
  },
  {
    title: "Trust workflow layer",
    items: ["Task orchestration", "Milestone rules", "Escrow state machine", "Notification fan-out"],
  },
  {
    title: "AI verification layer",
    items: ["OpenAI prompt gateway", "Deterministic risk engine", "File comparison jobs", "Explainability store"],
  },
  {
    title: "Financial layer",
    items: ["Mobile money adapters", "Bank/card processor", "Wallet ledger", "Smart contract simulation"],
  },
  {
    title: "Data and compliance",
    items: ["PostgreSQL", "Object storage", "Audit trail", "KYC/KYB and fraud analytics"],
  },
]

export const roadmap = [
  {
    phase: "MVP",
    focus: "Escrow-backed task flow",
    scope: ["Auth", "Create task", "Escrow simulation", "Proof submission", "AI scoring", "Manual dispute queue"],
  },
  {
    phase: "Pilot",
    focus: "Zambian gig and SME workflows",
    scope: ["Airtel Money and MTN MoMo concepts", "QR delivery checks", "Reputation profiles", "Reviewer console"],
  },
  {
    phase: "Scale",
    focus: "Trust infrastructure API",
    scope: ["Partner APIs", "Webhooks", "Smart-contract rails", "Advanced fraud graph", "AI-agent attestation"],
  },
]

export const mobileMoneyConcepts = ["Airtel Money", "MTN MoMo", "Zamtel Kwacha", "Bank transfer", "Visa/Mastercard", "USDC wallet"]

export const adminKpis = [
  { label: "Gross escrow balance", value: "ZMW 2.4M" },
  { label: "Verification SLA", value: "38 sec" },
  { label: "Open disputes", value: "14" },
  { label: "High-risk tasks", value: "7" },
]

export const pageTiles = [
  { href: "/login", title: "Login/signup", icon: LockKeyhole, copy: "Role-aware onboarding for clients, workers, reviewers, and AI agents." },
  { href: "/dashboard", title: "Dashboard", icon: LayoutDashboard, copy: "Escrow balances, task state, notifications, and verification activity." },
  { href: "/agents", title: "Top trusted agents", icon: UserRoundCheck, copy: "Browse ranked workers and AI agents by trust, speed, experience, and risk." },
  { href: "/tasks/new", title: "Create task", icon: BriefcaseBusiness, copy: "Deliverables, milestones, payout amount, currency, and verification rules." },
  { href: "/escrow", title: "Escrow/payment", icon: WalletCards, copy: "Funds locked, released, refunded, and synced to mobile money concepts." },
  { href: "/verification", title: "Verification", icon: Bot, copy: "Explainable AI proof analysis with completion score and fraud indicators." },
  { href: "/reputation", title: "Reputation profile", icon: UserRoundCheck, copy: "Portable worker and AI-agent trust record." },
  { href: "/admin", title: "Admin dashboard", icon: ShieldCheck, copy: "Risk queues, reviewer operations, and compliance metrics." },
  { href: "/disputes", title: "Dispute center", icon: Gavel, copy: "Evidence timeline and structured resolution workflow." },
]
