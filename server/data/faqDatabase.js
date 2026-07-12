'use strict';

/**
 * @fileoverview FAQ database for FIFA World Cup 2026 – FIFA FanConnect.
 * Covers transport, gate entry, accessibility, food & beverage, safety, and ticketing.
 * @module data/faqDatabase
 */

/** @typedef {{ id: string, category: string, question: string, answer: string, languages: string[] }} FaqEntry */

/**
 * Array of FAQ entries for the FIFA FanConnect assistant.
 * @type {FaqEntry[]}
 */
const faqs = [
  // ─── TRANSPORT ────────────────────────────────────────────────────────────
  {
    id: 'faq_001',
    category: 'transport',
    question: 'How do I get to MetLife Stadium by train?',
    answer:
      'Take NJ Transit Meadowlands Line from Penn Station or Secaucus Junction. Trains run every 20 minutes on match days. The trip takes approximately 30–40 minutes. The station is a 5-minute walk from Gate A1.',
    languages: ['en'],
  },
  {
    id: 'faq_002',
    category: 'transport',
    question: 'Is there a metro to SoFi Stadium?',
    answer:
      'Yes. Take the Metro K Line (Crenshaw Line) to Inglewood Station, then walk 10 minutes to the stadium. Additional shuttle buses operate from nearby transfer hubs on match days.',
    languages: ['en'],
  },
  {
    id: 'faq_003',
    category: 'transport',
    question: 'How do I reach AT&T Stadium by public transport?',
    answer:
      'Take the Trinity Railway Express (TRE) to CentrePort/DFW Station, then board the free stadium shuttle bus. The shuttle runs every 15 minutes on match days. Total travel time from downtown Fort Worth is approximately 45 minutes.',
    languages: ['en'],
  },
  {
    id: 'faq_004',
    category: 'transport',
    question: 'Where can I park at MetLife Stadium?',
    answer:
      'Official parking is available in Lots A (VIP, 3-min walk), Lot B (General, 10-min walk), and Lot C (Overflow, 15-min walk). Pre-purchased parking passes are required. Arrive 2 hours before kickoff to avoid queues.',
    languages: ['en'],
  },
  {
    id: 'faq_005',
    category: 'transport',
    question: 'Can I park at SoFi Stadium on match day?',
    answer:
      'Yes. Lots A, B, and C are available. Lot A is VIP only. All parking must be pre-purchased online. Carpooling is encouraged. Uber/Lyft drop-off is at the designated rideshare zone on Prairie Avenue.',
    languages: ['en'],
  },
  {
    id: 'faq_006',
    category: 'transport',
    question: 'Is there a bus from Dallas Fort Worth Airport to AT&T Stadium?',
    answer:
      'Yes. The Arlington Express Event Shuttle runs from DFW Airport and takes approximately 15 minutes. Purchase tickets at the Ground Transportation desk in Terminal D. Shuttles begin 3 hours before kickoff.',
    languages: ['en'],
  },
  {
    id: 'faq_007',
    category: 'transport',
    question: 'What time should I leave to reach the stadium?',
    answer:
      'We recommend arriving at least 90 minutes before kickoff. Allow extra time (2 hours+) for high-profile matches like knockout rounds and finals. Check the FIFA FanConnect app for real-time gate queue levels.',
    languages: ['en'],
  },
  {
    id: 'faq_008',
    category: 'transport',
    question: 'Are rideshare drop-offs available?',
    answer:
      'Yes. All three stadiums have dedicated Uber/Lyft drop-off and pick-up zones. Follow stadium signage for the rideshare zone. Do not be dropped off on main roads — use official zones to avoid traffic congestion.',
    languages: ['en'],
  },

  // ─── GATE ENTRY RULES ─────────────────────────────────────────────────────
  {
    id: 'faq_009',
    category: 'gate_entry',
    question: 'What items are prohibited inside the stadium?',
    answer:
      'Prohibited items include: weapons of any kind, large bags over 30x30x15cm, umbrellas, selfie sticks, outside food/drink (sealed water 500ml allowed), drones, laser pointers, flares, and political banners. All bags are subject to search.',
    languages: ['en'],
  },
  {
    id: 'faq_010',
    category: 'gate_entry',
    question: 'What is the bag policy at FIFA World Cup 2026 stadiums?',
    answer:
      'Clear bags up to 30x30x15cm are permitted. One small clutch or wristlet (no larger than 18x13cm) is also allowed per person. Backpacks are NOT permitted unless medically necessary (requires documentation).',
    languages: ['en'],
  },
  {
    id: 'faq_011',
    category: 'gate_entry',
    question: 'Can I bring my own food and water to the match?',
    answer:
      'Outside food is not permitted. One factory-sealed water bottle (500ml max) per person is allowed. All other drinks and food must be purchased inside the stadium. Infant food and medically required items are exceptions with prior approval.',
    languages: ['en'],
  },
  {
    id: 'faq_012',
    category: 'gate_entry',
    question: 'Can I bring a camera to the match?',
    answer:
      'Personal cameras with lenses under 75mm are permitted. Professional cameras with detachable lenses, tripods, or monopods are not allowed without official media accreditation. Video recording is also restricted.',
    languages: ['en'],
  },
  {
    id: 'faq_013',
    category: 'gate_entry',
    question: 'How early do stadium gates open?',
    answer:
      'Gates open 2.5 hours before kickoff for all group stage matches and 3 hours before for knockout rounds and the Final. We recommend arriving when gates open to avoid queues and enjoy pre-match entertainment.',
    languages: ['en'],
  },
  {
    id: 'faq_014',
    category: 'gate_entry',
    question: 'What document do I need to enter the stadium?',
    answer:
      'You need your official FIFA match ticket (digital or printed) and a valid photo ID (passport or government-issued ID). Your ticket and ID name must match. Fan ID cards issued at FIFA Fan Fest venues can also be used.',
    languages: ['en'],
  },
  {
    id: 'faq_015',
    category: 'gate_entry',
    question: 'Can I re-enter the stadium if I leave?',
    answer:
      'Re-entry is not permitted at FIFA World Cup 2026 matches once you exit. Please ensure you have everything you need before entering. Stadium staff can assist with storing items at the bag check service.',
    languages: ['en'],
  },
  {
    id: 'faq_016',
    category: 'gate_entry',
    question: 'Are flags and banners allowed inside the stadium?',
    answer:
      'National flags and non-political banners are welcome. Banners must be no larger than 2m x 1.5m and must not obstruct the view of other fans. Political, discriminatory, or offensive content is strictly prohibited.',
    languages: ['en'],
  },

  // ─── ACCESSIBILITY ────────────────────────────────────────────────────────
  {
    id: 'faq_017',
    category: 'accessibility',
    question: 'Where are the wheelchair-accessible entrances?',
    answer:
      'All three stadiums have dedicated accessible entrances at Gates E1 and F1. These gates have wider turnstiles, ramp access, and dedicated staff. Look for the blue accessibility signs. No steps or stairs at these entry points.',
    languages: ['en'],
  },
  {
    id: 'faq_018',
    category: 'accessibility',
    question: 'Are there elevators inside the stadiums?',
    answer:
      'Yes. All stadiums have multiple elevators accessible from the main concourse to all seating levels. Elevator locations are marked on stadium maps. Priority use is given to wheelchair users and fans with mobility needs.',
    languages: ['en'],
  },
  {
    id: 'faq_019',
    category: 'accessibility',
    question: 'Is companion seating available for fans with disabilities?',
    answer:
      'Yes. Companion seating is available adjacent to all accessible seating areas. Each accessible ticket holder can have one companion. Companion tickets must be purchased with accessible tickets through official FIFA ticketing channels.',
    languages: ['en'],
  },
  {
    id: 'faq_020',
    category: 'accessibility',
    question: 'Is a hearing loop available at the stadiums?',
    answer:
      'Yes. All FIFA 2026 stadiums are equipped with audio induction (hearing) loop systems in the main seating bowl and public concourse areas. Switch your hearing aid to the T-setting to use this feature.',
    languages: ['en'],
  },
  {
    id: 'faq_021',
    category: 'accessibility',
    question: 'Can I bring my electric wheelchair or mobility scooter?',
    answer:
      'Yes. Personal mobility devices are welcome. Please inform FIFA Guest Services when booking and again at the accessible gate on arrival. Dedicated charging points are available near Gates E1 and F1.',
    languages: ['en'],
  },
  {
    id: 'faq_022',
    category: 'accessibility',
    question: 'Are there sensory rooms for fans who need a quieter environment?',
    answer:
      'Yes. All three stadiums have sensory rooms available for fans with autism or sensory sensitivities. Located near Gate E1. Pre-registration is recommended. Contact FIFA Guest Services via the FanConnect app to arrange access.',
    languages: ['en'],
  },

  // ─── FOOD & BEVERAGE ──────────────────────────────────────────────────────
  {
    id: 'faq_023',
    category: 'food_beverage',
    question: 'Is halal food available at the stadiums?',
    answer:
      'Yes. All FIFA 2026 stadiums have dedicated Halal-certified food outlets. MetLife: "Halal Kitchen" on North Concourse Floor 2. AT&T: "Halal Bites" on East Concourse Floor 2. SoFi: "Halal World Kitchen" on East Concourse Floor 1.',
    languages: ['en'],
  },
  {
    id: 'faq_024',
    category: 'food_beverage',
    question: 'Are there vegan or plant-based food options?',
    answer:
      'Yes. Each stadium has a dedicated plant-based food outlet. MetLife: "Vegan Corner" (South Concourse, Floor 2). AT&T: "Plant-Based Bar" (North Concourse, Floor 2). SoFi: "Green Bowl Vegan" (North Concourse, Floor 2).',
    languages: ['en'],
  },
  {
    id: 'faq_025',
    category: 'food_beverage',
    question: 'Is alcohol available inside the stadiums?',
    answer:
      'Beer and wine are available for purchase at designated licensed concession stands. Hard spirits are not served. Alcohol sales stop at the 70th minute of each match. Fans must be 21+ with valid ID to purchase. Intoxicated persons will be refused service.',
    languages: ['en'],
  },
  {
    id: 'faq_026',
    category: 'food_beverage',
    question: 'Can I bring baby food or formula for my infant?',
    answer:
      'Yes. Baby food, formula, and milk in reasonable quantities are permitted for infants attending matches. No sealed bottles are required for baby milk. Please inform security staff at the gate when entering.',
    languages: ['en'],
  },
  {
    id: 'faq_027',
    category: 'food_beverage',
    question: 'Are there gluten-free food options at the stadiums?',
    answer:
      'Yes. Gluten-free options are available at most major food outlets. Look for the GF label on menu boards. "Vegan Corner" and "Green Bowl Vegan" outlets have the widest range of allergen-free options.',
    languages: ['en'],
  },
  {
    id: 'faq_028',
    category: 'food_beverage',
    question: 'Can I get kosher food at the stadiums?',
    answer:
      'Limited kosher food options are available at select food concessions. We recommend contacting FIFA Guest Services in advance to confirm current availability at your specific stadium for your match date.',
    languages: ['en'],
  },

  // ─── SAFETY ───────────────────────────────────────────────────────────────
  {
    id: 'faq_029',
    category: 'safety',
    question: 'Where is the nearest first aid station?',
    answer:
      'First Aid stations are located near Gate A1 and Gate C1 at all stadiums. A full Medical Center/EMT station is located at the West end of each stadium at field level. Follow the green cross signs or ask any staff member.',
    languages: ['en'],
  },
  {
    id: 'faq_030',
    category: 'safety',
    question: 'What do I do in a medical emergency inside the stadium?',
    answer:
      'Alert the nearest steward or security staff immediately. They have direct radio contact with the Medical Team. Do not move an injured person unless in immediate danger. First Aid teams are stationed throughout all concourses and respond within 3 minutes.',
    languages: ['en'],
  },
  {
    id: 'faq_031',
    category: 'safety',
    question: 'Where is the lost and found at the stadiums?',
    answer:
      'Lost & Found is located at the Fan Information Desk near Gate A1 (North Plaza) and Gate C1 (South Plaza). Items found during a match are held for 90 days. Report lost items via the FIFA FanConnect app for faster tracking.',
    languages: ['en'],
  },
  {
    id: 'faq_032',
    category: 'safety',
    question: 'What happens in an emergency evacuation?',
    answer:
      'Emergency exit signs are lit green throughout the stadium. Follow steward instructions calmly and move towards the nearest exit. Do not use elevators during evacuations. Emergency exits are located at all gate areas and mid-concourse points.',
    languages: ['en'],
  },
  {
    id: 'faq_033',
    category: 'safety',
    question: 'My child is lost. What should I do?',
    answer:
      'Immediately inform the nearest steward or go to the Fan Information Desk at Gate A1 or C1. Stadium security will initiate the "Safe Child Protocol" with announcements and CCTV monitoring. Pre-write your phone number on your child\'s wristband if possible.',
    languages: ['en'],
  },
  {
    id: 'faq_034',
    category: 'safety',
    question: 'Is there a designated smoking area at the stadiums?',
    answer:
      'Smoking (including e-cigarettes and vaping) is strictly prohibited inside the stadium and on all concourses. Designated smoking areas are located in external parking zones, away from stadium entrances. Violators may be removed.',
    languages: ['en'],
  },
  {
    id: 'faq_035',
    category: 'safety',
    question: 'What is the weather policy for outdoor conditions at AT&T and MetLife stadiums?',
    answer:
      'MetLife Stadium is open-air. If severe weather (lightning, tornado warning) is forecast, matches may be delayed. AT&T Stadium has a retractable roof – matches continue in all weather. SoFi has a fixed roof canopy with open sides – safe in most conditions.',
    languages: ['en'],
  },
  {
    id: 'faq_036',
    category: 'safety',
    question: 'How do I report suspicious behavior inside the stadium?',
    answer:
      'Report any suspicious behavior to the nearest steward, security officer, or via the FIFA FanConnect app alert feature. You can also text "SAFE" followed by your concern to the stadium safety number displayed on concourse screens. Your safety is the priority.',
    languages: ['en'],
  },

  // ─── TICKETING ────────────────────────────────────────────────────────────
  {
    id: 'faq_037',
    category: 'ticketing',
    question: 'Can I resell my FIFA World Cup ticket?',
    answer:
      'Tickets may only be resold through the official FIFA Ticket Resale Platform. Selling tickets on unauthorized platforms or above face value violates FIFA regulations and may result in ticket cancellation. Buyers risk purchasing invalid tickets on secondary markets.',
    languages: ['en'],
  },
  {
    id: 'faq_038',
    category: 'ticketing',
    question: 'I lost my ticket. Can I get a reprint?',
    answer:
      'Log in to your FIFA ticketing account at tickets.fifa.com and re-download or print your ticket. Digital tickets can also be re-sent to your registered email. For urgent assistance, visit the Ticket Service Centre located at each stadium on match day.',
    languages: ['en'],
  },
  {
    id: 'faq_039',
    category: 'ticketing',
    question: 'Are seat upgrades available on match day?',
    answer:
      'Limited seat upgrades may be available through the FIFA Ticketing app on the day of the match, subject to availability. Go to "Upgrade My Seat" in your FIFA account. In-stadium upgrades at the Ticket Service Centre are available up to 30 minutes before kickoff.',
    languages: ['en'],
  },
  {
    id: 'faq_040',
    category: 'ticketing',
    question: 'Can children attend matches? Do they need a ticket?',
    answer:
      'Children 3 years and under do not require a ticket if they sit on a parent\'s lap and do not occupy a seat. Children 4 and above require a valid ticket. Child (4–11) and Youth (12–17) pricing categories are available on the FIFA ticketing platform.',
    languages: ['en'],
  },
  {
    id: 'faq_041',
    category: 'ticketing',
    question: 'My ticket shows the wrong name. What should I do?',
    answer:
      'Tickets are non-transferable unless done through the official FIFA transfer system. Log in to tickets.fifa.com and use the "Transfer Ticket" function to update the name before the match. Contact FIFA Fan Support if you encounter issues.',
    languages: ['en'],
  },
  {
    id: 'faq_042',
    category: 'ticketing',
    question: 'Can I get a refund if I cannot attend the match?',
    answer:
      'Tickets are generally non-refundable. However, FIFA offers a voluntary ticket return program. Returned tickets are resold and you receive a partial refund. Use the FIFA Ticket Resale Platform to list your ticket for sale to other fans.',
    languages: ['en'],
  },
  {
    id: 'faq_043',
    category: 'ticketing',
    question: 'Where is the Ticket Service Centre at each stadium?',
    answer:
      'Ticket Service Centres are located at: MetLife – Gate A1 North Plaza, AT&T – Gate A1 North Entry, SoFi – Gate A1 North Fan Plaza. Open from 3 hours before kickoff. Bring your ID and booking confirmation.',
    languages: ['en'],
  },
  {
    id: 'faq_044',
    category: 'ticketing',
    question: 'What if my phone dies and I can\'t show my digital ticket?',
    answer:
      'Visit the Ticket Service Centre with your ID and booking reference number. Staff can verify your ticket and issue a printed backup. We recommend screenshotting your ticket or printing it in advance as a precaution.',
    languages: ['en'],
  },

  // ─── GENERAL / MIXED ──────────────────────────────────────────────────────
  {
    id: 'faq_045',
    category: 'general',
    question: 'Is there WiFi inside the stadiums?',
    answer:
      'Yes. Complimentary WiFi (FIFA_FanConnect) is available throughout all stadiums. Connect via your device settings. Use it to access the FIFA FanConnect assistant, real-time updates, and stadium maps. No password required.',
    languages: ['en'],
  },
  {
    id: 'faq_046',
    category: 'general',
    question: 'Are there charging stations inside the stadium?',
    answer:
      'Phone charging kiosks are available at each Info Desk location (Gate A1 and Gate C1 areas) and at select concourse points. Bring your own cable. A limited number of wireless charging pads are available at premium lounge areas.',
    languages: ['en'],
  },
  {
    id: 'faq_047',
    category: 'general',
    question: 'Can I bring a stroller or pushchair to the match?',
    answer:
      'Compact, foldable strollers are permitted. They must be folded and stored under your seat. Large travel prams are not allowed inside the seating bowl. Stroller parking is available near accessible Gate E1 – ask a steward for assistance.',
    languages: ['en'],
  },
  {
    id: 'faq_048',
    category: 'general',
    question: 'What currency is accepted inside the stadiums?',
    answer:
      'All purchases inside FIFA 2026 stadiums are cashless. Only credit/debit cards (Visa and Mastercard) and mobile payments (Apple Pay, Google Pay, Samsung Pay) are accepted. Currency exchange kiosks are located outside each stadium.',
    languages: ['en'],
  },
  {
    id: 'faq_049',
    category: 'general',
    question: 'Is there a dress code for attending FIFA matches?',
    answer:
      'There is no formal dress code, but discriminatory, offensive, or politically provocative clothing is prohibited. National team jerseys and scarves are warmly welcomed. Face paint in team colors is permitted unless it conceals identity for security purposes.',
    languages: ['en'],
  },
  {
    id: 'faq_050',
    category: 'general',
    question: 'How does the FIFA FanConnect assistant work?',
    answer:
      'FIFA FanConnect is an AI-powered smart stadium assistant. You can ask about gates, routes, crowd levels, food, transport, and safety. The assistant uses real-time stadium data for routing and crowd decisions, and Groq AI to explain answers in your language clearly.',
    languages: ['en'],
  },
  {
    id: 'faq_051',
    category: 'sustainability',
    question: 'How is FIFA World Cup 2026 addressing sustainability and climate impact?',
    answer:
      'FIFA is committed to reducing stadium waste and carbon footprints. All venues offer water refill stations for reusable bottles under 500ml, 100% compostable and recyclable packaging at food stalls, and partnerships with local green transit networks.',
    languages: ['en'],
  },
  {
    id: 'faq_052',
    category: 'sustainability',
    question: 'Can I bring reusable water bottles to the stadium?',
    answer:
      'Yes! Fans can bring empty, clear, reusable plastic water bottles (up to 500ml) into the stadium. Water refill stations are located at all major entrances (Gate A1, C1) and concessions areas.',
    languages: ['en'],
  },
];

