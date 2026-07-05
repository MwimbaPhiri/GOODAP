import { z } from "zod";
import {
  ALERT_CHANNELS, ALERT_TYPES, FREQUENCIES, KEYWORD_STATUSES, KEYWORD_TYPES,
  PRIORITIES, REPORT_TYPES, ROLES, SOURCE_TYPES,
} from "@/lib/constants";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  organizationName: z.string().min(2).max(80).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({ email: z.string().email() });

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum([ROLES.ADMINISTRATOR, ROLES.ORG_MANAGER, ROLES.COMMS_OFFICER, ROLES.ANALYST, ROLES.VIEWER]),
});

export const keywordSchema = z.object({
  term: z.string().min(1).max(120),
  type: z.enum(KEYWORD_TYPES).default("COMPANY"),
  booleanQuery: z.string().max(500).optional().nullable(),
  includeKeywords: z.array(z.string()).default([]),
  excludeKeywords: z.array(z.string()).default([]),
  country: z.string().max(4).optional().nullable(),
  language: z.string().max(8).default("en"),
  priority: z.enum(PRIORITIES).default("MEDIUM"),
  status: z.enum(KEYWORD_STATUSES).default("ACTIVE"),
  frequency: z.enum(FREQUENCIES).default("HOURLY"),
});

export const sourceSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(SOURCE_TYPES).default("RSS"),
  url: z.string().min(1).max(500),
  country: z.string().max(4).optional().nullable(),
  language: z.string().max(8).optional().nullable(),
  domainAuthority: z.number().int().min(0).max(100).optional().nullable(),
  enabled: z.boolean().default(true),
});

export const alertSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(ALERT_TYPES),
  condition: z.record(z.string(), z.any()).optional(),
  channels: z.array(z.enum(ALERT_CHANNELS)).default(["BROWSER"]),
  enabled: z.boolean().default(true),
});

export const competitorSchema = z.object({
  name: z.string().min(1).max(120),
  website: z.string().max(300).optional().nullable(),
  keywords: z.array(z.string()).default([]),
});

export const reportSchema = z.object({
  title: z.string().min(1).max(160),
  type: z.enum(REPORT_TYPES).default("EXECUTIVE"),
  periodDays: z.number().int().min(1).max(365).default(30),
});

export const assistantSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  jobTitle: z.string().max(120).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  timezone: z.string().max(60).optional(),
  avatar: z.string().max(500).optional().nullable(),
});

export const orgSettingsSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  website: z.string().max(300).optional().nullable(),
  industry: z.string().max(120).optional().nullable(),
  country: z.string().max(60).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  logoUrl: z.string().max(500).optional().nullable(),
  monitoringConfig: z.record(z.string(), z.any()).optional(),
});
