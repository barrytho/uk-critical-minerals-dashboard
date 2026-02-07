/**
 * D3.js Equal Earth projection SVG choropleth map.
 * Replaces Leaflet for a print-friendly, inline SVG approach.
 */

import { loadBoundaries, getAllFeatures } from './countryBoundaries.js';
import { getMineralYear, getAllValues, getCrossMineralScores } from '../api/dataCache.js';
import { getState, subscribe } from '../state.js';
import { ALL_MINERALS_KEY, MINERALS, CHOROPLETH_SCALE, NO_DATA_COLOUR } from '../config.js';
import { quantileBreaks, getColourForValue } from '../utils/colours.js';
import { getCountryName } from '../utils/isoCountries.js';
import { formatNumber, formatCompact } from '../utils/formatters.js';

let svg, g, projection, pathGenerator, tooltip;
let legendGroup;

/**
 * Initialise the D3 map inside #map-container.
 */
export async function initD3Map() {
  await loadBoundaries();

  const container = document.getElementById('map-container');
  if (!container) return;

  // Clear any previous content
  container.innerHTML = '';

  // Create SVG
  const width = container.clientWidth || 800;
  const height = Math.min(width * 0.55, 500);

  projection = d3.geoEqualEarth()
    .fitSize([width, height - 40], { type: 'Sphere' });

  pathGenerator = d3.geoPath(projection);

  svg = d3.select(container)
    .append('svg')
    .attr('id', 'd3-map-svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto')
    .style('background', '#ffffff');

  // Sphere outline
  g = svg.append('g');
  g.append('path')
    .datum({ type: 'Sphere' })
    .attr('d', pathGenerator)
    .attr('fill', '#f0f4f8')
    .attr('stroke', '#b1b4b6')
    .attr('stroke-width', 0.5);

  // Country paths
  const features = getAllFeatures();
  g.selectAll('path.country')
    .data(features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', pathGenerator)
    .attr('fill', NO_DATA_COLOUR)
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 0.3)
    .style('cursor', 'default');

  // Legend group below the map
  legendGroup = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(20, ${height - 30})`);

  // Tooltip
  tooltip = d3.select(container)
    .append('div')
    .attr('class', 'map-tooltip')
    .style('position', 'absolute')
    .style('display', 'none')
    .style('pointer-events', 'none')
    .style('background', 'rgba(255,255,255,0.95)')
    .style('border', '1px solid #b1b4b6')
    .style('padding', '6px 10px')
    .style('font-size', '13px')
    .style('box-shadow', '0 2px 6px rgba(0,0,0,0.15)')
    .style('z-index', '10');

  // Hover events
  g.selectAll('path.country')
    .on('mouseenter', onMouseEnter)
    .on('mousemove', onMouseMove)
    .on('mouseleave', onMouseLeave);

  // Subscribe to state changes
  subscribe('selectedMineral', () => updateMap());
  subscribe('selectedYear', () => updateMap());
  subscribe('dataReady', (ready) => { if (ready) updateMap(); });

  // Initial render if data is already ready
  if (getState('dataReady')) {
    updateMap();
  }
}

function onMouseEnter(event, d) {
  const alpha3 = d.properties?.alpha3;
  if (!alpha3) return;

  const mineral = getState('selectedMineral');
  const year = getState('selectedYear');
  const name = getCountryName(alpha3);

  let valueText;
  if (mineral === ALL_MINERALS_KEY) {
    const scores = getCrossMineralScores(year);
    const s = scores[alpha3];
    valueText = s
      ? `Dominance score: ${s.score} | Top-5 in ${s.top5Count} minerals`
      : 'Not in top 20 for any mineral';
  } else {
    const data = getMineralYear(mineral, year);
    const rec = data[alpha3];
    const config = MINERALS[mineral];
    if (rec?.quantity != null) {
      valueText = `${formatNumber(rec.quantity)} ${config?.unit || 'tonnes'}`;
    } else {
      valueText = 'No data';
    }
  }

  tooltip.html(`<strong>${name}</strong><br>${valueText}`)
    .style('display', 'block');

  d3.select(event.currentTarget)
    .attr('stroke', '#0b0c0c')
    .attr('stroke-width', 1.5)
    .raise();
}

function onMouseMove(event) {
  const container = document.getElementById('map-container');
  const rect = container.getBoundingClientRect();
  tooltip
    .style('left', (event.clientX - rect.left + 12) + 'px')
    .style('top', (event.clientY - rect.top - 10) + 'px');
}

function onMouseLeave(event) {
  tooltip.style('display', 'none');
  d3.select(event.currentTarget)
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 0.3);
}

/**
 * Update map fills based on current mineral/year.
 */
function updateMap() {
  if (!g) return;

  const mineral = getState('selectedMineral');
  const year = getState('selectedYear');

  if (mineral === ALL_MINERALS_KEY) {
    renderOverviewMap(year);
  } else {
    renderMineralMap(mineral, year);
  }
}

function renderMineralMap(mineral, year) {
  const config = MINERALS[mineral];
  if (!config || config.noData) {
    g.selectAll('path.country').attr('fill', NO_DATA_COLOUR);
    renderLegend([]);
    return;
  }

  const data = getMineralYear(mineral, year);
  const values = getAllValues(mineral, year);
  const breaks = quantileBreaks(values, 7);

  g.selectAll('path.country')
    .attr('fill', d => {
      const alpha3 = d.properties?.alpha3;
      if (!alpha3) return NO_DATA_COLOUR;
      const rec = data[alpha3];
      return getColourForValue(rec?.quantity, breaks);
    });

  renderLegend(breaks, formatCompact);
}

function renderOverviewMap(year) {
  const scores = getCrossMineralScores(year);

  // Colour by top5Count (number of minerals where country is top-5)
  const maxCount = Math.max(...Object.values(scores).map(s => s.top5Count), 1);
  const scale = d3.scaleQuantize()
    .domain([0, maxCount])
    .range(CHOROPLETH_SCALE);

  g.selectAll('path.country')
    .attr('fill', d => {
      const alpha3 = d.properties?.alpha3;
      if (!alpha3) return NO_DATA_COLOUR;
      const s = scores[alpha3];
      if (!s || s.top5Count === 0) return NO_DATA_COLOUR;
      return scale(s.top5Count);
    });

  renderOverviewLegend(maxCount);
}

function renderLegend(breaks, formatFn = formatCompact) {
  if (!legendGroup) return;
  legendGroup.selectAll('*').remove();

  if (breaks.length === 0) {
    legendGroup.append('text')
      .attr('font-size', 11)
      .attr('fill', '#505a5f')
      .text('No data available');
    return;
  }

  const items = [];
  items.push({ colour: NO_DATA_COLOUR, label: 'No data' });
  items.push({ colour: CHOROPLETH_SCALE[0], label: '0' });
  for (let i = 0; i < breaks.length; i++) {
    const lo = i === 0 ? 1 : Math.round(breaks[i - 1]) + 1;
    const hi = Math.round(breaks[i]);
    items.push({ colour: CHOROPLETH_SCALE[i + 1], label: `${formatFn(lo)}-${formatFn(hi)}` });
  }
  items.push({
    colour: CHOROPLETH_SCALE[CHOROPLETH_SCALE.length - 1],
    label: `>${formatFn(Math.round(breaks[breaks.length - 1]))}`
  });

  drawLegendItems(items);
}

function renderOverviewLegend(maxCount) {
  if (!legendGroup) return;
  legendGroup.selectAll('*').remove();

  const items = [
    { colour: NO_DATA_COLOUR, label: 'None' }
  ];
  const steps = Math.min(maxCount, CHOROPLETH_SCALE.length);
  for (let i = 0; i < steps; i++) {
    const lo = Math.round((i / steps) * maxCount) + (i === 0 ? 0 : 1);
    const hi = Math.round(((i + 1) / steps) * maxCount);
    items.push({
      colour: CHOROPLETH_SCALE[Math.min(i + 1, CHOROPLETH_SCALE.length - 1)],
      label: lo === hi ? `${lo}` : `${lo}-${hi}`
    });
  }

  legendGroup.append('text')
    .attr('font-size', 10)
    .attr('fill', '#505a5f')
    .attr('y', -4)
    .text('# minerals in top 5');

  drawLegendItems(items);
}

function drawLegendItems(items) {
  const boxSize = 14;
  const spacing = 6;
  let x = 0;

  for (const item of items) {
    legendGroup.append('rect')
      .attr('x', x)
      .attr('y', 0)
      .attr('width', boxSize)
      .attr('height', boxSize)
      .attr('fill', item.colour)
      .attr('stroke', '#b1b4b6')
      .attr('stroke-width', 0.5);

    const label = legendGroup.append('text')
      .attr('x', x + boxSize + 3)
      .attr('y', boxSize - 2)
      .attr('font-size', 10)
      .attr('fill', '#0b0c0c')
      .text(item.label);

    x += boxSize + spacing + (label.node()?.getBBox()?.width || 30) + spacing;
  }
}

/**
 * Get the SVG element (for downloads).
 */
export function getMapSVG() {
  return document.getElementById('d3-map-svg');
}
