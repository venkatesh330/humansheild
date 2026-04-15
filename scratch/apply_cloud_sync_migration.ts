import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env from root
dotenv.config({ path: path.join(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in .env');
  process.exit(1);
}

console.log('🚀 Connecting to Supabase Pooler...');
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase pooler usually
  }
});

async function runMigration() {
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260414000000_cloud_sync_complete.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('📂 Reading migration:', path.basename(migrationPath));
  
  const client = await pool.connect();
  try {
    console.log('⚡ Splitting SQL into blocks...');
    
    // Simple top-level semicolon splitter that respects $$ quotes
    const blocks: string[] = [];
    let currentBlock = '';
    let inDollarQuote = false;
    
    const lines = sql.split('\n');
    for (let line of lines) {
      currentBlock += line + '\n';
      
      // Toggle dollar quote state
      if (line.includes('$$')) {
        // This is a simplification but works for our specific file
        const occurrences = (line.match(/\$\$/g) || []).length;
        if (occurrences % 2 !== 0) {
          inDollarQuote = !inDollarQuote;
        }
      }
      
      // If we see a semicolon and aren't in a quote, end the block
      if (!inDollarQuote && line.trim().endsWith(';')) {
        blocks.push(currentBlock.trim());
        currentBlock = '';
      }
    }
    if (currentBlock.trim()) blocks.push(currentBlock.trim());

    console.log(`🚀 Found ${blocks.length} blocks to execute.`);

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (!block || block.startsWith('--')) continue;
      
      console.log(`\n⚡ Executing block ${i+1}/${blocks.length}...`);
      console.log(block.substring(0, 50) + '...');
      
      await client.query(block);
    }
    
    console.log('\n✅ All migration blocks applied successfully!');
  } catch (err: any) {
    console.error('\n❌ Migration failed:', err.message);
    if (err.position) {
      console.error('Error at position:', err.position);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
