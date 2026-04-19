import {
  ArrowRight,
  Building2,
  Briefcase,
  UserCircle2,
  Brain,
  Sparkles,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Zap,
  Bell,
  ShieldCheck,
  Radar,
  LineChart,
  Globe2,
  Layers,
  Rocket,
  Activity,
  AlertTriangle,
  Radio,
} from "lucide-react";

import { RiskAlertCard } from "@/components/Landing/RiskAlertCard";
import { RiskTrendChart } from "@/components/Landing/RiskTrendChart";
import { RiskBadge } from "@/components/Landing/RiskBadge";
import { SignalTicker } from "@/components/Landing/SignalTicker";
import { SiteHeader } from "@/components/Landing/SiteHeader";
import { SectionHeading } from "@/components/Landing/SectionHeading";
import { Reveal } from "@/components/Landing/Reveal";
import { AmbientBackdrop } from "@/components/Landing/AmbientBackdrop";

import heroVisual from "@/assets/hero-visual.jpg";
import signalRadar from "@/assets/signal-radar.jpg";
import waveLines from "@/assets/wave-lines.jpg";
import portraitPro from "@/assets/portrait-pro.jpg";
import networkGrid from "@/assets/network-grid.jpg";
import pulseWaves from "@/assets/pulse-waves.jpg";
import dataBars from "@/assets/data-bars.jpg";
import radarRings from "@/assets/radar-rings.jpg";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <SignalTicker />
        <ProblemReframe />
        <SystemIntro />
        <OutputPreview />
        <RealtimeTracking />
        <Differentiation />
        <ActionEngine />
        <SocialProof />
        <EngagementHook />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

