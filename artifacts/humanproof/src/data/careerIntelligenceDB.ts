import { 
  MASTER_CAREER_INTELLIGENCE, 
  getCareerIntelligence as getModularIntelligence,
  hasSeededData as hasModularSeeded,
  getSeededRoleKeys as getModularKeys
} from './intelligence';
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
 * Get roadmap for a role key + experience combination
 */
export const getRoleRoadmap = (
  roleKey: string,
  experience: '0-2' | '2-5' | '5-10' | '10-20' | '20+'
): ExperienceRoadmap | null => {
  const intel = getModularIntelligence(roleKey);
  if (!intel) return null;
  return intel.roadmap[experience] ?? intel.roadmap['5-10'];
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
