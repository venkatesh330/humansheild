// tabs.ts
// Tab navigation configuration for Audit Terminal v2.0.

import type { ComponentType } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  Brain,
  CheckSquare,
  FileText,
} from "lucide-react";

/**
 * Allowed tab values — used for routing state and URL hash.
 */
export type TabValue =
  | "overview"
  | "breakdown"
  | "company"
  | "career"
  | "actions"
  | "transparency";

/**
 * Metadata for each top-level tab.
 * - `value`: unique identifier (matches TabValue)
 * - `label`: display string
 * - `icon`: React icon component (lucide-react)
 * - `description`: short sentence for tooltip / accessibility
 */
export const TAB_ITEMS: ReadonlyArray<{
  value: TabValue;
  label: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    value: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    description:
      "Executive snapshot — overall risk score, verdict, and key stats",
  },
  {
    value: "breakdown",
    label: "Risk Breakdown",
    icon: BarChart3,
    description: "Layer-by-layer dimensional analysis (L1–L6) and key drivers",
  },
  {
    value: "company",
    label: "Company Profile",
    icon: Building2,
    description:
      "Financial health, layoff history, industry context, and live signals",
  },
  {
    value: "career",
    label: "Career & Skills",
    icon: Brain,
    description:
      "Role-specific exposure, automation risk, skill gaps, and upskilling roadmap",
  },
  {
    value: "actions",
    label: "Action Plan",
    icon: CheckSquare,
    description: "Prioritized tasks with deadlines and progress tracking",
  },
  {
    value: "transparency",
    label: "Transparency",
    icon: FileText,
    description:
      "Data provenance, confidence math, signal conflicts, and audit trail",
  },
] as const;

/**
 * Helper: get tab metadata by value.
 */
export function getTabMetadata(value: TabValue) {
  return TAB_ITEMS.find((t) => t.value === value);
}

/**
 * Ordered list of all tab values — useful for iteration.
 */
export const TAB_VALUES: TabValue[] = TAB_ITEMS.map((t) => t.value);
