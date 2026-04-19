import React from "react";
import { motion } from "framer-motion";
import { Activity, Clock, MousePointer2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const DATA_POINTS = [25, 22, 28, 45, 42, 38, 55, 68, 62, 75, 78, 85];

export const RealTimeTrackingSection: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-[var(--bg)] relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--cyan)]/10 border border-[var(--cyan)]/20 text-[var(--cyan)] text-xs mb-8 leading-none font-bold">
              <Clock className="w-3 h-3" />
              CONTINUOUS MONITORING
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight">
              Your career, <br />
              <span className="gradient-text-cyan">tracked continuously.</span>
            </h2>

            <p className="text-xl text-muted-foreground leading-relaxed font-medium mb-12 max-w-xl">
              If your risk changes, you'll know instantly. Risk doesn't stay the
              same. This system tracks it as it evolves.
            </p>

            <div className="flex flex-col gap-6">
              {[
                {
                  label: "Weekly risk trend line",
                  desc: "Live aggregation of market & company delta.",
                },
                {
                  label: "Highlighted spikes",
                  desc: "Automatic identification of escalation events.",
                },
                {
                  label: "Signal triggers marked",
                  desc: "Correlate risk changes to specific real-world events.",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[var(--cyan)] shadow-[0_0_8px_var(--cyan)]" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white leading-tight">
                      {item.label}
                    </div>
                    <div className="text-sm text-muted-foreground opacity-60">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-white/3 rounded-xl border border-white/5 inline-block">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-[var(--cyan)] animate-pulse" />
                <span className="text-xs text-white opacity-80 leading-none font-black">
                  HP-REALTIME-FEED: ACTIVE
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <Card className="p-6 md:p-10 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden aspect-video flex flex-col bg-black/40 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-10">
                <div className="text-xs text-muted-foreground opacity-60 font-black uppercase tracking-[0.2em] leading-none">
                  Risk Index Trend (90-Day)
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                </div>
              </div>

              <div className="flex-1 relative">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 400 200"
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={40 * i}
                      x2="400"
                      y2={40 * i}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="1"
                    />
                  ))}

                  <motion.path
                    d={`M ${DATA_POINTS.map((y, i) => `${i * (400 / 11)},${200 - y * 1.8}`).join(" L ")}`}
                    fill="none"
                    stroke="var(--cyan)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    style={{ filter: "drop-shadow(0 0 8px var(--cyan)88)" }}
                  />

                  <motion.path
                    d={`M 0,200 L ${DATA_POINTS.map((y, i) => `${i * (400 / 11)},${200 - y * 1.8}`).join(" L ")} L 400,200 Z`}
                    fill="url(#graphGradient)"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />

                  <defs>
                    <linearGradient
                      id="graphGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--cyan)"
                        stopOpacity="0.2"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--cyan)"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <motion.g
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 2.2, type: "spring" }}
                  >
                    <circle
                      cx={(400 * 10) / 11}
                      cy={200 - 85 * 1.8}
                      r="6"
                      fill="red"
                    />
                    <circle
                      cx={(400 * 10) / 11}
                      cy={200 - 85 * 1.8}
                      r="12"
                      fill="none"
                      stroke="red"
                      strokeWidth="2"
                      className="animate-ping"
                    />
                  </motion.g>
                </svg>

                <div className="absolute top-0 right-0 p-4 transform translate-x-1/2 -translate-y-1/2 hidden md:block">
                  <div className="bg-black/80 backdrop-blur-md p-3 rounded-xl border border-red-500/30 text-red-500 shadow-2xl">
                    <div className="text-xs text-red-500 opacity-80 font-black mb-1 uppercase tracking-wider">
                      Critical Signal
                    </div>
                    <div className="text-xs font-bold leading-tight">
                      Hiring Freeze <br />
                      Detected
                    </div>
                  </div>
                </div>

                <div className="absolute left-[20%] top-[60%] hidden md:block">
                  <div className="bg-white/5 backdrop-blur-md p-3 rounded-lg border border-white/10 opacity-60 shadow-xl">
                    <div className="text-[8px] font-black mb-1 uppercase tracking-wider">
                      Baseline
                    </div>
                    <div className="text-xs font-bold leading-none text-white">
                      Stable Ops
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-10 text-xs opacity-30 leading-none">
                <span>Week 01</span>
                <span>Week 04</span>
                <span>Week 08</span>
                <span>Current</span>
              </div>
            </Card>

            <div className="mt-8 flex justify-between px-6">
              <div className="flex items-center gap-2 text-xs opacity-60 leading-none font-bold">
                <MousePointer2 className="w-3 h-3" />
                Live Delta Monitoring
              </div>
              <div className="text-xs opacity-30 leading-none italic font-medium">
                Refreshed 2m ago
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
