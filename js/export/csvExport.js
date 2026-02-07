/**
 * CSV export of current view data.
 */

import { getState } from '../state.js';
import { getMineralYear, getWorldTotal, getCrossMineralScores } from '../api/dataCache.js';
import { MINERALS, ALL_MINERALS_KEY } from '../config.js';
import { getCountryName } from '../utils/isoCountries.js';

/**
 * Export current mineral/year data as CSV.
 */
export function exportCSV() {
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
