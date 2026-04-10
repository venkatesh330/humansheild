import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Use the pooler host since direct host is not resolving
const connectionString = "postgresql://postgres.ysenimczeasmaeojzlkt:oXcXXdJ5uesKzH8s@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";

async function applyMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database via pooler at aws-1-ap-south-1.pooler.supabase.com');

    const sqlPath = "supabase/migrations/20260409160000_create_career_intelligence.sql";
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying migration: career_intelligence...');
    await client.query(sql);
    console.log('✅ Migration successfully applied!');

  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await client.end();
    process.exit(0);
  }
}

applyMigration();
