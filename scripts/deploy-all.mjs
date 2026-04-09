import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'ysenimczeasmaeojzlkt';
const ACCESS_TOKEN = 'sbp_fbd3daae223834c661a94f77565c5c0578ed39bd'; 

async function deploy(functionName) {
  console.log(`\n🚀 Starting deployment for ${functionName}...`);
  
  const filePath = path.join(process.cwd(), 'supabase', 'functions', functionName, 'index.ts');
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');

  const url = `https://api.supabase.com/v1/projects/${PROJECT_ID}/functions/${functionName}`;
  
  // Try to update first (PATCH)
  let response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      body: content,
      name: functionName,
      verify_jwt: false
    })
  });

  if (response.status === 404) {
    console.log(`Function ${functionName} not found. Creating new (POST)...`);
    const createUrl = `https://api.supabase.com/v1/projects/${PROJECT_ID}/functions`;
    response = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: functionName,
        name: functionName,
        slug: functionName,
        body: content,
        verify_jwt: false
      })
    });
  }

  const result = await response.json();
  
  if (response.ok) {
    console.log(`✅ Successfully deployed ${functionName} to Supabase!`);
  } else {
    console.error(`❌ Deployment for ${functionName} failed:`, result);
  }
}

async function run() {
  await deploy('calculate-grounded-risk');
  await deploy('analyze-signals');
}

run();
