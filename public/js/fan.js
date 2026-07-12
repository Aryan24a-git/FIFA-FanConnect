'use strict';

/**
 * @fileoverview Fan persona controller. Handles chat messages, quick queries,
 * crowd status polling, and reporting safety incidents.
 * @module public/js/fan
 */

const chatWindow = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatLoading = document.getElementById('chat-loading');
const crowdPill = document.getElementById('fan-crowd-pill');

/**
 * Appends a message to the chat window safely.
 * @param {string} text - The raw text content of the message.
 * @param {string} [sender='user'] - The message sender ('user' | 'ai').
 */
function appendMessage(text, sender = 'user') {
  const safeText = DOMPurify.sanitize(text);
  const formattedText = sender === 'ai' ? safeText.replace(/\n/g, '<br>') : safeText;
  
  const msgWrapper = document.createElement('div');
  
  if (sender === 'ai') {
    msgWrapper.className = 'flex flex-col gap-1 items-start max-w-[85%]';
    msgWrapper.innerHTML = `
      <span class="font-label-md text-[10px] text-tertiary-fixed-dim ml-2">FAN Ai</span>
      <div class="bg-surface-container/80 backdrop-blur-md border border-tertiary-fixed-dim/40 rounded-2xl rounded-tl-sm px-4 py-3 text-on-surface font-body-md text-[14px] shadow-sm" tabindex="0">
        ${formattedText}
      </div>
    `;
  } else {
    msgWrapper.className = 'flex flex-col gap-1 items-end self-end max-w-[85%]';
    msgWrapper.innerHTML = `
      <span class="font-label-md text-[10px] text-secondary-fixed-dim mr-2">You</span>
      <div class="bg-secondary-fixed-dim/20 backdrop-blur-md border border-secondary-fixed-dim/40 rounded-2xl rounded-tr-sm px-4 py-3 text-on-surface font-body-md text-[14px] shadow-sm" tabindex="0">
        ${formattedText}
      </div>
    `;
  }
  
  chatWindow.appendChild(msgWrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/**
 * Sends a query to the Assist API and updates the UI with the AI response.
 * @param {string} query - The search query or question.
 * @returns {Promise<void>}
 */
async function sendAssistQuery(query) {
  if (!query.trim()) {return;}
  
  appendMessage(query, 'user');
  chatInput.value = '';
  chatLoading.classList.remove('hidden');
  
  checkAndLogChatIncident(query);

  try {
    const res = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        persona: AppState.currentPersona,
        query,
        language: AppState.language,
        stadiumId: AppState.stadiumId
      })
    });
    
    const data = await res.json();
    chatLoading.classList.add('hidden');
    
    if (res.ok && data.response) {
      appendMessage(data.response, 'ai');
    } else {
      appendMessage("Sorry, I encountered an error. Please try again.", 'ai');
      window.showToast(data.message || 'Error fetching response', 'error');
    }
  } catch (error) {
    chatLoading.classList.add('hidden');
    appendMessage("Network error. Please check your connection.", 'ai');
    window.showToast('Network error', 'error');
  }
}

// Bind chat form
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendAssistQuery(chatInput.value);
});

// Bind quick-tap buttons
document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    sendAssistQuery(e.target.dataset.query);
  });
});

/**
 * Polls crowd status every 30 seconds silently.
 * @returns {Promise<void>}
 */
async function pollCrowdStatus() {
  if(AppState.currentPersona !== 'fan') {return;} // Only poll heavily if on fan screen (optimization)
  
  try {
    // Use the assist route silently to check "crowd status"
    const res = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        persona: 'fan',
        query: 'crowd status',
        language: 'en',
        stadiumId: AppState.stadiumId
      })
    });
    
    const data = await res.json();
    if (data.decision && data.decision.overallLevel) {
      const level = data.decision.overallLevel;
      crowdPill.textContent = level;
      
      const baseClasses = 'px-2 py-1 rounded font-label-md text-caption border';
      if (level === 'LOW') {
          crowdPill.className = `${baseClasses} bg-green-500/20 text-green-400 border-green-500/30`;
      } else if (level === 'MODERATE') {
          crowdPill.className = `${baseClasses} bg-yellow-500/20 text-yellow-400 border-yellow-500/30`;
      } else if (level === 'HIGH') {
          crowdPill.className = `${baseClasses} bg-orange-500/20 text-orange-400 border-orange-500/30`;
      } else if (level === 'CRITICAL') {
          crowdPill.className = `${baseClasses} bg-red-500/20 text-red-400 border-red-500/30 neon-glow-effect`;
      }
      
      crowdPill.setAttribute('aria-label', `Current stadium crowd status is ${level}`);
    }
  } catch (err) {
    console.warn("Failed to poll crowd status", err);
  }
}

