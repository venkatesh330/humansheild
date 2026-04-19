// StatCard.tsx
// Small metric display: label, value, optional trend icon.
// Used in QuickStatsRow and other summary sections.

import React from "react";
import type { ComponentType } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
}) => {
  const trendColor =
    trend === "up"
      ? "text-emerald"
      : trend === "down"
        ? "text-rose"
        : "text-muted-foreground";
  const trendSymbol = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <div className="stat-card" style={{ padding: "0" }}>
      <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-1)]">
        <Icon className="w-4 h-4 text-muted-foreground opacity-60" aria-hidden="true" />
        <span className="label-xs text-muted-foreground uppercase tracking-widest font-black">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-[var(--space-2)]">
        <span className="text-2xl font-black tracking-tighter" style={{ color: 'var(--text)' }}>
          {value}
        </span>
        {trend && (
          <span
            className={`text-sm font-mono font-bold ${trendColor}`}
            aria-label={trendLabel || trend}
          >
            {trendSymbol}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
