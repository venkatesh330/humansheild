import { Client } from 'pg';

const passwords = [
  'GewbDhrbzw0vdrtj',
  'ysenimczeasmaeojzlkt',
  'humanproofs1',
  'postgres'
];

const host = "aws-1-ap-south-1.pooler.supabase.com";
const user = "postgres.ysenimczeasmaeojzlkt";
const port = 6543;

async function test() {
  for (const pw of passwords) {
    console.log(`Testing password: ${pw}...`);
    const client = new Client({
      host,
      user,
      password: pw,
      port,
      database: 'postgres',
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      console.log(`✅ SUCCESS! Password is: ${pw}`);
      await client.end();
      process.exit(0);
    } catch (e) {
      console.log(`❌ Failed: ${e.message}`);
    }
  }
  console.log('All attempts failed.');
  process.exit(1);
}

test();
