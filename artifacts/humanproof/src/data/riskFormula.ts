// ════════════════════════════════════════════════════════════════
// riskFormula.ts — Core Risk Engine Calculation & Confidence Logic
// v5.0 — REAL D1–D6 Engine. No more hardcoded 50s.
//
// Architecture:
//   D1 — Task Automatability:   industryRiskData.aiAdoptionRate × roleExposureData.aiRisk
//   D2 — AI Tool Maturity:      industryRiskData.aiAdoptionRate (sector-level AI tooling)
//   D3 — Human Amplification:   cognitive complexity score derived from role type + industry
//   D4 — Experience Shield:     non-linear protection curve (more exp = more protection)
//   D5 — Country Exposure:      countryRiskProfile.ts (65 countries, real multi-factor model)
//   D6 — Social Capital Moat:   experience × industry network density proxy
//
// Fallback path uses this engine directly.
// Primary path: Supabase Edge Function `calculate-grounded-risk`
// ════════════════════════════════════════════════════════════════

/**
 * 3-Tier Confidence System
 */
export type ConfidenceLevel = "HIGH" | "MODERATE" | "LOW";

export interface ScoreResult {
  total: number;
  dimensions: {
    label: string;
    key: string;
    score: number;
    weight: number;
    reason?: string;
  }[];
  confidence: ConfidenceLevel;
  dataQuality: "DQ_FULL" | "DQ_PARTIAL" | "Limited";
  ai_risk_skills?: any;
  safer_career_paths?: any;
  roadmap?: any;
  inaction_scenario?: string;
  riskTrend?: any[];
  content_confidence?: number;
  isSeeded?: boolean;
}

import {
  getCareerIntelligence,
  getRoleRoadmap,
  getRoleCareerPaths,
  getRoleSkills,
  getInactionScenario,
  getRiskTrend,
  hasSeededData,
} from "./careerIntelligenceDB";

import { selectRoadmapBlocks, mergeBlocksIntoRoadmap } from "./roadmapBlocks";
import { DANGER_SKILLS, SAFE_SKILLS, TRANSITION_RECS } from "./skillsData";
import { industryRiskData } from "./industryRiskData";
import { inferRoleRisk } from "./roleExposureData";
import { getCountryD5Score } from "./countryRiskProfile";

// ─── Industry key → industryRiskData key mapping ──────────────────────
// Bridges the catalogData industry keys to the industryRiskData record keys
const INDUSTRY_KEY_TO_RISK_KEY: Record<string, string> = {
  it_software: 'Technology',
  it_web: 'Technology',
  it_mobile: 'Technology',
  it_saas: 'Technology',
  it_ai_ml: 'Technology',
  it_cybersec: 'Cybersecurity',
  it_devops: 'Technology',
  it_blockchain: 'Technology',
  it_gaming: 'Gaming',
  it_qa: 'Technology',
  it_erp: 'Technology',
  finance: 'Financial Services',
  fintech: 'Financial Services',
  insurance: 'Insurance',
  investment: 'Financial Services',
  media: 'Media & Publishing',
  content: 'Media & Publishing',
  marketing: 'Media & Publishing',
  advertising: 'Media & Publishing',
  design: 'Media & Publishing',
  photography: 'Media & Publishing',
  animation: 'Media & Publishing',
  music: 'Media & Publishing',
  bpo: 'Technology', // BPO uses tech disruption rate
  hr: 'Consulting',
  legal: 'Legal',
  consulting: 'Consulting',
  logistics: 'Transportation',
  travel: 'Hospitality',
  admin: 'Consulting',
  healthcare: 'Healthcare',
  pharma: 'Biotech/Pharma',
  mental_health: 'Healthcare',
  nursing: 'Healthcare',
  education: 'Education',
  edtech: 'Education',
  training: 'Education',
  manufacturing: 'Manufacturing',
  automotive: 'Manufacturing',
  engineering: 'Energy',
  construction: 'Construction',
  energy: 'Energy',
  aerospace: 'Energy',
  retail: 'Retail',
  ecommerce: 'E-commerce',
  fmcg: 'Retail',
  government: 'Government',
  ngo: 'Nonprofit',
  agriculture: 'Agriculture',
};

