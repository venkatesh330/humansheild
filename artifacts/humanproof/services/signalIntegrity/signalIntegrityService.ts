// signalIntegrityService.ts
// Central authority for signal validation, freshness enforcement, and conflict detection.
// Replaces heuristic fallbacks with evidence-based resolution.

import { CompanyData } from "../data/companyDatabase";

export interface ProvenancedSignal {
  value: number; // 0–1 normalized
  source: "db" | "live_api" | "swarm" | "user_input" | "heuristic";
  timestamp: string; // ISO date when signal was generated/observed
  rawValue?: any; // original API response or DB raw field
  confidence: number; // 0–1 source reliability
  decayRate: number; // per day, e.g., 0.05 = 14d half-life
  evidence?: string[]; // URLs, citations, agent reasoning
  agentVerdicts?: SwarmVerdict[]; // swarm challenges if any
}

export interface SwarmVerdict {
  agentId: string;
  category: "validator" | "detective" | "contextualizer";
  verdict: "confirm" | "challenge" | "insufficient_data";
  adjustedValue?: number; // if challenge, proposed correction
  confidence: number;
  reason: string;
  evidence: string[];
}

export interface ResolvedSignal {
  value: number; // consensus value 0–1
  confidence: number; // 0–1 overall confidence
  confidenceInterval: {
    // 95% CI
    low: number;
    high: number;
  };
  sourcesUsed: string[]; // e.g., ['alpha_vantage', 'company_db']
  stalenessDays: number;
  hasConflict: boolean;
  conflicts: SignalConflict[];
  primarySource: "live" | "db" | "hybrid"; // which source dominated
  dominantWeight: number; // weight % of primary source
}

export interface SignalConflict {
  signalType: string;
  descriptions: string[];
  severity: "low" | "medium" | "high" | "critical";
  conflictingSources: Array<{
    source: string;
    value: number;
    timestamp: string;
  }>;
  recommendedResolution?: string;
}

class SignalIntegrityService {
  // ── Configuration per signal type ─────────────────────────────────────
  private readonly SIGNAL_CONFIG: Record<
    string,
    {
      maxAgeDays: number; // after this, signal is too old
      defaultDecayRate: number; // per day
      sourceReliability: Record<string, number>; // baseline confidence per source
      conflictThreshold: number; // stdDev threshold for conflict flag
    }
  > = {
    stock90DayChange: {
      maxAgeDays: 7, // stock becomes stale fast
      defaultDecayRate: 0.1, // half-life ~7d
      sourceReliability: { alpha_vantage: 0.92, db: 0.6, heuristic: 0.3 },
      conflictThreshold: 0.15, // 15% stdDev
    },
    revenueGrowthYoY: {
      maxAgeDays: 90, // quarterly — valid until next earnings
      defaultDecayRate: 0.01, // slow decay
      sourceReliability: { sec_edgar: 0.95, db: 0.65, heuristic: 0.3 },
      conflictThreshold: 0.2, // 20% variation acceptable (estimates vary)
    },
    recentLayoffs: {
      maxAgeDays: 14, // layoff news relevance drops after 2w
      defaultDecayRate: 0.05, // half-life ~14d
      sourceReliability: { newsapi: 0.85, layoffs_fyi: 0.9, db: 0.7 },
      conflictThreshold: 0.25, // news can be ambiguous
    },
    hiringFreeze: {
      maxAgeDays: 30,
      defaultDecayRate: 0.03,
      sourceReliability: { newsapi: 0.75, db: 0.5 },
      conflictThreshold: 0.3,
    },
    employeeCount: {
      maxAgeDays: 365, // employee count changes slowly
      defaultDecayRate: 0.001,
      sourceReliability: { crunchbase: 0.8, db: 0.7 },
      conflictThreshold: 0.15,
    },
  };

  // ── Public API ────────────────────────────────────────────────────────

