import { Radio } from "lucide-react";

const signals = [
  "Hiring freeze · Tech sector",
  "Automation surge · Finance ops",
  "Revenue slowdown · SaaS mid-market",
  "Restructuring signal · Retail",
  "Skill demand shift · Data roles",
  "Layoff pattern · Media",
  "Budget cut signal · Marketing",
  "Role criticality drop · Support",
];

export function SignalTicker() {
  const items = [...signals, ...signals];
  return (
    <div
      className="relative overflow-hidden border-y border-border surface-1"
      aria-label="Live signal feed"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
        style={{
          background: "linear-gradient(to right, var(--background), transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
        style={{
          background: "linear-gradient(to left, var(--background), transparent)",
        }}
      />
      <div className="flex gap-10 whitespace-nowrap py-3 ticker-track">
        {items.map((s, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground"
          >
            <Radio className="h-3 w-3 text-risk-critical pulse-dot" />
            <span className="uppercase tracking-widest">Signal detected</span>
            <span className="text-foreground/70">— {s}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
