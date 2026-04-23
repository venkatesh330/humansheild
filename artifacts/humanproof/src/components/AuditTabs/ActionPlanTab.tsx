// ActionPlanTab.tsx
// Actionable recommendations — Answers "What should I do about it?"
// Displays: Dynamic personalized action plan, progress tracking, career twin matches,
//           strategic resources with real links, and role-specific course recommendations.

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Circle, Filter, Download, Zap, ArrowRight,
  Search, BarChart, Shield, BookOpen, Users, TrendingUp,
  Clock, Target, Cpu, Brain, AlertTriangle, ChevronRight,
  Star, ExternalLink,
} from "lucide-react";
import { SectionHeader } from "./common/SectionHeader";
import { CareerTwinCard } from "@/components/CareerTwinCard";
import { getCareerIntelligence } from "@/data/intelligence";
import { useAdaptiveSystem } from "@/hooks/useAdaptiveSystem";
import type { TabProps } from "./common/types";
import type { ActionPlanItem } from "@/types/hybridResult";

// ---------------------------------------------------------------------------
// Role-aware recommendation generator
// Produces specific, non-generic action items based on role, score, and company context.
// ---------------------------------------------------------------------------

const ROLE_SPECIFIC_ACTIONS: Record<string, Partial<ActionPlanItem>[]> = {
  // Software / Tech
  sw: [
    { title: "Ship an AI-Assisted Project to Production", description: "Build and deploy a feature using GitHub Copilot, Cursor, or similar AI coding assistant. Document the productivity gain. This is now the baseline expectation for senior engineers.", layerFocus: "L3 · Role Displacement", riskReductionPct: 18 },
    { title: "Build a Personal AI Evaluation Framework", description: "Create a documented process for reviewing, testing, and quality-checking AI-generated code. Engineers who can validate AI outputs command 30–50% salary premiums.", layerFocus: "L3 · Role Displacement", riskReductionPct: 22 },
  ],
  fin: [
    { title: "Automate One Financial Model with Python/AI", description: "Replace a spreadsheet-based workflow with Python (pandas + OpenAI API). Document the time savings. FP&A teams that self-automate are retaining headcount while others shrink.", layerFocus: "L3 · Role Displacement", riskReductionPct: 20 },
    { title: "Earn an AI + Finance Certification", description: "Complete Wharton's 'AI for Finance' or CFI's 'Financial Modeling & AI' course. Credentials signal proactive adaptation and differentiate you in the next round cut.", layerFocus: "L3 · Role Displacement", riskReductionPct: 15 },
  ],
  hr: [
    { title: "Build a People Analytics Dashboard", description: "Use public tools (Tableau Public, Google Looker Studio) to build a retention or attrition prediction model from freely available workforce data. Demonstrates transition from admin to strategic HR.", layerFocus: "L3 · Role Displacement", riskReductionPct: 25 },
    { title: "Get Certified in AI-Augmented Recruiting", description: "Complete LinkedIn's 'AI in HR' or SHRM's AI upskilling program. AI-native recruiters close roles 40% faster and are insulated from ATS automation waves.", layerFocus: "L3 · Role Displacement", riskReductionPct: 18 },
  ],
  leg: [
    { title: "Master Contract AI Tools (Harvey, Lexis+)", description: "Get proficient in AI legal research and contract review tools. Legal professionals who can validate and supervise AI legal outputs will handle 3–5x more matters.", layerFocus: "L3 · Role Displacement", riskReductionPct: 22 },
    { title: "Specialize in AI Governance or Compliance Law", description: "EU AI Act and US AI regulation is creating urgent demand for lawyers who understand AI systems. A 40-hour certification in AI governance opens an uncrowded niche.", layerFocus: "L3 · Role Displacement", riskReductionPct: 28 },
  ],
  hc: [
    { title: "Get Certified in Clinical AI Tools", description: "Complete training on AI-assisted diagnostics platforms (Aidoc, Viz.ai, Tempus). Clinicians who work alongside AI systems are more productive and less vulnerable to scope reduction.", layerFocus: "L3 · Role Displacement", riskReductionPct: 15 },
    { title: "Build Expertise in AI-Human Care Protocols", description: "Develop and document protocols for integrating AI triage or diagnostic outputs into patient care workflows. Care coordination expertise is structurally irreplaceable.", layerFocus: "L3 · Role Displacement", riskReductionPct: 12 },
  ],
  cnt: [
    { title: "Build an AI-Augmented Content Portfolio", description: "Create a 5-piece portfolio demonstrating AI + human collaboration: use Claude/GPT for draft, add expert editorial layer, track audience metrics. This is the new baseline for content roles.", layerFocus: "L3 · Role Displacement", riskReductionPct: 20 },
    { title: "Specialize in AI Content Auditing", description: "Develop expertise in detecting, reviewing, and improving AI-generated content. Brands need human curators — not just human creators — and are willing to pay premiums.", layerFocus: "L3 · Role Displacement", riskReductionPct: 25 },
  ],
};

