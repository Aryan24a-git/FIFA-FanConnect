'use strict';

/**
 * @fileoverview POST /api/sustainability — Stadium sustainability / eco recommendation route.
 * Returns deterministic carbon metrics and eco-tips, with optional AI translation.
 * @module routes/sustainability
 */

const express = require('express');
const router = express.Router();

const { validateSustainability } = require('../utils/validators');
const { getEcoRecommendation } = require('../engines');
const { translateToLanguage, isModelReady } = require('../services/gemini');
const AppError = require('../utils/AppError');
const { HTTP } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * POST /api/sustainability
 * Calculates carbon footprint of transport choices and provides eco-tips.
 * Returns deterministic recommendations; Gemini translates them if needed.
 *
 * @name POST /api/sustainability
 * @param {string} req.body.stadiumId - Target stadium ID ('metlife', 'atandt', 'sofi').
 * @param {string} [req.body.transportMode] - Mode of transport ('metro', 'bus', 'parking', 'rideshare').
 * @param {string} [req.body.language] - Language code for localizing tips (default: 'en').
 */
router.post('/', async (req, res, next) => {
  try {
    const valResult = validateSustainability(req.body);
    if (!valResult.success) {
      throw new AppError(
        `Validation failed: ${valResult.errors.join(', ')}`,
        HTTP.BAD_REQUEST,
        'sustainability_validation_error'
      );
    }

    const { stadiumId, transportMode, language } = valResult.data;
    logger.info('sustainability_request', { stadiumId, transportMode, language });

    const recommendation = getEcoRecommendation(stadiumId, transportMode);

    let explainedTip = recommendation.ecoTip;
    let translationSource = 'none';

    if (language && language !== 'en' && isModelReady()) {
      try {
        explainedTip = await translateToLanguage(recommendation.ecoTip, language);
        translationSource = 'gemini';
      } catch (err) {
        logger.warn('sustainability_translation_failed', { reason: err.message });
      }
    }

    return res.status(HTTP.OK).json({
      success: true,
      recommendation: {
        ...recommendation,
        ecoTip: explainedTip
      },
      translationSource
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
