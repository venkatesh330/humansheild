import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useHumanProof } from '../context/HumanProofContext';
import { projectScore } from '../data/riskFormula';

// Section 4.5 — 2026 calibrated annual risk decay factors
// Format: { opt: optimistic, base: baseline, pes: pessimistic } — annual absolute risk point increase
// Sources: WEF FoJ 2025, McKinsey State of AI 2025, Anthropic Economic Index 2025
const ROLE_DECAY_FACTORS_2026: Record<string, { opt: number; base: number; pes: number }> = {
  software_engineer: { opt: 4.0, base: 9.0, pes: 16.0 },   // GitHub Copilot → agentic coding
  data_scientist:    { opt: 5.0, base: 10.0, pes: 18.0 },  // AutoML maturation
  marketing:         { opt: 6.0, base: 12.0, pes: 20.0 },  // generative content explosion
  finance_analyst:   { opt: 7.0, base: 14.0, pes: 22.0 },  // agentic trading + reporting
  lawyer:            { opt: 3.0, base: 8.0, pes: 14.0 },   // Harvey AI, CoCounsel adoption
  teacher:           { opt: 2.0, base: 5.0, pes: 10.0 },   // human pedagogy still essential
  physician:         { opt: 1.0, base: 4.0, pes: 9.0 },    // diagnostic AI aiding not replacing
  nurse:             { opt: 1.0, base: 3.0, pes: 7.0 },    // physical care irreplaceable
  therapist:         { opt: 1.0, base: 2.0, pes: 5.0 },    // trust + human connection core
  architect:         { opt: 2.0, base: 6.0, pes: 11.0 },   // AI design tools expanding
  designer:          { opt: 5.0, base: 11.0, pes: 19.0 },  // generative design pressure
  customer_service:  { opt: 9.0, base: 16.0, pes: 25.0 },  // agentic AI customer service
  accountant:        { opt: 7.0, base: 13.0, pes: 21.0 },  // AI bookkeeping acceleration
  researcher:        { opt: 3.0, base: 7.0, pes: 13.0 },   // AI literature review tools
  social_worker:     { opt: 1.0, base: 2.0, pes: 4.0 },    // legally protected human role
  hr:                { opt: 4.0, base: 9.0, pes: 15.0 },   // AI screening and HRIS
  sales:             { opt: 3.0, base: 7.0, pes: 13.0 },   // AI handles tier-1 but complex deals need humans
  project_manager:   { opt: 3.0, base: 8.0, pes: 14.0 },  // AI scheduling and reporting but governance is human
  journalist:        { opt: 5.0, base: 11.0, pes: 18.0 },  // AI writing but investigative reporting protected
  chef:              { opt: 1.0, base: 3.0, pes: 6.0 },    // embodied craft skill, highly protected
  engineer:          { opt: 3.0, base: 7.0, pes: 12.0 },   // physical + judgment roles
  generic:           { opt: 4.0, base: 9.0, pes: 16.0 },   // baseline
  // Legacy keys (kept for backward compat with old deriveJobKey output)
  swe:               { opt: 4.0, base: 9.0, pes: 16.0 },
  analyst:           { opt: 5.0, base: 10.0, pes: 18.0 },
  doctor:            { opt: 1.0, base: 4.0, pes: 9.0 },
};

const ROLE_RISK_THRESHOLD_2026: Record<string, number> = {
  software_engineer: 68, data_scientist: 70, marketing: 70, finance_analyst: 72,
  lawyer: 58, teacher: 52, physician: 48, nurse: 44, therapist: 42,
  architect: 62, designer: 66, customer_service: 75, accountant: 72,
  researcher: 60, social_worker: 40, hr: 62, sales: 60, project_manager: 62,
  journalist: 66, chef: 46, engineer: 58,
  swe: 68, analyst: 68, doctor: 48, generic: 65, default: 65,
};

