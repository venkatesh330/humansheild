// experimentsService.ts
// A/B experiment bucketing and tracking. FNV-1a hash for deterministic assignment.

import { track } from './analyticsService';

type ExperimentId = 'hero_cta_copy' | 'pricing_primary_plan' | 'onboarding_timing' | 'paywall_style';

interface ExperimentConfig {
  variants: string[];
  weights: number[];
}

const EXPERIMENTS: Record<ExperimentId, ExperimentConfig> = {
  hero_cta_copy: {
    variants: ['control', 'urgency', 'curiosity'],
    weights: [50, 25, 25],
  },
  pricing_primary_plan: {
    variants: ['pro', 'team'],
    weights: [60, 40],
  },
  onboarding_timing: {
    variants: ['immediate', 'delayed'],
    weights: [50, 50],
  },
  paywall_style: {
    variants: ['soft', 'aggressive'],
    weights: [50, 50],
  },
};

const OVERRIDE_KEY = 'humanproof_experiment_overrides';

function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash + (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)) >>> 0;
  }
  return hash;
}

function bucket(experimentId: string, userId: string, weights: number[]): string {
  const hash = fnv1a(`${experimentId}:${userId}`);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const normalized = hash % totalWeight;
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (normalized < cumulative) return i.toString();
  }
  return '0';
}

const assignmentCache: Record<string, string> = {};

function loadAssignments(): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(OVERRIDE_KEY);
    if (stored) {
      Object.assign(assignmentCache, JSON.parse(stored));
    }
  } catch {}
}

export function getVariant<T extends string = string>(experimentId: ExperimentId, userId?: string): T {
  const user = userId || localStorage.getItem('humanproof_user_id') || 'anonymous';
  const cacheKey = `${experimentId}:${user}`;

  if (assignmentCache[cacheKey]) {
    return assignmentCache[cacheKey] as T;
  }

  const config = EXPERIMENTS[experimentId];
  if (!config) return 'control' as T;

  const variantIndex = bucket(experimentId, user, config.weights);
  const variant = config.variants[parseInt(variantIndex)] || 'control';

  assignmentCache[cacheKey] = variant;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(OVERRIDE_KEY, JSON.stringify(assignmentCache));
    } catch {}
  }

  return variant as T;
}

export function trackExposure(experimentId: ExperimentId, userId?: string): void {
  const variant = getVariant(experimentId, userId);
  track('experiment_exposure', {
    experiment_id: experimentId,
    variant,
  });
}

export function trackConversion(experimentId: ExperimentId, conversionType: string, userId?: string): void {
  const variant = getVariant(experimentId, userId);
  track('experiment_conversion', {
    experiment_id: experimentId,
    variant,
    conversion_type: conversionType,
  });
}

export function overrideVariant(experimentId: ExperimentId, variant: string, userId?: string): void {
  const user = userId || localStorage.getItem('humanproof_user_id') || 'anonymous';
  assignmentCache[`${experimentId}:${user}`] = variant;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(OVERRIDE_KEY, JSON.stringify(assignmentCache));
    } catch {}
  }
}

export function clearAssignments(): void {
  Object.keys(assignmentCache).forEach(k => delete assignmentCache[k]);
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(OVERRIDE_KEY);
    } catch {}
  }
}

if (typeof window !== 'undefined') {
  loadAssignments();
}