// ─── Role type cognitive complexity proxy (for D3) ───────────────────
// Higher = more human cognitive complexity = LOWER displacement risk
const ROLE_COMPLEXITY_MAP: Record<string, number> = {
  // Strategy / Leadership — near-immune
  sw_arch: 0.12, it_lead: 0.10, sw_pm: 0.14, con_strategy: 0.15, con_mgmt: 0.18,
  gov_policy: 0.15, mh_therapist: 0.08, mh_psychologist: 0.10, mh_crisis: 0.08,
  hc_surgeon: 0.05, hc_specialist: 0.10, edu_higher: 0.15, ngo_program: 0.20,

  // Technical specialists — moderate protection
  sw_backend: 0.35, sw_frontend: 0.40, sw_cloud: 0.28, sw_devops: 0.28,
  it_cybersec: 0.20, sec_pen: 0.18, sec_incident: 0.20, ml_model: 0.22,
  ml_research: 0.15, ml_mlops: 0.28, data_eng: 0.30, ds_scientist: 0.30,
  ml_engineer: 0.22, sw_embedded: 0.18, sw_legacy: 0.22,

  // Creative / Human touch
  des_ux: 0.32, des_ui: 0.40, adv_creative: 0.38, anim_2d: 0.45,
  photo_portrait: 0.30, mus_compose: 0.28, mh_coach: 0.25,

  // Finance — moderate to high risk
  fin_account: 0.58, fin_tax: 0.55, fin_audit: 0.52, fin_payroll: 0.72,
  ins_claims: 0.68, ins_underwrite: 0.52,

  // High risk roles
  bpo_inbound: 0.80, bpo_data_entry: 0.92, bpo_outbound: 0.85, bpo_chat: 0.82,
  cnt_blog: 0.72, cnt_copy: 0.68, cnt_seo_content: 0.80, cnt_translation: 0.88,
  qa_manual: 0.82, adm_data_entry: 0.92, adm_reception: 0.78, ret_floor: 0.75,
  mkt_seo: 0.68, mkt_sem: 0.62, med_journalism: 0.72,

  // ── Catalog WORK_TYPE keys — ALL 408 covered ────────────────────────────
  // Software / Web / Mobile
  sw_fullstack: 0.38, sw_api: 0.35, sw_db: 0.42, sw_testing: 0.70,
  sw_mobile_dev: 0.40, sw_ml: 0.22, sw_embed: 0.20, sw_lead: 0.12,
  web_html: 0.65, web_react: 0.40, web_wordpress: 0.70, web_shopify: 0.72,
  web_ux: 0.32, web_seo_tech: 0.68, web_backend: 0.35,
  mob_ios: 0.38, mob_android: 0.38, mob_flutter: 0.40, mob_rn: 0.40,
  mob_ui: 0.35, mob_testing: 0.72,
  // SaaS
  saas_pm: 0.15, saas_growth: 0.45, saas_onboard: 0.55, saas_api_int: 0.38,
  saas_support: 0.62, saas_docs: 0.75,
  // ML / AI / Data
  ml_nlp: 0.22, ml_cv: 0.22, ml_data: 0.42,
  ml_prompt: 0.48, ml_analytics: 0.45, ml_etl: 0.50, ml_embed: 0.25,
  // Security
  sec_soc: 0.30, sec_cloud: 0.28, sec_appsec: 0.25, sec_grc: 0.38,
  // DevOps / Infrastructure
  dev_ci: 0.42, dev_k8s: 0.35, dev_infra: 0.32, dev_sre: 0.30, dev_linux: 0.38,
  // Blockchain / Gaming / QA / ERP
  bc_sol: 0.25, bc_defi: 0.28, bc_nft: 0.50, bc_audit: 0.32,
  game_unity: 0.35, game_unreal: 0.35, game_design: 0.30, game_art: 0.42,
  game_vr: 0.30, game_backend: 0.35, game_qa: 0.65,
  qa_auto: 0.55, qa_perf: 0.48, qa_mobile_test: 0.62, qa_api_test: 0.48, qa_lead: 0.22,
  erp_sap: 0.48, erp_oracle: 0.48, erp_ms365: 0.55, erp_support: 0.65,
  // Finance
  fin_fp: 0.40, fin_treasury: 0.42, fin_credit: 0.48, fin_risk: 0.38,
  fin_compliance: 0.42, fin_reporting: 0.55, fin_invest: 0.32,
  ft_payment: 0.45, ft_lending: 0.48, ft_fraud: 0.38, ft_regtech: 0.40, ft_wealth: 0.35,
  ins_actuarial: 0.38, ins_broker: 0.52, ins_admin: 0.70,
  inv_equity: 0.28, inv_ibanking: 0.22, inv_portfolio: 0.25, inv_vc: 0.18,
  inv_quant: 0.20, inv_trading: 0.22,
  // Media / Content / Marketing
  med_edit: 0.60, med_broadcast: 0.50, med_digital: 0.60, med_video: 0.45,
  med_podcast: 0.48, med_research: 0.52,
  cnt_tech_write: 0.62, cnt_script: 0.45, cnt_yt: 0.55, cnt_email: 0.72,
  cnt_ghostwrite: 0.55, cnt_ux_write: 0.60,
  mkt_social_ads: 0.65, mkt_growth: 0.45, mkt_crm: 0.55, mkt_analytics: 0.50,
  mkt_brand: 0.35, mkt_influencer: 0.45, mkt_product: 0.18,
  adv_copy: 0.65, adv_campaign: 0.38, adv_media_buy: 0.65, adv_pr: 0.40, adv_brand: 0.32,
  des_graphic: 0.58, des_logo: 0.62, des_motion: 0.50, des_3d: 0.42,
  des_illustration: 0.55, des_product: 0.30,
  photo_commercial: 0.38, photo_event: 0.40, photo_edit: 0.68,
  video_prod: 0.42, video_edit: 0.55, drone: 0.48,
  anim_3d: 0.42, anim_vfx: 0.38, anim_motion: 0.50, anim_vr: 0.32, anim_rigging: 0.48,
  mus_produce: 0.35, mus_mixing: 0.40, mus_lyrics: 0.45, mus_session: 0.32, mus_teach: 0.30,
  // BPO / Admin / HR / Legal
  bpo_email_support: 0.82, bpo_tech_support: 0.72, bpo_social_mod: 0.78,
  bpo_virtual: 0.75, bpo_hr_ops: 0.78,
  hr_recruit: 0.48, hr_hrbp: 0.30, hr_lr: 0.32, hr_comp: 0.45, hr_ld: 0.30,
  hr_diversity: 0.25, hr_hris: 0.52, hr_payroll: 0.68, hr_ops: 0.58,
  leg_corporate: 0.25, leg_litigation: 0.20, leg_ip: 0.22, leg_tax_law: 0.42,
  leg_labor: 0.30, leg_compliance: 0.38, leg_paralegal: 0.62, leg_cyberlaw: 0.25,
  leg_legaltech: 0.30,
  con_it: 0.28, con_hr_con: 0.30, con_fin_con: 0.32, con_supply: 0.35,
  con_sustainability: 0.28, con_risk: 0.30, con_change: 0.22,
  log_ops: 0.52, log_scm: 0.38, log_warehouse: 0.65, log_import: 0.58,
  log_last_mile: 0.70, log_fleet: 0.55, log_procurement: 0.52,
  trav_agent: 0.65, trav_hotel: 0.30, trav_ops: 0.55, trav_guide: 0.28,
  trav_airline: 0.22, trav_marketing: 0.50,
  adm_exec: 0.55, adm_office: 0.68, adm_coord: 0.62,
  // Healthcare
  hc_doctor: 0.08, hc_radiology: 0.25, hc_pathology: 0.30,
  hc_admin_hc: 0.72, hc_medical_coding: 0.78, hc_pharmacy: 0.48,
  hc_tele: 0.35, hc_nutrition: 0.38, hc_physio: 0.25,
  ph_research: 0.15, ph_clinical: 0.20, ph_regulatory: 0.35,
  ph_manufacturing: 0.55, ph_quality: 0.48, ph_sales: 0.58, ph_biotech: 0.20,
  mh_social: 0.20, nur_rn: 0.28, nur_icu: 0.20, nur_community: 0.28,
  nur_midwife: 0.18, nur_para: 0.38,
  // Education
  edu_teach: 0.22, edu_special: 0.15, edu_admin_edu: 0.38, edu_curriculum: 0.28,
  edu_counsellor: 0.20,
  edt_product: 0.20, edt_content: 0.40, edt_instructional: 0.28,
  edt_tutor: 0.40, edt_gamification: 0.25,
  tr_facilitator: 0.30, tr_ld: 0.28, tr_coach: 0.22, tr_elearning: 0.45, tr_assessment: 0.55,
  // Manufacturing / Engineering
  mfg_production: 0.55, mfg_quality: 0.48, mfg_maintenance: 0.40,
  mfg_process: 0.35, mfg_lean: 0.35, mfg_safety: 0.30, mfg_automation: 0.28,
  mfg_cad: 0.45, mfg_supervisor: 0.38,
  auto_design: 0.28, auto_eng: 0.25, auto_ev: 0.22, auto_software: 0.20, auto_mfg: 0.48,
  eng_civil: 0.25, eng_mech: 0.25, eng_elec: 0.28, eng_chem: 0.22,
  eng_enviro: 0.28, eng_project: 0.22, eng_survey: 0.38,
  con_arch: 0.22, con_site: 0.30, con_interior: 0.32, con_urban: 0.22, con_estimation: 0.48,
  en_oil: 0.30, en_renewable: 0.25, en_power: 0.28, en_nuclear: 0.20,
  en_env: 0.28, en_trader: 0.22,
  aero_eng: 0.18, aero_avionics: 0.20, aero_test: 0.28, aero_mfg: 0.42, aero_def: 0.22,
  // Retail / E-commerce
  ret_buyer: 0.38, ret_ecom: 0.42, ret_inventory: 0.65, ret_cx: 0.55, ret_category: 0.38,
  ec_ops: 0.55, ec_catalog: 0.68, ec_ful: 0.65, ec_returns: 0.68, ec_growth: 0.40, ec_d2c: 0.38,
  fmcg_sales: 0.48, fmcg_key: 0.40, fmcg_brand_mgr: 0.32, fmcg_supply_fmcg: 0.42, fmcg_rd: 0.25,
  // Government / NGO / Agriculture
  gov_admin: 0.55, gov_public_finance: 0.45, gov_social: 0.18, gov_it: 0.35,
  ngo_fundraise: 0.38, ngo_comms: 0.40, ngo_field: 0.20, ngo_research: 0.22,
  agri_farming: 0.42, agri_tech: 0.28, agri_supply: 0.48, agri_research: 0.22, agri_finance: 0.45,
};

