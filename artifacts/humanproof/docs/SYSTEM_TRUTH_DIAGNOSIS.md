# Layoff Audit System — Truth Diagnosis & Architecture Assessment

**Date**: 2026-04-18  
**Auditor**: Principal AI Systems Architect  
**Objective**: Identify all sources of false precision, stale intelligence, and signal disconnection

---

## A. DATA REALITY — Signal Source Breakdown

### Current Signal Composition (Layoff Audit L1-L5 Engine)

| Layer                      | Primary Data Source                                          | Signal Type                | Freshness                                                                                                  | Confidence                                |
| -------------------------- | ------------------------------------------------------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| L1 Company Health (30%)    | `companyDatabase.ts` / `companyIntelligenceDB.ts`            | **100% Static Pre-seeded** | 2–90 days old (lastUpdated: 2026-04-01 to 2026-04-16)                                                      | Artificial (0.6–0.9 based on field count) |
| L2 Layoff History (25%)    | Static DB + `layoffNewsCache`                                | **~95% Static, 5% Live**   | Layoff dates are historical (some >12 months old); news cache updates daily but only triggers if agent run | 0.65–0.88 (if news present)               |
| L3 Role Exposure (20%)     | `roleExposureData.ts` keyword lookup + `ROLE_COMPLEXITY_MAP` | **100% Heuristic Lookup**  | Never updated (static since v1.0)                                                                          | 0.80 (exact match) / 0.45 (fallback)      |
| L4 Market Conditions (12%) | `industryRiskData.ts`                                        | **100% Static Lookup**     | Never updated (baselineRisk, aiAdoptionRate fixed)                                                         | N/A (treated as ground truth)             |
| L5 Employee Factors (13%)  | User input (tenure, performance)                             | **100% User-Provided**     | Real-time but subjective                                                                                   | 1.0 (assumed truthful)                    |

**Overall**: **~87% static/heuristic data**, **~13% user input**, **~0% truly live API signals** in the L1-L5 engine.

### Live Signal Infrastructure (Exists but Unused)

| Component                              | Data Source                       | Integration Status                                                                          | Problem                                        |
| -------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `stockVolatilityAgent`                 | Alpha Vantage API                 | Produces signal but **not consumed** by L1-L5                                               | Siloed in swarm only                           |
| `recentLayoffAgent`                    | NewsAPI                           | Detects recent layoffs but **only updates SwarmReport**                                     | L2 still uses DB's stale `layoffsLast24Months` |
| `cached_company_intelligence` DB table | OSINT fetch-company-data function | Updates periodically but **not read by scoring engine**                                     | Data exists but unused                         |
| `live_signals` table                   | Multiple external APIs            | Populated by ingestion pipelines but **only read by analyze-signals Edge Function** (D1-D6) | L1-L5 ignores it completely                    |

**Critical Finding**: The system has **two parallel intelligence tracks**:

- **Track A (Layoff Audit)**: Pure static DB → deterministic L1-L5 → UI
- **Track B (Risk Oracle)**: Live signals + LLM ensemble → D1-D6 scores → UI

These tracks **never reconcile**. Users see potentially conflicting scores with no explanation.

---

## B. SIGNAL FLOW — Disconnected Intelligence Paths

```
[DATA INGESTION LAYER]
    │
    ├─▶ companyDatabase.ts (static, lastUpdated 2026-04-01)
    ├─▶ companyIntelligenceDB.ts (static, lastUpdated 2026-04-16)
    ├─▶ fetch-company-data Edge Function (live OSINT → cached_company_intelligence)
    ├─▶ Alpha Vantage API (called by agents, not stored centrally)
    ├─▶ NewsAPI (called by agents, not stored centrally)
    │
    ▼
[SCORING ENGINE - LAYOFF AUDIT - Uses ONLY static path]
    │
    ├─▶ resolveCompanyData() → companyDatabase | companyIntelligenceDB | null
    ├─▶ calculateLayoffScore() → L1-L5 from static fields
    ├─▶ analyzeSignalQuality() → detects conflicts but doesn't resolve
    │
    ▼
[SWARM LAYER - Separate parallel track]
    │
    ├─▶ runSwarmLayer() → 30 agents (some use live APIs)
    ├─▶ aggregateSwarmResults() → SwarmReport
    │
    ▼
[ENSEMBLE AGGREGATOR - ONLY for D1-D6]
    │
    ├─▶ aggregateEnsembleResults() → combines LLM outputs + engine + swarm
    │
    ▼
[UI - Two separate displays]
    │
    ├─▶ Layoff Audit tab ← L1-L5 only (ignores swarm/ensemble)
    └─▶ Risk Oracle tab ← D1-D6 + swarm + LLMs (ignores L1-L5)
```

