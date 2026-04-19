// TransparencyTab.tsx
// Data provenance and system transparency — Answers "How was this calculated?"
// Displays: Data quality dashboard, source provenance, methodology explainers.

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Info,
  FileText,
  Database,
  Lock,
  Layers,
  BarChart2,
  AlertTriangle,
  Download,
  Check,
  Filter,
  BarChart,
  Table,
  FileQuestion,
  Shield,
} from "lucide-react";
import { SectionHeader } from "./common/SectionHeader";
import { CollapsibleSection } from "./common/CollapsibleSection";
import { useAdaptiveSystem } from "@/hooks/useAdaptiveSystem";
import type { TabProps } from "./common/types";
import type { SignalQuality, ConsensusSnapshot } from "../../types/hybridResult";

// ---------------------------------------------------------------------------
// DataQualityDashboard - Visualization of data quality metrics
// ---------------------------------------------------------------------------

interface DataSourceMetrics {
  name: string;
  type: "primary" | "secondary" | "derived";
  freshness: number; // age in days
  coverage: number; // percentage 0-100
  quality: number; // percentage 0-100
}

const DataQualityDashboard: React.FC<{
  dataFreshness: TabProps["result"]["dataFreshness"];
  signalQuality: TabProps["result"]["signalQuality"];
}> = ({ dataFreshness, signalQuality }) => {
  const avgFreshness = dataFreshness.ageInDays;
  const liveSignalPercent = Math.round((signalQuality.liveSignals / 17) * 100);

  return (
    <div className="data-quality-dashboard grid grid-cols-1 md:grid-cols-3 gap-[var(--space-6)] mb-[var(--space-8)]">
      <div className="glass-panel-heavy p-[var(--space-6)] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Database className="w-12 h-12" />
        </div>
        <div className="label-xs text-muted-foreground uppercase tracking-widest mb-[var(--space-2)]">Temporal Integrity</div>
        <div className="text-3xl font-black tracking-tighter mb-1">{avgFreshness}d</div>
        <div className="text-[10px] text-muted-foreground font-mono uppercase mb-[var(--space-4)]">Signal Latency Baseline</div>
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${avgFreshness <= 7 ? "bg-[var(--emerald)]" : "bg-[var(--amber)]"}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(10, 100 - (avgFreshness / 30) * 100)}%` }}
            style={{ boxShadow: `0 0 10px ${avgFreshness <= 7 ? "var(--emerald)" : "var(--amber)"}44` }}
          />
        </div>
      </div>

      <div className="glass-panel-heavy p-[var(--space-6)] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BarChart2 className="w-12 h-12" />
        </div>
        <div className="label-xs text-muted-foreground uppercase tracking-widest mb-[var(--space-2)]">Signal Fidelity</div>
        <div className="text-3xl font-black tracking-tighter mb-1">{liveSignalPercent}%</div>
        <div className="text-[10px] text-muted-foreground font-mono uppercase mb-[var(--space-4)]">{signalQuality.liveSignals}/17 Active Streams</div>
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[var(--cyan)]"
            initial={{ width: 0 }}
            animate={{ width: `${liveSignalPercent}%` }}
            style={{ boxShadow: '0 0 10px var(--cyan)44' }}
          />
        </div>
      </div>

      <div className="glass-panel-heavy p-[var(--space-6)] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <div className="label-xs text-muted-foreground uppercase tracking-widest mb-[var(--space-2)]">Entropy Detection</div>
        <div className="text-3xl font-black tracking-tighter mb-1">{signalQuality.conflictingSignals.length}</div>
        <div className="text-[10px] text-muted-foreground font-mono uppercase mb-[var(--space-4)]">Signals Resolved</div>
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[var(--red)]"
            initial={{ width: 0 }}
            animate={{ width: `${(signalQuality.conflictingSignals.length / 5) * 100}%` }}
            style={{ boxShadow: '0 0 10px var(--red)44' }}
          />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// ConflictResolutionLog - Display how signal conflicts were resolved
// ---------------------------------------------------------------------------

interface ConflictResolutionLogProps {
  signalQuality: SignalQuality;
  consensusSnapshot?: ConsensusSnapshot;
}

const ConflictResolutionLog: React.FC<ConflictResolutionLogProps> = ({
  signalQuality,
  consensusSnapshot,
}) => {
  const conflicts = signalQuality.conflictingSignals || [];
  const overridesApplied = consensusSnapshot?.overridesApplied || [];

  if (conflicts.length === 0 && overridesApplied.length === 0) {
    return (
      <div className="glass-panel p-6 text-center">
        <div className="flex justify-center mb-3">
          <Check className="w-8 h-8 text-emerald-500 opacity-50" />
        </div>
        <h4 className="text-sm font-bold uppercase tracking-widest mb-1">Signal Coherence Optimal</h4>
        <p className="text-xs text-muted-foreground">No conflicting data points detected across the ingestion matrix.</p>
      </div>
    );
  }

  return (
    <div className="conflict-resolution-log space-y-4">
      {conflicts.map((conflict, index) => (
        <div key={index} className="glass-panel border-l-2 border-l-[var(--amber)] overflow-hidden">
          <div className="p-[var(--space-4)]">
            <div className="flex justify-between items-start mb-[var(--space-2)]">
              <div className="flex items-center gap-[var(--space-2)]">
                <AlertTriangle className="w-4 h-4 text-[var(--amber)]" />
                <span className="text-sm font-bold tracking-tight">{conflict.signalType} Signal Conflict</span>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${getSeverityColorClass(conflict.severity)}`}>
                {conflict.severity}
              </span>
            </div>
            
            <div className="space-y-2 mt-3">
              {conflict.descriptions.map((desc, didx) => (
                <p key={didx} className="text-xs text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              ))}
            </div>

            {conflict.conflictingSources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="label-xs text-muted-foreground mb-2">Divergent Vectors</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {conflict.conflictingSources.map((src, sidx) => (
                    <div key={sidx} className="bg-white/5 p-2 rounded flex justify-between items-center">
                      <span className="text-[10px] font-medium opacity-60 italic">{src.source}</span>
                      <span className="text-[10px] font-mono font-bold tracking-tighter">{src.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {conflict.recommendedResolution && (
              <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded flex items-start gap-2">
                <Check className="w-3 h-3 text-emerald-500 mt-0.5" />
                <div className="text-[10px] text-emerald-500/80 leading-tight">
                  <span className="font-bold uppercase mr-1">Resolution:</span>
                  {conflict.recommendedResolution}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {overridesApplied.length > 0 && (
        <div className="glass-panel-heavy p-4 border-l-2 border-l-rose-500">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-bold">Manual Safety Overrides Applied</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {overridesApplied.map((override, idx) => (
              <span key={idx} className="text-[10px] font-mono bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded border border-rose-500/20">
                {override}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// AuditTrail - Chronological record of assessment operations
// ---------------------------------------------------------------------------

interface AuditEvent {
  timestamp: string;
  operation: string;
  status: "success" | "warning" | "error";
  details: string;
}

const AuditTrail: React.FC<{ events: AuditEvent[] }> = ({ events }) => {
  return (
    <div className="audit-trail glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="text-left py-3 px-4 label-xs text-muted-foreground uppercase opacity-50">Event Marker</th>
              <th className="text-left py-3 px-4 label-xs text-muted-foreground uppercase opacity-50">Operation</th>
              <th className="text-left py-3 px-4 label-xs text-muted-foreground uppercase opacity-50">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {events.map((event, index) => (
              <tr key={index} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 font-mono text-[10px] opacity-60">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td className="py-3 px-4">
                  <div className="text-xs font-bold">{event.operation}</div>
                  <div className="text-[10px] text-muted-foreground opacity-60 mt-0.5">{event.details}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(event.status)}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      event.status === 'success' ? 'text-emerald-500' : 
                      event.status === 'warning' ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const getQualityColorClass = (score: number) => {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 70) return "bg-cyan-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-rose-500";
};

const getSeverityColorClass = (severity: string) => {
  switch (severity) {
    case "critical": return "bg-rose-500/20 text-rose-500 border border-rose-500/30";
    case "high": return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
    case "medium": return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    default: return "bg-white/10 text-muted-foreground border border-white/10";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success": return <Check className="w-3 h-3 text-emerald-500" />;
    case "warning": return <AlertTriangle className="w-3 h-3 text-amber-500" />;
    case "error": return <Lock className="w-3 h-3 text-rose-500" />;
    default: return <Info className="w-3 h-3 text-muted-foreground" />;
  }
};


// ---------------------------------------------------------------------------
// SourceProvenanceTable - Data lineage information
// ---------------------------------------------------------------------------

interface DataSource {
  name: string;
  type: string;
  domain: string;
  lastUpdated: string;
  description: string;
}

const SourceProvenanceTable: React.FC<{
  sources: DataSource[];
}> = ({ sources }) => {
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredSources =
    selectedType === "all"
      ? sources
      : sources.filter((source) => source.type === selectedType);

  const typeOptions = ["all", ...Array.from(new Set(sources.map((s) => s.type)))];

  return (
    <div className="source-provenance glass-panel p-[var(--space-6)] shadow-inner">
      <div className="flex justify-between items-center mb-[var(--space-6)]">
        <h4 className="text-lg font-bold tracking-tight">System Grounding Proofs</h4>
        <div className="flex items-center gap-[var(--space-3)]">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[var(--cyan)]/50 outline-none"
          >
            {typeOptions.map((type) => (
              <option key={type} value={type} className="bg-black text-white">
                {type === "all" ? "Agnostic Source Type" : `${type} Verification`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 label-xs text-muted-foreground uppercase opacity-50">Origin Entity</th>
              <th className="text-left py-3 px-4 label-xs text-muted-foreground uppercase opacity-50">Vector Class</th>
              <th className="text-left py-3 px-4 label-xs text-muted-foreground uppercase opacity-50">Domain Auth</th>
              <th className="text-left py-3 px-4 label-xs text-muted-foreground uppercase opacity-50">Last Sync</th>
            </tr>
          </thead>
          <tbody>
            {filteredSources.map((source, index) => (
              <tr key={index} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                <td className="py-4 px-4">
                  <div className="font-bold text-sm tracking-tight">{source.name}</div>
                  <div className="text-[10px] text-muted-foreground line-clamp-1 opacity-60 mt-0.5">{source.description}</div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan/10 text-cyan font-black border border-cyan/20">
                    {source.type.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-4 font-mono text-[10px] opacity-70">{source.domain}</td>
                <td className="py-4 px-4 text-[10px] font-mono opacity-50">{source.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};



// ---------------------------------------------------------------------------
// MethodologyExplainer - Details on how the risk score is calculated
// ---------------------------------------------------------------------------

interface MethodologySection {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const MethodologyExplainer: React.FC = () => {
  const sections: MethodologySection[] = [
    {
      title: "Multi-Layered Risk Assessment",
      description:
        "Your risk score is calculated across 5 dimensions: Financial Vulnerability, Layoff History, Industry Risk, Role Displacement, and Regional Factors. Each dimension contributes a weighted portion to your final score.",
      icon: <Layers className="w-6 h-6 text-blue-400" />,
    },
    {
      title: "AI Signal Processing",
      description:
        "Multiple AI models independently analyze raw career, market, and company data. Their outputs are synthesized through a weighted ensemble with built-in consistency checks and bias correction.",
      icon: <BarChart className="w-6 h-6 text-violet-400" />,
    },
    {
      title: "Real-Time Data Integration",
      description:
        "Live data from over 15 sources is continuously processed, including company financials, industry trends, regional economic indicators, and role-specific automation rates.",
      icon: <Database className="w-6 h-6 text-cyan-400" />,
    },
    {
      title: "Confidence Calibration",
      description:
        "Uncertainty in predictions is explicitly modeled using Bayesian confidence intervals. Lower quality or conflicting data results in wider intervals, transparent about prediction limitations.",
      icon: <BarChart2 className="w-6 h-6 text-amber-400" />,
    },
    {
      title: "Human Oversight",
      description:
        "All algorithmic systems are regularly audited by human experts. Unusual patterns or edge cases trigger manual review, ensuring transparent and accountable predictions.",
      icon: <Shield className="w-6 h-6 text-green-400" />,
    },
  ];

  return (
    <div className="methodology-explainer space-y-[var(--space-4)]">
      {sections.map((section, index) => (
        <div key={index} className="bg-white/5 border border-white/5 rounded-lg p-[var(--space-4)] hover:bg-white/10 transition-colors">
          <div className="flex gap-[var(--space-3)]">
            <div className="flex-shrink-0 mt-1">{section.icon}</div>
            <div>
              <h4 className="label-xs font-black uppercase tracking-wider mb-[var(--space-2)]">{section.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.description}
              </p>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-20 rounded-lg p-4 mt-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-sm font-medium text-blue-400 mb-1">
              System Transparency
            </h4>
            <p className="text-xs text-muted-foreground">
              This system adheres to IEEE P2843 explainability standards and EU
              AI Act transparency requirements. All decisions are traceable to
              explicit data sources and algorithmic reasoning chains.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Json Download Button - Raw data export
// ---------------------------------------------------------------------------

const JsonDownloadButton: React.FC<{
  data: any;
  filename?: string;
}> = ({ data, filename = "risk-assessment-data.json" }) => {
  const downloadJson = () => {
    // Create a Blob with the JSON data
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a link element to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    // Append the link to the body, click it, and clean up
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={downloadJson}
      className="inline-flex items-center gap-2 text-xs bg-muted hover:bg-muted-2 text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors"
    >
      <Download className="w-4 h-4" />
      Download Raw JSON
    </button>
  );
};



// ---------------------------------------------------------------------------
// TransparencyTab main component
// ---------------------------------------------------------------------------

export const TransparencyTab: React.FC<TabProps> = ({
  result,
  companyData,
  onDownload,
  onRecalculate,
}) => {
  // Sample data for source provenance
  const dataSources: DataSource[] = [
    {
      name: "Company Financials API",
      type: "Financial",
      domain: "company.api.com",
      lastUpdated: "2026-04-10",
      description:
        "Real-time financial data including revenue, growth, and market metrics.",
    },
    {
      name: "Layoff Tracker DB",
      type: "Workforce",
      domain: "layoffs.track.org",
      lastUpdated: "2026-04-12",
      description:
        "Comprehensive database of verified company layoff events and details.",
    },
    {
      name: "Industry Risk Index",
      type: "Industry",
      domain: "industry.metrics.io",
      lastUpdated: "2026-04-05",
      description: "Sector-specific risk factors and comparative benchmarks.",
    },
    {
      name: "AI Displacement Model",
      type: "AI",
      domain: "internal.model",
      lastUpdated: "2026-04-01",
      description:
        "Proprietary model for role-specific AI automation risk assessment.",
    },
    {
      name: "Regional Labor Data",
      type: "Geographic",
      domain: "labor.stats.gov",
      lastUpdated: "2026-03-28",
      description: "Regional employment and wage data from government sources.",
    },
    {
      name: "Skills Valuation Matrix",
      type: "Skills",
      domain: "skills.value.ai",
      lastUpdated: "2026-04-08",
      description:
        "AI-powered assessment of skill market value and automation risk.",
    },
  ];

  // Sample audit trail events
  const auditEvents: AuditEvent[] = [
    {
      timestamp: "2026-04-15T14:32:05Z",
      operation: "Risk Assessment Initialization",
      status: "success",
      details: "Assessment process started for user with valid inputs.",
    },
    {
      timestamp: "2026-04-15T14:32:07Z",
      operation: "Company Data Retrieval",
      status: "success",
      details: "Retrieved financial and workforce data for specified company.",
    },
    {
      timestamp: "2026-04-15T14:32:09Z",
      operation: "Industry Baseline Calculation",
      status: "success",
      details: "Calculated industry baseline metrics for risk comparison.",
    },
    {
      timestamp: "2026-04-15T14:32:12Z",
      operation: "Signal Conflict Detection",
      status: "warning",
      details:
        "Detected conflicting signals in financial stability indicators.",
    },
    {
      timestamp: "2026-04-15T14:32:15Z",
      operation: "Consensus Resolution",
      status: "success",
      details:
        "Applied weighted consensus algorithm to resolve signal conflicts.",
    },
    {
      timestamp: "2026-04-15T14:32:18Z",
      operation: "Final Score Calculation",
      status: "success",
      details: "Calculated final risk score with confidence intervals.",
    },
  ];

  return (
    <section aria-labelledby="transparency-heading" className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <SectionHeader
            title="Data Quality Dashboard"
            description="Overview of the quality, freshness, and completeness of data used in your risk assessment."
          />

          {/* Phase 5 Fix: Transparent Agent / API Failure Box */}
          {((result as any)._engineResult?.agentStatus?.failedCount > 0) && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-400">Ensemble Degradation Warning</h4>
                  <p className="text-sm opacity-80 mt-1">
                    {(result as any)._engineResult.agentStatus.warningMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Phase 5 Fix: Explicit Staleness Warning */}
          {(result.dataFreshness.accuracyImpact === 'Critical') && (
            <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200">
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-400">Critical Data Staleness</h4>
                  <p className="text-sm opacity-80 mt-1">
                    {result.dataFreshness.stalenessWarning || `Data is ${result.dataFreshness.ageInDays} days old. Confidence rating has been aggressively capped.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DataQualityDashboard
            dataFreshness={result.dataFreshness}
            signalQuality={result.signalQuality}
          />
        </div>

        <div className="mb-6">
          <SectionHeader
            title="Source Provenance"
            description="Detailed information about the data sources used in your risk assessment."
          />

          <SourceProvenanceTable sources={dataSources} />
        </div>

        <div className="mb-6">
          <SectionHeader
            title="Conflict Resolution Log"
            description="Record of any conflicting signals detected and how they were resolved."
          />

          <ConflictResolutionLog
            signalQuality={result.signalQuality}
            consensusSnapshot={result.consensusSnapshot}
          />
        </div>

        <CollapsibleSection title="Assessment Methodology">
          <div className="mb-6">
            <MethodologyExplainer />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="System Audit Trail">
          <div className="mb-4">
            <AuditTrail events={auditEvents} />
          </div>

          <div className="flex justify-end">
            <JsonDownloadButton
              data={result}
              filename={`risk-assessment-${result.companyName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.json`}
            />
          </div>
        </CollapsibleSection>
      </motion.div>
    </section>
  );
};

export default TransparencyTab;
