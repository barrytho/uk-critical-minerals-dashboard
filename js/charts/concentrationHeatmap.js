/**
 * Concentration heatmap: D3 heatmap of minerals × years,
 * coloured by top-3 share (darker = more concentrated).
 */

/**
 * Render supply concentration heatmap.
 * @param {object} supplyAll - from getAllIEASupply()
 * @param {string} containerId
 */
export function renderConcentrationHeatmap(supplyAll, containerId = 'concentration-heatmap-container') {
  const container = document.getElementById(containerId);
  if (!container || !supplyAll) return;

  container.innerHTML = '';

  const minerals = Object.keys(supplyAll);
  const years = ['2024', '2030', '2035', '2040'];

  // Build data matrix
  const data = [];
  for (const mineral of minerals) {
    for (const year of years) {
      const share = supplyAll[mineral]?.mining?.top3Share?.[year];
      data.push({ mineral, year, share: share ?? null });
    }
  }

  const margin = { top: 30, right: 20, bottom: 10, left: 130 };
  const cellW = 60;
  const cellH = 30;
  const width = margin.left + margin.right + years.length * cellW;
  const height = margin.top + margin.bottom + minerals.length * cellH;

  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Colour scale: higher concentration = darker red
  const colour = d3.scaleSequential(d3.interpolateReds).domain([0.3, 1.0]);

  const x = d3.scaleBand().domain(years).range([0, years.length * cellW]).padding(0.05);
  const y = d3.scaleBand().domain(minerals).range([0, minerals.length * cellH]).padding(0.05);

  // Cells
  g.selectAll('rect')
    .data(data)
    .join('rect')
    .attr('class', 'heatmap-cell')
    .attr('x', d => x(d.year))
    .attr('y', d => y(d.mineral))
    .attr('width', x.bandwidth())
    .attr('height', y.bandwidth())
    .attr('fill', d => d.share != null ? colour(d.share) : '#f3f2f1')
    .attr('rx', 2)
    .append('title')
    .text(d => d.share != null
      ? `${d.mineral} (${d.year}): Top 3 share ${(d.share * 100).toFixed(0)}%`
      : `${d.mineral} (${d.year}): No data`);

  // Cell labels
  g.selectAll('.cell-label')
    .data(data)
    .join('text')
    .attr('class', 'cell-label')
    .attr('x', d => x(d.year) + x.bandwidth() / 2)
    .attr('y', d => y(d.mineral) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .style('font-size', '10px')
    .style('fill', d => d.share != null && d.share > 0.7 ? '#fff' : '#0b0c0c')
    .text(d => d.share != null ? `${(d.share * 100).toFixed(0)}%` : '—');

  // X axis (years at top)
  g.append('g')
    .selectAll('text')
    .data(years)
    .join('text')
    .attr('x', d => x(d) + x.bandwidth() / 2)
    .attr('y', -8)
    .attr('text-anchor', 'middle')
    .style('font-size', '11px')
    .style('font-weight', '700')
    .text(d => d);

  // Y axis (minerals)
  g.append('g')
    .selectAll('text')
    .data(minerals)
    .join('text')
    .attr('x', -6)
    .attr('y', d => y(d) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .style('font-size', '11px')
    .text(d => d);
}

export function destroyConcentrationHeatmap(containerId = 'concentration-heatmap-container') {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
}
