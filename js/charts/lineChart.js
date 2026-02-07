/**
 * Time series line chart.
 * Used by the comparison tab for individual country series.
 */

import { getOrCreateChart, CHART_DEFAULTS } from './chartManager.js';
import { getCountryMineralSeries } from '../api/dataCache.js';
import { getCountryName } from '../utils/isoCountries.js';
import { GOVUK, MINERALS, YEAR_RANGE } from '../config.js';
import { formatNumber, formatCompact } from '../utils/formatters.js';

/**
 * Update line chart for a country and mineral.
 */
export function updateLineChart(canvasId, countryISO3, mineral) {
  const config = MINERALS[mineral];
  if (!config || config.noData) return;

  const series = getCountryMineralSeries(countryISO3, mineral);
  const years = [];
  const values = [];

  for (let y = YEAR_RANGE.min; y <= YEAR_RANGE.max; y++) {
    years.push(y);
    values.push(series[y]?.quantity ?? null);
  }

  const countryName = getCountryName(countryISO3);
  const unit = config.unit;

  getOrCreateChart(canvasId, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: `${mineral} - ${countryName}`,
        data: values,
        borderColor: GOVUK.blue,
        backgroundColor: 'rgba(29, 112, 184, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: GOVUK.blue,
        spanGaps: false
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.raw;
              return v != null ? `${formatNumber(v)} ${unit}` : 'No data';
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
      }
    }
  });
}
