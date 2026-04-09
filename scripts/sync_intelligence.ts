import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { MASTER_CAREER_INTELLIGENCE } from '../src/data/intelligence';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function syncIntelligence() {
  console.log('🚀 Starting Career Intelligence Sync...');
  
  const roles = Object.keys(MASTER_CAREER_INTELLIGENCE);
  console.log(`Found ${roles.length} roles to sync.`);

  for (const roleKey of roles) {
    const data = MASTER_CAREER_INTELLIGENCE[roleKey];
    
    console.log(`Syncing ${roleKey}...`);
    
    const { error } = await supabase
      .from('career_intelligence')
      .upsert({
        role_key: roleKey,
        display_role: data.displayRole,
        summary: data.summary,
        skills: data.skills,
        career_paths: data.careerPaths,
        roadmap: data.roadmap,
        inaction_scenario: data.inactionScenario,
        risk_trend: data.riskTrend,
        confidence_score: data.confidenceScore,
        updated_at: new Date().toISOString()
      }, { onConflict: 'role_key' });

    if (error) {
      console.error(`❌ Error syncing ${roleKey}:`, error.message);
    } else {
      console.log(`✅ ${roleKey} synced successfully.`);
    }
  }

  console.log('✨ Sync complete!');
}

syncIntelligence().catch(error => {
  console.error('Fatal sync error:', error);
  process.exit(1);
});
