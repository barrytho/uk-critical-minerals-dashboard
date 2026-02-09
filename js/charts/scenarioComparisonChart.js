/**
 * Scenario comparison chart: grouped bar comparing 2024 vs 2030 vs 2050
 * demand across minerals for a selected scenario.
 */

import { getOrCreateChart, destroyChart } from './chartManager.js';
import { IEA_SCENARIOS } from '../config.js';

const CHART_ID = 'scenario-comparison-chart';

const YEAR_COLOURS = {
  '2024': '#0b0c0c',
  '2030': '#5694ca',
  '2050': '#1d70b8',
};

/**
 * Render grouped bar: mineral × year for a given scenario.
 * @param {object} cleantechByMineral - from getAllCleantechByMineral()
 * @param {string} scenario - 'STEPS' | 'APS' | 'NZE'
 * @param {string[]} mineralFilter - optional subset of mineral names to show
 */
export function renderScenarioComparisonChart(cleantechByMineral, scenario = 'STEPS', mineralFilter = null) {
  if (!cleantechByMineral) return;

  // Select top minerals by 2050 demand
  let minerals = Object.entries(cleantechByMineral)
    .filter(([name]) => !name.startsWith('Total'))
    .map(([name, data]) => ({
      name,
      val2024: data['2024'] ?? 0,
      val2030: data[scenario]?.['2030'] ?? 0,
      val2050: data[scenario]?.['2050'] ?? 0,
    }))
    .filter(d => d.val2050 > 0)
    .sort((a, b) => b.val2050 - a.val2050);

  if (mineralFilter) {
    minerals = minerals.filter(d => mineralFilter.includes(d.name));
  } else {
    minerals = minerals.slice(0, 15);
  }

  const labels = minerals.map(d => d.name);
  const years = ['2024', '2030', '2050'];

  const datasets = years.map(y => ({
    label: y,
    data: minerals.map(d => d[`val${y}`]),
    backgroundColor: YEAR_COLOURS[y],
  }));

  getOrCreateChart(CHART_ID, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 12, font: { size: 11 } },
        },
        title: {
          display: true,
          text: `Cleantech Demand — ${IEA_SCENARIOS[scenario]?.label || scenario}`,
          font: { size: 13 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} kt`
          }
        },
      },
      scales: {
        y: {
          title: { display: true, text: 'kt', font: { size: 11 } },
          beginAtZero: true,
        },
        x: {
          ticks: { maxRotation: 45, font: { size: 10 } },
        },
      },
    },
  });
}

export function destroyScenarioComparisonChart() {
  destroyChart(CHART_ID);
}
