import React, { useState } from 'react';
import { Mail, MessageSquare, Globe, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const CONTACTS = [
  {
    icon: Mail,
    title: 'Liaison Support',
    value: 'support@humanproof.ai',
    color: 'var(--cyan)',
    bg: 'rgba(0,213,224,0.07)',
  },
  {
    icon: MessageSquare,
    title: 'Live Support',
    value: 'Mon–Sun · Neural Chat',
    color: 'var(--emerald)',
    bg: 'rgba(16,185,129,0.07)',
  },
  {
    icon: Globe,
    title: 'Global HQ',
    value: 'One Tech Plaza, New York, NY 10001',
    color: 'var(--text-3)',
    bg: 'rgba(255,255,255,0.04)',
  },
];

export const ContactPage: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    await new Promise((r) => setTimeout(r, 1200));
    setStatus('done');
    setFormState({ name: '', email: '', message: '' });
    setTimeout(() => setStatus('idle'), 4000);
  };

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
          <div className="badge badge-ghost" style={{ marginBottom: '20px' }}>Get In Touch</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 0.95,
            marginBottom: '20px',
          }}>
            Direct<br />
            <span style={{ background: 'linear-gradient(135deg, var(--text) 0%, var(--text-3) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>
              Transmission.
            </span>
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '1.1rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Our team is ready to assist with protocol inquiries and enterprise integrations.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', maxWidth: 1000, margin: '0 auto', paddingBottom: '80px' }}>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            {CONTACTS.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '14px',
                    background: item.bg, border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'border-color 200ms',
                  }}>
                    <Icon size={18} color={item.color} />
                  </div>
                  <div>
                    <div className="label-xs" style={{ marginBottom: '6px', color: 'var(--text-3)' }}>{item.title}</div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', margin: 0 }}>{item.value}</p>
                  </div>
                </div>
              );
            })}

            {/* Extra info box */}
            <div style={{ marginTop: '8px', padding: '20px', background: 'rgba(0,213,224,0.04)', border: '1px solid rgba(0,213,224,0.12)', borderRadius: 'var(--radius-lg)' }}>
              <p className="label-xs" style={{ color: 'var(--cyan)', marginBottom: '8px' }}>Enterprise Inquiries</p>
              <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.65, margin: 0 }}>
                For fleet-wide HR deployments, custom sector intelligence, or white-label solutions — use the form and select "Enterprise" in your message.
              </p>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            className="card"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{ padding: '36px', position: 'relative', overflow: 'hidden' }}
          >
            {/* Accent glow */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 160, height: 160, background: 'radial-gradient(circle, rgba(0,213,224,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {status === 'done' ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✓</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.25rem', color: 'var(--emerald)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                  Message Received
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>
                  Our team will respond within 1 business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
                <div>
                  <label className="label-xs" style={{ display: 'block', marginBottom: '8px' }}>Your Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Full name"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label-xs" style={{ display: 'block', marginBottom: '8px' }}>Email Address</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@company.com"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label-xs" style={{ display: 'block', marginBottom: '8px' }}>Message</label>
                  <textarea
                    className="input"
                    rows={5}
                    placeholder="Your inquiry..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    required
                    style={{ height: 'auto', resize: 'none' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="btn btn-primary btn-full btn-lg"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {status === 'sending' ? (
                    <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Sending...</>
                  ) : (
                    <><Send size={15} /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
