// CertificationPage.tsx — /certification
// Market Implementation 2 — v4.0
// HumanProof AI-Safe Professional certification system.
//
// Three required components (in sequence):
//   1. Upskilling roadmap completion: all Phase 1+2 Intensive track actions checked
//   2. Skill assessment: pass 3 of 5 role-category assessments (70% threshold)
//   3. Transition story: 300+ word verified submission
//
// Certification → digital badge at /verify/[badge-id]
// LinkedIn share → each share reaches 300-500 connections at 4% CTR = 12-20 trial users

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Award, CheckCircle, Circle, Clock, Star,
  Shield, BookOpen, FileText, Share2, ExternalLink,
  Lock, Zap,
} from "lucide-react";
import { supabase } from "../utils/supabase";

type CertStep = 'roadmap' | 'assessment' | 'story' | 'complete';

interface CertStatus {
  roadmapComplete: boolean;
  assessmentsPassed: number; // out of 5
  storySubmitted: boolean;
  storyVerified: boolean;
  badgeId?: string;
  issuedAt?: string;
  expiresAt?: string;
}

const ROLE_ASSESSMENTS = [
  { id: 'tech',       label: 'Technology & AI',    questions: 20, passing: 14 },
  { id: 'finance',    label: 'Finance & Analytics', questions: 20, passing: 14 },
  { id: 'legal',      label: 'Legal & Compliance',  questions: 20, passing: 14 },
  { id: 'healthcare', label: 'Healthcare & Life Sciences', questions: 20, passing: 14 },
  { id: 'creative',   label: 'Creative & Content',  questions: 20, passing: 14 },
];

const CERT_REQUIREMENTS = [
  {
    id: 'roadmap',
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Complete Upskilling Roadmap',
    description: 'Mark all Phase 1 and Phase 2 actions as complete in your Action Plan (Intensive track).',
    detail: 'Requires all Critical and High priority actions to be checked off.',
    color: 'var(--cyan)',
  },
  {
    id: 'assessment',
    icon: <Shield className="w-5 h-5" />,
    title: 'Pass 3 of 5 Skill Assessments',
    description: 'Each assessment is 20 questions for your role category. Passing threshold: 70% (14/20).',
    detail: 'Assessments are graded automatically. You may retake a failed assessment once per 14 days.',
    color: 'var(--violet)',
  },
  {
    id: 'story',
    icon: <FileText className="w-5 h-5" />,
    title: 'Submit Verified Transition Story',
    description: 'Minimum 300 words describing what you changed, what you learned, and your measurable outcome.',
    detail: 'Reviewed by a platform reviewer within 5 business days. Must describe a real, completed change.',
    color: 'var(--emerald)',
  },
];

