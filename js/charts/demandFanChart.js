/**
 * Demand fan chart: D3 area chart showing IEA demand projections.
 * 2024 base fans into STEPS/APS/NZE ribbons to 2050.
 */

import { IEA_SCENARIOS } from '../config.js';

let svg = null;

const YEARS = [2024, 2030, 2035, 2040, 2045, 2050];
const MARGIN = { top: 20, right: 100, bottom: 30, left: 60 };

/**
 * Render the demand fan chart for a mineral.
 * @param {object} demandData - IEA total demand or cleantech data with scenario projections
 * @param {string} containerId - DOM id of the chart container
 * @param {string} label - y-axis label (e.g. "kt")
 */
export function renderDemandFanChart(demandData, containerId = 'demand-fan-chart', label = 'Cleantech demand (kt)') {
  const container = document.getElementById(containerId);
  if (!container || !demandData) return;

  container.innerHTML = '';

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 260;
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;

  svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g')
    .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

  // Build data series per scenario
  const series = {};
  for (const sc of ['STEPS', 'APS', 'NZE']) {
    series[sc] = YEARS.map(y => {
      if (y === 2024) return { year: y, value: demandData['2024'] };
      return { year: y, value: demandData[sc]?.[String(y)] ?? null };
    }).filter(d => d.value != null);
  }

  // Scales
  const allValues = Object.values(series).flat().map(d => d.value);
  const yMax = d3.max(allValues) * 1.1 || 100;

  const x = d3.scaleLinear().domain([2024, 2050]).range([0, innerW]);
  const y = d3.scaleLinear().domain([0, yMax]).range([innerH, 0]);

  // Axes
  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format('d')))
    .selectAll('text').style('font-size', '11px');

  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => d >= 1000 ? `${(d/1000).toFixed(0)}k` : d.toFixed(0)))
    .selectAll('text').style('font-size', '11px');

  // y-axis label
  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -MARGIN.left + 14)
    .attr('x', -innerH / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '11px')
    .style('fill', '#505a5f')
    .text(label);

  // Draw fan areas (NZE widest, then APS, STEPS narrowest)
  const line = d3.line().x(d => x(d.year)).y(d => y(d.value)).curve(d3.curveMonotoneX);

  // Draw scenario lines with area between lowest (STEPS) and highest (NZE)
  const scenarioOrder = ['NZE', 'APS', 'STEPS'];
  const alphas = { NZE: 0.12, APS: 0.18, STEPS: 0.25 };

  for (const sc of scenarioOrder) {
    const data = series[sc];
    if (data.length < 2) continue;

    // Area from zero-baseline to this scenario
    const area = d3.area()
      .x(d => x(d.year))
      .y0(innerH)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('d', area)
      .attr('fill', IEA_SCENARIOS[sc].colour)
      .attr('fill-opacity', alphas[sc]);

    // Line
    g.append('path')
      .datum(data)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', IEA_SCENARIOS[sc].colour)
      .attr('stroke-width', 2);

    // Label at end
    const last = data[data.length - 1];
    g.append('text')
      .attr('x', x(last.year) + 4)
      .attr('y', y(last.value))
      .attr('dy', '0.35em')
      .style('font-size', '11px')
      .style('font-weight', '700')
      .style('fill', IEA_SCENARIOS[sc].colour)
      .text(sc);
  }

  // Base year marker
  const base = demandData['2024'];
  if (base != null) {
    g.append('circle')
      .attr('cx', x(2024))
      .attr('cy', y(base))
      .attr('r', 4)
      .attr('fill', '#0b0c0c');
    g.append('text')
      .attr('x', x(2024) + 6)
      .attr('y', y(base) - 8)
      .style('font-size', '10px')
      .style('fill', '#0b0c0c')
      .text(`${base >= 1000 ? (base/1000).toFixed(1) + 'k' : base.toFixed(0)} (2024)`);
  }
}

export function destroyDemandFanChart(containerId = 'demand-fan-chart') {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
}
