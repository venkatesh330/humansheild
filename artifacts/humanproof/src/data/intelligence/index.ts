import { CareerIntelligence } from './types.ts';
import { TECH_INTELLIGENCE } from './tech.ts';
import { FINANCE_INTELLIGENCE } from './finance.ts';
import { SERVICES_INTELLIGENCE } from './services.ts';
import { HEALTHCARE_INTELLIGENCE } from './healthcare.ts';
import { INDUSTRY_INTELLIGENCE } from './industry.ts';
import { CREATIVE_INTELLIGENCE } from './creative.ts';

/**
 * MASTER_CAREER_INTELLIGENCE
 * Aggregates all industry-specific modules into a central registry.
 * Scaling this system involves adding new modules and importing them here.
 */
export const MASTER_CAREER_INTELLIGENCE: Record<string, CareerIntelligence> = {
  ...TECH_INTELLIGENCE,
  ...FINANCE_INTELLIGENCE,
  ...SERVICES_INTELLIGENCE,
  ...HEALTHCARE_INTELLIGENCE,
  ...INDUSTRY_INTELLIGENCE,
  ...CREATIVE_INTELLIGENCE,
};

/**
 * Resolver: Fetch career intelligence for a given role key.
 */
export const getCareerIntelligence = (roleKey: string): CareerIntelligence | null => {
  return MASTER_CAREER_INTELLIGENCE[roleKey] || null;
};

/**
 * Check if a role has pre-seeded data.
 */
export const hasSeededData = (roleKey: string): boolean => {
  return !!MASTER_CAREER_INTELLIGENCE[roleKey];
};

/**
 * Get all seeded role keys.
 */
export const getSeededRoleKeys = (): string[] => {
  return Object.keys(MASTER_CAREER_INTELLIGENCE);
};
