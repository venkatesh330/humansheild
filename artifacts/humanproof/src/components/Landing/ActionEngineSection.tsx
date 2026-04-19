import React from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const EXAMPLE_ACTIONS = [
  {
    title: "Start exploring new opportunities within 21 days",
    why: ["Risk acceleration detected", "Company entering cost-control phase"],
    priority: "HIGH",
    accent: "text-red-500",
    bg: "rgba(239, 68, 68, 0.05)",
    border: "rgba(239, 68, 68, 0.2)",
  },
  {
    title: "Upskill in automation-resistant areas",
    why: ["Role exposure increasing", "Industry shift detected"],
    priority: "MEDIUM",
    accent: "text-amber-500",
    bg: "rgba(245, 158, 11, 0.05)",
    border: "rgba(245, 158, 11, 0.2)",
  },
];

export const ActionEngineSection: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-[var(--bg)]">
      <div className="container mx-auto max-w-6xl">
        <div className="max-w-3xl mb-12">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight"
          >
            Know what <br />
            <span className="gradient-text-cyan">to do next.</span>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 max-w-6xl">
          {EXAMPLE_ACTIONS.map((action, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className="group"
            >
              <Card
                className="h-full p-6 md:p-10 rounded-2xl border relative overflow-hidden bg-black/40 backdrop-blur-xl hover-lift"
                style={{
                  backgroundColor: action.bg,
                  borderColor: action.border,
                }}
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    <Zap className={`w-7 h-7 ${action.accent}`} />
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs border font-black tracking-widest leading-none ${action.accent}`}
                    style={{ borderColor: action.border }}
                  >
                    {action.priority} PRIORITY
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-black mb-8 leading-tight text-white group-hover:text-[var(--cyan)] transition-colors tracking-tight">
                  {action.title}
                </h3>

                <div className="flex flex-col gap-6">
                  <div>
                    <div className="text-xs text-muted-foreground mb-4 font-bold opacity-60">
                      Insight Chain:
                    </div>
                    <ul className="flex flex-col gap-3">
                      {action.why.map((reason, ridx) => (
                        <li
                          key={ridx}
                          className="flex items-center gap-3 text-base font-bold text-white/90"
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${action.accent === "text-red-500" ? "bg-red-500 shadow-[0_0_8px_var(--red)]" : "bg-amber-500 shadow-[0_0_8px_var(--amber)]"}`}
                          />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-auto pt-10 flex items-center gap-2 text-xs text-muted-foreground group-hover:text-white transition-colors cursor-pointer leading-none font-bold">
                  View Detailed Protocol
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>

                <div
                  className={`absolute -bottom-10 -right-10 w-40 h-40 blur-[80px] rounded-full opacity-10 pointer-events-none ${action.accent === "text-red-500" ? "bg-red-500" : "bg-amber-500"}`}
                />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
