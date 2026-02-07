/**
 * In-memory indexed data cache with three access patterns:
 * - byMineral[mineral][year][countryISO3] -> { quantity, unit }
 * - byCountry[countryISO3][mineral][year] -> { quantity, unit }
 * - byYear[year][mineral][countryISO3] -> { quantity, unit }
 */

import { COMMODITY_TO_MINERALS, MINERAL_NAMES, MINERALS } from '../config.js';
import { parseYear } from '../utils/formatters.js';

const cache = {
  byMineral: {},
  byCountry: {},
  byYear: {},
  allRecords: []
};

/**
 * Index a set of GeoJSON features from the BGS API.
 * Features have properties including:
 *   bgs_commodity_trans, country_trans, country_iso3_code,
 *   year, quantity, units, bgs_statistic_type_trans
 */
export function indexFeatures(features) {
  for (const feature of features) {
    const p = feature.properties;
    if (!p) continue;

    const commodity = p.bgs_commodity_trans;
    const countryISO3 = p.country_iso3_code;
    const year = parseYear(p.year);
    const quantity = p.quantity != null ? Number(p.quantity) : null;
    const unit = p.units || 'tonnes';

    if (!commodity || !countryISO3 || !year) continue;

    const mineralNames = COMMODITY_TO_MINERALS[commodity];
    if (!mineralNames) continue;

    const record = { quantity, unit, country: countryISO3, countryName: p.country_trans };

    for (const mineral of mineralNames) {
      // byMineral
      if (!cache.byMineral[mineral]) cache.byMineral[mineral] = {};
      if (!cache.byMineral[mineral][year]) cache.byMineral[mineral][year] = {};
      // Aggregate if multiple entries (take the one with data, or sum)
      const existing = cache.byMineral[mineral][year][countryISO3];
      if (!existing || (existing.quantity == null && quantity != null)) {
        cache.byMineral[mineral][year][countryISO3] = record;
      }

      // byCountry
      if (!cache.byCountry[countryISO3]) cache.byCountry[countryISO3] = {};
      if (!cache.byCountry[countryISO3][mineral]) cache.byCountry[countryISO3][mineral] = {};
      if (!cache.byCountry[countryISO3][mineral][year] ||
          (cache.byCountry[countryISO3][mineral][year].quantity == null && quantity != null)) {
        cache.byCountry[countryISO3][mineral][year] = record;
      }

      // byYear
      if (!cache.byYear[year]) cache.byYear[year] = {};
      if (!cache.byYear[year][mineral]) cache.byYear[year][mineral] = {};
      if (!cache.byYear[year][mineral][countryISO3] ||
          (cache.byYear[year][mineral][countryISO3].quantity == null && quantity != null)) {
        cache.byYear[year][mineral][countryISO3] = record;
      }
    }

    cache.allRecords.push({ mineral: mineralNames[0], year, countryISO3, quantity, unit });
  }
}

/**
 * Get production data for a mineral and year.
 * Returns { countryISO3: { quantity, unit } }
 */
export function getMineralYear(mineral, year) {
  return cache.byMineral[mineral]?.[year] || {};
}

/**
 * Get all minerals data for a country.
 * Returns { mineral: { year: { quantity, unit } } }
 */
export function getCountryData(countryISO3) {
  return cache.byCountry[countryISO3] || {};
}

/**
 * Get a specific mineral's time series for a country.
 * Returns { year: { quantity, unit } }
 */
export function getCountryMineralSeries(countryISO3, mineral) {
  return cache.byCountry[countryISO3]?.[mineral] || {};
}

/**
 * Get top N producers for a mineral in a given year.
 * Returns sorted array of { country, countryName, quantity, unit }.
 */
export function getTopProducers(mineral, year, n = 10) {
  const yearData = cache.byMineral[mineral]?.[year] || {};
  const entries = Object.entries(yearData)
    .filter(([, rec]) => rec.quantity != null && rec.quantity > 0)
    .map(([iso, rec]) => ({
      country: iso,
      countryName: rec.countryName || iso,
      quantity: rec.quantity,
      unit: rec.unit
    }))
    .sort((a, b) => b.quantity - a.quantity);
  return entries.slice(0, n);
}

/**
 * Get total world production for a mineral and year.
 */
export function getWorldTotal(mineral, year) {
  const yearData = cache.byMineral[mineral]?.[year] || {};
  let total = 0;
  for (const rec of Object.values(yearData)) {
    if (rec.quantity != null) total += rec.quantity;
  }
  return total;
}

/**
 * Get all values for a mineral and year (for calculating breaks).
 */
export function getAllValues(mineral, year) {
  const yearData = cache.byMineral[mineral]?.[year] || {};
  return Object.values(yearData).map(r => r.quantity).filter(q => q != null);
}

/**
 * Cross-mineral dominance scoring for the "All Minerals" overview.
 *
 * For each mineral+year, ranks all producing countries.
 * #1 producer = 20 pts, #2 = 19, ... #20 = 1 pt (0 if not in top 20).
 * Sums scores across all minerals for each country.
 *
 * Returns { countryISO3: { score, topRanks: { mineral: rank }, mineralCount, countryName } }
 */
export function getCrossMineralScores(year) {
  const scores = {};
  const activeMinerals = MINERAL_NAMES.filter(m => !MINERALS[m].noData);

  for (const mineral of activeMinerals) {
    const top = getTopProducers(mineral, year, 20);
    for (let i = 0; i < top.length; i++) {
      const iso = top[i].country;
      const rank = i + 1;
      const points = 21 - rank; // #1=20, #2=19, ..., #20=1

      if (!scores[iso]) {
        scores[iso] = { score: 0, topRanks: {}, mineralCount: 0, top5Count: 0, countryName: top[i].countryName };
      }
      scores[iso].score += points;
      scores[iso].topRanks[mineral] = rank;
      scores[iso].mineralCount++;
      if (rank <= 5) scores[iso].top5Count++;
    }
  }

  return scores;
}

/**
 * Check if cache has data.
 */
export function hasData() {
  return cache.allRecords.length > 0;
}

/**
 * Get summary stats.
 */
export function getCacheSummary() {
  return {
    totalRecords: cache.allRecords.length,
    minerals: Object.keys(cache.byMineral).length,
    countries: Object.keys(cache.byCountry).length,
    years: Object.keys(cache.byYear).length
  };
}