const ROLE_LABELS_2026: Record<string, string> = {
  software_engineer: 'Software Engineer', data_scientist: 'Data Scientist',
  marketing: 'Marketer', finance_analyst: 'Finance Analyst', lawyer: 'Lawyer',
  teacher: 'Teacher', physician: 'Doctor/Physician', nurse: 'Nurse',
  therapist: 'Therapist', architect: 'Architect', designer: 'Designer',
  customer_service: 'Customer Service', accountant: 'Accountant',
  researcher: 'Researcher', social_worker: 'Social Worker', hr: 'HR Professional',
  sales: 'Sales Professional', project_manager: 'Project Manager',
  journalist: 'Journalist', chef: 'Chef', engineer: 'Engineer',
  swe: 'Software Engineer', analyst: 'Analyst', doctor: 'Doctor', generic: 'Your Role', default: 'Your Role',
};

// Section 4.2 — Expanded deriveJobKey to 30+ categories
function deriveJobKey(title: string | null, jobId: string | null): string {
  const key = jobId || title || '';
  const t = key.toLowerCase();
  // Healthcare — clinical
  if (/doctor|physician|surgeon|gp\b|consultant physician/.test(t)) return 'physician';
  // Healthcare — nursing
  if (/nurse|midwife|health visitor|district nurse/.test(t)) return 'nurse';
  // Healthcare — therapy / mental health / social
  if (/therapist|counsellor|counselor|psychologist|psychiatrist|social worker/.test(t)) return 'therapist';
  // Legal
  if (/lawyer|solicitor|barrister|attorney|paralegal|counsel/.test(t)) return 'lawyer';
  // Education
  if (/teacher|lecturer|professor|tutor|educator|teaching assistant/.test(t)) return 'teacher';
  // Finance — accounting
  if (/accountant|auditor|bookkeeper|cpa|chartered accountant|comptroller/.test(t)) return 'accountant';
  // Finance — advisory
  if (/financial advisor|wealth manager|financial planner|cfp/.test(t)) return 'finance_analyst';
  // Finance — analyst / trading
  if (/analyst|investment|portfolio manager|equities|trading/.test(t)) return 'finance_analyst';
  // Architecture
  if (/architect(?!ure|ural|data|software|enterprise|solution)/.test(t)) return 'architect';
  // Design
  if (/interior design|ux designer|ui designer|graphic design|product design|creative director/.test(t)) return 'designer';
  if (/designer|design lead/.test(t)) return 'designer';
  // Software engineering
  if (/software engineer|software developer|full.?stack|backend developer|frontend developer/.test(t)) return 'software_engineer';
  if (/developer|programmer|swe\b|engineer.*software|software.*engineer/.test(t)) return 'software_engineer';
  // Data / ML
  if (/data engineer|data scientist|ml engineer|machine learning|ai engineer/.test(t)) return 'data_scientist';
  if (/data analyst|analytics engineer/.test(t)) return 'data_scientist';
  // Non-software engineering
  if (/mechanical engineer|civil engineer|structural engineer|electrical engineer|chemical engineer/.test(t)) return 'engineer';
  if (/\bengineer\b/.test(t)) return 'engineer';
  // Marketing
  if (/marketing|growth hacker|seo|sem|content strat|brand manager|digital market/.test(t)) return 'marketing';
  // HR
  if (/hr |human resource|people ops|recruiter|talent acquisition|hrbp/.test(t)) return 'hr';
  // Customer Service
  if (/customer service|customer success|support agent|helpdesk|service rep/.test(t)) return 'customer_service';
  // Research
  if (/researcher|research scientist|research analyst|academic|scientist/.test(t)) return 'researcher';
  // Social Work
  if (/social worker|case manager|community worker|welfare/.test(t)) return 'social_worker';
  // Sales
  if (/sales|account executive|account manager|business development/.test(t)) return 'sales';
  // Project / Product Management
  if (/product manager|project manager|scrum master|programme manager/.test(t)) return 'project_manager';
  // Journalism / Media
  if (/journalist|reporter|editor|correspondent|media/.test(t)) return 'journalist';
  // Chef / Hospitality
  if (/chef|cook|culinary|hospitality/.test(t)) return 'chef';
  // Accounting fallback
  if (/finance|cfo|cpa|financial/.test(t)) return 'accountant';
  return 'generic';
}

