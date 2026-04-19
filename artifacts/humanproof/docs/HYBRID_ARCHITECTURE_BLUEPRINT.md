# Hybrid Intelligence Architecture — Transformation Blueprint

**Objective**: Transform from static DB → real-time, conflict-aware career risk engine  
**Target**: >90% accuracy, <24h signal latency, explainable conflicts  
**Architecture**: 3-layer consensus with kill-switches

---

## LAYER 1: PRE-SEEDED GROUND TRUTH (Tier 1 — Baseline)

**Purpose**: Provide stable historical baseline and company identification  
**Data Store**: Supabase `company_intelligence` table (normalized schema)  
**Update Frequency**: Daily batch refresh from OSINT pipelines  
**TTL**: Records >30 days automatically flagged as `stale=true`

### Schema Requirements

```sql
CREATE TABLE company_baseline (
  id UUID PRIMARY KEY,
  company_name TEXT NOT NULL,
  normalized_key TEXT UNIQUE NOT NULL,
  -- Historical ground truth (slow-changing)
  industry TEXT NOT NULL,
  employee_count_range VARCHAR(20),  -- e.g., "5000-10000" (source: Crunchbase)
  headquarters_region TEXT NOT NULL,  -- US, EU, IN, APAC
  business_model TEXT,  -- saas, ecommerce, manufacturing, services
  risk_profile JSONB,  -- static risk vectors (role risk map, ai exposure index)
  -- Metadata
  data_confidence FLOAT NOT NULL DEFAULT 0.9,  -- 0–1 source reliability
  last_verified TIMESTAMP NOT NULL,
  next_verification_due TIMESTAMP NOT NULL,
  source_urls JSONB,  -- provenance links
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Rules**:

- **Never compute scores directly from this layer** — it's a reference baseline
- All records must have `last_verified` timestamp; if >30 days, score engine **cannot use without live confirmation**
- Fields: `industry`, `region`, `company_size_category` are **permanent** (change rarely)
- Fields: `employee_count`, `ai_exposure_index`, `role_risk_map` are **versioned** — each update creates new版本

---

## LAYER 2: LIVE SIGNAL ENGINE (Tier 2 — Current Reality)

**Purpose**: Capture real-time market signals with authoritative sources  
**Data Sources**: Alpha Vantage, NewsAPI, SEC EDGAR, Crunchbase, Layoffs.fyi  
**Update Frequency**: Real-time (market hours) or near-real-time (news within 5min)  
**Retention**: 90 days in `live_signals` table, aggregated metrics in `company_realtime`

### Signal Types & Auth Sources

| Signal                         | Source                          | Priority              | Timestamp            | TTL              |
| ------------------------------ | ------------------------------- | --------------------- | -------------------- | ---------------- |
| `stock_price`                  | Alpha Vantage TIME_SERIES_DAILY | Critical (public cos) | Daily close          | 24h              |
| `stock_volatility_90d`         | Alpha Vantage calculated        | Critical              | Daily                | 24h              |
| `earnings_revenue_growth`      | SEC EDGAR 10-Q/10-K             | Critical              | Quarterly            | 120d             |
| `recent_layoff_news`           | NewsAPI + layoffs.fyi RSS       | Critical              | Article publish time | 14d decay weight |
| `hiring_freeze_announcement`   | NewsAPI + company blog          | High                  | Announcement date    | 30d decay        |
| `funding_event`                | Crunchbase API                  | Medium                | Event date           | 60d decay        |
| `leadership_change`            | NewsAPI                         | Medium                | Announcement date    | 60d decay        |
| `quarterly_earnings_sentiment` | Earnings call transcript NLP    | Medium                | Earnings date        | 90d decay        |
| `competitive_disruption`       | Industry news cluster           | Low                   | Various              | 30d decay        |

### Live Signal Schema

```sql
CREATE TABLE live_signals_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES company_baseline(id),
  signal_type TEXT NOT NULL,  -- 'stock_price', 'layoff_news', etc.
  signal_value NUMERIC NOT NULL,  -- normalized 0–1
  raw_value TEXT,  -- original API value (e.g., "156.32" for stock)
  unit TEXT,  -- 'percent', 'count', 'bool', 'money'
  source_name TEXT NOT NULL,  -- 'alpha_vantage', 'newsapi', 'sec_edgar'
  source_url TEXT,  -- link to original
  fetched_at TIMESTAMP NOT NULL DEFAULT NOW(),
  signal_timestamp TIMESTAMP NOT NULL,  -- when the event happened
  confidence FLOAT NOT NULL DEFAULT 0.8,  -- source reliability
  decay_rate FLOAT NOT NULL DEFAULT 0.05,  -- per day (λ)
  -- Conflict metadata
  contradicts_signal UUID REFERENCES live_signals_v2(id),  -- self-reference
  conflict_reason TEXT,
  UNIQUE(company_id, signal_type, signal_timestamp)
);

