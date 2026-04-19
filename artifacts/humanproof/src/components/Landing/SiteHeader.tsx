import { Link } from "wouter";
import { Activity } from "lucide-react";
import { RiskBadge } from "./RiskBadge";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-risk-critical/10 transition group-hover:bg-risk-critical/20">
            <span className="absolute inset-0 rounded-lg border border-risk-critical/40" />
            <Activity className="h-4 w-4 text-risk-critical" />
          </span>
          <span className="font-semibold tracking-tight">Pulse</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
            / Career Risk
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#system" className="transition hover:text-foreground">
            System
          </a>
          <a href="#tracking" className="transition hover:text-foreground">
            Tracking
          </a>
          <a href="#actions" className="transition hover:text-foreground">
            Actions
          </a>
          <a href="#pricing" className="transition hover:text-foreground">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <RiskBadge tone="stable" pulse className="hidden sm:inline-flex">
            Monitoring active
          </RiskBadge>
          <a
            href="#cta"
            className="relative inline-flex items-center overflow-hidden rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background transition hover:opacity-90 shimmer-sweep"
          >
            Check My Risk
          </a>
        </div>
      </div>
    </header>
  );
}
