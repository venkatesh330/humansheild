import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'artifacts/humanproof/.env') });

const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

async function run() {
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
  const json = await resp.json();
  console.log(json.models.map((m: any) => m.name).filter((n: string) => n.includes('gemini')));
}

run();
