/**
 * IEA data loader: fetches data/iea.json and provides accessor functions.
 */

import { BGS_TO_IEA } from '../config.js';

let ieaData = null;

/**
 * Fetch and cache the IEA JSON data.
 */
export async function loadIEAData() {
  const resp = await fetch('data/iea.json');
  if (!resp.ok) throw new Error(`IEA data fetch failed: ${resp.status}`);
  ieaData = await resp.json();
  return ieaData;
}

/**
 * Check if IEA data is loaded.
 */
export function isIEAReady() {
  return ieaData !== null;
}

/**
 * Get total demand data for a key mineral (Sheet 1).
 * Returns { sectors, totalClean, totalDemand, cleanShare, otherUses } with scenario projections.
 */
export function getIEADemand(mineral) {
  if (!ieaData) return null;
  const key = BGS_TO_IEA[mineral]?.demand;
  if (!key) return null;
  return ieaData.totalDemand[key] || null;
}

/**
 * Get supply data for a key mineral (Sheet 2).
 * Returns { mining: { countries, total, top3Share }, refining: { ... } }
 */
export function getIEASupply(mineral) {
  if (!ieaData) return null;
  const key = BGS_TO_IEA[mineral]?.supply;
  if (!key) return null;
  return ieaData.supply[key] || null;
}

/**
 * Get cleantech demand for a mineral across scenarios (Sheet 3.2).
 * Returns { "2024": number, "STEPS": { "2030":..., "2050":... }, "APS": {...}, "NZE": {...} }
 */
export function getIEACleantechDemand(mineral) {
  if (!ieaData) return null;
  const key = BGS_TO_IEA[mineral]?.cleantech;
  if (!key) return null;
  return ieaData.cleantechByMineral[key] || null;
}

/**
 * Get cleantech demand by technology for a mineral (Sheet 3.1).
 * Returns { sectors: { tech: scenarioData }, total: scenarioData }
 */
export function getIEACleantechByTech(mineral) {
  if (!ieaData) return null;
  const key = BGS_TO_IEA[mineral]?.cleantech || BGS_TO_IEA[mineral]?.demand;
  if (!key) return null;
  return ieaData.cleantechByTech[key] || null;
}

/**
 * Get per-technology mineral breakdown (Sheets 4.x).
 * Returns { minerals: { mineralName: scenarioData } }
 */
export function getIEATechBreakdown(technology) {
  if (!ieaData) return null;
  return ieaData.byTechnology[technology] || null;
}

/**
 * Get all minerals in the cleantech-by-mineral dataset (Sheet 3.2).
 */
export function getIEAMineralList() {
  if (!ieaData) return [];
  return Object.keys(ieaData.cleantechByMineral);
}

/**
 * Get all technology names from the byTechnology dataset.
 */
export function getIEATechList() {
  if (!ieaData) return [];
  return Object.keys(ieaData.byTechnology);
}

/**
 * Get minerals that exist in both BGS dashboard and IEA cleantech data.
 */
export function getIEAOverlapMinerals() {
  if (!ieaData) return [];
  return Object.entries(BGS_TO_IEA)
    .filter(([, map]) => map.cleantech && ieaData.cleantechByMineral[map.cleantech])
    .map(([name]) => name);
}

/**
 * Get all total demand data (Sheet 1) for all key minerals.
 */
export function getAllIEADemand() {
  if (!ieaData) return {};
  return ieaData.totalDemand;
}

/**
 * Get all supply data (Sheet 2) for all key minerals.
 */
export function getAllIEASupply() {
  if (!ieaData) return {};
  return ieaData.supply;
}

/**
 * Get the full cleantech-by-mineral dataset (Sheet 3.2).
 */
export function getAllCleantechByMineral() {
  if (!ieaData) return {};
  return ieaData.cleantechByMineral;
}

/**
 * Get the full by-technology dataset (Sheets 4.x).
 */
export function getAllByTechnology() {
  if (!ieaData) return {};
  return ieaData.byTechnology;
}

/**
 * Get the raw IEA data source attribution string.
 */
export function getIEASource() {
  return ieaData?.source || 'IEA Critical Minerals Data Explorer';
}
