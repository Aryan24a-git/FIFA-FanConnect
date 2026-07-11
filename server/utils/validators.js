'use strict';

/**
 * @fileoverview Zod validation schemas and helpers for all FIFA FanConnect API routes.
 * All API inputs must pass through these validators before processing.
 * @module utils/validators
 */

const { z } = require('zod');
const {
  VALID_STADIUM_IDS,
  SUPPORTED_LANGUAGES,
  ALERT_TYPES,
  ALERT_SEVERITIES,
  VALID_PERSONAS,
  INPUT_LIMITS,
} = require('./constants');

/**
 * Strips HTML tags from a string to prevent XSS in server-side processing.
 * Client-side DOMPurify handles browser-side sanitisation.
 * @param {string} str - Input string potentially containing HTML.
 * @returns {string} String with all HTML tags removed.
 */
function stripHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

// ─── SCHEMAS ──────────────────────────────────────────────────────────────────

/**
 * Zod schema for POST /api/assist
 * @type {import('zod').ZodObject}
 */
const assistSchema = z.object({
  persona: z.enum(VALID_PERSONAS, {
    errorMap: () => ({ message: `persona must be one of: ${VALID_PERSONAS.join(', ')}` }),
  }),
  query: z
    .string()
    .min(1, 'query must not be empty')
    .max(INPUT_LIMITS.MAX_QUERY_LENGTH, `query must be at most ${INPUT_LIMITS.MAX_QUERY_LENGTH} characters`)
    .transform(stripHtml),
  language: z.enum(SUPPORTED_LANGUAGES, {
    errorMap: () => ({ message: `language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}` }),
  }).default('en'),
  stadiumId: z.enum(VALID_STADIUM_IDS, {
    errorMap: () => ({ message: `stadiumId must be one of: ${VALID_STADIUM_IDS.join(', ')}` }),
  }),
  context: z.string().max(1000).optional().transform((v) => (v ? stripHtml(v) : undefined)),
});

/**
 * Zod schema for POST /api/alert
 * @type {import('zod').ZodObject}
 */
const alertSchema = z.object({
  stadiumId: z.enum(VALID_STADIUM_IDS, {
    errorMap: () => ({ message: `stadiumId must be one of: ${VALID_STADIUM_IDS.join(', ')}` }),
  }),
  type: z.enum(ALERT_TYPES, {
    errorMap: () => ({ message: `type must be one of: ${ALERT_TYPES.join(', ')}` }),
  }),
  severity: z.enum(ALERT_SEVERITIES, {
    errorMap: () => ({ message: `severity must be one of: ${ALERT_SEVERITIES.join(', ')}` }),
  }),
  location: z
    .string()
    .min(1, 'location must not be empty')
    .max(200, 'location must be at most 200 characters')
    .transform(stripHtml),
  reportedBy: z
    .string()
    .min(1, 'reportedBy must not be empty')
    .max(100)
    .transform(stripHtml),
});

/**
 * Zod schema for POST /api/navigate
 * @type {import('zod').ZodObject}
 */
const navigateSchema = z.object({
  stadiumId: z.enum(VALID_STADIUM_IDS, {
    errorMap: () => ({ message: `stadiumId must be one of: ${VALID_STADIUM_IDS.join(', ')}` }),
  }),
  from: z
    .string()
    .min(1, 'from must not be empty')
    .max(200)
    .transform(stripHtml),
  to: z
    .string()
    .min(1, 'to must not be empty')
    .max(200)
    .transform(stripHtml),
  accessibility: z.boolean().default(false),
  language: z
    .string()
    .min(2)
    .max(INPUT_LIMITS.MAX_LANGUAGE_CODE_LEN)
    .default('en'),
});

/**
 * Zod schema for POST /api/translate
 * @type {import('zod').ZodObject}
 */
const translateSchema = z.object({
  text: z
    .string()
    .min(1, 'text must not be empty')
    .max(INPUT_LIMITS.MAX_QUERY_LENGTH, `text must be at most ${INPUT_LIMITS.MAX_QUERY_LENGTH} characters`)
    .transform(stripHtml),
  targetLanguage: z.enum(SUPPORTED_LANGUAGES, {
    errorMap: () => ({ message: `targetLanguage must be one of: ${SUPPORTED_LANGUAGES.join(', ')}` }),
  }),
  context: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v ? stripHtml(v) : undefined)),
});

// ─── VALIDATION FUNCTIONS ──────────────────────────────────────────────────────

/**
 * Validates POST /api/assist request body.
 * @param {unknown} data - Raw request body.
 * @returns {{ success: boolean, data?: object, errors?: string[] }} Validation result.
 */
function validateAssist(data) {
  const result = assistSchema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error.errors.map((e) => e.message) };
  }
  return { success: true, data: result.data };
}

/**
 * Validates POST /api/alert request body.
 * @param {unknown} data - Raw request body.
 * @returns {{ success: boolean, data?: object, errors?: string[] }} Validation result.
 */
function validateAlert(data) {
  const result = alertSchema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error.errors.map((e) => e.message) };
  }
  return { success: true, data: result.data };
}

/**
 * Validates POST /api/navigate request body.
 * @param {unknown} data - Raw request body.
 * @returns {{ success: boolean, data?: object, errors?: string[] }} Validation result.
 */
function validateNavigate(data) {
  const result = navigateSchema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error.errors.map((e) => e.message) };
  }
  return { success: true, data: result.data };
}

/**
 * Validates POST /api/translate request body.
 * @param {unknown} data - Raw request body.
 * @returns {{ success: boolean, data?: object, errors?: string[] }} Validation result.
 */
function validateTranslate(data) {
  const result = translateSchema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error.errors.map((e) => e.message) };
  }
  return { success: true, data: result.data };
}

module.exports = {
  stripHtml,
  validateAssist,
  validateAlert,
  validateNavigate,
  validateTranslate,
};