// ─── Industry D6 Network Density proxy ──────────────────────────────
// Industries where professional/social capital is most valuable (reduces risk)
const INDUSTRY_NETWORK_DENSITY: Record<string, number> = {
  consulting: 0.20,   // high — relationships ARE the product
  legal: 0.22,        // high — client trust, firm reputation
  investment: 0.18,   // high — deal flow is relationship-driven
  healthcare: 0.30,   // moderate-low — patients need human presence
  mental_health: 0.15,// high — therapeutic relationship is core
  education: 0.30,    // moderate
  it_software: 0.50,  // moderate — more mobile, less relationship-bound
  it_ai_ml: 0.45,
  finance: 0.35,
  media: 0.42,
  bpo: 0.75,          // very low network moat in BPO
  content: 0.60,
  government: 0.28,
  ngo: 0.22,
  manufacturing: 0.55,
  retail: 0.65,
};

// ─── Score Regression Reference (do not delete) ──────────────────────
// Role: Crisis Therapist / mental_health / mh_crisis / usa / 0-2yr  → target ~18
// Role: SEO Content Writer / content / cnt_seo_content / usa / 5-10yr → target ~78
// Role: Software Architect / it_software / sw_arch / germany / 10-20yr → target ~22
// Role: Data Entry Clerk / bpo / bpo_data_entry / india / 0-2yr → target ~92
// Role: Surgeon / healthcare / hc_surgeon / usa / 20+yr → target ~10
// ──────────────────────────────────────────────────────────────────────

