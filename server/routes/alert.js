'use strict';

/**
 * @fileoverview POST /api/alert — Stadium alert generation route.
 * Deterministic alertEngine runs first. Gemini only generates broadcast message for HIGH/CRITICAL.
 * @module routes/alert
 */

const express = require('express');
const router = express.Router();

const { validateAlert } = require('../utils/validators');
const { generateAlert } = require('../engines');
const { explainSituation, isModelReady } = require('../services/gemini');
const { getStadiumById } = require('../data/stadiumData');
const AppError = require('../utils/AppError');
const { HTTP } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * POST /api/alert
 * Generates a deterministic stadium alert and optionally enriches it with a
 * Gemini-generated broadcast message for HIGH and CRITICAL severity events.
 *
 * @name POST /api/alert
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const handleAlertRequest = async (req, res, next) => {
  try {
    // 1. Validate input
    const validation = validateAlert(req.body);
    if (!validation.success) {
      return next(new AppError(validation.errors.join('; '), HTTP.BAD_REQUEST, 'VALIDATION_ERROR'));
    }

    const { stadiumId, type, severity, location, reportedBy } = validation.data;

    // 2. Validate stadium exists
    const stadium = getStadiumById(stadiumId);
    if (!stadium) {
      return next(
        new AppError(`Stadium '${stadiumId}' not found.`, HTTP.NOT_FOUND, 'STADIUM_NOT_FOUND'),
      );
    }

    logger.info({ event: 'alert_request', stadiumId, type, severity, location, reportedBy });

    // 3. Deterministic engine generates the alert — ALWAYS runs regardless of Gemini
    const alert = generateAlert(type, severity, location);

    // 4. For HIGH or CRITICAL: Gemini generates a PA/broadcast message (explanation only)
    let broadcastMessage = null;

    if ((severity === 'HIGH' || severity === 'CRITICAL') && isModelReady()) {
      try {
        const situationPrompt =
          `Stadium: ${stadium.name} (${stadium.city}). ` +
          `Alert type: ${type}. Severity: ${severity}. Location: ${location}. ` +
          `Situation: ${alert.message}. ` +
          `Write a calm, clear PA announcement for fans in the stadium. Under 80 words.`;
        broadcastMessage = await explainSituation(situationPrompt);
      } catch (geminiErr) {
        logger.warn({ event: 'gemini_broadcast_failed', reason: geminiErr.message });
        // Fallback broadcast message using the deterministic alert message
        broadcastMessage = `STADIUM ANNOUNCEMENT: ${alert.message} Please follow all staff instructions.`;
      }
    } else if (severity === 'HIGH' || severity === 'CRITICAL') {
      // Gemini not configured — use deterministic fallback broadcast
      broadcastMessage = `STADIUM ANNOUNCEMENT: ${alert.message} Please follow all staff instructions.`;
    }

    return res.status(HTTP.OK).json({
      alert,
      broadcastMessage,
      broadcastSource: broadcastMessage
        ? isModelReady()
          ? 'gemini'
          : 'deterministic_fallback'
        : null,
      affectedZones: alert.affectedZones,
      stadium: { id: stadium.id, name: stadium.name },
      reportedBy,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return next(err);
  }
};

router.post('/', handleAlertRequest);

module.exports = router;
