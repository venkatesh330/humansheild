// subscriptionService.ts
// Manages user subscription plan + gated feature access.

export type Plan = 'free' | 'survivor' | 'thriver' | 'enterprise';

export type GatedFeature =
  | 'layer_breakdown'
  | 'trajectory_timeline'
  | 'full_action_plan'
  | 'real_company_data'
  | 'company_watch_alerts'
  | 'career_twin_network'
  | 'collapse_predictor_alerts'
  | 'team_audit';

interface FeatureGate {
  minPlan: Plan;
  gateTitle: string;
  gateSubtitle: string;
  priceLabel: string;
}

const PLAN_LEVELS: Record<Plan, number> = {
  free: 0, survivor: 1, thriver: 2, enterprise: 3,
};

export const GATES: Record<GatedFeature, FeatureGate> = {
  layer_breakdown: {
    minPlan: 'survivor',
    gateTitle: 'See Why Your Score Is This High',
    gateSubtitle: 'Unlock the full 7-dimension breakdown — which factor is hurting you most',
    priceLabel: '₹999/month',
  },
  trajectory_timeline: {
    minPlan: 'survivor',
    gateTitle: 'When Does Your Risk Cross 65%?',
    gateSubtitle: 'See month-by-month risk projection through 2031',
    priceLabel: '₹999/month',
  },
  full_action_plan: {
    minPlan: 'thriver',
    gateTitle: 'Get Your Full 90-Day Pivot Roadmap',
    gateSubtitle: 'All action items + week-by-week schedule + specific courses',
    priceLabel: '₹2,999/month',
  },
  real_company_data: {
    minPlan: 'survivor',
    gateTitle: 'Unlock Real Company Data',
    gateSubtitle: 'Replace sector averages with live BSE/layoffs.fyi/SEC signals for your company',
    priceLabel: '₹999/month',
  },
  company_watch_alerts: {
    minPlan: 'survivor',
    gateTitle: 'Get Alerts When Your Company Shows Collapse Signals',
    gateSubtitle: 'Email + SMS alerts the moment a Stage 2/3 signal appears',
    priceLabel: '+₹299/month',
  },
  career_twin_network: {
    minPlan: 'thriver',
    gateTitle: 'See Who Successfully Transitioned From Your Role',
    gateSubtitle: '5 real career twins + their exact pivot paths',
    priceLabel: '₹2,999/month',
  },
  collapse_predictor_alerts: {
    minPlan: 'survivor',
    gateTitle: 'Track Companies Before They Collapse',
    gateSubtitle: 'Monitor up to 10 companies for Stage 1-3 signals',
    priceLabel: '₹999/month',
  },
  team_audit: {
    minPlan: 'enterprise',
    gateTitle: 'Audit Your Entire Team',
    gateSubtitle: 'Aggregate team risk + individual benchmarks for HR/managers',
    priceLabel: 'Contact sales',
  },
};

const STORAGE_KEY = 'humanproof_user_plan';

export function getUserPlan(): Plan {
  if (typeof window === 'undefined') return 'free';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && ['free', 'survivor', 'thriver', 'enterprise'].includes(stored)) {
    return stored as Plan;
  }
  return 'free';
}

export function setUserPlan(plan: Plan): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, plan);
  window.dispatchEvent(new CustomEvent('plan-changed', { detail: { plan } }));
}

export function canAccess(feature: GatedFeature, plan?: Plan): boolean {
  const userPlan = plan ?? getUserPlan();
  const gate = GATES[feature];
  if (!gate) return true;
  return PLAN_LEVELS[userPlan] >= PLAN_LEVELS[gate.minPlan];
}

export function planDisplayName(plan: Plan): string {
  const names: Record<Plan, string> = {
    free: 'Free', survivor: 'Survivor', thriver: 'Thriver', enterprise: 'Enterprise',
  };
  return names[plan];
}

// React hook for plan state
import { useEffect, useState } from 'react';

export function useUserPlan(): Plan {
  const [plan, setPlan] = useState<Plan>(getUserPlan());
  useEffect(() => {
    const handler = (e: CustomEvent) => setPlan((e.detail?.plan as Plan) || getUserPlan());
    window.addEventListener('plan-changed', handler as EventListener);
    return () => window.removeEventListener('plan-changed', handler as EventListener);
  }, []);
  return plan;
}
