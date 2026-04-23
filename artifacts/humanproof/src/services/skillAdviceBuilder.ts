// skillAdviceBuilder.ts — pure helpers that compose adaptation advice for
// the AI Risk to Skill Analysis panel. Extracted from AIRiskSkillMatrix.tsx
// so they're independently testable (the component file pulls these in).
//
// Personalization invariants enforced by tests in __tests__/uniqueness-probe.test.ts:
//   - Two SkillRisk records with the same `aiReplacement` value but different
//     `aiTool` / `horizon` / `riskScore` MUST produce different advice strings.
//   - Output sentences must reference the actual skill name and tool name
//     (so the advice is verifiable and grounded, not generic encouragement).

import type { SkillRisk } from '../data/intelligence/types.ts';

export function buildObsoleteAdvice(s: SkillRisk): string {
  const tools = s.aiTool ? s.aiTool.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const primaryTool = tools[0];
  const secondaryTool = tools[1];
  const horizonPhrase = s.horizon.includes('1-3')
    ? 'inside the next 12–24 months'
    : s.horizon.includes('3-5')
      ? 'over the next 3–4 years'
      : 'on a 5+ year horizon';
  const toolText = primaryTool
    ? secondaryTool
      ? `${primaryTool} (and ${secondaryTool}) already cover the bulk of this work in production today`
      : `${primaryTool} already covers most of this work in production today`
    : 'mature general-purpose models already cover this function';
  const intensity = s.riskScore >= 85
    ? 'This is among the steepest displacement curves we track'
    : s.riskScore >= 70
      ? 'Displacement here is well-documented and accelerating'
      : 'Displacement is real but uneven — quality of execution still matters';
  const action = s.aiReplacement === 'Full'
    ? `Stop deepening the manual craft of "${s.skill}" ${horizonPhrase}. Re-anchor on becoming the person who *deploys, evaluates, and is accountable for* ${primaryTool ?? 'these tools'} — that role is harder to commoditise than the underlying skill.`
    : s.aiReplacement === 'Partial'
      ? `Treat manual "${s.skill}" execution as the AI's job ${horizonPhrase}; treat exception handling, edge cases, and stakeholder-facing decisions as yours.`
      : `Time-box manual practice of "${s.skill}" to ${s.horizon.includes('1-3') ? 'one quarter' : 'one half'} of your previous investment, and redirect the rest to AI orchestration of this same domain.`;
  return `${toolText}. ${intensity}. ${action}`;
}

export function buildAtRiskAdvice(s: SkillRisk): string {
  const tool = s.aiTool ? s.aiTool.split(',')[0].trim() : null;
  const horizonNote = s.horizon.includes('1-3')
    ? `On a 1–3yr horizon, the gap between "uses ${tool ?? 'AI tools'}" and "ignores them" becomes visible to your manager within two review cycles.`
    : s.horizon.includes('3-5')
      ? `On a 3–5yr horizon, you have one promotion window to be seen as the person who already runs ${tool ?? 'AI workflows'} for ${s.skill}, before it becomes the default expectation.`
      : `On a 5+yr horizon, the strategic move is to *own the policy* around how ${s.skill} is augmented — who decides which tool, who sets the quality bar, who is accountable when it fails.`;
  if (s.riskType === 'Augmented' || s.aiReplacement === 'Partial') {
    return `${tool ?? 'Mainstream AI tooling'} is absorbing the execution layer of "${s.skill}", but the parts that require ambiguous-requirement resolution, stakeholder negotiation, and accountability for outcomes remain human-led. Shift from "doing the work" to "directing the tool and owning the result". ${horizonNote}`;
  }
  return `Routine components of "${s.skill}" are being automated by ${tool ?? 'general-purpose copilots'}, but complex, novel, or high-stakes instances still require human judgment. Invest your skill-development time in the edge cases — they're where compounding human expertise still beats the model. ${horizonNote}`;
}
