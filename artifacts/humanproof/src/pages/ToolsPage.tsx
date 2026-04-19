import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Component,
} from "react";
import type { ReactNode, ErrorInfo } from "react";

import { useHumanProof } from "../context/HumanProofContext";
import SkillRiskCalculator from "../components/SkillRiskCalculator";
import HumanIrreplacibilityIndex from "../components/HumanIrreplacibilityIndex";
import ScoreDriftTracker, {
  ScoreDriftBanner,
  PlotScoreInversionBanner,
} from "../components/ScoreDriftTracker";
import { LayoffCalculator } from "../components/LayoffCalculator/LayoffCalculator";
import UpskillingRoadmap from "../components/UpskillingRoadmap";
import HumanEdgeJournal from "../components/HumanEdgeJournal";
import ResilienceBadge from "../components/ResilienceBadge";
import DailyChallenge from "../components/DailyChallenge";
import DisplacementForecast from "../components/DisplacementForecast";
import RiskCalculatorsView from "../components/RiskCalculatorsView";
import {
  getScoreHistory,
  getEverCompletedFlags,
  hasLegacyVersionEntries,
} from "../utils/scoreStorage";
import {
  getActionTimeline,
  validateJobSkillMatch,
} from "../utils/riskCalculations";
import {
  generateAssessmentSnapshot,
  generateShareableLink,
} from "../utils/assessmentExport";

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
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() {
    if (this.state.error) {
      return (
        <div className="card p-12 text-center max-w-lg mx-auto my-20">
          <div className="text-4xl mb-6">⚠️</div>
          <h3 className="text-rose-500 font-bold mb-2">
            Node Failure: {this.props.tabId}
          </h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            {this.state.error.message ||
              "Unexpected exception caught in rendering thread."}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="btn-teal"
          >
            Reconnect Node
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const TABS = [
  { id: "risk-calculators", label: "Test My Risk", icon: "🎯" },
  { id: "skill-matrix", label: "Skill Health", icon: "🧠" },
  { id: "hii", label: "Human Value", icon: "✨" },
  { id: "protocol", label: "Action Plan", icon: "🗺️" },
  { id: "edge-log", label: "Daily Journal", icon: "📓" },
  { id: "drift", label: "Progress Tracker", icon: "📈" },
  { id: "forecast", label: "Future Forecast", icon: "📡" },
];

const STALE_DAYS = 90;
const SESSION_DRIFT_KEY = "hp_drift_banner_seen_session";

export default function ToolsPage() {
  const { state, dispatch } = useHumanProof();
  const [activeTab, setActiveTab] = useState<string>(
    state.activeToolTab || "risk-calculators",
  );
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(
    new Set([state.activeToolTab || "risk-calculators"]),
  );
  const [showDriftBannerState, setShowDriftBannerState] = useState(false);

  const [showStalenessBanner, setShowStalenessBanner] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [jobSkillMismatch, setJobSkillMismatch] = useState(false);
  const [showLegacyVersionBanner, setShowLegacyVersionBanner] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const tablistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isStale = () => {
      const history = getScoreHistory();
      if (!history.length) return false;
      const latest = history[history.length - 1];
      return (
        (Date.now() - latest.timestamp) / (1000 * 60 * 60 * 24) > STALE_DAYS
      );
    };
    setShowStalenessBanner(isStale());
  }, [activeTab]);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(SESSION_DRIFT_KEY);
    if (!alreadySeen && getScoreHistory().length >= 2) {
      setShowDriftBannerState(true);
      sessionStorage.setItem(SESSION_DRIFT_KEY, "1");
    }
  }, []);

  useEffect(() => {
    if (hasLegacyVersionEntries()) setShowLegacyVersionBanner(true);
  }, []);

  const switchTab = useCallback(
    (tabId: string) => {
      if (tabId === activeTab) return;
      setActiveTab(tabId);
      setMountedTabs((prev) => new Set([...prev, tabId]));
      dispatch({ type: "SET_ACTIVE_TAB", tab: tabId });
    },
    [activeTab, dispatch],
  );

  const missingDeps = useMemo(() => {
    const missing: { label: string; message: string }[] = [];
    if (activeTab === "skill-risk" && state.jobRiskScore === null) {
      missing.push({
        label: "Risk Oracle",
        message:
          "Initialize Risk Oracle to calibrate your skill threat matrix against actual role deployment data.",
      });
    }
    if (
      activeTab === "roadmap" &&
      (state.skillRiskScore === null || state.jobRiskScore === null)
    ) {
      missing.push({
        label: "Full Assessment",
        message:
          "Complete Oracle and Matrix assessments to generate your high-fidelity 90-day protocol.",
      });
    }
    return missing;
  }, [activeTab, state.jobRiskScore, state.skillRiskScore]);

  const handleExport = useCallback(
    async (format: "json" | "pdf") => {
      if (format === "json") {
        const snapshot = generateAssessmentSnapshot(
          state.jobRiskScore,
          state.jobTitle,
          state.skillRiskScore,
          state.humanScore,
        );
        const url = URL.createObjectURL(
          new Blob([JSON.stringify(snapshot, null, 2)], {
            type: "application/json",
          }),
        );
        const a = document.createElement("a");
        a.href = url;
        a.download = `hp-audit-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setToastMsg("📄 PDF protocol generation pending Q2 release.");
        setTimeout(() => setToastMsg(null), 3000);
      }
      setShowExportMenu(false);
    },
    [state],
  );

  const completionCount =
    Object.values(getEverCompletedFlags()).filter(Boolean).length ||
    [state.jobRiskScore, state.skillRiskScore, state.humanScore].filter(
      (x) => x !== null,
    ).length;
  const completionPct = Math.round((completionCount / 3) * 100);

  return (
    <div className="page-wrap" style={{ background: "var(--bg)" }}>
      <div className="container" style={{ maxWidth: 1280 }}>
        {/* Progress Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Node Connectivity
            </span>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black tracking-tighter">
                MY DASHBOARD
              </h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${completionPct === 100 ? "bg-emerald-500" : "bg-cyan-500 animate-pulse"}`}
                />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {completionCount}/3 MODULES
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn btn-secondary btn-sm"
            >
              Export
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  window.location.origin + "/" + generateShareableLink(),
                );
              }}
              className="btn btn-primary btn-sm"
            >
              Share Link
            </button>
          </div>
        </div>

        {/* Global Banners */}
        <div className="space-y-4 mb-12">
          {showStalenessBanner && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-500 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span>⚠️</span> STALENESS DETECTED: DATA EXCEEDS 90D THRESHOLD.
                RE-CALIBRATION RECOMMENDED.
              </div>
              <button
                onClick={() => setShowStalenessBanner(false)}
                className="opacity-50 hover:opacity-100"
              >
                ×
              </button>
            </div>
          )}
          {showDriftBannerState && (
            <ScoreDriftBanner
              onDismiss={() => setShowDriftBannerState(false)}
            />
          )}
        </div>

        {/* Cyber-Tabs */}
        <div
          className="tabs-wrap no-scrollbar"
          style={{
            overflowX: "auto",
            width: "100%",
            maxWidth: "100%",
            position: "sticky",
            top: "calc(var(--nav-h) + 16px)",
            zIndex: 30,
            backdropFilter: "blur(24px)",
            marginBottom: "40px",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              style={{ flexShrink: 0 }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="relative">
          {missingDeps.map((dep, i) => (
            <div
              key={i}
              className="mb-8 p-6 rounded-3xl bg-cyan-500/5 border border-cyan-500/10 flex items-start gap-5 reveal"
            >
              <span className="text-xl">💡</span>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-2">
                  {dep.label} REQUIRED
                </h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {dep.message}
                </p>
              </div>
            </div>
          ))}

          {TABS.map((tab) => (
            <div key={tab.id} hidden={activeTab !== tab.id} className="reveal">
              {mountedTabs.has(tab.id) && (
                <TabErrorBoundary tabId={tab.id}>
                  {tab.id === "risk-calculators" && (
                    <RiskCalculatorsView onSwitchTab={switchTab} />
                  )}
                  {tab.id === "layoff-audit" && (
                    <LayoffCalculator onSwitchTab={switchTab} />
                  )}
                  {tab.id === "skill-matrix" && (
                    <SkillRiskCalculator onNavigate={switchTab} />
                  )}
                  {tab.id === "hii" && <HumanIrreplacibilityIndex />}
                  {tab.id === "protocol" && <UpskillingRoadmap />}
                  {tab.id === "edge-log" && <HumanEdgeJournal />}
                  {tab.id === "drift" && (
                    <>
                      <PlotScoreInversionBanner />
                      <ResilienceBadge />
                      <ScoreDriftTracker />
                    </>
                  )}
                  {tab.id === "forecast" && (
                    <DisplacementForecast onNavigate={switchTab} />
                  )}
                </TabErrorBoundary>
              )}
            </div>
          ))}
        </div>
      </div>

      <DailyChallenge onNavigateJournal={() => switchTab("edge-log")} />

      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
