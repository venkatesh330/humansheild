import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useHumanProof } from '../context/HumanProofContext';

// Helper to sanitize incoming Job Titles to standard database keys for the forecasting API
function deriveJobKey(title: string | null, jobId: string | null): string {
  const key = jobId || title || '';
  const t = key.toLowerCase();
  if (/doctor|physician|surgeon|gp\b|consultant/.test(t)) return 'physician';
  if (/nurse|midwife|health visitor/.test(t)) return 'nurse';
  if (/therapist|counsellor|psychologist|social worker/.test(t)) return 'therapist';
  if (/lawyer|solicitor|barrister|attorney|counsel/.test(t)) return 'lawyer';
  if (/teacher|lecturer|professor|tutor|educator/.test(t)) return 'teacher';
  if (/accountant|auditor|bookkeeper|cpa|comptroller/.test(t)) return 'accountant';
  if (/financial|wealth|analyst|investment|trading/.test(t)) return 'finance_analyst';
  if (/architect(?!ure|ural|data|software)/.test(t)) return 'architect';
  if (/designer|design lead/.test(t)) return 'designer';
  if (/software|developer|full.?stack|programmer|swe\b/.test(t)) return 'software_engineer';
  if (/data|ml|machine learning|ai engineer/.test(t)) return 'data_scientist';
  if (/\bengineer\b/.test(t)) return 'engineer';
  if (/marketing|seo|brand|digital market/.test(t)) return 'marketing';
  if (/hr |human resource|recruiter|talent/.test(t)) return 'hr';
  if (/customer service|support|helpdesk/.test(t)) return 'customer_service';
  if (/researcher|academic|scientist/.test(t)) return 'researcher';
  if (/sales|account executive|business dev/.test(t)) return 'sales';
  if (/product|project|scrum manager/.test(t)) return 'project_manager';
  if (/journalist|reporter|editor|media/.test(t)) return 'journalist';
  if (/chef|cook|culinary|hospitality/.test(t)) return 'chef';
  return 'generic';
}

