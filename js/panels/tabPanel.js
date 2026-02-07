/**
 * Tabbed lower section: Data Table and Comparison tabs.
 * For "All Minerals" overview, shows a heatmap table instead.
 */

import { getState, setState, subscribe } from '../state.js';
import { getTopProducers, getWorldTotal, getMineralYear, getCrossMineralScores, getCountryMineralSeries } from '../api/dataCache.js';
import { getCountryName } from '../utils/isoCountries.js';
import { formatNumber } from '../utils/formatters.js';
import { ALL_MINERALS_KEY, MINERALS, MINERAL_NAMES, COMPARISON_COLOURS, MAX_COMPARISON_ITEMS, YEAR_RANGE } from '../config.js';
import { updateComparisonChart } from '../charts/comparisonChart.js';

let currentSort = { column: 'rank', asc: true };

export function initTabPanel() {
  initTabButtons();
  initComparisonSelect();

  subscribe('selectedMineral', () => refreshTabContent());
  subscribe('selectedYear', () => refreshTabContent());
  subscribe('dataReady', (ready) => { if (ready) refreshTabContent(); });
  subscribe('activeTab', () => switchTab());
  subscribe('comparisonItems', () => updateComparison());
}

function initTabButtons() {
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      setState('activeTab', btn.dataset.tab);
    });
  });
}

function switchTab() {
  const activeTab = getState('activeTab');
  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  buttons.forEach(btn => {
    btn.classList.toggle('tab-btn--active', btn.dataset.tab === activeTab);
    btn.setAttribute('aria-selected', btn.dataset.tab === activeTab);
  });

  panels.forEach(panel => {
    const isActive = panel.id === `tab-${activeTab}`;
    panel.classList.toggle('tab-panel--active', isActive);
    panel.hidden = !isActive;
  });
}

function refreshTabContent() {
  if (!getState('dataReady')) return;
  renderDataTable();
  populateComparisonSelect();
  updateComparison();
}

/**
 * Render the data table for the current mineral/year.
 */
function renderDataTable() {
  const container = document.getElementById('data-table-container');
  if (!container) return;

  const mineral = getState('selectedMineral');
  const year = getState('selectedYear');

  if (mineral === ALL_MINERALS_KEY) {
    renderHeatmapTable(container, year);
    return;
  }

  const config = MINERALS[mineral];
  if (!config || config.noData) {
    container.innerHTML = '<p class="govuk-hint">No data available for this mineral.</p>';
    return;
  }

  const data = getMineralYear(mineral, year);
  const worldTotal = getWorldTotal(mineral, year);
  const unit = config.unit;

  const entries = Object.entries(data)
    .filter(([, rec]) => rec.quantity != null && rec.quantity > 0)
    .map(([iso, rec]) => ({
      iso,
      name: rec.countryName || getCountryName(iso),
      quantity: rec.quantity,
      unit: rec.unit || unit
    }))
    .sort((a, b) => b.quantity - a.quantity);

  // Add rank and share
  const rows = entries.map((e, i) => ({
    ...e,
    rank: i + 1,
    share: worldTotal > 0 ? ((e.quantity / worldTotal) * 100) : 0
  }));

  // Sort
  sortRows(rows);

  let html = `<table class="data-table">
    <thead><tr>
      <th data-col="rank">Rank <span class="sort-arrow">${sortIndicator('rank')}</span></th>
      <th data-col="name">Country <span class="sort-arrow">${sortIndicator('name')}</span></th>
      <th data-col="quantity">Production (${unit}) <span class="sort-arrow">${sortIndicator('quantity')}</span></th>
      <th data-col="share">Share (%) <span class="sort-arrow">${sortIndicator('share')}</span></th>
    </tr></thead><tbody>`;

  for (const row of rows) {
    html += `<tr>
      <td class="numeric">${row.rank}</td>
      <td>${row.name}</td>
      <td class="numeric">${formatNumber(row.quantity)}</td>
      <td class="numeric">${row.share.toFixed(1)}%</td>
    </tr>`;
  }

  html += '</tbody></table>';
  if (rows.length === 0) {
    html = '<p class="govuk-hint">No production data available.</p>';
  }

  container.innerHTML = html;

  // Bind sort headers
  container.querySelectorAll('th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (currentSort.column === col) {
        currentSort.asc = !currentSort.asc;
      } else {
        currentSort.column = col;
        currentSort.asc = col === 'name'; // alphabetical ascending, numeric descending
      }
      renderDataTable();
    });
  });
}

