'use strict';

/**
 * @fileoverview Deterministic alert generation engine for FIFA FanConnect.
 * Generates structured alerts for crowd, medical, weather, security, and transport events.
 * All logic is pure IF/ELSE — Gemini AI is never used in alert decisions.
 * @module engines/alertEngine
 */

const {
  ALERT_TYPES_OBJ: ALERT_TYPES,
  ALERT_SEVERITIES_OBJ: ALERT_SEVERITIES,
  ALERT_PRIORITIES,
} = require('../utils/constants');

/**
 * @typedef {{ type: string, severity: string, location: string, priority: string, message: string, affectedZones: string[], instructions: string[], timestamp: string, id: string }} Alert
 */

/**
 * Generates a unique alert ID from timestamp and type.
 * @param {string} type - Alert type.
 * @returns {string} Unique alert identifier string.
 */
function generateAlertId(type) {
  return `ALERT-${type}-${Date.now()}`;
}

/**
 * Determines alert priority from severity level using deterministic rules.
 * @param {string} severity - One of 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'.
 * @returns {string} Priority label.
 */
function resolvePriority(severity) {
  if (severity === ALERT_SEVERITIES.CRITICAL) {
    return ALERT_PRIORITIES.P1;
  }
  if (severity === ALERT_SEVERITIES.HIGH) {
    return ALERT_PRIORITIES.P2;
  }
  if (severity === ALERT_SEVERITIES.MEDIUM) {
    return ALERT_PRIORITIES.P3;
  }
  return ALERT_PRIORITIES.P4;
}

/**
 * Returns affected zones based on alert location and type.
 * @param {string} location - Location string describing the affected area.
 * @param {string} type - Alert type.
 * @returns {string[]} Array of affected zone identifiers.
 */
function resolveAffectedZones(location, type) {
  const loc = location.toLowerCase();

  // Map known sections/areas to zones
  if (loc.includes('gate a') || loc.includes('north')) {
    return ['Zone A', 'North Concourse'];
  }
  if (loc.includes('gate b') || loc.includes('east')) {
    return ['Zone B', 'East Concourse'];
  }
  if (loc.includes('gate c') || loc.includes('south')) {
    return ['Zone C', 'South Concourse'];
  }
  if (loc.includes('gate d') || loc.includes('west')) {
    return ['Zone D', 'West Concourse'];
  }
  if (loc.includes('gate e') || loc.includes('gate f')) {
    return ['Zone E', 'Zone F', 'Accessible Areas'];
  }
  if (loc.includes('field') || loc.includes('pitch')) {
    return ['Field Level', 'All Lower Sections'];
  }
  if (type === ALERT_TYPES.WEATHER) {
    return ['All Zones', 'Entire Stadium'];
  }
  if (type === ALERT_TYPES.SECURITY) {
    return ['All Zones', 'All Concourses'];
  }

  return ['All Zones'];
}

/**
 * Returns the fan-facing message and steward instructions for a CROWD alert.
 * @param {string} severity - Alert severity.
 * @param {string} location - Affected gate or area.
 * @returns {{ message: string, instructions: string[] }}
 */
function buildCrowdAlert(severity, location) {
  if (severity === ALERT_SEVERITIES.CRITICAL) {
    return {
      message: `⚠️ CRITICAL: ${location} has reached maximum capacity. Entry is temporarily suspended.`,
      instructions: [
        `Do NOT approach ${location} — gate is closed to new arrivals.`,
        'Redirect to alternate gates with lower queue levels.',
        'Stewards at all concourse junctions are active — follow their guidance.',
        'Security reinforcement has been dispatched to this zone.',
      ],
    };
  }
  if (severity === ALERT_SEVERITIES.HIGH) {
    return {
      message: `🟠 HIGH CROWD: ${location} is operating at high capacity. Expect delays of 10–15 min.`,
      instructions: [
        'Express scanning lanes are now open at this gate.',
        'Consider using alternate gates in adjacent sections.',
        'Have your ticket and ID ready to speed up entry.',
        'Stadium operations staff have been notified.',
      ],
    };
  }
  if (severity === ALERT_SEVERITIES.MEDIUM) {
    return {
      message: `🟡 MODERATE CROWD: ${location} is busier than usual. Slight delays expected.`,
      instructions: [
        'Additional staff have been deployed to this area.',
        'Please have your ticket ready before reaching the scanner.',
        'Monitor the FIFA FanConnect app for real-time queue updates.',
      ],
    };
  }
  return {
    message: `✅ LOW CROWD: ${location} is operating normally. No delays expected.`,
    instructions: ['Normal entry procedures in effect. No action required.'],
  };
}

