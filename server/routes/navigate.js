'use strict';

/**
 * @fileoverview POST /api/navigate — Stadium routing and navigation route.
 * routingEngine provides deterministic step-by-step instructions.
 * Gemini translates instructions into requested language. Fallback: English.
 * @module routes/navigate
 */

const express = require('express');
const router = express.Router();

const { validateNavigate } = require('../utils/validators');
const { getRoute } = require('../engines/routingEngine');
const { translateToLanguage, isModelReady } = require('../services/gemini');
const { getStadiumById } = require('../data/stadiumData');
const AppError = require('../utils/AppError');
const { HTTP } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * POST /api/navigate
 * Returns step-by-step navigation instructions for a fan.
 * routingEngine provides deterministic steps; Gemini translates if needed.
 *
 * @name POST /api/navigate
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
router.post('/', async (req, res, next) => {
  try {
    // 1. Validate input
    const validation = validateNavigate(req.body);
    if (!validation.success) {
      return next(new AppError(validation.errors.join('; '), HTTP.BAD_REQUEST, 'VALIDATION_ERROR'));
    }

    const { stadiumId, from, to, accessibility, language } = validation.data;

    // 2. Validate stadium exists
    const stadium = getStadiumById(stadiumId);
    if (!stadium) {
      return next(new AppError(`Stadium '${stadiumId}' not found.`, HTTP.NOT_FOUND, 'STADIUM_NOT_FOUND'));
    }

    logger.info({ event: 'navigate_request', stadiumId, from, to, accessibility, language });

    // 3. Deterministic routing engine — always runs first
    const route = getRoute(from, to, accessibility);

    // 4. If language is not English, Gemini translates the step instructions
    let steps = route.steps;
    let translationSource = 'engine';

    if (language !== 'en' && isModelReady()) {
      try {
        const stepsText = route.steps.map((s) => `Step ${s.step}: ${s.instruction}`).join('\n');
        const translatedText = await translateToLanguage(stepsText, language);

        // Parse translated lines back into step objects
        const lines = translatedText.split('\n').filter(Boolean);
        steps = lines.map((line, i) => ({
          step: i + 1,
          instruction: line.replace(/^Step \d+:\s*/i, '').trim(),
          icon: route.steps[i] ? route.steps[i].icon : '📍',
        }));
        translationSource = 'gemini';
      } catch (geminiErr) {
        logger.warn({ event: 'gemini_translate_failed', reason: geminiErr.message });
        // Fallback: return English instructions
        steps = route.steps;
        translationSource = 'fallback_english';
      }
    }

    // Parse estimated time into a numeric range (minutes)
    const timeStr = route.estimatedTime || '5–10 min';
    const timeNumbers = timeStr.match(/\d+/g);
    const estimatedMinutes = timeNumbers ? timeNumbers.map(Number) : [5, 10];

    return res.status(HTTP.OK).json({
      steps,
      estimatedMinutes,
      estimatedTime: route.estimatedTime,
      accessibility: route.accessibilityNeeded,
      note: route.note,
      from: route.from,
      to: route.to,
      language,
      translationSource,
      stadium: { id: stadium.id, name: stadium.name },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
