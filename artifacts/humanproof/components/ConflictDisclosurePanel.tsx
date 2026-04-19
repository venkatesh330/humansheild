// ConflictDisclosurePanel.tsx
// Expandable panel showing detected signal conflicts and how they were resolved.
// Triggered when signalQuality.hasConflicts is true.

import React, { useState } from "react";

interface Conflict {
  signal1: string;
  signal2: string;
  severity: string;
}

interface SignalConflict {
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

interface ConflictDisclosurePanelProps {
  conflicts: SignalConflict[];
  overrides: string[];
  overallImpact:
    | "none"
    | "reduced_confidence"
    | "score_increased"
    | "score_decreased";
}

export const ConflictDisclosurePanel: React.FC<
  ConflictDisclosurePanelProps
> = ({ conflicts, overrides, overallImpact }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (conflicts.length === 0 && overrides.length === 0) return null;

  const severityColors: Record<string, string> = {
    low: "#10b981",
    medium: "#f59e0b",
    high: "#f97316",
    critical: "#ef4444",
  };

  return (
    <div
      style={{
        border: `1px solid ${overallImpact === "score_increased" ? "#ef4444" : "#f59e0b"}`,
        borderRadius: "12px",
        background:
          overallImpact === "score_increased"
            ? "rgba(239,68,68,0.08)"
            : "rgba(245,158,11,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 18px",
          background: "transparent",
          border: "none",
          color: "var(--text)",
          fontSize: "0.9rem",
          fontWeight: 600,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.1rem" }}>
            {overallImpact === "score_increased" ? "🚨" : "⚠️"}
          </span>
          <span>
            {overallImpact === "score_increased"
              ? "Risk Escalation Detected"
              : "Signal Conflicts Detected"}
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              padding: "2px 8px",
              borderRadius: "10px",
              background:
                severityColors[conflicts[0]?.severity || "medium"] || "#f59e0b",
              color: "#fff",
            }}
          >
            {conflicts.length} issue{conflicts.length !== 1 ? "s" : ""}
          </span>
        </div>
        <span
          style={{
            fontSize: "0.8rem",
            transform: isExpanded ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        >
          ▼
        </span>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "16px 18px",
            fontSize: "0.85rem",
            lineHeight: 1.7,
          }}
        >
          {/* Conflicts list */}
          {conflicts.map((conflict, idx) => (
            <div key={idx} style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: severityColors[conflict.severity],
                  }}
                />
                <span
                  style={{
                    fontWeight: 600,
                    color: severityColors[conflict.severity],
                  }}
                >
                  {conflict.signalType.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span style={{ color: "var(--text-2)", fontSize: "0.8rem" }}>
                  (severity: {conflict.severity})
                </span>
              </div>
              {conflict.descriptions.map((desc, i) => (
                <p
                  key={i}
                  style={{
                    margin: "4px 0 8px 20px",
                    color: "var(--text-2)",
                    fontSize: "0.8rem",
                  }}
                >
                  {desc}
                </p>
              ))}
              {conflict.conflictingSources && (
                <div
                  style={{
                    marginLeft: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {conflict.conflictingSources.map((src, j) => (
                    <div
                      key={j}
                      style={{ fontSize: "0.75rem", color: "var(--text-3)" }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          color: src.source.includes("live")
                            ? "#10b981"
                            : src.source.includes("db")
                              ? "#3b82f6"
                              : "#f59e0b",
                        }}
                      >
                        [{src.source}]
                      </span>{" "}
                      value={src.value.toFixed(2)} · {src.timestamp}
                    </div>
                  ))}
                </div>
              )}
              {conflict.recommendedResolution && (
                <div
                  style={{
                    margin: "8px 0 0 20px",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                  }}
                >
                  <span style={{ color: "#10b981", fontWeight: 600 }}>
                    Resolution:
                  </span>{" "}
                  {conflict.recommendedResolution}
                </div>
              )}
            </div>
          ))}

          {/* Overrides applied */}
          {overrides.length > 0 && (
            <div
              style={{
                marginTop: "16px",
                paddingTop: "12px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "#f59e0b",
                }}
              >
                System Overrides Applied:
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  color: "var(--text-2)",
                  fontSize: "0.8rem",
                }}
              >
                {overrides.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Impact summary */}
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "8px",
              fontSize: "0.8rem",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "4px" }}>
              Impact on Score
            </div>
            {overallImpact === "score_increased" && (
              <p style={{ margin: 0, color: "#ef4444" }}>
                Live signals indicate higher risk than historical data alone.
                Score elevated to reflect current reality.
              </p>
            )}
            {overallImpact === "score_decreased" && (
              <p style={{ margin: 0, color: "#10b981" }}>
                System override reduced risk based on contradicting fresh data
                (e.g., strong earnings despite past struggles).
              </p>
            )}
            {overallImpact === "reduced_confidence" && (
              <p style={{ margin: 0, color: "#f59e0b" }}>
                Conflicting signals reduced confidence in this assessment.
                Consider gathering additional data.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConflictDisclosurePanel;
