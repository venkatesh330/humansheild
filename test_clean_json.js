// test_clean_json.js
function cleanJson(text) {
  return text.replace(/```json\s?([\s\S]*?)```/g, '$1')
             .replace(/```\s?([\s\S]*?)```/g, '$1')
             .trim()
             .replace(/^[^{]*([\{[\s\S]*\}])[^}]*$/, "$1"); // Final fallback
}

const samples = [
  '```json\n{"score": 90}\n```',
  'Here is the JSON:\n```\n{"score": 90}\n```\nHope it helps!',
  '{"score": 90}',
  'Malformed prefix { "score": 90 } Suffix'
];

samples.forEach(s => {
  try {
    const cleaned = cleanJson(s);
    console.log('Original:', JSON.stringify(s));
    console.log('Cleaned:', cleaned);
    JSON.parse(cleaned);
    console.log('✅ OK');
  } catch (e) {
    console.log('❌ FAIL:', e.message);
  }
  console.log('---');
});
