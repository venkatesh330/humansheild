import { Pool } from 'pg';

const connectionString = "postgresql://postgres.ysenimczeasmaeojzlkt:GewbDhrbzw0vdrtj@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";
const pool = new Pool({ connectionString });

async function checkSchema() {
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