function sortRows(rows) {
  const { column, asc } = currentSort;
  rows.sort((a, b) => {
    let va = a[column], vb = b[column];
    if (typeof va === 'string') {
      return asc ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return asc ? va - vb : vb - va;
  });
}

function sortIndicator(col) {
  if (currentSort.column !== col) return '';
  return currentSort.asc ? '\u25B2' : '\u25BC';
}

/**
 * Render the heatmap table for "All Minerals" overview.
 */
function renderHeatmapTable(container, year) {
  const scores = getCrossMineralScores(year);
  const activeMinerals = MINERAL_NAMES.filter(m => !MINERALS[m].noData);

  // Sort countries by total score descending
  const countries = Object.entries(scores)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 30); // Top 30

  if (countries.length === 0) {
    container.innerHTML = '<p class="govuk-hint">No data available.</p>';
    return;
  }

  let html = '<div style="overflow-x:auto"><table class="heatmap-table"><thead><tr>';
  html += '<th class="country-col">Country</th><th>Score</th>';
  for (const m of activeMinerals) {
    // Abbreviate long mineral names for header
    const short = m.length > 6 ? m.substring(0, 5) + '.' : m;
    html += `<th title="${m}">${short}</th>`;
  }
  html += '</tr></thead><tbody>';

  for (const [iso, data] of countries) {
    html += `<tr><td class="country-col"><strong>${data.countryName || getCountryName(iso)}</strong></td>`;
    html += `<td class="numeric" style="font-weight:700">${data.score}</td>`;
    for (const m of activeMinerals) {
      const rank = data.topRanks[m];
      if (rank) {
        const bg = rankColour(rank);
        html += `<td class="rank-cell" style="background:${bg};color:${rank <= 3 ? '#fff' : '#0b0c0c'}" title="${m}: #${rank}">${rank}</td>`;
      } else {
        html += '<td class="rank-cell" style="background:#f3f2f1;color:#b1b4b6">—</td>';
      }
    }
    html += '</tr>';
  }

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function rankColour(rank) {
  if (rank === 1) return '#003078';
  if (rank === 2) return '#1d70b8';
  if (rank === 3) return '#4b8bc3';
  if (rank <= 5) return '#78a8d2';
  if (rank <= 10) return '#a5c5e1';
  if (rank <= 15) return '#d2e2f0';
  return '#e8e8e8';
}

/**
 * Populate the comparison country multi-select.
 */
function populateComparisonSelect() {
  const select = document.getElementById('comparison-country-select');
  if (!select) return;

  const mineral = getState('selectedMineral');
  const year = getState('selectedYear');

  // Get all producing countries for the current mineral
  let countries;
  if (mineral === ALL_MINERALS_KEY) {
    const scores = getCrossMineralScores(year);
    countries = Object.entries(scores)
      .sort((a, b) => b[1].score - a[1].score)
      .map(([iso, data]) => ({ iso, name: data.countryName || getCountryName(iso) }));
  } else {
    const top = getTopProducers(mineral, year, 50);
    countries = top.map(t => ({ iso: t.country, name: t.countryName }));
  }

  const prevSelection = Array.from(select.selectedOptions).map(o => o.value);
  select.innerHTML = '';

  for (const c of countries) {
    const option = document.createElement('option');
    option.value = c.iso;
    option.textContent = c.name;
    if (prevSelection.includes(c.iso)) {
      option.selected = true;
    }
    select.appendChild(option);
  }
}

function initComparisonSelect() {
  const select = document.getElementById('comparison-country-select');
  if (!select) return;

  select.addEventListener('change', () => {
    const selected = Array.from(select.selectedOptions)
      .map(o => o.value)
      .slice(0, MAX_COMPARISON_ITEMS);
    setState('comparisonItems', selected);
  });
}

function updateComparison() {
  const items = getState('comparisonItems');
  const mineral = getState('selectedMineral');
  if (!items || items.length === 0 || !getState('dataReady')) return;
  if (mineral === ALL_MINERALS_KEY) return; // No comparison for overview

  const years = [];
  for (let y = YEAR_RANGE.min; y <= YEAR_RANGE.max; y++) years.push(y);

  const datasets = [];
  for (let i = 0; i < items.length; i++) {
    const iso = items[i];
    const series = getCountryMineralSeries(iso, mineral);
    datasets.push({
      label: getCountryName(iso),
      colour: COMPARISON_COLOURS[i % COMPARISON_COLOURS.length],
      data: years.map(y => series[y]?.quantity ?? null)
    });
  }

  updateComparisonChart(datasets, years);
}
