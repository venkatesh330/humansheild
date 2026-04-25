import React, { Suspense, lazy, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import { HybridResult } from "../../types/hybridResult";
import { CompanyData } from "../../data/companyDatabase";
import { GlobalErrorBoundary } from "../GlobalErrorBoundary";

// Lazy-loaded tab modules for performance
const OverviewTab = lazy(() => import("../AuditTabs/OverviewTab"));
const RiskBreakdownTab = lazy(() => import("../AuditTabs/RiskBreakdownTab"));
const CompanyProfileTab = lazy(() => import("../AuditTabs/CompanyProfileTab"));
const CareerSkillsTab = lazy(() => import("../AuditTabs/CareerSkillsTab"));
const ActionPlanTab = lazy(() => import("../AuditTabs/ActionPlanTab"));
const TransparencyTab = lazy(() => import("../AuditTabs/TransparencyTab"));

interface Props {
  result: HybridResult;
  companyData: CompanyData;
  onRetake: () => void;
  onDownload?: () => void;
}

const TabTrigger: React.FC<{ value: string; label: string; icon: string }> = ({
  value,
  label,
  icon,
}) => (
  <Tabs.Trigger
    value={value}
    className="relative px-6 py-4 flex items-center gap-2 text-sm font-semibold tracking-wide transition-all
               text-white/40 hover:text-white/80 data-[state=active]:text-[var(--cyan)] group outline-none whitespace-nowrap"
    style={{
      transitionDuration: 'var(--dur-base)',
      transitionTimingFunction: 'var(--ease-out)',
    }}
  >
    <span className="text-lg opacity-60 group-data-[state=active]:opacity-100 transition-opacity">{icon}</span>
    <span className="font-display uppercase tracking-widest text-[10px] sm:text-xs">{label}</span>
    
    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--cyan)] scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100 group-data-[state=active]:shadow-[0_0_12px_var(--cyan)]" />
  </Tabs.Trigger>
);

export const LayoffAuditDashboard: React.FC<Props> = ({
  result,
  companyData,
  onRetake,
  onDownload,
}) => {
  const [communityShare, setCommunityShare] = useState<boolean>(() => {
    try { return localStorage.getItem('hp_community_share') === '1'; } catch { return false; }
  });

  const handleCommunityToggle = () => {
    const next = !communityShare;
    setCommunityShare(next);
    try { localStorage.setItem('hp_community_share', next ? '1' : '0'); } catch { /* ignore */ }
  };
  return (
    <div className="w-full max-w-7xl mx-auto pb-[var(--space-16)]" style={{ padding: '0 var(--space-6)' }}>
      <Tabs.Root defaultValue="overview" className="flex flex-col">
        {/* Navigation Bar — Sticky Pill with Fade Mask */}
        <div className="sticky top-[var(--space-4)] z-50 mb-[var(--space-8)]">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[var(--bg)] to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--bg)] to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="bg-[var(--bg-raised)]/90 backdrop-blur-2xl border border-[var(--border-2)] rounded-full px-[var(--space-2)] overflow-x-auto no-scrollbar shadow-2xl transition-all hover:border-[var(--border-cyan)]">
              <Tabs.List className="flex items-center min-w-max">
                <TabTrigger value="overview" label="Overview" icon="📊" />
                <TabTrigger value="risk_breakdown" label="Risk Breakdown" icon="🎯" />
                <TabTrigger value="company_profile" label="Company Profile" icon="🏢" />
                <TabTrigger value="career_skills" label="Career & Skills" icon="⚡" />
                <TabTrigger value="action_plan" label="Action Plan" icon="📝" />
                <TabTrigger value="transparency" label="Transparency" icon="◎" />
              </Tabs.List>
            </div>
          </div>
        </div>

        {/* Tab Contents — standardized layout container */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-[var(--space-16)]">
                  <div className="w-10 h-10 rounded-full border-2 border-[var(--cyan)]/10 border-t-[var(--cyan)] animate-spin mb-[var(--space-6)]" />
                  <p className="label-xs text-[var(--cyan)]/50 tracking-[0.3em]">
                    DECRYPTING INTELLIGENCE...
                  </p>
                </div>
              }
            >
              <Tabs.Content value="overview">
                <GlobalErrorBoundary>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                    <OverviewTab result={result} companyData={companyData} onRecalculate={onRetake} onDownload={onDownload} />
                  </motion.div>
                </GlobalErrorBoundary>
              </Tabs.Content>

              <Tabs.Content value="risk_breakdown">
                <GlobalErrorBoundary>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                    <RiskBreakdownTab result={result} companyData={companyData} />
                  </motion.div>
                </GlobalErrorBoundary>
              </Tabs.Content>

              <Tabs.Content value="company_profile">
                <GlobalErrorBoundary>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                    <CompanyProfileTab result={result} companyData={companyData} />
                  </motion.div>
                </GlobalErrorBoundary>
              </Tabs.Content>

              <Tabs.Content value="career_skills">
                <GlobalErrorBoundary>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                    <CareerSkillsTab result={result} companyData={companyData} />
                  </motion.div>
                </GlobalErrorBoundary>
              </Tabs.Content>

              <Tabs.Content value="action_plan">
                <GlobalErrorBoundary>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                    <ActionPlanTab result={result} companyData={companyData} />
                  </motion.div>
                </GlobalErrorBoundary>
              </Tabs.Content>

              <Tabs.Content value="transparency">
                <GlobalErrorBoundary>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                    <TransparencyTab result={result} companyData={companyData} />
                  </motion.div>
                </GlobalErrorBoundary>
              </Tabs.Content>
            </Suspense>
          </AnimatePresence>
        </div>

        {/* Global Footer Controls — Oracle Branding */}
        <div className="mt-[var(--space-16)] flex flex-col items-center gap-[var(--space-4)]">
          {/* Community intelligence opt-in */}
          <div className="w-full max-w-lg rounded-xl border border-white/8 bg-white/3 px-4 py-3 flex items-center gap-3">
            <button
              onClick={handleCommunityToggle}
              aria-label="Toggle community share"
              className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors duration-200 ${communityShare ? 'bg-cyan-500' : 'bg-white/10'}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${communityShare ? 'translate-x-4' : 'translate-x-0.5'}`}
              />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-white/70 leading-snug">
                Contribute anonymous score to community benchmarks
              </p>
              <p className="text-[10px] text-white/35 mt-0.5">
                {communityShare
                  ? 'Your score is included in the AI Risk Intelligence aggregate. No personal data is shared.'
                  : 'Help build accurate industry benchmarks — opt in to share your anonymous risk score.'}
              </p>
            </div>
          </div>

           <div className="h-px w-24 bg-gradient-to-r from-transparent via-[var(--border-2)] to-transparent" />
           <button
             onClick={onRetake}
             className="btn btn-secondary border-none text-[var(--text-3)] hover:text-[var(--text)] transition-colors text-[10px] font-mono tracking-widest uppercase"
           >
             [ TERMINATE SESSION & RESTART AUDIT ]
           </button>
        </div>
      </Tabs.Root>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
