import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function deploy() {
  console.log("🚀 Starting Docker-free Supabase Deployment...");

  // 1. Load connection string from .env
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env file not found at " + envPath);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const dbUrlMatch = envContent.match(/DATABASE_URL=(.*)/);
  if (!dbUrlMatch) {
    console.error("❌ DATABASE_URL not found in .env");
    process.exit(1);
  }
  const connectionString = dbUrlMatch[1].trim();
  console.log("🔗 Connected to Supabase Host: " + connectionString.split('@')[1].split(':')[0]);

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("✅ Connection established.");

    // 2. Read Migration
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260416110000_create_company_intelligence.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    // 3. Read Seed
    const seedPath = path.join(process.cwd(), 'supabase', 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log("📝 Running Migration (Schema & Functions)...");
    await client.query('BEGIN');
    await client.query(migrationSql);
    console.log("✅ Schema, Policies, and Upsert Functions applied.");

    console.log("🧹 Running Deduplication Clean-up...");
    await client.query('SELECT public.clean_company_duplicates()');
    console.log("✅ Pre-existing duplicates cleared.");

    // 3. Read Verified Data Batches
    const batches = [
      'verified_50_data.json',
      'verified_batch_2.json',
      'verified_live_batch_30.json',
      'verified_live_batch_4.json',
      'verified_live_batch_50.json',
      'verified_live_batch_244.json',
      'verified_live_batch_2026_expansion.json',
      'verified_live_batch_500_infra.json',
      'verified_live_batch_750_healthcare.json',
      'verified_live_batch_1000_millennium.json',
      'verified_live_batch_2000_giant_set17.json'
    ];

    for (const batchFile of batches) {
      const dataPath = path.join(process.cwd(), 'scratch', batchFile);
      if (!fs.existsSync(dataPath)) {
        console.warn(`⚠️ Batch file not found: ${batchFile}. Skipping...`);
        continue;
      }
      
      const verifiedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      console.log(`🌱 Running High-Fidelity Upsert for ${batchFile} (${verifiedData.length} companies)...`);
      
      for (const company of verifiedData) {
        const query = {
          text: `SELECT public.upsert_company_intelligence(
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
          )`,
          values: [
            company.company_name,
            company.industry,
            company.company_size,
            company.stage,
            JSON.stringify(company.financial_signals),
            JSON.stringify(company.layoff_history),
            JSON.stringify(company.hiring_signals),
            JSON.stringify(company.role_risk_map),
            company.ai_exposure_index,
            company.market_risk_score,
            company.company_risk_score,
            company.confidence_score,
            company.archetype,
            company.data_source,
            company.last_updated,
            company.workforce_count || 0,
            company.open_jobs_count || 0
          ]
        };
        await client.query(query);
      }
      console.log(`✅ ${batchFile} upserted successfully.`);
    }

    await client.query('COMMIT');
    console.log("🎉 DEPLOYMENT COMPLETE.");


    // 4. Verification
    const res = await client.query('SELECT COUNT(*) FROM public.company_intelligence');
    console.log(`📊 Verification: Total records in company_intelligence = ${res.rows[0].count}`);

  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error("❌ Deployment failed. Transaction rolled back.");
    console.error(err);
    process.exit(1);
  } finally {
    if (client) await client.end();
  }
}

deploy();
