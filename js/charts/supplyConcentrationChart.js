/**
 * Supply concentration chart: horizontal bar of supply by country (mining)
 * with top-3 share indicator.
 */

import { getOrCreateChart, destroyChart } from './chartManager.js';
import { COMPARISON_COLOURS } from '../config.js';

const CHART_ID = 'supply-concentration-chart';

/**
 * Render supply concentration horizontal bar chart.
 * @param {object} supplyData - from getIEASupply(mineral)
 */
export function renderSupplyConcentrationChart(supplyData) {
  if (!supplyData?.mining?.countries) return;

  const countries = supplyData.mining.countries;
  const year = '2024';

  // Sort by 2024 production
  const entries = Object.entries(countries)
    .map(([name, vals]) => ({ name, value: vals[year] ?? 0 }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const labels = entries.map(d => d.name);
  const data = entries.map(d => d.value);
  const total = supplyData.mining.total?.[year] ?? data.reduce((s, v) => s + v, 0);
  const top3Share = supplyData.mining.top3Share?.[year];

  const colours = entries.map((_, i) =>
    i < 3 ? COMPARISON_COLOURS[i % COMPARISON_COLOURS.length] : '#b1b4b6'
  );

  getOrCreateChart(CHART_ID, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colours,
        borderWidth: 0,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: !!top3Share,
          text: top3Share ? `Top 3 share: ${(top3Share * 100).toFixed(0)}%` : '',
          font: { size: 12, weight: '700' },
          color: top3Share > 0.6 ? '#d4351c' : '#0b0c0c',
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const share = total > 0 ? ((ctx.parsed.x / total) * 100).toFixed(1) : '?';
              return `${ctx.parsed.x.toFixed(0)} kt (${share}%)`;
            }
          }
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'kt (2024)', font: { size: 11 } },
        },
        y: {
          ticks: { font: { size: 11 } },
        },
      },
    },
  });
}

export function destroySupplyConcentrationChart() {
  destroyChart(CHART_ID);
}