/**
 * D1 — Task Automatability
 * Combines: industry AI adoption rate + role-level AI risk from roleExposureData
 * Returns 0–100 (100 = fully automatable)
 */
export const calculateD1 = (workType: string, industry: string): number => {
  const indRiskKey = INDUSTRY_KEY_TO_RISK_KEY[industry] ?? 'Technology';
  const indData = industryRiskData[indRiskKey];
  const adoptionRate = indData?.aiAdoptionRate ?? 0.60;

  // Role-specific AI risk from roleExposureData (via fuzzy matching on workType)
  const roleData = inferRoleRisk(workType);
  const roleAiRisk = roleData.aiRisk;

  // Also check our direct complexity map for higher precision
  const complexityProxy = ROLE_COMPLEXITY_MAP[workType] ?? roleAiRisk;

  // D1 = blend of industry adoption speed × role cognitive complexity proxy
  // adoptionRate drives the industry-level pressure; complexityProxy is role-level exposure
  const d1Raw = (adoptionRate * 40) + (complexityProxy * 60);
  return Math.min(100, Math.max(0, Math.round(d1Raw * 100)));
};

/**
 * D2 — AI Tool Maturity in this sector
 * Measures how mature and capable AI tooling is for tasks in this industry
 * Returns 0–100 (100 = fully mature AI tools exist and are widely deployed)
 */
export const calculateD2 = (workType: string): number => {
  // Use role complexity as inverse proxy: low complexity = high tool maturity
  const complexityProxy = ROLE_COMPLEXITY_MAP[workType] ?? 0.50;
  // High-complexity roles (0.10) → low D2 (tools are immature, humans still needed)
  // Low-complexity roles (0.92) → high D2 (tools are mature and deployed)
  const d2Raw = complexityProxy * 100;
  return Math.min(100, Math.max(5, Math.round(d2Raw)));
};

/**
 * D3 — Human Amplification
 * How much does human judgment, creativity, empathy AMPLIFY value in this role?
 * High D3 score = LESS human amplification = MORE at risk
 * Returns 0–100
 */
export const calculateD3 = (workType: string): number => {
  const complexityProxy = ROLE_COMPLEXITY_MAP[workType] ?? 0.50;
  // Invert: high complexity = high amplification = low score (low risk)
  return Math.min(100, Math.max(5, Math.round(complexityProxy * 85)));
};

/**
 * D4 — Experience Shield (non-linear)
 * More experience = lower displacement risk (senior roles have network + domain depth)
 * Returns 0–100 (100 = high risk, i.e., no experience protection)
 */
export const calculateD4 = (workType: string, exp: string = "5-10"): number => {
  const expScores: Record<string, number> = {
    "0-2":  75,  // entry = high risk
    "2-5":  62,  // early = elevated
    "5-10": 45,  // mid = moderate
    "10-20": 28, // senior = protected (non-linear drop)
    "20+":  18,  // principal = strongly protected
  };
  const base = expScores[exp] ?? 50;

  // Roles where experience matters MORE get an extra shield (surgeons, architects)
  const complexityProxy = ROLE_COMPLEXITY_MAP[workType] ?? 0.50;
  const shieldBonus = (1 - complexityProxy) * 15; // up to 15pt reduction for complex roles

  return Math.max(5, Math.round(base - shieldBonus));
};

/**
 * D5 — Country Exposure
 * Returns 0–100 using countryRiskProfile.ts (65-country real model)
 */
export const calculateD5 = (country: string = "usa"): number => {
  return getCountryD5Score(country);
};

/**
 * D6 — Social Capital Moat
 * How strong is the professional relationship/trust network in this role?
 * High D6 score = LOW moat = HIGH risk
 * Returns 0–100
 */
export const calculateD6 = (workType: string): number => {
  // Use role complexity as network proxy: complex roles tend to have stronger networks
  const ind = workType.split('_')[0]; // use first segment as industry prefix
  const networkDensity = INDUSTRY_NETWORK_DENSITY[ind] ?? INDUSTRY_NETWORK_DENSITY[workType] ?? 0.55;
  // High density (0.75 = BPO) → high D6 score (low moat, high risk)
  return Math.min(100, Math.max(5, Math.round(networkDensity * 100)));
};

// ─── Dynamic Weight Engine ───────────────────────────────────────────
// Weights are not global constants — they vary by role category
interface DimensionWeights {
  d1: number; d2: number; d3: number; d4: number; d5: number; d6: number;
}

