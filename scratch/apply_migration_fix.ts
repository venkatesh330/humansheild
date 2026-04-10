import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString = "postgresql://postgres:oXcXXdJ5uesKzH8s@db.ysenimczeasmaeojzlkt.supabase.co:5432/postgres";

async function applyMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database at db.ysenimczeasmaeojzlkt.supabase.co');

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
