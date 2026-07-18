'use strict';

/**
 * @fileoverview POST /api/translate — Text translation route.
 * Pure Gemini translation layer. Falls back to "Translation unavailable" if Gemini fails.
 * @module routes/translate
 */

const express = require('express');
const router = express.Router();

const { validateTranslate } = require('../utils/validators');
const { translateToLanguage, isModelReady } = require('../services/gemini');
const AppError = require('../utils/AppError');
const { HTTP } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * POST /api/translate
 * Translates provided text into the target language using Gemini.
 * Returns fallback message if Gemini is unavailable or fails.
 *
 * @name POST /api/translate
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const handleTranslateRequest = async (req, res, next) => {
  try {
    // 1. Validate input
    const validation = validateTranslate(req.body);
    if (!validation.success) {
      return next(new AppError(validation.errors.join('; '), HTTP.BAD_REQUEST, 'VALIDATION_ERROR'));
    }

    const { text, targetLanguage, context } = validation.data;

    logger.info({ event: 'translate_request', targetLanguage, textLength: text.length });

    // 2. If target is English, no translation needed
    if (targetLanguage === 'en') {
      return res.status(HTTP.OK).json({
        original: text,
        translated: text,
        language: 'en',
        source: 'passthrough',
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Gemini translation — pure translation layer
    let translated = null;
    let source = 'gemini';

    if (!isModelReady()) {
      translated = 'Translation unavailable. Please visit the Fan Information Desk for assistance.';
      source = 'fallback';
    } else {
      try {
        const textToTranslate = context ? `${text}\n\nContext: ${context}` : text;
        translated = await translateToLanguage(textToTranslate, targetLanguage);
        source = 'gemini';
      } catch (geminiErr) {
        logger.warn({ event: 'gemini_translate_error', reason: geminiErr.message });
        translated =
          'Translation unavailable. Please visit the Fan Information Desk for assistance.';
        source = 'fallback';
      }
    }

    return res.status(HTTP.OK).json({
      original: text,
      translated,
      language: targetLanguage,
      source,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return next(err);
  }
};

router.post('/', handleTranslateRequest);

module.exports = router;