CREATE INDEX idx_live_signals_company ON live_signals_v2(company_id, signal_type, signal_timestamp DESC);
CREATE INDEX idx_live_signals_fresh ON live_signals_v2(signal_timestamp) WHERE signal_timestamp > NOW() - INTERVAL '30 days';
```

### Time-Decay Function

Every signal's effective weight decays exponentially:

```
effective_weight(t) = confidence * EXP(-decay_rate * age_in_days)
effective_value(t) = signal_value * effective_weight
```

- Stock price: decay_rate = 0.1 per day → half-life ~7 days
- Layoff news: decay_rate = 0.05 per day → half-life ~14 days
- Earnings data: decay_rate = 0.01 per day → half-life ~70 days (quarterly)

---

## LAYER 3: SWARM VERIFICATION (Tier 3 — Cross-Validation)

**Purpose**: Agents do NOT generate primary signals. They **validate, challenge, or contextualize** signals from Layers 1 & 2.

### Agent Redesign — No Duplication

**Old design flaw**: Agents called the same APIs independently, producing redundant signals.  
**New design**: Agents subscribe to the `live_signals_v2` feed and apply **expertise-specific filters**.

#### Agent Categories (Reduced from 30 to 12 high-value agents)

**Category A — Signal Validators (6 agents)**  
These agents take a primary signal and assess its reliability:

1. `stockVolatilityValidator`: Given `stock_price` and `stock_volatility_90d` from live API, compute if volatility spike is ** news-driven or systematic**. Flags if volatility >30% but no news signal → may be **data error**.
2. `layoffNewsCredibility`: Given `recent_layoff_news` articles, assess source credibility (Layoffs.fyi > TechCrunch > unknown blog). Downweights unverified sources.
3. `earningsQualityAgent`: Given `earnings_revenue_growth`, check if GAAP vs non-GAAP, one-time gains excluded. **Flags inflated numbers**.
4. `hiringFreezeGravity`: Distinguishes "slowdown" from "freeze" in news text. Many companies say "hiring slowdown" but media reports it as "freeze." Applies **severity multiplier**.
5. `fundingRunwayCalculator`: Given `funding_event` + `burn_rate_estimate` (from DB), compute **months of cash runway**. Flags if <12 months → elevated risk even if DB says "Series C".
6. `sectorContagionValidator`: Given company's industry + recent peer layoffs (last 30d), compute **actual contagion probability** vs static `baselineRisk`.

**Category B — Contradiction Detectives (4 agents)**  
These agents explicitly look for signal conflicts:

7. `stockEarningsDiscrepancyAgent`: Compares `stock_price` trend vs `revenue_growth`. If stock up 30% but revenue down 10%, flags **disconnect** (possible hype bubble).
8. `layoffHiringParadoxAgent`: If `recent_layoff_news` exists but `hiringVelocity` (from NewsAPI job postings) is high, flags **selective cuts vs expansion** — may indicate restructuring, not collapse.
9. `aiInvestmentHiringGapAgent`: If `aiInvestmentSignal=high` but `hiringFreezeScore=high`, flags **strategy pivot** (cutting legacy roles to fund AI hiring).
10. `employeeCountNewsMismatchAgent`: If DB says `employeeCount=50,000` but news reports "12,000 layoffs" (23% cut), verifies if DB is outdated.

**Category C — Contextualizers (2 agents)**  
These enrich signals with nuance:

11. `regionalLaborLawAgent`: For EU companies, downgrade layoff risk based on ** Works Council protections, severance laws**. Not all layoff news equals high risk in Germany.
12. `roleCriticalityAgent`: For known companies with role risk maps, check if user's role is in **protected categories** (e.g., R&D vs G&A). Layoffs at company don't affect all departments equally.

#### Agent Output Contract

```typescript
interface SwarmAgentOutput {
  agentId: string;
  category: "validator" | "detective" | "contextualizer";
  signalType: string; // e.g., 'layoff_news'
  verdict: "confirm" | "challenge" | "insufficient_data";
  confidence: number; // 0–1, this agent's certainty
  adjustedValue?: number; // if challenge, proposed correction
  evidence: string[]; // supporting evidence URLs/ snippets
  timestamp: string; // ISO
}
```

**Key Rule**: Agents **never** produce primary scores. They only **modify** existing signals or **flag** issues.

---

## CONSENSUS ENGINE (Central Signal Resolver)

**Purpose**: Merge Layer 1 (DB), Layer 2 (Live), Layer 3 (Swarm) into a single coherent signal set with confidence weights.

### Consensus Algorithm

```
For each required signal S (revenueGrowth, stockTrend, recentLayoffs, etc.):

