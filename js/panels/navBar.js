/**
 * Navigation bar: switches between Fact Sheet, Demand Outlook, and Supply & Risk views.
 */

import { setState, getState, subscribe } from '../state.js';

const VIEWS = [
  { id: 'factsheet', label: 'Fact Sheet' },
  { id: 'demand',    label: 'Demand Outlook' },
  { id: 'supply',    label: 'Supply & Risk' },
];

export function initNavBar() {
  const container = document.getElementById('nav-bar');
  if (!container) return;

  for (const view of VIEWS) {
    const btn = document.createElement('button');
    btn.className = 'nav-btn' + (view.id === getState('activeView') ? ' nav-btn--active' : '');
    btn.dataset.view = view.id;
    btn.textContent = view.label;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', view.id === getState('activeView') ? 'true' : 'false');
    btn.addEventListener('click', () => setState('activeView', view.id));
    container.appendChild(btn);
  }

  subscribe('activeView', (view) => {
    for (const btn of container.querySelectorAll('.nav-btn')) {
      const isActive = btn.dataset.view === view;
      btn.classList.toggle('nav-btn--active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
  });
}
