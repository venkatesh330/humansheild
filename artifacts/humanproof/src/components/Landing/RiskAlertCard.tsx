import { AlertTriangle, ShieldAlert } from "lucide-react";
import { RiskBadge } from "./RiskBadge";

export function RiskAlertCard() {
  return (
    <div className="relative float-y">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] opacity-70 blur-3xl glow-drift"
        style={{ background: "var(--gradient-critical)" }}
      />

      <div className="glass-critical shadow-card-elevated rounded-[2rem] border p-8 backdrop-blur-xl transition-all duration-500 hover:shadow-shadow-glow-critical">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-risk-critical/10 text-risk-critical">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-risk-critical">
              Risk Alert
            </span>
          </div>
          <RiskBadge tone="critical" pulse>
            Live
          </RiskBadge>
        </div>

        <p className="mt-4 text-lg font-medium">
          Your risk increased{" "}
          <span className="text-risk-critical count-pop inline-block">+18%</span>{" "}
          this week
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="surface-2 rounded-xl border border-border p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              30-day risk
            </p>
            <p className="mt-2 flex items-baseline gap-2 font-mono">
              <span className="text-muted-foreground line-through">22%</span>
              <span className="text-2xl font-semibold text-risk-warning">38%</span>
            </p>
          </div>
          <div className="surface-2 rounded-xl border border-border p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              90-day risk
            </p>
            <p className="mt-2 flex items-baseline gap-2 font-mono">
              <span className="text-muted-foreground line-through">41%</span>
              <span className="text-2xl font-semibold text-risk-critical">67%</span>
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <ShieldAlert className="h-3 w-3" />
            Triggers
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {[
              "Hiring freeze detected",
              "Revenue slowdown signals",
              "Increased automation activity",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-risk-critical" />
                <span className="text-foreground/85">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Confidence
          </span>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full"
                style={{
                  width: "72%",
                  backgroundColor: "var(--risk-warning)",
                  transition: "width 1.2s var(--transition-smooth)",
                }}
              />
            </div>
            <span className="font-mono text-sm">72%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
