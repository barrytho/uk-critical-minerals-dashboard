/**
 * Chart lifecycle manager: creates, updates, and destroys Chart.js instances.
 */

const charts = {};

/**
 * Get or create a chart instance.
 */
export function getOrCreateChart(canvasId, config) {
  // Destroy existing chart on this canvas
  if (charts[canvasId]) {
    charts[canvasId].destroy();
    delete charts[canvasId];
  }

  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, config);
  charts[canvasId] = chart;
  return chart;
}

/**
 * Get existing chart.
 */
export function getChart(canvasId) {
  return charts[canvasId] || null;
}

/**
 * Destroy a chart.
 */
export function destroyChart(canvasId) {
  if (charts[canvasId]) {
    charts[canvasId].destroy();
    delete charts[canvasId];
  }
}

/**
 * Destroy all charts.
 */
export function destroyAll() {
  for (const id of Object.keys(charts)) {
    charts[id].destroy();
    delete charts[id];
  }
}

/**
 * Common Chart.js defaults for GOV.UK styling.
 */
export const CHART_DEFAULTS = {
  font: {
    family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    size: 12
  },
  color: '#0b0c0c',
  responsive: true,
  maintainAspectRatio: false
};