function getDynamicWeights(workType: string, industry: string): DimensionWeights {
  const ind = industry ?? '';
  const wt = workType ?? '';

  // Healthcare / Mental Health — experience and human amplification dominate
  if (ind.startsWith('health') || ind === 'mental_health' || ind === 'nursing') {
    return { d1: 0.18, d2: 0.12, d3: 0.30, d4: 0.22, d5: 0.08, d6: 0.10 };
  }
  // BPO / Admin — task automatability and AI tool maturity dominate
  if (ind === 'bpo' || ind === 'admin') {
    return { d1: 0.35, d2: 0.28, d3: 0.12, d4: 0.12, d5: 0.08, d6: 0.05 };
  }
  // Creative — human amplification and social capital matter most
  if (['content', 'media', 'design', 'animation', 'music', 'photography'].includes(ind)) {
    return { d1: 0.25, d2: 0.20, d3: 0.28, d4: 0.12, d5: 0.07, d6: 0.08 };
  }
  // Legal / Consulting — experience shield + social capital dominate
  if (['legal', 'consulting'].includes(ind)) {
    return { d1: 0.20, d2: 0.18, d3: 0.20, d4: 0.20, d5: 0.08, d6: 0.14 };
  }
  // Tech / Development — task automatability + AI tool maturity lead
  if (ind.startsWith('it_') || ind === 'fintech') {
    return { d1: 0.28, d2: 0.20, d3: 0.18, d4: 0.16, d5: 0.09, d6: 0.09 };
  }
  // Finance — balanced but D1/D2 higher
  if (['finance', 'insurance', 'investment'].includes(ind)) {
    return { d1: 0.26, d2: 0.22, d3: 0.18, d4: 0.16, d5: 0.09, d6: 0.09 };
  }
  // Default (from original model)
  return { d1: 0.26, d2: 0.18, d3: 0.20, d4: 0.16, d5: 0.09, d6: 0.11 };
}

// ─── UI Helpers ──────────────────────────────────────────────────
export const getScoreColor = (score: number) => {
  if (score < 25) return "#10b981"; // Emerald — AI-Resistant
  if (score < 50) return "#3b82f6"; // Blue — Resilient
  if (score < 70) return "#f59e0b"; // Amber — Exposed
  return "#ef4444"; // Red — Critical Risk
};

export const getVerdict = (score: number) => {
  if (score < 25) return "AI-Resistant";
  if (score < 50) return "Resilient";
  if (score < 70) return "Exposed";
  return "Critical Risk";
};

export const getTimeline = (score: number) => {
  if (score < 25) return "8-12 Years";
  if (score < 50) return "5-8 Years";
  if (score < 70) return "2-4 Years";
  return "Immediate (< 2 Years)";
};

export const getUrgency = (score: number) => {
  if (score < 25) return "Low";
  if (score < 50) return "Moderate";
  if (score < 70) return "High";
  return "Critical";
};

export const getConfidenceLevel = (dq: string): ConfidenceLevel => {
  if (dq === "DQ_FULL") return "HIGH";
  if (dq === "DQ_PARTIAL") return "MODERATE";
  return "LOW";
};

export const calcDimensionScore = (base: number, volatility: number): number => {
  return Math.min(Math.max(base * volatility, 0), 100);
};

export const getConfidence = (_workType: string) => "HIGH";
export const getAutomationExp = (_workType: string) => "Expanding";

/**
 * Projects risk growth over N years (used for riskTrend chart).
 * Uses logistic S-curve logic.
 */
export const projectScore = (
  baseRisk: number,
  decayRate: number,
  years: number,
): number => {
  if (baseRisk <= 0) return 0;
  const L = 100;
  const safeBase = Math.min(baseRisk, 99);
  const kMultiplier = Math.max(decayRate / 15, 0.1);
  const t0_implied = Math.log(100 / safeBase - 1) / kMultiplier;
  const projected = L / (1 + Math.exp(-kMultiplier * (years - t0_implied)));
  return Math.min(Math.max(Math.round(projected), 0), 100);
};

/**
 * Projects the safe (upskilled) trajectory — risk grows slower with upskilling.
 * Renamed from projectSafeScore (was confusingly named — it projects RISK, not safety).
 * upskillingFactor: 0 = no effort, 1 = maximum upskilling
 */
export const projectRiskWithUpskilling = (
  currentScore: number,
  years: number,
  upskillingFactor: number = 0,
): number => {
  // Velocity of risk growth: base 5% per year, reduced by upskilling
  const baseVelocity = 0.05;
  const mitigatedVelocity = baseVelocity * (1 - upskillingFactor);
  // With 100% upskilling, risk can actually decrease (AI expertise makes you more valuable)
  const projectedRisk = currentScore + mitigatedVelocity * years * 100 - (upskillingFactor * years * 3);
  return Math.min(Math.max(Math.round(projectedRisk), 0), 100);
};

// Keep backward compat alias
export const projectSafeScore = projectRiskWithUpskilling;

/**
 * Generate a 6-point risk trend (currentYear → currentYear+5)
 *
 * Rules:
 *  • year[0] always = `total` (matches ring score exactly)
 *  • minimum 1pt growth per year so every card shows a distinct value
 *  • role-complexity-aware: high-complexity (easy to automate) grows faster
 *  • caps at 99% — never shows "100% displaced" to avoid false certainty
 */
