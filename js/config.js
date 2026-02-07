/**
 * Configuration: mineral-to-API mapping, colours, constants.
 */

export const API_BASE = 'https://ogcapi.bgs.ac.uk/collections/world-mineral-statistics/items';

export const YEAR_RANGE = { min: 2014, max: 2023 };
export const MAX_CONCURRENT_REQUESTS = 6;
export const API_PAGE_LIMIT = 5000;
export const MAX_COMPARISON_ITEMS = 5;

/**
 * Special "All Minerals" overview entry.
 */
export const ALL_MINERALS_KEY = 'All Minerals — Overview';

/**
 * Maps display mineral name -> BGS API commodity name.
 * Silicon has no data and is handled specially.
 */
export const MINERALS = {
  'Antimony':     { commodity: 'antimony, mine',                   unit: 'tonnes' },
  'Bismuth':      { commodity: 'bismuth, mine',                    unit: 'tonnes' },
  'Cobalt':       { commodity: 'cobalt, refined',                  unit: 'tonnes' },
  'Gallium':      { commodity: 'gallium, primary',                 unit: 'tonnes' },
  'Germanium':    { commodity: 'germanium metal',                  unit: 'tonnes' },
  'Graphite':     { commodity: 'graphite',                         unit: 'tonnes' },
  'Indium':       { commodity: 'indium, refinery',                 unit: 'tonnes' },
  'Lithium':      { commodity: 'lithium minerals',                 unit: 'tonnes' },
  'Magnesium':    { commodity: 'magnesium metal, primary',         unit: 'tonnes' },
  'Manganese':    { commodity: 'manganese ore',                    unit: 'tonnes' },
  'Nickel':       { commodity: 'nickel, mine',                     unit: 'tonnes' },
  'Niobium':      { commodity: 'tantalum and niobium minerals',    unit: 'tonnes', sharedWith: 'Tantalum' },
  'PGMs':         { commodity: 'platinum group metals, mine',      unit: 'kg' },
  'Rare Earths':  { commodity: 'rare earth oxides',                unit: 'tonnes' },
  'Silicon':      { commodity: null,                               unit: 'tonnes', noData: true },
  'Tantalum':     { commodity: 'tantalum and niobium minerals',    unit: 'tonnes', sharedWith: 'Niobium' },
  'Tellurium':    { commodity: 'tellurium, refined',               unit: 'tonnes' },
  'Tin':          { commodity: 'tin, smelter',                     unit: 'tonnes' },
  'Titanium':     { commodity: 'titanium minerals',                unit: 'tonnes' },
  'Tungsten':     { commodity: 'tungsten, mine',                   unit: 'tonnes' },
  'Vanadium':     { commodity: 'vanadium, mine',                   unit: 'tonnes' }
};

export const MINERAL_NAMES = Object.keys(MINERALS).sort();

/**
 * Full dropdown list including overview option.
 */
export const DROPDOWN_OPTIONS = [ALL_MINERALS_KEY, ...MINERAL_NAMES];

/**
 * Unique commodity names to fetch (avoids duplicate fetch for Tantalum/Niobium).
 */
export const UNIQUE_COMMODITIES = [...new Set(
  Object.values(MINERALS)
    .filter(m => m.commodity)
    .map(m => m.commodity)
)];

/**
 * Reverse mapping: commodity -> mineral display names.
 */
export const COMMODITY_TO_MINERALS = {};
for (const [name, cfg] of Object.entries(MINERALS)) {
  if (!cfg.commodity) continue;
  if (!COMMODITY_TO_MINERALS[cfg.commodity]) {
    COMMODITY_TO_MINERALS[cfg.commodity] = [];
  }
  COMMODITY_TO_MINERALS[cfg.commodity].push(name);
}

/**
 * GOV.UK colour palette
 */
export const GOVUK = {
  blue:       '#1d70b8',
  darkBlue:   '#003078',
  lightBlue:  '#5694ca',
  red:        '#d4351c',
  yellow:     '#ffdd00',
  green:      '#00703c',
  darkGrey:   '#505a5f',
  midGrey:    '#b1b4b6',
  lightGrey:  '#f3f2f1',
  white:      '#ffffff',
  black:      '#0b0c0c'
};

/**
 * Sequential blue scale for choropleth (7 steps: lightest to darkest).
 */
export const CHOROPLETH_SCALE = [
  '#f3f2f1',  // no/minimal production
  '#d2e2f0',
  '#a5c5e1',
  '#78a8d2',
  '#4b8bc3',
  '#1d70b8',
  '#0b0c0c'   // highest production
];

export const NO_DATA_COLOUR = '#e0e0e0';

/**
 * Chart colour palette for comparison (up to 5 items).
 */
export const COMPARISON_COLOURS = [
  '#1d70b8',
  '#d4351c',
  '#00703c',
  '#f47738',
  '#5694ca'
];
