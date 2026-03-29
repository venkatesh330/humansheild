interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <>
      <div className="hero">
        <div className="hero-geo">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge reveal">
            <span className="hero-badge-dot" />
            AI Displacement Index · Q1 2026
          </div>
          <h1 className="hero-title reveal">
            Is Your Career<br />
            <span className="cyan">AI-Resistant</span>{' '}
            <span className="emerald">Enough?</span>
          </h1>
          <p className="hero-subtitle reveal">
            The most comprehensive AI job displacement calculator — built on 2026 data from McKinsey, Goldman Sachs, WEF and 6 other top research institutions. Free. No signup.
          </p>
          <div className="hero-stats reveal">
            <div className="hero-stat">
              <span className="hero-stat-num">4.8B+</span>
              <span className="hero-stat-label">Workers Analysed</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">1.8yr</span>
              <span className="hero-stat-label">Avg Timeline</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">250+</span>
              <span className="hero-stat-label">Jobs Analysed</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">6-D</span>
              <span className="hero-stat-label">Risk Model</span>
            </div>
          </div>
          <div className="hero-cta-row reveal">
            <button className="btn-primary" onClick={() => onNavigate('calculator')}>
              Calculate My Risk →
            </button>
            <button className="btn-teal" onClick={() => onNavigate('products')}>
              View Resources
            </button>
          </div>
        </div>
      </div>

      <div className="stat-band">
        <div className="stat-band-inner">
          <div className="stat-item reveal">
            <span className="stat-num">300M+</span>
            <span className="stat-label">Jobs exposed to automation by 2030 — Goldman Sachs 2026</span>
          </div>
          <div className="stat-item reveal">
            <span className="stat-num">40%</span>
            <span className="stat-label">Of working hours automatable with current AI — McKinsey Jan 2026</span>
          </div>
          <div className="stat-item reveal">
            <span className="stat-num">$4.4T</span>
            <span className="stat-label">Annual productivity gain from AI — BCG AI at Work Dec 2025</span>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="section-header">
          <div className="section-label reveal">The Science Behind The Score</div>
          <h2 className="section-title reveal">6-Dimension Risk Model</h2>
          <p className="section-desc reveal">Our formula weighs six independently validated dimensions — task automation, tool maturity, human amplification, experience shields, country exposure, and social capital moat.</p>
        </div>
        <div className="grid-3">
          <div className="card tilt reveal">
            <div className="card-icon red">⚡</div>
            <h3>D1 · Task Automatability (26%)</h3>
            <p>What % of role-specific tasks GPT-4o, Gemini 2.0, Claude 3.5 and Copilot automate TODAY — based on real enterprise deployment data Q1 2026.</p>
          </div>
          <div className="card tilt reveal">
            <div className="card-icon violet">🛠️</div>
            <h3>D2 · AI Tool Maturity (18%)</h3>
            <p>How production-ready and reliable are the best AI tools available for your specific role? Based on Anthropic, OpenAI and Google deployment reports Q1 2026.</p>
          </div>
          <div className="card tilt reveal">
            <div className="card-icon emerald">🔄</div>
            <h3>D3 · Human Amplification (20%)</h3>
            <p>Curved inversion: the more AI amplifies a skilled human, the lower the displacement risk. AI makes you 5× more productive? You're upgraded, not replaced.</p>
          </div>
          <div className="card tilt reveal">
            <div className="card-icon cyan">🛡️</div>
            <h3>D4 · Experience Shield (16%)</h3>
            <p>Role-specific seniority protection. A surgeon's experience is nearly irreplaceable at 92% sensitivity — a BPO agent's experience offers only 4% protection.</p>
          </div>
          <div className="card tilt reveal">
            <div className="card-icon violet">🌍</div>
            <h3>D5 · Country Exposure (9%)</h3>
            <p>Multiplicative net exposure: AI adoption rate minus regulatory protection. Germany (high adoption, strict AI Act) scores very differently from the USA.</p>
          </div>
          <div className="card tilt reveal">
            <div className="card-icon cyan">🤝</div>
            <h3>D6 · Social Capital Moat (11%)</h3>
            <p>NEW: MIT research shows roles with strong professional networks and relationship dependencies are 2.3× more likely to survive automation. Quantified for every role.</p>
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-header">
            <div className="section-label reveal">2026 Reality Check</div>
            <h2 className="section-title reveal">Where AI Has Already Arrived</h2>
            <p className="section-desc reveal">These aren't projections — they're deployment realities as of Q1 2026.</p>
          </div>
          <div className="grid-2">
            <div className="card reveal">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Risk Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>SEO Content Writer</td><td style={{color:'var(--red)',fontFamily:'var(--mono)',fontWeight:700}}>94/100</td><td><span className="risk-pill critical">Critical</span></td></tr>
                  <tr><td>Data Entry Clerk</td><td style={{color:'var(--red)',fontFamily:'var(--mono)',fontWeight:700}}>97/100</td><td><span className="risk-pill critical">Critical</span></td></tr>
                  <tr><td>Chat Support Agent</td><td style={{color:'var(--red)',fontFamily:'var(--mono)',fontWeight:700}}>96/100</td><td><span className="risk-pill critical">Critical</span></td></tr>
                  <tr><td>Payroll Processor</td><td style={{color:'var(--orange)',fontFamily:'var(--mono)',fontWeight:700}}>90/100</td><td><span className="risk-pill high">High</span></td></tr>
                  <tr><td>Graphic Designer</td><td style={{color:'var(--orange)',fontFamily:'var(--mono)',fontWeight:700}}>72/100</td><td><span className="risk-pill high">High</span></td></tr>
                </tbody>
              </table>
            </div>
            <div className="card reveal">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Risk Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Software Architect</td><td style={{color:'var(--yellow)',fontFamily:'var(--mono)',fontWeight:700}}>42/100</td><td><span className="risk-pill moderate">Moderate</span></td></tr>
                  <tr><td>UX Researcher</td><td style={{color:'var(--cyan)',fontFamily:'var(--mono)',fontWeight:700}}>28/100</td><td><span className="risk-pill low">Low</span></td></tr>
                  <tr><td>Strategy Consultant</td><td style={{color:'var(--cyan)',fontFamily:'var(--mono)',fontWeight:700}}>25/100</td><td><span className="risk-pill low">Low</span></td></tr>
                  <tr><td>Surgeon</td><td style={{color:'var(--emerald)',fontFamily:'var(--mono)',fontWeight:700}}>12/100</td><td><span className="risk-pill safe">AI-Resistant</span></td></tr>
                  <tr><td>Crisis Therapist</td><td style={{color:'var(--emerald)',fontFamily:'var(--mono)',fontWeight:700}}>10/100</td><td><span className="risk-pill safe">AI-Resistant</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="section-label reveal">What Makes Us Different</div>
          <h2 className="section-title reveal">Not Another AI Hype Site</h2>
          <p className="section-desc reveal">We cite sources. We show confidence bands. We update quarterly. We don't predict doom — we deliver actionable intelligence.</p>
        </div>
        <div className="grid-3">
          <div className="card reveal">
            <div className="card-icon emerald">📚</div>
            <h3>Source-Verified Data</h3>
            <p>Every score is peer-reviewed against published occupational task analyses from McKinsey, WEF, OECD, Goldman Sachs, Stanford HAI, MIT, and BCG.</p>
          </div>
          <div className="card reveal">
            <div className="card-icon cyan">🔄</div>
            <h3>Quarterly Updates</h3>
            <p>This isn't a set-and-forget model. We update data every quarter as new AI capabilities and enterprise deployment reports land. Current data: Q1 2026.</p>
          </div>
          <div className="card reveal">
            <div className="card-icon violet">🎯</div>
            <h3>Actionable Intelligence</h3>
            <p>Not just a score — we tell you the exact tasks being automated, the skills that still protect you, and concrete career transition paths to AI-resistant roles.</p>
          </div>
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg, rgba(124,58,255,0.08), rgba(0,245,255,0.04))', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 className="section-title reveal">Ready to Know Your Score?</h2>
          <p className="section-desc reveal" style={{ marginBottom: 32 }}>250+ job types. 70+ countries. 6-dimension model. Free. No signup required.</p>
          <button className="btn-primary reveal" onClick={() => onNavigate('calculator')} style={{ fontSize: '1rem', padding: '18px 40px' }}>
            Calculate My Risk Score →
          </button>
        </div>
      </section>
    </>
  );
}
