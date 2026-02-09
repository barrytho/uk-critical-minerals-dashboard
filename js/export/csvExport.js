/**
 * CSV export of current view data.
 * Context-aware: exports BGS production data or IEA projections per active view.
 */

import { getState } from '../state.js';
import { getMineralYear, getWorldTotal, getCrossMineralScores } from '../api/dataCache.js';
import { MINERALS, ALL_MINERALS_KEY, IEA_SCENARIOS } from '../config.js';
import { getCountryName } from '../utils/isoCountries.js';
import { getAllCleantechByMineral, getAllIEASupply, getAllIEADemand, isIEAReady } from '../api/ieaDataLoader.js';

/**
 * Export current view data as CSV.
 */
export function exportCSV() {
  const activeView = getState('activeView');

  if (activeView === 'demand') {
    exportDemandCSV();
  } else if (activeView === 'supply') {
    exportSupplyCSV();
  } else {
    exportFactsheetCSV();
  }
}

function exportFactsheetCSV() {
  const mineral = getState('selectedMineral');
  const year = getState('selectedYear');

  if (mineral === ALL_MINERALS_KEY) {
    exportOverviewCSV(year);
    return;
  }

  const config = MINERALS[mineral];

  if (!config || config.noData) {
    alert(`No data available for ${mineral}.`);
    return;
  }

  const data = getMineralYear(mineral, year);
  const unit = config.unit;

  const rows = [
    ['Country', 'ISO3 Code', 'Mineral', 'Year', `Production (${unit})`, 'Share (%)']
  ];

  const worldTotal = getWorldTotal(mineral, year);
  const entries = Object.entries(data)
    .filter(([, rec]) => rec.quantity != null)
    .sort((a, b) => (b[1].quantity || 0) - (a[1].quantity || 0));

  for (const [iso, rec] of entries) {
    const name = getCountryName(iso);
    const share = worldTotal > 0 ? ((rec.quantity / worldTotal) * 100).toFixed(2) : '0';
    rows.push([
      name,
      iso,
      mineral,
      year.toString(),
      rec.quantity != null ? rec.quantity.toString() : '',
      share
    ]);
  }

  downloadCSV(rows, `UK_Critical_Minerals_${mineral}_${year}.csv`);
}

function exportOverviewCSV(year) {
  const scores = getCrossMineralScores(year);
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1].score - a[1].score);

  const rows = [
    ['Country', 'ISO3 Code', 'Year', 'Dominance Score', 'Top-5 Count', 'Minerals Ranked In']
  ];

  for (const [iso, data] of sorted) {
    rows.push([
      data.countryName || getCountryName(iso),
      iso,
      year.toString(),
      data.score.toString(),
      data.top5Count.toString(),
      data.mineralCount.toString()
    ]);
  }

  downloadCSV(rows, `UK_Critical_Minerals_Overview_${year}.csv`);
}

function exportDemandCSV() {
  if (!isIEAReady()) {
    alert('IEA data not yet loaded.');
    return;
  }

  const scenario = getState('selectedScenario');
  const byMineral = getAllCleantechByMineral();

  const rows = [
    ['Mineral', '2024 (kt)', `2030 ${scenario} (kt)`, `2040 ${scenario} (kt)`, `2050 ${scenario} (kt)`, 'Growth (x)']
  ];

  for (const [name, data] of Object.entries(byMineral)) {
    if (name.startsWith('Total')) continue;
    const v2024 = data['2024'] ?? '';
    const v2030 = data[scenario]?.['2030'] ?? '';
    const v2040 = data[scenario]?.['2040'] ?? '';
    const v2050 = data[scenario]?.['2050'] ?? '';
    const growth = v2024 > 0 && v2050 > 0 ? (v2050 / v2024).toFixed(2) : '';
    rows.push([name, numStr(v2024), numStr(v2030), numStr(v2040), numStr(v2050), growth]);
  }

  downloadCSV(rows, `UK_Critical_Minerals_Demand_${scenario}.csv`);
}

function exportSupplyCSV() {
  if (!isIEAReady()) {
    alert('IEA data not yet loaded.');
    return;
  }

  const supplyAll = getAllIEASupply();
  const rows = [
    ['Mineral', 'Type', 'Country', '2024 (kt)', '2030 (kt)', '2035 (kt)', '2040 (kt)']
  ];

  for (const [mineral, data] of Object.entries(supplyAll)) {
    for (const type of ['mining', 'refining']) {
      const countries = data[type]?.countries || {};
      for (const [country, vals] of Object.entries(countries)) {
        rows.push([
          mineral, type, country,
          numStr(vals['2024']), numStr(vals['2030']),
          numStr(vals['2035']), numStr(vals['2040'])
        ]);
      }
    }
  }

  downloadCSV(rows, 'UK_Critical_Minerals_Supply.csv');
}

function numStr(v) {
  if (v == null || v === '') return '';
  return typeof v === 'number' ? v.toString() : String(v);
}

function downloadCSV(rows, filename) {
  const csvContent = rows.map(row =>
    row.map(cell => {
      const str = String(cell);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
