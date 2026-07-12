'use strict';

/**
 * @fileoverview Sustainability Hub & Transport Planner controller.
 * @module public/js/eco
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements for Sustainability
  const calculateEcoBtn = document.getElementById('calculate-eco-btn');
  const ecoTransportSelect = document.getElementById('eco-transport-select');
  const ecoDistanceInput = document.getElementById('eco-distance-input');
  const ecoDistanceValDisplay = document.getElementById('eco-distance-val-display');
  const ecoResults = document.getElementById('eco-results');
  const ecoCarbonValue = document.getElementById('eco-carbon-value');
  const ecoComparisonList = document.getElementById('eco-comparison-list');
  const waterStationsList = document.getElementById('water-stations-list');
  const wasteSortingList = document.getElementById('waste-sorting-list');
  const ecoTipText = document.getElementById('eco-tip-text');

  // Elements for Transport
  const calculateTransportBtn = document.getElementById('calculate-transport-btn');
  const transportDestSelect = document.getElementById('transport-dest-select');
  const transportTimeSelect = document.getElementById('transport-time-select');
  const transportResults = document.getElementById('transport-results');
  const transportAdvice = document.getElementById('transport-advice');
  const transportRankingList = document.getElementById('transport-ranking-list');

  // Static Eco Data (to fill on load)
  const defaultWaterStations = [
    { name: 'North Concourse Refill', loc: 'Near Gate A1', icon: 'water_drop' },
    { name: 'South Concourse Refill', loc: 'Near Gate C1', icon: 'water_drop' },
    { name: 'Accessible Rest Refill', loc: 'Gate E1 Lobby', icon: 'water_drop' }
  ];

  const defaultWasteSorting = [
    { bin: 'Compost (Green)', items: 'Food waste, paper containers', color: 'text-green-400' },
    { bin: 'Recycling (Blue)', items: 'Plastics bottles, clean aluminum cans', color: 'text-blue-400' },
    { bin: 'Landfill (Black)', items: 'Wrappers, unlabelled materials', color: 'text-gray-400' }
  ];

  // Render static defaults
  if (waterStationsList) {
    waterStationsList.innerHTML = defaultWaterStations.map(station => `
      <div class="flex items-center gap-3 bg-white/5 p-2.5 rounded-lg border border-white/5">
        <span class="material-symbols-outlined text-blue-400 text-[20px]">${station.icon}</span>
        <div>
          <h5 class="text-xs font-bold text-white">${station.name}</h5>
          <p class="text-[10px] text-on-surface-variant">${station.loc}</p>
        </div>
      </div>
    `).join('');
  }

  if (wasteSortingList) {
    wasteSortingList.innerHTML = defaultWasteSorting.map(w => `
      <div class="flex flex-col bg-white/5 p-2 rounded border border-white/5">
        <span class="text-xs font-bold ${w.color}">${w.bin}</span>
        <span class="text-[10px] text-on-surface-variant mt-0.5">${w.items}</span>
      </div>
    `).join('');
  }

  // Sustainability Calculation Action
  if (calculateEcoBtn) {
    calculateEcoBtn.addEventListener('click', async () => {
      const mode = ecoTransportSelect.value;
      if (!mode) {
        window.showToast('Please select a commute mode first.', 'info');
        return;
      }

      const distanceKm = parseFloat(ecoDistanceInput ? ecoDistanceInput.value : '15') || 15;

      calculateEcoBtn.disabled = true;
      calculateEcoBtn.textContent = 'Calculating...';

      try {
        const res = await fetch('/api/sustainability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stadiumId: window.AppState?.stadiumId || 'metlife',
            transportMode: mode,
            distanceKm,
            language: window.AppState?.language || 'en'
          })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          const rec = data.recommendation;
          const emissionsKg = rec.carbonFootprintGrams / 1000;
          ecoCarbonValue.textContent = `${emissionsKg.toFixed(2)} kg CO2`;
          
          if (ecoDistanceValDisplay) {
            ecoDistanceValDisplay.textContent = distanceKm;
          }

          let listHtml = '';
          if (rec.comparison && rec.comparison.length > 0) {
            rec.comparison.forEach(item => {
              listHtml += `<li>${DOMPurify.sanitize(item)}</li>`;
            });
          }
          ecoComparisonList.innerHTML = listHtml;

          if (rec.ecoTip) {
            ecoTipText.textContent = `💡 Eco Tip: ${rec.ecoTip}`;
            ecoTipText.classList.remove('hidden');
          } else {
            ecoTipText.classList.add('hidden');
          }

          ecoResults.classList.remove('hidden');
          window.showToast('Carbon footprint calculated!', 'success');
        } else {
          window.showToast(data.message || 'Failed to calculate emissions.', 'error');
        }
      } catch (err) {
        console.error('Eco calculation error:', err);
        window.showToast('Failed to connect to sustainability endpoint.', 'error');
      } finally {
        calculateEcoBtn.disabled = false;
        calculateEcoBtn.textContent = 'Calculate Carbon Footprint';
      }
    });
  }

  // Transport Calculation Action
  if (calculateTransportBtn) {
    calculateTransportBtn.addEventListener('click', async () => {
      const destination = transportDestSelect.value;
      const departureWindow = transportTimeSelect.value;

      calculateTransportBtn.disabled = true;
      calculateTransportBtn.textContent = 'Planning...';

      try {
        const res = await fetch('/api/transport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stadiumId: window.AppState?.stadiumId || 'metlife',
            destination,
            time: departureWindow,
            language: window.AppState?.language || 'en'
          })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          const rec = data.recommendation;
          transportAdvice.innerHTML = DOMPurify.sanitize(`🤖 <b>AI Route Guide:</b> ${rec.generalAdvice}`);
          
          if (rec.recommendations && rec.recommendations.length > 0) {
            transportRankingList.innerHTML = rec.recommendations.map((opt) => {
              let congestionBg = 'bg-green-500/20 text-green-400 border-green-500/30';
              if (opt.status === 'GRIDLOCK' || opt.status === 'HEAVY_CONGESTION') {
                congestionBg = 'bg-red-500/20 text-red-400 border-red-500/30';
              } else if (opt.status === 'MODERATE_DELAYS' || opt.status === 'CONGESTED_BUT_FAST') {
                congestionBg = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
              }

              const recBadge = opt.efficiencyScore >= 80
                ? `<span class="bg-[#00daf3]/20 text-[#00daf3] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#00daf3]/30">RECOMMENDED</span>`
                : '';

              let icon = 'directions_transit';
              if (opt.mode === 'shuttle' || opt.mode === 'bus') {
                icon = 'directions_bus';
              }
              if (opt.mode === 'rideshare') {
                icon = 'hail';
              }
              if (opt.mode === 'parking' || opt.mode === 'car') {
                icon = 'directions_car';
              }

              return `
                <div class="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-secondary-fixed-dim/20 flex items-center justify-center text-secondary-fixed-dim font-bold">
                      <span class="material-symbols-outlined text-[18px]">${icon}</span>
                    </div>
                    <div>
                      <h4 class="font-bold text-sm text-white flex items-center gap-1.5 capitalize">
                        ${opt.mode} (${opt.name})
                        ${recBadge}
                      </h4>
                      <p class="text-xs text-on-surface-variant">${opt.statusMessage}</p>
                      <p class="text-[10px] text-on-surface-variant/70 mt-0.5">Est. Cost: ${opt.costEstimate} | Wait time: ~${opt.baseWaitMinutes} mins</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${congestionBg}">${opt.status}</span>
                  </div>
                </div>
              `;
            }).join('');
          } else {
            transportRankingList.innerHTML = '<p class="text-xs text-on-surface-variant">No routes found.</p>';
          }

          transportResults.classList.remove('hidden');
          window.showToast('Transit planner updated!', 'success');
        } else {
          window.showToast(data.message || 'Failed to query transport recommendations.', 'error');
        }
      } catch (err) {
        console.error('Transport planner error:', err);
        window.showToast('Failed to connect to transport endpoint.', 'error');
      } finally {
        calculateTransportBtn.disabled = false;
        calculateTransportBtn.textContent = 'Find Optimal Route';
      }
    });
  }
});