1. COLLECT all observations for company C:
   - DB_value: from company_baseline (timestamp: last_verified)
   - LIVE_values: all from live_signals_v2 where signal_type=S, timestamp in last 30d
   - SWARM_verdicts: agents that assessed signal S

2. FRESHNESS FILTER:
   If (NOW - signal_timestamp) > max_age(S):
     weight = 0  // signal expired
   Else:
     weight = EXP(-decay_rate * age_in_days) * source_confidence

3. RELIABILITY SCORING:
   - DB: baseConfidence = data_confidence from company_baseline (0.7–0.95)
   - LIVE: sourceConfidence = 0.9 (Alpha Vantage) or 0.8 (NewsAPI)
   - SWARM: average(agent.confidence) for agents validating this signal

4. CONFLICT DETECTION:
   Let V = weighted average of all values (DB + LIVE, swarm-adjusted)
   Compute stdDev across all observations.
   IF stdDev > threshold(S):
     Mark signal as CONFLICTED
     Trigger detective agents to investigate
     BEFORE final score: WAIT for resolution OR apply penalty

5. FINAL SIGNAL VALUE:
   IF no conflict:
     V = weighted average (freshness-weighted)
   ELSE IF conflict resolved by swarm:
     Use swarm-adjusted value
   ELSE:
     Reduce confidenceWeight by 50%, widen confidence interval
     Flag in UI: "Mixed market signals — expert review recommended"

6. PERSIST consensus_record:
   - consensus_value
   - confidence_interval (low, high)
   - sources_used
   - conflicts_detected (bool)
   - staleness_days
```

### Conflict Resolution Rules

**Rule 1 — Priority by Freshness** (not source):

```
IF live_signal.age < 7d AND db_signal.age > 7d:
  dominant = live_signal  (freshness wins)
  db_signal_discount = 0.3
