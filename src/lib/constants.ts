/**
 * Central definitions for enumerated values and role-based access control.
 * Kept in one place because the schema stores these as plain strings for
 * cross-database portability (SQLite ⇄ PostgreSQL).
 */

export const ROLES = {
  ADMINISTRATOR: "ADMINISTRATOR",
  ORG_MANAGER: "ORG_MANAGER",
  COMMS_OFFICER: "COMMS_OFFICER",
  ANALYST: "ANALYST",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  ADMINISTRATOR: "Administrator",
  ORG_MANAGER: "Organization Manager",
  COMMS_OFFICER: "Communications Officer",
  ANALYST: "Analyst",
  VIEWER: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMINISTRATOR: "Full control over the organization, billing, members and settings.",
  ORG_MANAGER: "Manage team, brands, keywords and monitoring configuration.",
  COMMS_OFFICER: "Manage alerts, reports and AI communications workflows.",
  ANALYST: "Analyze coverage, run reports and use the AI assistant.",
  VIEWER: "Read-only access to dashboards and articles.",
};

/**
 * Permission catalogue. Each permission maps to the set of roles allowed to
 * perform it. This drives both API guards and UI affordances.
 */
export const PERMISSIONS = {
  "org:manage": [ROLES.ADMINISTRATOR],
  "org:view": [ROLES.ADMINISTRATOR, ROLES.ORG_MANAGER, ROLES.COMMS_OFFICER, ROLES.ANALYST, ROLES.VIEWER],
  "members:manage": [ROLES.ADMINISTRATOR, ROLES.ORG_MANAGER],
  "members:invite": [ROLES.ADMINISTRATOR, ROLES.ORG_MANAGER],
  "keywords:manage": [ROLES.ADMINISTRATOR, ROLES.ORG_MANAGER, ROLES.ANALYST],
  "keywords:view": [ROLES.ADMINISTRATOR, ROLES.ORG_MANAGER, ROLES.COMMS_OFFICER, ROLES.ANALYST, ROLES.VIEWER],
  "articles:view": [ROLES.ADMINISTRATOR, ROLES.ORG_MANAGER, ROLES.COMMS_OFFICER, ROLES.ANALYST, ROLES.VIEWER],
  "alerts:manage": [ROLES.ADMINISTRATOR, ROLES.ORG_MANAGER, ROLES.COMMS_OFFICER],
  "alerts:view": [ROLES.ADMINISTRATOR, ROLES.ORG_MANAGER, ROLES.COMMS_OFFICER, ROLES.ANALYST, ROLES.VIEWER],
  "reports:manage": [ROLES.ADMINISTRATOR, ROLES.ORG_MANAGER, ROLES.COMMS_OFFICER, ROLES.ANALYST],
  "reports:view": [ROLES.ADMINISTRATOR, ROLES.ORG_MANAGER, ROLES.COMMS_OFFICER, ROLES.ANALYST, ROLES.VIEWER],
  "competitors:manage": [ROLES.ADMINISTRATOR, ROLES.ORG_MANAGER, ROLES.ANALYST],
  "ai:use": [ROLES.ADMINISTRATOR, ROLES.ORG_MANAGER, ROLES.COMMS_OFFICER, ROLES.ANALYST],
  "monitoring:run": [ROLES.ADMINISTRATOR, ROLES.ORG_MANAGER, ROLES.ANALYST],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function roleCan(role: string | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const allowed = PERMISSIONS[permission] as readonly string[];
  return allowed.includes(role);
}

// --- Enumerated string values used across the domain ---

export const SENTIMENTS = ["POSITIVE", "NEUTRAL", "NEGATIVE"] as const;
export type Sentiment = (typeof SENTIMENTS)[number];

export const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const KEYWORD_TYPES = ["COMPANY", "PRODUCT", "CEO", "CAMPAIGN", "INDUSTRY", "CUSTOM"] as const;

export const KEYWORD_STATUSES = ["ACTIVE", "PAUSED", "ARCHIVED"] as const;

export const FREQUENCIES = ["REALTIME", "HOURLY", "DAILY", "WEEKLY"] as const;

export const SOURCE_TYPES = ["RSS", "GOOGLE_NEWS", "SCRAPER", "API", "SOCIAL", "TV", "RADIO"] as const;

export const ALERT_TYPES = [
  "NEGATIVE_SENTIMENT",
  "KEYWORD_SPIKE",
  "COMPETITOR_ACTIVITY",
  "PUBLICATION",
  "BREAKING_NEWS",
] as const;

export const ALERT_CHANNELS = ["EMAIL", "BROWSER", "DIGEST_DAILY", "DIGEST_WEEKLY"] as const;

export const REPORT_TYPES = ["EXECUTIVE", "COVERAGE", "SENTIMENT", "COMPETITOR", "CUSTOM"] as const;

export const SENTIMENT_COLORS: Record<Sentiment, string> = {
  POSITIVE: "#22c55e",
  NEUTRAL: "#a1a1aa",
  NEGATIVE: "#ef4444",
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: "#22c55e",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};
