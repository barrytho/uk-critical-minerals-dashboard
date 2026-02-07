/**
 * Parallel bulk data fetcher with concurrency throttling and progress reporting.
 */

import { UNIQUE_COMMODITIES, MAX_CONCURRENT_REQUESTS } from '../config.js';
import { fetchCommodity } from './bgsClient.js';
import { indexFeatures } from './dataCache.js';
import { setState } from '../state.js';

/**
 * Load all critical minerals data in parallel with throttled concurrency.
 * Updates state.loadProgress (0-100) as requests complete.
 */
export async function loadAllData() {
  setState('isLoading', true);
  setState('loadProgress', 0);

  const commodities = [...UNIQUE_COMMODITIES];
  const total = commodities.length;
  let completed = 0;
  let totalFeatures = 0;

  // Throttled parallel execution
  const results = [];
  const executing = new Set();

  for (const commodity of commodities) {
    const promise = fetchCommodity(commodity)
      .then(features => {
        indexFeatures(features);
        totalFeatures += features.length;
        completed++;
        const progress = Math.round((completed / total) * 100);
        setState('loadProgress', progress);
        updateProgressUI(completed, total, commodity);
        return { commodity, count: features.length };
      })
      .catch(err => {
        console.error(`Failed to fetch ${commodity}:`, err);
        completed++;
        setState('loadProgress', Math.round((completed / total) * 100));
        return { commodity, count: 0, error: err.message };
      });

    executing.add(promise);
    results.push(promise);
    promise.finally(() => executing.delete(promise));

    if (executing.size >= MAX_CONCURRENT_REQUESTS) {
      await Promise.race(executing);
    }
  }

  const allResults = await Promise.all(results);

  console.log('Data loading complete:', {
    commodities: allResults.length,
    totalFeatures,
    results: allResults
  });

  setState('isLoading', false);
  setState('dataReady', true);

  return allResults;
}

function updateProgressUI(completed, total, lastCommodity) {
  const progressText = document.getElementById('progress-text');
  if (progressText) {
    progressText.textContent = `Loaded ${completed}/${total} commodities (${lastCommodity})`;
  }
  const progressFill = document.getElementById('progress-fill');
  if (progressFill) {
    progressFill.style.width = `${Math.round((completed / total) * 100)}%`;
  }
}
