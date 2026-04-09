import { calculateScore } from '../artifacts/humanproof/src/data/riskEngine';

const BENCHMARKS = [
  { role: 'software_engineer', industry: 'tech', exp: '5-10', country: 'usa' },
  { role: 'cashier', industry: 'retail', exp: '0-2', country: 'usa' },
  { role: 'therapist', industry: 'healthcare', exp: '10-20', country: 'usa' },
  { role: 'data_entry', industry: 'finance', exp: '2-5', country: 'india' },
  { role: 'graphic_designer', industry: 'media', exp: '5-10', country: 'canada' },
];

console.log('📊 HUMANPROOF RISK ENGINE REGRESSION SUITE');
console.log('════════════════════════════════════════════');

BENCHMARKS.forEach(b => {
  try {
    const score = calculateScore(b.role, b.industry, b.exp, b.country);
    console.log(`[PASS] ${b.role.padEnd(20)} | Score: ${String(score.total).padStart(2)}% | Status: ${score.confidence}`);
  } catch (e: any) {
    console.error(`[FAIL] ${b.role.padEnd(20)} | Error: ${e.message}`);
  }
});

console.log('════════════════════════════════════════════');
console.log('✅ Regression Tests Complete');