/**
 * Returns the fan-facing message and steward instructions for a MEDICAL alert.
 * @param {string} severity - Alert severity.
 * @param {string} location - Location of medical incident.
 * @returns {{ message: string, instructions: string[] }}
 */
function buildMedicalAlert(severity, location) {
  if (severity === ALERT_SEVERITIES.CRITICAL) {
    return {
      message: `🚨 MEDICAL EMERGENCY at ${location}. Emergency services are responding.`,
      instructions: [
        'Clear a path for medical personnel — do NOT crowd the area.',
        'Stewards are managing crowd flow in this zone.',
        'If you are a medical professional, identify yourself to the nearest steward.',
        'Follow steward instructions and remain calm.',
      ],
    };
  }
  if (severity === ALERT_SEVERITIES.HIGH) {
    return {
      message: `🏥 MEDICAL INCIDENT at ${location}. First Aid team is on site.`,
      instructions: [
        'Give space to First Aid personnel.',
        'Do not block concourse access near this location.',
        'Nearest First Aid station is at Gate A1 and Gate C1.',
      ],
    };
  }
  return {
    message: `ℹ️ Medical assistance requested at ${location}. First Aid team notified.`,
    instructions: [
      'First Aid team has been alerted.',
      'If you need urgent help, alert the nearest steward immediately.',
    ],
  };
}

/**
 * Returns the fan-facing message and steward instructions for a WEATHER alert.
 * @param {string} severity - Alert severity.
 * @param {string} location - Stadium location.
 * @returns {{ message: string, instructions: string[] }}
 */
function buildWeatherAlert(severity, location) {
  if (severity === ALERT_SEVERITIES.CRITICAL) {
    return {
      message: `⛈️ SEVERE WEATHER WARNING at ${location}. Match may be suspended. Seek shelter immediately.`,
      instructions: [
        'Move to covered concourse areas immediately.',
        'Do NOT shelter under isolated trees or metal structures.',
        'Stadium announcements will provide match delay/cancellation updates.',
        'Emergency shelters are open at all concourse tunnels.',
      ],
    };
  }
  if (severity === ALERT_SEVERITIES.HIGH) {
    return {
      message: `🌩️ WEATHER ALERT: ${location} – Lightning/Storm detected in the area. Stay alert.`,
      instructions: [
        'Consider moving to covered concourse areas.',
        'Match officials have been notified. A delay is possible.',
        'Monitor the PA system and FIFA FanConnect app for updates.',
      ],
    };
  }
  return {
    message: `🌦️ WEATHER NOTICE: Inclement weather expected at ${location}. Dress appropriately.`,
    instructions: [
      'Rain ponchos available for purchase at concession stands.',
      'Match is expected to proceed as planned.',
    ],
  };
}

/**
 * Returns the fan-facing message and steward instructions for a SECURITY alert.
 * @param {string} severity - Alert severity.
 * @param {string} location - Location of security incident.
 * @returns {{ message: string, instructions: string[] }}
 */
function buildSecurityAlert(severity, location) {
  if (severity === ALERT_SEVERITIES.CRITICAL) {
    return {
      message: `🔴 SECURITY ALERT at ${location}. Follow all steward and security officer instructions immediately.`,
      instructions: [
        'Remain calm and follow steward instructions.',
        'Do NOT film or photograph the incident area.',
        'Move away from the indicated zone if instructed.',
        'Emergency exits are lit green — follow them if evacuation is ordered.',
      ],
    };
  }
  if (severity === ALERT_SEVERITIES.HIGH) {
    return {
      message: `🟠 SECURITY INCIDENT at ${location}. Additional security deployed to this zone.`,
      instructions: [
        'Avoid the area and follow steward guidance.',
        'Report any suspicious behavior via the FIFA FanConnect app.',
        'Security teams are managing the situation.',
      ],
    };
  }
  return {
    message: `⚠️ SECURITY NOTICE at ${location}. Please cooperate with stadium security staff.`,
    instructions: [
      'Cooperate with security staff if approached.',
      'Report any concerns to the nearest steward or Info Desk.',
    ],
  };
}