  /**
   * Resolve a coherent signal value from multiple sources (DB + live + swarm)
   * Applies freshness weighting, conflict detection, and kill-switch overrides
   */
  async resolveSignal(
    signalType: string,
    dbSignal: ProvenancedSignal | null,
    liveSignals: ProvenancedSignal[],
    swarmVerdicts: SwarmVerdict[],
  ): Promise<ResolvedSignal> {
    const config = this.SIGNAL_CONFIG[signalType];
    if (!config) {
      throw new Error(`Unknown signal type: ${signalType}`);
    }

    // 1. FILTER fresh live signals only
    const freshLive = liveSignals.filter(
      (ls) => this.calculateAge(ls.timestamp) <= config.maxAgeDays,
    );

    // 2. COLLECT all observations with weights
    const observations: Array<{
      value: number;
      weight: number;
      source: string;
      timestamp: string;
      age: number;
    }> = [];

    // 2a. Add DB signal (if fresh enough)
    if (
      dbSignal &&
      this.calculateAge(dbSignal.timestamp) <= config.maxAgeDays
    ) {
      const age = this.calculateAge(dbSignal.timestamp);
      const freshnessFactor = Math.exp(-config.defaultDecayRate * age);
      const weight =
        dbSignal.confidence *
        config.sourceReliability[dbSignal.source] *
        freshnessFactor;
      observations.push({
        value: dbSignal.value,
        weight,
        source: dbSignal.source,
        timestamp: dbSignal.timestamp,
        age,
      });
    } else if (dbSignal) {
      // DB too old — count but heavily penalized
      observations.push({
        value: dbSignal.value,
        weight: 0.01, // near-zero influence
        source: `${dbSignal.source}(stale)`,
        timestamp: dbSignal.timestamp,
        age: this.calculateAge(dbSignal.timestamp),
      });
    }

    // 2b. Add fresh live signals
    for (const live of freshLive) {
      const age = this.calculateAge(live.timestamp);
      const freshnessFactor = Math.exp(-config.defaultDecayRate * age);
      const weight =
        live.confidence *
        config.sourceReliability[live.source] *
        freshnessFactor;
      observations.push({
        value: live.value,
        weight,
        source: live.source,
        timestamp: live.timestamp,
        age,
      });
    }

    // 2c. Apply swarm verdict modifications
    for (const verdict of swarmVerdicts) {
      const baseWeight = verdict.confidence * 0.5; // swarm modifies but doesn't dominate
      if (verdict.adjustedValue !== undefined) {
        observations.push({
          value: verdict.adjustedValue,
          weight: baseWeight,
          source: `swarm:${verdict.agentId}`,
          timestamp: new Date().toISOString(),
          age: 0,
        });
      }
      // If verdict is "challenge" without value, that's handled in conflict detection
    }

    // 3. DETECT CONFLICTS before consensus
    const conflicts = this.detectConflicts(
      observations,
      config.conflictThreshold,
    );

    // 4. COMPUTE consensus weighted average
    const totalWeight = observations.reduce((sum, o) => sum + o.weight, 0);
    let consensusValue: number;
    let confidence: number;

    if (totalWeight === 0) {
      // No valid signals — return safe default
      consensusValue = 0.5;
      confidence = 0.2;
    } else {
      consensusValue =
        observations.reduce((sum, o) => sum + o.value * o.weight, 0) /
        totalWeight;
      // Confidence is weight concentration: higher total weight = more confident
      confidence = Math.min(1, totalWeight / 2); // normalized to 0-1
    }

    // 5. KILL-SWITCH overrides
    const overrides = this.checkKillSwitches(
      signalType,
      consensusValue,
      observations,
      conflicts,
    );
    if (overrides.overrideValue !== undefined) {
      consensusValue = overrides.overrideValue;
      conflicts.push(...overrides.newConflicts);
    }

    // 6. CONFIDENCE INTERVAL from weight distribution & conflicts
    const variance =
      observations.reduce(
        (sum, o) => sum + Math.pow(o.value - consensusValue, 2) * o.weight,
        0,
      ) / totalWeight;
    const stdDev = Math.sqrt(variance);
    const conflictPenalty = conflicts.length * 0.1; // -10% per conflict
    confidence = Math.max(0.1, Math.min(0.95, confidence - conflictPenalty));

    // 95% CI = ±1.96σ, but min 0.05 (minimum spread)
    const intervalRadius = Math.max(0.05, 1.96 * stdDev);

    // 7. DETERMINE primary source
    const sortedByWeight = [...observations].sort(
      (a, b) => b.weight - a.weight,
    );
    const dominant = sortedByWeight[0];
    const primarySource = dominant.source.includes("live")
      ? "live"
      : dominant.source.includes("swarm")
        ? "hybrid"
        : "db";
    const dominantWeight = dominant.weight / totalWeight;

    return {
      value: consensusValue,
      confidence,
      confidenceInterval: {
        low: Math.max(0, consensusValue - intervalRadius),
        high: Math.min(1, consensusValue + intervalRadius),
      },
      sourcesUsed: [...new Set(observations.map((o) => o.source))],
      stalenessDays: Math.min(...observations.map((o) => o.age)),
      hasConflict: conflicts.length > 0,
      conflicts,
      primarySource,
      dominantWeight,
    };
  }