const getPrefix = (roleKey: string) => roleKey.split('_')[0];

function buildDynamicActions(
  result: TabProps["result"],
  companyName: string,
): ActionPlanItem[] {
  const score = result.total;
  const roleKey = result.workTypeKey;
  const prefix = getPrefix(roleKey);
  const intel = getCareerIntelligence(roleKey);
  const actions: ActionPlanItem[] = [];

  // 1. Score-based urgent action
  if (score >= 75) {
    actions.push({
      id: `dyn-urgent-${roleKey}`,
      title: `Initiate Role Transition Planning — ${Math.round(score)}% Displacement Risk`,
      description: `Your risk score of ${score}/100 puts you in the top quartile for AI displacement. Within 12–18 months, this role category will face structural reduction or significant scope change. Begin mapping an adjacent role transition now — the best time to start is 18 months before you need to.`,
      priority: "Critical",
      layerFocus: "L3 · Role Displacement",
      riskReductionPct: 30,
      deadline: "30 days — start research phase",
    });
  } else if (score >= 55) {
    actions.push({
      id: `dyn-strategic-${roleKey}`,
      title: `Start Strategic Upskilling — Moderate Exposure Detected`,
      description: `Your score of ${score}/100 indicates moderate displacement risk. You're in the "augmentation window" — AI will enhance rather than replace your role, but only if you actively develop AI-adjacent skills. Focus on the 1–2 skills that will most differentiate you in the next hiring cycle.`,
      priority: "High",
      layerFocus: "L3 · Role Displacement",
      riskReductionPct: 20,
      deadline: "60 days",
    });
  }

  // 2. Role-specific actions
  const roleActions = ROLE_SPECIFIC_ACTIONS[prefix] ?? [];
  for (const action of roleActions.slice(0, 2)) {
    actions.push({
      id: `role-${prefix}-${actions.length}`,
      priority: score >= 65 ? "High" : "Medium",
      deadline: score >= 75 ? "45 days" : "90 days",
      riskReductionPct: 15,
      ...action,
    } as ActionPlanItem);
  }

  // 3. Intelligence-based at-risk skill action
  const topAtRisk = intel?.skills?.at_risk?.[0];
  if (topAtRisk) {
    actions.push({
      id: `skill-atrisk-${topAtRisk.skill.replace(/\s/g, '-')}`,
      title: `Reduce Dependence on "${topAtRisk.skill}" (Risk: ${topAtRisk.riskScore}/100)`,
      description: `${topAtRisk.reason}. Transition to owning the strategy and validation layer for this skill rather than the execution layer. ${topAtRisk.aiTool ? `AI tools doing this today: ${topAtRisk.aiTool}.` : ""}`,
      priority: (topAtRisk.riskScore ?? 0) >= 80 ? "High" : "Medium",
      layerFocus: "L3 · Role Displacement",
      riskReductionPct: 18,
      deadline: "90 days",
    });
  }

  // 4. Safe skill deepening
  const topSafe = intel?.skills?.safe?.[0];
  if (topSafe) {
    actions.push({
      id: `skill-safe-${topSafe.skill.replace(/\s/g, '-')}`,
      title: `Deepen "${topSafe.skill}" — Your Primary Human Moat`,
      description: `${topSafe.whySafe}. This skill has a long-term value score of ${topSafe.longTermValue}/100. Invest in advanced application: seek visible projects, mentoring opportunities, or advisory roles that showcase this strength.`,
      priority: "Medium",
      layerFocus: "L1 · Financial Positioning",
      riskReductionPct: 12,
      deadline: "Ongoing — 30 min/day",
    });
  }

  // 5. Company-specific financial health action
  const financialRisk = result.breakdown?.L1 ?? 0;
  if (financialRisk > 0.65) {
    actions.push({
      id: `company-financial-${companyName.replace(/\s/g, '-')}`,
      title: `Update Emergency Fund — ${companyName} Financial Signals Elevated`,
      description: `Company financial health score: ${Math.round(financialRisk * 100)}/100. Industry-normalized analysis suggests elevated restructuring probability in the next 12 months. Ensure you have 6–9 months of expenses covered and your resume, LinkedIn, and portfolio are current.`,
      priority: financialRisk > 0.8 ? "Critical" : "High",
      layerFocus: "L1 · Financial Health",
      riskReductionPct: 10,
      deadline: "30 days",
    });
  }

  // 6. Layoff history action
  const layoffRisk = result.breakdown?.L2 ?? 0;
  if (layoffRisk > 0.6) {
    actions.push({
      id: `layoff-history-action`,
      title: "Activate Your Professional Network Proactively",
      description: `Layoff history signal is elevated (${Math.round(layoffRisk * 100)}/100). Reach out to 3 trusted colleagues or hiring managers this week — not to ask for jobs, but to reconnect. People hired in downturns overwhelmingly come from warm referrals, not cold applications.`,
      priority: "High",
      layerFocus: "L2 · Layoff History",
      riskReductionPct: 14,
      deadline: "7 days",
    });
  }

  // 7. Career Twin-based insight
  if (intel?.careerPaths?.length) {
    const topPath = intel.careerPaths[0];
    actions.push({
      id: `career-path-${topPath.role.replace(/\s/g, '-')}`,
      title: `Explore Adjacent Role: ${topPath.role}`,
      description: `This transition offers ${topPath.riskReduction}% risk reduction and ${topPath.salaryDelta} salary delta. Key skill gap: ${topPath.skillGap}. Typical transition time: ${topPath.timeToTransition}. Reach out to 2 people currently in this role on LinkedIn this week.`,
      priority: score >= 70 ? "High" : "Medium",
      layerFocus: "L3 · Role Displacement",
      riskReductionPct: topPath.riskReduction,
      deadline: topPath.timeToTransition,
    });
  }

  // Fallback: ensure at least 3 items
  if (actions.length < 3) {
    actions.push(
      {
        id: "fallback-portfolio",
        title: "Build an AI-Integrated Project Portfolio",
        description: "Create 2–3 visible work samples that demonstrate you can work alongside AI tools effectively. Hiring managers and promotion committees are now explicitly evaluating AI integration capability.",
        priority: "High",
        layerFocus: "L3 · Role Displacement",
        riskReductionPct: 20,
        deadline: "60 days",
      },
      {
        id: "fallback-linkedin",
        title: "Optimize LinkedIn for AI-Era Roles",
        description: "Update your LinkedIn headline and summary to include AI-adjacent skills. Add specific examples of AI tool usage to your experience descriptions. Recruiters increasingly search for 'AI' + your role keywords.",
        priority: "Medium",
        layerFocus: "L1 · Market Positioning",
        riskReductionPct: 10,
        deadline: "2 weeks",
      },
    );
  }

  // De-duplicate by id and sort by priority weight
  const seen = new Set<string>();
  const unique = actions.filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true; });

  const priorityWeight = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  return unique.sort((a, b) => (priorityWeight[a.priority] ?? 2) - (priorityWeight[b.priority] ?? 2));
}

