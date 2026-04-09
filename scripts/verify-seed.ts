import { Client } from 'pg';

const connectionString = 'postgresql://postgres.ysenimczeasmaeojzlkt:GewbDhrbzw0vdrtj@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

async function verify() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to DB');

    // 1. Seed Safe Career
    const scQuery = `
      INSERT INTO safe_careers (role_key, role_title, industry_key, industry_label, risk_score, growth_projection, median_salary_usd, remote_viable, education_required, safety_reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (role_key) DO UPDATE SET role_title = EXCLUDED.role_title;
    `;
    await client.query(scQuery, ['sw_verify', 'Verified AI Architect', 'it_software', 'Software Engineering', 15, 25.0, 160000, 'yes', 'bachelor', 'High-complexity verified moat.']);

    // 2. Seed Related Resource
    const frQuery = `
      INSERT INTO free_resources (title, provider, url, language, language_label, is_free, level, target_role_keys, target_dimension, risk_level_target, tags, synced_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (title, provider) DO UPDATE SET synced_at = NOW();
    `;
    await client.query(frQuery, [
      'Architecting for AI', 
      'HumanProof Verify', 
      'https://example.com/verify', 
      'en', 
      'English', 
      'yes', 
      'intermediate', 
      ['sw_verify'], 
      'D3', 
      'high', 
      ['verification']
    ]);

    console.log('✅ Verification Seed Data Inserted');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await client.end();
  }
}

verify();
