// CompanyProfileTab.tsx
// Company health and market position data — Answers "How is my company doing?"
// Displays: Financial health, layoff history, industry benchmarks, news feed.

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BarChart4,
  Calendar,
  Building2,
  Activity,
  Rss,
} from "lucide-react";
import { SectionHeader } from "./common/SectionHeader";
import { CollapsibleSection } from "./common/CollapsibleSection";
import { useAdaptiveSystem } from "@/hooks/useAdaptiveSystem";
import type { TabProps } from "./common/types";

// ---------------------------------------------------------------------------
// Financial Health Card
// ---------------------------------------------------------------------------

interface FinancialMetric {
  label: string;
  value: string | number;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
  description?: string;
}const FinancialHealthCard: React.FC<{
  companyName: string;
  metrics: FinancialMetric[];
}> = ({ companyName, metrics }) => {
  return (
    <div
      className="financial-health-card glass-panel-heavy p-[var(--space-6)] shadow-xl"
      aria-label={`Financial health metrics for ${companyName}`}
    >
      <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-6)]">
        <div className="p-2 rounded-lg bg-[var(--cyan)]/10 text-[var(--cyan)]">
          <BarChart4 className="w-5 h-5" />
        </div>
        <h4 className="text-lg font-bold tracking-tight">Financial Health Dossier</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-4)]">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="group flex items-start gap-[var(--space-4)] p-[var(--space-4)] bg-white/5 rounded-xl border border-white/5 transition-all hover:bg-white/10"
          >
            <div className="flex-shrink-0 p-2.5 rounded-lg bg-black/20 group-hover:scale-110 transition-transform">
              {metric.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="label-xs text-muted-foreground mb-1">
                {metric.label}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight">{metric.value}</span>
                {metric.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : metric.trend === "down" ? (
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                ) : null}
              </div>
              {metric.description && (
                <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1 opacity-60">
                  {metric.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
;

// ---------------------------------------------------------------------------
// Layoff Timeline
// ---------------------------------------------------------------------------

interface LayoffEvent {
  date: string; // ISO string
  count: number;
  percentage: number;
  department?: string;
  severity: "minor" | "moderate" | "major";
}

const LayoffTimeline: React.FC<{
  events: LayoffEvent[];
  companyName: string;
}> = ({ events, companyName }) => {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const getSeverityColor = (severity: LayoffEvent["severity"]) => {
    switch (severity) {
      case "minor": return "var(--amber)";
      case "moderate": return "var(--orange)";
      case "major": return "var(--red)";
      default: return "var(--cyan)";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };

  return (
    <div className="glass-panel p-[var(--space-6)]" aria-label={`Layoff history timeline for ${companyName}`}>
      <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-6)]">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Layoff History</h4>
      </div>

      {events.length === 0 ? (
        <div className="p-[var(--space-4)] bg-[var(--emerald)]/5 border border-[var(--emerald)]/20 rounded-xl text-xs text-[var(--emerald)]/60 leading-relaxed">
          Stability Index: High. No documented workforce reductions detected in the primary tracking window (24 months).
        </div>
      ) : (
        <div className="space-y-[var(--space-4)] relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
          {sortedEvents.map((event, index) => (
            <div key={index} className="flex gap-[var(--space-4)] relative">
              <div 
                className="w-[23px] h-[23px] rounded-full border-2 border-[var(--bg)] z-10 flex items-center justify-center shrink-0"
                style={{ backgroundColor: getSeverityColor(event.severity) }}
              >
                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
              </div>

              <div className="flex-1 bg-white/5 p-[var(--space-4)] rounded-xl border border-white/5">
                <div className="flex flex-wrap justify-between items-center mb-1 gap-[var(--space-2)]">
                  <span className="font-mono text-xs font-bold">{formatDate(event.date)}</span>
                  <span 
                    className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter"
                    style={{ backgroundColor: `${getSeverityColor(event.severity)}22`, color: getSeverityColor(event.severity) }}
                  >
                    {event.severity} Impact
                  </span>
                </div>
                <div className="text-sm font-black tracking-tight mb-1">
                  {event.count.toLocaleString()} Workforce Reductions ({event.percentage}%)
                </div>
                {event.department && (
                  <div className="text-[10px] text-muted-foreground">
                    Targeted Divisions: {event.department}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Industry Benchmark Card
// ---------------------------------------------------------------------------

interface BenchmarkData {
  metric: string;
  company: number; // Company value
  industry: number; // Industry average
  percentile?: number; // Optional: company's percentile in industry
}

const IndustryBenchmarkCard: React.FC<{
  industryName: string;
  benchmarks: BenchmarkData[];
}> = ({ industryName, benchmarks }) => {
  return (
    <div
      className="industry-benchmark-card bg-muted border rounded-lg p-5"
      aria-label={`Industry benchmark comparison with ${industryName}`}
    >
      <h4 className="text-base font-semibold mb-4 flex items-center">
        <Building2 className="mr-2 w-4 h-4" />
        Industry Benchmarks · {industryName}
      </h4>

      <div className="space-y-4">
        {benchmarks.map((benchmark, index) => {
          const delta = benchmark.company - benchmark.industry;
          const normalizedDelta = delta / benchmark.industry; // Relative difference
          const isPositive = delta >= 0;
          const isSignificant = Math.abs(normalizedDelta) > 0.1; // >10% difference

          return (
            <div key={index} className="bg-muted-2 rounded-md p-3 border">
              <div className="text-xs text-muted-foreground mb-1">
                {benchmark.metric}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold">
                    {benchmark.company.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs. industry {benchmark.industry.toFixed(1)}
                  </span>
                </div>

                {benchmark.percentile !== undefined && (
                  <div className="text-xs flex items-center">
                    <span
                      className="px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor:
                          benchmark.percentile > 50
                            ? "rgba(16,185,129,0.1)"
                            : "rgba(239,68,68,0.1)",
                        color:
                          benchmark.percentile > 50
                            ? "var(--green)"
                            : "var(--red)",
                      }}
                    >
                      {benchmark.percentile}th percentile
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2 w-full bg-muted h-1.5 rounded-full">
                <div className="relative h-full w-full">
                  {/* Industry marker (center line) */}
                  <div
                    className="absolute h-full w-0.5 bg-muted-foreground"
                    style={{ left: "50%" }}
                  ></div>

                  {/* Company position */}
                  <div
                    className="absolute h-3 w-3 rounded-full border-2 border-background transition-all"
                    style={{
                      backgroundColor: isSignificant
                        ? isPositive
                          ? "var(--green)"
                          : "var(--red)"
                        : "var(--muted-foreground)",
                      left: `${Math.max(0, Math.min(100, 50 + normalizedDelta * 150))}%`,
                      top: "-2px",
                      transform: "translateX(-50%)",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Department News Panel (placeholder)
// ---------------------------------------------------------------------------

interface NewsItem {
  title: string;
  date: string; // ISO string
  source: string;
  sentiment: "positive" | "negative" | "neutral";
  highlights: string[];
}

const DepartmentNewsPanel: React.FC<{
  news: NewsItem[];
  department: string;
}> = ({ news, department }) => {
  if (!news || news.length === 0) {
    return (
      <div className="bg-muted border rounded-lg p-5">
        <h4 className="text-base font-semibold mb-2 flex items-center">
          <Rss className="mr-2 w-4 h-4" />
          Department News · {department}
        </h4>
        <p className="text-sm text-muted-foreground">
          No recent news items found for this department.
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSentimentColor = (sentiment: NewsItem["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return "var(--green)";
      case "negative":
        return "var(--red)";
      case "neutral":
      default:
        return "var(--muted-foreground)";
    }
  };

  return (
    <div className="department-news bg-muted border rounded-lg p-5">
      <h4 className="text-base font-semibold mb-4 flex items-center">
        <Rss className="mr-2 w-4 h-4" />
        Department News · {department}
      </h4>

      <div className="space-y-3">
        {news.map((item, index) => (
          <div
            key={index}
            className="p-3 bg-muted-2 rounded-md border border-muted"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm font-medium">{item.title}</div>
              <div
                className="text-xs px-1.5 py-0.5 rounded whitespace-nowrap ml-2"
                style={{
                  backgroundColor: `${getSentimentColor(item.sentiment)}20`,
                  color: getSentimentColor(item.sentiment),
                }}
              >
                {item.sentiment}
              </div>
            </div>

            <div className="text-xs space-y-1 mb-2">
              {item.highlights.map((highlight, i) => (
                <p key={i} className="text-muted-foreground">
                  • {highlight}
                </p>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
              <span>{item.source}</span>
              <span>{formatDate(item.date)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Live Signal Feed (placeholder)
// ---------------------------------------------------------------------------

interface SignalEvent {
  timestamp: string; // ISO string
  source: string;
  type: "financial" | "news" | "social" | "job-market";
  content: string;
  impact: "high" | "medium" | "low";
}

const LiveSignalFeed: React.FC<{
  signals: SignalEvent[];
}> = ({ signals }) => {
  if (!signals || signals.length === 0) {
    return (
      <div className="bg-muted border rounded-lg p-5">
        <h4 className="text-base font-semibold mb-2 flex items-center">
          <Activity className="mr-2 w-4 h-4" />
          Live Signal Feed
        </h4>
        <p className="text-sm text-muted-foreground">
          No recent signals detected. This feed updates as new company data
          becomes available.
        </p>
      </div>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getImpactColor = (impact: SignalEvent["impact"]) => {
    switch (impact) {
      case "high":
        return "var(--red)";
      case "medium":
        return "var(--amber)";
      case "low":
      default:
        return "var(--green)";
    }
  };

  const getTypeIcon = (type: SignalEvent["type"]) => {
    switch (type) {
      case "financial":
        return <BarChart4 className="w-3 h-3" />;
      case "news":
        return <Rss className="w-3 h-3" />;
      case "social":
        return <AlertCircle className="w-3 h-3" />;
      case "job-market":
        return <Building2 className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  return (
    <div className="live-signal-feed bg-muted border rounded-lg p-5">
      <h4 className="text-base font-semibold mb-4 flex items-center">
        <Activity className="mr-2 w-4 h-4" />
        Live Signal Feed
      </h4>

      <div className="space-y-1">
        {signals.map((signal, index) => (
          <div
            key={index}
            className="p-2 bg-muted-2 rounded-md text-xs flex items-start gap-2"
          >
            <div
              className="p-1 rounded-full mt-0.5"
              style={{
                backgroundColor: `${getImpactColor(signal.impact)}20`,
              }}
            >
              {getTypeIcon(signal.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium">{signal.content}</div>
              <div className="flex justify-between items-center mt-1 text-muted-foreground text-xs">
                <span>{signal.source}</span>
                <span>{formatTimestamp(signal.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// CompanyProfileTab main component
// ---------------------------------------------------------------------------

export const CompanyProfileTab: React.FC<TabProps> = ({
  result,
  companyData,
  onDownload,
  onRecalculate,
}) => {
  const { width } = useAdaptiveSystem();
  const isMobile = width < 768;

  // Financial metrics for display
  const financialMetrics: FinancialMetric[] = useMemo(() => {
    const metrics: FinancialMetric[] = [];

    // Revenue Growth YoY
    if (companyData.revenueGrowthYoY != null) {
      const value = `${companyData.revenueGrowthYoY > 0 ? "+" : ""}${companyData.revenueGrowthYoY}%`;
      metrics.push({
        label: "Revenue Growth (YoY)",
        value,
        trend:
          companyData.revenueGrowthYoY > 0
            ? "up"
            : companyData.revenueGrowthYoY < 0
              ? "down"
              : "neutral",
        icon: <BarChart4 className="w-4 h-4 text-blue-500" />,
        description: "Year-over-year revenue growth",
      });
    }

    // Revenue Per Employee
    if (companyData.revenuePerEmployee != null) {
      metrics.push({
        label: "Revenue Per Employee",
        value: `$${(companyData.revenuePerEmployee / 1000).toFixed(0)}K`,
        trend: "neutral",
        icon: <Building2 className="w-4 h-4 text-violet-500" />,
        description: "Annual revenue per employee",
      });
    }

    // AI Investment Signal
    if (companyData.aiInvestmentSignal) {
      const label = companyData.aiInvestmentSignal
        .replace("-", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      metrics.push({
        label: "AI Investment Signal",
        value: label,
        trend:
          companyData.aiInvestmentSignal === "high" ||
          companyData.aiInvestmentSignal === "very-high"
            ? "up"
            : "neutral",
        icon: <Activity className="w-4 h-4 text-cyan-500" />,
        description: "Company's AI maturity level",
      });
    }

    return metrics;
  }, [companyData]);

  // Sample layoff events (derived from companyData)
  const layoffEvents: LayoffEvent[] = useMemo(() => {
    // Use layoff history from companyData
    if (
      companyData.layoffsLast24Months &&
      companyData.layoffsLast24Months.length > 0
    ) {
      return companyData.layoffsLast24Months.map((layoff) => {
        // Estimate employee count from percentCut if possible
        const employeesAffected = companyData.employeeCount
          ? Math.round(companyData.employeeCount * (layoff.percentCut / 100))
          : 0;

        return {
          date: layoff.date,
          count: employeesAffected,
          percentage: layoff.percentCut,
          department: undefined, // Not tracked in CompanyData
          severity:
            layoff.percentCut > 10
              ? "major"
              : layoff.percentCut > 3
                ? "moderate"
                : "minor",
        };
      });
    }

    // No layoff history
    return [];
  }, [companyData]);

  // Benchmark data (using available company metrics)
  const benchmarkData: BenchmarkData[] = useMemo(() => {
    const benchmarks: BenchmarkData[] = [];

    // Revenue Per Employee vs industry baseline
    if (companyData.revenuePerEmployee != null) {
      benchmarks.push({
        metric: "Revenue Per Employee",
        company: companyData.revenuePerEmployee,
        industry: 380000, // approximate industry average
        // Percentile would require distribution data; omit
      });
    }

    return benchmarks;
  }, [companyData]);

  // Sample department news (placeholder)
  const departmentNews: NewsItem[] = useMemo(
    () => [
      {
        title: "Engineering department launching new AI initiative",
        date: "2026-02-28",
        source: "Internal Memo",
        sentiment: "positive",
        highlights: [
          "Focus on automation of routine coding tasks",
          "Expected to reduce development time by 30%",
        ],
      },
      {
        title: "Q1 Restructuring affecting multiple teams",
        date: "2026-01-15",
        source: "Company Blog",
        sentiment: "neutral",
        highlights: [
          "Resource reallocation to growth areas",
          "Some positions eliminated, others being created",
        ],
      },
    ],
    [],
  );

  // Sample live signals
  const liveSignals: SignalEvent[] = useMemo(
    () => [
      {
        timestamp: "2026-04-10T09:15:00Z",
        source: "SEC Filing",
        type: "financial",
        content: "Quarterly report shows 3.2% revenue decline",
        impact: "medium",
      },
      {
        timestamp: "2026-04-02T14:30:00Z",
        source: "LinkedIn",
        type: "job-market",
        content: "Multiple senior engineers posting about new opportunities",
        impact: "low",
      },
      {
        timestamp: "2026-03-28T11:45:00Z",
        source: "Industry News",
        type: "news",
        content: "Competitor announces 8% staff reduction",
        impact: "medium",
      },
    ],
    [],
  );

  return (
    <section aria-labelledby="company-profile-heading" className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <SectionHeader
            title="Company Financial Health"
            description="Key financial indicators for your company, including revenue trend, employee efficiency, cash runway, and AI investment signals."
          />
          <FinancialHealthCard
            companyName={result.companyName}
            metrics={financialMetrics}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <SectionHeader
              title="Layoff History"
              description="Timeline of documented layoffs in your company over the past 24 months, with size and departmental focus."
            />
            <LayoffTimeline
              events={layoffEvents}
              companyName={result.companyName}
            />
          </div>
          <div>
            <SectionHeader
              title="Industry Benchmarks"
              description="How your company compares to industry averages across key metrics. Higher percentiles generally indicate better positioning."
            />
            <IndustryBenchmarkCard
              industryName={result.industryKey}
              benchmarks={benchmarkData}
            />
          </div>
        </div>

        <CollapsibleSection title="Department News & Signals">
          <div className="space-y-6">
            <DepartmentNewsPanel
              news={departmentNews}
              department={result.workTypeKey}
            />

            <SectionHeader
              title="Live Signal Feed"
              description="Real-time signals gathered from various sources that affect your company and role risk assessment."
            />

            <LiveSignalFeed signals={liveSignals} />
          </div>
        </CollapsibleSection>
      </motion.div>
    </section>
  );
};

export default CompanyProfileTab;
