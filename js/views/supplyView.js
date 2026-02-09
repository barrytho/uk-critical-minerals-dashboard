/**
 * Supply & Risk view orchestrator.
 * Renders supply-demand gap, concentration heatmap, and country dominance charts.
 */

import { getState, subscribeMany } from '../state.js';
import { getAllIEASupply, getAllIEADemand, isIEAReady } from '../api/ieaDataLoader.js';
import { renderSupplyDemandGapChart } from '../charts/supplyDemandGapChart.js';
import { renderConcentrationHeatmap } from '../charts/concentrationHeatmap.js';
import { renderCountryDominanceChart } from '../charts/countryDominanceChart.js';

export function initSupplyView() {
  if (!isIEAReady()) return;

  if (getState('activeView') === 'supply') {
    requestAnimationFrame(renderAll);
  }

  subscribeMany(['activeView', 'selectedScenario'], () => {
    if (getState('activeView') === 'supply') {
      requestAnimationFrame(renderAll);
    }
  });
}

function renderAll() {
  if (!isIEAReady()) return;

  const scenario = getState('selectedScenario');
  const supplyAll = getAllIEASupply();
  const demandAll = getAllIEADemand();

  renderSupplyDemandGapChart(supplyAll, demandAll, scenario, '2030');
  renderConcentrationHeatmap(supplyAll);
  renderCountryDominanceChart(supplyAll);
}
