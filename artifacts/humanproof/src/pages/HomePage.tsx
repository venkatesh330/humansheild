import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Search, Zap, BarChart3, Globe, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { RoleSelectorModal } from '../components/RoleSelectorModal';

const DIMENSIONS = [
  { id: 'D1', title: 'Task Automatability',  weight: '26%', desc: 'Real-time automation depth for role-specific tasks via frontier AI analytics.', color: '#00f0ff' },
  { id: 'D2', title: 'Tool Maturity',        weight: '18%', desc: 'Evaluation of production-ready AI models currently deployed in your specific industry.', color: '#a855f7' },
  { id: 'D3', title: 'Human Amplification',  weight: '20%', desc: 'How effectively AI scales a skilled practitioner vs direct replacement of labor.', color: '#10b981' },
  { id: 'D4', title: 'Experience Shield',    weight: '16%', desc: 'The protective moat of tacit knowledge and seniority in non-algorithmic settings.', color: '#94a3b8' },
  { id: 'D5', title: 'Regulatory Guard',     weight: '9%',  desc: 'Legislative and policy-driven protection levels across global jurisdictions.', color: '#3b82f6' },
  { id: 'D6', title: 'Social Capital',       weight: '11%', desc: 'Relationship-heavy dependencies and emotional intelligence irreplacability index.', color: '#f59e0b' },
];

const STATS = [
  { value: '4.8B+', label: 'Data Nodes', icon: Globe },
  { value: '250+',  label: 'Audit Points', icon: BarChart3 },
  { value: '98.4%', label: 'Risk Accuracy', icon: Shield },
  { value: '24H',   label: 'Update Cycle', icon: Zap },
];

const STEPS = [
  { num: '01', title: 'Select Your Role', desc: 'Choose your industry cluster and specific role designation from our 250+ verified job taxonomy.', icon: Search },
  { num: '02', title: 'Run the Audit', desc: 'Our 6-dimension engine calculates your displacement risk score with frontier AI systems verification.', icon: Activity },
  { num: '03', title: 'Take Action', desc: 'Get curated upskilling pathways, safe career alternatives, and professional drift alerts.', icon: Zap },
];

