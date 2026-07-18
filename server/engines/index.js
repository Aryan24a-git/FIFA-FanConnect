'use strict';

/**
 * @fileoverview Barrel file for exporting all stadium operations logic engines.
 * @module server/engines
 */

const { generateAlert } = require('./alertEngine');
const { analyzeCrowd, getGateRecommendation } = require('./crowdEngine');
const { getRoute } = require('./routingEngine');
const { getEcoRecommendation } = require('./sustainabilityEngine');
const { getTransportRecommendation } = require('./transportEngine');

module.exports = {
  generateAlert,
  analyzeCrowd,
  getGateRecommendation,
  getRoute,
  getEcoRecommendation,
  getTransportRecommendation,
};
