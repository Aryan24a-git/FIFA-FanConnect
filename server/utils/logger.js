'use strict';

/**
 * @fileoverview Structured JSON logger for FIFA FanConnect.
 * Wraps console methods to always emit JSON — no raw console.log in application code.
 * @module utils/logger
 */

/**
 * Returns the current ISO timestamp string.
 * @returns {string}
 */
function now() {
  return new Date().toISOString();
}

/**
 * Serializes a log entry to JSON and writes to stdout/stderr.
 * @param {'info'|'warn'|'error'|'debug'} level - Log level.
 * @param {string|object} data - Log data (string message or object with fields).
 */
function write(level, data) {
  const entry = {
    timestamp: now(),
    level,
    service: 'fifa-fanconnect',
    ...(typeof data === 'string' ? { message: data } : data),
  };
  const output = JSON.stringify(entry);
  if (level === 'error') {
    console.error(output);
  } else {
    console.log(output);
  }
}

/**
 * Logs an informational message.
 * @param {string|object} data - Message string or structured log fields.
 */
function info(data) {
  write('info', data);
}

/**
 * Logs a warning message.
 * @param {string|object} data - Message string or structured log fields.
 */
function warn(data) {
  write('warn', data);
}

/**
 * Logs an error message.
 * @param {string|object} data - Message string or structured log fields.
 */
function error(data) {
  write('error', data);
}

/**
 * Logs a debug message (only in non-production environments).
 * @param {string|object} data - Message string or structured log fields.
 */
function debug(data) {
  if (process.env.NODE_ENV !== 'production') {
    write('debug', data);
  }
}

module.exports = { info, warn, error, debug };
