/**
 * Supply-demand gap chart: for key minerals, compare projected supply vs demand.
 * Shows surplus/deficit as paired bars.
 */

import { getOrCreateChart, destroyChart } from './chartManager.js';
import { IEA_SCENARIOS } from '../config.js';

const CHART_ID = 'supply-demand-gap-chart';

/**
 * Render supply vs demand comparison.
 * @param {object} supplyAll - from getAllIEASupply()
 * @param {object} demandAll - from getAllIEADemand()
 * @param {string} scenario - 'STEPS' | 'APS' | 'NZE'
 * @param {string} year - '2030' or '2040'
 */
export function renderSupplyDemandGapChart(supplyAll, demandAll, scenario = 'STEPS', year = '2030') {
  if (!supplyAll || !demandAll) return;

  // Find minerals with both supply and demand data
  const minerals = Object.keys(supplyAll).filter(m => demandAll[m]);

  const data = minerals.map(mineral => {
    const supplyTotal = supplyAll[mineral]?.mining?.total?.[year] ?? null;
    const demandTotal = demandAll[mineral]?.totalDemand?.[scenario]?.[year] ?? null;
    return {
      mineral,
      supply: supplyTotal,
      demand: demandTotal,
      gap: supplyTotal != null && demandTotal != null ? supplyTotal - demandTotal : null,
    };
  }).filter(d => d.supply != null || d.demand != null);

  getOrCreateChart(CHART_ID, {
    type: 'bar',
    data: {
      labels: data.map(d => d.mineral),
      datasets: [
        {
          label: `Mining Supply (${year})`,
          data: data.map(d => d.supply),
          backgroundColor: '#1d70b8',
        },
        {
          label: `Total Demand — ${scenario} (${year})`,
          data: data.map(d => d.demand),
          backgroundColor: '#d4351c',
        },
      ],
    },
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
          text: `Supply vs Demand — ${IEA_SCENARIOS[scenario]?.label || scenario} (${year})`,
          font: { size: 13 },
        },
        tooltip: {
          callbacks: {
            afterBody: (items) => {
              if (items.length >= 2) {
                const supply = items.find(i => i.datasetIndex === 0)?.parsed?.y;
                const demand = items.find(i => i.datasetIndex === 1)?.parsed?.y;
                if (supply != null && demand != null) {
                  const gap = supply - demand;
                  return `Gap: ${gap >= 0 ? '+' : ''}${gap.toFixed(0)} kt`;
                }
              }
              return '';
            }
          }
        },
      },
      scales: {
        y: {
          title: { display: true, text: 'kt', font: { size: 11 } },
          beginAtZero: true,
        },
      },
    },
  });
}

export function destroySupplyDemandGapChart() {
  destroyChart(CHART_ID);
}
