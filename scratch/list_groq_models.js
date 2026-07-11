const https = require('https');
require('dotenv').config();

const key = process.env.GEMINI_API_KEY;

if (!key) {
  console.error("No API key found in env");
  process.exit(1);
}

https.get({
  hostname: 'api.groq.com',
  path: '/openai/v1/models',
  headers: {
    'Authorization': `Bearer ${key}`
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    try {
      const parsed = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log("Models:", parsed.data.map(m => m.id));
      } else {
        console.log("Error:", parsed.error ? parsed.error.message : data);
      }
    } catch (e) {
      console.log(data);
    }
  });
});
