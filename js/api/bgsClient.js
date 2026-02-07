/**
 * BGS OGC API client with CQL filtering, pagination, and retry logic.
 */

import { API_BASE, API_PAGE_LIMIT, YEAR_RANGE } from '../config.js';

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 1000;

/**
 * Build CQL filter for a commodity and statistic type over the year range.
 */
function buildCQLFilter(commodity, statisticType = 'Production') {
  const yearStart = `${YEAR_RANGE.min}-01-01T00:00:00`;
  const yearEnd = `${YEAR_RANGE.max}-12-31T23:59:59`;
  return `bgs_commodity_trans='${commodity}' AND bgs_statistic_type_trans='${statisticType}' AND year>='${yearStart}' AND year<='${yearEnd}'`;
}

/**
 * Fetch a single page from the BGS API.
 */
async function fetchPage(commodity, statisticType, offset = 0) {
  const filter = buildCQLFilter(commodity, statisticType);
  const params = new URLSearchParams({
    filter,
    limit: API_PAGE_LIMIT.toString(),
    offset: offset.toString(),
    f: 'json'
  });

  const url = `${API_BASE}?${params}`;
  const response = await fetchWithRetry(url);
  return response;
}

/**
 * Fetch with exponential backoff retry.
 */
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url);
      if (resp.status === 429 || resp.status >= 500) {
        if (attempt < retries) {
          const delay = RETRY_BASE_DELAY * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
      }
      if (!resp.ok) {
        throw new Error(`API error ${resp.status}: ${resp.statusText}`);
      }
      return await resp.json();
    } catch (err) {
      if (attempt < retries && err.name !== 'AbortError') {
        const delay = RETRY_BASE_DELAY * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

/**
 * Fetch all records for a commodity, handling pagination.
 * Returns array of GeoJSON features.
 */
export async function fetchCommodity(commodity, statisticType = 'Production') {
  const allFeatures = [];
  let offset = 0;

  while (true) {
    const data = await fetchPage(commodity, statisticType, offset);
    const features = data.features || [];
    allFeatures.push(...features);

    // Check if there are more pages
    if (features.length < API_PAGE_LIMIT) break;
    offset += API_PAGE_LIMIT;
  }

  return allFeatures;
}
