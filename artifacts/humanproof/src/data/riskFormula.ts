// ═══════════════════════════════════════════════════════════
// riskFormula.ts — Pure calculation functions for HumanProof v2.0
// 6-Dimension formula: D1×0.26 + D2×0.18 + D3×0.20 + D4×0.16 + D5×0.09 + D6×0.11
// Weights sum: 0.26+0.18+0.20+0.16+0.09+0.11 = 1.00 ✓
// ═══════════════════════════════════════════════════════════

import {
  TASK_AUTO, DISRUPTION_VELOCITY, AUGMENTATION,
  EXP_SENSITIVITY, EXP_RISK_BASE, EXP_INDEX,
  COUNTRY_DATA, NETWORK_MOAT, D6_EXP_BONUS,
  INDUSTRY_KEY_MULT, EXP_BONUS, REPLACEMENT_2026_OVERRIDES,
  SPECIALIST_KEYWORDS, SPECIFICITY_MARKERS,
  D3_CURVE_EXPONENT, GOVERNANCE_KEYWORDS,
} from './riskData';

export interface ScoreResult {
  score: number;
  d1: number;
  d2: number;
  d3: number;
  d4: number;
  d5: number;
  d6: number;
  augVal: number;
  networkMoat: number;
}

// ─── D1: Task Automatability ───────────────────────────────
export function calculateD1(industryKey: string, workType: string): number {
  const industryData = TASK_AUTO[industryKey];
  if (industryData && workType in industryData) return industryData[workType];
  for (const cat of Object.values(TASK_AUTO)) {
    if (workType in cat) return cat[workType];
  }
  return TASK_AUTO.default.data;
}

// ─── D2: AI Tool Maturity ──────────────────────────────────
export function calculateD2(workType: string): number {
  return DISRUPTION_VELOCITY[workType] ?? DISRUPTION_VELOCITY.default;
}

// ─── D3: Human Amplification (curved inversion) ───────────
// v2 fix: curved inversion (D3_CURVE_EXPONENT=0.70) preserves mid-range nuance
// augVal=50 → D3=37 (protective) instead of linear D3=50 (neutral)
// FORMULA FIX 3: governance keyword co-occurrence gives +8 boost when augVal > 60
export function calculateD3(workType: string, skillSlug?: string, industryKey?: string, jobTitle?: string): number {
  const augVal = AUGMENTATION[workType] ?? AUGMENTATION.default;

  // Check 2026 override table first
  if (skillSlug && industryKey) {
    const overrideKey = `${industryKey}-${skillSlug}`;
    const override = REPLACEMENT_2026_OVERRIDES[overrideKey];
    if (override !== undefined) return override;
  }

  // FORMULA FIX 1: use named constant D3_CURVE_EXPONENT (0.70)
  let d3 = Math.round(100 * (1 - Math.pow(augVal / 100, D3_CURVE_EXPONENT)));

  // FORMULA FIX 3: governance keyword co-occurrence check
  // Roles with governance terms AND high augVal get a protective boost
  if (jobTitle) {
    const lowerTitle = jobTitle.toLowerCase();
    const hasGovernance = GOVERNANCE_KEYWORDS.some(kw => lowerTitle.includes(kw));
    if (hasGovernance && augVal > 60) {
      d3 = Math.min(85, d3 + 8);
    }
  }

  return d3;
}

export function getAugVal(workType: string): number {
  return AUGMENTATION[workType] ?? AUGMENTATION.default;
}

// ─── D4: Experience & Seniority Shield ─────────────────────
// BUG 3 FIX: experience cannot reduce D4 by more than 75% — prevents unrealistic near-zero values
export function calculateD4(workType: string, exp: string): number {
  const base = EXP_RISK_BASE[exp] ?? 54;
  const idx = EXP_INDEX[exp] ?? 2;
  const sens = EXP_SENSITIVITY[workType] ?? EXP_SENSITIVITY.default;
  const d4Raw = Math.round(base * (1 - sens * idx / 4));
  // BUG 3 FIX: realism floor — experience can reduce D4 by at most 75% of base risk
  return Math.max(d4Raw, Math.round(base * 0.25));
}

// ─── D5: Country Context (multiplicative net exposure model) ─
// v2 fix: multiplicative formula correctly handles EU-type countries
// EU (high adoption + high regulation): adoption × (1 - regulation/100) × 0.80 + 22
// USA (high adoption + low regulation): 90 × 0.90 × 0.80 + 22 = 86.8 → clamped 85
export function calculateD5(countryKey: string): number {
  const d = COUNTRY_DATA[countryKey] ?? COUNTRY_DATA.other;
  const adoption = d[0];
  const regulation = d[1];
  const raw = adoption * (1 - regulation / 100) * 0.80 + 22;
  return Math.round(Math.min(85, Math.max(20, raw)));
}

