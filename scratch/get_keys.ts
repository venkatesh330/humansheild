import https from 'https';

const PROJECT_ID = 'ysenimczeasmaeojzlkt';
const ACCESS_TOKEN = 'sbp_fbd3daae223834c661a94f77565c5c0578ed39bd';

const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${PROJECT_ID}/api-keys`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
