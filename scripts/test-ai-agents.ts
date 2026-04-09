import { calculateScore } from '../artifacts/humanproof/src/data/riskEngine.ts';

// Mocking the AI response structure for verification
const MOCK_AI_RESPONSE = {
  total: 65,
  dimensions: [
    { key: "D1", label: "Task Automatability", score: 85, reason: "Highly repetitive administrative tasks." },
    { key: "D2", label: "AI Tool Maturity", score: 70, reason: "Mature LLMs can handle 90% of drafting." },
    { key: "D3", label: "Human Amplification", score: 40, reason: "AI replaces output rather than assisting." },
    { key: "D4", label: "Experience Shield", score: 30, reason: "Senior domain knowledge remains defensive." },
    { key: "D5", label: "Country Exposure", score: 60, reason: "High tech adoption in this territory." },
    { key: "D6", label: "Social Capital Moat", score: 50, reason: "Standard networking dependency." }
  ],
  reasoning: "The role is significantly exposed to LLM disruption, though senior experience provides a moderate shield.",
  verdict: "Exposed",
  urgency: "High",
  timeline: "2-4 Years",
  confidence: "HIGH",
  isGrounded: true,
  agentChain: "Generator -> Critic"
};

console.log('🤖 HUMANPROOF AI AGENT DIAGNOSTIC SUITE');
console.log('════════════════════════════════════════════');

function verifySchema(data: any) {
  const required = ['total', 'dimensions', 'reasoning', 'verdict', 'urgency', 'timeline'];
  const missing = required.filter(k => !(k in data));
  
  if (missing.length > 0) {
    console.error(`[FAIL] Missing keys: ${missing.join(', ')}`);
    return false;
  }

  if (data.dimensions.length !== 6) {
    console.error(`[FAIL] Expected 6 dimensions, got ${data.dimensions.length}`);
    return false;
  }

  const missingReasons = data.dimensions.filter((d: any) => !d.reason);
  if (missingReasons.length > 0) {
    console.error(`[FAIL] Dimension(s) missing 'reason': ${missingReasons.map((m:any)=>m.key).join(', ')}`);
    return false;
  }

  console.log('[PASS] Response Schema Validated (Multi-Agent Format)');
  return true;
}

// 1. Verify Schema
verifySchema(MOCK_AI_RESPONSE);

// 2. Compare with Local Fallback
const local = calculateScore('software_engineer', 'tech', '5-10', 'usa');
console.log(`[INFO] Local Fallback Score: ${local.total}%`);
console.log(`[INFO] AI Agent Score: ${MOCK_AI_RESPONSE.total}%`);

console.log('════════════════════════════════════════════');
console.log('✅ Diagnostics Complete');
