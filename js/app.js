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
import { initNavBar } from './panels/navBar.js';
import { initViewRouter } from './views/viewRouter.js';
import { loadIEAData } from './api/ieaDataLoader.js';
import { initFactsheetView } from './views/factsheetView.js';
import { initDemandView } from './views/demandView.js';
import { initSupplyView } from './views/supplyView.js';
import { setState, subscribe } from './state.js';
import { initHHIBadges } from './charts/hhi.js';

async function init() {
  console.log('UK Critical Minerals Dashboard - Initialising...');

  // Wire up header export buttons
  document.getElementById('btn-print')?.addEventListener('click', () => window.print());
  document.getElementById('btn-export-pdf')?.addEventListener('click', exportPDF);
  document.getElementById('btn-export-csv')?.addEventListener('click', exportCSV);

  // Initialise navigation and view routing
  initNavBar();
  initViewRouter();
  initScenarioToggle();
  initScenarioInfoPanel();
  initControlBarVisibility();

  // Initialise control panel (dropdowns below nav)
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
    initHHIBadges();

    // Hide loading overlay
    hideLoadingOverlay();

    // Load IEA data in background (non-blocking)
    loadIEAData().then(() => {
      console.log('IEA data loaded');
      setState('ieaDataReady', true);
      initFactsheetView();
      initDemandView();
      initSupplyView();
    }).catch(err => {
      console.warn('IEA data load failed (non-critical):', err);
    });

  } catch (err) {
    console.error('Initialisation failed:', err);
    showError(err.message);
  }
}

function initScenarioToggle() {
  const container = document.getElementById('scenario-toggle-container');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.scenario-toggle__btn');
    if (!btn) return;
    const scenario = btn.dataset.scenario;
    setState('selectedScenario', scenario);
  });

  subscribe('selectedScenario', (scenario) => {
    for (const btn of container.querySelectorAll('.scenario-toggle__btn')) {
      const isActive = btn.dataset.scenario === scenario;
      btn.classList.toggle('scenario-toggle__btn--active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    }
  });
}

function initScenarioInfoPanel() {
  const btn = document.getElementById('scenario-info-btn');
  const panel = document.getElementById('scenario-info-panel');
  if (!btn || !panel) return;

  btn.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
  });

  const closeBtn = panel.querySelector('.scenario-info-panel__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.hidden = true;
    });
  }
}

function initControlBarVisibility() {
  const controlBar = document.getElementById('control-bar');
  if (!controlBar) return;

  subscribe('activeView', (view) => {
    controlBar.classList.toggle('control-bar--hidden', view !== 'factsheet');
  });
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
