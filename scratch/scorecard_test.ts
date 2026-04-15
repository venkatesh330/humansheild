/**
 * Regression scorecard test — validates the riskFormula.ts engine
 * against target scores from the audit reference values.
 * Run: npx ts-node --esm scorecard_test.ts
 * Or:  npx tsx scorecard_test.ts
 */

// Since this is ESM we need to patch path resolution
import { calculateScore } from '../artifacts/humanproof/src/data/riskFormula.js';

const TESTS = [
  { label: 'Crisis Therapist',    workType: 'mh_crisis',       industry: 'mental_health', country: 'usa',     experience: '0-2',   target: 18, tolerance: 12 },
  { label: 'SEO Content Writer',  workType: 'cnt_seo_content', industry: 'content',       country: 'usa',     experience: '5-10',  target: 78, tolerance: 12 },
  { label: 'Software Architect',  workType: 'sw_arch',         industry: 'it_software',   country: 'germany', experience: '10-20', target: 22, tolerance: 12 },
  { label: 'Data Entry Clerk',    workType: 'bpo_data_entry',  industry: 'bpo',           country: 'india',   experience: '0-2',   target: 92, tolerance: 12 },
  { label: 'Surgeon',             workType: 'hc_surgeon',      industry: 'healthcare',    country: 'usa',     experience: '20+',   target: 10, tolerance: 10 },
] as const;

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  SKILL RISK CALCULATOR — REGRESSION SCORECARD');
console.log('═══════════════════════════════════════════════════════════════');
console.log('Role'.padEnd(22), 'Got'.padEnd(6), 'Target'.padEnd(8), 'Delta'.padEnd(8), 'Status');
console.log('─'.repeat(63));

let passed = 0;
let failed = 0;

for (const t of TESTS) {
  const result = calculateScore(t.workType, t.industry, t.experience, t.country);
  const got = result.total;
  const delta = Math.abs(got - t.target);
  const ok = delta <= t.tolerance;
  const status = ok ? '✅ PASS' : '❌ FAIL';
  if (ok) passed++; else failed++;
  console.log(
    t.label.padEnd(22),
    String(got).padEnd(6),
    (`~${t.target}`).padEnd(8),
    (`±${delta}`).padEnd(8),
    status
  );
  if (!ok) {
    console.log('  Dimensions:', result.dimensions.map(d => `${d.key}=${d.score}`).join(' | '));
  }
}

console.log('─'.repeat(63));
console.log(`Result: ${passed}/${TESTS.length} tests passed`);
if (failed > 0) {
  console.log(`\n⚠️  ${failed} test(s) outside tolerance — review dimension weights.`);
  process.exit(1);
} else {
  console.log('\n✅ All scorecards within tolerance range.');
}
