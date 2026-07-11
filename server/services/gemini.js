'use strict';

/**
 * @fileoverview Gemini AI service for FIFA FanConnect.
 * Gemini is used ONLY as an explanation and translation layer.
 * It NEVER makes crowd, routing, or alert decisions — those are deterministic.
 * @module services/gemini
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');
const { GEMINI } = require('../utils/constants');

/**
 * Wraps a promise with a timeout. Rejects if the promise does not resolve within `ms` milliseconds.
 * @param {Promise} promise - The promise to race against.
 * @param {number} ms - Timeout in milliseconds.
 * @returns {Promise} Resolves or rejects based on whichever settles first.
 */
async function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`AI call timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

/** @type {import('@google/generative-ai').GenerativeModel|null} */
let model = null;

// Initialize model only if API key is present
const isOpenRouter = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('sk-or-');
const isGroq = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('gsk_');

if (process.env.GEMINI_API_KEY && !isOpenRouter && !isGroq) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({
      model: GEMINI.MODEL,
      generationConfig: {
        maxOutputTokens: GEMINI.MAX_OUTPUT_TOKENS,
        temperature: GEMINI.TEMPERATURE,
      },
    });
  } catch (err) {
    model = null;
  }
}

/**
 * Helper to call OpenRouter API via raw HTTPS.
 */
function callOpenRouter(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'google/gemma-2-9b-it:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:8080',
        'X-Title': 'FIFA FanConnect',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`OpenRouter status ${res.statusCode}: ${data}`));
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
            resolve(parsed.choices[0].message.content.trim());
          } else {
            reject(new Error('Unexpected OpenRouter response structure'));
          }
        } catch (e) {
          reject(new Error(`Failed to parse OpenRouter response: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.setTimeout(GEMINI.TIMEOUT_MS, () => {
      req.destroy(new Error('OpenRouter request timed out'));
    });
    req.write(postData);
    req.end();
  });
}

/**
 * Helper to call Groq API via raw HTTPS.
 */
function callGroq(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: process.env.GROQ_MODEL || 'groq/compound',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Groq status ${res.statusCode}: ${data}`));
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
            resolve(parsed.choices[0].message.content.trim());
          } else {
            reject(new Error('Unexpected Groq response structure'));
          }
        } catch (e) {
          reject(new Error(`Failed to parse Groq response: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.setTimeout(GEMINI.TIMEOUT_MS, () => {
      req.destroy(new Error('Groq request timed out'));
    });
    req.write(postData);
    req.end();
  });
}

/**
 * Asserts that the Gemini model has been configured.
 * @throws {Error} If GEMINI_API_KEY was not set at startup.
 */
function assertModelConfigured() {
  if (!model && !isOpenRouter && !isGroq) {
    throw new Error('Gemini model is not configured. Set GEMINI_API_KEY in your environment.');
  }
}

/**
 * Generates a natural-language explanation of a stadium situation.
 * Gemini is the explanation layer only — it does NOT make decisions.
 *
 * @param {string} prompt - The situation description to explain in plain language.
 * @returns {Promise<string>} Natural language explanation from Gemini.
 * @throws {Error} If Gemini model is not configured or API call fails.
 */
async function explainSituation(prompt) {
  assertModelConfigured();
  const systemPrompt = `You are FIFA FanConnect, a helpful stadium assistant for FIFA World Cup 2026.
Explain the following stadium situation to a fan in a friendly, clear, and concise way.
Keep your response under 120 words. Do not make any decisions — only explain.`;

  if (isOpenRouter) {
    return callOpenRouter(systemPrompt, `Situation: ${prompt}`);
  }
  if (isGroq) {
    return callGroq(systemPrompt, `Situation: ${prompt}`);
  }

  const result = await withTimeout(
    model.generateContent(`${systemPrompt}\nSituation: ${prompt}`),
    GEMINI.TIMEOUT_MS
  );
  return result.response.text().trim();
}

/**
 * Translates a given text into the specified target language.
 * Used as a pure translation layer after deterministic engines produce English output.
 *
 * @param {string} text - The English text to translate.
 * @param {string} targetLanguage - Target language code or name (e.g. 'es', 'French', 'Arabic').
 * @returns {Promise<string>} Translated text string.
 * @throws {Error} If Gemini model is not configured or API call fails.
 */
async function translateToLanguage(text, targetLanguage) {
  assertModelConfigured();
  const systemPrompt = `Translate the following stadium announcement text into ${targetLanguage}.
Return ONLY the translated text — no explanations, no labels, no extra commentary.`;

  if (isOpenRouter) {
    return callOpenRouter(systemPrompt, `Text to translate: "${text}"`);
  }
  if (isGroq) {
    return callGroq(systemPrompt, `Text to translate: "${text}"`);
  }

  const result = await withTimeout(
    model.generateContent(`${systemPrompt}\nText to translate: "${text}"`),
    GEMINI.TIMEOUT_MS
  );
  return result.response.text().trim();
}

/**
 * Answers a fan's question using provided context.
 * Response is Capped at 100 words. Gemini only explains — it does NOT decide.
 *
 * @param {string} question - The fan's question.
 * @param {string} context - Supporting context (FAQ content, engine output, stadium data).
 * @returns {Promise<string>} Answer to the fan's question (max 100 words).
 * @throws {Error} If Gemini model is not configured or API call fails.
 */
async function answerFanQuestion(question, context) {
  assertModelConfigured();
  const systemPrompt = `You are FIFA FanConnect, a smart stadium assistant for FIFA World Cup 2026.
Answer the fan's question using ONLY the provided context.
Keep your answer under 100 words. Be friendly, clear, and helpful.
If the context does not contain enough information, say "Please visit the Fan Information Desk at Gate A1 or C1."

Context:
${context}`;

  if (isOpenRouter) {
    return callOpenRouter(systemPrompt, `Fan's Question: ${question}`);
  }
  if (isGroq) {
    return callGroq(systemPrompt, `Fan's Question: ${question}`);
  }

  const result = await withTimeout(
    model.generateContent(`${systemPrompt}\n\nFan's Question: ${question}`),
    GEMINI.TIMEOUT_MS
  );
  return result.response.text().trim();
}

/**
 * Returns whether the Gemini model is currently configured and available.
 * @returns {boolean} True if model is ready.
 */
function isModelReady() {
  return model !== null || isOpenRouter || isGroq;
}

module.exports = { explainSituation, translateToLanguage, answerFanQuestion, isModelReady };
