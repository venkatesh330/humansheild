import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface HeroSectionProps {
  onCheckRisk: () => void;
  onSeeHowItWorks: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onCheckRisk,
  onSeeHowItWorks,
}) => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1240px] max-h-[800px] opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--cyan)] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--cyan)]/10 border border-[var(--cyan)]/20 text-[var(--cyan)] text-xs mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-pulse" />
            LIVE SIGNAL MONITORING ACTIVE
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tight">
            Know your career risk <br />
            <span className="gradient-text-cyan italic">
              before it happens.
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
            Real-time monitoring of your company, role, and market signals —
            with predictive risk alerts and 30–90 day forecasts.
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              onClick={onCheckRisk}
              size="lg"
              className="bg-[var(--cyan)] hover:bg-[var(--cyan)]/90 text-black font-black"
            >
              Check My Risk
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button onClick={onSeeHowItWorks} variant="secondary" size="lg">
              See How It Works
            </Button>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground opacity-60">
            <Zap className="w-4 h-4 text-[var(--cyan)]" />
            TRACKING LIVE SIGNALS ACROSS COMPANIES, ROLES, AND MARKET TRENDS
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative"
        >
          <Card className="p-6 border-white/10 shadow-2xl relative overflow-hidden group hover-lift bg-black/40 backdrop-blur-xl rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full -mr-16 -mt-16" />

            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-widest uppercase text-red-500">
                    Risk Alert
                  </h3>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    CRITICAL SIGNAL DETECTED
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-red-500">+18%</div>
                <div className="text-xs text-muted-foreground opacity-60">
                  Weekly Delta
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 mb-8">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    30-DAY RISK
                  </div>
                  <div className="text-2xl font-black text-white">
                    22% <span className="text-red-500 text-sm ml-1">→ 38%</span>
                  </div>
                </div>
                <TrendingUp className="w-6 h-6 text-red-500 mb-1" />
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    90-DAY RISK
                  </div>
                  <div className="text-2xl font-black text-white">
                    41% <span className="text-red-500 text-sm ml-1">→ 67%</span>
                  </div>
                </div>
                <TrendingUp className="w-6 h-6 text-red-500 mb-1" />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-5 border border-white/5">
              <div className="text-xs text-muted-foreground mb-3 font-bold opacity-80">
                Triggers Detected
              </div>
              <ul className="flex flex-col gap-2">
                {[
                  "Hiring freeze detected",
                  "Revenue slowdown signals",
                  "Increased automation activity",
                ].map((trigger, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-sm font-medium text-white/80"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {trigger}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex justify-between items-center px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_var(--amber)]" />
                <span className="text-xs text-muted-foreground opacity-80">
                  Confidence: 72%
                </span>
              </div>
              <div className="text-xs opacity-30">HP-ORACLE-V4.2</div>
            </div>
          </Card>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -left-4 bg-black/60 backdrop-blur-lg p-4 rounded-xl border border-white/10 shadow-xl z-20"
          >
            <Zap className="w-5 h-5 text-[var(--cyan)]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