```

**Rule 2 — Source Hierarchy** (when freshness equal):

```
Priority: SEC filings (earnings) > Alpha Vantage (stock) > NewsAPI (news) > DB
```

But only if confidence score justifies.

**Rule 3 — Kill-switch Triggers**:

```
IF signal_type == 'recent_layoff_news' AND live_value > 0.8:
  // High-confidence news of recent layoffs detected
  // IGNORE DB's 'layoffRounds = 0' or 'lastLayoffDate > 30d'
  OVERRIDE L2 → max(0.85, live_value * 1.1)  // escalate
  FLAG: "Live layoff news supersedes historical record"

IF signal_type == 'stock_volatility' AND live_value > 0.9:
  // Market signaling extreme stress
  BOOST L1 by +0.2
  FLAG: "Market stress override"
```

---

## SCORING ENGINE REFACTOR — L1-L5 with Live Signals

### New Scoring Flow

```typescript
// NEW MAIN CALCULATOR
export const calculateLayoffScoreHybrid = async (
  inputs: ScoreInputs,
  swarmReport?: SwarmReport  // NEW param
): Promise<ScoreResult> => {
  // 1. RESOLVE COMPANY with live fetch
  const companyData = await resolveCompanyDataHydrated(inputs.companyName);

  // 2. FETCH LIVE SIGNALS for this company (last 30d)
  const liveSignals = await fetchLiveSignals(companyData.id);

  // 3. RUN SWARM VERIFICATION (if swarmReport not provided)
  const swarm = swarmReport || await runSwarmLayer({
    companyName: companyData.name,
    roleTitle: inputs.roleTitle,
    department: inputs.department,
    liveSignals  // pass in for agent consumption
  });

  // 4. CONSENSUS ENGINE — merge DB + live + swarm into coherent signal set
  const consensus = await consensusEngine.resolve({
    db: companyData,
    live: liveSignals,
    swarm: swarm,
    role: inputs.roleTitle,
    department: inputs.department
  });

  // 5. SCORE with kill-switches
  const L1 = calculateCompanyHealthScore_V2(consensus);  // uses live stock + earnings
  const L2 = calculateLayoffHistoryScore_V2(consensus);  // uses live news priority
  const L3 = calculateRoleExposureScore_V2(consensus);   // uses swarm-validated role risk
  const L4 = calculateMarketConditionsScore_V2(consensus); // uses live industry signals
  const L5 = calculateEmployeeFactorsScore(inputs.userFactors);

  // 6. NON-LINEAR OVERRIDES
  let finalScore = L1*0.3 + L2*0.25 + L3*0.2 + L4*0.12 + L5*0.13;

  // Kill-switch A: Financial collapse signal
  IF consensus.financialDistressSignal > 0.9:
    finalScore = Math.max(finalScore, 75);  // floor at 75% risk

  // Kill-switch B: Live layoff confirmed
  IF consensus.recentLayoffNews_score > 0.85:
    finalScore = Math.max(finalScore, 70);  // immediately elevated

  // Kill-switch C: Swarm detects severe contradiction (DB vs live)
  IF consensus.conflictLevel === 'HIGH':
    // Widen confidence interval, do not hide
    confidencePenalty = 30;

  // 7. Confidences based on consensus quality
  const confidence = calculateConfidenceFromConsensus(consensus);

  return {
    score: Math.round(finalScore),
    confidence,
    confidenceInterval: consensus.confidenceInterval,
    dataFreshness: consensus.freshnessReport,
    signalQuality: {
      hasConflicts: consensus.conflictLevel > 0,
      conflictingSignals: consensus.conflicts,
      liveSignals: consensus.liveSignalCount,
      heuristicSignals: consensus.heuristicCount,
      primarySource: consensus.primarySource  // 'live' | 'db' | 'hybrid'
    },
    // ... rest
  };
};
```

### Kill-Switch Logic (Detailed)

**Kill-Switch 1 — Financial Distress (L1 Override)**

```
Condition:
  - stock_90d_change < -20% (live)
  - AND revenue_growth YoY < -10% (live OR verified DB)
  - AND cash_balance_estimate < 12 months runway (from burn rate + latest funding)