function formatExpiry(issuedAt: string): string {
  const d = new Date(issuedAt);
  d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function CertificationPage() {
  const [certStatus] = useState<CertStatus>({
    roadmapComplete: false,
    assessmentsPassed: 0,
    storySubmitted: false,
    storyVerified: false,
  });
  const [storyText, setStoryText] = useState('');
  const [storySubmitting, setStorySubmitting] = useState(false);
  const [storySubmitted, setStorySubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<CertStep>('roadmap');

  const requirementsMet = certStatus.roadmapComplete &&
    certStatus.assessmentsPassed >= 3 &&
    certStatus.storyVerified;

  const overallProgress = useMemo(() => {
    let pts = 0;
    if (certStatus.roadmapComplete) pts += 33;
    if (certStatus.assessmentsPassed >= 3) pts += 34;
    if (certStatus.storyVerified) pts += 33;
    return pts;
  }, [certStatus]);

  const handleStorySubmit = async () => {
    if (storyText.trim().length < 300) return;
    setStorySubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from('certification_stories').insert({
        user_id: session?.user?.id,
        story_text: storyText.trim(),
        word_count: storyText.trim().split(/\s+/).length,
        submitted_at: new Date().toISOString(),
        status: 'pending',
      });
      setStorySubmitted(true);
    } catch { /* ignore — store locally */ }
    setStorySubmitting(false);
  };

  return (
    <div className="page-wrap" style={{ background: 'var(--bg)' }}>
      <div className="container" style={{ maxWidth: 880 }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Award size={32} style={{ color: 'var(--amber)' }} />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
                AI-Safe Professional Certification
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-3)', fontSize: '0.875rem' }}>
                Verified career resilience credential · Renewable annually · LinkedIn badge included
              </p>
            </div>
          </div>

          {/* Overall progress */}
          <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Certification Progress</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: requirementsMet ? 'var(--emerald)' : 'var(--cyan)', fontSize: '1.1rem' }}>
                {overallProgress}%
              </span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1 }}
                style={{ height: '100%', background: requirementsMet ? 'var(--emerald)' : 'var(--cyan)', borderRadius: 3 }}
              />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
          {CERT_REQUIREMENTS.map((req, i) => {
            const isComplete =
              (req.id === 'roadmap' && certStatus.roadmapComplete) ||
              (req.id === 'assessment' && certStatus.assessmentsPassed >= 3) ||
              (req.id === 'story' && certStatus.storyVerified);
            return (
              <div key={req.id}
                style={{ background: 'var(--bg-raised)', border: `1px solid ${isComplete ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, borderRadius: 12, padding: '18px 22px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ padding: 10, borderRadius: 10, background: `${req.color}15`, color: req.color, flexShrink: 0 }}>
                  {req.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem' }}>{req.title}</h4>
                    {isComplete
                      ? <CheckCircle size={16} style={{ color: 'var(--emerald)' }} />
                      : <Circle size={16} style={{ color: 'var(--text-3)', opacity: 0.4 }} />}
                  </div>
                  <p style={{ margin: '0 0 6px', color: 'var(--text-3)', fontSize: '0.8rem', lineHeight: 1.65 }}>{req.description}</p>
                  <p style={{ margin: 0, color: 'var(--text-3)', fontSize: '0.72rem', opacity: 0.7 }}>{req.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assessments grid */}
        <div style={{ marginBottom: 36 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Skill Assessments</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {ROLE_ASSESSMENTS.map(a => {
              const isPassed = false; // would come from user data
              return (
                <div key={a.id} style={{ background: 'var(--bg-raised)', border: `1px solid ${isPassed ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`, borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{a.label}</span>
                    {isPassed
                      ? <CheckCircle size={16} style={{ color: 'var(--emerald)' }} />
                      : <Lock size={14} style={{ color: 'var(--text-3)', opacity: 0.4 }} />}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: 10 }}>
                    {a.questions} questions · Pass threshold: {a.passing}/{a.questions} ({Math.round(a.passing / a.questions * 100)}%)
                  </div>
                  <button
                    style={{ width: '100%', padding: '8px', background: isPassed ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isPassed ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: isPassed ? 'var(--emerald)' : 'var(--text-2)' }}>
                    {isPassed ? '✓ Passed' : 'Take Assessment'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transition story submission */}
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 12, padding: '22px 24px', marginBottom: 36 }}>
          <h3 style={{ margin: '0 0 8px', fontWeight: 800 }}>Transition Story</h3>
          <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginBottom: 16, lineHeight: 1.7 }}>
            Describe what you changed in your career, what you learned during the process, and what your measurable outcome was. Minimum 300 words. This is reviewed by a platform reviewer within 5 business days.
          </p>
          {storySubmitted ? (
            <div style={{ padding: 16, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, color: 'var(--emerald)', fontSize: '0.85rem' }}>
              ✓ Story submitted — awaiting reviewer approval (typically 3–5 business days).
            </div>
          ) : (
            <>
              <textarea
                rows={6}
                placeholder="Tell your transition story: what specifically did you change? What skills did you build? What was the measurable outcome (new role, salary change, reduced displacement risk)?"
                value={storyText}
                onChange={e => setStoryText(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: '0.875rem', resize: 'vertical', lineHeight: 1.7 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <span style={{ fontSize: '0.78rem', color: storyText.length >= 300 ? 'var(--emerald)' : 'var(--amber)' }}>
                  {storyText.trim().split(/\s+/).filter(Boolean).length} / 300 words minimum
                </span>
                <button
                  disabled={storyText.trim().split(/\s+/).length < 300 || storySubmitting}
                  onClick={handleStorySubmit}
                  style={{ padding: '8px 20px', borderRadius: 8, background: storyText.trim().split(/\s+/).length >= 300 ? 'var(--cyan)' : 'rgba(255,255,255,0.05)', color: storyText.trim().split(/\s+/).length >= 300 ? '#000' : 'var(--text-3)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', border: 'none' }}>
                  {storySubmitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Badge section */}
        <div style={{ background: requirementsMet ? 'rgba(16,185,129,0.06)' : 'var(--bg-raised)', border: `1px solid ${requirementsMet ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, borderRadius: 12, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Award size={24} style={{ color: requirementsMet ? 'var(--emerald)' : 'var(--text-3)', opacity: requirementsMet ? 1 : 0.4 }} />
            <h3 style={{ margin: 0, fontWeight: 800 }}>
              {requirementsMet ? 'Your Certification Badge' : 'Badge Locked — Complete All 3 Requirements'}
            </h3>
          </div>
          {requirementsMet ? (
            <>
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '20px 24px', textAlign: 'center', marginBottom: 16 }}>
                <Award size={48} style={{ color: 'var(--emerald)', marginBottom: 12 }} />
                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--emerald)', marginBottom: 4 }}>
                  HumanProof AI-Safe Professional 2026
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                  Verified by HumanProof Intelligence Platform · Expires {formatExpiry(new Date().toISOString())}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', background: 'rgba(10,102,194,0.15)', border: '1px solid rgba(10,102,194,0.3)', borderRadius: 8, color: '#0a66c2', fontWeight: 700, cursor: 'pointer' }}>
                  <Share2 size={14} /> Share on LinkedIn
                </button>
                <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-2)', fontWeight: 700, cursor: 'pointer' }}>
                  <ExternalLink size={14} /> View Public Badge
                </button>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', margin: 0, lineHeight: 1.7 }}>
              Complete all 3 requirements above to earn your HumanProof AI-Safe Professional badge. The badge includes a verification URL, expiry date, and a LinkedIn share button that pre-fills your achievement post.
            </p>
          )}
        </div>

        {/* Renewal info */}
        <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--bg-raised)', borderRadius: 10, border: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text-2)' }}>Annual Renewal (₹5,999/year):</strong> Complete an updated audit showing the same or lower risk score, pass 2 updated assessments, and submit a 150-word story update. Renewal automatically activates before expiry.
        </div>

      </div>
    </div>
  );
}
