import { Pool } from 'pg';

const connectionString = "postgresql://postgres.ysenimczeasmaeojzlkt:GewbDhrbzw0vdrtj@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";
const pool = new Pool({ connectionString });

async function verifyGrounding() {
  console.log("=== HumanProof Grounding Audit ===");
  const client = await pool.connect();
  try {
    // 1. Check validated_scores count
    const res = await client.query('SELECT count(*) FROM validated_scores');
    const count = parseInt(res.rows[0].count);
    console.log(`- Validated Scores: ${count} entries found.`);

    if (count === 0) {
      console.warn("⚠️ WARNING: validated_scores table is empty. AI grounding will be generic.");
    } else {
      // 2. Sample check for dimensions
      const sample = await client.query('SELECT role_key, d1, d2, d3, d4, d5, d6, final_score FROM validated_scores LIMIT 3');
      console.log("- Sample Grounded Data:");
      sample.rows.forEach(row => {
        console.log(`  [${row.role_key}] Score: ${row.final_score}% (D1:${row.d1}, D2:${row.d2}, D3:${row.d3})`);
      });
    }

    // 3. Check live_signals health
    const signalsRes = await client.query('SELECT count(*) FROM live_signals');
    console.log(`- Live Signals: ${signalsRes.rows[0].count} raw data points.`);

  } catch (err: any) {
    console.error("❌ DB Audit Failed:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyGrounding();
