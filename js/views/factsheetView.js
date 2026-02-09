/**
 * Fact sheet view: orchestrates IEA chart updates on mineral/scenario change.
 */

import { getState, subscribe, subscribeMany } from '../state.js';
import { getIEADemand, getIEASupply, getIEACleantechDemand, getIEACleantechByTech, isIEAReady } from '../api/ieaDataLoader.js';
import { renderDemandFanChart, destroyDemandFanChart } from '../charts/demandFanChart.js';
import { renderTechBreakdownChart, destroyTechBreakdownChart } from '../charts/techBreakdownChart.js';
import { renderSupplyConcentrationChart, destroySupplyConcentrationChart } from '../charts/supplyConcentrationChart.js';
import { ALL_MINERALS_KEY, BGS_TO_IEA } from '../config.js';

export function initFactsheetView() {
  if (!isIEAReady()) return;

  updateIEARow();

  subscribeMany(['selectedMineral', 'selectedScenario'], updateIEARow);
}

function updateIEARow() {
  const mineral = getState('selectedMineral');
  const scenario = getState('selectedScenario');
  const ieaRow = document.getElementById('iea-row');
  if (!ieaRow) return;

  // Hide for overview or minerals without IEA data
  if (mineral === ALL_MINERALS_KEY || !hasIEAData(mineral)) {
    ieaRow.hidden = true;
    destroyDemandFanChart();
    destroyTechBreakdownChart();
    destroySupplyConcentrationChart();
    return;
  }

  ieaRow.hidden = false;

  // Demand fan chart
  const demandData = getIEACleantechDemand(mineral);
  if (demandData) {
    renderDemandFanChart(demandData);
  } else {
    destroyDemandFanChart();
    showPlaceholder('demand-fan-chart', 'No cleantech demand data available');
  }

  // Tech breakdown chart
  const techData = getIEACleantechByTech(mineral);
  if (techData) {
    renderTechBreakdownChart(techData, scenario);
  } else {
    destroyTechBreakdownChart();
  }

  // Supply concentration chart
  const supplyData = getIEASupply(mineral);
  if (supplyData) {
    renderSupplyConcentrationChart(supplyData);
  } else {
    destroySupplyConcentrationChart();
  }
}

function hasIEAData(mineral) {
  const map = BGS_TO_IEA[mineral];
  if (!map) return false;
  return map.demand || map.supply || map.cleantech;
}

function showPlaceholder(containerId, message) {
  const el = document.getElementById(containerId);
  if (el) {
    el.innerHTML = `<div class="no-iea-data">${message}</div>`;
  }
}
