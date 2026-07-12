'use strict';

/**
 * @fileoverview Deterministic routing engine for FIFA FanConnect.
 * Generates step-by-step navigation instructions using pure IF/ELSE logic.
 * Gemini AI is never used in routing decisions.
 * @module engines/routingEngine
 */

/**
 * @typedef {{ step: number, instruction: string, icon: string }} RouteStep
 * @typedef {{ from: string, to: string, accessibilityNeeded: boolean, steps: RouteStep[], estimatedTime: string, note: string }} RouteResult
 */

/**
 * Routing map defining known paths between landmarks in the stadium.
 * Keys are in the format "FROM:TO". Accessibility-safe paths use elevators only.
 * @type {Object<string, { steps: RouteStep[], time: string, accessibleSteps?: RouteStep[], accessibleTime?: string }>}
 */
const ROUTE_MAP = {
  'entrance:seat': {
    steps: [
      { step: 1, instruction: 'Enter through your assigned gate and scan your ticket.', icon: '🎫' },
      { step: 2, instruction: 'Follow the coloured zone signs on the concourse wall.', icon: '🗺️' },
      { step: 3, instruction: 'Take the stairs or escalator to your floor level.', icon: '🪜' },
      { step: 4, instruction: 'Match your section number to the tunnel entrance signs.', icon: '🔢' },
      { step: 5, instruction: 'Locate your row letter and seat number. Enjoy the match!', icon: '🪑' },
    ],
    time: '5–8 min',
    accessibleSteps: [
      { step: 1, instruction: 'Enter through Gate E1 or F1 (accessible entrances). Scan your ticket.', icon: '♿' },
      { step: 2, instruction: 'Follow the blue accessibility signs along the ground-level concourse.', icon: '🗺️' },
      { step: 3, instruction: 'Use the elevator — located 20m past the gate on your left.', icon: '🛗' },
      { step: 4, instruction: 'Exit elevator at your floor. Follow section number signs.', icon: '🔢' },
      { step: 5, instruction: 'Accessible seating is at the end of each row. Staff will assist.', icon: '🪑' },
    ],
    accessibleTime: '7–10 min',
  },
  'seat:food': {
    steps: [
      { step: 1, instruction: 'Exit your seating row and walk to the nearest concourse tunnel.', icon: '🚶' },
      { step: 2, instruction: 'Turn left or right to reach the nearest food court on your level.', icon: '↔️' },
      { step: 3, instruction: 'Look for the food stall signage and join the shortest queue.', icon: '🍔' },
      { step: 4, instruction: 'All payments are cashless — card or mobile pay only.', icon: '💳' },
    ],
    time: '3–5 min',
    accessibleSteps: [
      { step: 1, instruction: 'Exit your accessible seating area via the dedicated aisle.', icon: '♿' },
      { step: 2, instruction: 'Use the ground-level concourse — all food outlets are reachable without stairs.', icon: '🗺️' },
      { step: 3, instruction: 'Accessible counters are available at all food stalls — ask a staff member.', icon: '🍔' },
    ],
    accessibleTime: '4–6 min',
  },
  'seat:medical': {
    steps: [
      { step: 1, instruction: 'Alert the nearest steward immediately for urgent medical help.', icon: '🚨' },
      { step: 2, instruction: 'If mobile, exit to the concourse and head to Gate A1 or C1 corridor.', icon: '🚶' },
      { step: 3, instruction: 'First Aid is marked with a green cross sign. Staff will assist you.', icon: '🏥' },
    ],
    time: '2–4 min',
    accessibleSteps: [
      { step: 1, instruction: 'Alert the nearest steward — they will call for accessible transport (wheelchair/cart).', icon: '🚨' },
      { step: 2, instruction: 'Medical center has step-free access via the west tunnel (field level).', icon: '♿' },
      { step: 3, instruction: 'Do not use stairs. Wait for the steward-led escort if needed.', icon: '🏥' },
    ],
    accessibleTime: '3–5 min',
  },
  'seat:toilet': {
    steps: [
      { step: 1, instruction: 'Exit your row and head to the nearest concourse aisle.', icon: '🚶' },
      { step: 2, instruction: 'Restrooms are located every 50m along the concourse. Follow the signs.', icon: '🚻' },
    ],
    time: '2–3 min',
    accessibleSteps: [
      { step: 1, instruction: 'Exit via the accessible aisle and head to the concourse.', icon: '♿' },
      { step: 2, instruction: 'Accessible restrooms are located near Gate E1 corridor. Follow blue signs.', icon: '🚻' },
    ],
    accessibleTime: '3–4 min',
  },
  'seat:exit': {
    steps: [
      { step: 1, instruction: 'At final whistle, stay seated for 5 minutes to let initial crowds clear.', icon: '⏳' },
      { step: 2, instruction: 'Exit your row and follow the EXIT signs to the nearest concourse tunnel.', icon: '🚶' },
      { step: 3, instruction: 'Follow crowd management staff instructions for your exit direction.', icon: '👮' },
      { step: 4, instruction: 'Head to your transport — check the FIFA FanConnect app for live transport updates.', icon: '🚌' },
    ],
    time: '10–20 min',
    accessibleSteps: [
      { step: 1, instruction: 'Wait for the accessible exit announcement (approx. 5 min after final whistle).', icon: '⏳' },
      { step: 2, instruction: 'Use the elevator to the ground level concourse.', icon: '🛗' },
      { step: 3, instruction: 'Exit via Gate E1 or F1 (accessible exits). Staff will escort if needed.', icon: '♿' },
    ],
    accessibleTime: '12–20 min',
  },
  'entrance:parking': {
    steps: [
      { step: 1, instruction: 'After exiting the gate, follow the parking signage for your lot (A, B, or C).', icon: '🅿️' },
      { step: 2, instruction: 'Lot A is 3 min walk (North), Lot B is 10 min (East), Lot C is 15 min (South).', icon: '🚗' },
    ],
    time: '3–15 min',
    accessibleSteps: [
      { step: 1, instruction: 'Follow blue accessibility signs from Gate E1 to designated accessible parking.', icon: '♿' },
      { step: 2, instruction: 'Accessible parking bays are in Lot A, closest to the stadium entrance.', icon: '🅿️' },
    ],
    accessibleTime: '3–5 min',
  },
  'entrance:metro': {
    steps: [
      { step: 1, instruction: 'Exit through Gate A1 (North) or C1 (South) towards the main plaza.', icon: '🚶' },
      { step: 2, instruction: 'Follow blue Metro signs to the transit station (5–10 min walk).', icon: '🚇' },
      { step: 3, instruction: 'Purchase or tap your transit card at the station entrance.', icon: '💳' },
      { step: 4, instruction: 'Platform signs will display the next train. Check the schedule board.', icon: '🚉' },
    ],
    time: '10–15 min',
    accessibleSteps: [
      { step: 1, instruction: 'Exit via Gate E1 for the most direct accessible route to metro.', icon: '♿' },
      { step: 2, instruction: 'Follow the kerb-level blue signs — no stairs required on this route.', icon: '🗺️' },
      { step: 3, instruction: 'Metro station has elevator access. Ask station staff for assistance.', icon: '🛗' },
    ],
    accessibleTime: '12–18 min',
  },
  'seat:info_desk': {
    steps: [
      { step: 1, instruction: 'Exit your row and head to the main concourse.', icon: '🚶' },
      { step: 2, instruction: 'Fan Information Desks are located near Gate A1 (North) and Gate C1 (South).', icon: '📍' },
      { step: 3, instruction: 'Look for the blue "i" information sign. Staff speak multiple languages.', icon: 'ℹ️' },
    ],
    time: '4–7 min',
    accessibleSteps: [
      { step: 1, instruction: 'Use the ground-level concourse. Info Desks are at gate level — no stairs needed.', icon: '♿' },
      { step: 2, instruction: 'Fan Information Desks near Gate E1 also have accessible service counters.', icon: 'ℹ️' },
    ],
    accessibleTime: '4–8 min',
  },
};

