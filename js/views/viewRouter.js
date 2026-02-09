/**
 * View router: shows/hides view containers based on activeView state.
 */

import { subscribe, getState } from '../state.js';

const VIEW_IDS = ['factsheet', 'demand', 'supply'];

export function initViewRouter() {
  // Set initial visibility
  showView(getState('activeView'));

  subscribe('activeView', showView);
}

function showView(activeView) {
  for (const id of VIEW_IDS) {
    const el = document.getElementById(`view-${id}`);
    if (el) {
      el.hidden = id !== activeView;
    }
  }
}
