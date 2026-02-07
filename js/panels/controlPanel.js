/**
 * Header control panel: mineral dropdown (with "All Minerals" option) + year dropdown.
 * Updates the fact sheet title on change.
 */

import { DROPDOWN_OPTIONS, ALL_MINERALS_KEY, MINERALS, YEAR_RANGE } from '../config.js';
import { setState, getState, subscribe } from '../state.js';

export function initControlPanel() {
  initMineralSelect();
  initYearSelect();
  updateTitle();

  subscribe('selectedMineral', () => {
    updateTitle();
    showInfoBanner(getState('selectedMineral'));
  });
  subscribe('selectedYear', updateTitle);

  // Wire up info banner close button
  const bannerClose = document.querySelector('.info-banner__close');
  if (bannerClose) {
    bannerClose.addEventListener('click', () => {
      const banner = document.getElementById('info-banner');
      if (banner) banner.hidden = true;
    });
  }
}

function initMineralSelect() {
  const select = document.getElementById('mineral-select');
  if (!select) return;

  for (const name of DROPDOWN_OPTIONS) {
    const option = document.createElement('option');
    option.value = name;
    if (name === ALL_MINERALS_KEY) {
      option.textContent = name;
    } else {
      option.textContent = MINERALS[name]?.noData ? `${name} (no data)` : name;
    }
    select.appendChild(option);
  }

  select.value = getState('selectedMineral');

  select.addEventListener('change', () => {
    setState('selectedMineral', select.value);
  });

  subscribe('selectedMineral', (mineral) => {
    select.value = mineral;
  });
}

function initYearSelect() {
  const select = document.getElementById('year-select');
  if (!select) return;

  for (let y = YEAR_RANGE.max; y >= YEAR_RANGE.min; y--) {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y;
    select.appendChild(option);
  }

  select.value = getState('selectedYear');

  select.addEventListener('change', () => {
    setState('selectedYear', parseInt(select.value, 10));
  });

  subscribe('selectedYear', (year) => {
    select.value = year;
  });
}

function updateTitle() {
  const titleEl = document.getElementById('factsheet-title');
  if (!titleEl) return;

  const mineral = getState('selectedMineral');
  const year = getState('selectedYear');

  if (mineral === ALL_MINERALS_KEY) {
    titleEl.textContent = `CRITICAL MINERALS OVERVIEW — Top Producing Countries — ${year}`;
  } else {
    titleEl.textContent = `${mineral.toUpperCase()} — Production Fact Sheet — ${year}`;
  }
}

function showInfoBanner(mineral) {
  const banner = document.getElementById('info-banner');
  const text = document.getElementById('info-banner-text');
  if (!banner || !text) return;

  if (mineral === ALL_MINERALS_KEY) {
    banner.hidden = true;
    return;
  }

  const config = MINERALS[mineral];
  if (!config) {
    banner.hidden = true;
    return;
  }

  if (config.noData) {
    text.textContent = `${mineral}: No production data is available in the BGS World Mineral Statistics dataset for this mineral.`;
    banner.hidden = false;
  } else if (config.sharedWith) {
    text.textContent = `${mineral} shares the BGS commodity "${config.commodity}" with ${config.sharedWith}. Data shown represents the combined commodity.`;
    banner.hidden = false;
  } else {
    banner.hidden = true;
  }
}
