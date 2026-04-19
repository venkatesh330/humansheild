import React from "react";
import { motion } from "framer-motion";
import { Globe, Users, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const INSTITUTIONS = [
  "STANFORD AI",
  "MIT MEDIA LAB",
  "OXFORD INSIGHT",
  "ETH ZÜRICH",
  "CARNEGIE MELLON",
];

const STATS = [
  { label: "Assessments Generated", value: "Thousands", icon: Globe },
  { label: "Industries Monitored", value: "Multiple", icon: Users },
  { label: "Data Integrity", value: "Real-Time", icon: ShieldCheck },
];

export const SocialProofSection: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-black relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight"
          >
            Used to track <br />
            <span className="text-muted-foreground">
              real-world career risk signals.
            </span>
          </motion.h2>
        </div>

        <div className="flex flex-wrap justify-center gap-x-12 md:gap-x-16 gap-y-8 md:gap-y-12 mb-16 opacity-20 grayscale hover:grayscale-0 transition-all duration-700">
          {INSTITUTIONS.map((inst, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-lg md:text-2xl font-black tracking-tighter italic"
            >
              {inst}
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <Card className="h-full p-6 md:p-10 rounded-2xl border border-white/5 text-center flex flex-col items-center hover-lift bg-black/40 backdrop-blur-xl">
                <stat.icon className="w-8 h-8 text-[var(--cyan)] mb-6 opacity-60" />
                <div className="text-4xl font-black mb-3 tracking-tighter text-white leading-none">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                  {stat.label}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-white/5 backdrop-blur-md px-6 md:px-8 py-4 rounded-full border border-white/10 flex flex-col md:flex-row items-center gap-4 md:gap-6 shadow-xl">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-black bg-neutral-800 flex items-center justify-center overflow-hidden"
                >
                  <span className="text-[10px] text-white/40">U{i}</span>
                </div>
              ))}
            </div>
            <div className="h-4 w-px bg-white/20 hidden md:block" />
            <div className="text-sm font-medium text-white/80 italic text-center md:text-left leading-relaxed">
              "The most accurate career audit I've seen in 2026." —{" "}
              <span className="text-white font-black not-italic ml-1">
                Sarah J.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
