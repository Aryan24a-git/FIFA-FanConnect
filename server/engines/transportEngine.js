'use strict';

/**
 * @fileoverview Transportation recommendation engine for FIFA stadiums.
 * Ranks transport options by efficiency, wait times, cost, and congestion.
 * @module engines/transportEngine
 */

const { getStadiumById } = require('../data/stadiumData');

/**
 * Ranks and recommends transport options from a stadium based on current stadium traffic conditions.
 * @param {string} stadiumId - Target stadium identifier.
 * @param {string} destination - User's target destination (e.g. 'Airport', 'Downtown').
 * @param {string} [time] - Time window of the request (e.g. 'pre-match', 'mid-match', 'post-match').
 * @returns {Object} Ranked transportation options and operational notes.
 */
function getTransportRecommendation(stadiumId, destination, time = 'post-match') {
  const stadium = getStadiumById(stadiumId);
  const transitConfig = stadium ? stadium.transport : null;
  const isPostMatch = time.toLowerCase() === 'post-match';

  // Base configurations for transit options
  const options = [
    {
      mode: 'metro',
      name:
        transitConfig && transitConfig.metro && transitConfig.metro[0]
          ? transitConfig.metro[0].name
          : 'Local Train Station',
      detail:
        transitConfig && transitConfig.metro && transitConfig.metro[0]
          ? transitConfig.metro[0].line
          : 'Stadium Line',
      baseWaitMinutes: isPostMatch ? 15 : 5,
      costEstimate: '$2.75 - $5.00',
      efficiencyScore: 95, // Metro is highly efficient post-match
      status: isPostMatch ? 'CONGESTED_BUT_FAST' : 'NORMAL',
      statusMessage: isPostMatch
        ? 'High frequency trains running. Expected boarding within 15 mins.'
        : 'On schedule.',
    },
    {
      mode: 'bus',
      name:
        transitConfig && transitConfig.bus && transitConfig.bus[0]
          ? transitConfig.bus[0].name
          : 'Express Shuttle Bus',
      detail:
        transitConfig && transitConfig.bus && transitConfig.bus[0]
          ? transitConfig.bus[0].route
          : 'Express Route',
      baseWaitMinutes: isPostMatch ? 20 : 10,
      costEstimate: '$5.00 - $8.00',
      efficiencyScore: 80,
      status: isPostMatch ? 'MODERATE_DELAYS' : 'NORMAL',
      statusMessage: isPostMatch
        ? 'Dedicated event lanes active, but minor highway delays expected.'
        : 'On schedule.',
    },
    {
      mode: 'rideshare',
      name: 'Rideshare Zone',
      detail: 'Designated Rideshare Pick-up Plaza',
      baseWaitMinutes: isPostMatch ? 45 : 15,
      costEstimate: isPostMatch ? '$45.00+ (Surge)' : '$15.00 - $25.00',
      efficiencyScore: 40, // Low efficiency post-match due to gridlock
      status: isPostMatch ? 'HEAVY_CONGESTION' : 'NORMAL',
      statusMessage: isPostMatch
        ? 'Surge pricing active and heavy vehicle queue in the rideshare lot.'
        : 'Normal demand.',
    },
    {
      mode: 'parking',
      name:
        transitConfig && transitConfig.parking && transitConfig.parking[0]
          ? transitConfig.parking[0].name
          : 'General Parking Lot',
      detail: 'Stadium Parking Access Gates',
      baseWaitMinutes: isPostMatch ? 50 : 20,
      costEstimate: 'Pre-paid ticket required',
      efficiencyScore: 35, // High exit gridlock
      status: isPostMatch ? 'GRIDLOCK' : 'NORMAL',
      statusMessage: isPostMatch
        ? 'Expected exit queue from lots is 45-60 minutes. Stewards directing traffic.'
        : 'Gate flow is normal.',
    },
  ];

  // If no direct rail, adjust metro score downward
  if (stadiumId === 'atandt') {
    const metroOpt = options.find((o) => o.mode === 'metro');
    if (metroOpt) {
      metroOpt.efficiencyScore = 30;
      metroOpt.status = 'NOT_RECOMMENDED';
      metroOpt.statusMessage = 'CentrePort station is far. Requires 20-min shuttle connection.';
    }
  }

  // Sort by efficiencyScore descending
  const rankedOptions = [...options].sort((a, b) => b.efficiencyScore - a.efficiencyScore);

  return {
    stadiumId,
    stadiumName: stadium ? stadium.name : 'Stadium',
    destination,
    timePeriod: time,
    recommendations: rankedOptions,
    generalAdvice: isPostMatch
      ? 'We highly advise using Metro or pre-booked Shuttle Buses to leave the stadium area. Rideshare and personal vehicle exits will face significant delay.'
      : 'All access gates are open. Standard traffic plans apply.',
  };
}

module.exports = { getTransportRecommendation };
