/**
 * Side-by-side comparison chart (grouped bars with overlaid lines).
 */

import { getOrCreateChart, CHART_DEFAULTS } from './chartManager.js';
import { formatCompact, formatNumber } from '../utils/formatters.js';

/**
 * Update comparison chart with datasets.
 * @param {Array} datasets - [{ label, colour, data: [values per year] }]
 * @param {Array} years - Array of year numbers
 */
export function updateComparisonChart(datasets, years) {
  if (!datasets || datasets.length === 0) {
    getOrCreateChart('comparison-chart', {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: { ...CHART_DEFAULTS }
    });
    return;
  }

  const chartDatasets = datasets.map(ds => ({
    label: ds.label,
    data: ds.data,
    borderColor: ds.colour,
    backgroundColor: ds.colour + '20',
    fill: false,
    tension: 0.3,
    pointRadius: 4,
    pointBackgroundColor: ds.colour
  }));

  getOrCreateChart('comparison-chart', {
    type: 'line',
    data: {
      labels: years.map(String),
      datasets: chartDatasets
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 14,
            padding: 8,
            font: { size: 12 }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (ctx) => {
              const v = ctx.raw;
              return `${ctx.dataset.label}: ${v != null ? formatNumber(v) : 'N/A'}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { font: CHART_DEFAULTS.font },
          grid: { color: '#f3f2f1' }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => formatCompact(v),
            font: CHART_DEFAULTS.font
          },
          grid: { color: '#f3f2f1' }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
}
