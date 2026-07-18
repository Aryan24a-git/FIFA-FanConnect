'use strict';

/**
 * @fileoverview Real stadium data for FIFA World Cup 2026 host venues.
 * All queue values are runtime-mutable; defaults here represent pre-match baselines.
 * @module data/stadiumData
 */

/** @typedef {{ id: string, name: string, section: string, currentQueue: number, maxQueue: number }} Gate */
/** @typedef {{ name: string, location: string, floor: string|number, section: string }} Facility */
/** @typedef {{ id: string, name: string, city: string, capacity: number, gates: Gate[], facilities: Object, transport: Object, zones: Object }} Stadium */

/**
 * Array of FIFA World Cup 2026 host stadiums with full operational data.
 * @type {Stadium[]}
 */
const stadiums = [
  {
    id: 'metlife',
    name: 'MetLife Stadium',
    city: 'East Rutherford, NJ',
    capacity: 82500,
    gates: [
      { id: 'A1', name: 'Gate A1 – North Plaza', section: 'A', currentQueue: 0, maxQueue: 100 },
      { id: 'A2', name: 'Gate A2 – North East', section: 'A', currentQueue: 0, maxQueue: 100 },
      { id: 'B1', name: 'Gate B1 – East Main', section: 'B', currentQueue: 0, maxQueue: 100 },
      { id: 'B2', name: 'Gate B2 – East Lower', section: 'B', currentQueue: 0, maxQueue: 100 },
      { id: 'C1', name: 'Gate C1 – South Plaza', section: 'C', currentQueue: 0, maxQueue: 100 },
      { id: 'C2', name: 'Gate C2 – South West', section: 'C', currentQueue: 0, maxQueue: 100 },
      { id: 'D1', name: 'Gate D1 – West Main', section: 'D', currentQueue: 0, maxQueue: 100 },
      { id: 'D2', name: 'Gate D2 – West Upper', section: 'D', currentQueue: 0, maxQueue: 100 },
      {
        id: 'E1',
        name: 'Gate E1 – Accessible North',
        section: 'E',
        currentQueue: 0,
        maxQueue: 100,
      },
      {
        id: 'F1',
        name: 'Gate F1 – Accessible South',
        section: 'F',
        currentQueue: 0,
        maxQueue: 100,
      },
    ],
    facilities: {
      food: [
        { name: 'MetLife Grille', location: 'North Concourse', floor: 1, section: 'A' },
        { name: 'Touchdown Tacos', location: 'East Concourse', floor: 1, section: 'B' },
        { name: 'Jersey Fresh Burgers', location: 'South Concourse', floor: 1, section: 'C' },
        { name: 'Sky Lounge', location: 'West Concourse', floor: 3, section: 'D' },
        { name: 'Halal Kitchen', location: 'North Concourse', floor: 2, section: 'A' },
        { name: 'Vegan Corner', location: 'South Concourse', floor: 2, section: 'C' },
      ],
      medical: [
        { name: 'First Aid – North', location: 'Gate A1 Corridor', floor: 1, section: 'A' },
        { name: 'First Aid – South', location: 'Gate C1 Corridor', floor: 1, section: 'C' },
        { name: 'Medical Center', location: 'West Tunnel', floor: 0, section: 'D' },
      ],
      toilets: [
        { name: 'Restrooms A-Block', location: 'North Concourse', floor: 1, section: 'A' },
        { name: 'Restrooms B-Block', location: 'East Concourse', floor: 1, section: 'B' },
        { name: 'Restrooms C-Block', location: 'South Concourse', floor: 1, section: 'C' },
        { name: 'Restrooms D-Block', location: 'West Concourse', floor: 1, section: 'D' },
        { name: 'Accessible Restrooms', location: 'Gate E1 Corridor', floor: 1, section: 'E' },
      ],
      info_desk: [
        { name: 'Fan Info – North', location: 'Gate A1 Plaza', floor: 0, section: 'A' },
        { name: 'Fan Info – South', location: 'Gate C1 Plaza', floor: 0, section: 'C' },
        { name: 'Volunteer Hub', location: 'East Concourse Centre', floor: 1, section: 'B' },
      ],
    },
    transport: {
      metro: [
        { name: 'Meadowlands Station', line: 'NJ Transit Meadowlands Line', walkTime: '5 min' },
      ],
      bus: [
        { name: 'Port Authority Bus Terminal', route: 'Meadowlands Express', duration: '25 min' },
        { name: 'Secaucus Junction Bus', route: 'Stadium Shuttle', duration: '15 min' },
      ],
      parking: [
        { name: 'Lot A – VIP', capacity: 2000, section: 'A', distance: '3 min walk' },
        { name: 'Lot B – General', capacity: 5000, section: 'B', distance: '10 min walk' },
        { name: 'Lot C – Overflow', capacity: 3000, section: 'C', distance: '15 min walk' },
      ],
    },
    zones: {
      A: { sections: ['101', '102', '103', '104', '105', '201', '202', '301', '302'] },
      B: { sections: ['106', '107', '108', '109', '110', '203', '204', '303', '304'] },
      C: { sections: ['111', '112', '113', '114', '115', '205', '206', '305', '306'] },
      D: { sections: ['116', '117', '118', '119', '120', '207', '208', '307', '308'] },
      E: { sections: ['121', '122', '123', '209', '309'] },
      F: { sections: ['124', '125', '126', '210', '310'] },
    },
  },

  {
    id: 'atandt',
    name: 'AT&T Stadium',
    city: 'Arlington, TX',
    capacity: 80000,
    gates: [
      { id: 'A1', name: 'Gate A1 – North Entry', section: 'A', currentQueue: 0, maxQueue: 100 },
      { id: 'A2', name: 'Gate A2 – North East', section: 'A', currentQueue: 0, maxQueue: 100 },
      { id: 'B1', name: 'Gate B1 – East Plaza', section: 'B', currentQueue: 0, maxQueue: 100 },
      { id: 'B2', name: 'Gate B2 – East Lower', section: 'B', currentQueue: 0, maxQueue: 100 },
      { id: 'C1', name: 'Gate C1 – South Entry', section: 'C', currentQueue: 0, maxQueue: 100 },
      { id: 'C2', name: 'Gate C2 – South West', section: 'C', currentQueue: 0, maxQueue: 100 },
      { id: 'D1', name: 'Gate D1 – West Plaza', section: 'D', currentQueue: 0, maxQueue: 100 },
      { id: 'D2', name: 'Gate D2 – West Upper', section: 'D', currentQueue: 0, maxQueue: 100 },
      { id: 'E1', name: 'Gate E1 – Accessible East', section: 'E', currentQueue: 0, maxQueue: 100 },
      { id: 'F1', name: 'Gate F1 – Accessible West', section: 'F', currentQueue: 0, maxQueue: 100 },
    ],
    facilities: {
      food: [
        { name: 'Cowboys Cantina', location: 'North Concourse', floor: 1, section: 'A' },
        { name: 'Texas BBQ House', location: 'East Concourse', floor: 1, section: 'B' },
        { name: 'Lone Star Café', location: 'South Concourse', floor: 1, section: 'C' },
        { name: 'Stadium Club', location: 'West Concourse', floor: 4, section: 'D' },
        { name: 'Halal Bites', location: 'East Concourse', floor: 2, section: 'B' },
        { name: 'Plant-Based Bar', location: 'North Concourse', floor: 2, section: 'A' },
      ],
      medical: [
        { name: 'First Aid – North', location: 'Gate A1 Lobby', floor: 1, section: 'A' },
        { name: 'First Aid – South', location: 'Gate C1 Lobby', floor: 1, section: 'C' },
        { name: 'EMT Station', location: 'Field Level West', floor: 0, section: 'D' },
      ],
      toilets: [
        { name: 'Restrooms A-Block', location: 'North Concourse', floor: 1, section: 'A' },
        { name: 'Restrooms B-Block', location: 'East Concourse', floor: 1, section: 'B' },
        { name: 'Restrooms C-Block', location: 'South Concourse', floor: 1, section: 'C' },
        { name: 'Restrooms D-Block', location: 'West Concourse', floor: 1, section: 'D' },
        { name: 'Accessible Restrooms', location: 'Gate E1 Corridor', floor: 1, section: 'E' },
      ],
      info_desk: [
        { name: 'Fan Hub – North', location: 'Gate A1 Plaza', floor: 0, section: 'A' },
        { name: 'Fan Hub – South', location: 'Gate C1 Plaza', floor: 0, section: 'C' },
        { name: 'Guest Services', location: 'West Concourse Mid', floor: 1, section: 'D' },
      ],
    },
    transport: {
      metro: [
        {
          name: 'No direct rail',
          line: 'Trinity Railway Express (TRE) – Nearest: CentrePort',
          walkTime: '20 min + shuttle',
        },
      ],
      bus: [
        { name: 'Arlington Express', route: 'Special Event Shuttle', duration: '15 min from DFW' },
        { name: 'Fort Worth Bus', route: 'Event Route 88', duration: '30 min' },
      ],
      parking: [
        { name: 'Lot 1 – VIP North', capacity: 1500, section: 'A', distance: '5 min walk' },
        { name: 'Lot 2 – General East', capacity: 4000, section: 'B', distance: '12 min walk' },
        { name: 'Lot 3 – Overflow South', capacity: 3500, section: 'C', distance: '18 min walk' },
      ],
    },
    zones: {
      A: { sections: ['101', '102', '103', '104', '105', '201', '202', '301', '302'] },
      B: { sections: ['106', '107', '108', '109', '110', '203', '204', '303', '304'] },
      C: { sections: ['111', '112', '113', '114', '115', '205', '206', '305', '306'] },
      D: { sections: ['116', '117', '118', '119', '120', '207', '208', '307', '308'] },
      E: { sections: ['121', '122', '123', '209', '309'] },
      F: { sections: ['124', '125', '126', '210', '310'] },
    },
  },

  {
    id: 'sofi',
    name: 'SoFi Stadium',
    city: 'Inglewood, CA',
    capacity: 70240,
    gates: [
      { id: 'A1', name: 'Gate A1 – North Fan Plaza', section: 'A', currentQueue: 0, maxQueue: 100 },
      { id: 'A2', name: 'Gate A2 – North East', section: 'A', currentQueue: 0, maxQueue: 100 },
      { id: 'B1', name: 'Gate B1 – East Entry', section: 'B', currentQueue: 0, maxQueue: 100 },
      { id: 'B2', name: 'Gate B2 – East Lower', section: 'B', currentQueue: 0, maxQueue: 100 },
      { id: 'C1', name: 'Gate C1 – South Fan Plaza', section: 'C', currentQueue: 0, maxQueue: 100 },
      { id: 'C2', name: 'Gate C2 – South West', section: 'C', currentQueue: 0, maxQueue: 100 },
      { id: 'D1', name: 'Gate D1 – West Entry', section: 'D', currentQueue: 0, maxQueue: 100 },
      { id: 'D2', name: 'Gate D2 – West Upper', section: 'D', currentQueue: 0, maxQueue: 100 },
      {
        id: 'E1',
        name: 'Gate E1 – Accessible North',
        section: 'E',
        currentQueue: 0,
        maxQueue: 100,
      },
      {
        id: 'F1',
        name: 'Gate F1 – Accessible South',
        section: 'F',
        currentQueue: 0,
        maxQueue: 100,
      },
    ],
    facilities: {
      food: [
        { name: 'Pacific Eats', location: 'North Concourse', floor: 1, section: 'A' },
        { name: 'LA Street Food Hall', location: 'East Concourse', floor: 1, section: 'B' },
        { name: 'SoFi Terrace Bar', location: 'South Concourse', floor: 2, section: 'C' },
        { name: 'Champions Club', location: 'West Premium', floor: 3, section: 'D' },
        { name: 'Halal World Kitchen', location: 'East Concourse', floor: 1, section: 'B' },
        { name: 'Green Bowl Vegan', location: 'North Concourse', floor: 2, section: 'A' },
      ],
      medical: [
        { name: 'First Aid – North', location: 'Gate A1 Entry', floor: 1, section: 'A' },
        { name: 'First Aid – South', location: 'Gate C1 Entry', floor: 1, section: 'C' },
        { name: 'Medical Suite', location: 'West Lower Tunnel', floor: 0, section: 'D' },
      ],
      toilets: [
        { name: 'Restrooms A-Block', location: 'North Concourse', floor: 1, section: 'A' },
        { name: 'Restrooms B-Block', location: 'East Concourse', floor: 1, section: 'B' },
        { name: 'Restrooms C-Block', location: 'South Concourse', floor: 1, section: 'C' },
        { name: 'Restrooms D-Block', location: 'West Concourse', floor: 1, section: 'D' },
        { name: 'Accessible Restrooms', location: 'Gate E1 Area', floor: 1, section: 'E' },
      ],
      info_desk: [
        { name: 'Fan Connect – North', location: 'Gate A1 Plaza', floor: 0, section: 'A' },
        { name: 'Fan Connect – South', location: 'Gate C1 Plaza', floor: 0, section: 'C' },
        { name: 'Volunteer Station', location: 'East Concourse Mid', floor: 1, section: 'B' },
      ],
    },
    transport: {
      metro: [{ name: 'Inglewood Station', line: 'Metro K Line (Crenshaw)', walkTime: '10 min' }],
      bus: [
        { name: 'LAX Shuttle', route: 'Event Express from LAX', duration: '15 min' },
        { name: 'LA Metro Bus', route: 'Route 115', duration: '30 min from Downtown' },
      ],
      parking: [
        { name: 'Lot A – VIP', capacity: 1800, section: 'A', distance: '5 min walk' },
        { name: 'Lot B – General', capacity: 6000, section: 'B', distance: '12 min walk' },
        { name: 'Lot C – Overflow', capacity: 4000, section: 'C', distance: '20 min walk' },
      ],
    },
    zones: {
      A: { sections: ['101', '102', '103', '104', '105', '201', '202', '301', '302'] },
      B: { sections: ['106', '107', '108', '109', '110', '203', '204', '303', '304'] },
      C: { sections: ['111', '112', '113', '114', '115', '205', '206', '305', '306'] },
      D: { sections: ['116', '117', '118', '119', '120', '207', '208', '307', '308'] },
      E: { sections: ['121', '122', '123', '209', '309'] },
      F: { sections: ['124', '125', '126', '210', '310'] },
    },
  },
];

/**
 * Gets a stadium by its unique ID.
 * @param {string} stadiumId - The stadium identifier (e.g. 'metlife', 'atandt', 'sofi').
 * @returns {Stadium|undefined} The matching stadium or undefined if not found.
 */
function getStadiumById(stadiumId) {
  return stadiums.find((s) => s.id === stadiumId);
}

/**
 * Returns all stadium IDs.
 * @returns {string[]} Array of stadium ID strings.
 */
function getAllStadiumIds() {
  return stadiums.map((s) => s.id);
}

module.exports = { stadiums, getStadiumById, getAllStadiumIds };