/**
 * Normalizes a location string to a canonical route key component.
 * @param {string} location - Raw location input from user.
 * @returns {string} Normalized location key.
 */
function normalizeLocation(location) {
  const loc = location.toLowerCase().trim();
  if (loc.includes('seat') || loc.includes('section') || loc.includes('stand')) {return 'seat';}
  if (loc.includes('gate') || loc.includes('entrance') || loc.includes('entry') || loc.includes('enter')) {return 'entrance';}
  if (loc.includes('food') || loc.includes('eat') || loc.includes('restaurant') || loc.includes('concession') || loc.includes('drink')) {return 'food';}
  if (loc.includes('toilet') || loc.includes('restroom') || loc.includes('bathroom') || loc.includes('wc')) {return 'toilet';}
  if (loc.includes('medical') || loc.includes('first aid') || loc.includes('doctor') || loc.includes('health')) {return 'medical';}
  if (loc.includes('exit') || loc.includes('leave') || loc.includes('out')) {return 'exit';}
  if (loc.includes('parking') || loc.includes('car') || loc.includes('park')) {return 'parking';}
  if (loc.includes('metro') || loc.includes('train') || loc.includes('subway') || loc.includes('transit') || loc.includes('bus')) {return 'metro';}
  if (loc.includes('info') || loc.includes('help') || loc.includes('desk') || loc.includes('service')) {return 'info_desk';}
  return loc;
}

