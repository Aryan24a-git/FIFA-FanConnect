'use strict';

/**
 * @fileoverview POST /api/transport — Stadium transport recommendation route.
 * Returns deterministic transport modes ranked by congestion with AI translation.
 * @module routes/transport
 */

const express = require('express');
const router = express.Router();

const { validateTransport } = require('../utils/validators');
const { getTransportRecommendation } = require('../engines');
const { translateToLanguage, isModelReady } = require('../services/gemini');
const AppError = require('../utils/AppError');
const { HTTP } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * POST /api/transport
 * Ranks transport options and provides live operational traffic advice.
 * Returns deterministic recommendations; Gemini translates them if needed.
 *
 * @name POST /api/transport
 * @param {string} req.body.stadiumId - Target stadium ID ('metlife', 'atandt', 'sofi').
 * @param {string} req.body.destination - Trip destination ('Airport', 'Downtown', etc.).
 * @param {string} [req.body.time] - Departure time frame (default: 'post-match').
 * @param {string} [req.body.language] - Language code for localizing tips (default: 'en').
 */
router.post('/', async (req, res, next) => {
  try {
    const valResult = validateTransport(req.body);
    if (!valResult.success) {
      throw new AppError(
        `Validation failed: ${valResult.errors.join(', ')}`,
        HTTP.BAD_REQUEST,
        'transport_validation_error'
      );
    }

    const { stadiumId, destination, time, language } = valResult.data;
    logger.info('transport_request', { stadiumId, destination, time, language });

    const recommendation = getTransportRecommendation(stadiumId, destination, time);

    let explainedAdvice = recommendation.generalAdvice;
    let translationSource = 'none';

    if (language && language !== 'en' && isModelReady()) {
      try {
        explainedAdvice = await translateToLanguage(recommendation.generalAdvice, language);
        translationSource = 'gemini';
      } catch (err) {
        logger.warn('transport_translation_failed', { reason: err.message });
      }
    }

    return res.status(HTTP.OK).json({
      success: true,
      recommendation: {
        ...recommendation,
        generalAdvice: explainedAdvice
      },
      translationSource
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