**Isolation Problem**: The `layoffScoreEngine` has **no visibility** into swarm signals. The `ensembleAggregator` has **no visibility** into L1-L5 results. No cross-track consensus.

---

## C. CONFIDENCE INTEGRITY — False Confidence Analysis

### Artificial Confidence Inflation

**In `calculateConfidence()` (layoffScoreEngine.ts:485-504)**:

```typescript
let score = 0;
if (companyData.revenueGrowthYoY !== null) score += 1; // Present = +1
if (companyData.isPublic && companyData.stock90DayChange !== null) score += 1;
if (companyData.layoffsLast24Months?.length > 0) score += 1;
if (companyData.employeeCount > 0) score += 1;
if (companyData.lastLayoffPercent !== null) score += 0.5;
if (companyData.source !== "User Input" && companyData.source !== "Fallback")
  score += 0.5;

if (score >= 4) return "High"; // 4 out of 6 possible points
```

**This is NOT confidence in accuracy** — it's **field presence detection**. A company can have:

- `revenueGrowthYoY: 5` (from categorical guess)
- `stock90DayChange: 2` (from heuristic hiring freeze proxy)
- `employeeCount: 1000` (from size category estimate)
- Old layoff data from 12 months ago

And still get **"High" confidence** (4 points) even though all data is **stale, estimated, or indirect**.

### StalenessPenalty Under-delivers

`calculateConfidencePercent` applies `stalenessPenalty = Math.min(40, ageInDays * 0.3)`:

- 30 days old → penalty = 9 → High confidence (85) → 76% (still "High")
- 90 days old → penalty = 27 → Medium confidence (60) → 33% (becomes "Low")
- 180 days old → penalty capped at 40 → Low confidence (35) → **still 35% (not zero)**

**Problem**: A score based on **6-month-old financials** can still显示 35% confidence, implying some validity when it's effectively **random**.

### False Precision in UI

- `ShareableScoreCard.tsx:19`: `displayScore` defaults to 72 if all sources null — **arbitrary default displayed as meaningful**
- Score ring shows **exact integer** (e.g., "62") with no error bars
- Confidence interval computed (`calculateConfidenceInterval`) but **never shown to user**

---

## DATA DECAY — Fastest-Decaying Fields

| Field                                       | Half-life                       | Reason                                                             |
| ------------------------------------------- | ------------------------------- | ------------------------------------------------------------------ |
| `stock90DayChange`                          | **7 days**                      | Stock prices change daily; a 90-day snapshot is stale in a week    |
| `hiringFreezeScore` (inferred)              | **14 days**                     | Hiring sentiment shifts monthly at minimum                         |
| `revenueGrowthYoY`                          | **90 days until next earnings** | Quarterly metric; becomes stale immediately after quarter-end      |
| `layoffsLast24Months`                       | **30 days**                     | New layoffs invalidate the 24-month window; need real-time updates |
| `aiInvestmentSignal`                        | **180 days**                    | AI strategy pivots happen quarterly but signals lag                |
| `lastFundingRound`/`monthsSinceLastFunding` | **365 days** (for Series A-C)   | Funding events are infrequent; decay slower                        |

**Critical**: `stock90DayChange` is the **fastest-decaying** field (7-day half-life). Yet the L1 scoring uses it directly with no time-weighting.

---

## SIGNAL DEPENDENCIES — Hidden Assumptions

**Problem 1**: `freezeScoreToStockProxy()` (companyIntelligenceBridge.ts:54)

```typescript
const freezeScoreToStockProxy = (freeze: number, trend: string): number => {
  if (trend === "growing" && freeze < 0.4) return 15;
  if (trend === "growing") return 5;
  if (trend === "declining") return -15 - freeze * 20;
  return Math.round(-freeze * 18);
};
```

This **assumes** stock performance correlates with hiring freeze. But a company can have:

- Stock up 20% (AI hype) while **simultaneously** freezing hiring (cost discipline)
- Stock down 10% (market correction) while **aggressively hiring** (competitive expansion)

No validation of this proxy against real data.

**Problem 2**: `BURN_RATE_TO_REV_PER_EMP` mapping (companyIntelligenceBridge.ts:35)