/**
 * Generates step-by-step navigation instructions between two stadium locations.
 * If accessibilityNeeded is true, elevator-only paths are used — stairs are avoided.
 * This is pure deterministic routing logic — Gemini AI is not used here.
 *
 * @param {string} from - Starting location description (e.g. 'entrance', 'my seat', 'Section 101').
 * @param {string} to - Destination description (e.g. 'food', 'first aid', 'exit').
 * @param {boolean} [accessibilityNeeded=false] - Whether the fan requires step-free/elevator-only route.
 * @returns {RouteResult} Structured route result with steps, timing, and notes.
 */
function getRoute(from, to, accessibilityNeeded = false) {
  const fromKey = normalizeLocation(from);
  const toKey = normalizeLocation(to);
  const routeKey = `${fromKey}:${toKey}`;
  const reverseKey = `${toKey}:${fromKey}`;

  // Try direct route, then reverse
  const routeData = ROUTE_MAP[routeKey] || ROUTE_MAP[reverseKey];

  if (!routeData) {
    // Fallback: generic directions
    return {
      from,
      to,
      accessibilityNeeded,
      steps: [
        {
          step: 1,
          instruction: `Head to the nearest Fan Information Desk (Gate A1 or C1) for directions to "${to}".`,
          icon: 'ℹ️',
        },
        {
          step: 2,
          instruction: 'Stadium staff are stationed throughout all concourses and can assist you.',
          icon: '👮',
        },
      ],
      estimatedTime: 'Varies',
      note: `Route from "${from}" to "${to}" not pre-mapped. Please ask a steward or visit the Info Desk.`,
    };
  }

  const useAccessible = accessibilityNeeded && routeData.accessibleSteps;
  const steps = useAccessible ? routeData.accessibleSteps : routeData.steps;
  const estimatedTime = useAccessible
    ? (routeData.accessibleTime || routeData.time)
    : routeData.time;

  const note = accessibilityNeeded
    ? 'Accessible route: elevator and ramp access only. No stairs on this path.'
    : 'Standard route via stairs and escalators.';

  return {
    from,
    to,
    accessibilityNeeded,
    steps,
    estimatedTime,
    note,
  };
}

module.exports = { getRoute };