// ---------------------------------------------------------------------------
// Course Resource Database — role-contextual learning links
// ---------------------------------------------------------------------------

const COURSE_RESOURCES: Record<string, { title: string; provider: string; url: string; free: boolean }[]> = {
  sw:  [
    { title: "GitHub Copilot Advanced Techniques", provider: "GitHub", url: "https://docs.github.com/en/copilot", free: true },
    { title: "AI-Powered Code Review Workflow", provider: "DeepLearning.AI", url: "https://www.deeplearning.ai/short-courses/", free: true },
    { title: "System Design with AI Components", provider: "Educative", url: "https://www.educative.io/", free: false },
  ],
  fin: [
    { title: "Python for Financial Analysis", provider: "Coursera / Michigan", url: "https://www.coursera.org/learn/python-statistics-financial-analysis", free: false },
    { title: "AI Tools for FP&A", provider: "CFI", url: "https://corporatefinanceinstitute.com/", free: false },
    { title: "Excel to Python Migration", provider: "DataCamp", url: "https://www.datacamp.com/", free: false },
  ],
  hr: [
    { title: "People Analytics (Google)", provider: "Coursera / Google", url: "https://www.coursera.org/learn/people-analytics", free: false },
    { title: "AI in HR Certificate", provider: "LinkedIn Learning", url: "https://www.linkedin.com/learning/", free: false },
    { title: "SHRM AI Upskilling Program", provider: "SHRM", url: "https://www.shrm.org/", free: false },
  ],
  leg: [
    { title: "AI and the Legal System", provider: "Harvard (edX)", url: "https://www.edx.org/", free: false },
    { title: "Contract AI Fundamentals (Harvey)", provider: "Harvey AI", url: "https://www.harvey.ai/", free: false },
    { title: "EU AI Act Compliance Certificate", provider: "IAPP", url: "https://iapp.org/", free: false },
  ],
  hc: [
    { title: "AI in Healthcare (Stanford)", provider: "Coursera / Stanford", url: "https://www.coursera.org/learn/ai-in-healthcare", free: false },
    { title: "Clinical AI Validation Methods", provider: "MIT (edX)", url: "https://www.edx.org/", free: false },
    { title: "Digital Health Leadership", provider: "ACHE", url: "https://www.ache.org/", free: false },
  ],
  cnt: [
    { title: "AI-Augmented Content Strategy", provider: "HubSpot Academy", url: "https://academy.hubspot.com/", free: true },
    { title: "Prompt Engineering for Writers", provider: "DeepLearning.AI", url: "https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/", free: true },
    { title: "Brand Story in the AI Era", provider: "Domestika", url: "https://www.domestika.org/", free: false },
  ],
  default: [
    { title: "AI for Everyone (Non-Technical)", provider: "Coursera / DeepLearning.AI", url: "https://www.coursera.org/learn/ai-for-everyone", free: false },
    { title: "AI Upskilling Fundamentals", provider: "Google", url: "https://grow.google/intl/en_us/guide-to-ai-upskilling/", free: true },
    { title: "ChatGPT Prompt Engineering", provider: "DeepLearning.AI", url: "https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/", free: true },
  ],
};