function Activity({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
      
      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'calc(var(--nav-h) + 60px) 24px 100px',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '600px', background: 'radial-gradient(circle, rgba(0, 240, 255, 0.05) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="badge badge-cyan" style={{ marginBottom: '32px', padding: '6px 16px' }}>
              <span className="nav-logo-dot" />
              Standard Q1 2026 Audit Active
            </div>

            <h1 className="display-1" style={{ marginBottom: '24px', maxWidth: '1000px', margin: '0 auto 24px' }}>
              Is Your Career<br />
              <span className="gradient-text-cyan" style={{ fontStyle: 'italic' }}>Irreplaceable?</span>
            </h1>

            <p style={{ 
              color: 'var(--text-2)', 
              fontSize: '1.25rem', 
              maxWidth: '800px', 
              margin: '0 auto 48px', 
              lineHeight: 1.6,
              fontWeight: 500
            }}>
              The ultimate high-fidelity standard for AI displacement auditing. 
              Powered by the world’s most advanced frontier AI systems analyzing 4.8 billion+ data nodes from 12 global research institutions.
            </p>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '80px' }}>
              <button className="btn btn-cyan btn-xl" onClick={() => setModalOpen(true)}>
                Run AI Risk Audit →
              </button>
              <button className="btn btn-secondary btn-xl" onClick={() => navigate('/safe-careers')}>
                View Safe Careers
              </button>
            </div>
          </motion.div>

          {/* Hero Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            style={{ position: 'relative', maxWidth: '900px', margin: '0 auto' }}
          >
            <img 
              src="/hero_shield.png" 
              alt="HumanShield Protection" 
              style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 0 50px rgba(0, 240, 255, 0.2))' }} 
            />
            {/* Holographic overlay bits */}
            <div style={{ position: 'absolute', top: '10%', right: '10%', padding: '12px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-cyan)', borderRadius: '12px', backdropFilter: 'blur(12px)', textAlign: 'left' }}>
              <div className="label-xs" style={{ color: 'var(--cyan)' }}>Shield Active</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>98.4% Accuracy</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── METRICS SECTION ──────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.02), transparent)' }}>
        <div className="container">
          <div className="grid-4">
            {STATS.map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="stat-block"
                style={{ textAlign: 'center' }}
              >
                <s.icon size={24} style={{ margin: '0 auto 16px', color: 'var(--cyan)', opacity: 0.8 }} />
                <div className="stat-value" style={{ fontSize: '3rem', marginBottom: '8px' }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6-DIMENSION ANALYSIS ─────────────────────────────────────────── */}
      <section id="dimensions" style={{ padding: '140px 0' }}>
        <div className="container">
          <div className="section-hero" style={{ marginBottom: '80px' }}>
            <div className="badge badge-violet" style={{ marginBottom: '24px' }}>Intelligence Core</div>
            <h2 className="display-2" style={{ marginBottom: '24px' }}>6-Dimension Analysis</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '1.1rem', maxWidth: '600px' }}>
              The most rigorous risk model in the ecosystem, weighing task-specific automation against human irreplacability benchmarks.
            </p>
          </div>

          <div className="grid-3">
            {DIMENSIONS.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card card-hover"
                style={{ 
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.02)',
                  minHeight: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <span className="badge badge-ghost" style={{ fontSize: '0.6rem' }}>{d.id} ANALYSIS</span>
                    <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                       {/* Animated Ring using SVG */}
                       <svg width="60" height="60" viewBox="0 0 60 60">
                         <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                         <motion.circle 
                           cx="30" cy="30" r="26" 
                           fill="none" 
                           stroke={d.color} 
                           strokeWidth="4" 
                           strokeDasharray="163.36"
                           initial={{ strokeDashoffset: 163.36 }}
                           whileInView={{ strokeDashoffset: 163.36 - (163.36 * parseInt(d.weight)) / 100 }}
                           viewport={{ once: true }}
                           transition={{ duration: 1.5, ease: "easeOut" }}
                         />
                       </svg>
                       <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900, color: d.color }}>
                         {d.weight}
                       </div>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>{d.title}</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.6 }}>{d.desc}</p>
                </div>
                <div style={{ marginTop: '24px', display: 'flex', gap: '4px' }}>
                  {[...Array(5)].map((_, j) => (
                    <div key={j} style={{ height: '3px', flex: 1, borderRadius: '2px', background: j < (parseInt(d.weight)/20) ? d.color : 'rgba(255,255,255,0.05)' }} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS SECTION ──────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '120px 0', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-hero" style={{ marginBottom: '100px' }}>
            <div className="badge badge-emerald" style={{ marginBottom: '24px' }}>Protocol</div>
            <h2 className="display-2">Three Steps to Clarity</h2>
          </div>

          <div style={{ position: 'relative' }}>
            {/* Timeline Line */}
            <div style={{ position: 'absolute', top: '40px', left: '0', right: '0', height: '2px', background: 'linear-gradient(90deg, transparent, var(--border-2), transparent)', zIndex: 0 }} />
            
            <div className="grid-3" style={{ position: 'relative', zIndex: 1 }}>
              {STEPS.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  style={{ textAlign: 'center', padding: '0 20px' }}
                >
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    background: 'var(--bg-raised)', 
                    border: '1px solid var(--border-2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 32px',
                    boxShadow: '0 0 30px rgba(0,0,0,0.5)',
                    position: 'relative'
                  }}>
                    <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '1px solid var(--border-cyan)', opacity: 0.3 }} />
                    <step.icon size={32} style={{ color: 'var(--cyan)' }} />
                    <div style={{ position: 'absolute', bottom: -10, background: 'var(--cyan)', color: '#000', fontSize: '0.7rem', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>{step.num}</div>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>{step.title}</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.6 }}>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '80px' }}>
            <button className="btn btn-primary btn-xl" onClick={() => setModalOpen(true)}>
              Start Audit →
            </button>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ─────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="label-xs" style={{ marginBottom: '40px' }}>Join 12,450+ professionals already shielded</p>
          <div style={{ display: 'flex', gap: '60px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', opacity: 0.4 }}>
            {/* Mock Institutional Badges */}
            <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.05em' }}>STANFORD AI</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.05em' }}>MIT MEDIA LAB</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.05em' }}>OXFORD INSIGHT</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.05em' }}>ETH ZÜRICH</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.05em' }}>CARNEGIE MELLON</div>
          </div>
          <div style={{ marginTop: '60px', display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '12px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '99px', border: '1px solid var(--border)' }}>
             <div style={{ display: 'flex', marginLeft: '8px' }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--bg)', marginLeft: i === 1 ? 0 : -8, background: '#333' }} />
                ))}
             </div>
             <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)' }}>"The most accurate career audit I've seen in 2026." — Sarah J.</span>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section style={{ 
        padding: '160px 0', 
        position: 'relative', 
        overflow: 'hidden',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 60%)', zIndex: 0 }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="badge badge-cyan" style={{ marginBottom: '32px' }}>Ready?</div>
            <h2 className="display-1" style={{ marginBottom: '32px' }}>Decode your<br />professional future.</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '1.2rem', maxWidth: '540px', margin: '0 auto 56px', lineHeight: 1.7 }}>
              Join thousands of professionals who've audited their AI displacement risk and secured their trajectory.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
               <button className="btn btn-cyan btn-xl" onClick={() => setModalOpen(true)}>
                 Launch Risk Oracle
               </button>
            </div>
            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
               <CheckCircle2 size={16} style={{ color: 'var(--emerald)' }} />
               <span className="label-xs" style={{ color: 'var(--text-3)' }}>Built on the world’s most advanced frontier AI</span>
            </div>
          </motion.div>
        </div>
      </section>

      <RoleSelectorModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