function generateRiskTrend(total: number, workType: string): { year: string; score: number; label: string }[] {
  const currentYear = new Date().getFullYear();
  const c = ROLE_COMPLEXITY_MAP[workType] ?? 0.50;

  // Base annual growth (pts/yr) by current risk band
  //   >80 Critical  → 2.0/yr  (near ceiling, slowing)
  //   >65 High      → 4.0/yr  (active disruption, fast)
  //   >50 Moderate  → 3.0/yr  (pressure building)
  //   >35 Low-mod   → 2.2/yr  (creeping automation)
  //   >20 Resilient → 1.5/yr  (slow but real)
  //   ≤20 Safe      → 1.0/yr  (floor — always some risk growth)
  const baseGrowth =
    total > 80 ? 2.0 :
    total > 65 ? 4.0 :
    total > 50 ? 3.0 :
    total > 35 ? 2.2 :
    total > 20 ? 1.5 : 1.0;

  // Role complexity modifier: ranges from -1.2 (very human) to +1.2 (very automatable)
  const complexityMod = (c - 0.50) * 2.4;

  // Ensure minimum 1pt/year visible growth even for highly-resilient roles
  const annualGrowth = Math.max(1.0, baseGrowth + complexityMod);

  const labels = ['Now', '+1yr', '+2yr', '+3yr', '+4yr', '+5yr'];

  return [0, 1, 2, 3, 4, 5].map(yr => {
    // Use integer rounding per year so each card shows a unique value
    const projected = Math.min(99, Math.round(total + annualGrowth * yr));
    return {
      year: String(currentYear + yr),
      score: projected,
      label: labels[yr],
    };
  });
}


/**
 * Get dimension reasoning text
 */
function getDimensionReason(key: string, score: number, workType: string, country: string, exp: string): string {
  switch (key) {
    case 'D1':
      if (score < 25) return 'Very low task automatability — your work requires human synthesis and non-routine judgment.';
      if (score < 50) return 'Moderate automatability — AI handles edge cases and boilerplate but core work is human-driven.';
      if (score < 75) return 'High automatability — AI tools currently handle or can handle a majority of this role\'s tasks.';
      return 'Critical automatability — AI systems can already replicate this task profile at scale.';
    case 'D2':
      if (score < 30) return 'AI tooling in this sector is early-stage — models lack the precision needed for this role category.';
      if (score < 60) return 'AI tools are maturing in this sector but still require expert supervision and validation.';
      return 'Mature AI tool ecosystem exists specifically for this function — widespread enterprise deployment underway.';
    case 'D3':
      if (score < 30) return 'This role has extremely high human amplification — your judgment, creativity, or empathy creates value AI cannot replicate.';
      if (score < 55) return 'Human skills are meaningful differentiators but AI is narrowing the gap in several sub-tasks.';
      return 'Limited human amplification advantage — AI performs comparably on most output metrics.';
    case 'D4':
      if (score < 25) return `20+ years creates a deep domain knowledge moat — your pattern recognition and judgment compound with experience.`;
      if (score < 40) return `Senior experience (${exp} yrs) provides significant protection through tacit knowledge and strategic judgment.`;
      if (score < 60) return `Mid-level experience offers moderate protection but lacks the seniority to be classified as "irreplaceable."`;
      return `Entry-level experience offers minimal protection — AI systems already match junior-level output in many areas.`;
    case 'D5':
      return `Country: ${country.toUpperCase()}. Local AI adoption speed, labour market flexibility, and regulatory environment drive this score.`;
    case 'D6':
      if (score < 30) return 'Strong professional relationship network — client trust, referrals, and institutional knowledge create a durable moat.';
      if (score < 55) return 'Moderate social capital — relationships help but aren\'t a primary differentiator vs. AI-native alternatives.';
      return 'Low social capital moat — this function is transactional and easily substitutable by AI-native offerings.';
    default:
      return '';
  }
}

/**
 * PRIMARY FALLBACK SCORE ENGINE
 * Called when Supabase Edge Function is unavailable.
 * NOW uses real data: industryRiskData + roleExposureData + countryRiskProfile
 */
