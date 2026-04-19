import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

const EXAMPLE_INSIGHTS = [
  {
    type: "risk",
    status: "Priority Alert",
    items: [
      "Your risk increased 14% this week",
      "Early-stage restructuring signals detected",
      "Your role shows medium automation exposure",
    ],
    action: "Prepare transition within 30–45 days",
    accent: "text-red-500",
    bg: "rgba(239, 68, 68, 0.05)",
    border: "rgba(239, 68, 68, 0.2)",
  },
  {
    type: "stable",
    status: "Stable Context",
    items: [
      "Stable company signals this week",
      "Role demand remains strong",
      "No negative indicators detected",
    ],
    action: "Low short-term risk",
    accent: "text-[var(--emerald)]",
    bg: "rgba(16, 185, 129, 0.05)",
    border: "rgba(16, 185, 129, 0.2)",
  },
];

export const OutputPreviewSection: React.FC = () => {
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
            From uncertainty <br />
            <span className="text-muted-foreground">
              to clarity in seconds.
            </span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-12 max-w-6xl mx-auto">
          {EXAMPLE_INSIGHTS.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="group"
            >
              <Card
                className="h-full p-6 md:p-10 rounded-2xl border relative overflow-hidden bg-black/40 backdrop-blur-xl hover-lift"
                style={{
                  backgroundColor: insight.bg,
                  borderColor: insight.border,
                }}
              >
                <div className="flex justify-between items-center mb-10">
                  <div
                    className={`text-xs font-black uppercase tracking-[0.2em] ${insight.accent}`}
                  >
                    {insight.status}
                  </div>
                  {insight.type === "risk" ? (
                    <TrendingUp className={`w-6 h-6 ${insight.accent}`} />
                  ) : (
                    <ShieldCheck className={`w-6 h-6 ${insight.accent}`} />
                  )}
                </div>

                <div className="flex flex-col gap-6 mb-12">
                  {insight.items.map((item, iidx) => (
                    <div key={iidx} className="flex items-start gap-4">
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 mt-0.5 ${insight.accent}`}
                      />
                      <span className="text-xl font-bold tracking-tight text-white leading-tight">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-10 border-t border-white/10">
                  <div className="text-xs text-muted-foreground uppercase mb-4 font-bold opacity-60">
                    {insight.type === "risk" ? "Recommended Action" : "Status"}
                  </div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`text-2xl font-black tracking-tight ${insight.type === "risk" ? "text-white" : insight.accent}`}
                    >
                      {insight.type === "risk" && "→ "}
                      {insight.action}
                    </div>
                    {insight.type === "risk" && (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`absolute -bottom-10 -right-10 w-40 h-40 blur-[80px] rounded-full opacity-20 pointer-events-none ${insight.type === "risk" ? "bg-red-500" : "bg-emerald-500"}`}
                />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
