'use strict';

/**
 * @fileoverview Centralized constants for FIFA FanConnect.
 * All thresholds, limits, and enum-style values live here.
 * Import from this file — never hardcode magic numbers elsewhere.
 * @module utils/constants
 */

// ─── CROWD LEVELS ─────────────────────────────────────────────────────────────

/**
 * Named crowd level labels used across crowd and alert engines.
 * @readonly
 * @enum {string}
 */
const CROWD_LEVELS = Object.freeze({
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
});

/**
 * Gate utilisation percentage thresholds for crowd classification.
 * A gate is classified at the level if its utilisation is ABOVE this value.
 * Example: utilisation of 91% → CRITICAL (above 90).
 * @readonly
 */
const CROWD_THRESHOLDS = Object.freeze({
  CRITICAL: 90, // >90% → CRITICAL
  HIGH: 75,     // >75% → HIGH
  MODERATE: 50, // >50% → MODERATE
  // ≤50%     → LOW
});

/**
 * Recommended operational actions mapped to crowd levels.
 * @readonly
 */
const CROWD_ACTIONS = Object.freeze({
  CRITICAL: {
    REDIRECT: 'Redirect all incoming fans to alternate gates immediately.',
    SECURITY_ALERT: 'Alert security command centre — CRITICAL crowd event.',
    PA_ANNOUNCEMENT: 'Broadcast PA announcement: fans to use alternate gates.',
  },
  HIGH: {
    EXPRESS_LANES: 'Activate express scanning lanes at affected gate.',
    SECURITY_ALERT: 'Notify security supervisor — HIGH crowd alert.',
  },
  MODERATE: {
    MONITOR: 'Increase monitoring frequency on gate queue feed.',
    INCREASE_STAFF: 'Deploy 2 additional stewards to this gate.',
  },
  LOW: {
    NORMAL_OPS: 'Normal operations — no action required.',
  },
});

// ─── ALERT TYPES & SEVERITIES ─────────────────────────────────────────────────

/**
 * Valid alert type identifiers (object form for engine use).
 * @readonly
 * @enum {string}
 */
const ALERT_TYPES_OBJ = Object.freeze({
  CROWD: 'CROWD',
  MEDICAL: 'MEDICAL',
  WEATHER: 'WEATHER',
  SECURITY: 'SECURITY',
  TRANSPORT: 'TRANSPORT',
});

/**
 * Valid alert type identifiers as array (for Zod enum validation).
 * @readonly
 * @type {readonly [string, ...string[]]}
 */
const ALERT_TYPES = Object.freeze(['CROWD', 'MEDICAL', 'WEATHER', 'SECURITY', 'TRANSPORT']);

/**
 * Valid alert severity levels (object form for engine use).
 * @readonly
 * @enum {string}
 */
const ALERT_SEVERITIES_OBJ = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
});

/**
 * Valid alert severity levels as array (for Zod enum validation).
 * @readonly
 * @type {readonly [string, ...string[]]}
 */
const ALERT_SEVERITIES = Object.freeze(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

/**
 * Valid persona identifiers for the /api/assist route.
 * @readonly
 * @type {readonly [string, ...string[]]}
 */
const VALID_PERSONAS = Object.freeze(['fan', 'volunteer', 'staff']);

/**
 * Supported language codes for translation and response localisation.
 * @readonly
 * @type {readonly [string, ...string[]]}
 */
const SUPPORTED_LANGUAGES = Object.freeze(['en', 'es', 'fr', 'ar', 'pt', 'de', 'ja', 'hi', 'zh']);

/**
 * Maximum length for any user-submitted message or query.
 * @readonly
 * @type {number}
 */
const MAX_MESSAGE_LENGTH = 500;

/**
 * Alert priority codes (P1 = most urgent).
 * @readonly
 * @enum {string}
 */
const ALERT_PRIORITIES = Object.freeze({
  P1: 'P1_CRITICAL',
  P2: 'P2_HIGH',
  P3: 'P3_MEDIUM',
  P4: 'P4_LOW',
});



// ─── API / RATE LIMITS ────────────────────────────────────────────────────────

/**
 * Rate limiting configuration for the API.
 * @readonly
 */
const RATE_LIMIT = Object.freeze({
  WINDOW_MS: 15 * 60 * 1000,   // 15 minutes
  MAX_REQUESTS: 100,
  GEMINI_MAX_REQUESTS: 20,     // Stricter limit for AI calls
  GEMINI_WINDOW_MS: 60 * 1000, // 1 minute window for Gemini calls
});



// ─── INPUT LIMITS ─────────────────────────────────────────────────────────────

/**
 * Input validation limits.
 * @readonly
 */
const INPUT_LIMITS = Object.freeze({
  MAX_QUERY_LENGTH: 500,       // Max chars for fan query strings
  MAX_BODY_SIZE: '10kb',       // Express body parser limit
  MAX_LANGUAGE_CODE_LEN: 10,   // Max length for language codes (e.g. 'en', 'es-MX')
});

// ─── GEMINI AI ─────────────────────────────────────────────────────────────────

/**
 * Gemini AI configuration constants.
 * Gemini is ONLY used as explanation/translation layer — never for decisions.
 * @readonly
 */
const GEMINI = Object.freeze({
  MODEL: 'gemini-2.0-flash',
  MAX_OUTPUT_TOKENS: 512,
  TEMPERATURE: 0.3,             // Low temperature = factual, consistent responses
  TIMEOUT_MS: 8000,             // Abort Gemini call after 8 seconds
  FALLBACK_MESSAGE: 'I am unable to process your request at this moment. Please visit the Fan Information Desk at Gate A1 or Gate C1 for assistance.',
});

// ─── STADIUM CONFIG ────────────────────────────────────────────────────────────

/**
 * Valid stadium IDs. Used for Zod validation.
 * @readonly
 * @type {string[]}
 */
const VALID_STADIUM_IDS = Object.freeze(['metlife', 'atandt', 'sofi']);

/**
 * Valid seating zone letters used across all stadiums.
 * @readonly
 * @type {string[]}
 */
const VALID_ZONES = Object.freeze(['A', 'B', 'C', 'D', 'E', 'F']);

// ─── HTTP STATUS CODES ────────────────────────────────────────────────────────

/**
 * Common HTTP status codes used in AppError and route handlers.
 * @readonly
 */
const HTTP = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
});

module.exports = {
  CROWD_LEVELS,
  CROWD_THRESHOLDS,
  CROWD_ACTIONS,
  ALERT_TYPES,
  ALERT_TYPES_OBJ,
  ALERT_SEVERITIES,
  ALERT_SEVERITIES_OBJ,
  ALERT_PRIORITIES,
  VALID_PERSONAS,
  SUPPORTED_LANGUAGES,
  MAX_MESSAGE_LENGTH,
  RATE_LIMIT,
  INPUT_LIMITS,
  GEMINI,
  VALID_STADIUM_IDS,
  VALID_ZONES,
  HTTP,
};