Action:
  - L1 = Math.max(current_L1, 0.85)  // force high risk
  - Set flag: "Financial distress override — fundamentals deteriorating"
  - Confidence: set to "Medium" (override may be too aggressive)
```

**Kill-Switch 2 — Confirmed Layoff Event**

```
Condition:
  - recentLayoffNews confidence > 0.8
  - layoff_percent_mentioned >= 5%
  - article_date within 14 days

Action:
  - L2 = 0.95  // maximum risk (very recent)
  - OVERRIDE any DB value (even if DB says last layoff was 6 months ago)
  - Set flag: "Live layoff detection supersedes database"
```

**Kill-Switch 3 — Hiring Freeze + Financial Stress = Pre-Layoff**

```
Condition:
  - L1 > 0.7 (financial stress)
  - hiring_freeze_score > 0.7 (live news or job posting drop)
  - NO recent layoffs in last 6 months (DB clean)

Action:
  - L2 = 0.65  // elevate history score despite no actual layoffs yet
  - Set flag: "High-risk precursor pattern: financial stress + hiring freeze"
  - Reasoning: Companies typically freeze hiring 1-3 months before layoffs
```

**Kill-Switch 4 — Stock disconnect**

```
Condition:
  - stock_price_up > 25% last 90d (live)
  - revenue_growth_down < -5% (live)
  - Gap > 30 percentage points

Action:
  - L1 = 0.65  // suspect financials, possible bubble
  - Set flag: "Stock/revenue divergence — possible hype or accounting adjustment"
```

---

## SIGNAL WEIGHTING BY FRESHNESS + SOURCE

Replace fixed weights with **dynamic weights**:

```
signal_weight = base_weight * source_reliability * freshness_factor

Where:
  base_weight: Layer default (L1=0.3, L2=0.25, ...)
  source_reliability:
    SEC filing: 1.0
    Alpha Vantage: 0.9
    NewsAPI (verified source): 0.8
    NewsAPI (generic): 0.6
    companyDatabase (verified): 0.7  // but aged
    companyDatabase (unverified): 0.4
    heuristic estimate: 0.3
  freshness_factor = EXP(-0.05 * age_in_days)  // half-life ~14 days
```

**Example**: Oracle revenueGrowth from DB (last verified 90 days ago):

- base_weight_L1 = 0.3
- source_reliability (DB verified) = 0.7
- freshness = exp(-0.05\*90) = 0.11
- **Effective weight = 0.3 × 0.7 × 0.11 = 0.023** → almost negligible

If Alpha Vantage provides live revenue (age=1 day):

- freshness = exp(-0.05\*1) = 0.95
- source_reliability = 0.9
- **Effective weight = 0.3 × 0.9 × 0.95 = 0.257** → full power

This automatically **downgrades stale DB** and **upweights fresh API data**.

---

## SIGNAL INTEGRITY SERVICE (New Module)

Create `services/signalIntegrity/signalIntegrityService.ts`:

```typescript
class SignalIntegrityService {
  // Central authority for all signal validation
  async resolveSignal(
    signalType: string,
    companyId: string,
  ): Promise<ResolvedSignal> {
    const dbSignal = await this.getDBSignal(signalType, companyId);
    const liveSignals = await this.getLiveSignals(signalType, companyId);
    const swarmVerdicts = await getSwarmVerdictsFor(signalType, companyId);

    // Apply freshness filter
    const freshLive = liveSignals.filter((s) => this.isFresh(s, signalType));

    if (freshLive.length === 0) {
      // No fresh live data → use DB with age penalty
      return this.degradeDBSignal(dbSignal);
    }

    // Check swarm challenges
    const challenges = swarmVerdicts.filter((v) => v.verdict === "challenge");
    if (challenges.length > 0) {
      // Swarm questions DB or live data — investigate
      return this.handleChallenge(challenges, dbSignal, freshLive);
    }

    // Weighted consensus
    const consensus = this.computeWeightedAverage(dbSignal, freshLive);
    return consensus;
  }

