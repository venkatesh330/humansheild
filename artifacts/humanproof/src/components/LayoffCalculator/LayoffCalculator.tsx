import React, { useState } from 'react';
import { useLayoff } from '../../context/LayoffContext';
import { LayoffInputForm } from './LayoffInputForm';
import { LayoffScoreDisplay } from './LayoffScoreDisplay';
import { calculateLayoffScore, simulateScenario, ScoreInputs, ScenarioOverrides } from '../../services/layoffScoreEngine';
import { getCompanyByName, CompanyData } from '../../data/companyDatabase';
import { industryRiskData, IndustryRisk } from '../../data/industryRiskData';
import { saveLayoffScore } from '../../services/scoreStorageService';
import { LayoffAlertBanner } from './LayoffAlertBanner';
import { LayoffShareCard } from './LayoffShareCard';
import { LayoffScoreHistory } from './LayoffScoreHistory';
import { LayoffScenarioPanel } from './LayoffScenarioPanel';

interface Props {
  /** Optional: passed from ToolsPage so action plan links can switch tabs */
  onSwitchTab?: (tabId: string) => void;
}

// Toast notification — replaces alert()
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000,
      background: type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)',
      color: '#fff', padding: '12px 20px', borderRadius: '8px',
      fontSize: '0.95rem', fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      animation: 'fadeIn 0.3s ease-in',
    }}>
      {type === 'success' ? '✓' : '✗'} {message}
    </div>
  );
};

export const LayoffCalculator: React.FC<Props> = ({ onSwitchTab }) => {
  const { state, dispatch } = useLayoff();
  const [showShareCard, setShowShareCard] = useState(false);
  const [lastScoreInputs, setLastScoreInputs] = useState<ScoreInputs | null>(null);

  const handleCalculate = () => {
    dispatch({ type: 'SET_CALCULATING', payload: true });

    setTimeout(() => {
      // Use company data from context (not window global) — BUG-01 fix
      let companyData: CompanyData | null = state.companyData || getCompanyByName(state.companyName || '');

      if (!companyData) {
        companyData = {
          name: state.companyName || 'Unknown',
          isPublic: false,
          industry: 'Technology',
          region: 'US',
          employeeCount: 500,
          revenueGrowthYoY: null,
          stock90DayChange: null,
          layoffsLast24Months: [],
          layoffRounds: 0,
          lastLayoffPercent: null,
          revenuePerEmployee: 150000,
          aiInvestmentSignal: 'medium',
          source: 'Fallback',
          lastUpdated: new Date().toISOString(),
        };
      }

      const industryData: IndustryRisk | undefined = industryRiskData[companyData.industry];

      const inputs: ScoreInputs = {
        companyData,
        industryData,
        roleTitle: state.roleTitle || 'Employee',
        department: state.department || 'Operations',
        userFactors: state.userFactors || {
          tenureYears: 1.5,
          isUniqueRole: false,
          performanceTier: 'average',
          hasRecentPromotion: false,
          hasKeyRelationships: false,
        },
      };

      const result = calculateLayoffScore(inputs);
      setLastScoreInputs(inputs);
      dispatch({ type: 'SET_SCORE_RESULT', payload: result });
    }, 1500);
  };

  const handleSave = () => {
    if (state.scoreResult && state.companyName && state.roleTitle) {
      saveLayoffScore(state.scoreResult, state.companyName, state.roleTitle, state.department || '');
      dispatch({ type: 'INCREMENT_SAVE_COUNTER' });
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'Score saved to your history!', type: 'success' } });
    }
  };

  const handleShare = () => {
    setShowShareCard(true);
  };

  const handleRetake = () => {
    dispatch({ type: 'RESET' });
    setLastScoreInputs(null);
  };

  const handleScenarioSimulate = (overrides: ScenarioOverrides) => {
    if (!lastScoreInputs) return null;
    return simulateScenario(lastScoreInputs, overrides);
  };

  return (
    <div className="layoff-calculator-wrapper" style={{ padding: '24px 0' }}>

      {!state.hasCompletedAssessment && !state.isCalculating && (
        <>
          <LayoffAlertBanner />
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '8px', fontWeight: 700 }}>
              Layoff Risk Estimator
            </h1>
            <p style={{ color: '#9ba5b4', fontSize: '1.1rem', maxWidth: '480px', margin: '0 auto' }}>
              Know your layoff risk before it knows you. Powered by real company signals, role data, and market trends.
            </p>
          </div>
          <LayoffInputForm onNext={handleCalculate} />
        </>
      )}

      {state.isCalculating && (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <div style={{ width: '64px', height: '64px', margin: '0 auto 24px', border: '4px solid rgba(0,245,255,0.2)', borderTopColor: 'var(--cyan, #00F5FF)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ color: '#fff', marginBottom: '12px' }}>Analysing Market Signals...</h2>
          <p style={{ color: '#9ba5b4' }}>Synthesising company health, role exposure, and macroeconomic trends.</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {state.hasCompletedAssessment && state.scoreResult && !state.isCalculating && (
        <>
          <LayoffScoreDisplay
            result={state.scoreResult}
            roleTitle={state.roleTitle || ''}
            companyName={state.companyName || ''}
            dataUpdatedDate={state.companyData?.lastUpdated || new Date().toISOString()}
            onSave={handleSave}
            onShare={handleShare}
            onRetake={handleRetake}
            onSwitchTab={onSwitchTab}
          />
          {lastScoreInputs && (
            <LayoffScenarioPanel
              baseInputs={lastScoreInputs}
              currentScore={state.scoreResult.score}
              onSimulate={handleScenarioSimulate}
            />
          )}
          <LayoffScoreHistory refreshKey={state.historySaveCounter} />
        </>
      )}

      {showShareCard && state.scoreResult && (
        <LayoffShareCard
          score={state.scoreResult.score}
          tier={state.scoreResult.tier}
          companyName={state.companyName || 'Unknown'}
          roleTitle={state.roleTitle || 'Unknown'}
          onClose={() => setShowShareCard(false)}
        />
      )}

      {state.showToast && (
        <Toast
          message={state.showToast.message}
          type={state.showToast.type}
          onClose={() => dispatch({ type: 'HIDE_TOAST' })}
        />
      )}
    </div>
  );
};
