import { 
  MASTER_CAREER_INTELLIGENCE, 
  getCareerIntelligence as getModularIntelligence,
  hasSeededData as hasModularSeeded,
  getSeededRoleKeys as getModularKeys
} from './intelligence/index';
import { 
  CareerIntelligence, 
  TrendPoint, 
  CareerPath, 
  ExperienceRoadmap 
} from './intelligence/types';


/**
 * @legacy CAREER_INTELLIGENCE_DB
 * Retained for backward compatibility. 
 * Now sources data from the modular intelligence/ directory.
 */
export const CAREER_INTELLIGENCE_DB: Record<string, CareerIntelligence> = MASTER_CAREER_INTELLIGENCE;

/**
 * Get career intelligence for a role key
 */
export const getCareerIntelligence = (roleKey: string): CareerIntelligence | null => {
  return getModularIntelligence(roleKey);
};

/**
 * Get roadmap for a role key + experience combination.
 * BUG-03 FIX: Cascades through experience levels instead of a single fallback.
 * Priority: exact match → nearest lower → nearest higher → first available → null
 */
export const getRoleRoadmap = (
  roleKey: string,
  experience: '0-2' | '2-5' | '5-10' | '10-20' | '20+'
): ExperienceRoadmap | null => {
  const intel = getModularIntelligence(roleKey);
  if (!intel?.roadmap) return null;

  const rm = intel.roadmap;
  const ORDER: Array<'0-2' | '2-5' | '5-10' | '10-20' | '20+'> = ['0-2', '2-5', '5-10', '10-20', '20+'];
  const idx = ORDER.indexOf(experience);

  // 1. Try exact match
  if (rm[experience]) return rm[experience]!;

  // 2. Try descending (lower experience levels — prefer similar context)
  for (let i = idx - 1; i >= 0; i--) {
    if (rm[ORDER[i]]) return rm[ORDER[i]]!;
  }

  // 3. Try ascending (higher experience levels)
  for (let i = idx + 1; i < ORDER.length; i++) {
    if (rm[ORDER[i]]) return rm[ORDER[i]]!;
  }

  return null;
};

/**
 * Get career paths for a role
 */
export const getRoleCareerPaths = (roleKey: string): CareerPath[] => {
  return getModularIntelligence(roleKey)?.careerPaths ?? [];
};

/**
 * Get skill risk matrix for a role
 */
export const getRoleSkills = (roleKey: string) => {
  return getModularIntelligence(roleKey)?.skills ?? null;
};

/**
 * Get inaction scenario for a role
 */
export const getInactionScenario = (roleKey: string): string | null => {
  return getModularIntelligence(roleKey)?.inactionScenario ?? null;
};

/**
 * Get risk trend data for charting
 */
export const getRiskTrend = (roleKey: string): TrendPoint[] => {
  return getModularIntelligence(roleKey)?.riskTrend ?? [];
};

/**
 * Check if a role has pre-seeded data
 */
export const hasSeededData = (roleKey: string): boolean => {
  return hasModularSeeded(roleKey);
};

/**
 * Get all seeded role keys
 */
export const getSeededRoleKeys = (): string[] => {
  return getModularKeys();
};

export default CAREER_INTELLIGENCE_DB;
