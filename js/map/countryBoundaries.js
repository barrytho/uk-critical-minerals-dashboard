/**
 * Load world-atlas TopoJSON and convert to GeoJSON with ISO3 alpha codes.
 */

import { numericToAlpha3 } from '../utils/isoCountries.js';

let countriesGeoJSON = null;
let countryLookup = {};  // alpha3 -> GeoJSON feature

const WORLD_ATLAS_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';

/**
 * Load and parse world boundaries.
 * Returns GeoJSON FeatureCollection with alpha3 property on each feature.
 */
export async function loadBoundaries() {
  if (countriesGeoJSON) return countriesGeoJSON;

  const response = await fetch(WORLD_ATLAS_URL);
  if (!response.ok) throw new Error(`Failed to load world boundaries: ${response.status}`);

  const topo = await response.json();
  const geojson = topojson.feature(topo, topo.objects.countries);

  // Add alpha3 codes to features
  for (const feature of geojson.features) {
    const numericId = feature.id;
    const alpha3 = numericToAlpha3(numericId);
    feature.properties = feature.properties || {};
    feature.properties.alpha3 = alpha3;
    feature.properties.numericId = numericId;

    if (alpha3) {
      countryLookup[alpha3] = feature;
    }
  }

  countriesGeoJSON = geojson;
  return geojson;
}

/**
 * Get GeoJSON feature for a country by alpha3 code.
 */
export function getCountryFeature(alpha3) {
  return countryLookup[alpha3] || null;
}

/**
 * Get all loaded features.
 */
export function getAllFeatures() {
  return countriesGeoJSON?.features || [];
}