  private computeWeightedAverage(
    db: DBSignal | null,
    live: LiveSignal[],
  ): ResolvedSignal {
    const weights = live.map((l) => ({
      value: l.signal_value,
      weight: l.confidence * this.freshnessFactor(l),
    }));

    // Include DB only if not too old
    if (db && this.isAcceptablyFresh(db)) {
      weights.push({
        value: this.dbToNormalized(db),
        weight: db.data_confidence * this.freshnessFactor(db),
      });
    }

    const totalWeight = sum(weights.map((w) => w.weight));
    const weightedValue =
      sum(weights.map((w) => w.value * w.weight)) / totalWeight;

    return {
      value: weightedValue,
      confidence: Math.min(1, totalWeight / (live.length + 1)),
      sources: [...live.map((l) => l.source_name), "baseline_db"],
      stalenessDays: Math.min(...live.map((l) => l.age_in_days)),
      hasConflict: this.detectConflict(db, live),
    };
  }
}
```

---

## UI TRANSPARENCY LAYER (Required View Components)

### Data Quality Banner (must appear above score ring)

```tsx
<DataQualityBanner
  freshness={consensus.freshnessReport}
  conflicts={consensus.conflicts}
  signalSources={consensus.sourceBreakdown}
/>

/*
Renders:
- [✅] All signals fresh (<7d)  OR  [⚠️] 2 signals >14d old  OR  [🔴] No live data available
- [⚡] Confidence: 72% (±15 pts)  (derived from interval range)
- [🔗] Sources: Alpha Vantage (stock), SEC (revenue), NewsAPI (layoffs)
- If conflicts: [‼️] Mixed signals detected — click to expand details
*/
```

### Conflict Disclosure Panel

When `hasConflicts=true`:

```
┌─ Signal Conflict Detected ──────────────┐
│                                         │
│  Financial Health (L1)                 │
│    DB (Apr 1):   Stable (0.45)         │
│    Live (Apr 17): Declining (−8% rev)  │
│    Resolution:  Live signal overrides  │
│    Reason:  DB data 16d old; live earnings report just released │
│                                         │
│  Recent Layoffs (L2)                   │
│    DB:    None (0.05)                  │
│    Live:  2 articles, 12% cut (0.78)   │
│    Resolution:  Layoff confirmed — L2 elevated to 0.82       │
│                                         │
│  Overall confidence: Medium (68%)      │
│  Score impact: +18 points (from 44→62)│
│                                         │
└─────────────────────────────────────────┘
```

---

## IMPLEMENTATION SEQUENCE (Phase 1 — Foundation)

**Week 1–2: Signal Integrity Service**

1. Create `signalIntegrityService.ts` with `resolveSignal()` and `freshnessFactor()`.
2. Add `lastVerified` timestamps to all DB records (data migration).
3. Implement `isFresh(signal, maxAge)` validator.

**Week 3–4: Live Signal Ingestion Pipeline**

1. Supabase Edge Function `fetch-realtime-signals`:
   - Accepts `companyId` or `ticker`
   - Fetches Alpha Vantage daily + overview
   - Fetches NewsAPI last 14 days
   - Stores in `live_signals_v2` with canonical timestamps
2. Schedule: run nightly for all tracked companies; on-demand for user request

**Week 5–6: Agent Redesign**

1. Reduce from 30 to 12 agents (keep only validated, non-redundant ones)
2. Change agent signature: input = `live_signals` array; output = `SwarmAgentOutput` (verdict only)
3. Implement `runSwarmVerification()` that runs AFTER consensus, not parallel

**Week 7–8: Consensus Engine & Scoring Refactor**

1. Implement `consensusEngine.resolve()` that returns `ConsensusSignalSet`
2. Refactor `calculateLayoffScore()` → `calculateLayoffScoreHybrid()` to consume consensus
3. Add kill-switch checks at each layer
4. Add `confidenceFromConsensus()` that uses:
   - % of signals that are live
   - Number of conflicts detected
   - Average freshness (weighted)

**Week 9–10: UI Transparency & Data Quality Display**

1. Build `DataQualityBanner` component
2. Build `ConflictDisclosurePanel` component
3. Replace score ring with error bars (min–max) based on confidence interval
4. Add "Last updated" timestamp with source breakdown on hover

**Week 11–12: Validation & Load Testing**

1. Run historical backtest: pick 50 companies with known outcomes (layoff vs not), compare predicted vs actual
2. Measure: accuracy, precision, recall, F1
3. Tune kill-switch thresholds based on false positive/negative tradeoff
4. Load test with 100 concurrent users (API rate limiting, caching)

---

## WHAT GETS REMOVED / DEPRECATED

1. ❌ `heuristicVolatility()` in stockVolatilityAgent — now uses live API directly or fails
2. ❌ `heuristicLayoff()` in recentLayoffAgent — now uses NewsAPI OR marks signal as "insufficient data"
3. ❌ `freezeScoreToStockProxy()` mapping — replaced with actual stock data
4. ❌ `BURN_RATE_TO_REV_PER_EMP` proxy — replaced with actual revenue from SEC/Crunchbase
5. ❌ `REVENUE_TREND_TO_YOY` mapping — replaced with actual earnings growth %
6. ❌ `companyDatabase.ts` static array — becomes a cache of baseline records only
7. ❌ 18 of 30 swarm agents (keep only 12 high-value validators/detectives)
8. ❌ `simulateScenario()` (unused feature) — removed or repurposed for what-if analysis based on live data

---

## SUCCESS METRICS

| Metric                                         | Current               | Target (Post-Transform)                        |
| ---------------------------------------------- | --------------------- | ---------------------------------------------- |
| Data freshness (avg age)                       | 45 days               | <7 days                                        |
| % live signals in score                        | 0%                    | >60%                                           |
| Confidence calibration (prediction vs outcome) | Unknown (no tracking) | >85% accurate within ±12pt CI                  |
| Conflict explanation coverage                  | 0%                    | 100% (all conflicts surfaced)                  |
| User trust (survey)                            | Unknown               | >90% "trust score"                             |
| Score volatility (day-to-day)                  | 0 (static)            | Reflects real market moves (±5–15 pts on news) |

---

## ARCHITECTURE DIAGRAM (Text Flow)

```
┌────────────────────────────────────────────────────────────────────┐
│                     HYBRID INTELLIGENCE ENGINE                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────┐                                          │
│   │  Layer 1: Baseline  │  (Supabase company_baseline)            │
│   │  (Historical Truth) │  - Industry, region, size               │
│   └──────────┬──────────┘  - Role risk maps (static core)         │
│              │                                                     │
│              ├───────────┐                                         │
│              │           │                                         │
│   ┌──────────▼───┐  ┌───▼──────────┐                             │
│   │ Layer 2: Live │  │ Layer 3:      │   Swarm Verification        │
│   │ Signals      │  │ Swarm Agents  │   (12 focused agents)       │
│   │ (Real-time)  │  │ (Validate)    │                             │
│   │               │  │               │                             │
│   │ • Stock API  │  │ • Signal      │   Agents validate:          │
│   │ • NewsAPI    │  │   Validators  │   - Stock vs earnings       │
│   │ • SEC EDGAR  │  │ • Contradict- │   - Layoff news credibility │
│   │ • Crunchbase │  │   ion Detect. │   - Hiring freeze gravity   │
│   └───────┬───────┘  └───────┬───────┘   - Funding runway          │
│           │                  │                                    │
│           └────────┬─────────┘                                    │
│                    │                                               │
│                    ▼                                               │
│           ┌────────────────────┐                                   │
│           │ Consensus Engine   │  (Central resolver)              │
│           │                    │  - Freshness weighting           │
│           │ • Weighted avg     │  - Conflict detection            │
│           │ • Kill-switch      │  - Source hierarchy              │
│           │   overrides        │  - Discrepancy resolution        │
│           └─────────┬──────────┘                                   │
│                     │                                               │
│                     ▼                                               │
│           ┌────────────────────┐                                   │
│           │ Scoring Engine V2  │  (Non-linear, conflict-aware)   │
│           │                    │                                   │
│           │ L1: Financial      │  Kill-switches applied           │
│           │ L2: Layoff         │  → Financial distress override   │
│           │ L3: Role           │  → Live layoff override          │
│           │ L4: Market         │  → Precursor pattern escalation  │
│           │ L5: Employee       │                                   │
│           └─────────┬──────────┘                                   │
│                     │                                               │
│                     ▼                                               │
│           ┌────────────────────┐                                   │
│           │ Confidence Engine  │  (From consensus quality)        │
│           │                    │                                   │
│           │ • % live signals   │                                   │
│           │ • Conflict count   │                                   │
│           │ • Freshness avg    │                                   │
│           │ • Source diversity │                                   │
│           └─────────┬──────────┘                                   │
│                     │                                               │
│                     ▼                                               │
│           ┌────────────────────┐                                   │
│           │ UI Transparency    │  (Full provenance)              │
│           │ Layer              │                                 │
│           │ • Data Quality     │  Shows:                         │
│           │   Banner           │   - Freshness (age)             │
│           │ • Conflict Panel   │   - Sources used                │
│           │ • Error bars       │   - Confidence interval         │
│           │ • Explanation text │   - Discrepancy reasons         │
│           └────────────────────┘                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## MIGRATION STRATEGY (Zero Downtime)

