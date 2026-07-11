require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("ERROR: GEMINI_API_KEY environment variable is not defined.");
    return;
  }
  console.log("Testing API key (first 10 chars):", key.slice(0, 10) + "...");
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent("Hello, respond in one word 'Success'.");
    console.log("RESULT:", result.response.text().trim());
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

testKey();
