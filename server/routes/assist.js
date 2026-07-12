'use strict';

/**
 * @fileoverview POST /api/assist — Fan, Volunteer, and Staff assist route.
 * Runs deterministic engines first, then uses Gemini ONLY to explain results.
 * Falls back to FAQ database if Gemini is unavailable or fails.
 * @module routes/assist
 */

const express = require('express');
const router = express.Router();

const { validateAssist } = require('../utils/validators');
const { analyzeCrowd } = require('../engines/crowdEngine');
const { getRoute } = require('../engines/routingEngine');
const { generateAlert } = require('../engines/alertEngine');
const { searchFaqs } = require('../data/faqDatabase');
const { getStadiumById } = require('../data/stadiumData');
const { answerFanQuestion, isModelReady, translateToLanguage } = require('../services/gemini');
const AppError = require('../utils/AppError');
const { HTTP, GEMINI } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Builds a context string for Gemini from engine output and FAQ data.
 * @param {string} query - Fan's original query.
 * @param {object} stadium - Stadium data object.
 * @param {object} engineResult - Result from the deterministic engine.
 * @returns {string} Combined context string for Gemini.
 */
function buildGeminiContext(query, stadium, engineResult) {
  const faqs = searchFaqs(query);
  const faqText = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
  const engineText = engineResult ? `Engine Decision:\n${JSON.stringify(engineResult, null, 2)}` : '';
  const stadiumText = stadium
    ? `Stadium: ${stadium.name} in ${stadium.city} (capacity: ${stadium.capacity})`
    : '';
  return [stadiumText, engineText, faqText].filter(Boolean).join('\n\n');
}

/**
 * Determines which engine to invoke based on the fan's query text.
 * Uses keyword detection — pure deterministic logic.
 * @param {string} query - The fan's query string.
 * @param {object} stadium - Stadium data object.
 * @returns {{ engineName: string, engineResult: object }} Engine name and its output.
 */
function runRelevantEngine(query, stadium) {
  const q = query.toLowerCase();
  const gates = stadium ? stadium.gates : [];

  if (q.includes('crowd') || q.includes('queue') || q.includes('busy') || q.includes('gate') || q.includes('enter')) {
    const engineResult = analyzeCrowd(stadium.id, gates);
    return { engineName: 'crowdEngine', engineResult };
  }

  if (
    q.includes('where') || q.includes('navigate') || q.includes('direction') ||
    q.includes('find') || q.includes('get to') || q.includes('route') ||
    q.includes('food') || q.includes('toilet') || q.includes('medical') ||
    q.includes('exit') || q.includes('parking') || q.includes('metro')
  ) {
    const from = 'entrance';
    const to = q.includes('food') ? 'food'
      : q.includes('toilet') || q.includes('restroom') ? 'toilet'
      : q.includes('medical') || q.includes('first aid') ? 'medical'
      : q.includes('exit') ? 'exit'
      : q.includes('parking') ? 'parking'
      : q.includes('metro') || q.includes('train') ? 'metro'
      : 'info_desk';
    const engineResult = getRoute(from, to, false);
    return { engineName: 'routingEngine', engineResult };
  }

  if (q.includes('alert') || q.includes('emergency') || q.includes('danger') || q.includes('evacuate')) {
    const engineResult = generateAlert('SECURITY', 'MEDIUM', 'General Stadium Area');
    return { engineName: 'alertEngine', engineResult };
  }

  return { engineName: 'none', engineResult: null };
}

/**
 * POST /api/assist
 * Smart fan/volunteer/staff assistant endpoint.
 * Validates input → runs deterministic engine → uses Gemini to explain → fallback to FAQ.
 *
 * @name POST /api/assist
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
router.post('/', async (req, res, next) => {
  try {
    // 1. Validate input
    const validation = validateAssist(req.body);
    if (!validation.success) {
      return next(new AppError(validation.errors.join('; '), HTTP.BAD_REQUEST, 'VALIDATION_ERROR'));
    }

    const { persona, query, language, stadiumId, context } = validation.data;
    const stadium = getStadiumById(stadiumId);

    if (!stadium) {
      return next(new AppError(`Stadium '${stadiumId}' not found.`, HTTP.NOT_FOUND, 'STADIUM_NOT_FOUND'));
    }

    logger.info({ event: 'assist_request', persona, stadiumId, language });

    // 2. Run deterministic engine first
    const { engineName, engineResult } = runRelevantEngine(query, stadium);

    // 3. Gemini explains engine result — NEVER decides
    let response = null;
    let source = 'engine';

    if (isModelReady()) {
      try {
        const geminiContext = buildGeminiContext(query, stadium, engineResult);
        const combinedContext = context ? `${geminiContext}\n\nAdditional context: ${context}` : geminiContext;
        response = await answerFanQuestion(query, combinedContext);
        if (language !== 'en') {
          response = await translateToLanguage(response, language);
        }
        source = 'gemini';
      } catch (geminiErr) {
        logger.warn({ event: 'gemini_fallback', reason: geminiErr.message });
        // Fall through to FAQ fallback
      }
    }

    // 4. Fallback: search FAQ database
    if (!response) {
      const faqs = searchFaqs(query);
      if (faqs.length > 0) {
        response = faqs[0].answer;
        source = 'faq';
      } else {
        response = GEMINI.FALLBACK_MESSAGE;
        source = 'fallback';
      }

      if (language !== 'en' && isModelReady()) {
        try {
          response = await translateToLanguage(response, language);
        } catch (transErr) {
          logger.warn({ event: 'fallback_translation_failed', reason: transErr.message });
        }
      }
    }

    return res.status(HTTP.OK).json({
      response,
      decision: engineResult,
      engineUsed: engineName,
      source,
      aiModel: isModelReady() ? GEMINI.MODEL : 'offline',
      persona,
      stadiumId,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
