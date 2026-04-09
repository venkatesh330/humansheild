import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const resources = [
  { tag: 'free',     tagLabel: 'Free',     title: 'AI Risk Score Calculator',             desc: '6-dimension calculator. 250+ roles, 70+ countries, Q1 2026 data. No signup required.',           emoji: '🧮' },
  { tag: 'guide',    tagLabel: 'Guide',    title: 'The 2026 AI-Resistance Playbook',       desc: 'A 40-page guide on building AI-resistant skills, personal moats, and career pivots. Based on 8 research reports.',                     emoji: '📖' },
  { tag: 'report',   tagLabel: 'Report',   title: 'State of AI Displacement: Q1 2026',    desc: 'Our quarterly data report tracking displacement velocity across 40+ industries with commentary from our research team.',                 emoji: '📊' },
  { tag: 'template', tagLabel: 'Template', title: 'Personal AI Risk Audit Template',      desc: 'A Notion template to assess your own role, document AI-resistant skills, and plan your transition timeline.',                           emoji: '📋' },
  { tag: 'guide',    tagLabel: 'Guide',    title: 'AI Tool Masterclass for Professionals', desc: 'Learn to use AI tools to 10× your productivity — so AI augments you instead of replacing you. Role-specific editions.',               emoji: '⚡' },
  { tag: 'report',   tagLabel: 'Report',   title: 'Country Risk Index 2026',              desc: 'Deep-dive on 70+ countries: AI adoption rates, regulatory protection, and net displacement exposure scores.',                          emoji: '🌍' },
  { tag: 'template', tagLabel: 'Template', title: 'Career Pivot Roadmap Template',        desc: 'A 90-day career pivot plan for professionals transitioning to AI-resistant roles. Includes skills gap analysis.',                       emoji: '🗺️' },
  { tag: 'guide',    tagLabel: 'Guide',    title: 'The AI-Resistant Skills Bible',        desc: 'A comprehensive catalogue of the skills AI cannot replicate in 2026 — with evidence from Stanford HAI and MIT.',                       emoji: '🛡️' },
  { tag: 'report',   tagLabel: 'Report',   title: "Healthcare & AI: What's Safe",         desc: 'Deep analysis of 40+ healthcare roles — from surgeons to medical coders — with detailed task-level breakdown.',                        emoji: '🏥' },
  { tag: 'guide',    tagLabel: 'Guide',    title: 'Software Engineering in the AI Era',   desc: 'How software engineers adapt: which roles are at risk, which are gaining leverage, and how to stay ahead.',                            emoji: '💻' },
  { tag: 'template', tagLabel: 'Template', title: 'Team AI Readiness Assessment',         desc: "Assess your entire team's AI exposure and create an upskilling roadmap. For managers and HR leaders.",                                emoji: '👥' },
  { tag: 'report',   tagLabel: 'Report',   title: 'BPO & Customer Service: The 2026 Reality', desc: "The sector with the highest displacement risk — what's happening now, and where workers can pivot.",                              emoji: '🎧' },
  { tag: 'guide',    tagLabel: 'Guide',    title: 'Social Capital & Network Moats',       desc: 'NEW: How to build the professional network depth that makes you 2.3× more resilient to automation. Based on MIT 2024 research.',      emoji: '🤝' },
];

const FILTERS = ['All', 'Free', 'Guides', 'Templates', 'Reports'] as const;
type Filter = typeof FILTERS[number];

const FILTER_MAP: Record<Filter, string | null> = {
  'All': null, 'Free': 'free', 'Guides': 'guide', 'Templates': 'template', 'Reports': 'report',
};

export default function ProductsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<Filter>('All');

  const filtered = activeFilter === 'All'
    ? resources
    : resources.filter(r => r.tag === FILTER_MAP[activeFilter]);

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      <div className="products-section">
        <div className="section-header">
          <div className="section-label reveal">Knowledge Base</div>
          <h1 className="section-title reveal">Resources & Tools</h1>
          <p className="section-desc reveal">
            Everything you need to understand AI displacement, protect your career, and build a path to AI-resistant work. Start free, upgrade for premium depth.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }} className="reveal">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '8px 20px',
                borderRadius: 24,
                border: activeFilter === f ? '1px solid var(--cyan)' : '1px solid var(--border)',
                background: activeFilter === f ? 'rgba(0,245,255,0.12)' : 'transparent',
                color: activeFilter === f ? 'var(--cyan)' : 'var(--text2)',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontFamily: 'inherit',
                fontWeight: activeFilter === f ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >{f}</button>
          ))}
        </div>

        <div className="resource-grid">
          {filtered.map((r, i) => (
            <div key={i} className="resource-card reveal">
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{r.emoji}</div>
              <div className={`resource-tag ${r.tag}`}>{r.tagLabel}</div>
              <div className="resource-title">{r.title}</div>
              <div className="resource-desc">{r.desc}</div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                {r.tag === 'free' ? (
                  <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '8px 16px' }} onClick={() => navigate('/calculator')}>
                    Use Free →
                  </button>
                ) : (
                  <button className="btn-teal" style={{ fontSize: '0.75rem', padding: '8px 16px' }} onClick={() => navigate('/pricing')}>
                    Get Access →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 80, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '48px 40px', textAlign: 'center' }} className="reveal">
          <h2 style={{ fontFamily: 'var(--heading)', fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, marginBottom: 12 }}>
            Want Unlimited Access?
          </h2>
          <p style={{ color: 'var(--text2)', maxWidth: 500, margin: '0 auto 28px', lineHeight: 1.7 }}>
            HumanProof Pro gives you unlimited calculator runs, all reports, all templates, team assessments, and quarterly updates delivered to your inbox.
          </p>
          <button className="btn-primary" onClick={() => navigate('/pricing')}>
            View Pricing Plans →
          </button>
        </div>
      </div>
    </div>
  );
}