// ─── D6: Social Capital & Network Moat (NEW) ───────────────
// Source: MIT Sloan "Network Effects in Labor Markets" 2024
// Lower score = stronger network moat = more protected
export function calculateD6(workType: string, exp: string): number {
  const baseScore = NETWORK_MOAT[workType] ?? NETWORK_MOAT.default;
  const expBonus = D6_EXP_BONUS[exp] ?? 0;
  return Math.max(10, Math.min(85, baseScore + expBonus));
}

// ─── Future Projection: S-Curve (logistic) ─────────────────
// v2 fix: logistic S-curve replaces linear — saturates correctly near limits
export function projectScore(baseline: number, decayFactor: number, years: number): number {
  const L = 97; // carrying capacity
  const k = decayFactor / 12; // growth rate
  // Avoid log(0) edge case
  const safeBaseline = Math.max(3, Math.min(94, baseline));
  const x0 = Math.log((L - safeBaseline) / safeBaseline) / k;
  const projected = L / (1 + Math.exp(-k * (years - x0)));
  return Math.min(97, Math.max(3, Math.round(projected)));
}

export function projectSafeScore(baseline: number, years: number): number {
  return Math.max(15, Math.round(baseline - years * 1.5));
}

// ─── Main Score Calculator ─────────────────────────────────
export function calculateScore(
  industryKey: string,
  workType: string,
  exp: string,
  countryKey: string,
  jobTitle?: string,
  skillSlug?: string,
): ScoreResult {
  const d1 = calculateD1(industryKey, workType);
  const d2 = calculateD2(workType);
  // FORMULA FIX 3: pass jobTitle for governance co-occurrence check
  const d3 = calculateD3(workType, skillSlug, industryKey, jobTitle);
  const d4 = calculateD4(workType, exp);
  const d5 = calculateD5(countryKey);
  const d6 = calculateD6(workType, exp);
  const augVal = getAugVal(workType);
  const networkMoat = NETWORK_MOAT[workType] ?? NETWORK_MOAT.default;

  // ── 6-Dimension Formula (weights sum to 1.00 exactly) ──
  // D1:0.26 D2:0.18 D3:0.20 D4:0.16 D5:0.09 D6:0.11
  const rawScore = d1 * 0.26 + d2 * 0.18 + d3 * 0.20 + d4 * 0.16 + d5 * 0.09 + d6 * 0.11;

  // BUG 4 FIX: Additive boost replaces multiplicative to avoid double-counting D1/D2
  // Computes excess risk above the 50-point neutral line using the D1/D2 weighted average
  const d1d2Average = (d1 * 0.26 + d2 * 0.18) / 0.44;
  const excessRisk = Math.max(0, d1d2Average - 50);
  const boostAddition = excessRisk * 0.15;
  let score = Math.round(Math.min(rawScore * 1.20, rawScore + boostAddition));

  // ── Industry multiplier ──
  const industryMult = INDUSTRY_KEY_MULT[industryKey] || 1.0;
  score = Math.round(score * industryMult);

  // ── Experience deduction (specialist titles get 1.4× bonus, capped at 18) ──
  const baseDeduction = EXP_BONUS[exp] || 0;
  const isSpecialist = jobTitle
    ? SPECIALIST_KEYWORDS.some(k => jobTitle.toLowerCase().includes(k))
    : false;
  // FORMULA FIX 4: hard cap specialist deduction at 18 to prevent unrealistic low scores
  const finalDeduction = Math.min(Math.round(baseDeduction * (isSpecialist ? 1.4 : 1.0)), 18);
  score = score - finalDeduction;

  // ── Specificity adjustment for titled non-specialist roles ──
  if (jobTitle && !isSpecialist) {
    const lower = jobTitle.toLowerCase();
    if (SPECIFICITY_MARKERS.some(m => lower.includes(m))) {
      score -= 8;
    }
  }

  // ── Final clamp: 3–97 ──
  return {
    score: Math.min(97, Math.max(3, Math.round(score))),
    d1, d2, d3, d4, d5, d6,
    augVal,
    networkMoat,
  };
}

// ─── Score Utilities ───────────────────────────────────────
export function getScoreColor(score: number): string {
  if (score >= 80) return '#ff4757';
  if (score >= 65) return '#ff7043';
  if (score >= 50) return '#fbbf24';
  if (score >= 35) return '#00F5FF';
  return '#00FF9F';
}

