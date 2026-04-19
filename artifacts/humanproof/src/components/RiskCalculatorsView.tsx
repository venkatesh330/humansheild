// RiskCalculatorsView.tsx
// Unified view for all risk calculators under "Risk Calculators" tab
// Contains Risk Oracle and Layoff Audit

import React, { useState } from "react";
import AuditTerminalPage from "../pages/AuditTerminalPage";
import { LayoffCalculator } from "./LayoffCalculator/LayoffCalculator";

type CalculatorType = "risk-oracle" | "layoff-audit";

interface Props {
  onSwitchTab?: (tabId: string) => void;
}

export const RiskCalculatorsView: React.FC<Props> = ({ onSwitchTab }) => {
  const [activeCalculator, setActiveCalculator] =
    useState<CalculatorType>("risk-oracle");

  const calculators: {
    id: CalculatorType;
    label: string;
    icon: string;
    desc: string;
  }[] = [
    {
      id: "risk-oracle",
      label: "Risk Oracle",
      icon: "🎯",
      desc: "6-dimension AI displacement risk analysis across thousands of roles and global markets",
    },
    {
      id: "layoff-audit",
      label: "Layoff Audit",
      icon: "📉",
      desc: "Company-specific layoff risk assessment with 30-agent swarm intelligence",
    },
  ];

  return (
    <div>
      {/* Calculator Selector Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {calculators.map((calc) => (
          <button
            key={calc.id}
            onClick={() => setActiveCalculator(calc.id)}
            style={{
              padding: "12px 20px",
              borderRadius: "8px",
              border: `1px solid ${activeCalculator === calc.id ? "var(--cyan, #00F5FF)" : "rgba(255,255,255,0.1)"}`,
              background:
                activeCalculator === calc.id
                  ? "rgba(0,245,255,0.1)"
                  : "transparent",
              color:
                activeCalculator === calc.id
                  ? "var(--cyan, #00F5FF)"
                  : "rgba(255,255,255,0.6)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.9rem",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
          >
            <span>{calc.icon}</span>
            <span>{calc.label}</span>
          </button>
        ))}
      </div>

      {/* Active Calculator Description */}
      <div
        style={{
          marginBottom: "24px",
          padding: "16px",
          background: "rgba(0,245,255,0.05)",
          border: "1px solid rgba(0,245,255,0.1)",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>
            {calculators.find((c) => c.id === activeCalculator)?.icon}
          </span>
          <span
            style={{
              color: "#00F5FF",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.5px",
            }}
          >
            {calculators.find((c) => c.id === activeCalculator)?.label} ACTIVE
          </span>
        </div>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.85rem",
            margin: 0,
          }}
        >
          {calculators.find((c) => c.id === activeCalculator)?.desc}
        </p>
      </div>

      {/* Render Active Calculator */}
      {activeCalculator === "risk-oracle" && <AuditTerminalPage embedded={true} />}
      {activeCalculator === "layoff-audit" && (
        <LayoffCalculator onSwitchTab={onSwitchTab} />
      )}
    </div>
  );
};

export default RiskCalculatorsView;
