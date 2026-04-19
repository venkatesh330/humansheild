import React from "react";
import { motion } from "framer-motion";
import { Check, Zap, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PLAN_FEATURES = {
  free: [
    "Basic Risk Assessment",
    "Company Snapshot",
    "Role Baseline Analysis",
    "Action Summary",
  ],
  advanced: [
    "Continuous Live Tracking",
    "30/90-Day Risk Forecasts",
    "Predictive Signal Alerts",
    "Detailed Action Protocols",
    "Sector Drill-down Data",
  ],
};

export const PricingPreviewSection: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-[var(--bg)]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight"
          >
            Start free. <br />
            <span className="text-muted-foreground">
              Upgrade when it matters.
            </span>
          </motion.h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Basic insights are free. Advanced tracking and alerts unlock deeper
            intelligence for critical career safety.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group"
          >
            <Card className="h-full p-6 md:p-10 rounded-2xl border border-white/5 flex flex-col bg-black/40 backdrop-blur-xl hover-lift">
              <div className="text-xs text-muted-foreground uppercase tracking-[0.3em] font-black mb-8 opacity-60">
                Base Tier Monitoring
              </div>
              <div className="text-4xl font-black mb-10 text-white tracking-tight">
                $0{" "}
                <span className="text-sm font-normal text-muted-foreground opacity-60 tracking-normal">
                  / forever
                </span>
              </div>

              <ul className="flex flex-col gap-5 mb-12 flex-1">
                {PLAN_FEATURES.free.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-sm font-bold text-white/70"
                  >
                    <Check className="w-4 h-4 text-white/20 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button variant="outline" size="lg" className="w-full group">
                Check My Risk Free
                <Check className="w-4 h-4 ml-2 opacity-40 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group"
          >
            <Card className="h-full p-6 md:p-10 rounded-2xl border-[var(--cyan)]/30 ring-1 ring-[var(--cyan)]/20 relative flex flex-col overflow-hidden bg-[var(--cyan)]/[0.04] backdrop-blur-xl hover-lift">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--cyan)]/10 blur-[60px] rounded-full -mr-16 -mt-16" />

              <div className="flex justify-between items-center mb-8">
                <div className="text-xs text-[var(--cyan)] uppercase tracking-[0.3em] font-black">
                  Advanced Intelligence
                </div>
                <div className="px-2 py-0.5 rounded-sm bg-[var(--cyan)] text-[8px] font-black text-black uppercase tracking-widest leading-none">
                  Recommended
                </div>
              </div>

              <div className="text-4xl font-black mb-10 text-white tracking-tight">
                $19{" "}
                <span className="text-sm font-normal text-muted-foreground opacity-60 tracking-normal">
                  / month
                </span>
              </div>

              <ul className="flex flex-col gap-5 mb-12 flex-1">
                {PLAN_FEATURES.advanced.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-sm font-black text-white"
                  >
                    <Zap className="w-4 h-4 text-[var(--cyan)] fill-[var(--cyan)] shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="w-full bg-[var(--cyan)] hover:bg-[var(--cyan)]/90 text-black font-black shadow-[0_0_24px_rgba(0,212,224,0.25)] group"
              >
                Unlock Deep Tracking
                <Zap className="w-4 h-4 ml-2 group-hover:scale-125 transition-transform" />
              </Button>
            </Card>
          </motion.div>
        </div>

        <div className="mt-16 flex justify-center">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/5 text-xs text-muted-foreground opacity-60">
            <Info className="w-4 h-4" />
            No credit card required for initial risk assessment.
          </div>
        </div>
      </div>
    </section>
  );
};
