// swarmOrchestrator.ts
// Master parallel runner for all 30 swarm agents.
// Uses Promise.allSettled — no single agent failure breaks execution.
// Returns SwarmReport (aggregated) and caches it for 24h.

import { SwarmInput, SwarmReport } from './swarmTypes';
import { getSwarmCache, setSwarmCache } from './swarmCache';
import { aggregateSwarmResults } from './swarmAggregator';
import { savePrediction, recordAgentSignal, getAgentWeightMultiplier } from './swarmLearningStore';

// ── Market Signal Agents ──────────────────────────────────────────────────────
import { stockVolatilityAgent }   from './agents/marketSignals/stockVolatilityAgent';
import { revenueGrowthAgent }     from './agents/marketSignals/revenueGrowthAgent';
import { marketCapDropAgent }     from './agents/marketSignals/marketCapDropAgent';
import { piprAgent }              from './agents/marketSignals/piprAgent';
import { layoffVelocityAgent }    from './agents/marketSignals/layoffVelocityAgent';
import { fundingDryupAgent }      from './agents/marketSignals/fundingDryupAgent';
import { overstaffingRatioAgent } from './agents/marketSignals/overstaffingRatioAgent';
import { debtToEquityAgent }      from './agents/marketSignals/debtToEquityAgent';

// ── Company Signal Agents ─────────────────────────────────────────────────────
import { recentLayoffAgent }     from './agents/companySignals/recentLayoffAgent';
import { costCuttingAgent }      from './agents/companySignals/costCuttingAgent';
import { departmentRiskAgent }   from './agents/companySignals/departmentRiskAgent';
import { leadershipChurnAgent }  from './agents/companySignals/leadershipChurnAgent';
import { offshoreRiskAgent }     from './agents/companySignals/offshoreRiskAgent';
import { tenureRiskAgent }       from './agents/companySignals/tenureRiskAgent';
import { performanceAgent }      from './agents/companySignals/performanceAgent';
import { proRelationshipAgent }  from './agents/companySignals/proRelationshipAgent';

// ── AI Signal Agents ──────────────────────────────────────────────────────────
import { automationPotentialAgent }      from './agents/aiSignals/automationPotentialAgent';
import { aiToolMaturityAgent }           from './agents/aiSignals/aiToolMaturityAgent';
import { displacementTimelineAgent }     from './agents/aiSignals/displacementTimelineAgent';
import { augmentationOpportunityAgent }  from './agents/aiSignals/augmentationOpportunityAgent';
import { industryAiAdoptionAgent }       from './agents/aiSignals/industryAiAdoptionAgent';
import { roleObsolescenceAgent }         from './agents/aiSignals/roleObsolescenceAgent';
import { skillDecayAgent }               from './agents/aiSignals/skillDecayAgent';
import { aiReplacementPatternAgent }     from './agents/aiSignals/aiReplacementPatternAgent';

// ── External Signal Agents ────────────────────────────────────────────────────
import { macroRecessionAgent }    from './agents/externalSignals/macroRecessionAgent';
import { laborMarketTightAgent }  from './agents/externalSignals/laborMarketTightAgent';
import { sectorContagionAgent }   from './agents/externalSignals/sectorContagionAgent';
import { geoPoliticalRiskAgent }  from './agents/externalSignals/geoPoliticalRiskAgent';
import { regulatoryRiskAgent }    from './agents/externalSignals/regulatoryRiskAgent';
import { peerCompanyAgent }       from './agents/externalSignals/peerCompanyAgent';

// ── Agent Registry ────────────────────────────────────────────────────────────
const AGENT_REGISTRY = [
  // Market Signals
  stockVolatilityAgent, revenueGrowthAgent, marketCapDropAgent, piprAgent,
  layoffVelocityAgent, fundingDryupAgent, overstaffingRatioAgent, debtToEquityAgent,
  // Company Signals
  recentLayoffAgent, costCuttingAgent, departmentRiskAgent, leadershipChurnAgent,
  offshoreRiskAgent, tenureRiskAgent, performanceAgent, proRelationshipAgent,
  // AI Signals
  automationPotentialAgent, aiToolMaturityAgent, displacementTimelineAgent,
  augmentationOpportunityAgent, industryAiAdoptionAgent, roleObsolescenceAgent,
  skillDecayAgent, aiReplacementPatternAgent,
  // External Signals
  macroRecessionAgent, laborMarketTightAgent, sectorContagionAgent,
  geoPoliticalRiskAgent, regulatoryRiskAgent, peerCompanyAgent,
] as const;

// ── Master Runner ─────────────────────────────────────────────────────────────

export const runSwarmLayer = async (
  input: SwarmInput,
  forceRefresh = false
): Promise<SwarmReport> => {
  const { companyName, roleTitle, department } = input;

  // ── Cache check ──────────────────────────────────────────────────────────
  if (!forceRefresh) {
    const cached = getSwarmCache(companyName, roleTitle, department);
    if (cached) {
      console.log('[Swarm] Cache HIT — skipping 30 agents');
      return cached;
    }
  }

  console.log(`[Swarm] Firing ${AGENT_REGISTRY.length} agents in parallel...`);
  const startTime = Date.now();

  // ── Fire all 30 agents — no single failure blocks ────────────────────────
  const settled = await Promise.allSettled(
    AGENT_REGISTRY.map(agent => agent.run(input))
  );

  const elapsed    = Date.now() - startTime;
  const fulfilled  = settled.filter(r => r.status === 'fulfilled').length;
  const rejected   = settled.filter(r => r.status === 'rejected').length;
  console.log(`[Swarm] ${fulfilled}/${AGENT_REGISTRY.length} agents resolved (${rejected} failed) in ${elapsed}ms`);

  // ── Extract successful signals ───────────────────────────────────────────
  const rawSignals = settled
    .map((r) => r.status === 'fulfilled' ? r.value : null)
    .filter(Boolean) as NonNullable<typeof settled[0] extends PromiseFulfilledResult<infer T> ? T : never>[];

  // ── BUG-07 FIX: apply learned weight multipliers before aggregation ────────
  // Agents that predicted accurately get boosted weight; poor performers get shrunk toward neutral
  const signals = rawSignals.map((s: any) => {
    const m = getAgentWeightMultiplier(s.agentId);
    const adjusted = m < 1.0
      ? s.signal * m + 0.5 * (1 - m)  // penalised agents shrink toward neutral 0.5
      : Math.min(0.99, s.signal * m);  // rewarded agents get a modest boost
    return { ...s, signal: adjusted };
  }) as any;

  // ── Aggregate into SwarmReport ───────────────────────────────────────────
  const report = aggregateSwarmResults(
    signals as any,
    fulfilled,
    AGENT_REGISTRY.length
  );

  // ── Cache and save to learning store ────────────────────────────────────
  setSwarmCache(companyName, roleTitle, department, report);
  savePrediction(companyName, roleTitle, report.swarmRiskScore, 0);
  // Persist each agent's signal so outcome-based weight updates work correctly
  signals.forEach((s: any) => recordAgentSignal(s, report.swarmRiskScore));

  return report;
};