```typescript
const BURN_RATE_TO_REV_PER_EMP = {
  low: 550000, // "low burn = high revenue/employee"
  moderate: 280000,
  high: 120000,
  very_high: 60000,
};
```

**Assumption**: Burn rate directly maps to revenue per employee. But:

- A consulting firm (high revenue/emp, low burn) matches low=550k ✓
- A hardware startup (low revenue/emp, high burn) matches very_high=60k ✓
- But a **pre-revenue biotech** with 50 employees, $50M cash (burn high) but $0 revenue → rev/emp = 0, not 60k. The proxy **fails for pre-revenue companies**.

**Problem 3**: `REVENUE_TREND_TO_YOY` mapping (companyIntelligenceBridge.ts:26)

```typescript
const REVENUE_TREND_TO_YOY = {
  growing: 18, // mid-high growth proxy
  stable: 5, // flat-to-modest growth
  declining: -8, // moderate contraction
};
```

These are **single-point estimates** for entire categories. A "growing" company could have +5% (barely growing) or +50% (hypergrowth). Lumping all to +18% is a **variance obscurer**.

---

## ARCHITECTURE WEAKNESSES SUMMARY

1. **No Central Signal Bus**: Signals from swarm, DB, and live APIs flow through separate pipes. No canonical source of truth.
2. **No Time-Weighting**: All signals treated as equally current. A layoff from 11 months ago (weight 0.62) is almost as influential as one from 2 months ago (0.95).
3. **No Cross-Track Reconciliation**: Layoff Audit (L1-L5) and Risk Oracle (D1-D6) operate independently. Should converge on same reality.
4. **Confidence = Presence, Not Accuracy**: The confidence metric counts non-null fields, not data quality or recency.
5. **Heuristic Proliferation**: At least **12 heuristic functions** masquerade as signals:
   - `mapRevenueGrowth()` — categorical → numeric guess
   - `mapStockTrend()` — same
   - `mapFundingStatus()` — monotonic function with hand-tuned thresholds
   - `mapCompanySize()` — arbitrary employee count ranges
   - `mapOverstaffing()` — PPP-adjusted thresholds with no empirical basis
   - `calculateRecentLayoffRisk()` — fixed bins
   - `calculateRoundFrequency()` — linear scaling by count
   - `heuristicVolatility()` (stock agent)
   - `heuristicLayoff()` (layoff agent)
   - `freezeScoreToStockProxy()` — unsupported mapping
   - `BURN_RATE_TO_REV_PER_EMP` — reverse-engineered proxy
   - `REVENUE_TREND_TO_YOY` — categorical estimate

These **heuristics are the system's backbone**, yet none are documented as empirically validated.

---

## PRE-CONDITION FOR TRANSFORMATION

Before any code changes, we must:

1. **Establish Data Freshness SLA**: All signals >7 days old are "degraded"; >30 days are "invalid". Implement `isSignalFresh(signal)` validator.
2. **Define Ground Truth Source**: Choose **one** source as the "current truth" per signal type:
   - Stock price → Alpha Vantage (authoritative)
   - Revenue growth → SEC filings / earnings reports (authoritative)
   - Recent layoffs → NewsAPI + layoffs.fyi (authoritative)
   - Company size → Crunchbase (authoritative)
3. **Instrument Signal Provenance**: Every signal input to scoring must carry:
   ```typescript
   interface ProvenancedSignal {
     value: number;
     source: 'db' | 'live_api' | 'heuristic' | 'user_input';
     timestamp: ISO string;
     rawSource?: any;  // original payload for audit
     confidenceModifier: number;  // 0–1 multiplier
   }
   ```
4. **Eliminate Silent Fallbacks**: Currently `createFallbackCompanyData()` supplies defaults (employeeCount=1000, revenue/emp=250k). These should **fail hard** or **require user input** rather than injecting guesses.

---

## TRANSFORMATION PRINCIPLES

1. **No Averaging of Conflicts**: If DB and live signals disagree by >20%, do NOT average. Flag and explain.
2. **Freshness > Completeness**: A 7-day-old signal from live API is **better** than a 90-day-old "complete" DB record. Prioritize by timestamp.
3. **Transparency Over Polish**: Show raw signal values and conflicts in UI, even if ugly.
4. **Kill-Switches for Heuristics**: Any heuristic proxy must have an **expiry date** (date after which it's disabled) or **validation check** (assertion against live data).

---

**DIAGNOSIS COMPLETE** — Ready for architecture redesign (Task 2).
