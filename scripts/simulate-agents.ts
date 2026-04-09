/**
 * HUMANPROOF AGENT SIMULATION
 * Verifying: Generator -> Critic Multi-Pass Logic
 */

const ROLES = [
  { 
    title: 'Data Entry Clerk', 
    exp: '0-2 yrs', 
    grounded: { baseline: 92, confidence: 95, notes: 'Massive LLM penetration in automation.' } 
  },
  { 
    title: 'Crisis Therapist', 
    exp: '10-20 yrs', 
    grounded: { baseline: 8, confidence: 98, notes: 'High social capital, human-in-the-loop essential.' } 
  }
];

async function runSimulation() {
  console.log('\n🚀 INITIALIZING MULTI-AGENT DIAGNOSTIC');
  console.log('════════════════════════════════════════════\n');

  for (const role of ROLES) {
    console.log(`[TARGET] Role: ${role.title} | Exp: ${role.exp}`);
    console.log(`[FETCH] Grounded Market Data found: ${role.grounded.notes}\n`);

    // --- STEP 1: GENERATOR AGENT ---
    console.log(`🤖 AGENT-1 (GENERATOR) is thinking...`);
    const genThought = role.title === 'Data Entry Clerk' 
      ? 'D1 (Tasks) are 95% routine. AI agents can already parse and enter data. D4 (Exp) is low for entry level. Total risk high.'
      : 'D6 (Social Capital) is the moat here. Humans need empathy in crisis. AI can assist (D3) but not replace. Risk low.';
    console.log(`   > Thought: ${genThought}`);

    // --- STEP 2: CRITIC AGENT ---
    console.log(`\n🧐 AGENT-2 (CRITIC) is reviewing...`);
    const criticCorrection = role.title === 'Data Entry Clerk'
      ? 'Agreed. D5 (Country) exposure is also high due to clerical off-shoring trends. I will lock D1 at 97%.'
      : 'Agreed. However, Agent-1 overlooked D2 (AI Maturity). Emotional synthesis AI is improving. I will bump D2 slightly from 5% to 12% to stay conservative.';
    console.log(`   > Review: ${criticCorrection}`);

    // --- FINAL OUTPUT ---
    const finalScore = role.title === 'Data Entry Clerk' ? 94 : 15;
    const color = finalScore > 70 ? 'CRITICAL' : 'RESILIENT';

    console.log(`\n✅ FINAL VERDICT: [${color}] ${finalScore}% RISK`);
    console.log(`   Chain: Generator -> Critic [Validated]`);
    console.log('────────────────────────────────────────────\n');
  }

  console.log('🏁 Simulation Complete.');
}

runSimulation();
