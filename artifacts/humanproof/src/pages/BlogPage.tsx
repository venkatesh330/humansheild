import React from 'react';
import { Sparkles, TrendingUp, Cpu, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const posts = [
  {
    title: 'The Human Advantage in the Generative AI Era',
    excerpt: 'Why emotional intelligence and strategic synthesis are becoming the most valuable assets in the modern labor market.',
    date: '01.04.2026',
    readTime: '6 MIN READ',
    icon: Sparkles,
    iconColor: 'var(--cyan)',
    iconBg: 'rgba(0,213,224,0.08)',
    tag: 'Deep Dive',
  },
  {
    title: 'Top 10 Anti-Fragile Careers for 2026',
    excerpt: 'Detailed analysis of sectors that are thriving despite the rapid advancement of neural automation cycles.',
    date: '28.03.2026',
    readTime: '8 MIN READ',
    icon: TrendingUp,
    iconColor: 'var(--emerald)',
    iconBg: 'rgba(16,185,129,0.08)',
    tag: 'Analysis',
  },
  {
    title: 'Building an Anti-Fragile Career Portfolio',
    excerpt: 'Advanced strategies for diversifying professional signals to survive and thrive during extreme market volatility.',
    date: '15.03.2026',
    readTime: '12 MIN READ',
    icon: Cpu,
    iconColor: 'var(--text-3)',
    iconBg: 'rgba(255,255,255,0.04)',
    tag: 'Strategy',
  },
];

export const BlogPage: React.FC = () => {
  return (
    <div className="page-wrap" style={{ background: 'var(--bg)' }}>
      <div className="container">

        {/* Hero */}
        <motion.div
          className="section-hero reveal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '72px' }}
        >
          <div className="badge badge-ghost" style={{ marginBottom: '20px' }}>Intelligence Stream</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 0.95,
            marginBottom: '20px',
          }}>
            Field<br />
            <span style={{ background: 'linear-gradient(135deg, var(--text) 0%, var(--text-3) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>
              Reports.
            </span>
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '1.1rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Deep-dives into the architecture of the new labor economy.
          </p>
        </motion.div>

        {/* Posts Grid */}
        <div className="grid-3" style={{ marginBottom: '80px' }}>
          {posts.map((post, i) => {
            const Icon = post.icon;
            return (
              <motion.article
                key={i}
                className="card card-hover reveal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                style={{
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  height: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '12px',
                    background: post.iconBg,
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} color={post.iconColor} />
                  </div>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: post.iconColor, background: post.iconBg,
                    border: `1px solid ${post.iconBg.replace('0.08', '0.2')}`,
                    padding: '3px 10px', borderRadius: 'var(--radius-full)',
                  }}>
                    {post.tag}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.35,
                  letterSpacing: '-0.02em', color: 'var(--text)',
                  marginBottom: '12px', flex: 1,
                }}>
                  {post.title}
                </h3>

                <p style={{
                  color: 'var(--text-3)', fontSize: '0.85rem', lineHeight: 1.65,
                  marginBottom: '24px',
                }}>
                  {post.excerpt}
                </p>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingTop: '20px', borderTop: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                      {post.date}
                    </span>
                    <span style={{ color: 'var(--text-3)', fontSize: '0.7rem' }}>·</span>
                    <span style={{ color: 'var(--cyan)', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {post.readTime}
                    </span>
                  </div>
                  <ArrowRight size={14} color="var(--text-3)" />
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Coming soon */}
        <div style={{
          padding: '48px', textAlign: 'center',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '60px',
        }}>
          <span className="label-xs" style={{ color: 'var(--text-3)' }}>
            Intelligence gathering in progress — more field reports coming soon.
          </span>
        </div>
      </div>
    </div>
  );
};
