/**
 * Individual asset download: SVG for maps, PNG for Chart.js canvases.
 */

import { getChart } from '../charts/chartManager.js';
import { getMapSVG } from '../map/d3Map.js';
import { getState } from '../state.js';

/**
 * Download an SVG element as a .svg file.
 */
export function downloadSVG(svgElement, filename) {
  if (!svgElement) return;

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgElement);

  // Add XML declaration and namespace if missing
  if (!svgString.includes('xmlns=')) {
    svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(blob, filename);
}

/**
 * Download a Chart.js chart as a PNG file.
 */
export function downloadChartPNG(canvasId, filename) {
  const chart = getChart(canvasId);
  if (!chart) return;

  const base64 = chart.toBase64Image('image/png', 1);
  const link = document.createElement('a');
  link.href = base64;
  link.download = filename;
  link.click();
}

/**
 * Wire all download buttons.
 */
export function initAssetDownloads() {
  // Map SVG download
  document.getElementById('btn-download-map')?.addEventListener('click', () => {
    const svg = getMapSVG();
    const mineral = getState('selectedMineral');
    const year = getState('selectedYear');
    const safeName = mineral.replace(/[^a-zA-Z0-9]/g, '_');
    downloadSVG(svg, `CM_Map_${safeName}_${year}.svg`);
  });

  // Bar chart PNG download
  document.getElementById('btn-download-bar')?.addEventListener('click', () => {
    const mineral = getState('selectedMineral');
    const year = getState('selectedYear');
    const safeName = mineral.replace(/[^a-zA-Z0-9]/g, '_');
    downloadChartPNG('bar-chart', `CM_BarChart_${safeName}_${year}.png`);
  });

  // Pie chart PNG download
  document.getElementById('btn-download-pie')?.addEventListener('click', () => {
    const mineral = getState('selectedMineral');
    const year = getState('selectedYear');
    const safeName = mineral.replace(/[^a-zA-Z0-9]/g, '_');
    downloadChartPNG('pie-chart', `CM_PieChart_${safeName}_${year}.png`);
  });

  // Comparison chart PNG download
  document.getElementById('btn-download-comparison')?.addEventListener('click', () => {
    const mineral = getState('selectedMineral');
    const year = getState('selectedYear');
    const safeName = mineral.replace(/[^a-zA-Z0-9]/g, '_');
    downloadChartPNG('comparison-chart', `CM_Comparison_${safeName}_${year}.png`);
  });
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
