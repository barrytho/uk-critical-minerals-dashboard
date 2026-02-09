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
 * Maps BGS dashboard mineral name -> IEA data key(s).
 * Used to look up IEA demand/supply data for each BGS mineral.
 */
export const BGS_TO_IEA = {
  'Lithium':      { demand: 'Lithium',      supply: 'Lithium',             cleantech: 'Lithium' },
  'Cobalt':       { demand: 'Cobalt',       supply: 'Cobalt',              cleantech: 'Cobalt' },
  'Copper':       { demand: 'Copper',       supply: 'Copper',              cleantech: 'Copper' },
  'Nickel':       { demand: 'Nickel',       supply: 'Nickel',              cleantech: 'Nickel' },
  'Manganese':    { demand: null,           supply: null,                  cleantech: 'Manganese' },
  'Tungsten':     { demand: null,           supply: null,                  cleantech: 'Tungsten' },
  'Tin':          { demand: null,           supply: null,                  cleantech: 'Tin' },
  'Graphite':     { demand: 'Graphite',     supply: 'Graphite',            cleantech: 'Battery-grade graphite' },
  'Tantalum':     { demand: null,           supply: null,                  cleantech: 'Tantalum' },
  'Niobium':      { demand: null,           supply: null,                  cleantech: 'Niobium' },
  'Silicon':      { demand: null,           supply: null,                  cleantech: 'Silicon' },
  'Titanium':     { demand: null,           supply: null,                  cleantech: 'Titanium' },
  'Gallium':      { demand: null,           supply: null,                  cleantech: 'Gallium' },
  'Germanium':    { demand: null,           supply: null,                  cleantech: 'Germanium' },
  'Magnesium':    { demand: null,           supply: null,                  cleantech: 'Magnesium' },
  'PGMs':         { demand: null,           supply: null,                  cleantech: 'PGMs' },
  'Rare Earths':  { demand: 'Rare Earth Elements', supply: 'Rare Earth Elements', cleantech: 'Total REE' },
  'Vanadium':     { demand: null,           supply: null,                  cleantech: 'Vanadium' },
  'Tellurium':    { demand: null,           supply: null,                  cleantech: 'Tellurium' },
  'Indium':       { demand: null,           supply: null,                  cleantech: 'Indium' },
  'Bismuth':      { demand: null,           supply: null,                  cleantech: null },
  'Antimony':     { demand: null,           supply: null,                  cleantech: null },
  'Beryllium':    { demand: null,           supply: null,                  cleantech: null },
};

/**
 * IEA scenario display names and colours.
 */
export const IEA_SCENARIOS = {
  'STEPS': { label: 'Stated Policies (STEPS)', colour: '#1d70b8' },
  'APS':   { label: 'Announced Pledges (APS)',  colour: '#f47738' },
  'NZE':   { label: 'Net Zero 2050 (NZE)',      colour: '#00703c' },
};

/**
 * Technology colours for charts.
 */
export const TECH_COLOURS = {
  'Solar PV':                            '#f4d03f',
  'Wind':                                '#5694ca',
  'Other low emissions power generation': '#85994b',
  'Low emissions power generation':       '#85994b',
  'Electric vehicles':                   '#d4351c',
  'Grid battery storage':                '#6f72af',
  'Electricity networks':                '#f47738',
  'Hydrogen technologies':               '#28a197',
  'Other uses':                          '#b1b4b6',
};

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
