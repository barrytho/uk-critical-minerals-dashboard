/**
 * App entry point: wires all modules together for the fact-sheet dashboard.
 */

import { loadAllData } from './api/dataLoader.js';
import { getCacheSummary } from './api/dataCache.js';
import { initD3Map } from './map/d3Map.js';
import { initControlPanel } from './panels/controlPanel.js';
import { initTabPanel } from './panels/tabPanel.js';
import { initBarChart } from './charts/barChart.js';
import { initPieChart } from './charts/pieChart.js';
import { initAssetDownloads } from './export/assetExport.js';
import { exportPDF } from './export/pdfExport.js';
import { exportCSV } from './export/csvExport.js';

async function init() {
  console.log('UK Critical Minerals Dashboard - Initialising...');

  // Wire up header export buttons
  document.getElementById('btn-print')?.addEventListener('click', () => window.print());
  document.getElementById('btn-export-pdf')?.addEventListener('click', exportPDF);
  document.getElementById('btn-export-csv')?.addEventListener('click', exportCSV);

  // Initialise control panel (dropdowns in header)
  initControlPanel();

  // Start map initialisation and data loading in parallel
  try {
    const [, loadResults] = await Promise.all([
      initD3Map(),
      loadAllData()
    ]);

    // Log summary
    const summary = getCacheSummary();
    console.log('Cache summary:', summary);
    console.log('Load results:', loadResults);

    // Initialise charts, tabs, and download buttons (need data)
    initBarChart();
    initPieChart();
    initTabPanel();
    initAssetDownloads();

    // Hide loading overlay
    hideLoadingOverlay();

  } catch (err) {
    console.error('Initialisation failed:', err);
    showError(err.message);
  }
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 500);
  }
}

function showError(message) {
  const progressText = document.getElementById('progress-text');
  if (progressText) {
    progressText.textContent = `Error: ${message}. Please refresh the page.`;
    progressText.style.color = '#d4351c';
  }
}

// Start the app
init();
