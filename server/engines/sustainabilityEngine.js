'use strict';

/**
 * @fileoverview Sustainability recommendation engine for FIFA stadiums.
 * Calculates carbon emissions based on transport choices and supplies eco-tips.
 * @module engines/sustainabilityEngine
 */

const { ECO_METRICS } = require('../utils/constants');
const { getStadiumById } = require('../data/stadiumData');

/**
 * Generates deterministic eco-recommendations and carbon metrics for a stadium visit.
 * @param {string} stadiumId - Target stadium identifier.
 * @param {string} [transportMode] - Mode of transport selected by the user.
 * @returns {Object} Deterministic sustainability recommendations and metrics.
 */
function getEcoRecommendation(stadiumId, transportMode, distanceKm = 15) {
  const stadium = getStadiumById(stadiumId);
  const stadiumName = stadium ? stadium.name : 'the stadium';

  // Standard water stations mapped per stadium
  const waterStations = {
    metlife: [
      { name: 'Water Refill Station A', location: 'Gate A1 Plaza', section: 'A' },
      { name: 'Water Refill Station C', location: 'Gate C1 Plaza', section: 'C' },
      { name: 'Eco Fountain Block B', location: 'East Concourse', section: 'B' },
    ],
    atandt: [
      { name: 'Eco Hydration Station A', location: 'Gate A1 Lobby', section: 'A' },
      { name: 'Eco Hydration Station C', location: 'Gate C1 Lobby', section: 'C' },
      { name: 'Hydration Bar D', location: 'West Concourse', section: 'D' },
    ],
    sofi: [
      { name: 'Pure Water Hub A', location: 'Gate A1 Fan Plaza', section: 'A' },
      { name: 'Pure Water Hub C', location: 'Gate C1 Fan Plaza', section: 'C' },
      { name: 'Green Hydration Station D', location: 'West Entry', section: 'D' },
    ],
  };

  const stations = waterStations[stadiumId] || [
    { name: 'Standard Water Station', location: 'Main Concourse', section: 'A' },
  ];

  // Dynamic trip distance
  const averageDistanceKm = distanceKm;
  const carbonFootprint = transportMode ? ECO_METRICS[transportMode] * averageDistanceKm : null;

  // Compare selected transport with others
  const comparison = [];
  if (transportMode) {
    const selectedEmissions = ECO_METRICS[transportMode];
    Object.keys(ECO_METRICS).forEach((mode) => {
      if (mode !== transportMode) {
        const diff = (ECO_METRICS[mode] - selectedEmissions) * averageDistanceKm;
        if (diff > 0) {
          const formatted =
            diff >= 1000 ? `${(diff / 1000).toFixed(2)} kg` : `${Math.round(diff)}g`;
          comparison.push(
            `Choosing ${transportMode} instead of ${mode} saves ${formatted} of CO2 for this trip.`,
          );
        } else if (diff < 0) {
          const formatted =
            Math.abs(diff) >= 1000
              ? `${(Math.abs(diff) / 1000).toFixed(2)} kg`
              : `${Math.round(Math.abs(diff))}g`;
          comparison.push(
            `Choosing ${mode} instead of ${transportMode} would save ${formatted} of CO2.`,
          );
        }
      }
    });
  }

  return {
    stadiumId,
    stadiumName,
    averageDistanceKm,
    selectedMode: transportMode || 'none',
    carbonFootprintGrams: carbonFootprint,
    comparison,
    waterStations: stations,
    wasteSorting: [
      {
        type: 'Recyclable Cups',
        instruction: 'Place in designated green bins located at all exit portals.',
      },
      {
        type: 'Compostables',
        instruction: 'Dispose of organic waste at brown bin stations near food courts.',
      },
      {
        type: 'General Landfill',
        instruction: 'Minimize landfill waste by using reusable containers.',
      },
    ],
    ecoTip: `FIFA 2026 encourages all fans attending ${stadiumName} to bring empty reusable bottles up to 500ml and use our carbon-free transit partnerships.`,
  };
}

module.exports = { getEcoRecommendation };
