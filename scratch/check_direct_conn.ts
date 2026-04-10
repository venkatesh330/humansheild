import { Pool } from 'pg';

// Direct connection (usually more reliable if pooler is failing)
const connectionString = "postgresql://postgres.ysenimczeasmaeojzlkt:GewbDhrbzw0vdrtj@db.ysenimczeasmaeojzlkt.supabase.co:5432/postgres";
const pool = new Pool({ connectionString });

async function checkSchema() {
  console.log('Attempting direct connection...');
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'career_intelligence'
      ORDER BY ordinal_position;
    `);
    console.log('Columns in career_intelligence:');
    console.table(res.rows);
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

checkSchema();
