'use strict';

/**
 * @fileoverview Staff operations controller. Updates capacity widgets,
 * gate congestion status bars, and sends stadium-wide broadcasts.
 * @module public/js/staff
 */

// Staff form submission for broadcasts
document.getElementById('staff-broadcast-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const type = document.getElementById('broadcast-type').value;
  const location = document.getElementById('broadcast-location').value;
  
  if(!location) {return;}

  try {
    const res = await fetch('/api/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stadiumId: AppState.stadiumId,
        type: type,
        severity: 'CRITICAL',
        location: location,
        reportedBy: 'Staff Ops Center'
      })
    });
    
    const data = await res.json();
    if (res.ok) {
      window.showToast('Broadcast PA message sent!', 'success');
      if (window.addFanAlertToFeed) {
        window.addFanAlertToFeed({
          severity: 'CRITICAL',
          location: location,
          message: `BROADCAST: ${data.broadcastMessage || data.alert.message}`,
          timestamp: new Date().toLocaleTimeString()
        });
      }
      
      // Update recommendations panel mock
      const recs = document.getElementById('staff-recommendations');
      recs.innerHTML = DOMPurify.sanitize(`
        <div class="bg-red-500/20 border border-red-500/40 p-3 rounded-lg mt-2 text-sm text-red-200">
          <strong class="text-red-400">BROADCAST SENT:</strong><br>
          ${data.broadcastMessage || data.alert.message}
          <hr class="my-2 border-red-500/30">
          <strong class="text-red-400">Actions taken:</strong>
          <ul class="list-disc pl-4 mt-1">
            ${data.alert.instructions.map(i => `<li>${i}</li>`).join('')}
          </ul>
        </div>
      `);
      
      document.getElementById('broadcast-location').value = '';
    } else {
      window.showToast(data.message || 'Broadcast failed', 'error');
    }
  } catch (err) {
    window.showToast('Network error', 'error');
  }
});

/**
 * Updates the SVG capacity ring visually based on the occupancy percentage.
 * @param {number} percentage - The overall capacity utilization percentage (0-100).
 */
function updateCapacityRing(percentage) {
  const ring = document.getElementById('staff-capacity-ring');
  const text = document.getElementById('staff-capacity-text');
  
  if(!ring || !text) {return;}
  
  ring.setAttribute('stroke-dasharray', `${percentage}, 100`);
  text.textContent = `${percentage}%`;
  
  // Color code based on capacity
  if (percentage >= 90) {ring.style.stroke = '#f87171';}
  else if (percentage >= 75) {ring.style.stroke = '#fb923c';}
  else if (percentage >= 50) {ring.style.stroke = '#facc15';}
  else {ring.style.stroke = '#4ade80';}
}

/**
 * Renders gate congestion bars and occupancy metrics in the sidebar container.
 * @param {Array<{ gateId: string, utilisation: number, waitTime: string }>} gateData - Array of gate objects.
 */
function renderGateBars(gateData) {
  const container = document.getElementById('gate-bars-container');
  if(!container) {return;}
  
  container.innerHTML = '';
  
  gateData.forEach(gate => {
    // Determine color
    let fillClass = '#4ade80';
    if (gate.utilisation >= 90) {fillClass = '#f87171';}
    else if (gate.utilisation >= 75) {fillClass = '#fb923c';}
    else if (gate.utilisation >= 50) {fillClass = '#facc15';}
    
    const safeGateId = DOMPurify.sanitize(gate.gateId);
    const safeWaitTime = DOMPurify.sanitize(gate.waitTime || '--');
    
    const row = document.createElement('div');
    row.className = 'flex items-center gap-2 mb-1';
    row.setAttribute('role', 'listitem');
    row.setAttribute('aria-label', `Gate ${safeGateId} is at ${gate.utilisation} percent capacity with a ${safeWaitTime} wait time`);
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'w-8 font-label-md text-sm';
    labelDiv.setAttribute('aria-hidden', 'true');
    labelDiv.textContent = safeGateId;

    const barWrapper = document.createElement('div');
    barWrapper.className = 'flex-1 bg-surface-container/60 h-2 rounded overflow-hidden mr-2';
    barWrapper.setAttribute('aria-hidden', 'true');
    const barFill = document.createElement('div');
    barFill.className = 'h-full rounded transition-all duration-500';
    barFill.style.width = `${gate.utilisation}%`;
    barFill.style.background = fillClass;
    barWrapper.appendChild(barFill);

    const statsDiv = document.createElement('div');
    statsDiv.className = 'text-xs text-on-surface-variant font-medium';
    statsDiv.textContent = `${gate.utilisation}% (${safeWaitTime})`;

    row.appendChild(labelDiv);
    row.appendChild(barWrapper);
    row.appendChild(statsDiv);
    container.appendChild(row);
  });
}

// Initial mock load for Staff UI (simulates polling crowdEngine data)
setTimeout(() => {
  updateCapacityRing(67); // overall avg capacity ~67%
  renderGateBars([
    { gateId: 'A1', utilisation: 45, waitTime: '2m' },
    { gateId: 'B1', utilisation: 75, waitTime: '12m' },
    { gateId: 'C1', utilisation: 100, waitTime: '40m' },
    { gateId: 'D1', utilisation: 30, waitTime: '1m' },
    { gateId: 'E1', utilisation: 85, waitTime: '20m' }
  ]);

  // Set AI recommendations to display routing advice
  const recs = document.getElementById('staff-recommendations');
  if (recs) {
    recs.innerHTML = DOMPurify.sanitize(`
      <div class="bg-secondary-fixed-dim/20 border border-secondary-fixed-dim/40 p-3 rounded-lg text-sm text-on-surface">
        <strong class="text-secondary-fixed-dim">Routing Advisory:</strong><br>
        Fans seated in Sectors C and E are strongly advised to route their exit through Gate B1 or A1 to ensure a faster and safer departure from the stadium.
      </div>
    `);
  }
}, 1000);
