import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLiveAccuracy() {
  console.log("=====================================================");
  console.log("   DEEP ACCURACY AUDIT: LIVE EDGE FUNCTION TEST");
  console.log("=====================================================\n");
  
  const testCases = [
    {
      name: "Complex Unstructured Role",
      payload: {
        roleTitle: "Senior Prompt Optimization Engineer",
        department: "AI Research",
        industry: "Technology",
        companyName: "Anthropic",
        tenureYears: 1.5,
        performanceTier: "top",
        isUniqueRole: true,
        region: "usa",
        coreRiskOverrides: {
          D1_automatability: 85,
          D2_toolMaturity: 90,
          D3_amplification: 15,
          D4_experience: "0-2"
        }
      }
    },
    {
      name: "Legacy Hardware Company Pivot",
      payload: {
        roleTitle: "Supply Chain Manager",
        department: "Operations",
        industry: "Manufacturing",
        companyName: "Ford",
        tenureYears: 10,
        performanceTier: "average",
        isUniqueRole: false,
        region: "eu",
        coreRiskOverrides: {
          D1_automatability: 60,
          D2_toolMaturity: 50,
          D3_amplification: 40,
          D4_experience: "5-10"
        }
      }
    }
  ];

  for (const tc of testCases) {
    console.log(`\n\n▶ RUNNING TEST SUITE: ${tc.name}`);
    console.log(`  Inputs: ${tc.payload.companyName} | ${tc.payload.roleTitle} (${tc.payload.region})`);
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('calculate-grounded-risk', {
        body: tc.payload
      });
      const endTime = Date.now();
      
      if (error) {
        console.error(`  ❌ ERROR invoking edge function:`, error);
        continue;
      }
      
      console.log(`  ✅ RESPONSE RECEIVED IN ${((endTime - startTime)/1000).toFixed(2)}s\n`);
      
      // Accuracy Checks
      console.log(`  🔍 OUTPUT ACCURACY ANALYSIS:`);
      const { total, dimensions, verdict, urgency, timeline, ai_risk_skills, safer_career_paths, roadmap } = data;
      
      console.log(`     Score:      ${total}/100`);
      console.log(`     Verdict:    ${verdict}`);
      console.log(`     Urgency:    ${urgency}`);
      console.log(`     Timeline:   ${timeline}`);
      
      console.log(`\n     [Dimensions Formatted Properly?]`);
      console.log(`       => Array length: ${dimensions?.length} (Expected > 3)`);
      if (dimensions && dimensions.length > 0) {
        console.log(`       => Keys present: ${dimensions.map((d: any) => d.key).join(", ")}`);
      } else {
        console.log(`       => ❌ FAILED: Missing dimensions array`);
      }
      
      console.log(`\n     [Skill Intelligence Deep Dive]`);
      const obsoleteCount = ai_risk_skills?.obsolete?.length || 0;
      const safeCount = ai_risk_skills?.safe?.length || 0;
      console.log(`       => Obsolete skills generated: ${obsoleteCount}`);
      console.log(`       => Safe skills generated:     ${safeCount}`);
      if (safeCount === 0 || obsoleteCount === 0) {
        console.log(`       => ❌ FAILED: Missing distinct skill risk groups`);
      }
      
      console.log(`\n     [Career Pivots & Roadmap]`);
      console.log(`       => Pivot roles identified: ${safer_career_paths?.length || 0}`);
      const phases = roadmap ? Object.keys(roadmap) : [];
      console.log(`       => Roadmap phases generated: ${phases.length}`);
      
      if (phases.length < 3) {
        console.log(`       => ❌ FAILED: Incomplete multi-phase roadmap`);
      }
      
    } catch (err: any) {
      console.error(`  ❌ EXCEPTION:`, err.message);
    }
  }
}

testLiveAccuracy();