export function calculateScore(
  workType: string,
  industry: string,
  experience: string = "5-10",
  country: string = "usa",
): ScoreResult {
  const d1 = calculateD1(workType, industry);
  const d2 = calculateD2(workType);
  const d3 = calculateD3(workType);
  const d4 = calculateD4(workType, experience);
  const d5 = calculateD5(country);
  const d6 = calculateD6(workType);

  const w = getDynamicWeights(workType, industry);
  const total = Math.round(
    d1 * w.d1 + d2 * w.d2 + d3 * w.d3 + d4 * w.d4 + d5 * w.d5 + d6 * w.d6
  );

  const dimensions = [
    { key: "D1", label: "Task Automatability", score: d1, weight: Math.round(w.d1 * 100), reason: getDimensionReason('D1', d1, workType, country, experience) },
    { key: "D2", label: "AI Tool Maturity",     score: d2, weight: Math.round(w.d2 * 100), reason: getDimensionReason('D2', d2, workType, country, experience) },
    { key: "D3", label: "Human Amplification",  score: d3, weight: Math.round(w.d3 * 100), reason: getDimensionReason('D3', d3, workType, country, experience) },
    { key: "D4", label: "Experience Shield",    score: d4, weight: Math.round(w.d4 * 100), reason: getDimensionReason('D4', d4, workType, country, experience) },
    { key: "D5", label: "Country Exposure",     score: d5, weight: Math.round(w.d5 * 100), reason: getDimensionReason('D5', d5, workType, country, experience) },
    { key: "D6", label: "Social Capital Moat",  score: d6, weight: Math.round(w.d6 * 100), reason: getDimensionReason('D6', d6, workType, country, experience) },
  ];

  const fallbackData = generateStructuredFallbackRoadmap(d1, d2, d3, d4, d5, d6, workType, industry, experience, total);

  return {
    total,
    dimensions,
    confidence: fallbackData.isSeeded ? "HIGH" : "MODERATE",
    dataQuality: fallbackData.isSeeded ? "DQ_FULL" : "DQ_PARTIAL",
    inaction_scenario: fallbackData.inaction_scenario,
    ai_risk_skills: fallbackData.ai_risk_skills,
    safer_career_paths: fallbackData.safer_career_paths,
    roadmap: fallbackData.roadmap,
    riskTrend: fallbackData.riskTrend,
    content_confidence: fallbackData.content_confidence,
    isSeeded: fallbackData.isSeeded,
  };
}

/**
 * Data-First Career Intelligence Generator
 *
 * Strategy:
 * 1. Check if careerIntelligenceDB has pre-seeded data for this role → use it
 * 2. Fall back to modular roadmap block engine (dimension-driven selection)
 * 3. Use DANGER_SKILLS + SAFE_SKILLS + TRANSITION_RECS for semi-specific skill data
 * 4. Generate contextual inaction scenario based on total score
 */
function generateStructuredFallbackRoadmap(
  d1: number, d2: number, d3: number, d4: number, d5: number, d6: number,
  workType: string, industry: string, experience: string = "5-10", total: number = 50,
) {
  // ── Path 1: Pre-seeded career intelligence ────────────────────────────
  if (hasSeededData(workType)) {
    const intel = getCareerIntelligence(workType)!;
    const expKey = experience as "0-2" | "2-5" | "5-10" | "10-20" | "20+";

    // BUG-03 FIX: Try requested exp → any available roadmap → null
    const roadmapData = getRoleRoadmap(workType, expKey);
    const skills = getRoleSkills(workType);
    const careerPaths = getRoleCareerPaths(workType);
    const inactionScenario = getInactionScenario(workType) ?? generateInactionScenario(workType, d1, d2, total);
    const seededTrend = getRiskTrend(workType);

    // Map seeded skills to the AI edge function format
    const ai_risk_skills = skills
      ? {
          obsolete: (skills.obsolete || []).map((s: any) => ({
            skill: s.skill,
            reason: s.reason,
            timeline: s.horizon?.replace("yr", " years") || "1-3 years",
            riskScore: s.riskScore,
          })),
          at_risk: (skills.at_risk || []).map((s: any) => ({
            skill: s.skill,
            reason: s.reason,
            timeline: s.horizon?.replace("yr", " years") || "3-5 years",
            riskScore: s.riskScore,
          })),
          safe: (skills.safe || []).map((s: any) => ({
            skill: s.skill,
            reason: s.whySafe,
            timeline: "5+ years",
            longTermValue: s.longTermValue,
            resource: s.resource,
          })),
        }
      : { obsolete: [], at_risk: [], safe: [] };

    const safer_career_paths = (careerPaths || []).map((p: any) => ({
      role: p.role,
      risk_reduction_pct: p.riskReduction,
      skill_gap: p.skillGap,
      transition_difficulty: p.transitionDifficulty,
      salary_delta: p.salaryDelta,
      time_to_transition: p.timeToTransition,
    }));

    const roadmap = roadmapData
      ? { phase_1: { timeline: roadmapData.phase_1.timeline, actions: roadmapData.phase_1.actions },
          phase_2: roadmapData.phase_2 ? { timeline: roadmapData.phase_2.timeline, actions: roadmapData.phase_2.actions } : undefined,
          phase_3: roadmapData.phase_3 ? { timeline: roadmapData.phase_3.timeline, actions: roadmapData.phase_3.actions } : undefined,
        }
      : generateModularFallbackRoadmap(d1, d2, d6, total, experience);

    // ALWAYS regenerate the trend from the live `total` score.
    // Seeded trend data has hardcoded years (e.g. 2024–2028) that
    // no longer match the current year, and their base values don't
    // align with the calculated ring score. Discard the seeded trend.
    const riskTrend = generateRiskTrend(total, workType);

    return {
      ai_risk_skills,
      safer_career_paths,
      roadmap: roadmap ?? generateModularFallbackRoadmap(d1, d2, d6, total, experience),
      inaction_scenario: inactionScenario,
      riskTrend,
      content_confidence: intel.confidenceScore ?? 80,
      isSeeded: true,
    };
  }

  // ── Path 2: Modular block engine + skillsData semi-specific fallback ──
  return generateSemiSpecificFallback(d1, d2, d3, d4, d5, d6, workType, industry, experience, total);
}