**Phase 0 — Feature Flag**

- Wrap new engine in `USE_HYBRID_ENGINE` flag (default false)
- Existing users see old UI; new users (or beta opt-in) see new
- Both engines run in parallel; outputs logged for comparison

**Phase 1 — Signal Ingestion (Weeks 1–2)**

- Deploy `fetch-realtime-signals` function
- Start populating `live_signals_v2` nightly for all 50 DB companies
- No UI change yet; data collection only

**Phase 2 — Consensus Engine (Weeks 3–4)**

- Deploy `signalIntegrityService` as internal module
- Run BOTH old calculator AND new hybrid calculator on every user request
- Log outputs side-by-side; no UI change yet
- A/B test: 5% of traffic sees hybrid results in debug mode

**Phase 3 — Kill-Switch Activation (Weeks 5–6)**

- Enable kill-switch #1 (financial distress) only
- Monitor override rate; tune thresholds
- Enable kill-switch #2 (confirmed layoffs)

**Phase 4 — Swarm Integration (Weeks 7–8)**

- Reduce agent count from 30→12
- Re-route swarm to run AFTER consensus
- Use swarm verdicts to adjust confidence, not score directly

**Phase 5 — UI Transparency (Weeks 9–10)**

- Roll out Data Quality Banner to 100%
- Add conflict disclosure panel
- Replace single score with "62 ± 12" format

**Phase 6 — Deprecate Old Path (Weeks 11–12)**

- Set `USE_HYBRID_ENGINE = true` for all users
- Remove old `layoffScoreEngine.ts` (or keep as fallback)
- Remove deprecated heuristic functions

---

## BACKWARD COMPATIBILITY

- Old API endpoint `/api/calculate-layoff-score` remains, internally calls hybrid
- `shareableScoreCard` still accepts `{score, confidence}` object — just populate new fields
- Existing cached scores invalidated after 24h (force re-calc with fresh signals)

---

**BLUEPRINT COMPLETE** — Ready for implementation (Tasks 3–7).
