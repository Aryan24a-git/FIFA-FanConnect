'use strict';

/**
 * @fileoverview Volunteer dashboard controller. Manages shift/profile editing,
 * dynamic zone briefings, and volunteer incident report dispatches.
 * @module public/js/volunteer
 */

document.getElementById('vol-report-btn').addEventListener('click', async () => {
  if (!confirm('Report a high crowd issue in Zone B?')) {
    return;
  }

  try {
    const res = await fetch('/api/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stadiumId: AppState.stadiumId,
        type: 'CROWD',
        severity: 'HIGH',
        location: 'Zone B Concourse',
        reportedBy: 'Volunteer Alex Doe',
      }),
    });

    if (res.ok) {
      window.showToast('Alert reported successfully', 'success');
      addAlertToFeed({
        severity: 'HIGH',
        location: 'Zone B Concourse',
        message:
          '<b>Category:</b> Crowd Alert<br><b>Location:</b> Zone B Concourse<br><b>Details:</b> High crowd density reported by Volunteer Alex Doe.',
        timestamp: new Date().toLocaleTimeString(),
      });
    } else {
      window.showToast('Failed to report alert', 'error');
    }
  } catch (err) {
    window.showToast('Network error', 'error');
  }
});

// --- Edit Volunteer Profile ---
const volEditBtn = document.getElementById('vol-edit-btn');
const volEditModal = document.getElementById('vol-edit-modal');
const volEditCancel = document.getElementById('vol-edit-cancel');
const volEditForm = document.getElementById('vol-edit-form');

if (volEditBtn && volEditModal && volEditCancel && volEditForm) {
  volEditBtn.addEventListener('click', () => {
    // Populate form fields with current values
    document.getElementById('vol-edit-name').value = document
      .getElementById('vol-profile-name')
      .textContent.trim();
    document.getElementById('vol-edit-zone').value = document
      .getElementById('vol-profile-zone')
      .textContent.trim();
    document.getElementById('vol-edit-shift').value = document
      .getElementById('vol-profile-shift')
      .textContent.trim();

    volEditModal.classList.remove('hidden');
  });

  volEditCancel.addEventListener('click', () => {
    volEditModal.classList.add('hidden');
  });

  volEditForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newName = document.getElementById('vol-edit-name').value.trim();
    const newZone = document.getElementById('vol-edit-zone').value.trim();
    const newShift = document.getElementById('vol-edit-shift').value.trim();

    // Update profile displays
    document.getElementById('vol-profile-name').textContent = newName;
    document.getElementById('vol-profile-zone').textContent = newZone;
    document.getElementById('vol-profile-shift').textContent = newShift;

    volEditModal.classList.add('hidden');
    window.showToast('Profile updated successfully', 'success');
  });
}

// --- Dynamic Zone Briefings ---
document.getElementById('vol-briefing-btn').addEventListener('click', async () => {
  const zoneName = document.getElementById('vol-profile-zone').textContent.trim();
  const briefingContainer = document.getElementById('vol-briefing-container');
  const briefingContent = document.getElementById('vol-briefing-content');

  if (!briefingContainer || !briefingContent) {
    return;
  }

  briefingContent.textContent = '';
  const span = document.createElement('span');
  span.className = 'opacity-75 italic';
  span.textContent = `Fetching live briefing details for ${zoneName}...`;
  briefingContent.appendChild(span);
  briefingContainer.classList.remove('hidden');

  try {
    const res = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        persona: 'volunteer',
        query: `Give me a zone briefing for ${zoneName}`,
        language: AppState.language,
        stadiumId: AppState.stadiumId,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      briefingContent.textContent = data.response;
    } else {
      briefingContainer.classList.add('hidden');
      window.showToast(data.message || 'Failed to retrieve briefing', 'error');
    }
  } catch (err) {
    briefingContainer.classList.add('hidden');
    window.showToast('Network error retrieving briefing', 'error');
  }
});

/**
 * Helper function to delegate adding an alert to the global shared alert store.
 * @param {Object} alertObj - The alert object to add to the feed.
 */
function addAlertToFeed(alertObj) {
  if (window.addFanAlertToFeed) {
    window.addFanAlertToFeed(alertObj);
  }
}
