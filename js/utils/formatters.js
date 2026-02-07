/**
 * Number and unit formatting utilities.
 */

/**
 * Format a number with commas and optional decimal places.
 */
export function formatNumber(n, decimals = 0) {
  if (n == null) return 'N/A';
  return Number(n).toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Compact number formatting (e.g. 1.2M, 450K).
 */
export function formatCompact(n) {
  if (n == null) return 'N/A';
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}

/**
 * Format a quantity with its unit.
 */
export function formatWithUnit(value, unit) {
  if (value == null) return 'No data';
  return `${formatNumber(value)} ${unit}`;
}

/**
 * Extract year from BGS date string (e.g. "2022-01-01T00:00:00" -> 2022).
 */
export function parseYear(dateStr) {
  if (!dateStr) return null;
  const y = parseInt(dateStr.substring(0, 4), 10);
  return isNaN(y) ? null : y;
}

/**
 * Build a CQL date string from a year.
 */
export function yearToDate(year) {
  return `${year}-01-01T00:00:00`;
}
