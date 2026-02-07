/**
 * Colour utilities: quantile breaks, scale generation.
 */

import { CHOROPLETH_SCALE, NO_DATA_COLOUR } from '../config.js';

/**
 * Compute quantile breaks for an array of values.
 * Returns n-1 breakpoints for n colour classes.
 */
export function quantileBreaks(values, numClasses = 7) {
  const sorted = values.filter(v => v != null && v > 0).sort((a, b) => a - b);
  if (sorted.length === 0) return [];
  const breaks = [];
  for (let i = 1; i < numClasses; i++) {
    const idx = Math.floor((i / numClasses) * sorted.length);
    breaks.push(sorted[Math.min(idx, sorted.length - 1)]);
  }
  return breaks;
}

/**
 * Get colour for a value given quantile breaks.
 * null -> NO_DATA_COLOUR, 0 -> lightest colour.
 */
export function getColourForValue(value, breaks) {
  if (value == null) return NO_DATA_COLOUR;
  if (value === 0) return CHOROPLETH_SCALE[0];
  for (let i = 0; i < breaks.length; i++) {
    if (value <= breaks[i]) return CHOROPLETH_SCALE[i];
  }
  return CHOROPLETH_SCALE[CHOROPLETH_SCALE.length - 1];
}

/**
 * Build legend items from breaks.
 * Returns array of { colour, label }.
 */
export function buildLegendItems(breaks, formatFn) {
  if (breaks.length === 0) {
    return [{ colour: NO_DATA_COLOUR, label: 'No data' }];
  }
  const items = [];
  items.push({ colour: NO_DATA_COLOUR, label: 'No data' });
  items.push({ colour: CHOROPLETH_SCALE[0], label: `0` });
  for (let i = 0; i < breaks.length; i++) {
    const lo = i === 0 ? 1 : breaks[i - 1] + 1;
    const hi = breaks[i];
    const label = `${formatFn(lo)} - ${formatFn(hi)}`;
    items.push({ colour: CHOROPLETH_SCALE[i + 1], label });
  }
  // Top class
  const lastBreak = breaks[breaks.length - 1];
  items.push({
    colour: CHOROPLETH_SCALE[CHOROPLETH_SCALE.length - 1],
    label: `> ${formatFn(lastBreak)}`
  });
  return items;
}