function safeScore(s: number | null | undefined): number | null {
  return (s !== null && s !== undefined && !isNaN(s)) ? s : null;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export default function DisplacementForecast({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { state } = useHumanProof();
  const { jobRiskScore, skillRiskScore, jobTitle, jobId } = state;

  const currentScore = safeScore(skillRiskScore) ?? safeScore(jobRiskScore) ?? null;
  const usingSkillFallback = currentScore !== null && safeScore(skillRiskScore) !== null && safeScore(jobRiskScore) === null;

  const jobKey = deriveJobKey(jobTitle ?? null, jobId ?? null);
  const baseYear = new Date().getFullYear();

  // API State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [threshold, setThreshold] = useState<number>(65);
  const [sliderIndex, setSliderIndex] = useState(1); // 0 = pessimistic, 1 = base, 2 = optimistic

  useEffect(() => {
    async function fetchForecast() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/v1/forecast/${jobKey}`);
        if (!res.ok) throw new Error('API return error');
        
        const json = await res.json();
        if (json.timeline) {
          setData(json.timeline);
          if (json.threshold !== undefined) setThreshold(json.threshold);
        } else {
          throw new Error('Malformed API Response');
        }
      } catch (e: any) {
        console.error('Failed to load forecast', e);
        setError("Unable to connect to live Swarm Intel API. Using cached fallback data.");
        
        // Very basic fallback if API is unreachable
        const fallbackData = Array.from({ length: 6 }, (_, i) => ({
          year: String(baseYear + i),
          optimistic: Math.min(60 + (i * 2), 100),
          base: Math.min(60 + (i * 4), 100),
          pessimistic: Math.min(60 + (i * 8), 100)
        }));
        setData(fallbackData);
      } finally {
        setLoading(false);
      }
    }
    
    fetchForecast();
  }, [jobKey, baseYear]);

  const activeCurveKey = sliderIndex === 0 ? 'pessimistic' : sliderIndex === 1 ? 'base' : 'optimistic';
  const labelColor = sliderIndex === 0 ? 'var(--red)' : sliderIndex === 1 ? 'var(--text2)' : 'var(--emerald)';

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
        {sliderIndex === 1 && (
           <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--violet)' }}>Includes Live Swarm Adoption Velocity</div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '40px 16px', maxWidth: 900, margin: '0 auto' }}>
      <div className="reveal" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 4, height: 32, background: 'var(--violet)', borderRadius: 2 }} />
          <h2 style={{ fontFamily: 'var(--mono)', fontSize: '1.5rem', color: 'var(--violet-light)' }}>
            Displacement Timeline Forecast
          </h2>
        </div>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginLeft: 16 }}>
          Projected risk trajectory {baseYear}–{baseYear + 5} — Dynamic modeling powered by the Swarm Intel API layer.
        </p>
      </div>

      {currentScore === null && (
        <div style={{ padding: '14px 18px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 10, marginBottom: 24, fontSize: '0.875rem', color: '#FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span>Complete a risk calculator to personalise your forecast. Showing baseline standard for role.</span>
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

      {error && (
        <div style={{ padding: '10px 16px', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 10, marginBottom: 24, fontSize: '0.8rem', color: 'var(--red)' }}>
          {error}
        </div>
      )}

      {/* Upskilling Interactive Slider */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text)', margin: 0 }}>Interactive Trajectory Planner</h3>
          <div style={{ fontSize: '0.8rem', color: labelColor, fontFamily: 'var(--mono)' }}>
            {sliderIndex === 0 ? 'Pessimistic Scenario' : sliderIndex === 1 ? 'Base Scenario' : 'Optimistic Scenario'}
          </div>
        </div>
        <input 
          type="range" 
          min="0" 
          max="2" 
          step="1" 
          value={sliderIndex} 
          onChange={(e) => setSliderIndex(parseInt(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: labelColor }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: '0.75rem', color: 'var(--text2)' }}>
          <span>No Upskilling (Passive)</span>
          <span>Moderate Upskilling (Current)</span>
          <span>Intense AI Upskilling</span>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 12 }}>
        {loading ? (
          <div style={{ width: '100%', height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
            Querying edge intelligence and live signals...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fill: 'var(--text2)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text2)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Legend formatter={(value) => <span style={{ color: 'var(--text2)', fontSize: '0.8rem', textTransform: 'capitalize' }}>{value}</span>} wrapperStyle={{ paddingTop: 16 }} />
              <ReferenceLine
                y={threshold}
                stroke="rgba(255,71,87,0.3)"
                strokeDasharray="4 4"
                label={{ value: `Displacement threshold`, fill: 'rgba(255,71,87,0.6)', fontSize: 10 }}
              />
              {/* Render dynamic curves - highlight the active one */}
              <Line type="monotone" dataKey="pessimistic" stroke="var(--red)" strokeWidth={sliderIndex === 0 ? 3 : 1} dot={{ r: sliderIndex === 0 ? 5 : 2 }} strokeOpacity={sliderIndex === 0 ? 1 : 0.3} />
              <Line type="monotone" dataKey="base" stroke="var(--text2)" strokeWidth={sliderIndex === 1 ? 3 : 1} dot={{ r: sliderIndex === 1 ? 5 : 2 }} strokeDasharray="4 4" strokeOpacity={sliderIndex === 1 ? 1 : 0.3} />
              <Line type="monotone" dataKey="optimistic" stroke="var(--emerald)" strokeWidth={sliderIndex === 2 ? 3 : 1} dot={{ r: sliderIndex === 2 ? 5 : 2 }} strokeOpacity={sliderIndex === 2 ? 1 : 0.3} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ marginBottom: 24, fontSize: '0.75rem', color: 'var(--text2)', textAlign: 'center' }}>
        Live Macro-signals bridged via edge workers · Logistic Growth Model · WEF Future of Jobs 2025 · McKinsey State of AI
      </div>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button
          onClick={() => onNavigate?.('roadmap')}
          style={{ background: 'var(--violet)', color: 'white', border: 'none', borderRadius: 8, padding: '12px 32px', fontFamily: 'var(--mono)', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          Start Your Transition Roadmap Now →
        </button>
      </div>
    </div>
  );
}
