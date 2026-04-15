// Test Supabase Auth Connection
// Run with: node test-auth.js

const https = require("https");

const SUPABASE_URL = "https://ysenimczeasmaeojzlkt.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzZW5pbWN6ZWFzbWFlb2p6bGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzUyNzcsImV4cCI6MjA5MDYxMTI3N30.bljBM56Bam99TDQTOUnWAKB7gXdJ80ka2h2r9NoHYu4";

function makeRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_URL,
      path: path,
      method: method,
      headers: {
        apikey: ANON_KEY,
        Authorization: "Bearer " + ANON_KEY,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testAuth() {
  console.log("Testing Supabase Auth...\n");

  // Test 1: Check auth config
  console.log("1. Checking auth config endpoint...");
  const configRes = await makeRequest("/auth/v1/config", "GET");
  console.log("   Status:", configRes.status);
  if (configRes.status === 200) {
    console.log("   ✅ Auth is configured");
  }

  // Test 2: Try signup
  console.log("\n2. Testing signup...");
  const signupRes = await makeRequest("/auth/v1/signup", "POST", {
    email: "test" + Date.now() + "@example.com",
    password: "TestPassword123!",
  });
  console.log("   Status:", signupRes.status);
  console.log("   Response:", signupRes.body.substring(0, 200));

  // Test 3: List users (should fail without admin access)
  console.log("\n3. Trying to list users...");
  const usersRes = await makeRequest("/auth/v1/admin/users", "GET");
  console.log("   Status:", usersRes.status);
  console.log("   Response:", usersRes.body.substring(0, 200));

  // Test 4: Check if we can get project info
  console.log("\n4. Checking project...");
  const projectRes = await makeRequest("/rest/v1/", "GET");
  console.log("   Status:", projectRes.status);

  console.log("\n=== Auth Test Complete ===");
}

testAuth().catch(console.error);
