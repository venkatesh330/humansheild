import React from "react";
import { motion } from "framer-motion";
import { Search, Shield, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

const MONITORING_FEATURES = [
  {
    title: "Company Monitoring",
    description:
      "Tracks real-time signals from your company: Financial stress indicators, hiring slowdowns, layoff patterns, and strategic shifts.",
    icon: Search,
    color: "var(--cyan)",
    bullets: [
      "Financial stress indicators",
      "Hiring slowdowns",
      "Layoff patterns",
      "Strategic shifts",
    ],
  },
  {
    title: "Role Risk Analysis",
    description:
      "Evaluates how your role is evolving in the AI era. Focuses on displacement trajectory and skills demand.",
    icon: Shield,
    color: "#a855f7",
    bullets: [
      "Automation exposure",
      "Skill demand shifts",
      "Industry-level disruption",
    ],
  },
  {
    title: "Personal Risk Layer",
    description:
      "Understands your specific position within the organizational matrix for precise risk calibration.",
    icon: Users,
    color: "#10b981",
    bullets: ["Experience depth", "Replaceability", "Role criticality"],
  },
];

export const SystemIntroductionSection: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-[var(--bg)]">
      <div className="container mx-auto max-w-6xl">
        <div className="max-w-3xl mb-12">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight"
          >
            A system designed <br />
            <span className="gradient-text-cyan">to detect risk early.</span>
          </motion.h2>
          <p className="text-xl text-muted-foreground font-medium">
            Not just analysis — continuous monitoring and prediction.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          {MONITORING_FEATURES.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <Card className="h-full p-6 flex flex-col hover-lift border-white/5 hover:border-[var(--cyan)]/30 bg-black/40 backdrop-blur-xl rounded-2xl">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: `${feature.color}15`,
                    color: feature.color,
                  }}
                >
                  <feature.icon size={28} />
                </div>
                <h3 className="text-2xl font-black mb-4 text-white">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  {feature.description}
                </p>
                <ul className="flex flex-col gap-4">
                  {feature.bullets.map((bullet, bidx) => (
                    <li
                      key={bidx}
                      className="flex items-center gap-3 text-sm font-medium text-white/70"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: feature.color }}
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--cyan)]/10 to-purple-600/10 blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity" />
          <Card className="relative p-10 md:p-12 rounded-2xl border border-white/10 flex flex-col items-center text-center max-w-4xl mx-auto overflow-hidden bg-black/60 backdrop-blur-2xl">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent opacity-50" />

            <div className="text-xs text-muted-foreground uppercase tracking-[0.3em] font-black mb-12 opacity-60">
              Prediction Engine Protocol
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-12 w-full mb-12">
              <div className="bg-white/5 p-6 rounded-xl border border-white/5 text-left">
                <div className="text-xs text-emerald-500 mb-2 font-bold opacity-80">
                  30-day risk
                </div>
                <div className="text-5xl font-black text-emerald-500 tracking-tighter">
                  LOW
                </div>
                <div className="mt-4 h-1.5 w-full bg-emerald-500/10 rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-emerald-500" />
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-xl border border-white/5 text-left">
                <div className="text-xs text-red-500 mb-2 font-bold opacity-80">
                  90-day risk
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-5xl font-black text-red-500 tracking-tighter">
                    HIGH
                  </div>
                  <TrendingUp className="text-red-500 w-8 h-8" />
                </div>
                <div className="mt-4 h-1.5 w-full bg-red-500/10 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-red-500" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:gap-12 items-center">
              <div className="flex flex-col items-center">
                <div className="text-xs text-muted-foreground mb-1 opacity-60">
                  Trend
                </div>
                <div className="text-xl font-black tracking-tight text-red-500 uppercase">
                  Increasing
                </div>
              </div>
              <div className="w-px h-8 bg-white/10 hidden md:block" />
              <div className="flex flex-col items-center">
                <div className="text-xs text-muted-foreground mb-1 opacity-60">
                  Confidence
                </div>
                <div className="text-xl font-black tracking-tight text-white uppercase">
                  74%
                </div>
              </div>
              <div className="w-px h-8 bg-white/10 hidden md:block" />
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-amber-500 font-bold">
                  Anomalies Detected
                </span>
              </div>
            </div>

            <p className="mt-12 text-sm text-muted-foreground italic opacity-40">
              Risk isn't static — it evolves over time.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
