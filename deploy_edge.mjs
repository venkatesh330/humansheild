import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'ysenimczeasmaeojzlkt';
const FUNCTION_NAME = 'calculate-grounded-risk';
const ACCESS_TOKEN = 'sbp_c6848ab9483c77c00cf7f1dda0cbc172e6b01495'; 

async function deploy() {
  console.log(`Starting deployment for ${FUNCTION_NAME}...`);
  
  const filePath = path.join(process.cwd(), 'supabase', 'functions', FUNCTION_NAME, 'index.ts');
  const content = fs.readFileSync(filePath, 'utf8');

  const url = `https://api.supabase.com/v1/projects/${PROJECT_ID}/functions/${FUNCTION_NAME}`;
  
  // Try to update first (PATCH)
  let response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      body: content,
      name: FUNCTION_NAME,
      verify_jwt: false
    })
  });

  if (response.status === 404) {
    console.log('Function not found. Creating new function (POST)...');
    const createUrl = `https://api.supabase.com/v1/projects/${PROJECT_ID}/functions`;
    response = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: FUNCTION_NAME,
        name: FUNCTION_NAME,
        slug: FUNCTION_NAME,
        body: content,
        verify_jwt: false
      })
    });
  }

  const result = await response.json();
  
  if (response.ok) {
    console.log('Successfully deployed Edge Function to Supabase!');
    console.log('Result:', result.id || result.name || 'Success');
  } else {
    console.error('Deployment failed:', result);
    process.exit(1);
  }
}

deploy();