// Start polling
setInterval(pollCrowdStatus, 30000);
// Initial poll
pollCrowdStatus();

// Report Incident Modal Logic
const reportBtn = document.getElementById('report-incident-btn');
const incidentModal = document.getElementById('incident-modal');
const closeBtn = document.getElementById('close-incident-modal');
const incidentForm = document.getElementById('incident-form');

if (reportBtn && incidentModal && closeBtn) {
  reportBtn.addEventListener('click', () => {
    incidentModal.classList.remove('hidden');
    // Focus trap: move focus into the modal for accessibility
    setTimeout(() => {
      const firstFocusable = incidentModal.querySelector(
        'button, select, textarea, input'
      );
      if (firstFocusable) {firstFocusable.focus();}
    }, 50);
  });

  closeBtn.addEventListener('click', () => {
    incidentModal.classList.add('hidden');
  });
}

if (incidentForm) {
  incidentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const category = document.getElementById('incident-category').value;
    const location = document.getElementById('incident-location').value;
    const desc = document.getElementById('incident-desc').value;
    
    let type = 'GENERAL';
    let severity = 'LOW';
    if (category === 'MEDICAL') {
      type = 'MEDICAL';
      severity = 'HIGH';
    } else if (category === 'SECURITY') {
      type = 'SECURITY';
      severity = 'HIGH';
    }
    
    const categoryText = category === 'MEDICAL' ? 'Medical Alert' : (category === 'SECURITY' ? 'Security Issue' : 'General Inquiry');
    const userMsg = `🚨 REPORT SUBMITTED: ${categoryText} in ${location}. Description: "${desc}"`;
    
    appendMessage(userMsg, 'user');
    
    incidentModal.classList.add('hidden');
    incidentForm.reset();
    
    chatLoading.classList.remove('hidden');
    
    try {
      const res = await fetch('/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stadiumId: AppState.stadiumId,
          type,
          severity,
          location,
          reportedBy: 'Fan'
        })
      });
      
      const data = await res.json();
      chatLoading.classList.add('hidden');
      
      if (res.ok && data.alert) {
        const incNum = Math.floor(Math.random() * 800) + 100;
        const alertMsg = `🚨 <b>Incident Alert Logged:</b><br>We have logged your report (<b>INC-${incNum}</b>) regarding <b>${categoryText}</b> at <b>${location}</b>.<br>- Stadium safety coordinators have been notified.<br>- Operational response dispatched.<br><br><i>Thank you for helping keep the stadium safe.</i>`;
        appendMessage(alertMsg, 'ai');
        window.showToast('Incident reported successfully!', 'success');
        addFanAlertToFeed({
          severity,
          location,
          message: `<b>Category:</b> ${categoryText}<br><b>Location:</b> ${location}<br><b>Details:</b> ${desc}`,
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        appendMessage("We could not process your report automatically. Please find the nearest safety coordinator.", 'ai');
        window.showToast(data.message || 'Error submitting report', 'error');
      }
    } catch (err) {
      chatLoading.classList.add('hidden');
      appendMessage("Network error: Could not submit report. Please alert a steward directly.", 'ai');
      window.showToast('Network error submitting incident', 'error');
    }
  });
}

// ─── Shared Alert Store ────────────────────────────────────────────────────────
// Single source of truth for all incident alerts across all screens.
// Any script can push to this store; both feeds are re-rendered on every push.

const SharedAlertStore = window.SharedAlertStore || [
  {
    severity: 'MEDIUM',
    location: 'Section C1 Concourse',
    message: '<b>Category:</b> Health/Medical<br><b>Location:</b> Section C1 Concourse<br><b>Details:</b> Fan experiencing heat exhaustion and dehydration. Medical team successfully dispatched.',
    timestamp: '14:32'
  },
  {
    severity: 'LOW',
    location: 'Gate E1',
    message: '<b>Category:</b> Crowd Control<br><b>Location:</b> Gate E1<br><b>Details:</b> Turnstile mechanical malfunction causing entry bottlenecking.',
    timestamp: '14:35'
  },
  {
    severity: 'CRITICAL',
    location: 'Gate C1',
    message: 'AVOID GATE C1 - Maximum Capacity Reached',
    timestamp: '14:40'
  },
  {
    severity: 'MEDIUM',
    location: 'Gate E1',
    message: 'Expect slight delays at Gate E1 due to turnstile maintenance.',
    timestamp: '14:42'
  }
];
window.SharedAlertStore = SharedAlertStore;

// Initial feed rendering
setTimeout(() => {
  renderFeed(document.getElementById('fan-alert-feed'));
  renderFeed(document.getElementById('vol-alert-feed'));
}, 100);

