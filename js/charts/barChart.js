/**
 * Top producers horizontal bar chart (right column).
 * For "All Minerals" overview, shows dominance score by country.
 */

import { getOrCreateChart, CHART_DEFAULTS } from './chartManager.js';
import { getTopProducers, getCrossMineralScores } from '../api/dataCache.js';
import { getState, subscribe } from '../state.js';
import { GOVUK, MINERALS, ALL_MINERALS_KEY } from '../config.js';
import { formatCompact, formatNumber } from '../utils/formatters.js';

export function initBarChart() {
  renderBarChart();

  subscribe('selectedMineral', renderBarChart);
  subscribe('selectedYear', renderBarChart);
  subscribe('dataReady', renderBarChart);
}

function renderBarChart() {
  if (!getState('dataReady')) return;

  const mineral = getState('selectedMineral');
  const year = getState('selectedYear');

  if (mineral === ALL_MINERALS_KEY) {
    renderOverviewBarChart(year);
    return;
  }

  const config = MINERALS[mineral];

  if (!config || config.noData) {
    getOrCreateChart('bar-chart', {
      type: 'bar',
      data: { labels: ['No data available'], datasets: [{ data: [0] }] },
      options: { ...CHART_DEFAULTS, indexAxis: 'y' }
    });
    return;
  }

  const top = getTopProducers(mineral, year, 10);
  const labels = top.map(t => t.countryName);
  const data = top.map(t => t.quantity);
  const unit = config.unit;

  getOrCreateChart('bar-chart', {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: GOVUK.blue,
        borderColor: GOVUK.darkBlue,
        borderWidth: 1
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${formatNumber(ctx.raw)} ${unit}`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            callback: (v) => formatCompact(v),
            font: CHART_DEFAULTS.font
          },
          grid: { color: '#f3f2f1' }
        },
        y: {
          ticks: {
            font: { ...CHART_DEFAULTS.font, size: 11 }
          },
          grid: { display: false }
        }
      }
    }
  });
}

function renderOverviewBarChart(year) {
  const scores = getCrossMineralScores(year);
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 15);

  const labels = sorted.map(([, data]) => data.countryName);
  const data = sorted.map(([, data]) => data.score);

  getOrCreateChart('bar-chart', {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Dominance Score',
        data,
        backgroundColor: GOVUK.blue,
        borderColor: GOVUK.darkBlue,
        borderWidth: 1
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const iso = sorted[ctx.dataIndex][0];
              const s = scores[iso];
              return `Score: ${s.score} | Top-5 in ${s.top5Count} minerals | Ranked in ${s.mineralCount}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Dominance Score', font: CHART_DEFAULTS.font },
          ticks: { font: CHART_DEFAULTS.font },
          grid: { color: '#f3f2f1' }
        },
        y: {
          ticks: { font: { ...CHART_DEFAULTS.font, size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}
