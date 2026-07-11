'use strict';

/**
 * Main coordinator, state management, and navigation for FIFA FanConnect.
 */

const AppState = {
  currentPersona: 'fan',
  stadiumId: localStorage.getItem('fc_stadium') || 'metlife',
  language: localStorage.getItem('fc_lang') || 'en'
};

/**
 * Toast Notification System
 * @param {string} msg - Message
 * @param {string} type - 'info' | 'success' | 'error'
 */
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  // Safe insertion using DOMPurify
  toast.innerHTML = DOMPurify.sanitize(msg);
  
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Switch persona screens
 */
function switchScreen(targetId) {
  // Update UI screens
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.add('hidden');
    s.classList.remove('active-screen'); // if we use it
  });
  const targetScreen = document.getElementById(targetId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }
  
  // Update UI nav buttons (Desktop and Mobile)
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if(btn.dataset.target === targetId) {
      if (btn.tagName === 'A') {
        btn.classList.add('text-secondary-fixed-dim');
        btn.classList.remove('text-on-surface-variant', 'text-on-surface-variant/70');
        if(btn.closest('#nav-tabs-container')) {
          // Desktop styles
          btn.classList.add('bg-secondary-container/10', 'border-r-4', 'border-secondary-fixed-dim', 'font-bold');
        }
      }
      btn.setAttribute('aria-selected', 'true');
    } else {
      if (btn.tagName === 'A') {
        btn.classList.remove('text-secondary-fixed-dim');
        if(btn.closest('#nav-tabs-container')) {
          // Desktop styles
          btn.classList.remove('bg-secondary-container/10', 'border-r-4', 'border-secondary-fixed-dim', 'font-bold');
          btn.classList.add('text-on-surface-variant/70');
        } else {
          btn.classList.add('text-on-surface-variant');
        }
      }
      btn.setAttribute('aria-selected', 'false');
    }
  });

  AppState.currentPersona = targetId.split('-')[0];
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Navigation binding (Desktop + Mobile)
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchScreen(e.currentTarget.dataset.target);
      const sidebar = document.getElementById('sidebar');
      if(sidebar) {
        sidebar.classList.add('-translate-x-full'); // Close on mobile after click
      }
    });
  });

  // Global settings change
  const stadiumSelect = document.getElementById('fan-stadium');
  const langSelect = document.getElementById('fan-language');
  
  if(stadiumSelect) {
    stadiumSelect.value = AppState.stadiumId;
    stadiumSelect.addEventListener('change', (e) => {
      AppState.stadiumId = e.target.value;
      localStorage.setItem('fc_stadium', e.target.value);
      showToast('Stadium updated', 'success');
    });
  }
  
  if(langSelect) {
    langSelect.value = AppState.language;
    langSelect.addEventListener('change', (e) => {
      AppState.language = e.target.value;
      localStorage.setItem('fc_lang', e.target.value);
      showToast('Language updated', 'success');
    });
  }

  // Mobile sidebar toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  if(mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  // Map Interaction Logic
  const MAP_COORDINATES = {
    'Gate A1': { x: 200, y: 220 },
    'Gate B1': { x: 600, y: 220 },
    'Gate C1': { x: 600, y: 580 },
    'Gate D1': { x: 200, y: 580 },
    'Gate E1': { x: 400, y: 170 },
    'Sector 1': { x: 590, y: 480 },
    'Sector 2': { x: 400, y: 580 },
    'Sector 3': { x: 210, y: 480 },
    'Sector 4': { x: 210, y: 320 },
    'Sector 5': { x: 400, y: 220 },
    'Sector 6': { x: 590, y: 320 }
  };

  let activeStartRing = null;
  let activeEndRing = null;

  function clearMapHighlights() {
    if (activeStartRing) {
      activeStartRing.style.stroke = '';
      activeStartRing.style.strokeWidth = '';
      activeStartRing.style.filter = '';
      activeStartRing = null;
    }
    if (activeEndRing) {
      activeEndRing.style.stroke = '';
      activeEndRing.style.strokeWidth = '';
      activeEndRing.style.filter = '';
      activeEndRing = null;
    }
    const dynamicPath = document.getElementById('wayfinding-path-dynamic');
    if (dynamicPath) {
      dynamicPath.classList.add('opacity-0');
    }
  }

  // Sector Control Card redirect
  const sectorControl = document.getElementById('sector-control-card');
  if (sectorControl) {
    sectorControl.addEventListener('click', () => {
      switchScreen('map-screen');
    });
  }

  // Calculate Route button click handler
  const calcBtn = document.getElementById('calculate-route-btn');
  if (calcBtn) {
    calcBtn.addEventListener('click', async () => {
      const fromNode = document.getElementById('route-start').value;
      const toNode = document.getElementById('route-end').value;
      const accessibility = document.getElementById('route-accessible').checked;

      if (fromNode === toNode) {
        showToast('Start and destination nodes must be different.', 'error');
        return;
      }

      // Draw the skyblue dotted line
      const startCoords = MAP_COORDINATES[fromNode];
      const endCoords = MAP_COORDINATES[toNode];
      const dynamicPath = document.getElementById('wayfinding-path-dynamic');

      if (startCoords && endCoords && dynamicPath) {
        const dx = endCoords.x - startCoords.x;
        const dy = endCoords.y - startCoords.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const midX = (startCoords.x + endCoords.x) / 2;
        const midY = (startCoords.y + endCoords.y) / 2;
        const offset = 40; // curve offset
        const ctrlX = midX - (dy / len) * offset;
        const ctrlY = midY + (dx / len) * offset;
        const pathD = `M ${startCoords.x} ${startCoords.y} Q ${ctrlX} ${ctrlY} ${endCoords.x} ${endCoords.y}`;

        dynamicPath.setAttribute('d', pathD);
        dynamicPath.classList.remove('opacity-0');

        // Clear previous highlights
        clearMapHighlights();

        // Highlight rings if they are gates
        const startKey = fromNode.toLowerCase().replace(' ', '-');
        const startRing = document.getElementById(`${startKey}-ring`);
        if (startRing) {
          startRing.style.stroke = '#28a745'; // Green for start
          startRing.style.strokeWidth = '6px';
          startRing.style.filter = 'drop-shadow(0 0 8px #28a745)';
          activeStartRing = startRing;
        }

        const endKey = toNode.toLowerCase().replace(' ', '-');
        const endRing = document.getElementById(`${endKey}-ring`);
        if (endRing) {
          endRing.style.stroke = '#00daf3'; // Cyan for end
          endRing.style.strokeWidth = '6px';
          endRing.style.filter = 'drop-shadow(0 0 8px #00daf3)';
          activeEndRing = endRing;
        }
      }

      showToast(`Navigating from ${fromNode} to ${toNode}...`, 'success');

      try {
        const res = await fetch('/api/navigate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stadiumId: AppState.stadiumId,
            from: fromNode,
            to: toNode,
            accessibility,
            language: AppState.language
          })
        });

        const data = await res.json();
        if (res.ok) {
          const instructionsEl = document.getElementById('route-instructions');
          const estTimeEl = document.getElementById('route-est-time');
          const stepsContainer = document.getElementById('route-steps-container');

          if (instructionsEl && estTimeEl && stepsContainer) {
            estTimeEl.textContent = data.estimatedTime || `${data.estimatedMinutes.join('–')} min`;
            stepsContainer.innerHTML = '';

            data.steps.forEach(step => {
              const stepRow = document.createElement('div');
              stepRow.className = 'flex items-start gap-2 bg-white/5 p-2 rounded border border-white/5';
              const iconSpan = document.createElement('span');
              iconSpan.className = 'text-sm';
              iconSpan.textContent = step.icon || '📍';
              const innerDiv = document.createElement('div');
              const titleDiv = document.createElement('div');
              titleDiv.className = 'font-bold text-white';
              titleDiv.textContent = `Step ${step.step}`;
              const instrDiv = document.createElement('div');
              instrDiv.className = 'text-on-surface-variant text-xs mt-0.5';
              instrDiv.textContent = step.instruction;
              innerDiv.appendChild(titleDiv);
              innerDiv.appendChild(instrDiv);
              stepRow.appendChild(iconSpan);
              stepRow.appendChild(innerDiv);
              stepsContainer.appendChild(stepRow);
            });

            instructionsEl.classList.remove('hidden');
          }
        } else {
          showToast(data.message || 'Routing failed', 'error');
        }
      } catch (err) {
        showToast('Network error during routing', 'error');
      }
    });
  }

  // Interactive Node clicks update drop-downs
  const mapNodes = document.querySelectorAll('.map-interactable');
  if (mapNodes.length > 0) {
    mapNodes.forEach(node => {
      node.addEventListener('click', (e) => {
        const targetName = e.target.dataset.name || 'Location';
        
        let normalizedNode = '';
        if (targetName.startsWith('Gate ')) {
          normalizedNode = targetName;
        } else if (targetName.startsWith('Sector ')) {
          // e.g. "Sector 1 (Heavy Crowd)" -> "Sector 1"
          const parts = targetName.split(' ');
          normalizedNode = parts[0] + ' ' + parts[1];
        }

        if (normalizedNode) {
          const startSelect = document.getElementById('route-start');
          const endSelect = document.getElementById('route-end');
          if (startSelect && endSelect) {
            if (startSelect.value !== normalizedNode) {
              startSelect.value = normalizedNode;
              showToast(`Selected starting point: ${normalizedNode}`, 'info');
            } else {
              endSelect.value = normalizedNode;
              showToast(`Selected destination: ${normalizedNode}`, 'info');
            }
            if (startSelect.value !== endSelect.value) {
              calcBtn.click();
            }
          }
        }
      });
    });
  }

  // Ensure DOMPurify is loaded
  if (typeof DOMPurify === 'undefined') {
    console.error("DOMPurify not loaded!");
  }
});

// Expose utilities
window.showToast = showToast;
window.AppState = AppState;
window.switchScreen = switchScreen;
