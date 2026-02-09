/**
 * Technology breakdown chart: Chart.js stacked bar showing which
 * technologies drive demand for a mineral.
 */

import { TECH_COLOURS, IEA_SCENARIOS } from '../config.js';
import { getOrCreateChart, destroyChart } from './chartManager.js';

const CHART_ID = 'tech-breakdown-chart';

/**
 * Render a stacked bar chart of demand by technology sector.
 * @param {object} cleantechByTech - from getIEACleantechByTech(mineral)
 * @param {string} scenario - 'STEPS' | 'APS' | 'NZE'
 */
export function renderTechBreakdownChart(cleantechByTech, scenario = 'STEPS') {
  if (!cleantechByTech?.sectors) return;

  const sectors = cleantechByTech.sectors;
  const techNames = Object.keys(sectors);
  const years = ['2024', '2030', '2040', '2050'];

  const datasets = techNames.map(tech => {
    const data = years.map(y => {
      if (y === '2024') return sectors[tech]?.['2024'] ?? 0;
      return sectors[tech]?.[scenario]?.[y] ?? 0;
    });
    return {
      label: tech,
      data,
      backgroundColor: TECH_COLOURS[tech] || '#b1b4b6',
    };
  });

  getOrCreateChart(CHART_ID, {
    type: 'bar',
    data: {
      labels: years,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          title: { display: true, text: 'kt', font: { size: 11 } },
        },
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, font: { size: 10 } },
        },
        title: {
          display: true,
          text: `${IEA_SCENARIOS[scenario]?.label || scenario}`,
          font: { size: 12 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} kt`
          }
        }
      },
    },
  });
}

export function destroyTechBreakdownChart() {
  destroyChart(CHART_ID);
}
