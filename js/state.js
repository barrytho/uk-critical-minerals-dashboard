/**
 * Reactive pub/sub state management.
 * Components subscribe to state keys and are notified on change.
 */

const state = {
  selectedMineral: 'Lithium',
  selectedYear: 2023,
  selectedCountry: null,
  activeTab: 'table',            // 'table' | 'comparison'
  comparisonItems: [],           // Array of country ISO3 codes
  statisticType: 'Production',
  isLoading: true,
  loadProgress: 0,
  dataReady: false
};

const listeners = {};

export function getState(key) {
  return state[key];
}

export function setState(key, value) {
  if (state[key] === value) return;
  const prev = state[key];
  state[key] = value;
  notify(key, value, prev);
}

export function subscribe(key, callback) {
  if (!listeners[key]) listeners[key] = [];
  listeners[key].push(callback);
  return () => {
    listeners[key] = listeners[key].filter(cb => cb !== callback);
  };
}

export function subscribeMany(keys, callback) {
  const unsubs = keys.map(key => subscribe(key, callback));
  return () => unsubs.forEach(fn => fn());
}

function notify(key, value, prev) {
  if (!listeners[key]) return;
  for (const cb of listeners[key]) {
    try {
      cb(value, prev, key);
    } catch (e) {
      console.error(`State listener error [${key}]:`, e);
    }
  }
}

export function getFullState() {
  return { ...state };
}
