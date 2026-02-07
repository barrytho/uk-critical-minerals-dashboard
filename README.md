# UK Critical Minerals Dashboard

Printable fact-sheet dashboard for 20 UK critical minerals, built on BGS World Mineral Statistics data (2014-2023).

**[Live demo](https://cm-interactive-map.web.app)**

## Features

- **Per-mineral fact sheets** — choropleth map, top-10 bar chart, production-share doughnut, sortable data table, and multi-country comparison line chart for each mineral
- **"All Minerals — Overview"** — cross-mineral dominance scoring (rank-based, 20 pts to #1) showing which countries dominate global critical mineral production
- **D3 Equal Earth map** — SVG choropleth with 7-step sequential blue scale, tooltip on hover, responsive resize
- **Chart.js charts** — bar, doughnut, and multi-series line charts with GOV.UK colour palette
- **Country comparison** — select up to 5 countries to compare production trends over the full decade
- **Asset downloads** — individual SVG (map) and PNG (charts) download buttons on each visualisation
- **PDF export** — multi-page jsPDF export with all fact-sheet assets rendered as images
- **CSV export** — full data table export, including aggregated overview data
- **Print-optimised layout** — `@media print` styles for clean single-page printout

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Vanilla JavaScript (ES Modules, no build step) |
| Map | [D3.js 7](https://d3js.org/) + [d3-geo-projection 4](https://github.com/d3/d3-geo-projection) (Equal Earth) |
| Charts | [Chart.js 4.4.1](https://www.chartjs.org/) |
| Boundaries | [world-atlas 2.0.2](https://github.com/topojson/world-atlas) + [topojson-client 3.1.0](https://github.com/topojson/topojson-client) |
| PDF | [jsPDF 2.5.1](https://github.com/parallax/jsPDF) |
| Hosting | [Firebase Hosting](https://firebase.google.com/products/hosting) |
| Design | [GOV.UK Design System](https://design-system.service.gov.uk/) colours and typography conventions |

All dependencies are loaded via CDN — no `npm install` or build step required.

## Data Source

**[BGS World Mineral Statistics OGC API](https://ogcapi.bgs.ac.uk/collections/world-mineral-statistics)**

- ~13,400 production records across 20 minerals and 10 years (2014-2023)
- CQL-filtered GeoJSON responses, paginated with a 5,000-record page limit
- 19 unique API commodities (Tantalum and Niobium share one; Silicon has no data)
- All data fetched client-side on load with throttled concurrency (max 6 parallel requests)

## Architecture

```
User selects mineral/year
        │
        ▼
  ┌──────────┐     pub/sub      ┌──────────────┐
  │  state.js │ ──────────────► │  subscribers  │
  │  (reactive│                 │  (map, charts,│
  │   store)  │                 │   table, tabs)│
  └──────────┘                  └──────────────┘
        ▲
        │ on load
  ┌──────────┐
  │ dataLoader│──► bgsClient ──► BGS OGC API
  │ (bulk     │         │
  │  prefetch)│         ▼
  │           │    dataCache
  │           │   (3 indexes:
  │           │    byMineral,
  │           │    byCountry,
  │           │    byYear)
  └──────────┘
```

- **Reactive pub/sub state** — `state.js` notifies all subscribers when `selectedMineral`, `selectedYear`, or `activeTab` changes
- **Bulk pre-fetch** — all mineral data fetched on page load with throttled concurrency (6 requests at a time)
- **Triple-indexed cache** — data indexed by mineral, by country (ISO 3166-1 alpha-3), and by year for fast lookups
- **Cross-mineral dominance scoring** — ranks countries across all minerals using a points system (20 pts for #1, 19 for #2, etc.)
- **Country matching** — always via ISO3 alpha codes, never by name string

## Project Structure

```
.
├── index.html                  # Single-page app shell
├── firebase.json               # Firebase Hosting config
├── .firebaserc                 # Firebase project alias
├── css/
│   ├── main.css                # GOV.UK base styles, header, footer
│   ├── factsheet.css           # Fact-sheet grid layout + @media print
│   ├── components.css          # Buttons, tabs, tables, info banners
│   └── charts.css              # Chart container sizing
└── js/
    ├── app.js                  # Entry point — wires all modules
    ├── config.js               # Mineral-to-API mapping, constants, colours
    ├── state.js                # Reactive pub/sub store
    ├── api/
    │   ├── bgsClient.js        # BGS OGC API fetch with CQL filtering
    │   ├── dataCache.js        # Triple-indexed cache + dominance scoring
    │   └── dataLoader.js       # Bulk pre-fetch with progress tracking
    ├── map/
    │   ├── d3Map.js            # D3 Equal Earth SVG choropleth + legend
    │   └── countryBoundaries.js # world-atlas TopoJSON loader
    ├── charts/
    │   ├── chartManager.js     # Chart lifecycle (create/update/destroy)
    │   ├── barChart.js         # Top-10 producers horizontal bar chart
    │   ├── pieChart.js         # Production share doughnut chart
    │   ├── lineChart.js        # 10-year trend line chart
    │   └── comparisonChart.js  # Multi-country comparison line chart
    ├── panels/
    │   ├── controlPanel.js     # Mineral + year dropdowns in header
    │   └── tabPanel.js         # Data Table / Comparison tab switching
    ├── export/
    │   ├── assetExport.js      # Per-asset SVG/PNG download buttons
    │   ├── pdfExport.js        # Multi-page jsPDF export (SVG→PNG→PDF)
    │   └── csvExport.js        # CSV export with overview support
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

## Deployment

Deployed to Firebase Hosting:

```bash
firebase deploy --only hosting
```

Live at: [https://cm-interactive-map.web.app](https://cm-interactive-map.web.app)

## Key Design Decisions

**D3 over Leaflet** — The original v1 used Leaflet with CartoDB tiles and a bubble overlay. v2 switched to a D3 Equal Earth SVG choropleth because: (1) a static projection suits a printable fact sheet better than an interactive slippy map, (2) SVG export is straightforward, (3) no tile-server dependency.

**Rank-based dominance scoring** — The "All Minerals" overview scores countries by rank position (20 pts for #1, 19 for #2, ...) rather than raw production volumes. This prevents minerals measured in large tonnages (e.g. manganese ore) from overshadowing those measured in kilograms (e.g. PGMs).

**Fact-sheet layout** — Each mineral gets a self-contained, printable page with map, charts, and data table — designed to be useful as a standalone briefing document.

## Data Notes

- **Silicon** — Listed as a UK critical mineral but has zero production records in the BGS dataset. The dashboard shows an info banner when selected.
- **Tantalum / Niobium** — Share the BGS commodity `tantalum and niobium minerals`. Both minerals display the same underlying data with a note explaining the shared source.
- **PGMs** — Platinum Group Metals production is reported in **kilograms**, not tonnes. Charts and tables display the correct unit.

## Licence

[MIT](https://opensource.org/licenses/MIT)