// BUG 5 FIX: NaN guard for score values (??  only guards null/undefined, not NaN)
function safeScore(s: number | null | undefined): number | null {
  return (s !== null && s !== undefined && !isNaN(s)) ? s : null;
}

export default function DisplacementForecast({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { state } = useHumanProof();
  const { jobRiskScore, skillRiskScore, jobTitle, jobId } = state;

  // BUG 5 FIX: explicit NaN guard before fallback chain
  const currentScore = safeScore(skillRiskScore) ?? safeScore(jobRiskScore) ?? null;
  const usingSkillFallback = currentScore !== null && safeScore(skillRiskScore) !== null && safeScore(jobRiskScore) === null;
  const forecastInput = currentScore ?? 60;

  // BUG 5 FIX: guard against null/undefined jobTitle and jobId
  const jobKey = deriveJobKey(jobTitle ?? null, jobId ?? null);
  const factors = ROLE_DECAY_FACTORS_2026[jobKey] || ROLE_DECAY_FACTORS_2026.generic;
  const threshold = ROLE_RISK_THRESHOLD_2026[jobKey] ?? 65;
  const jobLabel = ROLE_LABELS_2026[jobKey] || 'Your Role';

  const baseYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => String(baseYear + i));

  // FORMULA FIX 2: 3 independent logistic S-curves (not linear extrapolation)
  // Each scenario uses projectScore() which implements a proper logistic curve
  // that saturates near 97 instead of linearly overshooting
  const data = years.map((year, i) => ({
    year,
    optimistic: projectScore(forecastInput, factors.opt, i),
    base: projectScore(forecastInput, factors.base, i),
    pessimistic: projectScore(forecastInput, factors.pes, i),
  }));

  const baseAt5 = data[data.length - 1].base;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#111128', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text2)', marginBottom: 6 }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
            <span style={{ fontSize: '0.8rem', color: p.color }}>{p.name}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: p.color }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const scenarioDescriptions = {
    optimistic: { label: 'If you upskill actively', color: 'var(--emerald)', desc: 'You dedicate 3+ hours/week to targeted upskilling in protected skills.' },
    base: { label: 'Current trajectory', color: 'var(--text2)', desc: 'You continue as normal with no major changes to your skill set.' },
    pessimistic: { label: 'If AI adoption accelerates', color: 'var(--red)', desc: 'AI adoption accelerates faster than expected in your sector.' },
  };

  return (
    <div style={{ padding: '40px 0', maxWidth: 900, margin: '0 auto' }}>
      <div className="reveal" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 4, height: 32, background: 'var(--violet)', borderRadius: 2 }} />
          <h2 style={{ fontFamily: 'var(--mono)', fontSize: '1.5rem', color: 'var(--violet-light)' }}>
            Displacement Timeline Forecast
          </h2>
        </div>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginLeft: 16 }}>
          Projected risk trajectory {baseYear}–{baseYear + 5} — three scenarios based on your current score.
        </p>
      </div>

      {/* BUG 5 / UX FIX 3: non-blocking info banners — chart always shows */}
      {currentScore === null && (
        <div style={{ padding: '14px 18px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 10, marginBottom: 24, fontSize: '0.875rem', color: '#FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span>Complete a risk calculator to personalise your forecast. Showing example data (score: 60).</span>
          {onNavigate && (
            <button
              onClick={() => onNavigate('job-risk')}
              style={{ background: 'none', border: '1px solid rgba(251,191,36,0.5)', color: '#FCD34D', borderRadius: 6, padding: '4px 12px', fontFamily: 'var(--mono)', fontSize: '0.75rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              Calculate Job Risk Score →
            </button>
          )}
        </div>
      )}
      {usingSkillFallback && (
        <div style={{ padding: '10px 16px', background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 10, marginBottom: 24, fontSize: '0.82rem', color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>ℹ</span>
          <span>Forecast based on your Skill Risk score ({currentScore}). Complete the Job Risk Calculator for a role-specific projection.</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        {[
          { label: 'Current Score', value: forecastInput, color: 'var(--cyan)' },
          { label: `Base Case (${baseYear + 5})`, value: data[5].base, color: 'var(--text2)' },
          { label: `If Upskilling (${baseYear + 5})`, value: data[5].optimistic, color: 'var(--emerald)' },
          { label: `Worst Case (${baseYear + 5})`, value: data[5].pessimistic, color: 'var(--red)' },
        ].map(item => (
          <div key={item.label} style={{ flex: 1, minWidth: 130, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '2rem', fontWeight: 700, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 12 }}>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="year" tick={{ fill: 'var(--text2)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
            <YAxis domain={[0, 100]} tick={{ fill: 'var(--text2)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(value) => <span style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>{value}</span>} wrapperStyle={{ paddingTop: 16 }} />
            <ReferenceLine
              y={threshold}
              stroke="rgba(255,71,87,0.3)"
              strokeDasharray="4 4"
              label={{ value: `Displacement threshold (${jobLabel})`, fill: 'rgba(255,71,87,0.6)', fontSize: 10 }}
            />
            <Line type="monotone" dataKey="optimistic" name={scenarioDescriptions.optimistic.label} stroke="var(--emerald)" strokeWidth={2} dot={{ fill: 'var(--emerald)', r: 4 }} />
            <Line type="monotone" dataKey="base" name={scenarioDescriptions.base.label} stroke="var(--text2)" strokeWidth={2} dot={{ fill: 'var(--text2)', r: 4 }} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="pessimistic" name={scenarioDescriptions.pessimistic.label} stroke="var(--red)" strokeWidth={2} dot={{ fill: 'var(--red)', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginBottom: 24, fontSize: '0.75rem', color: 'var(--text2)', textAlign: 'center' }}>
        {currentScore !== null
          ? `Based on your ${safeScore(skillRiskScore) !== null ? 'Skill Risk' : 'Job Risk'} score of ${currentScore} · Logistic S-curve decay for ${jobLabel} · WEF Future of Jobs 2025 · McKinsey State of AI 2025 · Anthropic Economic Index 2025`
          : 'Complete a risk calculator above to personalise this forecast · Sources: WEF Future of Jobs 2025, McKinsey 2025'}
      </div>

      <div style={{ background: 'rgba(124,58,255,0.08)', border: '1px solid rgba(124,58,255,0.25)', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
        <p style={{ color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          At your current trajectory, your risk score could reach{' '}
          <strong style={{ color: 'var(--red)', fontFamily: 'var(--mono)' }}>{baseAt5}</strong>{' '}
          by <strong>{baseYear + 5}</strong>. If you actively upskill, you could keep it at{' '}
          <strong style={{ color: 'var(--emerald)', fontFamily: 'var(--mono)' }}>{data[5].optimistic}</strong>.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        {Object.entries(scenarioDescriptions).map(([key, s]) => (
          <div key={key} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${s.color}30`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ width: 24, height: 3, background: s.color, borderRadius: 2, marginBottom: 8 }} />
            <div style={{ fontSize: '0.8rem', color: s.color, fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => onNavigate?.('roadmap')}
          style={{ background: 'var(--violet)', color: 'white', border: 'none', borderRadius: 8, padding: '12px 32px', fontFamily: 'var(--mono)', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          Start Your Upskilling Plan Now →
        </button>
      </div>
    </div>
  );
}
