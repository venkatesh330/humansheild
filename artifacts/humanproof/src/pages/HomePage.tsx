import { useState } from "react";
import { motion } from "framer-motion";
import { RoleSelectorModal } from "../components/RoleSelectorModal";

// Landing Components
import { HeroSection } from "../components/Landing/HeroSection";
import { ProblemReframeSection } from "../components/Landing/ProblemReframeSection";
import { SystemIntroductionSection } from "../components/Landing/SystemIntroductionSection";
import { OutputPreviewSection } from "../components/Landing/OutputPreviewSection";
import { RealTimeTrackingSection } from "../components/Landing/RealTimeTrackingSection";
import { DifferentiationSection } from "../components/Landing/DifferentiationSection";
import { ActionEngineSection } from "../components/Landing/ActionEngineSection";
import { SocialProofSection } from "../components/Landing/SocialProofSection";
import { PricingPreviewSection } from "../components/Landing/PricingPreviewSection";
import { FinalCTASection } from "../components/Landing/FinalCTASection";

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleSeeHowItWorks = () => {
    const section = document.getElementById("system-intro");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-black text-white selection:bg-[var(--cyan)]/30 selection:text-[var(--cyan)]">
      {/* HERO SECTION */}
      <HeroSection
        onCheckRisk={handleOpenModal}
        onSeeHowItWorks={handleSeeHowItWorks}
      />

      {/* PROBLEM REFRAME SECTION */}
      <ProblemReframeSection />

      {/* SYSTEM INTRODUCTION SECTION */}
      <div id="system-intro">
        <SystemIntroductionSection />
      </div>

      {/* OUTPUT PREVIEW SECTION */}
      <OutputPreviewSection />

      {/* REAL-TIME TRACKING SECTION */}
      <RealTimeTrackingSection />

      {/* DIFFERENTIATION SECTION */}
      <DifferentiationSection />

      {/* ACTION ENGINE SECTION */}
      <ActionEngineSection />

      {/* SOCIAL PROOF SECTION */}
      <SocialProofSection />

      {/* ENGAGEMENT HOOK SECTION */}
      <section className="py-24 px-6 bg-black text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent" />
        </div>
        <div className="container relative z-10 mx-auto max-w-4xl">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-black mb-8 tracking-tight text-white"
          >
            Risk doesn't stay the same.
          </motion.h3>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            It shifts with your company, your role, and the market. <br />
            <span className="text-white">
              Stay ahead by tracking it continuously.
            </span>
          </p>
        </div>
      </section>

      {/* PRICING PREVIEW SECTION */}
      <PricingPreviewSection />

      {/* FINAL CTA SECTION */}
      <FinalCTASection onCheckRisk={handleOpenModal} />

      {/* FOOTER */}
      <footer className="py-16 border-t border-white/5 text-center bg-black">
        <div className="container mx-auto max-w-4xl">
          <p className="text-xs text-muted-foreground opacity-20 mb-4 uppercase tracking-[0.5em] font-black">
            HumanProof Intelligence Protocol v4.0
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed opacity-60">
            We don't just show your risk. We track it, predict it, and help you
            act before it changes everything.
          </p>
        </div>
      </footer>

      <RoleSelectorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
