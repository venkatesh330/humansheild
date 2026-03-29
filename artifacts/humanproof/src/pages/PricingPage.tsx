import { useState } from 'react';
import { KEY_REGISTRY } from '../data/riskData';

interface PricingPageProps {
  onNavigate: (page: string) => void;
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'Forever free',
    featured: false,
    badge: null,
    features: [
      'Full AI Displacement Calculator',
      '250+ job types, 70+ countries',
      '6-dimension risk score',
      'At-risk task breakdown',
      'AI-resistant skill insights',
      'Career pivot suggestions',
      '3 calculations per day',
    ],
    btnLabel: 'Start Free →',
    btnClass: '',
    action: 'free',
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month, billed monthly',
    featured: true,
    badge: 'Most Popular',
    features: [
      'Unlimited calculator runs',
      'PDF report for every score',
      'All 12+ resources & guides',
      'All Notion templates',
      'Quarterly data update alerts',
      'Team assessment (up to 5)',
      'Priority email support',
      'API access (100 calls/mo)',
    ],
    btnLabel: 'Join Waitlist →',
    btnClass: 'primary',
    action: 'waitlist',
  },
  {
    name: 'Team',
    price: '$79',
    period: 'per month, billed monthly',
    featured: false,
    badge: null,
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Team risk dashboard',
      'Custom industry reports',
      'White-label reports',
      'Dedicated account manager',
      'Slack integration',
      'Unlimited API access',
    ],
    btnLabel: 'Contact Sales →',
    btnClass: '',
    action: 'sales',
  },
];

const faqs = [
  {
    q: 'How accurate is the AI Displacement Index?',
    a: 'Scores are calibrated against 8 major research reports (McKinsey, Goldman Sachs, WEF, OECD, Stanford HAI, MIT, BCG, Anthropic). High-confidence roles have ±3% error bands; moderate-confidence ±7%. We update quarterly as new data emerges.'
  },
  {
    q: 'What does "AI-Resistant" mean exactly?',
    a: 'AI-Resistant doesn\'t mean "impossible to automate" — it means the combination of human judgment, relationship depth, physical presence, and contextual reasoning required makes displacement economically or technically impractical in the 2026–2030 window.'
  },
  {
    q: 'How often is the data updated?',
    a: 'We update the underlying data tables every quarter as major research reports are published. Pro subscribers receive alerts when scores for their industry change significantly. Current data: Q1 2026.'
  },
  {
    q: 'Can I use HumanProof for my team or HR function?',
    a: 'Yes. The Team plan gives you a full team risk dashboard, allowing HR leaders and managers to assess their workforce\'s AI exposure and plan upskilling investments accordingly.'
  },
  {
    q: 'Is the calculator really free?',
    a: 'Yes — 3 full calculations per day on the free tier, with complete score breakdowns, skill analysis, and career pivots. No credit card, no signup required.'
  },
  {
    q: 'What is the new Social Capital Moat dimension (D6)?',
    a: 'D6 is a new dimension (11% weight) that quantifies how much your professional network and relationship dependencies protect you from AI displacement. Based on MIT Sloan research showing that roles with high network dependency are 2.3× more resilient.'
  },
];

function WaitlistModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const RFC5322 = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!RFC5322.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    localStorage.setItem(KEY_REGISTRY.WAITLIST_EMAIL, email);
    setSubmitted(true);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--bg2, #111827)', border: '1px solid rgba(0,245,255,0.25)',
        borderRadius: 16, padding: '40px 36px', maxWidth: 480, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '1.3rem' }}
        >×</button>

        {!submitted ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚀</div>
              <h2 style={{ fontFamily: 'var(--heading)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>
                Join the Pro Waitlist
              </h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                HumanProof Pro is coming. Be first in line for unlimited calculations, PDF reports, team assessments, and quarterly data alerts.
              </p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="your@email.com"
                required
                style={{
                  padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
                  borderRadius: 8, color: 'var(--text)', fontSize: '0.95rem',
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
              {error && <div style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{error}</div>}
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: '0.92rem', width: '100%', justifyContent: 'center' }}
              >
                Reserve My Spot →
              </button>
              <p style={{ color: 'var(--text2)', fontSize: '0.72rem', textAlign: 'center' }}>
                No spam. No credit card. Unsubscribe anytime.
              </p>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: 'var(--heading)', fontSize: '1.3rem', fontWeight: 800, marginBottom: 12, color: 'var(--emerald)' }}>
              You're on the list!
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 24 }}>
              We'll email you at <strong style={{ color: 'var(--cyan)' }}>{email}</strong> when Pro launches. You'll get a founding member discount.
            </p>
            <button className="btn-teal" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PricingPage({ onNavigate }: PricingPageProps) {
  const [showWaitlist, setShowWaitlist] = useState(false);

  const handlePlanClick = (action: string) => {
    if (action === 'free') onNavigate('calculator');
    else if (action === 'waitlist' || action === 'sales') setShowWaitlist(true);
  };

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      {showWaitlist && <WaitlistModal onClose={() => setShowWaitlist(false)} />}

      <section className="section" style={{ paddingBottom: 60 }}>
        <div className="section-header">
          <div className="section-label reveal">Transparent Pricing</div>
          <h1 className="section-title reveal">Simple Plans for Every Professional</h1>
          <p className="section-desc reveal">
            Start free, upgrade when you need depth. No dark patterns, no hidden fees. Cancel anytime.
          </p>
        </div>
        <div className="pricing-grid">
          {plans.map(plan => (
            <div key={plan.name} className={`pricing-card tilt reveal${plan.featured ? ' featured' : ''}`}>
              {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
              <div className="pricing-name">{plan.name}</div>
              <div className="pricing-price">{plan.price}<span>/mo</span></div>
              <div className="pricing-period">{plan.period}</div>
              <ul className="pricing-features">
                {plan.features.map((f, i) => (
                  <li key={i}>
                    <span className="pricing-check">✓</span>
                    <span style={{ color: 'var(--text)' }}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`pricing-btn ${plan.btnClass}`}
                onClick={() => handlePlanClick(plan.action)}
              >
                {plan.btnLabel}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="section-header" style={{ marginBottom: 48 }}>
            <div className="section-label reveal">FAQ</div>
            <h2 className="section-title reveal">Frequently Asked Questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {faqs.map((faq, i) => (
              <div key={i} className="card reveal" style={{ padding: '20px 24px' }}>
                <h3 style={{ fontFamily: 'var(--heading)', fontSize: '0.98rem', marginBottom: 10, color: 'var(--cyan)' }}>{faq.q}</h3>
                <p style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: 1.7 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 className="section-title reveal">Still Have Questions?</h2>
          <p style={{ color: 'var(--text2)', margin: '16px auto 32px', lineHeight: 1.7 }} className="reveal">
            Our team is happy to walk you through the methodology, discuss team plans, or answer any questions about your specific role.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }} className="reveal">
            <button className="btn-teal" onClick={() => setShowWaitlist(true)}>Join Waitlist</button>
            <button className="btn-primary" onClick={() => onNavigate('calculator')}>Try Calculator Free →</button>
          </div>
        </div>
      </section>
    </div>
  );
}
