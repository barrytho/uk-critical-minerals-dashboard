/**
 * Herfindahl-Hirschman Index (HHI) computation and badge rendering.
 * HHI = sum(share_i^2) * 10000 where share_i is each country's share (0-1).
 * Red >2500 (highly concentrated), Amber 1500-2500, Green <1500.
 */

import { getMineralYear, getWorldTotal } from '../api/dataCache.js';
import { getIEACleantechDemand, isIEAReady } from '../api/ieaDataLoader.js';
import { getState, subscribe, subscribeMany } from '../state.js';
import { ALL_MINERALS_KEY, MINERALS, BGS_TO_IEA } from '../config.js';

/**
 * Compute HHI for a mineral in a given year using BGS production data.
 * Returns HHI value (0-10000) or null if no data.
 */
export function computeHHI(mineral, year) {
  const yearData = getMineralYear(mineral, year);
  const worldTotal = getWorldTotal(mineral, year);
  if (!worldTotal || worldTotal <= 0) return null;

  let hhi = 0;
  for (const rec of Object.values(yearData)) {
    if (rec.quantity != null && rec.quantity > 0) {
      const share = rec.quantity / worldTotal;
      hhi += share * share;
    }
  }
  return Math.round(hhi * 10000);
}

/**
 * Get HHI badge class based on value.
 */
export function hhiClass(hhi) {
  if (hhi == null) return '';
  if (hhi >= 2500) return 'badge--red';
  if (hhi >= 1500) return 'badge--amber';
  return 'badge--green';
}

/**
 * Get HHI label.
 */
export function hhiLabel(hhi) {
  if (hhi == null) return '';
  if (hhi >= 2500) return 'Highly concentrated';
  if (hhi >= 1500) return 'Moderately concentrated';
  return 'Competitive';
}

/**
 * Initialise HHI badges on the fact sheet title bar.
 * Creates badge elements and updates on mineral/year change.
 */
export function initHHIBadges() {
  const titleBar = document.querySelector('.factsheet__title-bar');
  if (!titleBar) return;

  // Create badge container if not present
  let badgeContainer = titleBar.querySelector('.factsheet__badges');
  if (!badgeContainer) {
    badgeContainer = document.createElement('span');
    badgeContainer.className = 'factsheet__badges';
    titleBar.querySelector('.factsheet__title')?.after(badgeContainer);
  }

  function updateBadges() {
    const mineral = getState('selectedMineral');
    const year = getState('selectedYear');

    if (mineral === ALL_MINERALS_KEY || MINERALS[mineral]?.noData) {
      badgeContainer.innerHTML = '';
      return;
    }

    let html = '';

    // HHI badge
    const hhi = computeHHI(mineral, year);
    if (hhi != null) {
      html += `<span class="badge ${hhiClass(hhi)}" title="${hhiLabel(hhi)}">HHI: ${hhi.toLocaleString()}</span>`;
    }

    // IEA demand growth badge
    if (isIEAReady()) {
      const scenario = getState('selectedScenario');
      const cleantech = getIEACleantechDemand(mineral);
      if (cleantech) {
        const val2024 = cleantech['2024'];
        const val2050 = cleantech[scenario]?.['2050'];
        if (val2024 > 0 && val2050 > 0) {
          const multiplier = val2050 / val2024;
          html += `<span class="badge badge--blue" title="IEA ${scenario} cleantech demand growth 2024→2050">${multiplier.toFixed(1)}x by 2050</span>`;
        }
      }
    }

    badgeContainer.innerHTML = html;
  }

  subscribeMany(['selectedMineral', 'selectedYear', 'selectedScenario', 'ieaDataReady'], updateBadges);
  updateBadges();
}
