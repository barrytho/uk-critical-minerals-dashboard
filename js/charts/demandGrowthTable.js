/**
 * Demand growth summary table: sortable table showing mineral demand growth.
 * Shows 2024, 2050 demand, growth multiplier, and clean share per scenario.
 */

/**
 * Render the growth table.
 * @param {object} cleantechByMineral - from getAllCleantechByMineral()
 * @param {object} totalDemand - from getAllIEADemand() (for clean share)
 * @param {string} scenario - 'STEPS' | 'APS' | 'NZE'
 * @param {string} containerId
 */
export function renderDemandGrowthTable(cleantechByMineral, totalDemand, scenario = 'STEPS', containerId = 'demand-growth-table-container') {
  const container = document.getElementById(containerId);
  if (!container || !cleantechByMineral) return;

  // Build rows
  const rows = Object.entries(cleantechByMineral)
    .filter(([name]) => !name.startsWith('Total'))
    .map(([name, data]) => {
      const val2024 = data['2024'] ?? 0;
      const val2050 = data[scenario]?.['2050'] ?? 0;
      const multiplier = val2024 > 0 ? val2050 / val2024 : null;
      return { name, val2024, val2050, multiplier };
    })
    .filter(d => d.val2024 > 0 || d.val2050 > 0)
    .sort((a, b) => (b.multiplier ?? 0) - (a.multiplier ?? 0));

  // Add clean share for key minerals
  const demandKeys = Object.keys(totalDemand || {});

  let sortKey = 'multiplier';
  let sortDir = -1;

  function render() {
    const sorted = [...rows].sort((a, b) => {
      const va = a[sortKey] ?? -Infinity;
      const vb = b[sortKey] ?? -Infinity;
      return (vb - va) * sortDir;
    });

    const fmt = (v) => {
      if (v == null) return '—';
      if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
      if (v >= 1) return v.toFixed(1);
      return v.toFixed(3);
    };

    container.innerHTML = `
      <table class="growth-table">
        <thead>
          <tr>
            <th data-sort="name">Mineral</th>
            <th data-sort="val2024">2024 (kt)</th>
            <th data-sort="val2050">2050 (kt)</th>
            <th data-sort="multiplier">Growth (x)</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map(r => `
            <tr>
              <td>${r.name}</td>
              <td class="numeric">${fmt(r.val2024)}</td>
              <td class="numeric">${fmt(r.val2050)}</td>
              <td class="numeric ${multiplierClass(r.multiplier)}">${r.multiplier != null ? r.multiplier.toFixed(1) + 'x' : '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Wire sort headers
    for (const th of container.querySelectorAll('th[data-sort]')) {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        if (sortKey === key) {
          sortDir *= -1;
        } else {
          sortKey = key;
          sortDir = key === 'name' ? 1 : -1;
        }
        render();
      });
    }
  }

  render();
}

function multiplierClass(m) {
  if (m == null) return '';
  if (m >= 5) return 'growth-multiplier--high';
  if (m >= 2) return 'growth-multiplier--medium';
  return '';
}

export function destroyDemandGrowthTable(containerId = 'demand-growth-table-container') {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
}