// ---------------------------------------------------------------------------
// ActionItem component
// ---------------------------------------------------------------------------

const PRIORITY_COLOR = {
  Critical: "var(--red)",
  High:     "var(--orange)",
  Medium:   "var(--amber)",
  Low:      "var(--cyan)",
};

interface ActionItemProps {
  item: ActionPlanItem;
  isCompleted: boolean;
  onToggle: () => void;
  index: number;
}

const ActionItem: React.FC<ActionItemProps> = ({ item, isCompleted, onToggle, index }) => {
  const color = PRIORITY_COLOR[item.priority as keyof typeof PRIORITY_COLOR] ?? "var(--cyan)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`action-item glass-panel group transition-all duration-300 hover:border-[var(--border-cyan)] rounded-xl overflow-hidden ${isCompleted ? "opacity-60" : ""}`}
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-start gap-4 p-5">
        <button
          onClick={onToggle}
          className="flex-shrink-0 mt-1 focus:outline-none group-hover:scale-110 transition-transform"
          aria-checked={isCompleted}
          role="checkbox"
        >
          {isCompleted
            ? <CheckCircle className="w-6 h-6 text-[var(--emerald)]" />
            : <Circle className="w-6 h-6 text-muted-foreground opacity-40" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap justify-between items-start mb-1 gap-2">
            <h4 className={`text-base font-black tracking-tight leading-snug ${isCompleted ? "line-through opacity-70" : ""}`}>
              {item.title}
            </h4>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div
                className="text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest border"
                style={{ backgroundColor: `${color}11`, color, borderColor: `${color}33` }}
              >
                {item.priority}
              </div>
              {item.riskReductionPct > 0 && (
                <div className="text-[9px] px-2 py-0.5 rounded font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  -{item.riskReductionPct}% RISK
                </div>
              )}
            </div>
          </div>

          <p className={`text-sm leading-relaxed text-muted-foreground mb-3 ${isCompleted ? "opacity-50" : ""}`}>
            {item.description}
          </p>

          <div className="flex flex-wrap gap-3 items-center text-[10px] font-mono tracking-wider text-muted-foreground/60">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5">
              <Target className="w-3 h-3" />
              {item.layerFocus}
            </div>
            {item.deadline && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5">
                <Clock className="w-3 h-3 text-[var(--amber)]" />
                {item.deadline}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// ProgressIndicator
// ---------------------------------------------------------------------------

const ProgressIndicator: React.FC<{ completed: number; total: number }> = ({ completed, total }) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const color = pct < 30 ? "var(--red)" : pct < 70 ? "var(--orange)" : "var(--emerald)";

  return (
    <div className="glass-panel-heavy p-[var(--space-6)] rounded-2xl min-w-[240px]">
      <div className="flex justify-between items-end mb-3">
        <div>
          <h4 className="label-xs text-muted-foreground mb-1 uppercase tracking-widest">Mission Progress</h4>
          <span className="text-3xl font-black tracking-tighter" style={{ color }}>{pct}%</span>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded">
          {completed}/{total} ACTIONS
        </div>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: "inherit", background: color, boxShadow: `0 0 10px ${color}66` }}
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Course Resource Card
// ---------------------------------------------------------------------------

const CourseResourceCard: React.FC<{ rolePrefix: string }> = ({ rolePrefix }) => {
  const courses = COURSE_RESOURCES[rolePrefix] ?? COURSE_RESOURCES.default;

  return (
    <div className="glass-panel p-5 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-cyan-400" />
        <h4 className="font-bold text-sm">Recommended Learning</h4>
        <span className="ml-auto text-[9px] font-black bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded">
          CURATED
        </span>
      </div>
      <div className="space-y-3">
        {courses.map((c, i) => (
          <a
            key={i}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 hover:border-[var(--border-cyan)] transition-all group"
          >
            <div className="p-1.5 rounded-lg bg-white/5 flex-shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold leading-tight group-hover:text-[var(--cyan)] transition-colors">{c.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{c.provider}</div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {c.free && (
                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black">
                  FREE
                </span>
              )}
              <ExternalLink className="w-3 h-3 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// ActionPlanTab main component
// ---------------------------------------------------------------------------

export const ActionPlanTab: React.FC<TabProps> = ({ result, companyData }) => {
  const { width } = useAdaptiveSystem();
  const rolePrefix = getPrefix(result.workTypeKey);

  // Merge server-side recs with dynamic role-specific ones
  const allRecommendations = useMemo(() => {
    const dynamic = buildDynamicActions(result, result.companyName ?? companyData?.name ?? "your company");
    const serverRecs = result.recommendations ?? [];
    // Merge: prefer dynamic, append non-duplicate server recs
    const dynamicIds = new Set(dynamic.map(d => d.id));
    const serverExtra = serverRecs.filter(r => !dynamicIds.has(r.id));
    return [...dynamic, ...serverExtra];
  }, [result, companyData]);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("actionPlanCompleted");
      if (saved) setCompletedItems(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("actionPlanCompleted", JSON.stringify(completedItems));
    } catch { /* ignore */ }
  }, [completedItems]);

  const filteredItems = useMemo(() =>
    allRecommendations.filter(item => {
      if (filter !== "all" && item.priority.toLowerCase() !== filter) return false;
      if (search && !item.title.toLowerCase().includes(search.toLowerCase()) &&
          !item.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }), [allRecommendations, filter, search]);

  const sortedItems = useMemo(() => {
    const pw: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return [...filteredItems].sort((a, b) => {
      const aC = completedItems[a.id] || false;
      const bC = completedItems[b.id] || false;
      if (aC !== bC) return aC ? 1 : -1;
      if (!aC) return (pw[a.priority] ?? 2) - (pw[b.priority] ?? 2);
      return 0;
    });
  }, [filteredItems, completedItems]);

  const completedCount = useMemo(
    () => sortedItems.filter(item => completedItems[item.id]).length,
    [sortedItems, completedItems],
  );

  const handleExport = () => {
    try {
      const text = [
        "# Personalized Action Plan\n",
        `Generated: ${new Date().toLocaleDateString()}\n`,
        `Role: ${result.workTypeKey} | Risk Score: ${result.total}/100 | Company: ${result.companyName ?? "Unknown"}\n`,
        ...sortedItems.map(item => [
          `## ${item.title} (${item.priority} Priority)`,
          `Status: ${completedItems[item.id] ? "✓ Completed" : "○ Pending"}`,
          item.description,
          `Focus: ${item.layerFocus}`,
          item.riskReductionPct ? `Est. Risk Reduction: -${item.riskReductionPct}pts` : "",
          item.deadline ? `Deadline: ${item.deadline}` : "",
          "\n",
        ].filter(Boolean).join("\n")),
      ].join("\n");
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `action-plan-${result.workTypeKey}-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  return (
    <section aria-labelledby="action-plan-heading" className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <SectionHeader
              title="Personalized Action Plan"
              description={`${sortedItems.length} prioritized recommendations tailored to ${result.workTypeKey.replace(/_/g, " ")} at risk score ${result.total}/100. Track progress by checking items off.`}
            />
          </div>
          <ProgressIndicator completed={completedCount} total={sortedItems.length} />
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text" placeholder="Search action items…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 py-2 px-3 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[var(--cyan)]/50"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Filter className="text-muted-foreground w-4 h-4" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="py-2 px-3 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-muted-foreground hover:text-[var(--text)]"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>

        {/* Action Items */}
        <AnimatePresence>
          {sortedItems.length > 0 ? (
            <div className="space-y-2">
              {sortedItems.map((item, i) => (
                <ActionItem
                  key={item.id}
                  item={item}
                  isCompleted={!!completedItems[item.id]}
                  onToggle={() => setCompletedItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 glass-panel rounded-xl">
              <p className="text-muted-foreground text-sm">
                {search || filter !== "all"
                  ? "No matching items — clear search or filter."
                  : "No action items available."}
              </p>
            </div>
          )}
        </AnimatePresence>

        {/* Resources Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {/* Recommended Courses */}
          <CourseResourceCard rolePrefix={rolePrefix} />

          {/* AI Adaptation Tools */}
          <div className="glass-panel p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-violet-400" />
              <h4 className="font-bold text-sm">AI Productivity Tools</h4>
            </div>
            <div className="space-y-2">
              {[
                { name: "Claude (Anthropic)", desc: "Best for analysis, writing, complex reasoning", url: "https://claude.ai", tag: "RECOMMENDED" },
                { name: "GitHub Copilot", desc: "AI pair programming, code review, documentation", url: "https://github.com/features/copilot", tag: "CODING" },
                { name: "Perplexity Pro", desc: "Real-time research with citations", url: "https://www.perplexity.ai", tag: "RESEARCH" },
                { name: "Notion AI", desc: "Docs, task management, knowledge base", url: "https://www.notion.so/product/ai", tag: "PRODUCTIVITY" },
              ].map((tool, i) => (
                <a key={i} href={tool.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                >
                  <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-[var(--cyan)] transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold">{tool.name}</div>
                    <div className="text-[10px] text-muted-foreground">{tool.desc}</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 border border-violet-500/20 font-black flex-shrink-0">
                    {tool.tag}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Career Twin Network */}
        <CareerTwinCard
          userRole={result.workTypeKey}
          userExperience={result.tenureYears ?? 5}
          userRiskScore={result.total}
          userCountry={result.countryKey ?? "global"}
          topN={3}
        />
      </motion.div>
    </section>
  );
};

export default ActionPlanTab;
