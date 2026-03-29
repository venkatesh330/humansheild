import { useState, useEffect, useRef, useCallback, useMemo, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import CalculatorPage from './CalculatorPage';
import SkillRiskCalculator from '../components/SkillRiskCalculator';
import HumanIrreplacibilityIndex from '../components/HumanIrreplacibilityIndex';
import UpskillingRoadmap from '../components/UpskillingRoadmap';
import HumanEdgeJournal from '../components/HumanEdgeJournal';
import ScoreDriftTracker, { ScoreDriftBanner, PlotScoreInversionBanner } from '../components/ScoreDriftTracker';
import DisplacementForecast from '../components/DisplacementForecast';
import DigestSignup from '../components/DigestSignup';
import ResilienceBadge from '../components/ResilienceBadge';
import DailyChallenge from '../components/DailyChallenge';
import { useHumanProof } from '../context/HumanProofContext';
import { getScoreHistory, getEverCompletedFlags, hasLegacyVersionEntries } from '../utils/scoreStorage';
import { getActionTimeline, validateJobSkillMatch } from '../utils/riskCalculations';
import { generateAssessmentSnapshot, generateShareableLink } from '../utils/assessmentExport';

// UX FIX 7: Per-tab ErrorBoundary to isolate failures and allow retry
class TabErrorBoundary extends Component<
  { tabId: string; children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { tabId: string; children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Error captured — boundary renders fallback
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '48px 32px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>⚠️</div>
          <div style={{ color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: '0.9rem', marginBottom: 8 }}>
            Error in {this.props.tabId} tab
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: 24, lineHeight: 1.6 }}>
            {this.state.error.message || 'An unexpected error occurred.'}
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              background: 'rgba(0,245,255,0.15)', border: '1px solid rgba(0,245,255,0.4)',
              color: 'var(--cyan)', borderRadius: 8, padding: '8px 24px',
              cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '0.8rem',
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const TABS = [
  { id: 'job-risk',  label: 'Job Risk Score',         icon: '🎯' },
  { id: 'skill-risk',label: 'Skill Risk',             icon: '🧠' },
  { id: 'hii',       label: 'Human Irreplaceability', icon: '✨' },
  { id: 'roadmap',   label: 'Upskilling Roadmap',     icon: '🗺️' },
  { id: 'journal',   label: 'Human Edge Journal',     icon: '📓' },
  { id: 'drift',     label: 'Progress Tracker',       icon: '📈' },
  { id: 'forecast',  label: 'Displacement Forecast',  icon: '📡' },
];

const STALE_DAYS = 90;

function isStale(): boolean {
  const history = getScoreHistory();
  if (!history.length) return false;
  const latest = history[history.length - 1];
  const daysSince = (Date.now() - latest.timestamp) / (1000 * 60 * 60 * 24);
  return daysSince > STALE_DAYS;
}

const SESSION_DRIFT_KEY = 'hp_drift_banner_seen_session';

export default function ToolsPage() {
  const { state, dispatch } = useHumanProof();
  const [activeTab, setActiveTab] = useState<string>(state.activeToolTab || 'job-risk');
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(new Set([state.activeToolTab || 'job-risk']));
  // v3 FIX: drift banner shows ONCE per session, not on every tab switch
  const [showDriftBannerState, setShowDriftBannerState] = useState(false);
  const [showDigest, setShowDigest] = useState(false);
  const [showStalenessBanner, setShowStalenessBanner] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [jobSkillMismatch, setJobSkillMismatch] = useState(false);
  const [showLegacyVersionBanner, setShowLegacyVersionBanner] = useState(false);
  const tablistRef = useRef<HTMLDivElement>(null);
  const digestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setShowStalenessBanner(isStale());
  }, [activeTab]);

  // v3 FIX: Drift banner shows ONCE per session using sessionStorage
  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(SESSION_DRIFT_KEY);
    if (alreadySeen) return;
    const history = getScoreHistory();
    if (history.length >= 2) {
      setShowDriftBannerState(true);
      sessionStorage.setItem(SESSION_DRIFT_KEY, '1');
    }
  }, []);

  // v3 FIX: Data version migration warning (one-time, dismissible)
  useEffect(() => {
    if (hasLegacyVersionEntries()) {
      setShowLegacyVersionBanner(true);
    }
  }, []);

  useEffect(() => {
    const subscribed = JSON.parse(localStorage.getItem('hp_digest_subscribed') || 'false');
    if (subscribed) return;
    const allThreeComplete = state.jobRiskScore !== null && state.skillRiskScore !== null && state.humanScore !== null;
    if (allThreeComplete) {
      digestTimerRef.current = setTimeout(() => setShowDigest(true), 2000);
    } else {
      digestTimerRef.current = setTimeout(() => setShowDigest(true), 180000);
    }
    return () => {
      if (digestTimerRef.current) clearTimeout(digestTimerRef.current);
    };
  }, [state.jobRiskScore, state.skillRiskScore, state.humanScore]);

  const switchTab = useCallback((tabId: string) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
    setMountedTabs(prev => new Set([...prev, tabId]));
    dispatch({ type: 'SET_ACTIVE_TAB', tab: tabId });
  }, [activeTab, dispatch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = TABS.findIndex(t => t.id === activeTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      switchTab(TABS[(idx + 1) % TABS.length].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      switchTab(TABS[(idx - 1 + TABS.length) % TABS.length].id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      switchTab(TABS[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      switchTab(TABS[TABS.length - 1].id);
    }
  }, [activeTab, switchTab]);

  const missingDeps = useMemo(() => {
    const missing: { label: string; message: string }[] = [];
    if (activeTab === 'skill-risk' && state.jobRiskScore === null) {
      missing.push({
        label: 'Job Risk Score',
        message: 'Add a Job Risk Score to unlock industry-filtered AI threat tags for each of your skills — so you see the exact tools targeting your domain, not generic ones.',
      });
    }
    if (activeTab === 'roadmap' && state.skillRiskScore === null) {
      missing.push({
        label: 'Skill Risk Calculator',
        message: 'Add your Skill Risk profile to replace generic course suggestions with a plan targeting your top 3 highest-risk skills specifically.',
      });
    }
    if (activeTab === 'roadmap' && state.jobRiskScore === null) {
      missing.push({
        label: 'Job Risk Score',
        message: 'Add a Job Risk Score to unlock the role-specific 90-day roadmap for your job type.',
      });
    }
    if (activeTab === 'drift' && state.jobRiskScore === null && state.skillRiskScore === null && state.humanScore === null) {
      missing.push({
        label: 'any assessment',
        message: 'Complete at least one assessment to start tracking your AI resilience trend over time.',
      });
    }
    if (activeTab === 'forecast' && state.jobRiskScore === null) {
      missing.push({
        label: 'Job Risk Score',
        message: 'Complete all 3 assessments to unlock personalised displacement scenario probabilities for your specific role and skill set.',
      });
    }
    return missing;
  }, [activeTab, state.jobRiskScore, state.skillRiskScore, state.humanScore]);

  // v3 FIX: Use "ever completed" flags to prevent progress bar flickering during retakes
  const everCompleted = useMemo(() => getEverCompletedFlags(), []);
  const liveCompleted = {
    job:   state.jobRiskScore !== null,
    skill: state.skillRiskScore !== null,
    hii:   state.humanScore !== null,
  };
  const completionFlags = {
    job:   everCompleted.job   || liveCompleted.job,
    skill: everCompleted.skill || liveCompleted.skill,
    hii:   everCompleted.hii  || liveCompleted.hii,
  };
  const completionCount = Object.values(completionFlags).filter(Boolean).length;
  const completionPct = Math.round((completionCount / 3) * 100);

  // Check job-skill industry match
  useEffect(() => {
    if (state.jobId && state.selectedSkills.length > 0) {
      const jobIndustry = state.jobId.split('_')[0];
      const hasInvalidSkills = state.selectedSkills.some(skill => {
        const skillIndustry = skill.category.split('_')[0];
        return !validateJobSkillMatch(jobIndustry, skillIndustry);
      });
      setJobSkillMismatch(hasInvalidSkills);
    }
  }, [state.jobId, state.selectedSkills]);

  // Action timeline guidance
  const actionTimeline = useMemo(() => {
    return getActionTimeline(state.jobRiskScore, state.skillRiskScore);
  }, [state.jobRiskScore, state.skillRiskScore]);

  // Export functionality
  const handleExport = useCallback(async (format: 'json' | 'pdf') => {
    const snapshot = generateAssessmentSnapshot(
      state.jobRiskScore,
      state.jobTitle,
      state.skillRiskScore,
      state.humanScore
    );
    if (format === 'json') {
      const json = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `humanproof-assessment-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else {
      // PDF export placeholder
      alert('PDF export coming soon!');
    }
    setShowExportMenu(false);
  }, [state]);

  const handleShare = useCallback(async () => {
    const snapshot = generateAssessmentSnapshot(
      state.jobRiskScore,
      state.jobTitle,
      state.skillRiskScore,
      state.humanScore
    );
    const shareLink = generateShareableLink();
    const url = `${window.location.origin}${shareLink}`;
    if (navigator.share) {
      navigator.share({
        title: 'My HumanProof Assessment',
        text: `My AI displacement risk score: ${snapshot.jobRiskScore || snapshot.skillRiskScore || 0}%`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  }, [state]);

  const showDriftBanner = showDriftBannerState;

  return (
    <div className="tools-page" style={{ minHeight: '100vh', paddingTop: 'calc(var(--nav-height, 70px) + 1rem)' }}>
      {/* Completion progress bar */}
      {completionCount < 3 && (
        <div style={{ maxWidth: 1200, margin: '0 auto 12px', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Assessment progress
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: completionPct === 100 ? 'var(--emerald)' : 'var(--cyan)' }}>
              {completionCount}/3 complete ({completionPct}%)
            </span>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${completionPct}%`, background: 'linear-gradient(90deg, var(--cyan), var(--emerald))', borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
        </div>
      )}

      {showStalenessBanner && (
        <div className="staleness-banner" style={{
          background: 'rgba(255,165,0,0.12)',
          border: '1px solid rgba(255,165,0,0.35)',
          borderRadius: 8,
          padding: '10px 20px',
          margin: '0 auto 12px',
          maxWidth: 1200,
          fontSize: '0.82rem',
          color: '#ffb347',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span>⚠️</span>
          <span>Your scores are over 90 days old. AI risk is evolving fast — consider re-running your assessments for 2026 accuracy.</span>
          <button
            onClick={() => setShowStalenessBanner(false)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ffb347', cursor: 'pointer', fontSize: '1rem' }}
          >×</button>
        </div>
      )}

      {/* v3 FIX: Drift banner shows ONCE per session, auto-dismissed on click */}
      {showDriftBanner && (
        <ScoreDriftBanner onDismiss={() => setShowDriftBannerState(false)} />
      )}

      {/* v3 FIX: Legacy version migration warning */}
      {showLegacyVersionBanner && (
        <div style={{
          background: 'rgba(251,191,36,0.08)',
          border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8,
          padding: '10px 20px',
          margin: '0 auto 12px',
          maxWidth: 1200,
          fontSize: '0.8rem',
          color: '#FCD34D',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span>📊</span>
          <span>Your score history includes entries from a previous model version. These may not be directly comparable to your latest score.</span>
          <button onClick={() => setShowLegacyVersionBanner(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#FCD34D', cursor: 'pointer', fontSize: '1rem' }}>×</button>
        </div>
      )}

      <div
        className="tools-tablist"
        role="tablist"
        aria-label="HumanProof tools"
        ref={tablistRef}
        onKeyDown={handleKeyDown}
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: 4,
          padding: '0 20px',
          marginBottom: 28,
          maxWidth: 1200,
          margin: '0 auto 28px',
          borderBottom: '1px solid rgba(0,245,255,0.15)',
          scrollbarWidth: 'none',
        }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => switchTab(tab.id)}
            style={{
              padding: '10px 18px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--cyan, #00F5FF)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--cyan, #00F5FF)' : 'var(--text2, #9BA5B4)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              fontWeight: activeTab === tab.id ? 600 : 400,
              whiteSpace: 'nowrap',
              transition: 'all 0.18s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              paddingBottom: 12,
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        {jobSkillMismatch && (
          <div style={{
            background: 'rgba(255,152,0,0.12)',
            border: '1px solid rgba(255,152,0,0.35)',
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 16,
            fontSize: '0.8rem',
            color: 'var(--text2, #9BA5B4)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span>⚠️</span>
            <span>Some selected skills don't match your job industry. This may affect accuracy — consider adding industry-aligned skills.</span>
          </div>
        )}

        {actionTimeline && (state.jobRiskScore || state.skillRiskScore) && (
          <div style={{
            background: 'rgba(0,255,159,0.08)',
            border: '1px solid rgba(0,255,159,0.25)',
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 16,
            fontSize: '0.8rem',
            color: 'var(--text2, #9BA5B4)',
          }}>
            <strong style={{ color: 'var(--emerald, #00FF9F)' }}>Recommended action timeline: </strong>
            {actionTimeline.label} ({actionTimeline.weeks} weeks)
          </div>
        )}

        {/* v3 FIX: Specific dependency messages per tab instead of generic "complete these first" */}
        {missingDeps.length > 0 && activeTab !== 'job-risk' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {missingDeps.map((dep, i) => (
              <div key={i} style={{
                background: 'rgba(124,58,255,0.08)',
                border: '1px solid rgba(124,58,255,0.25)',
                borderRadius: 10,
                padding: '14px 18px',
                fontSize: '0.85rem',
                color: 'var(--text2, #9BA5B4)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ color: 'var(--violet, #7C3AFF)', flexShrink: 0 }}>💡</span>
                <div>
                  <strong style={{ color: 'var(--violet, #7C3AFF)' }}>{dep.label} needed: </strong>
                  {dep.message}
                  {' '}
                  <button
                    onClick={() => switchTab('job-risk')}
                    style={{ background: 'none', border: 'none', color: 'var(--violet, #7C3AFF)', cursor: 'pointer', fontSize: '0.85rem', padding: 0, textDecoration: 'underline' }}
                  >
                    Start now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export & Share buttons */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            style={{
              padding: '8px 16px',
              background: 'rgba(0,245,255,0.1)',
              border: '1px solid rgba(0,245,255,0.3)',
              borderRadius: 6,
              color: 'var(--cyan, #00F5FF)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >📥 Export</button>
          
          {showExportMenu && (
            <div style={{
              position: 'absolute',
              background: 'var(--bg2, #111827)',
              border: '1px solid rgba(0,245,255,0.2)',
              borderRadius: 6,
              padding: '8px',
              display: 'flex',
              gap: 8,
              zIndex: 10,
            }}>
              <button
                onClick={() => handleExport('json')}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(0,245,255,0.05)',
                  border: 'none',
                  borderRadius: 4,
                  color: 'var(--cyan, #00F5FF)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >JSON</button>
              <button
                onClick={() => handleExport('pdf')}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(0,245,255,0.05)',
                  border: 'none',
                  borderRadius: 4,
                  color: 'var(--cyan, #00F5FF)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >PDF</button>
            </div>
          )}

          <button
            onClick={handleShare}
            style={{
              padding: '8px 16px',
              background: 'rgba(0,255,159,0.1)',
              border: '1px solid rgba(0,255,159,0.3)',
              borderRadius: 6,
              color: 'var(--emerald, #00FF9F)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >🔗 Share</button>
        </div>

        {TABS.map(tab => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
          >
            {mountedTabs.has(tab.id) && (
              <TabErrorBoundary key={`eb-${tab.id}`} tabId={tab.id}>
                {tab.id === 'job-risk' && <CalculatorPage />}
                {tab.id === 'skill-risk' && <SkillRiskCalculator onNavigate={switchTab} />}
                {tab.id === 'hii' && <HumanIrreplacibilityIndex />}
                {tab.id === 'roadmap' && <UpskillingRoadmap />}
                {tab.id === 'journal' && <HumanEdgeJournal />}
                {tab.id === 'drift' && (
                  <>
                    <PlotScoreInversionBanner />
                    {/* NEW-07: Resilience Badge — appears when all three thresholds met */}
                    <ResilienceBadge />
                    <ScoreDriftTracker />
                  </>
                )}
                {tab.id === 'forecast' && <DisplacementForecast onNavigate={switchTab} />}
              </TabErrorBoundary>
            )}
          </div>
        ))}
      </div>

      {/* NEW-10: Daily Micro-Challenge floating widget */}
      <DailyChallenge onNavigateJournal={() => switchTab('journal')} />

      {showDigest && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          background: 'var(--bg2, #111827)',
          border: '1px solid rgba(0,245,255,0.3)',
          borderRadius: 12,
          padding: '20px 24px',
          maxWidth: 340,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <button
            onClick={() => setShowDigest(false)}
            style={{
              position: 'absolute', top: 10, right: 14,
              background: 'none', border: 'none', color: 'var(--text2, #9BA5B4)',
              cursor: 'pointer', fontSize: '1.1rem',
            }}
          >×</button>
          <DigestSignup embedded onClose={() => setShowDigest(false)} />
        </div>
      )}
    </div>
  );
}
