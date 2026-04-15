import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KEY_REGISTRY } from '../data/riskData';

const plans = [
  {
    name: 'Free',
    price: '$0',
    sub: 'No credit card required',
    badge: null,
    featured: false,
    cta: 'Start for Free →',
    action: 'free',
    features: [
      'Full AI Displacement Audit',
      'Thousands of job types worldwide',
      '6-dimension risk calibration',
      'At-risk task decomposition',
      '3 audit runs per month',
    ],
  },
  {
    name: 'Pro',
    price: '$19',
    sub: 'per month',
    badge: 'Most Popular',
    featured: true,
    cta: 'Start Pro Trial →',
    action: 'waitlist',
    features: [
      'Unlimited calculator audits',
      'High-fidelity PDF reports',
      'All 12+ resilience blueprints',
      'Quarterly risk drift alerts',
      'Priority AI analysis queue',
    ],
  },
  {
    name: 'Enterprise',
    price: '$79',
    sub: 'per seat / month',
    badge: null,
    featured: false,
    cta: 'Contact Sales →',
    action: 'sales',
    features: [
      'Everything in Pro',
      'Fleet-wide HR risk dashboard',
      'Custom sector analysis',
      'White-label audit reports',
      'Dedicated account manager',
    ],
  },
];

const faqs = [
  { q: 'How accurate is the risk assessment?', a: 'Audit nodes are calibrated against 8 global datasets (McKinsey, Goldman Sachs, WEF). Confidence margin: ±3.4% at 95th percentile.' },
  { q: 'What is the D6 Social Capital dimension?', a: 'Dimension 6 quantifies network irreplacability. Relationship-heavy roles show 2.3× higher resilience scores against automation pressure.' },
  { q: 'How often is data updated?', a: 'All data is synchronized quarterly. Pro subscribers receive real-time drift alerts whenever their sector\'s risk profile shifts significantly.' },
];

function WaitlistModal({ onClose, tier = 'pro' }: { onClose: () => void; tier?: string }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, tier }) });
      localStorage.setItem(KEY_REGISTRY.WAITLIST_EMAIL, email);
    } catch {}
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="overlay-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card modal-card" style={{ padding: '48px' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '1.2rem' }}
        >×</button>

        {!submitted ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div className="badge badge-cyan" style={{ marginBottom: '16px' }}>Join Waitlist</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '12px' }}>
                Get Early Access
              </h2>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>Be first in line for the Pro experience. No spam.</p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-wrap">
                <label className="input-label">Email Address</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@company.com"
                  required
                  className="input"
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg">
                {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Registering...</> : 'Reserve My Spot'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✓</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 900, color: 'var(--emerald)', letterSpacing: '-0.03em', marginBottom: '12px' }}>
              You're on the list!
            </h2>
            <p style={{ color: 'var(--text-2)', marginBottom: '32px' }}>We'll notify you when Pro access opens.</p>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="page-wrap" style={{ background: 'var(--bg)' }}>
      {showWaitlist && <WaitlistModal onClose={() => setShowWaitlist(false)} />}

      <div className="container">
        {/* Hero */}
        <div className="section-hero reveal" style={{ marginBottom: '64px' }}>
          <div className="badge badge-ghost" style={{ marginBottom: '20px' }}>Resource Allocation</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 8vw, 6rem)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 0.95,
            marginBottom: '20px',
          }}>
            Simple, Transparent<br />Pricing
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '1.1rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Verify your career risk with the high-fidelity standard. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Plans Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '100px' }}>
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`card reveal ${plan.featured ? 'card-featured' : 'card-hover'}`}
              style={{ padding: '36px', display: 'flex', flexDirection: 'column', position: 'relative' }}
            >
              {plan.badge && (
                <div className="badge badge-cyan" style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: '28px' }}>
                <span className="label-xs" style={{ display: 'block', marginBottom: '16px', color: plan.featured ? 'var(--cyan)' : 'var(--text-3)' }}>{plan.name}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--text)' }}>{plan.price}</span>
                  <span style={{ color: 'var(--text-3)', fontSize: '0.875rem', fontWeight: 500 }}>{plan.sub}</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', flex: 1 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingBottom: '12px', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-2)' }}>
                    <span style={{ color: 'var(--emerald)', fontWeight: 800, flexShrink: 0, marginTop: '1px' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => plan.action === 'free' ? navigate('/calculator') : setShowWaitlist(true)}
                className={`btn btn-full btn-lg ${plan.featured ? 'btn-primary' : 'btn-secondary'}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '32px', textAlign: 'center' }}>
            Common Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="card card-hover reveal"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ cursor: 'pointer', padding: '24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{faq.q}</h4>
                  <span style={{ color: 'var(--text-3)', fontSize: '1.2rem', flexShrink: 0, transition: 'transform 200ms', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </div>
                {openFaq === i && (
                  <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.7, marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
