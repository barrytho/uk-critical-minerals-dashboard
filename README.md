# UK Critical Minerals Dashboard v2.0

Forward-looking intelligence platform for 20 UK critical minerals, combining BGS World Mineral Statistics (2014-2023) with IEA Critical Minerals Data Explorer projections (to 2050) across three energy scenarios.

**[Live demo](https://cm-interactive-map.web.app)**

## What's New in v2.0

- **IEA data integration** — demand projections, supply forecasts, technology breakdowns, and concentration analysis from the IEA Critical Minerals Data Explorer (CC BY 4.0)
- **Three IEA scenarios** — STEPS (Stated Policies), APS (Announced Pledges), and NZE (Net Zero by 2050) with scenario toggle and explanation panel
- **Three-view navigation** — Fact Sheet, Demand Outlook, and Supply & Risk views
- **D3 Sankey diagram** — mineral-to-technology flow visualisation showing which minerals are needed for which clean energy sectors
- **Demand fan chart** — D3 area chart showing 2024 base demand fanning into scenario ribbons to 2050
- **Supply concentration heatmap** — D3 heatmap of minerals x years coloured by top-3 mining share
- **HHI badges** — Herfindahl-Hirschman Index supply concentration indicators on fact sheets (red/amber/green)
- **IEA growth badges** — demand growth multiplier badges (e.g. "7.9x by 2050") per mineral
- **Scenario comparison charts** — grouped bar charts comparing demand across minerals and scenarios
- **Supply-demand gap analysis** — paired bars showing mining supply vs total demand per mineral
- **Country dominance chart** — which countries dominate supply across multiple minerals
- **Enhanced exports** — view-aware PDF and CSV exports including IEA projection data

## Features

### Fact Sheet View
- **Per-mineral fact sheets** — choropleth map, top-10 bar chart, production-share doughnut, sortable data table, and multi-country comparison line chart
- **IEA projections row** — demand fan chart, technology breakdown, and supply concentration for minerals with IEA data
- **HHI + growth badges** — supply concentration index and demand growth indicators on the title bar
- **"All Minerals — Overview"** — cross-mineral dominance scoring showing which countries dominate global production

### Demand Outlook View
- **Sankey diagram** — mineral-to-technology flows (Solar PV, Wind, EV, Battery storage, Electricity networks, Hydrogen)
- **Scenario comparison** — grouped bar chart comparing 2024 vs 2030 vs 2050 demand by mineral
- **Growth summary table** — sortable table with demand multipliers, highlighting fastest-growing minerals

### Supply & Risk View
- **Supply-demand gap** — paired bars showing mining supply vs demand per scenario
- **Concentration heatmap** — minerals x years coloured by supply concentration
- **Country dominance** — horizontal bar chart of countries ranked by multi-mineral supply dominance

### Core Features
- **D3 Equal Earth map** — SVG choropleth with 7-step sequential blue scale, tooltip, responsive resize
- **Chart.js charts** — bar, doughnut, line, stacked bar, and horizontal bar charts with GOV.UK palette
- **Country comparison** — select up to 5 countries to compare production trends over the decade
- **Asset downloads** — individual SVG (map) and PNG (charts) download buttons
- **PDF export** — multi-page jsPDF export, context-aware per active view
- **CSV export** — full data export including IEA demand/supply projections
- **Print-optimised layout** — `@media print` styles for clean single-page printout

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Vanilla JavaScript (ES Modules, no build step) |
| Map & Viz | [D3.js 7](https://d3js.org/) + [d3-geo-projection 4](https://github.com/d3/d3-geo-projection) + [d3-sankey 0.12.3](https://github.com/d3/d3-sankey) |
| Charts | [Chart.js 4.4.1](https://www.chartjs.org/) |
| Boundaries | [world-atlas 2.0.2](https://github.com/topojson/world-atlas) + [topojson-client 3.1.0](https://github.com/topojson/topojson-client) |
| PDF | [jsPDF 2.5.1](https://github.com/parallax/jsPDF) |
| Preprocessing | Python 3 + [openpyxl](https://openpyxl.readthedocs.io/) (Excel-to-JSON) |
| Hosting | [Firebase Hosting](https://firebase.google.com/products/hosting) |
| Design | [GOV.UK Design System](https://design-system.service.gov.uk/) colours and typography conventions |

All browser dependencies loaded via CDN — no `npm install` or build step required.

## Data Sources

### BGS World Mineral Statistics
**[OGC API](https://ogcapi.bgs.ac.uk/collections/world-mineral-statistics)**
- ~13,400 production records across 20 minerals and 10 years (2014-2023)
- CQL-filtered GeoJSON responses, paginated with 5,000-record page limit
- 19 unique API commodities (Tantalum/Niobium share one; Silicon has no data)
- All data fetched client-side on load with throttled concurrency (max 6 parallel requests)

### IEA Critical Minerals Data Explorer
**[Data Explorer](https://www.iea.org/data-and-statistics/data-tools/critical-minerals-data-explorer)** (CC BY 4.0)
- Preprocessed from Excel to `data/iea.json` (~135KB) via `scripts/convert-iea-data.py`
- Total demand by mineral + technology sector (6 key minerals)
- Mining + refining supply by country (6 key minerals)
- Cleantech demand for 38 minerals across 3 scenarios to 2050
- Per-technology breakdowns for 6 clean energy sectors
- 14 of 20 BGS minerals have corresponding IEA demand data

## Architecture

```
User selects mineral/year/scenario/view
        │
        ▼
  ┌──────────┐     pub/sub      ┌──────────────┐
  │  state.js │ ──────────────► │  subscribers  │
  │  (reactive│                 │  (map, charts,│
  │   store)  │                 │  views, table)│
  └──────────┘                  └──────────────┘
        ▲                              ▲
        │ on load                      │ on IEA ready
  ┌──────────┐                   ┌───────────┐
  │ dataLoader│──► bgsClient     │ieaDataLoader│
  │ (bulk     │    ──► BGS API   │  ──► iea.json│
  │  prefetch)│         │        │      │       │
  │           │         ▼        │      ▼       │
  │           │    dataCache     │  IEA cache   │
  └──────────┘   (3 indexes)    └───────────┘
```

- **Reactive pub/sub state** — `state.js` manages `selectedMineral`, `selectedYear`, `selectedScenario`, `activeView`, `ieaDataReady`
- **View routing** — `viewRouter.js` shows/hides fact sheet, demand, and supply view containers
- **BGS bulk pre-fetch** — all mineral data fetched on page load, triple-indexed by mineral/country/year
- **IEA lazy loading** — `data/iea.json` loaded in background after BGS data; views render when ready
- **Mineral mapping** — `BGS_TO_IEA` in `config.js` links BGS mineral names to IEA keys

## Project Structure

```
.
├── index.html                  # Single-page app shell (3 views)
├── firebase.json               # Firebase Hosting config
├── .firebaserc                 # Firebase project alias
├── data/
│   └── iea.json                # Preprocessed IEA data (generated)
├── scripts/
│   └── convert-iea-data.py     # Excel-to-JSON preprocessor
├── css/
│   ├── main.css                # GOV.UK base styles, header, footer
│   ├── views.css               # Nav bar, control bar, scenario toggle, view containers
│   ├── factsheet.css           # Fact-sheet grid, IEA row, badges, @media print
│   ├── components.css          # Buttons, tabs, tables, info banners
│   ├── charts.css              # Chart container sizing
│   ├── demand.css              # Demand view layout, Sankey, growth table
│   └── supply.css              # Supply view layout, heatmap, HHI legend
└── js/
    ├── app.js                  # Entry point — wires all modules
    ├── config.js               # Mineral mapping, BGS_TO_IEA, IEA_SCENARIOS, colours
    ├── state.js                # Reactive pub/sub store
    ├── api/
    │   ├── bgsClient.js        # BGS OGC API fetch with CQL filtering
    │   ├── dataCache.js        # Triple-indexed cache + dominance scoring
    │   ├── dataLoader.js       # Bulk pre-fetch with progress tracking
    │   └── ieaDataLoader.js    # IEA JSON loader + accessor functions
    ├── map/
    │   ├── d3Map.js            # D3 Equal Earth SVG choropleth + legend
    │   └── countryBoundaries.js # world-atlas TopoJSON loader
    ├── charts/
    │   ├── chartManager.js     # Chart lifecycle (create/update/destroy)
    │   ├── barChart.js         # Top-10 producers horizontal bar chart
    │   ├── pieChart.js         # Production share doughnut chart
    │   ├── lineChart.js        # 10-year trend line chart
    │   ├── comparisonChart.js  # Multi-country comparison line chart
    │   ├── hhi.js              # HHI computation + badge rendering
    │   ├── demandFanChart.js   # D3 demand projection fan chart
    │   ├── techBreakdownChart.js    # Technology demand stacked bar
    │   ├── supplyConcentrationChart.js # Supply by country bar
    │   ├── scenarioComparisonChart.js  # Scenario comparison grouped bar
    │   ├── techDemandSankey.js      # D3 Sankey: minerals → technologies
    │   ├── demandGrowthTable.js     # Sortable demand growth table
    │   ├── concentrationHeatmap.js  # D3 supply concentration heatmap
    │   ├── supplyDemandGapChart.js  # Supply vs demand gap chart
    │   └── countryDominanceChart.js # Country multi-mineral dominance
    ├── views/
    │   ├── viewRouter.js       # Show/hide view containers
    │   ├── factsheetView.js    # Fact sheet IEA chart orchestration
    │   ├── demandView.js       # Demand Outlook view orchestration
    │   └── supplyView.js       # Supply & Risk view orchestration
    ├── panels/
    │   ├── navBar.js           # 3-view navigation bar
    │   ├── controlPanel.js     # Mineral + year dropdowns
    │   └── tabPanel.js         # Data Table / Comparison tab switching
    ├── export/
    │   ├── assetExport.js      # Per-asset SVG/PNG download buttons
    │   ├── pdfExport.js        # View-aware multi-page PDF export
    │   └── csvExport.js        # View-aware CSV export
    └── utils/
        ├── colours.js          # Choropleth colour scale helpers
        ├── formatters.js       # Number/unit formatting
        └── isoCountries.js     # ISO 3166-1 alpha-3 ↔ name mapping
```

## Local Development

No build step — just serve the directory:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

### Regenerating IEA Data

If you have an updated `CM_Data_Explorer.xlsx` from the IEA:

```bash
pip install openpyxl
python3 scripts/convert-iea-data.py
```

This reads `~/Downloads/CM_Data_Explorer.xlsx` and outputs `data/iea.json`.

## Deployment

Deployed to Firebase Hosting:

```bash
firebase deploy --only hosting
```

Live at: [https://cm-interactive-map.web.app](https://cm-interactive-map.web.app)

## Key Design Decisions

**D3 over Leaflet** — v1 used Leaflet with CartoDB tiles. v2 uses a D3 Equal Earth SVG choropleth because: (1) a static projection suits a printable fact sheet, (2) SVG export is straightforward, (3) no tile-server dependency.

**Preprocess Excel to JSON** — IEA data is converted offline to a single static JSON file rather than parsing Excel in the browser. This keeps the frontend dependency-free and the JSON (~135KB) loads instantly.

**Three views, not four** — Fact Sheet (enhanced with IEA), Demand Outlook, and Supply & Risk. Keeps navigation simple while covering the full analysis pipeline.

**Lazy IEA loading** — IEA data loads in the background after the BGS API data. The fact sheet is immediately usable; IEA visualisations appear when ready.

**Rank-based dominance scoring** — The "All Minerals" overview scores countries by rank position (20 pts for #1, 19 for #2, ...) rather than raw volumes. Prevents minerals in large tonnages from overshadowing those in kilograms.

**HHI for concentration** — Herfindahl-Hirschman Index (sum of squared market shares x 10,000) provides a standard metric for supply concentration: >2500 highly concentrated, 1500-2500 moderate, <1500 competitive.

## Data Notes

- **Silicon** — Listed as a UK critical mineral but has zero production records in the BGS dataset. The dashboard shows an info banner when selected.
- **Tantalum / Niobium** — Share the BGS commodity `tantalum and niobium minerals`. Both display the same data with a note.
- **PGMs** — Platinum Group Metals production is reported in **kilograms**, not tonnes.
- **Graphite** — IEA reports "Battery-grade graphite" which maps to BGS "Graphite" (different scope).
- **14 of 20 BGS minerals** have IEA demand data. Minerals without IEA data (Antimony, Beryllium, Bismuth, Tin, Tungsten, Titanium) show BGS production data only.

## Licence

[MIT](https://opensource.org/licenses/MIT)

Data: BGS World Mineral Statistics (Open Government Licence) and IEA Critical Minerals Data Explorer (CC BY 4.0).
