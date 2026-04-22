// teamDashboardService.ts
// Local-first team dashboard state. Backs team audit visualization when the
// API is unavailable, and mirrors the shape the backend will return.

import { track } from './analyticsService';

export type RiskTier = 'critical' | 'high' | 'moderate' | 'low' | 'safe';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  score: number;
  tier: RiskTier;
  confidence: number;
  country: string;
  addedAt: string;
}

export interface TeamSnapshot {
  id: string;
  name: string;
  createdAt: string;
  members: TeamMember[];
}

const STORAGE_KEY = 'humanproof_team_dashboard';

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function tierFromScore(score: number): RiskTier {
  if (score >= 85) return 'critical';
  if (score >= 65) return 'high';
  if (score >= 40) return 'moderate';
  if (score >= 20) return 'low';
  return 'safe';
}

function readState(): TeamSnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TeamSnapshot[]) : [];
  } catch {
    return [];
  }
}

function writeState(snapshots: TeamSnapshot[]): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots)); } catch {}
}

export function getTeams(): TeamSnapshot[] {
  return readState();
}

export function getTeam(id: string): TeamSnapshot | null {
  return readState().find(t => t.id === id) || null;
}

export function createTeam(name: string): TeamSnapshot {
  const all = readState();
  const team: TeamSnapshot = {
    id: randomId(),
    name: name.trim() || 'My Team',
    createdAt: new Date().toISOString(),
    members: [],
  };
  all.push(team);
  writeState(all);
  track('team_created', { team_id: team.id, name: team.name });
  return team;
}

export function deleteTeam(id: string): void {
  const all = readState().filter(t => t.id !== id);
  writeState(all);
  track('team_deleted', { team_id: id });
}

export interface AddMemberInput {
  name: string;
  role: string;
  department: string;
  score: number;
  country?: string;
  confidence?: number;
}

export function addMember(teamId: string, input: AddMemberInput): TeamMember | null {
  const all = readState();
  const team = all.find(t => t.id === teamId);
  if (!team) return null;
  const member: TeamMember = {
    id: randomId(),
    name: input.name.trim(),
    role: input.role.trim(),
    department: input.department.trim() || 'Unassigned',
    score: Math.max(0, Math.min(100, input.score)),
    tier: tierFromScore(input.score),
    confidence: input.confidence ?? 70,
    country: input.country || 'US',
    addedAt: new Date().toISOString(),
  };
  team.members.push(member);
  writeState(all);
  track('team_member_added', { team_id: teamId, tier: member.tier, score: member.score });
  return member;
}

export function removeMember(teamId: string, memberId: string): void {
  const all = readState();
  const team = all.find(t => t.id === teamId);
  if (!team) return;
  team.members = team.members.filter(m => m.id !== memberId);
  writeState(all);
  track('team_member_removed', { team_id: teamId, member_id: memberId });
}

export interface TeamAggregates {
  memberCount: number;
  avgScore: number;
  medianScore: number;
  maxScore: number;
  tierDistribution: Record<RiskTier, number>;
  topDepartments: { name: string; avg: number; count: number }[];
  criticalMembers: TeamMember[];
}

export function computeAggregates(team: TeamSnapshot): TeamAggregates {
  const members = team.members;
  const empty: Record<RiskTier, number> = {
    critical: 0, high: 0, moderate: 0, low: 0, safe: 0,
  };
  if (!members.length) {
    return {
      memberCount: 0,
      avgScore: 0,
      medianScore: 0,
      maxScore: 0,
      tierDistribution: empty,
      topDepartments: [],
      criticalMembers: [],
    };
  }
  const scores = members.map(m => m.score).sort((a, b) => a - b);
  const avg = scores.reduce((s, n) => s + n, 0) / scores.length;
  const median = scores[Math.floor(scores.length / 2)];
  const max = scores[scores.length - 1];
  const tierDistribution = members.reduce<Record<RiskTier, number>>(
    (acc, m) => ({ ...acc, [m.tier]: (acc[m.tier] || 0) + 1 }),
    { ...empty },
  );
  const byDept = new Map<string, { total: number; count: number }>();
  members.forEach(m => {
    const existing = byDept.get(m.department) || { total: 0, count: 0 };
    byDept.set(m.department, { total: existing.total + m.score, count: existing.count + 1 });
  });
  const topDepartments = Array.from(byDept.entries())
    .map(([name, { total, count }]) => ({ name, avg: total / count, count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);
  const criticalMembers = members
    .filter(m => m.tier === 'critical' || m.tier === 'high')
    .sort((a, b) => b.score - a.score);
  return {
    memberCount: members.length,
    avgScore: Math.round(avg),
    medianScore: Math.round(median),
    maxScore: Math.round(max),
    tierDistribution,
    topDepartments,
    criticalMembers,
  };
}
