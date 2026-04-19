import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FinalCTASectionProps {
  onCheckRisk: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({
  onCheckRisk,
}) => {
  return (
    <section className="py-24 px-6 bg-black relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] max-h-[800px] bg-[var(--cyan)]/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-4xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs mb-12 leading-none font-bold">
            Early warning systems online
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-10 leading-tight tracking-tight">
            Don't wait <br />
            <span className="text-muted-foreground outline-text font-black">
              to find out.
            </span>
          </h2>

          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto mb-16 leading-relaxed font-bold tracking-tight">
            Know before it happens. Early signals change everything.
          </p>

          <div className="flex flex-col items-center gap-6">
            <Button
              onClick={onCheckRisk}
              size="lg"
              className="bg-[var(--cyan)] hover:bg-[var(--cyan)]/90 text-black font-black px-12 shadow-[0_0_40px_rgba(0,240,255,0.3)] hover:shadow-[0_0_60px_rgba(0,240,255,0.4)] transition-all cta-breathe scale-110"
            >
              Check My Risk Now
              <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="flex flex-wrap justify-center gap-6 items-center text-xs opacity-40 leading-none font-black uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--emerald)]" />
                Verified Insights
              </div>
              <div className="hidden md:block w-px h-3 bg-white/20" />
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[var(--cyan)]" />
                Live Monitoring
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-12 left-0 w-full text-center">
        <div className="text-xs text-muted-foreground opacity-20 uppercase tracking-[1em] font-black leading-none">
          HumanProof Oracle
        </div>
      </div>
    </section>
  );
};
