import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres:GewbDhrbzw0vdrtj@[2406:da1a:6b0:f61f:ecf8:f675:f58a:8f62]:5432/postgres";
const client = new Client({ connectionString });

async function test() {
  try {
    await client.connect();
    console.log("SUCCESS: Connected to Supabase via IPv6 IP");
    const res = await client.query('SELECT NOW()');
    console.log("Time:", res.rows[0]);
    await client.end();
  } catch (err) {
    console.error("FAILURE: Connection failed", err.message);
    process.exit(1);
  }
}

test();