/* ─────────── HERO ─────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-hero-glow glow-drift" />
      <div aria-hidden className="absolute inset-0 bg-grid opacity-60" />

      {/* Cinematic network background */}
      <AmbientBackdrop
        image={networkGrid}
        imageOpacity={28}
        particles
        scanline
        fade="edges"
      />

      {/* Background image accent */}
      <img
        src={heroVisual}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-[640px] w-[640px] max-w-none rotate-3 object-cover opacity-25 mix-blend-screen blur-[1px] ken-burns"
      />

      {/* Slow rotating radar accent */}
      <img
        src={radarRings}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -left-40 bottom-0 h-[420px] w-[420px] opacity-20 mix-blend-screen slow-spin"
      />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pb-32 lg:pt-28">
        <Reveal>
          <RiskBadge tone="critical" pulse>
            <AlertTriangle className="h-3 w-3" />
            Early warning · Live signals
          </RiskBadge>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Know your career risk{" "}
            <span className="relative inline-block">
              <span className="text-gradient-risk">before it happens.</span>
              <svg
                aria-hidden
                viewBox="0 0 300 12"
                className="absolute -bottom-2 left-0 w-full"
              >
                <path
                  d="M2 8 Q 80 2, 150 6 T 298 4"
                  stroke="var(--risk-critical)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="320"
                  strokeDashoffset="320"
                  style={{ animation: "draw-line 1.6s var(--transition-smooth) 0.6s forwards" }}
                  opacity="0.7"
                />
              </svg>
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Real-time monitoring of your company, role, and market signals —
            with predictive risk alerts and 30–90 day forecasts.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#cta"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90 shimmer-sweep"
            >
              Check My Risk
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#system"
              className="inline-flex items-center gap-2 rounded-xl border border-border surface-1 px-5 py-3 text-sm font-medium text-foreground transition hover:bg-surface-2 hover:border-foreground/20"
            >
              <Eye className="h-4 w-4" />
              See How It Works
            </a>
          </div>

          <p className="mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <Radar className="h-3 w-3 text-risk-stable" />
            <span className="h-1.5 w-1.5 rounded-full bg-risk-stable pulse-dot" />
            Tracking live signals across companies, roles & market trends
          </p>
        </Reveal>

        <Reveal delay={120} variant="scale">
          <RiskAlertCard />
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────── PROBLEM ─────────── */
function ProblemReframe() {
  const items = [
    { label: "Hiring freezes.", icon: Briefcase },
    { label: "Budget cuts.", icon: TrendingDown },
    { label: "Role restructuring.", icon: Layers },
  ];
  return (
    <section className="relative overflow-hidden border-t border-border">
      <AmbientBackdrop image={pulseWaves} imageOpacity={18} aurora fade="edges" />
      <img
        src={signalRadar}
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute -left-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 object-cover opacity-15 mix-blend-screen slow-spin"
      />
      <div className="relative mx-auto max-w-5xl px-6 py-24 lg:py-32">
        <Reveal>
          <SectionHeading
            eyebrow="The blind spot"
            title={
              <>
                Most people don’t see risk{" "}
                <span className="text-risk-critical">until it’s too late.</span>
              </>
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <Reveal delay={80}>
            <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
              <p>
                <span className="text-foreground inline-flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-risk-warning" />
                  Layoffs don’t happen suddenly.
                </span>{" "}
                They build quietly through signals most people never notice.
              </p>
              <p>By the time it becomes visible, the decision is already made.</p>
            </div>
          </Reveal>

          <div className="grid gap-3">
            {items.map((it, i) => (
              <Reveal key={it.label} delay={120 + i * 80}>
                <div className="glass-warning lift-card flex items-center justify-between rounded-[1.5rem] border p-6">
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-risk-warning/10 text-risk-warning">
                      <it.icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{it.label}</span>
                  </span>
                  <RiskBadge tone="warning">Quiet signal</RiskBadge>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── SYSTEM INTRO ─────────── */
function SystemIntro() {
  const blocks = [
    {
      title: "Company Monitoring",
      icon: Building2,
      points: [
        "Financial stress indicators",
        "Hiring slowdowns",
        "Layoff patterns",
        "Strategic shifts",
      ],
    },
    {
      title: "Role Risk Analysis",
      icon: Briefcase,
      points: [
        "Automation exposure",
        "Skill demand shifts",
        "Industry-level disruption",
      ],
    },
    {
      title: "Personal Risk Layer",
      icon: UserCircle2,
      points: ["Experience depth", "Replaceability", "Role criticality"],
    },
  ];

  return (
    <section id="system" className="relative overflow-hidden border-t border-border">
      <AmbientBackdrop
        image={networkGrid}
        imageOpacity={12}
        aurora
        grid
        fade="edges"
      />
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <Reveal>
          <SectionHeading
            eyebrow="The system"
            title="A system designed to detect risk early."
            subtitle="Not just analysis — continuous monitoring and prediction."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {blocks.map((b, i) => (
            <Reveal key={b.title} delay={i * 100}>
              <div className="glass-info lift-card group relative h-full overflow-hidden rounded-[2rem] border p-8 transition hover:border-foreground/20">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition group-hover:opacity-60"
                  style={{ background: "color-mix(in oklab, var(--risk-info) 35%, transparent)" }}
                />
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-risk-info/10 text-risk-info transition group-hover:scale-110">
                    <b.icon className="h-5 w-5" />
                  </span>
                  <RiskBadge tone="info" pulse>
                    Monitoring
                  </RiskBadge>
                </div>
                <p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Layer 0{i + 1}
                </p>
                <h3 className="mt-1 text-xl font-semibold">{b.title}</h3>
                <ul className="mt-5 space-y-2.5">
                  {b.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-2.5 text-sm text-foreground/85"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-risk-info" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Prediction Engine highlight */}
        <div className="mt-8 grid items-stretch gap-5 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <div className="glass-critical relative h-full overflow-hidden rounded-[2rem] border p-10 glow-critical transition-all duration-700 hover:shadow-shadow-glow-critical">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `url(${signalRadar})`,
                  backgroundSize: "cover",
                  backgroundPosition: "right center",
                  mixBlendMode: "screen",
                  maskImage:
                    "linear-gradient(to left, black, transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-risk-critical" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-risk-critical">
                      Prediction Engine
                    </span>
                  </div>
                  <RiskBadge tone="critical" pulse>
                    Active
                  </RiskBadge>
                </div>

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <div className="surface-2 rounded-xl border border-border p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      30-day risk
                    </p>
                    <p className="mt-3 inline-flex items-center gap-2 text-3xl font-semibold text-risk-stable">
                      <ShieldCheck className="h-6 w-6" />
                      LOW
                    </p>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full"
                        style={{ width: "22%", backgroundColor: "var(--risk-stable)" }}
                      />
                    </div>
                  </div>
                  <div className="surface-2 rounded-xl border border-risk-critical/30 p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      90-day risk
                    </p>
                    <p className="mt-3 inline-flex items-center gap-2 text-3xl font-semibold text-risk-critical">
                      <AlertTriangle className="h-6 w-6" />
                      HIGH
                      <TrendingUp className="h-5 w-5" />
                    </p>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: "67%",
                          backgroundColor: "var(--risk-critical)",
                          transition: "width 1.4s var(--transition-smooth)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5 font-mono text-xs">
                  <span className="text-muted-foreground">Trend:</span>
                  <span className="inline-flex items-center gap-1 text-risk-critical">
                    <TrendingUp className="h-3 w-3" />
                    Increasing
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="text-foreground">74%</span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="glass-info flex h-full flex-col justify-center rounded-[2rem] border p-10">
              <Sparkles className="h-5 w-5 text-risk-info" />
              <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Why it matters
              </p>
              <p className="mt-3 text-2xl font-semibold leading-snug">
                Your risk isn’t static —{" "}
                <span className="text-risk-critical">it evolves over time.</span>
              </p>
              <p className="mt-4 text-muted-foreground">
                The Prediction Engine continuously re-scores your risk as new
                signals arrive — so you always know what’s coming, not just what
                happened.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─────────── OUTPUT PREVIEW ─────────── */
function OutputPreview() {
  return (
    <section className="relative overflow-hidden border-t border-border">
      <AmbientBackdrop
        image={dataBars}
        imageOpacity={10}
        particles
        fade="edges"
        blend="screen"
      />
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <Reveal>
          <SectionHeading
            eyebrow="Output"
            title="From uncertainty to clarity in seconds."
            subtitle="Structured insights you can act on — not walls of text."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="glass-warning lift-card h-full rounded-[2rem] border p-8">
              <div className="flex items-center justify-between">
                <RiskBadge tone="warning" pulse>
                  <TrendingUp className="h-3 w-3" /> Trend increasing
                </RiskBadge>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <Clock className="h-3 w-3" /> Updated 2m ago
                </span>
              </div>
              <ul className="mt-5 space-y-2.5 text-[15px]">
                {[
                  "Your risk increased 14% this week",
                  "Early-stage restructuring signals detected",
                  "Your role shows medium automation exposure",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-risk-warning" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 surface-2 flex items-center justify-between rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-risk-warning" />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Recommended action
                    </p>
                    <p className="mt-1 font-medium">
                      Prepare transition within 30–45 days
                    </p>
                  </div>
                </div>
                <RiskBadge tone="warning">Action</RiskBadge>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="glass-stable lift-card h-full rounded-[2rem] border p-8">
              <div className="flex items-center justify-between">
                <RiskBadge tone="stable" pulse>
                  <ShieldCheck className="h-3 w-3" /> Stable
                </RiskBadge>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <Clock className="h-3 w-3" /> Updated 5m ago
                </span>
              </div>
              <ul className="mt-5 space-y-2.5 text-[15px]">
                {[
                  "Stable company signals this week",
                  "Role demand remains strong",
                  "No negative indicators detected",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-risk-stable" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 surface-2 flex items-center justify-between rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-risk-stable" />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Status
                    </p>
                    <p className="mt-1 font-medium">Low short-term risk</p>
                  </div>
                </div>
                <RiskBadge tone="stable">Healthy</RiskBadge>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─────────── REAL-TIME TRACKING ─────────── */
function RealtimeTracking() {
  return (
    <section id="tracking" className="relative overflow-hidden border-t border-border">
      <AmbientBackdrop image={pulseWaves} imageOpacity={20} particles fade="edges" />
      <img
        src={waveLines}
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-72 w-full object-cover opacity-30 ken-burns"
        style={{ maskImage: "linear-gradient(to top, black, transparent)" }}
      />
      <img
        src={radarRings}
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute -right-32 top-10 h-[360px] w-[360px] opacity-15 mix-blend-screen slow-spin"
      />
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <SectionHeading
              eyebrow="Continuous tracking"
              title={
                <>
                  Your career,{" "}
                  <span className="text-gradient-risk">tracked continuously.</span>
                </>
              }
              subtitle="If your risk changes, you’ll know instantly."
            />
            <div className="mt-6 flex flex-wrap gap-2">
              <RiskBadge tone="info" pulse>
                <LineChart className="h-3 w-3" /> Risk updated recently
              </RiskBadge>
              <RiskBadge tone="warning">
                <Bell className="h-3 w-3" /> Early warning
              </RiskBadge>
              <RiskBadge tone="stable" pulse>
                <Activity className="h-3 w-3" /> Monitoring active
              </RiskBadge>
            </div>
          </Reveal>
          <Reveal delay={120} variant="scale">
            <RiskTrendChart />
          </Reveal>
        </div>
        <Reveal delay={200}>
          <p className="mt-10 max-w-xl text-muted-foreground">
            <span className="text-foreground">Risk doesn’t stay the same.</span>{" "}
            This system tracks it as it evolves.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────── DIFFERENTIATION ─────────── */
function Differentiation() {
  const traditional = [
    "One-time analysis",
    "Static insights",
    "No tracking",
    "No timing clarity",
  ];
  const system = [
    "Continuous monitoring",
    "Real-time updates",
    "Predictive timelines",
    "Actionable insights",
  ];

  return (
    <section className="relative overflow-hidden border-t border-border">
      <AmbientBackdrop image={networkGrid} imageOpacity={10} aurora fade="edges" />
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <Reveal>
          <SectionHeading
            eyebrow="The difference"
            title="Built for real-world decisions."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="glass-info opacity-70 lift-card h-full rounded-[2rem] border p-8">
              <div className="flex items-center justify-between">
                <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                  <EyeOff className="h-4 w-4" /> Traditional approach
                </h3>
                <RiskBadge tone="muted">Outdated</RiskBadge>
              </div>
              <ul className="mt-5 divide-y divide-border">
                {traditional.map((t) => (
                  <li
                    key={t}
                    className="flex items-center gap-3 py-3 text-muted-foreground"
                  >
                    <XCircle className="h-4 w-4 text-risk-critical" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="glass-stable lift-card relative h-full overflow-hidden rounded-[2rem] border p-8 shadow-stable-glow">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl"
                style={{ background: "color-mix(in oklab, var(--risk-stable) 30%, transparent)" }}
              />
              <div className="relative flex items-center justify-between">
                <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
                  <Sparkles className="h-4 w-4 text-risk-stable" /> This system
                </h3>
                <RiskBadge tone="stable" pulse>Live</RiskBadge>
              </div>
              <ul className="relative mt-5 divide-y divide-border">
                {system.map((t) => (
                  <li key={t} className="flex items-center gap-3 py-3">
                    <CheckCircle2 className="h-4 w-4 text-risk-stable" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <p className="mt-10 text-center text-xl text-muted-foreground">
            Not just insight —{" "}
            <span className="text-foreground">timing that matters.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────── ACTION ENGINE ─────────── */
function ActionEngine() {
  const actions = [
    {
      tone: "critical" as const,
      icon: Zap,
      action: "Start exploring new opportunities within 21 days",
      why: ["Risk acceleration detected", "Company entering cost-control phase"],
      priority: "HIGH",
    },
    {
      tone: "warning" as const,
      icon: Brain,
      action: "Upskill in automation-resistant areas",
      why: ["Role exposure increasing", "Industry shift detected"],
      priority: "MEDIUM",
    },
  ];

  return (
    <section id="actions" className="relative overflow-hidden border-t border-border">
      <AmbientBackdrop image={dataBars} imageOpacity={8} scanline fade="edges" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1fr_1.4fr] lg:py-32">
        <Reveal>
          <div className="lg:sticky lg:top-24">
            <SectionHeading
              eyebrow="Action engine"
              title="Know what to do next."
              subtitle="Every signal turns into a prioritized recommendation with timing."
            />
            <div className="mt-8 overflow-hidden rounded-2xl border border-border surface-1">
              <img
                src={portraitPro}
                alt="Professional reviewing live risk data"
                loading="lazy"
                width={1024}
                height={1024}
                className="h-72 w-full object-cover opacity-90"
              />
              <div className="border-t border-border p-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Bell className="h-3 w-3 text-risk-critical pulse-dot" />
                  Action recommended
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-5">
          {actions.map((a, i) => (
            <Reveal key={a.action} delay={i * 120}>
              <div
                className={`lift-card rounded-[2rem] border p-8 ${
                  a.tone === "critical" ? "glass-critical" : "glass-warning"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <a.icon
                      className={`h-3.5 w-3.5 ${
                        a.tone === "critical"
                          ? "text-risk-critical"
                          : "text-risk-warning"
                      }`}
                    />
                    Recommended action
                  </span>
                  <RiskBadge tone={a.tone}>Priority {a.priority}</RiskBadge>
                </div>
                <p className="mt-4 text-xl font-semibold leading-snug">
                  {a.action}
                </p>
                <div className="mt-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Why
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {a.why.map((w) => (
                      <li
                        key={w}
                        className="flex items-center gap-2 text-sm text-foreground/85"
                      >
                        <span
                          className={`h-1 w-1 rounded-full ${
                            a.tone === "critical"
                              ? "bg-risk-critical"
                              : "bg-risk-warning"
                          }`}
                        />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── SOCIAL PROOF ─────────── */
function SocialProof() {
  const stats = [
    { value: "120K+", label: "Risk assessments generated", icon: LineChart },
    { value: "24/7", label: "Continuous monitoring", icon: Activity },
    { value: "12+", label: "Industries tracked", icon: Globe2 },
  ];
  return (
    <section className="relative overflow-hidden border-t border-border">
      <AmbientBackdrop image={radarRings} imageOpacity={12} particles aurora fade="edges" />
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <Reveal>
          <SectionHeading
            eyebrow="In the wild"
            title="Used to track real-world career risk signals."
            align="center"
          />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 100} variant="scale">
              <div className="glass-info lift-card h-full rounded-[2.5rem] border p-10 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-risk-info/10 text-risk-info">
                  <s.icon className="h-5 w-5" />
                </span>
                <p className="mt-5 text-4xl font-semibold tracking-tight count-pop">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── ENGAGEMENT HOOK ─────────── */
function EngagementHook() {
  return (
    <section className="relative overflow-hidden border-t border-border">
      <AmbientBackdrop image={pulseWaves} imageOpacity={28} aurora particles fade="edges" />
      <img
        src={waveLines}
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25 ken-burns"
      />
      <div className="relative mx-auto max-w-3xl px-6 py-24 text-center lg:py-28">
        <Reveal>
          <Sparkles className="mx-auto h-6 w-6 text-risk-critical" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Risk doesn’t stay the same.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            It shifts with your company, your role, and the market.
          </p>
          <p className="mt-2 text-lg">
            <span className="text-foreground">Stay ahead</span> by tracking it
            continuously.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────── PRICING ─────────── */
function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden border-t border-border">
      <AmbientBackdrop image={pulseWaves} imageOpacity={10} aurora fade="edges" />
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <Reveal>
          <SectionHeading
            eyebrow="Pricing"
            title="Start free. Upgrade when it matters."
            subtitle="Basic insights are free. Advanced tracking and alerts unlock deeper intelligence."
            align="center"
            className="mx-auto"
          />
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-4xl gap-5 sm:grid-cols-2">
          <Reveal>
            <div className="glass-info opacity-80 lift-card h-full rounded-[2rem] border p-8">
              <div className="flex items-center justify-between">
                <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
                  <Eye className="h-4 w-4" /> Free
                </h3>
                <RiskBadge tone="muted">Basic</RiskBadge>
              </div>
              <p className="mt-4 text-4xl font-semibold">$0</p>
              <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                  One-time risk assessment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Weekly summary
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Basic signal coverage
                </li>
              </ul>
              <a
                href="#cta"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border surface-2 px-4 py-2.5 text-sm font-medium transition hover:bg-surface-3"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="glass-critical lift-card relative h-full overflow-hidden rounded-[2rem] border p-8 glow-critical">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl glow-drift"
                style={{ background: "color-mix(in oklab, var(--risk-critical) 35%, transparent)" }}
              />
              <div className="relative flex items-center justify-between">
                <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
                  <Rocket className="h-4 w-4 text-risk-critical" /> Pulse Pro
                </h3>
                <RiskBadge tone="critical" pulse>
                  Recommended
                </RiskBadge>
              </div>
              <p className="relative mt-4 text-4xl font-semibold">
                $19
                <span className="text-base font-normal text-muted-foreground">
                  /mo
                </span>
              </p>
              <ul className="relative mt-6 space-y-2.5 text-sm">
                {[
                  "Continuous monitoring",
                  "30 / 60 / 90-day predictions",
                  "Real-time alerts & action engine",
                  "Full signal coverage",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-risk-critical" />
                    {t}
                  </li>
                ))}
              </ul>
              <a
                href="#cta"
                className="relative mt-7 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90 shimmer-sweep"
              >
                Upgrade to Pro
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─────────── FINAL CTA ─────────── */
function FinalCTA() {
  return (
    <section id="cta" className="relative overflow-hidden border-t border-border">
      <div aria-hidden className="absolute inset-0 bg-hero-glow opacity-80 glow-drift" />
      <div aria-hidden className="absolute inset-0 bg-grid opacity-50" />
      <AmbientBackdrop
        image={networkGrid}
        imageOpacity={22}
        particles
        scanline
        fade="edges"
      />
      <img
        src={heroVisual}
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-screen ken-burns"
      />
      <img
        src={radarRings}
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-20 mix-blend-screen slow-spin"
      />
      <div className="relative mx-auto max-w-4xl px-6 py-28 text-center lg:py-36">
        <Reveal>
          <RiskBadge tone="critical" pulse className="mx-auto">
            <Bell className="h-3 w-3" />
            Risk updated recently
          </RiskBadge>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Don’t wait to find out.
          </h2>
          <p className="mt-5 text-xl text-muted-foreground">
            Know before it happens.
          </p>
          <div className="mt-10 flex justify-center">
            <a
              href="#"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-foreground px-6 py-3.5 text-base font-medium text-background transition hover:opacity-90 shimmer-sweep"
            >
              Check My Risk Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3 w-3 text-risk-critical" />
            Early signals change everything.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────── FOOTER ─────────── */
function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="max-w-md text-sm text-muted-foreground">
            <span className="text-foreground">
              We don’t just show your risk.
            </span>{" "}
            We track it, predict it, and help you act before it changes
            everything.
          </p>
          <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Activity className="h-3 w-3 text-risk-stable pulse-dot" />
              Monitoring active
            </span>
            <span>·</span>
            <span>© {new Date().getFullYear()} Pulse</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
