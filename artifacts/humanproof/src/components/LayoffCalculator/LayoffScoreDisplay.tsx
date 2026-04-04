import React, { useState, useEffect } from 'react';
import { ScoreResult, ScoreBreakdown } from '../../services/layoffScoreEngine';
import { LayoffActionPlan } from './LayoffActionPlan';
import { layoffNewsCache } from '../../data/layoffNewsCache';

interface Props {
  result: ScoreResult;
  roleTitle: string;
  companyName: string;
  dataUpdatedDate?: string;
  onSave: () => void;
  onShare: () => void;
  onRetake: () => void;
  onSwitchTab?: (tabId: string) => void;
}

// Animated counter for score reveal
const AnimatedScore: React.FC<{ target: number; color: string; size: number }> = ({ target, color, size }) => {
  const [current, setCurrent] = useState(0);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dashoffset = circumference - (current / 100) * circumference;

  useEffect(() => {
    let frame: number;
    const duration = 1500;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  const getTierHex = (c: string) => {
    const map: Record<string, string> = { red: '#ef4444', orange: '#f97316', amber: '#f59e0b', green: '#10b981', teal: '#14b8a6' };
    return map[c] || '#14b8a6';
  };
  const hex = getTierHex(color);

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }} role="img" aria-label={`Layoff risk score: ${target} percent`}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={hex}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{ strokeDasharray: circumference, strokeDashoffset: dashoffset, transition: 'stroke 0.3s' }}
        />
      </svg>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{current}%</span>
        <span style={{ fontSize: '0.85rem', color: '#9ba5b4', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>layoff risk</span>
      </div>
    </div>
  );
};