  // ── Helper Methods ────────────────────────────────────────────────────

  private calculateAge(timestamp: string): number {
    const ageMs = Date.now() - new Date(timestamp).getTime();
    return Math.floor(ageMs / (1000 * 60 * 60 * 24));
  }

  private detectConflicts(
    observations: Array<{
      value: number;
      weight: number;
      source: string;
      timestamp: string;
      age: number;
    }>,
    threshold: number,
  ): SignalConflict[] {
    if (observations.length < 2) return [];

    const mean =
      observations.reduce((sum, o) => sum + o.value, 0) / observations.length;
    const variance =
      observations.reduce((sum, o) => sum + Math.pow(o.value - mean, 2), 0) /
      observations.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < threshold) return [];

    // Group by source cluster
    const clusters = new Map<string, typeof observations>();
    for (const o of observations) {
      const clusterKey = this.getSourceCluster(o.source);
      if (!clusters.has(clusterKey)) clusters.set(clusterKey, []);
      clusters.get(clusterKey)!.push(o);
    }

    // Find most divergent clusters
    const clusterVals = Array.from(clusters.entries()).map(([key, vals]) => ({
      cluster: key,
      mean: vals.reduce((s, o) => s + o.value, 0) / vals.length,
      sources: vals.map((v) => v.source),
    }));

    const conflicts: SignalConflict[] = [];
    for (let i = 0; i < clusterVals.length; i++) {
      for (let j = i + 1; j < clusterVals.length; j++) {
        const diff = Math.abs(clusterVals[i].mean - clusterVals[j].mean);
        if (diff > threshold) {
          conflicts.push({
            signalType: "", // filled by caller
            descriptions: [
              `Source cluster "${clusterVals[i].cluster}" (${clusterVals[i].mean.toFixed(2)}) disagrees with "${clusterVals[j].cluster}" (${clusterVals[j].mean.toFixed(2)})`,
            ],
            severity: diff > 0.3 ? "high" : "medium",
            conflictingSources: [
              {
                source: clusterVals[i].cluster,
                value: clusterVals[i].mean,
                timestamp: "cluster_avg",
              },
              {
                source: clusterVals[j].cluster,
                value: clusterVals[j].mean,
                timestamp: "cluster_avg",
              },
            ],
          });
        }
      }
    }

