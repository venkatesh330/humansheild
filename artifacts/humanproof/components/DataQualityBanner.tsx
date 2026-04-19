// DataQualityBanner.tsx
// Displays data freshness, source breakdown, and confidence metrics.
// Must appear prominently above the score ring in AuditTerminalPage.

import React from "react";

interface DataQualityBannerProps {
  freshnessReport: {
    avgSignalAge: number;
    oldestSignalAge: number;
    percentLive: number; // 0–1
    percentHeuristic: number;
  };
  confidencePercent: number;
  confidenceInterval: { low: number; high: number };
  hasConflicts: boolean;
  conflictCount: number;
  primarySource: "live" | "db" | "hybrid";
  overridesApplied?: string[];
}

export const DataQualityBanner: React.FC<DataQualityBannerProps> = ({
  freshnessReport,
  confidencePercent,
  confidenceInterval,
  hasConflicts,
  conflictCount,
  primarySource,
  overridesApplied = [],
}) => {
  // Determine overall status color & icon
  const getStatusConfig = () => {
    if (freshnessReport.avgSignalAge > 90)
      return {
        color: "#ef4444",
        bg: "rgba(239,68,68,0.1)",
        icon: "🔴",
        label: "STALE DATA",
      };
    if (freshnessReport.avgSignalAge > 30)
      return {
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.1)",
        icon: "🟡",
        label: "MODERATELY FRESH",
      };
    if (freshnessReport.avgSignalAge > 7)
      return {
        color: "#3b82f6",
        bg: "rgba(59,130,246,0.1)",
        icon: "🔵",
        label: "FRESH",
      };
    return {
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
      icon: "🟢",
      label: "LIVE",
    };
  };

  const status = getStatusConfig();
  const showConflicts = hasConflicts || overridesApplied.length > 0;

  return (
    <div
      style={{
        border: `1px solid ${status.color}`,
        borderRadius: "12px",
        background: status.bg,
        padding: "16px 20px",
        marginBottom: "24px",
        fontSize: "0.85rem",
        lineHeight: 1.6,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: showConflicts ? "12px" : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.2rem" }}>{status.icon}</span>
          <span
            style={{
              fontWeight: 700,
              color: status.color,
              letterSpacing: "0.05em",
            }}
          >
            {status.label}
          </span>
          <span style={{ color: "var(--text-2)", fontSize: "0.8rem" }}>
            (signals avg {freshnessReport.avgSignalAge}d old)
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Source breakdown */}
          <div style={{ display: "flex", gap: "12px", fontSize: "0.75rem" }}>
            <span
              style={{
                color:
                  freshnessReport.percentLive > 0.5
                    ? "#10b981"
                    : "var(--text-2)",
              }}
            >
              ● Live: {Math.round(freshnessReport.percentLive * 100)}%
            </span>
            <span
              style={{
                color:
                  freshnessReport.percentHeuristic > 0.3
                    ? "#f59e0b"
                    : "var(--text-2)",
              }}
            >
              ○ DB:{" "}
              {Math.round(
                (1 -
                  freshnessReport.percentLive -
                  freshnessReport.percentHeuristic) *
                  100,
              )}
              %
            </span>
            {freshnessReport.percentHeuristic > 0.2 && (
              <span style={{ color: "#ef4444" }}>
                ⚠ Heuristic:{" "}
                {Math.round(freshnessReport.percentHeuristic * 100)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Confidence interval */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          fontSize: "0.8rem",
          marginBottom: showConflicts ? "12px" : 0,
        }}
      >
        <div>
          <span style={{ color: "var(--text-2)" }}>Confidence:</span>
          <span style={{ fontWeight: 600, marginLeft: "4px" }}>
            {confidencePercent}%
          </span>
        </div>
        <div>
          <span style={{ color: "var(--text-2)" }}>Score range:</span>
          <span
            style={{
              fontWeight: 600,
              marginLeft: "4px",
              color:
                confidenceInterval.low === confidenceInterval.high
                  ? status.color
                  : "var(--cyan)",
            }}
          >
            {confidenceInterval.low} – {confidenceInterval.high}
          </span>
        </div>
        {primarySource === "live" && (
          <div style={{ color: "#10b981", fontWeight: 500 }}>
            ✓ Live signals used
          </div>
        )}
      </div>

      {/* Conflict / Override alerts */}
      {showConflicts && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "12px",
            marginTop: "8px",
          }}
        >
          {hasConflicts && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "6px",
              }}
            >
              <span style={{ color: "#ef4444", fontWeight: 700 }}>
                ⚠ SIGNAL CONFLICT
              </span>
              <span style={{ color: "var(--text-2)", fontSize: "0.75rem" }}>
                {conflictCount} discrepancy(ies) detected — results adjusted
              </span>
            </div>
          )}
          {overridesApplied.length > 0 && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <div
                style={{
                  color: "#f59e0b",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                }}
              >
                ⚡ System Overrides Applied:
              </div>
              {overridesApplied.map((override, i) => (
                <div
                  key={i}
                  style={{
                    color: "var(--text-2)",
                    fontSize: "0.75rem",
                    paddingLeft: "12px",
                  }}
                >
                  • {override}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataQualityBanner;
