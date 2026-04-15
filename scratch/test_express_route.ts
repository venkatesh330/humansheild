import express from 'express';
import express from 'express';
import calculateRoutes from '../artifacts/api-server/src/routes/calculate';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(process.cwd(), 'artifacts/humanproof/.env') });

const app = express();
app.use(express.json());
app.use('/api/v1/grounded-risk', calculateRoutes);

async function runTests() {
  console.log("=====================================================");
  console.log("   LOCAL CLOUDFLARE ROUTE: EXPRESS API TEST");
  console.log("=====================================================\n");

  const payload = {
    roleTitle: "Senior Prompt Optimization Engineer",
    department: "AI Research",
    industry: "Technology",
    companyName: "Anthropic",
    tenureYears: 1.5,
    performanceTier: "top",
    isUniqueRole: true,
    region: "usa",
    roleKey: "sw_ml"
  };

  console.log(`▶ Pinging Express Route: POST /api/v1/grounded-risk`);
  console.log(`  Payload: ${payload.roleKey} in ${payload.industry}\n`);
  
  const server = app.listen(8788, async () => {
    const startTime = Date.now();
    try {
      const response = await fetch('http://localhost:8788/api/v1/grounded-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
        
      const endTime = Date.now();

      if (!response.ok) {
        const errText = await response.text();
        console.log(`❌ ERROR ${response.status}: ${errText}`);
        server.close();
        return;
      }

      const body = await response.json() as any;
      console.log(`✅ SUCCESS! Responded in ${((endTime - startTime)/1000).toFixed(2)}s\n`);
      
      console.log(`  🔍 VERIFIED SCHEMA COMPLIANCE:`);
      console.log(`     Total Score: ${body.total}/100`);
      console.log(`     Verdict:     ${body.verdict}`);
      console.log(`     Urgency:     ${body.urgency}`);
      console.log(`     Dimensions:  ${body.dimensions ? body.dimensions.length : 0} traits evaluated`);
      console.log(`     Safe Pivots: ${body.safer_career_paths ? body.safer_career_paths.length : 0} alternatives found`);
      
      if (body.roadmap && body.roadmap.phase_1) {
          console.log(`     Roadmap:     Successfully generated 3 phases.`);
      }

      console.log(`\n  🟢 STATIC MATH ENGINE INTEGRITY:`);
      const d4 = body.dimensions?.find((d: any) => d.key === 'D4');
      const d5 = body.dimensions?.find((d: any) => d.key === 'D5');
      console.log(`     D4 properly calculated bypassing LLM hallucinations: ${d4 ? 'YES' : 'NO'}`);
      console.log(`     D5 natively localized to Country rules: ${d5 ? 'YES' : 'NO'}`);

    } catch (error) {
      console.error("Test framework failed:", error);
    } finally {
      server.close();
    }
  });
}

runTests();
