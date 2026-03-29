import { useState } from 'react';
import { useHumanProof } from '../context/HumanProofContext';

// NEW-07: Resilience Badge
// Unlocks when: HII > 70 AND Job Risk < 40 AND Skill Risk < 45
// Downloadable SVG badge with LinkedIn sharing copy

function getCompositeScore(jobRisk: number | null, skillRisk: number | null, hii: number | null): number | null {
  const scores = [jobRisk, skillRisk, hii].filter(s => s !== null) as number[];
  if (scores.length === 0) return null;
  // Composite: invert risk scores, average all
  const plotScores = [
    jobRisk !== null ? 100 - jobRisk : null,
    skillRisk !== null ? 100 - skillRisk : null,
    hii,
  ].filter(s => s !== null) as number[];
  return Math.round(plotScores.reduce((a, b) => a + b, 0) / plotScores.length);
}

export default function ResilienceBadge() {
  const { state } = useHumanProof();
  const [copied, setCopied] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  const { jobRiskScore, skillRiskScore, humanScore } = state;
  const unlocked = (humanScore ?? 0) > 70 && (jobRiskScore ?? 100) < 40 && (skillRiskScore ?? 100) < 45;

  if (!unlocked) return null;

  const composite = getCompositeScore(jobRiskScore, skillRiskScore, humanScore);
  const year = new Date().getFullYear();

  const svgBadge = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180" viewBox="0 0 400 180">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d0d1a"/>
      <stop offset="100%" style="stop-color:#111128"/>
    </linearGradient>
    <linearGradient id="border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00FF9F"/>
      <stop offset="100%" style="stop-color:#00F5FF"/>
    </linearGradient>
  </defs>
  <rect width="400" height="180" rx="16" fill="url(#bg)"/>
  <rect x="2" y="2" width="396" height="176" rx="14" fill="none" stroke="url(#border)" stroke-width="2"/>
  <text x="200" y="38" font-family="monospace" font-size="11" fill="#9BA5B4" text-anchor="middle" letter-spacing="3">AI-RESILIENT PROFESSIONAL</text>
  <text x="200" y="80" font-family="monospace" font-size="42" font-weight="700" fill="#00FF9F" text-anchor="middle">${composite}</text>
  <text x="200" y="100" font-family="monospace" font-size="11" fill="#00F5FF" text-anchor="middle">Human-Proof Resilience Score</text>
  <text x="200" y="130" font-family="monospace" font-size="13" font-weight="600" fill="#e8e8f0" text-anchor="middle">HumanProof · ${year}</text>
  <text x="200" y="152" font-family="monospace" font-size="9" fill="#4B5563" text-anchor="middle">humanproof.app · Verified Assessment</text>
</svg>`;

  const handleDownload = () => {
    const blob = new Blob([svgBadge], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `humanproof-badge-${year}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const linkedInCopy = `🏆 I just earned my AI-Resilient Professional badge on HumanProof!\n\nComposite score: ${composite}/100 — placing me in the top resilience tier for my field.\n\nKey results:\n• Job AI Risk: ${jobRiskScore} (${jobRiskScore && jobRiskScore < 30 ? 'Very Low' : 'Low'})\n• Skill AI Risk: ${skillRiskScore} (${skillRiskScore && skillRiskScore < 35 ? 'Very Low' : 'Low'})\n• Human Index: ${humanScore}/100\n\nTest your own AI resilience at humanproof.app #AIResilience #FutureOfWork #HumanProof`;

  const handleCopyLinkedIn = async () => {
    try {
      await navigator.clipboard.writeText(linkedInCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {}
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0,255,159,0.06), rgba(0,245,255,0.06))',
      border: '1px solid rgba(0,255,159,0.4)',
      borderRadius: 16,
      padding: '24px 28px',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00FF9F, #00F5FF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', flexShrink: 0,
        }}>🏆</div>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Achievement Unlocked</div>
          <div style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.1rem' }}>AI-Resilient Professional</div>
        </div>
        <div style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--emerald)' }}>{composite}</div>
      </div>

      <p style={{ color: 'var(--text2)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 16 }}>
        Your combined assessment results place you in the top resilience tier. Job Risk &lt;40, Skill Risk &lt;45, and Human Index &gt;70 — all three thresholds met simultaneously.
      </p>

      <button
        onClick={() => setShowBadge(!showBadge)}
        style={{
          background: 'rgba(0,255,159,0.12)', border: '1px solid rgba(0,255,159,0.4)',
          color: 'var(--emerald)', borderRadius: 8, padding: '8px 16px',
          fontFamily: 'var(--mono)', fontSize: '0.75rem', cursor: 'pointer',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: showBadge ? 16 : 0,
        }}
      >
        {showBadge ? 'Hide Badge' : 'View Badge →'}
      </button>

      {showBadge && (
        <div style={{ marginTop: 0 }}>
          <div
            style={{ maxWidth: 400, margin: '0 auto 16px', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,255,159,0.15)' }}
            dangerouslySetInnerHTML={{ __html: svgBadge }}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={handleDownload}
              style={{
                background: 'rgba(0,255,159,0.12)', border: '1px solid rgba(0,255,159,0.4)',
                color: 'var(--emerald)', borderRadius: 8, padding: '8px 20px',
                fontFamily: 'var(--mono)', fontSize: '0.75rem', cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}
            >
              Download SVG
            </button>
            <button
              onClick={handleCopyLinkedIn}
              style={{
                background: copied ? 'rgba(0,255,159,0.2)' : 'rgba(0,245,255,0.12)',
                border: `1px solid ${copied ? 'rgba(0,255,159,0.6)' : 'rgba(0,245,255,0.4)'}`,
                color: copied ? 'var(--emerald)' : 'var(--cyan)',
                borderRadius: 8, padding: '8px 20px',
                fontFamily: 'var(--mono)', fontSize: '0.75rem', cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}
            >
              {copied ? '✓ Copied!' : 'Copy LinkedIn Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
