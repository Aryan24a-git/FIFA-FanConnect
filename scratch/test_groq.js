const https = require('https');
require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

if (!key) {
  console.error("No API key found in env");
  process.exit(1);
}

console.log("Testing Groq API key (first 10 chars):", key.slice(0, 10) + "...");

const postData = JSON.stringify({
  model: 'groq/compound',
  messages: [
    { role: 'user', content: "Hello! Respond in one word 'Success'." }
  ]
});

const options = {
  hostname: 'api.groq.com',
  path: '/openai/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    try {
      const parsed = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log("RESULT:", parsed.choices[0].message.content.trim());
      } else {
        console.log("ERROR:", parsed.error ? parsed.error.message : data);
      }
    } catch (e) {
      console.log("DATA ERROR:", data);
    }
  });
});

req.on('error', (err) => {
  console.error("Request error:", err.message);
});

req.write(postData);
req.end();
