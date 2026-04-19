import React from "react";
import { motion } from "framer-motion";

export const ProblemReframeSection: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-black relative overflow-hidden">
      <div className="texture-grain absolute inset-0 opacity-[0.03] pointer-events-none" />

      <div className="container max-w-6xl mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-10 leading-tight tracking-tight"
          >
            Most people don't see risk <br />
            <span className="text-muted-foreground">until it's too late.</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium">
              Layoffs don't happen suddenly. <br />
              They build quietly through signals <br />
              <span className="text-white">most people never notice.</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6 py-8">
              {["Hiring freezes.", "Budget cuts.", "Role restructuring."].map(
                (signal, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="text-lg md:text-xl font-mono text-[var(--cyan)] border border-[var(--cyan)]/20 px-6 py-3 rounded-xl bg-[var(--cyan)]/5"
                  >
                    {signal}
                  </motion.div>
                ),
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-2xl md:text-3xl font-black text-white px-4"
            >
              By the time it becomes visible, <br />
              <span className="text-red-500 underline decoration-2 underline-offset-8">
                the decision is already made.
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-30" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-30" />
    </section>
  );
};
