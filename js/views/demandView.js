/**
 * Demand Outlook view orchestrator.
 * Renders Sankey, scenario comparison, and growth table when the demand view is active.
 */

import { getState, subscribe, subscribeMany } from '../state.js';
import { getAllByTechnology, getAllCleantechByMineral, getAllIEADemand, isIEAReady } from '../api/ieaDataLoader.js';
import { renderTechDemandSankey, destroySankey } from '../charts/techDemandSankey.js';
import { renderScenarioComparisonChart, destroyScenarioComparisonChart } from '../charts/scenarioComparisonChart.js';
import { renderDemandGrowthTable, destroyDemandGrowthTable } from '../charts/demandGrowthTable.js';

let initialised = false;

export function initDemandView() {
  if (!isIEAReady()) return;

  // Render if already on demand view
  if (getState('activeView') === 'demand') {
    renderAll();
  }

  subscribeMany(['activeView', 'selectedScenario'], () => {
    if (getState('activeView') === 'demand') {
      // Small delay to let DOM become visible
      requestAnimationFrame(renderAll);
    }
  });

  initialised = true;
}

function renderAll() {
  if (!isIEAReady()) return;

  const scenario = getState('selectedScenario');
  const byTech = getAllByTechnology();
  const byMineral = getAllCleantechByMineral();
  const totalDemand = getAllIEADemand();

  renderTechDemandSankey(byTech, scenario, '2030');
  renderScenarioComparisonChart(byMineral, scenario);
  renderDemandGrowthTable(byMineral, totalDemand, scenario);
}