    return conflicts;
  }

  private getSourceCluster(source: string): string {
    if (
      source.includes("live") ||
      source.includes("alpha_vantage") ||
      source.includes("newsapi")
    )
      return "live_api";
    if (source.includes("swarm")) return "swarm_validation";
    if (source.includes("db") || source.includes("baseline"))
      return "historical_db";
    return "heuristic";
  }

  private checkKillSwitches(
    signalType: string,
    currentValue: number,
    observations: Array<{ value: number; weight: number; source: string }>,
    conflicts: SignalConflict[],
  ): { overrideValue?: number; newConflicts: SignalConflict[] } {
    const newConflicts: SignalConflict[] = [];

    // Kill-switch 1: Live layoff news overrides DB
    if (signalType === "recentLayoffs") {
      const liveLayoff = observations.find(
        (o) => o.source.includes("newsapi") && o.value > 0.7,
      );
      const dbOld = observations.find(
        (o) => o.source.includes("db") && o.value < 0.3,
      );
      if (liveLayoff && dbOld) {
        // Conflict detected and resolved in favor of live
        newConflicts.push({
          signalType: "recentLayoffs",
          descriptions: [
            "Live layoff news (high confidence) contradicts historical database (no recent events).",
            "Rule: Fresh news supersedes stale record (DB >30d old).",
          ],
          severity: "critical",
          conflictingSources: [
            {
              source: "live_newsapi",
              value: liveLayoff.value,
              timestamp: "now",
            },
            { source: "db", value: dbOld.value, timestamp: "old" },
          ],
          recommendedResolution: "Override DB with live confirmed event",
        });
        return { overrideValue: Math.max(currentValue, 0.85), newConflicts };
      }
    }

    // Kill-switch 2: Stock vs revenue severe divergence
    if (
      signalType === "stock90DayChange" ||
      signalType === "revenueGrowthYoY"
    ) {
      const stockObs = observations.filter(
        (o) => o.source.includes("stock") || o.source.includes("alpha"),
      );
      const revenueObs = observations.filter(
        (o) => o.source.includes("revenue") || o.source.includes("earnings"),
      );
      if (stockObs.length > 0 && revenueObs.length > 0) {
        const stockVal = stockObs[0].value;
        const revenueVal = revenueObs[0].value;
        // Normalize to comparable scales: stock [-1,1] ≈ return, revenue growth also signed %
        if (
          (stockVal > 0.3 && revenueVal < -0.1) ||
          (stockVal < -0.3 && revenueVal > 0.1)
        ) {
          newConflicts.push({
            signalType: "market_disconnect",
            descriptions: [
              `Stock (${(stockVal * 100).toFixed(0)}%) and revenue (${(revenueVal * 100).toFixed(0)}%) move in opposite directions.`,
              "Possible bubble or accounting anomaly. Elevating scrutiny.",
            ],
            severity: "high",
            conflictingSources: [
              { source: "stock", value: stockVal, timestamp: "now" },
              { source: "revenue", value: revenueVal, timestamp: "quarterly" },
            ],
          });
          // Instead of overriding value, we'll reduce confidence later
        }
      }
    }

    return { newConflicts };
  }

  private freshnessFactor(ageDays: number, decayRate: number): number {
    return Math.exp(-decayRate * ageDays);
  }

  private isAcceptablyFresh(
    signal: ProvenancedSignal,
    maxAge?: number,
  ): boolean {
    const age = this.calculateAge(signal.timestamp);
    const limit =
      maxAge ||
      this.SIGNAL_CONFIG[this.guessSignalType(signal)]?.maxAgeDays ||
      30;
    return age <= limit;
  }

  private guessSignalType(signal: ProvenancedSignal): string {
    // Heuristic: infer from source or context (simplified)
    if (signal.source.includes("stock") || signal.source.includes("alpha"))
      return "stock90DayChange";
    if (signal.source.includes("revenue") || signal.source.includes("earnings"))
      return "revenueGrowthYoY";
    if (signal.source.includes("layoff") || signal.source.includes("news"))
      return "recentLayoffs";
    return "default";
  }
}

export const signalIntegrityService = new SignalIntegrityService();