/**
 * Returns the fan-facing message and steward instructions for a TRANSPORT alert.
 * @param {string} severity - Alert severity.
 * @param {string} location - Transport location or route affected.
 * @returns {{ message: string, instructions: string[] }}
 */
function buildTransportAlert(severity, location) {
  if (severity === ALERT_SEVERITIES.CRITICAL) {
    return {
      message: `🚨 TRANSPORT DISRUPTION at ${location}. Major delays or cancellations in effect.`,
      instructions: [
        'Do NOT go to the transport hub yet — wait for an updated departure window.',
        'Alternative transport routes are being arranged. Check the app for updates.',
        'Stadium will remain open for an additional 60 minutes to allow crowd dispersal.',
        'Taxi/rideshare zones are operational but expect long waits.',
      ],
    };
  }
  if (severity === ALERT_SEVERITIES.HIGH) {
    return {
      message: `🚌 TRANSPORT DELAYS at ${location}. Allow an extra 30–45 minutes for your journey.`,
      instructions: [
        'Use alternate transport options if available.',
        'Check the FIFA FanConnect app for live transport updates.',
        'Metro/rail capacity is being managed — expect queuing at platforms.',
      ],
    };
  }
  return {
    message: `ℹ️ TRANSPORT NOTICE: Minor delays at ${location}. Allow extra travel time.`,
    instructions: [
      'Allow extra 15–20 minutes for transport after the match.',
      'Check real-time updates on the FIFA FanConnect app.',
    ],
  };
}

/**
 * @description Generates a structured, deterministic stadium alert.
 * Alert content, priority, and affected zones are all derived using IF/ELSE rules.
 * Gemini AI is never invoked for alert generation.
 *
 * @param {string} type - Alert type: 'CROWD' | 'MEDICAL' | 'WEATHER' | 'SECURITY' | 'TRANSPORT'.
 * @param {string} severity - Severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'.
 * @param {string} location - Location string describing where the alert applies.
 * @returns {Alert} Structured alert object with priority, message, affected zones, and instructions.
 * @example
 * const alert = generateAlert('CROWD', 'HIGH', 'Gate A1');
 */
function generateAlert(type, severity, location) {
  const normalizedType = (type || '').toUpperCase();
  const normalizedSeverity = (severity || '').toUpperCase();

  const priority = resolvePriority(normalizedSeverity);
  const affectedZones = resolveAffectedZones(location, normalizedType);
  const id = generateAlertId(normalizedType);

  let alertContent;

  if (normalizedType === ALERT_TYPES.CROWD) {
    alertContent = buildCrowdAlert(normalizedSeverity, location);
  } else if (normalizedType === ALERT_TYPES.MEDICAL) {
    alertContent = buildMedicalAlert(normalizedSeverity, location);
  } else if (normalizedType === ALERT_TYPES.WEATHER) {
    alertContent = buildWeatherAlert(normalizedSeverity, location);
  } else if (normalizedType === ALERT_TYPES.SECURITY) {
    alertContent = buildSecurityAlert(normalizedSeverity, location);
  } else if (normalizedType === ALERT_TYPES.TRANSPORT) {
    alertContent = buildTransportAlert(normalizedSeverity, location);
  } else {
    // Unknown alert type — safe fallback
    alertContent = {
      message: `⚠️ STADIUM NOTICE at ${location}. Please follow staff instructions.`,
      instructions: [
        'Follow steward and security officer instructions.',
        'Visit the nearest Fan Info Desk for assistance.',
      ],
    };
  }

  return {
    id,
    type: normalizedType,
    severity: normalizedSeverity,
    location,
    priority,
    message: alertContent.message,
    instructions: alertContent.instructions,
    affectedZones,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { generateAlert };
