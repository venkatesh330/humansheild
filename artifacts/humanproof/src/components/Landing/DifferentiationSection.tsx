import React from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { Card } from "@/components/ui/card";

const COMPARISON_DATA = [
  {
    feature: "Monitoring Frequency",
    traditional: "One-time analysis",
    system: "Continuous monitoring",
  },
  {
    feature: "Data Precision",
    traditional: "Static insights",
    system: "Real-time updates",
  },
  {
    feature: "Trajectory Analysis",
    traditional: "No tracking",
    system: "Predictive timelines",
  },
  {
    feature: "Decision Support",
    traditional: "No timing clarity",
    system: "Actionable insights",
  },
];

export const DifferentiationSection: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-black">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight"
          >
            Built for <br />
            <span className="text-muted-foreground">real-world decisions.</span>
          </motion.h2>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-0 bg-black/40 backdrop-blur-xl">
            <div className="grid grid-cols-3 bg-white/5 border-b border-white/10">
              <div className="p-6 md:p-6 text-xs text-muted-foreground uppercase tracking-widest font-black opacity-60">
                Standard Feature
              </div>
              <div className="p-6 md:p-6 text-xs text-muted-foreground text-center uppercase tracking-widest font-black opacity-60">
                Traditional Approach
              </div>
              <div className="p-6 md:p-6 text-xs text-[var(--cyan)] text-center bg-[var(--cyan)]/5 uppercase tracking-widest font-black">
                This System
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {COMPARISON_DATA.map((row, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="grid grid-cols-3 group hover:bg-white/[0.02] transition-colors"
                >
                  <div className="p-6 md:p-6 text-base md:text-lg font-bold text-white flex items-center tracking-tight leading-tight">
                    {row.feature}
                  </div>
                  <div className="p-6 md:p-6 text-muted-foreground text-center flex flex-col items-center justify-center gap-3">
                    <X className="w-5 h-5 opacity-20" />
                    <span className="text-sm font-medium opacity-60">
                      {row.traditional}
                    </span>
                  </div>
                  <div className="p-6 md:p-6 text-white text-center flex flex-col items-center justify-center gap-3 bg-[var(--cyan)]/5 border-x border-transparent group-hover:border-[var(--cyan)]/10 transition-colors">
                    <Check className="w-5 h-5 text-[var(--cyan)]" />
                    <span className="text-sm font-black tracking-tight">
                      {row.system}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-6 md:p-10 bg-[var(--cyan)]/10 border-t border-[var(--cyan)]/20 text-center">
              <div className="text-xl md:text-2xl font-black tracking-tight text-white leading-none">
                Not just insight —{" "}
                <span className="text-[var(--cyan)] italic">
                  timing that matters.
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
