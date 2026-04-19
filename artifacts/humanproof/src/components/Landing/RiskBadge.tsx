import { cn } from "@/lib/utils";

type Tone = "critical" | "warning" | "stable" | "info" | "muted";

const toneStyles: Record<Tone, string> = {
  critical: "text-risk-critical bg-risk-critical/10 border-risk-critical/30",
  warning: "text-risk-warning bg-risk-warning/10 border-risk-warning/30",
  stable: "text-risk-stable bg-risk-stable/10 border-risk-stable/30",
  info: "text-risk-info bg-risk-info/10 border-risk-info/30",
  muted: "text-muted-foreground bg-muted border-border",
};

export function RiskBadge({
  children,
  tone = "muted",
  pulse = false,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider",
        toneStyles[tone],
        className,
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-70 pulse-dot"
            style={{ backgroundColor: "currentColor" }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "currentColor" }}
          />
        </span>
      )}
      {children}
    </span>
  );
}