export function getRiskLabelFull(score: number): { label: string; color: string; description: string } {
  if (score < 20) return { label: 'Very Low Risk', color: 'var(--emerald)', description: 'Highly resilient to AI displacement' };
  if (score < 35) return { label: 'Low Risk', color: 'var(--emerald)', description: 'Well-positioned against automation' };
  if (score < 50) return { label: 'Low-Moderate', color: 'var(--cyan)', description: 'Some exposure, manageable with action' };
  if (score < 65) return { label: 'Moderate Risk', color: 'var(--yellow)', description: 'Notable AI pressure in this area' };
  if (score < 80) return { label: 'High Risk', color: 'var(--orange)', description: 'Significant displacement risk within 3 years' };
  return { label: 'Critical Risk', color: 'var(--red)', description: 'Urgent action required' };
}

export function getVerdict(score: number): string {
  if (score >= 80) return '🔴 Critical Risk — Act Immediately';
  if (score >= 65) return '🟠 High Risk — Plan Urgently';
  if (score >= 50) return '🟡 Moderate Risk — Adapt Now';
  if (score >= 35) return '🔵 Low-Moderate Risk — Monitor Closely';
  return '🟢 Lower Risk — Evolve Continuously';
}

export function getTimeline(score: number): string {
  if (score >= 85) return '6–18 months';
  if (score >= 70) return '18–30 months';
  if (score >= 55) return '2–4 years';
  if (score >= 40) return '4–6 years';
  return '6+ years';
}

export function getUrgency(score: number): string {
  if (score >= 85) return 'Act This Week';
  if (score >= 70) return 'Plan This Month';
  if (score >= 55) return 'Start Planning';
  if (score >= 40) return 'Monitor Closely';
  return 'Evolve Continuously';
}

export function getAutomationExp(d1: number): string {
  if (d1 >= 85) return 'Extreme (85%+)';
  if (d1 >= 70) return `High (${d1}%)`;
  if (d1 >= 50) return `Moderate (${d1}%)`;
  return `Low (${d1}%)`;
}

export function getConfidence(wt: string): { band: number; label: string; stars: string } {
  const DQ_FULL = new Set(['sw_backend','sw_frontend','sw_fullstack','sw_arch','sw_lead','sw_devops','sw_cloud','sw_api','sw_db','sw_testing','sw_ml','bpo_inbound','bpo_chat','bpo_data_entry','bpo_email_support','bpo_tech_support','bpo_virtual','bpo_claims','cnt_blog','cnt_copy','cnt_seo_content','cnt_social','cnt_email','cnt_ux_write','cnt_script','cnt_yt','cnt_tech_write','cnt_ghostwrite','cnt_translation','fin_account','fin_payroll','fin_audit','fin_fp','fin_tax','fin_risk','fin_credit','fin_invest','fin_reporting','hc_doctor','hc_surgeon','hc_specialist','hc_radiology','hc_medical_coding','hc_physio','hc_nutrition','hc_tele','mh_therapist','mh_psychologist','mh_coach','mh_crisis','mh_social','nur_rn','nur_icu','nur_community','nur_midwife','edu_teach','edu_higher','edu_special','edu_counsellor','qa_manual','qa_auto','qa_lead','qa_perf','mkt_seo','mkt_sem','mkt_social_ads','mkt_growth','mkt_analytics','mkt_brand','mkt_product','des_ui','des_ux','des_graphic','des_motion','des_product','leg_litigation','leg_paralegal','leg_corporate','leg_compliance','leg_ip','leg_labor','con_strategy','con_mgmt','con_it','con_sustainability','hr_recruit','hr_hrbp','hr_payroll','hr_diversity','hr_ld','hr_lr','sec_pen','sec_soc','sec_appsec','sec_grc','sec_cloud','inv_vc','inv_equity','inv_portfolio','inv_quant','inv_ibanking','ml_model','ml_research','ml_data','ml_mlops','ml_prompt','ml_nlp','adm_data_entry','adm_exec','adm_reception','ins_claims','ins_underwrite','ins_admin','ins_actuarial','log_warehouse','log_last_mile','log_fleet','mfg_production','mfg_quality','mfg_automation','mfg_supervisor','ret_floor','photo_event','photo_portrait','video_edit','trav_agent','trav_guide','game_design','game_unity','game_unreal','gov_admin','gov_policy','ph_research','ph_sales','nur_para','ngo_field','agri_farming']);
  if (DQ_FULL.has(wt)) return { band: 3, label: 'High confidence ±3%', stars: '●●●●●' };
  return { band: 7, label: 'Moderate confidence ±7%', stars: '●●●○○' };
}
