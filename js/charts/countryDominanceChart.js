/**
 * Country dominance chart: which countries dominate supply across multiple minerals.
 * Aggregated from IEA supply data (Sheet 2).
 */

import { getOrCreateChart, destroyChart } from './chartManager.js';
import { COMPARISON_COLOURS } from '../config.js';

const CHART_ID = 'country-dominance-chart';

/**
 * Render country dominance across mineral supply chains.
 * @param {object} supplyAll - from getAllIEASupply()
 */
export function renderCountryDominanceChart(supplyAll) {
  if (!supplyAll) return;

  // Aggregate: for each country, count how many minerals they are a top supplier for,
  // and sum their 2024 mining production
  const countryStats = {};

  for (const [mineral, data] of Object.entries(supplyAll)) {
    const countries = data?.mining?.countries || {};
    for (const [country, vals] of Object.entries(countries)) {
      if (country === 'Rest of world') continue;
      const val2024 = vals['2024'] ?? 0;
      if (val2024 <= 0) continue;

      if (!countryStats[country]) {
        countryStats[country] = { totalProduction: 0, mineralCount: 0, minerals: [] };
      }
      countryStats[country].totalProduction += val2024;
      countryStats[country].mineralCount++;
      countryStats[country].minerals.push(mineral);
    }
  }

  // Sort by number of minerals dominated, then by total production
  const sorted = Object.entries(countryStats)
    .sort((a, b) => b[1].mineralCount - a[1].mineralCount || b[1].totalProduction - a[1].totalProduction)
    .slice(0, 12);

  const labels = sorted.map(([name]) => name);
  const mineralCounts = sorted.map(([, d]) => d.mineralCount);

  getOrCreateChart(CHART_ID, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Minerals in top suppliers',
        data: mineralCounts,
        backgroundColor: sorted.map((_, i) => COMPARISON_COLOURS[i % COMPARISON_COLOURS.length]),
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Countries in Top Mining Suppliers (2024)',
          font: { size: 13 },
        },
        tooltip: {
          callbacks: {
            afterLabel: (ctx) => {
              const [, stats] = sorted[ctx.dataIndex];
              return `Minerals: ${stats.minerals.join(', ')}`;
            }
          }
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Number of minerals', font: { size: 11 } },
          ticks: { stepSize: 1 },
          beginAtZero: true,
        },
        y: {
          ticks: { font: { size: 11 } },
        },
      },
    },
  });
}

export function destroyCountryDominanceChart() {
  destroyChart(CHART_ID);
}
