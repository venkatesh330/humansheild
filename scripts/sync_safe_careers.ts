import { Client } from 'pg';
import { MASTER_CAREER_INTELLIGENCE } from '../artifacts/humanproof/src/data/intelligence/index.ts';

const connectionString = "postgresql://postgres.ysenimczeasmaeojzlkt:oXcXXdJ5uesKzH8s@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";

async function syncSafeCareers() {
  console.log('🔗 Bridging Intelligence Registry to Safe Careers UI...');
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const roles = Object.keys(MASTER_CAREER_INTELLIGENCE);
    console.log(`Analyzing ${roles.length} intelligence profiles...`);

    for (const roleKey of roles) {
      const data = MASTER_CAREER_INTELLIGENCE[roleKey];
      
      // Determine Industry mapping
      let industryLabel = 'Professional Services';
      let industryKey = 'services';
      
      if (roleKey.startsWith('sw_') || roleKey.startsWith('it_') || roleKey.startsWith('mob_') || roleKey.startsWith('ds_') || roleKey.startsWith('data_')) {
        industryLabel = 'Technology'; industryKey = 'tech';
      } else if (roleKey.startsWith('fin_') || roleKey.startsWith('inv_')) {
        industryLabel = 'Finance & Banking'; industryKey = 'finance';
      } else if (roleKey.startsWith('edu_')) {
        industryLabel = 'Education'; industryKey = 'edu';
      } else if (roleKey.startsWith('gov_')) {
        industryLabel = 'Public Sector'; industryKey = 'govt';
      } else if (roleKey.startsWith('log_')) {
        industryLabel = 'Logistics'; industryKey = 'logistics';
      } else if (roleKey.startsWith('hos_')) {
        industryLabel = 'Hospitality'; industryKey = 'hospitality';
      } else if (roleKey.startsWith('trd_')) {
        industryLabel = 'Manual Trades'; industryKey = 'trades';
      } else if (roleKey.startsWith('ag_') || roleKey.startsWith('env_')) {
        industryLabel = 'Agritech & Environment'; industryKey = 'agriculture';
      } else if (roleKey.startsWith('hc_') || roleKey.startsWith('med_')) {
        industryLabel = 'Healthcare'; industryKey = 'healthcare';
      } else if (roleKey.startsWith('ent_') || roleKey.startsWith('des_')) {
        industryLabel = 'Creative Arts'; industryKey = 'creative';
      }

      // Current Risk Score (2024 value)
      const currentRisk = data.riskTrend?.find(t => t.year === 2024)?.riskScore || 50;

      // Only sync "Safe" or "Resilient" roles to the Safe Careers dashboard (Score < 60)
      if (currentRisk > 60) {
        console.log(`⏩ Skipping ${roleKey} (Risk too high: ${currentRisk})`);
        continue;
      }

      console.log(`Syncing ${roleKey} to safe_careers (Industry: ${industryKey})...`);

      const query = `
        INSERT INTO safe_careers (
          role_key, role_title, industry_key, industry_label, risk_score, 
          growth_projection, median_salary_usd, safety_reason, 
          computed_at, last_validated_score
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
        ON CONFLICT (role_key) 
        DO UPDATE SET 
          role_title = EXCLUDED.role_title,
          industry_key = EXCLUDED.industry_key,
          industry_label = EXCLUDED.industry_label,
          risk_score = EXCLUDED.risk_score,
          safety_reason = EXCLUDED.safety_reason,
          computed_at = NOW(),
          last_validated_score = EXCLUDED.risk_score;
      `;

      await client.query(query, [
        roleKey,
        data.displayRole,
        industryKey,
        industryLabel,
        currentRisk,
        7.5, // Default growth projection
        95000, // Weighted default salary
        data.summary || '',
        currentRisk
      ]);

      console.log(`✅ ${roleKey} integrated.`);
    }

    console.log('✨ Data Unification complete!');
  } catch (error) {
    console.error('Fatal bridge error:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

syncSafeCareers().catch(error => {
  console.error('Fatal bridge error:', error);
  process.exit(1);
});