const LayerBar: React.FC<{ label: string; value: number; weight: string }> = ({ label, value, weight }) => {
  const percentage = Math.round(value * 100);
  const getTierHex = (p: number) => {
    if (p > 70) return '#ef4444';
    if (p > 50) return '#f97316';
    if (p > 30) return '#f59e0b';
    return '#14b8a6';
  };
  const barColor = getTierHex(percentage);

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
        <span style={{ color: '#d1d5db' }}>{label} <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>({weight})</span></span>
        <span style={{ color: '#fff', fontFamily: 'monospace' }}>{percentage}/100</span>
      </div>
      <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentage}%`, background: barColor, borderRadius: '4px', transition: 'width 1s ease-out' }} />
      </div>
    </div>
  );
};

const ProUpsellTrigger: React.FC<{ score: number }> = ({ score }) => {
  if (score < 55) return null;
  return (
    <div style={{
      marginTop: '32px',
      background: 'linear-gradient(135deg, rgba(124,58,255,0.15), rgba(0,245,255,0.1))',
      border: '1px solid rgba(124,58,255,0.3)',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#fff' }}>Your risk is elevated. Get your full protection plan.</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', textAlign: 'left', color: '#d1d5db', fontSize: '0.95rem' }}>
        <li style={{ marginBottom: '8px' }}>✨ Real-time alerts when your score changes</li>
        <li style={{ marginBottom: '8px' }}>✨ Personalised 90-day job security plan</li>
        <li style={{ marginBottom: '8px' }}>✨ Monthly score recalculations</li>
        <li style={{ marginBottom: '8px' }}>✨ PDF export — "My Layoff Risk Report"</li>
        <li>✨ Compare your score to 1,000s in your industry</li>
      </ul>
      <button style={{
        background: 'var(--violet, #7C3AFF)',
        color: '#fff',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        width: '100%',
      }}>
        Start Pro — $9/month →
      </button>
      <p style={{ marginTop: '12px', marginBottom: 0, fontSize: '0.8rem', color: '#9ba5b4' }}>Cancel anytime. No commitments.</p>
    </div>
  );
};

// BUG-04 FIX: Show action plan for any elevated tier (amber=35+, orange=55+, red=75+)
// Tied to tier.color, not a raw score gate, so all amber/orange/red users get actions.
const shouldShowActionPlan = (tierColor: string): boolean => {
  return ['red', 'orange', 'amber'].includes(tierColor);
};

export const LayoffScoreDisplay: React.FC<Props> = ({ result, roleTitle, companyName, dataUpdatedDate, onSave, onShare, onRetake, onSwitchTab }) => {
  const { score, tier, breakdown, confidence, disclaimer } = result;

  const relevantNews = React.useMemo(() => {
    return layoffNewsCache.find(n => n.companyName.toLowerCase() === companyName.toLowerCase());
  }, [companyName]);

  const daysSinceUpdate = dataUpdatedDate
    ? Math.round((Date.now() - new Date(dataUpdatedDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isStale = daysSinceUpdate > 7;

  const getTierHex = (c: string) => {
    const map: Record<string, string> = { red: '#ef4444', orange: '#f97316', amber: '#f59e0b', green: '#10b981', teal: '#14b8a6' };
    return map[c] || '#14b8a6';
  };
  const tierHex = getTierHex(tier.color);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.5s ease-in' }}>

      {relevantNews && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <h4 style={{ color: '#ef4444', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠</span> Recent Layoff News Detected
          </h4>
          <p style={{ color: '#fff', margin: '0 0 8px', fontSize: '0.95rem' }}>{relevantNews.headline}</p>
          <div style={{ fontSize: '0.8rem', color: '#9ba5b4' }}>{new Date(relevantNews.date).toLocaleDateString()} · {relevantNews.source}</div>
        </div>
      )}

      {isStale && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', fontSize: '0.85rem', color: '#f59e0b' }}>
          ℹ Data was last refreshed {daysSinceUpdate} days ago. Signals may be slightly delayed.
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <AnimatedScore target={score} color={tier.color} size={220} />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          borderRadius: '20px',
          background: `${tierHex}18`,
          color: tierHex,
          border: `1px solid ${tierHex}`,
          fontWeight: 600,
          marginBottom: '16px',
        }}>
          {tier.label}
        </div>
        <p style={{ margin: 0, color: '#d1d5db', fontSize: '1.05rem', lineHeight: 1.5 }}>{tier.advice}</p>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#9ba5b4', fontSize: '0.9rem' }}>Data confidence:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ color: '#fff' }}>{confidence}</strong>
          <span title="Based on the number of public data points available for your company." style={{ cursor: 'help', color: '#6b7280' }}>ⓘ</span>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: '#fff', marginBottom: '24px' }}>What's driving your score</h3>
        <LayerBar label="Company health"    value={breakdown.L1} weight="30%" />
        <LayerBar label="Layoff history"    value={breakdown.L2} weight="25%" />
        <LayerBar label="Role exposure"     value={breakdown.L3} weight="25%" />
        <LayerBar label="Market conditions" value={breakdown.L4} weight="12%" />
        <LayerBar label="Your profile"      value={breakdown.L5} weight="8%"  />
      </div>

      <p style={{
        fontSize: '0.8rem',
        color: '#6b7280',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '32px',
      }}>
        {disclaimer}
      </p>

      {/* BUG-04 FIX: Show action plan based on tier color (amber/orange/red), not raw score gate */}
      {shouldShowActionPlan(tier.color) && (
        <LayoffActionPlan
          score={score}
          tierColor={tier.color}
          role={roleTitle}
          onSwitchTab={onSwitchTab}
        />
      )}

      <ProUpsellTrigger score={score} />

      <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
        <button onClick={onSave} aria-label="Save score to history" style={{ flex: 1, padding: '12px', background: 'rgba(0,245,255,0.1)', color: 'var(--cyan, #00F5FF)', border: '1px solid rgba(0,245,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
          Save to history
        </button>
        <button onClick={onShare} aria-label="Share score" style={{ flex: 1, padding: '12px', background: 'var(--cyan, #00F5FF)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
          Share my score
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button onClick={onRetake} aria-label="Recalculate with different inputs" style={{ background: 'none', border: 'none', color: '#9ba5b4', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}>
          Recalculate with different inputs
        </button>
      </div>
    </div>
  );
};
