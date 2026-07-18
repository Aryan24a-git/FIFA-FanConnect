'use strict';

/**
 * @fileoverview Deterministic crowd analysis engine for FIFA FanConnect.
 * All crowd decisions use pure IF/ELSE rules based on queue thresholds.
 * Gemini AI is never invoked here — this engine is AI-free.
 * @module engines/crowdEngine
 */

const { CROWD_LEVELS, CROWD_THRESHOLDS, CROWD_ACTIONS } = require('../utils/constants');

/**
 * Calculates the percentage utilisation of a gate.
 * @param {number} current - Current queue count.
 * @param {number} max - Maximum queue capacity.
 * @returns {number} Percentage utilisation (0–100+).
 */
function calcUtilisation(current, max) {
  if (max <= 0) {
    return 0;
  }
  return Math.round((current / max) * 100);
}

/**
 * Determines crowd level from a utilisation percentage using deterministic thresholds.
 * @param {number} pct - Gate utilisation percentage.
 * @returns {string} Crowd level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'.
 */
function classifyLevel(pct) {
  if (pct > CROWD_THRESHOLDS.CRITICAL) {
    return CROWD_LEVELS.CRITICAL;
  }
  if (pct > CROWD_THRESHOLDS.HIGH) {
    return CROWD_LEVELS.HIGH;
  }
  if (pct > CROWD_THRESHOLDS.MODERATE) {
    return CROWD_LEVELS.MODERATE;
  }
  return CROWD_LEVELS.LOW;
}

/**
 * Returns the recommended operational actions for a given crowd level.
 * All logic is deterministic IF/ELSE — no AI.
 * @param {string} crowdLevel - One of 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'.
 * @param {string} gateId - The gate identifier affected.
 * @returns {{ actions: string[], priority: string }} Recommended actions and priority level.
 */
function getActionsForLevel(crowdLevel, gateId) {
  if (crowdLevel === CROWD_LEVELS.CRITICAL) {
    return {
      priority: 'URGENT',
      actions: [
        `Close gate ${gateId} to new arrivals immediately`,
        CROWD_ACTIONS.CRITICAL.REDIRECT,
        CROWD_ACTIONS.CRITICAL.SECURITY_ALERT,
        CROWD_ACTIONS.CRITICAL.PA_ANNOUNCEMENT,
      ],
    };
  }

  if (crowdLevel === CROWD_LEVELS.HIGH) {
    return {
      priority: 'HIGH',
      actions: [
        CROWD_ACTIONS.HIGH.EXPRESS_LANES,
        CROWD_ACTIONS.HIGH.SECURITY_ALERT,
        `Monitor gate ${gateId} – prepare to redirect if utilisation rises above 90%`,
      ],
    };
  }

  if (crowdLevel === CROWD_LEVELS.MODERATE) {
    return {
      priority: 'NORMAL',
      actions: [CROWD_ACTIONS.MODERATE.MONITOR, CROWD_ACTIONS.MODERATE.INCREASE_STAFF],
    };
  }

  // LOW
  return {
    priority: 'LOW',
    actions: [CROWD_ACTIONS.LOW.NORMAL_OPS],
  };
}

/**
 * Analyzes crowd conditions for a stadium by evaluating all gate queues.
 * Returns the overall crowd level, per-gate breakdown, and recommended actions.
 * Uses deterministic IF/ELSE thresholds — Gemini AI is NOT used here.
 *
 * @param {string} stadiumId - The stadium identifier (e.g. 'metlife').
 * @param {Array<{id: string, currentQueue: number, maxQueue: number, section: string}>} gateData
 *   - Array of gate objects with live queue counts.
 * @returns {{
 *   stadiumId: string,
 *   overallLevel: string,
 *   overallUtilisation: number,
 *   gateBreakdown: Array<{gateId: string, section: string, utilisation: number, level: string, actions: string[], priority: string}>,
 *   criticalGates: string[],
 *   timestamp: string
 * }} Structured crowd analysis result.
 */
function analyzeCrowd(stadiumId, gateData) {
  if (!Array.isArray(gateData) || gateData.length === 0) {
    return {
      stadiumId,
      overallLevel: CROWD_LEVELS.LOW,
      overallUtilisation: 0,
      gateBreakdown: [],
      criticalGates: [],
      timestamp: new Date().toISOString(),
    };
  }

  const gateBreakdown = gateData.map((gate) => {
    const utilisation = calcUtilisation(gate.currentQueue, gate.maxQueue);
    const level = classifyLevel(utilisation);
    const { actions, priority } = getActionsForLevel(level, gate.id);
    return {
      gateId: gate.id,
      section: gate.section,
      utilisation,
      level,
      priority,
      actions,
    };
  });

  // Overall utilisation = average across all gates
  const totalUtil = gateBreakdown.reduce((sum, g) => sum + g.utilisation, 0);
  const overallUtilisation = Math.round(totalUtil / gateBreakdown.length);
  const overallLevel = classifyLevel(overallUtilisation);
  const criticalGates = gateBreakdown
    .filter((g) => g.level === CROWD_LEVELS.CRITICAL || g.level === CROWD_LEVELS.HIGH)
    .map((g) => g.gateId);

  return {
    stadiumId,
    overallLevel,
    overallUtilisation,
    gateBreakdown,
    criticalGates,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Recommends the least-congested gate for a given seating section.
 * Selects from gates whose section matches and returns the one with the lowest utilisation.
 * Pure deterministic logic — no AI.
 *
 * @param {string} section - The seating section letter (e.g. 'A', 'B', 'C').
 * @param {Array<{id: string, name: string, section: string, currentQueue: number, maxQueue: number}>} gateData
 *   - Array of gate objects with live queue counts.
 * @returns {{
 *   recommendedGate: string|null,
 *   gateName: string|null,
 *   utilisation: number|null,
 *   level: string|null,
 *   alternateGates: Array<{id: string, name: string, utilisation: number, level: string}>
 * }} Gate recommendation result.
 */
function getGateRecommendation(section, gateData) {
  if (!Array.isArray(gateData) || !section) {
    return {
      recommendedGate: null,
      gateName: null,
      utilisation: null,
      level: null,
      alternateGates: [],
    };
  }

  // Gates matching the requested section
  const sectionGates = gateData.filter((g) => g.section.toUpperCase() === section.toUpperCase());

  // Fallback: if no gates for section, use all gates
  const candidateGates = sectionGates.length > 0 ? sectionGates : gateData;

  // Sort by lowest utilisation
  const ranked = candidateGates
    .map((gate) => {
      const util = calcUtilisation(gate.currentQueue, gate.maxQueue);
      return {
        id: gate.id,
        name: gate.name,
        utilisation: util,
        level: classifyLevel(util),
      };
    })
    .sort((a, b) => a.utilisation - b.utilisation);

  if (ranked.length === 0) {
    return {
      recommendedGate: null,
      gateName: null,
      utilisation: null,
      level: null,
      alternateGates: [],
    };
  }

  const [best, ...alternates] = ranked;

  return {
    recommendedGate: best.id,
    gateName: best.name,
    utilisation: best.utilisation,
    level: best.level,
    alternateGates: alternates.slice(0, 3), // Return up to 3 alternates
  };
}

/**
 * Exports:
 * - analyzeCrowd: Used by the /api/assist route (fan query keyword detection triggers crowd analysis).
 * - getGateRecommendation: Exposed for direct gate recommendation queries and future API expansion.
 *   Not a dead export — intentionally public for stadium operations integration.
 */
module.exports = { analyzeCrowd, getGateRecommendation };
