// swarmTypes.ts
// Shared TypeScript interfaces for the 30-agent Swarm Intelligence Layer.
// All agents, orchestrator, aggregator, and integration points import from here.

import { CompanyData } from '../../data/companyDatabase';
import { IndustryRisk } from '../../data/industryRiskData';
import { UserFactors } from '../layoffScoreEngine';

// ── Input ────────────────────────────────────────────────────────────────────

export interface SwarmInput {
  companyName:        string;
  industry:           string;
  roleTitle:          string;
  department:         string;
  tenureYears:        number;
  companyData:        CompanyData;
  industryData?:      IndustryRisk;
  userFactors:        UserFactors;
}

// ── Per-Agent Output ─────────────────────────────────────────────────────────

export type AgentCategory = 'market' | 'company' | 'ai' | 'external';
export type SourceType    = 'live-api' | 'heuristic';

export interface AgentSignal {
  agentId:    string;
  category:   AgentCategory;
  signal:     number;       // 0–1 (1 = highest risk)
  confidence: number;       // 0–1
  sourceType: SourceType;
  ageInDays:  number;       // 0 = real-time, higher = older / more stale
  metadata:   Record<string, any>;
}

export interface AgentFn {
  id:  string;
  run: (input: SwarmInput) => Promise<AgentSignal>;
}

// ── Orchestrator Output ──────────────────────────────────────────────────────

export interface SwarmRawResult {
  agentId: string;
  status:  'fulfilled' | 'rejected';
  signal?: AgentSignal;
  error?:  string;
}

// ── Aggregated Report ────────────────────────────────────────────────────────

export interface RiskCluster {
  cluster:        string;
  agents:         string[];
  combinedSignal: number;
}

export interface GraphNode {
  id:       string;
  category: AgentCategory;
  signal:   number;
  weight:   number;
}

export interface GraphEdge {
  from:         string;
  to:           string;
  contribution: number;
}

export interface VisualizationGraph {
  nodes:         GraphNode[];
  riskClusters:  RiskCluster[];
  dominantEdges: GraphEdge[];
}

export interface CategoryBreakdown {
  market:   number;
  company:  number;
  ai:       number;
  external: number;
}

export interface SwarmReport {
  swarmRiskScore:      number;          // 0–100
  swarmConfidence:     number;          // 0–100
  dominantSignals:     AgentSignal[];   // top signals (>0.6)
  weakSignals:         AgentSignal[];   // signals 0.3–0.6
  anomalies:           string[];        // unusual readings
  categoryBreakdown:   CategoryBreakdown;
  visualizationGraph:  VisualizationGraph;
  liveAgentsUsed:      number;          // how many real-API agents ran
  totalAgentsRun:      number;          // how many of 30 resolved
  generatedAt:         string;          // ISO timestamp
}