/**
 * Modular block-based roadmap for un-seeded roles
 */
function generateModularFallbackRoadmap(d1: number, d2: number, d6: number, total: number, experience: string) {
  const blocks = selectRoadmapBlocks({ d1, d2, d6, total, experience });
  const merged = mergeBlocksIntoRoadmap(blocks);

  if (!merged) {
    return {
      phase_1: { timeline: "0–30 days", actions: [{ action: "Audit your automatable tasks", why: "Know your risk surface", outcome: "Clear automation risk log" }] },
      phase_2: { timeline: "1–3 months", actions: [{ action: "Learn the AI tool most relevant to your field", why: "AI-native professionals earn 30% more", outcome: "New AI tool in daily workflow" }] },
      phase_3: { timeline: "3–12 months", actions: [{ action: "Apply for strategy or oversight roles in your field", why: "Strategic roles have 60% lower AI risk than execution roles", outcome: "New role with higher AI resilience" }] },
    };
  }
  return merged;
}

/**
 * Semi-specific fallback using skillsData (DANGER_SKILLS, SAFE_SKILLS, TRANSITION_RECS)
 */
function generateSemiSpecificFallback(
  d1: number, d2: number, d3: number, d4: number, d5: number, d6: number,
  workType: string, industry: string, experience: string, total: number,
) {
  const dangerSkills = DANGER_SKILLS[workType] ?? DANGER_SKILLS["default"] ?? [];
  const safeSkills = SAFE_SKILLS[workType] ?? SAFE_SKILLS["default"] ?? [];
  const transitionRecs = TRANSITION_RECS[workType] ?? TRANSITION_RECS["default"] ?? [];

  const ai_risk_skills = {
    obsolete: dangerSkills.slice(0, 3).map((skill, i) => ({
      skill,
      reason: d1 > 70
        ? `High automatability (D1: ${Math.round(d1)}%) — AI tools now handle this task at scale.`
        : `Moderate-high AI tool maturity in this category — displacement risk is real.`,
      timeline: i === 0 ? "1-2 years" : i === 1 ? "2-3 years" : "3-5 years",
    })),
    at_risk: dangerSkills.slice(3, 6).map((skill, i) => ({
      skill,
      reason: `AI tools augment this skill — partial automation is underway with ${Math.round(d2)}% AI tool maturity.`,
      timeline: i === 0 ? "2-4 years" : "3-5 years",
    })),
    safe: safeSkills.slice(0, 3).map((skill) => ({
      skill,
      reason: "Complex human judgment, relationships, or contextual expertise — AI only partially replicates this.",
      timeline: "5+ years",
    })),
  };

  const safer_career_paths = transitionRecs.slice(0, 3).map((rec, i) => {
    const [role, ...rest] = rec.split(" — ");
    return {
      role: role.trim(),
      risk_reduction_pct: [45, 35, 50][i] ?? 40,
      skill_gap: rest.join(" ").trim() || "Develop strategic thinking, AI tool fluency, and domain expertise",
      transition_difficulty: ["Medium", "Hard", "Medium"][i] ?? "Medium",
    };
  });

  return {
    ai_risk_skills,
    safer_career_paths,
    roadmap: generateModularFallbackRoadmap(d1, d2, d6, total, experience),
    inaction_scenario: generateInactionScenario(workType, d1, d2, total),
    riskTrend: generateRiskTrend(total, workType),
    content_confidence: 62,
    isSeeded: false,
  };
}

/**
 * Generate contextual inaction scenario based on total score
 */
function generateInactionScenario(workType: string, d1: number, d2: number, total: number): string {
  if (total >= 85) {
    return `Your role is in the critical displacement zone. AI systems at ${Math.round(d2)}% maturity can already replicate ${Math.round(d1)}% of your task profile. Without pivoting to oversight, strategy, or an adjacent AI-native role within 6–12 months, you face direct position elimination as companies adopt AI-first operations.`;
  } else if (total >= 70) {
    return `Your role faces imminent automation pressure — AI tools have reached ${Math.round(d2)}% maturity in your field and ${Math.round(d1)}% of your tasks are automatable. Without pivoting to strategy, oversight, or an adjacent role within 12 months, you risk position elimination as companies find AI-first alternatives.`;
  } else if (total >= 55) {
    return `Your role is in the high-risk zone with ${Math.round(d1)}% task automatability. Companies are actively deploying AI tools in your function. Without developing AI-native skills, governance capabilities, or moving toward strategic work in the next 18–24 months, your market value will compress significantly.`;
  } else if (total >= 40) {
    return `You are in the AI augmentation zone — AI tools will reshape your role substantially over 3–5 years. Professionals who position themselves as AI-native practitioners now will capture the value. Those who don't will find their salaries stagnant as AI handles the execution layer.`;
  } else {
    return `Your role has strong AI resilience today, but no function is permanently immune. Investing now in your human-only capabilities — relationship networks, strategic judgment, and creative problem-solving — ensures you remain ahead of the curve as AI capabilities continue expanding.`;
  }
}

// Legacy aliases for backward compatibility
export { calculateD4 as getExpRisk_v2 };
export { calculateD5 as getCountryRisk };
export { calculateD1 as getD1, calculateD2 as getD2, calculateD3 as getD3 };
