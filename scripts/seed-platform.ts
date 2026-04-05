/**
 * seed-platform.ts
 * Utility to trigger Supabase Edge Functions for initial data seeding.
 * Usage: node --env-file=artifacts/api-server/.env scripts/seed-platform.ts
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.");
  process.exit(1);
}

const FUNCTIONS = [
  { name: "bls-ingestion", path: "/functions/v1/bls-ingestion" },
  { name: "resource-sync", path: "/functions/v1/resource-sync" },
  { name: "consensus-validator", path: "/functions/v1/consensus-validator" }
];

async function seed() {
  console.log("🚀 Starting HumanProof Platform Seeding...");
  
  for (const fn of FUNCTIONS) {
    const url = `${SUPABASE_URL}${fn.path}`;
    console.log(`\n📡 Triggering [${fn.name}]...`);
    
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json"
        }
      });
      
      const result = await resp.text();
      if (resp.ok) {
        console.log(`✅ [${fn.name}] success:`, result);
      } else {
        console.warn(`⚠️ [${fn.name}] return status ${resp.status}:`, result);
        console.warn("Note: If you get a 401, you may need the SERVICE_ROLE_KEY instead of the ANON_KEY.");
      }
    } catch (err) {
      console.error(`❌ [${fn.name}] failed:`, err instanceof Error ? err.message : String(err));
    }
  }
  
  console.log("\n✨ Seeding process completed.");
  console.log("Check the 'Safe Careers' and 'Learning Hub' pages in 30-60 seconds.");
}

seed();
