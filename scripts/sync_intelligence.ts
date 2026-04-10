import { Client } from 'pg';
import { MASTER_CAREER_INTELLIGENCE } from '../artifacts/humanproof/src/data/intelligence/index.ts';

const connectionString = "postgresql://postgres.ysenimczeasmaeojzlkt:oXcXXdJ5uesKzH8s@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";

async function syncIntelligence() {
  console.log('🚀 Starting Career Intelligence Sync via PG (Direct)...');
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const roles = Object.keys(MASTER_CAREER_INTELLIGENCE);
    console.log(`Found ${roles.length} roles to sync.`);

    for (const roleKey of roles) {
      const data = MASTER_CAREER_INTELLIGENCE[roleKey];
      
      console.log(`Syncing ${roleKey}...`);
      
      const query = `
        INSERT INTO career_intelligence (
          role_key, display_role, summary, skills, career_paths, 
          roadmap, inaction_scenario, risk_trend, confidence_score, updated_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (role_key) 
        DO UPDATE SET 
          display_role = EXCLUDED.display_role,
          summary = EXCLUDED.summary,
          skills = EXCLUDED.skills,
          career_paths = EXCLUDED.career_paths,
          roadmap = EXCLUDED.roadmap,
          inaction_scenario = EXCLUDED.inaction_scenario,
          risk_trend = EXCLUDED.risk_trend,
          confidence_score = EXCLUDED.confidence_score,
          updated_at = NOW();
      `;

      await client.query(query, [
        roleKey,
        data.displayRole,
        data.summary || '',
        JSON.stringify(data.skills || { obsolete: [], at_risk: [], safe: [] }),
        JSON.stringify(data.careerPaths || []),
        JSON.stringify(data.roadmap || {}),
        data.inactionScenario || '',
        JSON.stringify(data.riskTrend || []),
        data.confidenceScore || 85
      ]);

      console.log(`✅ ${roleKey} synced successfully.`);
    }

    console.log('✨ Sync complete!');
  } catch (error) {
    console.error('Fatal sync error:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

syncIntelligence().catch(error => {
  console.error('Fatal sync error:', error);
  process.exit(1);
});
