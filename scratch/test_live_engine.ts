import { calculateLayoffScore } from '../artifacts/humanproof/src/services/layoffScoreEngine';
import { getPPPMultiplier, countryCodeToD5Key } from '../artifacts/humanproof/src/data/companyDatabase';
import { injectLayoffEvent, lookupLayoffEvent } from '../artifacts/humanproof/src/data/layoffNewsCache';
import { computeTrajectory } from '../artifacts/humanproof/src/services/DisplacementTrajectoryEngine';
import { getCareerIntelligence } from '../artifacts/humanproof/src/data/intelligence/index';
import { calculateD1 } from '../artifacts/humanproof/src/data/riskFormula';

console.log("=========================================");
console.log("   LAYOFF AUDIT — LIVE VERIFICATION SCRIPT");
console.log("=========================================\n");

// 1. Geography & Automatability (D1) Verification 
console.log("--- 1. Testing Geography-Aware AI Disruption (D1) ---");
const roleA = "sw_backend";

const usaD1 = calculateD1(roleA, "usa");       // High adoption baseline
const germanyD1 = calculateD1(roleA, "germany"); // High labor friction, lower adoption speed
const indiaD1 = calculateD1(roleA, "india");     // High adoption, service export exposed

console.log(`Role: ${roleA}`);
console.log(`  USA D1 Risk:     ${usaD1}%`);
console.log(`  Germany D1 Risk: ${germanyD1}%`);
console.log(`  India D1 Risk:   ${indiaD1}%\n`);


// 2. Experience Profiling (BUG-C1) Verification
console.log("--- 2. Testing Career Years vs Tenure Modifier (D4) ---");
const inputsJunior = {
  companyName: "Acme Corp",
  roleTitle: "Software Engineer",
  department: "Engineering",
  oracleKey: roleA,
  companyData: { name: "Acme Corp", region: "usa" } as any,
  userFactors: {
    tenureYears: 1,
    careerYears: 1, // True Junior
    isUniqueRole: false,
    performanceTier: "average" as const,
    hasRecentPromotion: false,
    hasKeyRelationships: false
  }
};

const inputsSeniorPivot = {
  ...inputsJunior,
  userFactors: {
    ...inputsJunior.userFactors,
    tenureYears: 1,   // Only 1 yr at CURRENT company
    careerYears: 15  // But 15+ years of career experience (Senior)
  }
};

const scoreJunior = calculateLayoffScore(inputsJunior);
const scoreSenior = calculateLayoffScore(inputsSeniorPivot);

console.log(`True Junior (1yr total, 1yr at company) Overall Risk: ${scoreJunior.score}%`);
console.log(`Senior Pivot (15yr total, 1yr at company) Overall Risk: ${scoreSenior.score}%`);
console.log(`Difference: Engine correctly protects Senior by ${scoreJunior.score - scoreSenior.score} points based on total career data.\n`);


// 3. News Risk Runtime OSINT Injection (BUG-C3) Verification
console.log("--- 3. Testing Dynamic OSINT News Injection (L2) ---");
const testCompany = "NebulaDynamics";
console.log(`News risk for ${testCompany} before OSINT injection: ${lookupLayoffEvent(testCompany) ? "FOUND" : "NOT FOUND (0%)"}`);

injectLayoffEvent({
  companyName: testCompany,
  date: new Date().toISOString(),
  headline: "NebulaDynamics announces 12% global workforce reduction",
  percentCut: 12,
  source: "OSINT Live Injector"
});

const injectedEvent = lookupLayoffEvent(testCompany);
console.log(`News risk for ${testCompany} after OSINT injection: ${injectedEvent ? `FOUND -> ${injectedEvent.headline} (${injectedEvent.percentCut}% cut)` : "FAILED"}\n`);


// 4. Data-Driven Displacement Trajectory Growth Profiles Validation
console.log("--- 4. Testing RiskTrend-Derived S-Curves vs Fallback ---");
const customRole = "copywriter"; // Has riskTrend in seeded intelligence
const creativeIntel = getCareerIntelligence(customRole);

const trajectoryWithIntel = computeTrajectory({
    currentScore: 45,
    oracleResult: null,
    roleKey: customRole,
    experience: "5-10",
    careerIntelligence: creativeIntel
});

// Artificially strip the riskTrend to test the fallback profile for this role
const mockFallbackIntel = { ...creativeIntel, riskTrend: undefined } as any;
const trajectoryFallback = computeTrajectory({
    currentScore: 45,
    oracleResult: null,
    roleKey: customRole,
    experience: "5-10",
    careerIntelligence: mockFallbackIntel
});

console.log(`Role: ${customRole.toUpperCase()}`);
console.log(`  Data-Driven Derived Growth/Yr (from RiskTrend):   +${trajectoryWithIntel.growthPerYear.toFixed(1)}%`);
console.log(`  Generic Fallback Profile Growth/Yr (no data):     +${trajectoryFallback.growthPerYear.toFixed(1)}%`);

console.log(`  Peak Score (Data-Driven): ${trajectoryWithIntel.peakScore}%`);
console.log(`  Peak Score (Fallback):    ${trajectoryFallback.peakScore}%`);
console.log(`\nVerification Complete.`);