/**
 * Gets FAQ entries by category.
 * @param {string} category - The FAQ category to filter by.
 * @returns {FaqEntry[]} Filtered array of FAQ entries.
 */
function getFaqsByCategory(category) {
  return faqs.filter((f) => f.category === category);
}

/**
 * Searches FAQs by keyword match in question or answer.
 * @param {string} keyword - The search keyword (case-insensitive).
 * @returns {FaqEntry[]} Matching FAQ entries (up to 5 results).
 */
function searchFaqs(keyword) {
  const lower = keyword.toLowerCase();
  let results = faqs.filter(
    (f) => f.question.toLowerCase().includes(lower) || f.answer.toLowerCase().includes(lower)
  );
  
  // If no exact match, split by words and find general matches (ignoring short words)
  if (results.length === 0) {
    const words = lower.split(/\s+/).filter(w => w.length > 3);
    for (const word of words) {
      const wordResults = faqs.filter(
        (f) => f.question.toLowerCase().includes(word) || f.answer.toLowerCase().includes(word)
      );
      if (wordResults.length > 0) {
        results = results.concat(wordResults);
      }
    }
  }
  
  // Remove duplicates
  const uniqueResults = [];
  const seenIds = new Set();
  for (const item of results) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      uniqueResults.push(item);
    }
  }
  
  return uniqueResults.slice(0, 5);
}

module.exports = { faqs, getFaqsByCategory, searchFaqs };
