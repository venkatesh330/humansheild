// apiProduct.ts
// Market Implementation 1 — v4.0
// API product specification and client utility.
//
// Three endpoints served by a single Supabase Edge Function (api-displacement-scores):
//   POST /role-risk       — single role risk score with full dimension breakdown
//   POST /team-risk       — batch scoring for a team of employees
//   GET  /company-intel   — collapse stage + layoff history + hiring signals
//
// Authentication: API key in Authorization header (Bearer <key>)
// Rate limits enforced server-side per api_keys.daily_limit field.

// ── Request / Response types ─────────────────────────────────────────────────

export interface RoleRiskRequest {
  role_title: string;
  industry?: string;
  country?: string;
  experience?: string; // '0-2' | '2-5' | '5-10' | '10-20' | '20+'
  company_name?: string;
}

export interface RoleRiskResponse {
  role_title: string;
  score: number;               // 0-100
  confidence_band: { low: number; high: number };
  tier: string;                // 'Very low risk' | 'Low risk' | 'Moderate risk' | 'Elevated risk' | 'High risk'
  dimensions: Record<string, number>; // L1-D7 as 0-100 values
  displacement_timeline: string;
  at_risk_skills: string[];
  safe_skills: string[];
  top_ai_tools: string[];
  recommended_transitions: Array<{
    role: string;
    risk_reduction_pct: number;
    skill_gap: string;
    salary_delta: string;
    months_to_first_income: number | null;
  }>;
  data_provenance: string;
  computed_at: string;
}

export interface TeamMember {
  job_title: string;
  department: string;
  experience_years: number;
  country?: string;
  company_name?: string;
}

export interface TeamRiskRequest {
  employees: TeamMember[];
}

export interface TeamRiskResponse {
  aggregate_score: number;
  high_risk_count: number;
  moderate_risk_count: number;
  safe_count: number;
  department_risk_map: Record<string, number>;
  top_vulnerable_roles: Array<{ role: string; score: number; count: number }>;
  top_protected_roles: Array<{ role: string; score: number; count: number }>;
  reskilling_investment_recommendation: string;
  individual_scores: Array<{
    job_title: string;
    department: string;
    score: number;
    tier: string;
  }>;
  computed_at: string;
}

export interface CompanyIntelRequest {
  company_name: string;
}

export interface CompanyIntelResponse {
  company_name: string;
  collapse_stage: 1 | 2 | 3 | null;
  collapse_stage_label: string;
  layoff_history_summary: string;
  ai_investment_signal: string;
  sector_contagion_status: string;
  hiring_freeze_score: number;    // 0-100
  ninety_day_outlook: string;
  last_updated: string;
}

// ── Pricing tiers ─────────────────────────────────────────────────────────────

export const API_PRICING = {
  standard: {
    price_inr_monthly: 10_000,
    price_usd_monthly: 120,
    role_risk_daily_limit: 1_000,
    team_risk_monthly_limit: 50,
    company_intel_monthly_limit: 100,
    sla: 'Best-effort',
  },
  enterprise: {
    price_inr_monthly: 50_000,
    price_usd_monthly: 600,
    role_risk_daily_limit: Infinity,
    team_risk_monthly_limit: Infinity,
    company_intel_monthly_limit: Infinity,
    sla: '99.9% uptime, 500ms P95',
  },
  team: {
    // For HR platform integrations — priced per employee per year
    price_inr_per_employee_per_year: 5_000,
    price_usd_per_employee_per_year: 60,
    team_risk_monthly_limit: Infinity,
    company_intel_monthly_limit: 12, // monthly
    sla: 'Best-effort',
  },
} as const;

// ── Client utility functions ─────────────────────────────────────────────────

const API_BASE = 'https://[your-project].supabase.co/functions/v1/api-displacement-scores';

export async function callRoleRisk(
  apiKey: string,
  request: RoleRiskRequest,
): Promise<RoleRiskResponse> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint: 'role-risk', ...request }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`API error ${res.status}: ${(err as any).message ?? res.statusText}`);
  }
  return res.json();
}

export async function callTeamRisk(
  apiKey: string,
  request: TeamRiskRequest,
): Promise<TeamRiskResponse> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: 'team-risk', ...request }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function callCompanyIntel(
  apiKey: string,
  companyName: string,
): Promise<CompanyIntelResponse> {
  const res = await fetch(`${API_BASE}?endpoint=company-intel&company=${encodeURIComponent(companyName)}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ── Edge Function deployment spec (deploy to supabase/functions/) ─────────────
//
// supabase/functions/api-displacement-scores/index.ts:
//
// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from "@supabase/supabase-js";
//
// serve(async (req) => {
//   // 1. Extract and verify API key
//   const authHeader = req.headers.get('Authorization') ?? '';
//   const apiKey = authHeader.replace('Bearer ', '').trim();
//   if (!apiKey) return new Response(JSON.stringify({ error: 'Missing API key' }), { status: 401 });
//
//   // 2. Look up key in api_keys table
//   const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
//   const { data: keyRecord } = await supabase.from('api_keys')
//     .select('*').eq('key_hash', hashKey(apiKey)).eq('is_active', true).maybeSingle();
//   if (!keyRecord) return new Response(JSON.stringify({ error: 'Invalid API key' }), { status: 401 });
//
//   // 3. Check rate limit
//   const today = new Date().toISOString().split('T')[0];
//   const { count } = await supabase.from('api_usage')
//     .select('*', { count: 'exact' })
//     .eq('key_id', keyRecord.id).eq('date', today);
//   if ((count ?? 0) >= keyRecord.daily_limit) {
//     return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
//   }
//
//   // 4. Route to endpoint handler
//   const body = req.method === 'POST' ? await req.json() : {};
//   const endpoint = body.endpoint ?? new URL(req.url).searchParams.get('endpoint');
//
//   // [handlers for role-risk, team-risk, company-intel]
//   // Each calls the deterministic scoring engine (no swarm for API — latency target <500ms)
//   // Response includes data_provenance field listing signal sources used
//
//   // 5. Log usage
//   await supabase.from('api_usage').insert({ key_id: keyRecord.id, date: today, endpoint });
//
//   return new Response(JSON.stringify(result), {
//     headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
//   });
// });

// ── Supabase table schema ──────────────────────────────────────────────────────
export const API_SCHEMA_SQL = `
-- API key management
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT UNIQUE NOT NULL,       -- SHA-256 of the actual key (never store plaintext)
  organization_name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'standard', -- 'standard' | 'enterprise' | 'team'
  daily_limit INTEGER NOT NULL DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Usage tracking for rate limiting
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID REFERENCES api_keys(id),
  date DATE NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  UNIQUE(key_id, date, endpoint)
);
`;
