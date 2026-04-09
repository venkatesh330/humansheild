import React, { useState } from 'react';
import { useLayoff } from '../../context/LayoffContext';
import { LayoffInputForm } from './LayoffInputForm';
import { LayoffScoreDisplay } from './LayoffScoreDisplay';
import { calculateLayoffScore, simulateScenario, ScoreInputs, ScenarioOverrides } from '../../services/layoffScoreEngine';
import { runFullEnsembleAnalysis } from '../../services/ensemble/ensembleOrchestrator';
import { getCompanyByName, CompanyData } from '../../data/companyDatabase';
import { industryRiskData, IndustryRisk } from '../../data/industryRiskData';
import { RoleExposure } from '../../data/roleExposureData';
import { saveLayoffScore } from '../../services/scoreStorageService';
import { LayoffAlertBanner } from './LayoffAlertBanner';
import { LayoffShareCard } from './LayoffShareCard';
import { LayoffScoreHistory } from './LayoffScoreHistory';
import { LayoffScenarioPanel } from './LayoffScenarioPanel';
import { RecommendationPanel } from './RecommendationPanel';
import { EnsembleLoadingState } from './EnsembleLoadingState';
import { supabase } from '../../utils/supabase';

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
  // 0=idle, 1=engine+agents running, 2=gemini synthesizing, 3=done
  const [ensembleStage, setEnsembleStage] = useState(0);

  const handleCalculate = async () => {
    dispatch({ type: 'SET_CALCULATING', payload: true });
    setEnsembleStage(0);

    try {
      let companyData: CompanyData | null = null;
      let companyFallback: CompanyData | null = state.companyData || null;

      if (state.companyName) {
        // Fetch dynamic data from OSINT Edge Function for ALL companies
        const reqBody: any = { companyName: state.companyName };
        if (state.companyData?.source === 'User Input') {
           reqBody.employeeCount = state.companyData.employeeCount;
           reqBody.isPublic = state.companyData.isPublic;
           reqBody.industry = state.companyData.industry;
        }

        const { data, error } = await supabase.functions.invoke('fetch-company-data', {
          body: reqBody
        });

        if (data && !error && data.data) {
          const osintData = data.data;
          
          companyData = {
            name: osintData.company_name,
            isPublic: osintData.is_public === 'true',
            industry: osintData.industry || 'Technology',
            region: 'GLOBAL', 
            employeeCount: osintData.employee_count || 500,
            revenueGrowthYoY: osintData.revenue_yoy,
            stock90DayChange: osintData.stock_90d_change,
            layoffsLast24Months: osintData.recent_layoff_news ? [{ date: new Date().toISOString(), percentCut: 2 }] : [],
            layoffRounds: osintData.recent_layoff_news || 0,
            lastLayoffPercent: osintData.recent_layoff_news ? 2 : null,
            revenuePerEmployee: 150000,
            aiInvestmentSignal: 'medium',
            source: data.source || 'Live OSINT Database',
            lastUpdated: osintData.last_updated,
          };
          
          dispatch({ type: 'SHOW_TOAST', payload: { message: `Using ${data.source} for accurate scoping`, type: 'success' }});
          
        } else {
           console.warn('Fallback: Failed to fetch live data', error);
           companyData = companyFallback || getCompanyByName(state.companyName || '');
        }
      }

      if (!companyData) {
        companyData = {
          name: state.companyName || 'Unknown',
          isPublic: false,
          industry: 'Technology',
          region: 'GLOBAL',
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

      let fetchedIndustryData: IndustryRisk | undefined;
      let fetchedRoleExposure: RoleExposure | undefined;
      
      try {
        const [indRes, roleRes] = await Promise.all([
          supabase.from('industry_risk_data').select('*').eq('sector_name', companyData.industry).maybeSingle(),
          supabase.from('role_exposure_data').select('*').ilike('role_title', state.roleTitle || '').maybeSingle()
        ]);
        
        if (indRes.data) {
          fetchedIndustryData = {
            baselineRisk: indRes.data.baseline_risk,
            aiAdoptionRate: indRes.data.ai_adoption_rate,
            growthOutlook: indRes.data.growth_outlook,
            avgLayoffRate2025: indRes.data.avg_layoff_rate_2025
          };
        }
        if (roleRes.data) {
          fetchedRoleExposure = {
            aiRisk: roleRes.data.ai_risk,
            layoffRisk: roleRes.data.layoff_risk,
            demandTrend: roleRes.data.demand_trend
          };
        }
      } catch (e) {
        console.warn('Failed to fetch dynamic risk tables', e);
      }

      const industryData: IndustryRisk | undefined = fetchedIndustryData || industryRiskData[companyData.industry];

      // ── Keep ScoreInputs for scenario simulation (uses deterministic engine) ──
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
        roleExposureOverride: fetchedRoleExposure,
      };
      setLastScoreInputs(inputs);

      // ── Stage 1: Engine + parallel AI agents ──
      setEnsembleStage(1);

      const ensembleResult = await runFullEnsembleAnalysis({
        companyName:        companyData.name,
        companyData,
        industry:           companyData.industry,
        industryData,
        roleTitle:          inputs.roleTitle,
        department:         inputs.department,
        tenureYears:        inputs.userFactors.tenureYears,
        isUniqueRole:       inputs.userFactors.isUniqueRole,
        performanceTier:    inputs.userFactors.performanceTier,
        hasRecentPromotion: inputs.userFactors.hasRecentPromotion,
        hasKeyRelationships: inputs.userFactors.hasKeyRelationships,
        roleExposureOverride: fetchedRoleExposure,
      });

      // ── Stage 2: Gemini synthesis (already done inside orchestrator, update stage) ──
      setEnsembleStage(2);
      // Small delay so users see the Gemini synthesis step before result appears
      await new Promise(resolve => setTimeout(resolve, 400));
      setEnsembleStage(3);

      dispatch({ type: 'SET_SCORE_RESULT', payload: ensembleResult });

      const modelCount = ensembleResult.modelsUsed?.length || 1;
      dispatch({ type: 'SHOW_TOAST', payload: {
        message: modelCount >= 4
          ? `4-model ensemble complete · ${ensembleResult.confidencePercent}% confidence`
          : `Analysis complete · ${ensembleResult.confidence} confidence`,
        type: 'success',
      }});

    } catch (e) {
      console.error(e);
      dispatch({ type: 'SET_CALCULATING', payload: false });
      setEnsembleStage(0);
    }
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
        <EnsembleLoadingState stage={ensembleStage} />
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
          {state.scoreResult.recommendations && (
             <RecommendationPanel recommendations={state.scoreResult.recommendations} />
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
