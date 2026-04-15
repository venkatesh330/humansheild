import { calculateScore } from './src/data/riskFormula';

const tests = [
  { label: 'Crisis Therapist',   workType: 'mh_crisis',       industry: 'mental_health', country: 'usa',     experience: '0-2',   target: 18, tol: 12 },
  { label: 'SEO Content Writer', workType: 'cnt_seo_content', industry: 'content',       country: 'usa',     experience: '5-10',  target: 78, tol: 12 },
  { label: 'Software Architect', workType: 'sw_arch',         industry: 'it_software',   country: 'germany', experience: '10-20', target: 22, tol: 12 },
  { label: 'Data Entry Clerk',   workType: 'bpo_data_entry',  industry: 'bpo',           country: 'india',   experience: '0-2',   target: 92, tol: 12 },
  { label: 'Surgeon',            workType: 'hc_surgeon',      industry: 'healthcare',    country: 'usa',     experience: '20+',   target: 10, tol: 10 },
];

console.log('\nROLE                   GOT    TARGET   DELTA  STATUS');
console.log('-'.repeat(58));
let pass = 0, fail = 0;
for (const t of tests) {
  const r = calculateScore(t.workType, t.industry, t.experience, t.country);
  const got = r.total;
  const delta = Math.abs(got - t.target);
  const ok = delta <= t.tol;
  ok ? pass++ : fail++;
  const status = ok ? '✅ PASS' : '❌ FAIL';
  console.log(t.label.padEnd(22), String(got).padEnd(7), ('~' + t.target).padEnd(9), ('±' + delta).padEnd(7), status);
  if (!ok) {
    console.log('  dims:', r.dimensions.map((d: any) => d.key + '=' + d.score).join(' | '));
  }
}
console.log('-'.repeat(58));
console.log(`${pass}/${tests.length} passed${fail > 0 ? ' — ' + fail + ' OUTSIDE TOLERANCE' : ' — ALL WITHIN RANGE ✅'}`);
