/**
 * Technology demand Sankey diagram: minerals flow into technologies.
 * Uses d3-sankey to show which minerals are needed for which clean energy sectors.
 */

import { TECH_COLOURS, IEA_SCENARIOS } from '../config.js';

const MINERAL_COLOURS = {
  'Copper': '#d4351c',
  'Cobalt': '#1d70b8',
  'Lithium': '#00703c',
  'Nickel': '#f47738',
  'Chromium': '#5694ca',
  'Manganese': '#6f72af',
  'Battery-grade graphite': '#505a5f',
  'Graphite': '#505a5f',
  'Neodymium': '#85994b',
  'Dysprosium': '#b58105',
  'Silicon': '#912b88',
  'Zinc': '#28a197',
  'Lead': '#b1b4b6',
  'Molybdenum': '#003078',
};

/**
 * Render a Sankey diagram showing mineral → technology flows.
 * @param {object} byTechnology - from getAllByTechnology()
 * @param {string} scenario - 'STEPS' | 'APS' | 'NZE'
 * @param {string} year - '2030' | '2040' | '2050'
 * @param {string} containerId
 */
/**
 * Render a Sankey diagram showing mineral → technology flows.
 * Filters out tiny flows for legibility. Adds generous margins for labels.
 */
export function renderTechDemandSankey(byTechnology, scenario = 'STEPS', year = '2030', containerId = 'sankey-container') {
  const container = document.getElementById(containerId);
  if (!container || !byTechnology) return;

  container.innerHTML = '';

  const width = container.clientWidth || 900;
  const height = Math.max(450, container.clientHeight || 450);

  // Build nodes and links
  const mineralSet = new Set();
  const techSet = new Set();
  const linkData = [];

  for (const [tech, techData] of Object.entries(byTechnology)) {
    if (!techData.minerals) continue;
    techSet.add(tech);

    for (const [mineral, data] of Object.entries(techData.minerals)) {
      if (mineral.startsWith('Total')) continue;
      const value = data[scenario]?.[year] ?? 0;
      if (value <= 0) continue;
      mineralSet.add(mineral);
      linkData.push({ source: mineral, target: tech, value });
    }
  }

  if (linkData.length === 0) {
    container.innerHTML = '<div class="no-iea-data">No flow data for this scenario/year</div>';
    return;
  }

  // Filter out very small flows (< 1% of total) for legibility
  const totalFlow = linkData.reduce((s, l) => s + l.value, 0);
  const minThreshold = totalFlow * 0.005;
  const filteredLinks = linkData.filter(l => l.value >= minThreshold);

  // Rebuild node sets from filtered links
  const filteredMinerals = new Set();
  const filteredTechs = new Set();
  for (const l of filteredLinks) {
    filteredMinerals.add(l.source);
    filteredTechs.add(l.target);
  }

  const nodes = [
    ...Array.from(filteredMinerals).sort().map(name => ({ name, type: 'mineral' })),
    ...Array.from(filteredTechs).map(name => ({ name, type: 'tech' })),
  ];

  const nodeIndex = {};
  nodes.forEach((n, i) => nodeIndex[n.name] = i);

  const links = filteredLinks.map(l => ({
    source: nodeIndex[l.source],
    target: nodeIndex[l.target],
    value: l.value,
  }));

  // Generous margins for labels
  const marginLeft = 180;
  const marginRight = 180;
  const marginTop = 30;
  const marginBottom = 10;

  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const sankey = d3.sankey()
    .nodeWidth(20)
    .nodePadding(12)
    .nodeAlign(d3.sankeyLeft)
    .extent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]]);

  const graph = sankey({
    nodes: nodes.map(d => ({ ...d })),
    links: links.map(d => ({ ...d })),
  });

  // Links
  svg.append('g')
    .selectAll('path')
    .data(graph.links)
    .join('path')
    .attr('d', d3.sankeyLinkHorizontal())
    .attr('fill', 'none')
    .attr('stroke', d => MINERAL_COLOURS[d.source.name] || '#b1b4b6')
    .attr('stroke-opacity', 0.35)
    .attr('stroke-width', d => Math.max(1.5, d.width))
    .append('title')
    .text(d => `${d.source.name} → ${d.target.name}: ${d.value.toFixed(1)} kt`);

  // Nodes
  svg.append('g')
    .selectAll('rect')
    .data(graph.nodes)
    .join('rect')
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => Math.max(2, d.y1 - d.y0))
    .attr('fill', d => {
      if (d.type === 'mineral') return MINERAL_COLOURS[d.name] || '#505a5f';
      return TECH_COLOURS[d.name] || '#1d70b8';
    })
    .append('title')
    .text(d => `${d.name}: ${d.value.toFixed(1)} kt`);

  // Labels — mineral names on left, tech names on right
  svg.append('g')
    .selectAll('text')
    .data(graph.nodes)
    .join('text')
    .attr('x', d => d.type === 'mineral' ? d.x0 - 8 : d.x1 + 8)
    .attr('y', d => (d.y0 + d.y1) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', d => d.type === 'mineral' ? 'end' : 'start')
    .style('font-size', '13px')
    .style('font-weight', '600')
    .style('font-family', 'var(--govuk-font)')
    .style('fill', '#0b0c0c')
    .text(d => d.name);

  // Value labels next to node names
  svg.append('g')
    .selectAll('text')
    .data(graph.nodes)
    .join('text')
    .attr('x', d => d.type === 'mineral' ? d.x0 - 8 : d.x1 + 8)
    .attr('y', d => (d.y0 + d.y1) / 2 + 14)
    .attr('text-anchor', d => d.type === 'mineral' ? 'end' : 'start')
    .style('font-size', '11px')
    .style('font-family', 'var(--govuk-font)')
    .style('fill', '#505a5f')
    .text(d => `${d.value.toFixed(0)} kt`);

  // Scenario/year label
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 16)
    .attr('text-anchor', 'middle')
    .style('font-size', '13px')
    .style('font-weight', '700')
    .style('fill', IEA_SCENARIOS[scenario]?.colour || '#0b0c0c')
    .text(`${IEA_SCENARIOS[scenario]?.label || scenario} — ${year} Projections (kt)`);
}

export function destroySankey(containerId = 'sankey-container') {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
}
