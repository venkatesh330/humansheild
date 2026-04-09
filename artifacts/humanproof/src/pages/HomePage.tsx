import { useNavigate } from 'react-router-dom';

const DIMENSIONS = [
  { id: 'D1', title: 'Task Automatability',  weight: '26%', desc: 'Real-time automation depth for role-specific tasks via Gemma 4 and Gemini 1.5 Ultra.', color: 'var(--cyan)' },
  { id: 'D2', title: 'Tool Maturity',        weight: '18%', desc: 'Evaluation of production-ready AI models currently deployed in your specific industry.', color: '#818cf8' },
  { id: 'D3', title: 'Human Amplification',  weight: '20%', desc: 'How effectively AI scales a skilled practitioner vs direct replacement of labor.', color: 'var(--emerald)' },
  { id: 'D4', title: 'Experience Shield',    weight: '16%', desc: 'The protective moat of tacit knowledge and seniority in non-algorithmic settings.', color: '#94a3b8' },
  { id: 'D5', title: 'Regulatory Guard',     weight: '9%',  desc: 'Legislative and policy-driven protection levels across 72 different jurisdictions.', color: '#60a5fa' },
  { id: 'D6', title: 'Social Capital',       weight: '11%', desc: 'Relationship-heavy dependencies and emotional intelligence irreplacability index.', color: 'var(--amber)' },
];

const STATS = [
  { value: '4.8B+', label: 'Data Nodes' },
  { value: '250+',  label: 'Audit Points' },
  { value: '98.4%', label: 'Risk Accuracy' },
  { value: '24H',   label: 'Update Cycle' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'calc(var(--nav-h) + 64px) 24px 80px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Ambient orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div className="reveal" style={{
            position: 'absolute', top: '20%', right: '10%',
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(60px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', left: '5%',
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(80px)',
          }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
          {/* Live badge */}
          <div className="badge badge-ghost reveal" style={{ marginBottom: '32px', gap: '8px' }}>
            <span style={{ width: 6, height: 6, background: 'var(--emerald)', borderRadius: '50%', animation: 'pulse-dot 2.5s ease-in-out infinite' }} />
            Standard Q1 2026 Audit Complete
          </div>

          <h1 className="display-1 reveal" style={{ marginBottom: '24px', lineHeight: 1.0 }}>
            Is Your Career<br />
            <span className="gradient-text" style={{
              background: 'linear-gradient(135deg, var(--text) 0%, var(--text-3) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontStyle: 'italic',
            }}>Irreplaceable?</span>
          </h1>

          <p className="reveal reveal-delay-1" style={{
            color: 'var(--text-2)',
            fontSize: '1.15rem',
            maxWidth: 600,
            margin: '0 auto 48px',
            lineHeight: 1.7,
            fontWeight: 500,
          }}>
            The high-fidelity standard for AI displacement auditing.
            Built on verified Gemma 4 datasets from 12 global research institutions.
          </p>

          <div className="reveal reveal-delay-2" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '72px' }}>
            <button className="btn btn-primary btn-xl" onClick={() => navigate('/calculator')}>
              Run AI Risk Audit →
            </button>
            <button className="btn btn-secondary btn-xl" onClick={() => navigate('/safe-careers')}>
              View Safe Careers
            </button>
          </div>

          {/* Stats row */}
          <div className="reveal reveal-delay-3" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            maxWidth: 700,
            margin: '0 auto',
          }}>
            {STATS.map(s => (
              <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px 12px' }}>
                <div className="stat-value" style={{ fontSize: '1.75rem', marginBottom: '6px' }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6-DIMENSION MODEL ─────────────────────────────────────────────── */}
      <section style={{ padding: '120px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <div className="section-hero reveal" style={{ marginBottom: '64px' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '20px' }}>Engine Core</div>
          <h2 className="display-2" style={{ marginBottom: '16px' }}>6-Dimension Analysis</h2>
          <p style={{ color: 'var(--text-2)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            The most rigorous risk model in the ecosystem, weighing task-specific automation against human irreplacability benchmarks.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {DIMENSIONS.map((d, i) => (
            <div key={d.id} className={`card card-hover reveal reveal-delay-${(i % 3) + 1}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <span className="badge badge-ghost">{d.id}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.05em', color: d.color }}>{d.weight}</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.02em' }}>{d.title}</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.65 }}>{d.desc}</p>
              <div style={{ marginTop: '20px', height: '2px', width: '40px', background: d.color, borderRadius: '1px', opacity: 0.7 }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 120px', maxWidth: 1280, margin: '0 auto' }}>
        <div className="divider" />
        <div className="section-hero reveal" style={{ marginBottom: '64px' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '20px' }}>Process</div>
          <h2 className="display-2" style={{ marginBottom: '16px' }}>Three Steps to Clarity</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { num: '01', title: 'Select Your Role', desc: 'Choose your industry cluster and specific role designation from our 250+ verified job taxonomy.', action: null },
            { num: '02', title: 'Run the Audit', desc: 'Our 6-dimension engine calculates your displacement risk score with Gemma 4 AI verification.', action: null },
            { num: '03', title: 'Take Action', desc: 'Get curated upskilling pathways, safe career alternatives, and quarterly drift alerts.', action: '/calculator' },
          ].map((step, i) => (
            <div key={step.num} className={`card reveal reveal-delay-${i + 1}`} style={{ padding: '40px 32px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 900, color: 'var(--border-2)', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: '24px' }}>{step.num}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px' }}>{step.title}</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: step.action ? '24px' : '0' }}>{step.desc}</p>
              {step.action && (
                <button className="btn btn-primary" onClick={() => navigate(step.action as string)}>
                  Start Audit →
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section style={{
        padding: '160px 24px',
        background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-raised) 100%)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="badge badge-cyan reveal" style={{ marginBottom: '32px' }}>Ready?</div>
          <h2 className="display-2 reveal" style={{ marginBottom: '24px' }}>Decode your<br />professional future.</h2>
          <p className="reveal" style={{ color: 'var(--text-2)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto 48px', lineHeight: 1.7 }}>
            Join thousands of professionals who've audited their AI displacement risk and secured their trajectory.
          </p>
          <button className="btn btn-primary btn-xl reveal" onClick={() => navigate('/calculator')}>
            Launch Risk Oracle
          </button>
        </div>
      </section>
    </div>
  );
}
