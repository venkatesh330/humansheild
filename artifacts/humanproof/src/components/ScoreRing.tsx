// ScoreRing.tsx
// Animated circular progress indicator displaying the risk score.
// Extracted from AuditTerminalPage for reuse in tabbed dashboard.

import React from "react";
import { motion } from "framer-motion";

interface ScoreRingProps {
  score: number;
  color: string;
  size?: number;
  isMobile?: boolean;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  color,
  size = 200,
  isMobile = false,
}) => {
  const r = size / 2 - 30;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      role="img"
      aria-label={`Risk score: ${score} out of 100`}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="12"
        />
        {/* Main Score Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 15px ${color}60)` }}
        />
        {/* Indicator Tip */}
        <motion.circle
          cx={
            size / 2 + r * Math.cos((score / 100) * 2 * Math.PI - Math.PI / 2)
          }
          cy={
            size / 2 + r * Math.sin((score / 100) * 2 * Math.PI - Math.PI / 2)
          }
          r="4"
          fill="#fff"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: isMobile ? "1.8rem" : "3rem",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            color,
            lineHeight: 1,
          }}
        >
          {score}
        </motion.div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: isMobile ? "0.5rem" : "0.65rem",
            color: "var(--text-3)",
            letterSpacing: "0.15em",
            marginTop: "4px",
          }}
        >
          RISK INDEX
        </div>
      </div>
    </div>
  );
};

export default ScoreRing;