/**
 * Build an alert card DOM node from an alert object.
 * @param {Object} alertObj - The alert data object.
 * @param {string} alertObj.severity - Severity level (CRITICAL|HIGH|MEDIUM|LOW).
 * @param {string} alertObj.location - Affected location in stadium.
 * @param {string} alertObj.message - Details of the alert.
 * @param {string} alertObj.timestamp - Alert timestamp.
 * @returns {HTMLDivElement} The built alert card element.
 */
function buildAlertCard(alertObj) {
  let bgClass = 'bg-surface-container/60';
  let borderClass = 'border-white/10';
  let textClass = 'text-white';

  if (alertObj.severity === 'CRITICAL') {
    bgClass = 'bg-red-500/20'; borderClass = 'border-red-500/40'; textClass = 'text-red-400';
  } else if (alertObj.severity === 'HIGH') {
    bgClass = 'bg-orange-500/20'; borderClass = 'border-orange-500/40'; textClass = 'text-orange-400';
  } else if (['MODERATE', 'MEDIUM', 'LOW'].includes(alertObj.severity)) {
    bgClass = 'bg-yellow-500/20'; borderClass = 'border-yellow-500/40'; textClass = 'text-yellow-400';
  }

  const div = document.createElement('div');
  div.className = `p-3 rounded-lg border ${bgClass} ${borderClass} text-sm`;
  div.innerHTML = DOMPurify.sanitize(
    `<strong class="${textClass}">${alertObj.severity} PRIORITY</strong> — ${alertObj.timestamp}<br>` +
    `<span class="mt-1 block text-white">${alertObj.message || ('Incident at ' + alertObj.location)}</span>`
  );
  return div;
}

/**
 * Re-renders a feed container from the full SharedAlertStore.
 * @param {HTMLElement|null} feedEl - The feed container element.
 */
function renderFeed(feedEl) {
  if (!feedEl) {return;}
  feedEl.innerHTML = '';
  if (SharedAlertStore.length === 0) {
    const p = document.createElement('p');
    p.className = 'text-on-surface-variant opacity-70';
    p.textContent = 'No active alerts.';
    feedEl.appendChild(p);
    return;
  }
  // newest first
  [...SharedAlertStore].reverse().forEach(alertObj => {
    feedEl.appendChild(buildAlertCard(alertObj));
  });
}

/**
 * Push an alert to the shared store and refresh all feeds.
 * @param {Object} alertObj - The alert object to add.
 */
function addFanAlertToFeed(alertObj) {
  SharedAlertStore.push(alertObj);

  // Render into every known feed container that exists in the DOM right now
  renderFeed(document.getElementById('fan-alert-feed'));
  renderFeed(document.getElementById('vol-alert-feed'));

  // Also dispatch a DOM event so any future feed container can subscribe
  document.dispatchEvent(new CustomEvent('fc:alert', { detail: alertObj }));
}

// Re-render feeds whenever the user switches screens (so newly-visible feeds catch up)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.nav-btn');
  if (btn) {
    // Small tick so the hidden→visible transition has completed
    setTimeout(() => {
      renderFeed(document.getElementById('fan-alert-feed'));
      renderFeed(document.getElementById('vol-alert-feed'));
    }, 50);
  }
});

/**
 * Scans user query for keywords and triggers an automatic incident alert report if detected.
 * @param {string} query - The raw user chat input query.
 */
function checkAndLogChatIncident(query) {
  const q = query.toLowerCase();
  const isReport = q.includes('report') || q.includes('emergency') || q.includes('incident') || q.includes('medical') || q.includes('security') || q.includes('fire') || q.includes('injury');
  
  if (isReport) {
    let type = 'GENERAL';
    let severity = 'LOW';
    if (q.includes('medical') || q.includes('injury')) {
      type = 'MEDICAL';
      severity = 'HIGH';
    } else if (q.includes('security') || q.includes('fight') || q.includes('crowd')) {
      type = 'SECURITY';
      severity = 'HIGH';
    }
    
    // Parse location
    let location = 'General Stadium Area';
    const locMatch = query.match(/(?:at|in|near|gate|section)\s+([a-zA-Z0-9\s]+)/i);
    if (locMatch && locMatch[1]) {
      location = locMatch[1].trim();
    }
    
    fetch('/api/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stadiumId: AppState.stadiumId,
        type,
        severity,
        location,
        reportedBy: 'Fan AI Chat'
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.alert) {
        const categoryText = type === 'MEDICAL' ? 'Medical Alert' : (type === 'SECURITY' ? 'Security Issue' : 'General Inquiry');
        addFanAlertToFeed({
          severity: data.alert.severity,
          location: data.alert.location,
          message: `<b>Category:</b> ${categoryText}<br><b>Location:</b> ${data.alert.location}<br><b>Details:</b> "${query}"`,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    })
    .catch(err => console.warn('Failed to log chat incident', err));
  }
}

window.addFanAlertToFeed = addFanAlertToFeed;
