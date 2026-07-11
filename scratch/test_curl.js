const https = require('https');
require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

if (!key) {
  console.error("No API key found in env");
  process.exit(1);
}

console.log("Using key:", key.slice(0, 10) + "...");

// 1. First try Listing Models
https.get(`https://generativelanguage.googleapis.com/v1/models?key=${key}`, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log("--- LIST MODELS RESPONSE ---");
    console.log("Status Code:", res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
}).on('error', (err) => {
  console.error("Error listing models:", err.message);
});
