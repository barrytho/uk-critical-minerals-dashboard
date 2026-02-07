/**
 * Production share doughnut chart (right column).
 * For "All Minerals" overview, shows distribution of top-5 producer counts.
 */

import { getOrCreateChart, CHART_DEFAULTS } from './chartManager.js';
import { getTopProducers, getWorldTotal, getCrossMineralScores } from '../api/dataCache.js';
import { getState, subscribe } from '../state.js';
import { MINERALS, ALL_MINERALS_KEY } from '../config.js';
import { formatNumber } from '../utils/formatters.js';

const PIE_COLOURS = [
  '#1d70b8', '#d4351c', '#00703c', '#f47738', '#5694ca',
  '#912b88', '#28a197', '#b58840', '#505a5f', '#b1b4b6'
];

export function initPieChart() {
  renderPieChart();

  subscribe('selectedMineral', renderPieChart);
  subscribe('selectedYear', renderPieChart);
  subscribe('dataReady', renderPieChart);
}

function renderPieChart() {
  if (!getState('dataReady')) return;

  const mineral = getState('selectedMineral');
  const year = getState('selectedYear');

  if (mineral === ALL_MINERALS_KEY) {
    renderOverviewPieChart(year);
    return;
  }

  const config = MINERALS[mineral];

  if (!config || config.noData) {
    getOrCreateChart('pie-chart', {
      type: 'doughnut',
      data: { labels: ['No data'], datasets: [{ data: [1], backgroundColor: ['#e0e0e0'] }] },
      options: { ...CHART_DEFAULTS }
    });
    return;
  }

  const top = getTopProducers(mineral, year, 8);
  const worldTotal = getWorldTotal(mineral, year);
  const unit = config.unit;

  if (top.length === 0) {
    getOrCreateChart('pie-chart', {
      type: 'doughnut',
      data: { labels: ['No data'], datasets: [{ data: [1], backgroundColor: ['#e0e0e0'] }] },
      options: { ...CHART_DEFAULTS }
    });
    return;
  }

  const topTotal = top.reduce((sum, t) => sum + t.quantity, 0);
  const otherTotal = worldTotal - topTotal;

  const labels = top.map(t => t.countryName);
  const data = top.map(t => t.quantity);
  const colours = top.map((_, i) => PIE_COLOURS[i % PIE_COLOURS.length]);

  if (otherTotal > 0) {
    labels.push('Other');
    data.push(otherTotal);
    colours.push('#b1b4b6');
  }

  getOrCreateChart('pie-chart', {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colours,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      cutout: '50%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            padding: 6,
            font: { size: 11 }
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const value = ctx.raw;
              const pct = worldTotal > 0 ? ((value / worldTotal) * 100).toFixed(1) : 0;
              return `${ctx.label}: ${formatNumber(value)} ${unit} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

function renderOverviewPieChart(year) {
  const scores = getCrossMineralScores(year);
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1].top5Count - a[1].top5Count)
    .filter(([, d]) => d.top5Count > 0)
    .slice(0, 8);

  if (sorted.length === 0) {
    getOrCreateChart('pie-chart', {
      type: 'doughnut',
      data: { labels: ['No data'], datasets: [{ data: [1], backgroundColor: ['#e0e0e0'] }] },
      options: { ...CHART_DEFAULTS }
    });
    return;
  }

  const labels = sorted.map(([, d]) => d.countryName);
  const data = sorted.map(([, d]) => d.top5Count);
  const colours = sorted.map((_, i) => PIE_COLOURS[i % PIE_COLOURS.length]);

  getOrCreateChart('pie-chart', {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colours,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      cutout: '50%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            padding: 6,
            font: { size: 11 }
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: top-5 in ${ctx.raw} minerals`
          }
        }
      }
    }
  });
}
