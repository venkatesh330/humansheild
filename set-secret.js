const PROJECT_ID = 'ysenimczeasmaeojzlkt';
const ACCESS_TOKEN = 'sbp_fbd3daae223834c661a94f77565c5c0578ed39bd';
const KEY = 'AIzaSyDBMV9Ks4O8m8JfCvHQGnrn6newnA7JEwY';

fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/secrets`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify([{name: "GEMMA_API_KEY", value: KEY}])
})
.then(async r => {
  const text = await r.text();
  try {
    return text ? JSON.parse(text) : { success: true };
  } catch (e) {
    return { success: true, text };
  }
})
.then(data => console.log('Successfully set secret:', data))
.catch(err => console.error('Error:', err));


