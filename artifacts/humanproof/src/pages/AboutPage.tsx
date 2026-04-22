import React from 'react';
import { Shield, Users, Target, Zap, TrendingUp, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VALUES = [
  { icon: Shield, title: 'Data Sovereignty', color: 'var(--cyan)', bg: 'var(--cyan-dim)', desc: 'Synthesizing global risk datasets into actionable intelligence for the individual professional.' },
  { icon: Users, title: 'Human Primacy', color: 'var(--emerald)', bg: 'var(--emerald-dim)', desc: 'Quantifying the irreducible moats: leadership, empathy, and strategic synthesis that AI cannot replicate.' },
  { icon: Target, title: 'Precision Upskilling', color: '#818cf8', bg: 'var(--violet-dim)', desc: 'Targeted pathways bridging legacy roles and future-proof careers using verified market intelligence.' },
  { icon: Zap, title: 'Velocity Intelligence', color: 'var(--amber)', bg: 'rgba(245,158,11,0.1)', desc: 'Delivering micro-adjustments today that secure professional trajectories for the next decade.' },
  { icon: TrendingUp, title: 'Continuous Auditing', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', desc: 'Quarterly refresh cycles keep your risk profile current with the rapidly evolving automation landscape.' },
  { icon: Database, title: 'Verified Datasets', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', desc: '9 tier-1 research datasets synthesized into a single, calibrated displacement risk model with ±3.4% accuracy.' },
];

const MILESTONES = [
  { year: '2024', label: 'Founded', desc: 'HumanShield born from a mission to bring data clarity to the AI displacement crisis.' },
  { year: 'Q2 \'24', label: 'First Dataset', desc: 'Partnered with McKinsey Global Institute to validate our first 50,000-role taxonomy.' },
  { year: 'Q4 \'24', label: 'Gemma Integration', desc: 'Deployed local-inference Gemma framework for real-time, privacy-first risk scoring.' },
  { year: 'Q1 \'26', label: 'Global Launch', desc: 'Expanded globally, covering thousands of role types across all major industry sectors.' },
];

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="page-wrap" style={{ background: 'var(--bg)' }}>
      <div className="container">

        {/* Hero */}
        <div className="section-hero reveal" style={{ marginBottom: '80px' }}>
          <div className="badge badge-ghost" style={{ marginBottom: '20px' }}>Our Mission</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 0.95,
            marginBottom: '20px',
          }}>
            Built for the<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--text) 0%, var(--text-3) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontStyle: 'italic',
            }}>Human Era.</span>
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '1.1rem', maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
            HumanShield was engineered to navigate the new frontier of labor. We solve for clarity in the AI transition — providing the highest-fidelity professional resilience intelligence available.
          </p>
        </div>

        {/* Values Grid */}
        <section style={{ marginBottom: '100px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '40px', textAlign: 'center' }}>
            Our Principles
          </h2>
          <div className="grid-3">
            {VALUES.map((v, i) => (
              <div key={v.title} className={`card card-hover reveal reveal-delay-${(i % 3) + 1}`} style={{ padding: '32px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: v.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <v.icon size={20} color={v.color} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.02em' }}>{v.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.65 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section style={{ marginBottom: '100px' }}>
          <div className="divider" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '48px', textAlign: 'center' }}>
            Our Journey
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {MILESTONES.map((m, i) => (
              <div key={i} className="reveal" style={{ display: 'flex', gap: '32px', paddingBottom: '40px', position: 'relative' }}>
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, border: '1px solid var(--border-cyan)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cyan-dim)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700, color: 'var(--cyan)', textAlign: 'center', lineHeight: 1.2 }}>{m.year}</span>
                  </div>
                  {i < MILESTONES.length - 1 && (
                    <div style={{ width: 1, flex: 1, marginTop: '8px', background: 'linear-gradient(180deg, var(--border-cyan) 0%, var(--border) 100%)', minHeight: '40px' }} />
                  )}
                </div>
                <div style={{ paddingTop: '12px' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '8px' }}>{m.label}</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.65 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="card card-cyan reveal" style={{ padding: '64px', textAlign: 'center' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '20px' }}>Get Started</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '16px' }}>
            Ready to Verify Your Future?
          </h2>
          <p style={{ color: 'var(--text-2)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Join thousands of professionals securing their trajectory through the HumanShield intelligence standard.
          </p>
          <button className="btn btn-primary btn-xl" onClick={() => navigate('/calculator')}>
            Take the Assessment →
          </button>
        </div>
      </div>
    </div>
  );
};
