'use strict';

/**
 * @fileoverview AppError — centralized operational error class for FIFA FanConnect.
 * All thrown errors in routes and middleware must use this class.
 * @module utils/AppError
 */

/**
 * Custom operational error class.
 * Extends native Error with HTTP statusCode and application error code.
 *
 * @extends {Error}
 * @example
 * throw new AppError('Stadium not found', 404, 'STADIUM_NOT_FOUND');
 */
class AppError extends Error {
  /**
   * Creates a new AppError instance.
   * @param {string} message - Human-readable error message.
   * @param {number} [statusCode=500] - HTTP status code.
   * @param {string} [code='INTERNAL_SERVER_ERROR'] - Application-level error code.
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    /** @type {number} HTTP status code */
    this.statusCode = statusCode;
    /** @type {string} Application error code */
    this.code = code;
    /** @type {string} Error status string */
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    /** @type {boolean} Marks this as an operational (expected) error */
    this.isOperational = true;

    // Capture stack trace, excluding this constructor
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
