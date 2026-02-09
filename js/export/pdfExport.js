/**
 * PDF export via jsPDF.
 * Serialises SVG map to PNG via canvas, includes charts and data table.
 * Context-aware: exports different content per active view.
 */

import { getState } from '../state.js';
import { getTopProducers, getWorldTotal, getCrossMineralScores } from '../api/dataCache.js';
import { formatNumber } from '../utils/formatters.js';
import { MINERALS, ALL_MINERALS_KEY, IEA_SCENARIOS } from '../config.js';
import { getMapSVG } from '../map/d3Map.js';
import { getChart } from '../charts/chartManager.js';
import { isIEAReady } from '../api/ieaDataLoader.js';

/**
 * Export a multi-page PDF report.
 */
export async function exportPDF() {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) {
    alert('jsPDF library not loaded.');
    return;
  }

  try {
    const activeView = getState('activeView');
    const mineral = getState('selectedMineral');
    const year = getState('selectedYear');
    const scenario = getState('selectedScenario');

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    if (activeView === 'demand') {
      await exportDemandPDF(doc, pageWidth, pageHeight, scenario);
    } else if (activeView === 'supply') {
      await exportSupplyPDF(doc, pageWidth, pageHeight, scenario);
    } else {
      await exportFactsheetPDF(doc, pageWidth, pageHeight, mineral, year, scenario);
    }

    // Footer on each page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(80, 90, 95);
      const source = isIEAReady()
        ? 'Source: BGS World Mineral Statistics & IEA Critical Minerals Data Explorer (CC BY 4.0)'
        : 'Source: BGS World Mineral Statistics';
      doc.text(`${source} | Page ${i} of ${pageCount}`, 15, pageHeight - 8);
    }

    const safeName = activeView === 'factsheet'
      ? (mineral === ALL_MINERALS_KEY ? 'Overview' : mineral)
      : activeView === 'demand' ? 'Demand_Outlook' : 'Supply_Risk';
    const filename = `UK_Critical_Minerals_${safeName}_${year}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('PDF export failed. See console for details.');
  }
}

async function exportFactsheetPDF(doc, pageWidth, pageHeight, mineral, year, scenario) {
  // Page 1: Title and map
  drawHeader(doc, pageWidth);

  doc.setTextColor(11, 12, 12);
  doc.setFontSize(16);

  if (mineral === ALL_MINERALS_KEY) {
    doc.text(`Critical Minerals Overview — Top Producing Countries — ${year}`, 15, 38);
  } else {
    doc.text(`${mineral} Production — ${year}`, 15, 38);
  }

  // Embed SVG map as PNG
  const mapSvg = getMapSVG();
  if (mapSvg) {
    try {
      const mapPng = await svgToPNG(mapSvg, 1600, 900);
      const imgWidth = pageWidth - 30;
      const imgHeight = (900 / 1600) * imgWidth;
      doc.addImage(mapPng, 'PNG', 15, 45, imgWidth, Math.min(imgHeight, pageHeight - 55));
    } catch (e) {
      doc.setFontSize(12);
      doc.text('Map capture unavailable', 15, 55);
    }
  }

  // Page 2: Charts
  doc.addPage();
  drawHeader(doc, pageWidth);

  const barChart = getChart('bar-chart');
  if (barChart) {
    try {
      const barImg = barChart.toBase64Image('image/png', 1);
      doc.addImage(barImg, 'PNG', 15, 30, (pageWidth - 30) / 2, 80);
    } catch (e) { /* skip */ }
  }

  const pieChart = getChart('pie-chart');
  if (pieChart) {
    try {
      const pieImg = pieChart.toBase64Image('image/png', 1);
      doc.addImage(pieImg, 'PNG', pageWidth / 2 + 5, 30, (pageWidth - 30) / 2, 80);
    } catch (e) { /* skip */ }
  }

  // IEA charts on factsheet
  if (isIEAReady() && mineral !== ALL_MINERALS_KEY) {
    const techChart = getChart('tech-breakdown-chart');
    const supplyChart = getChart('supply-concentration-chart');
    if (techChart || supplyChart) {
      doc.addPage();
      drawHeader(doc, pageWidth);
      doc.setTextColor(11, 12, 12);
      doc.setFontSize(14);
      doc.text(`IEA Projections — ${mineral} (${IEA_SCENARIOS[scenario]?.label || scenario})`, 15, 33);

      if (techChart) {
        try {
          const img = techChart.toBase64Image('image/png', 1);
          doc.addImage(img, 'PNG', 15, 40, (pageWidth - 30) / 2, 80);
        } catch (e) { /* skip */ }
      }
      if (supplyChart) {
        try {
          const img = supplyChart.toBase64Image('image/png', 1);
          doc.addImage(img, 'PNG', pageWidth / 2 + 5, 40, (pageWidth - 30) / 2, 80);
        } catch (e) { /* skip */ }
      }
    }
  }

  // Data table page
  doc.addPage();
  drawHeader(doc, pageWidth);
  doc.setTextColor(11, 12, 12);
  doc.setFontSize(14);

  if (mineral === ALL_MINERALS_KEY) {
    doc.text(`Top Producing Countries (Dominance Score) — ${year}`, 15, 33);
    renderOverviewTable(doc, year, pageWidth, pageHeight);
  } else {
    doc.text(`Top Producers — ${mineral} (${year})`, 15, 33);
    renderMineralTable(doc, mineral, year, pageWidth, pageHeight);
  }
}

async function exportDemandPDF(doc, pageWidth, pageHeight, scenario) {
  drawHeader(doc, pageWidth);
  doc.setTextColor(11, 12, 12);
  doc.setFontSize(16);
  doc.text(`Demand Outlook — ${IEA_SCENARIOS[scenario]?.label || scenario}`, 15, 38);

  // Scenario comparison chart
  const scenarioChart = getChart('scenario-comparison-chart');
  if (scenarioChart) {
    try {
      const img = scenarioChart.toBase64Image('image/png', 1);
      doc.addImage(img, 'PNG', 15, 45, pageWidth - 30, 100);
    } catch (e) { /* skip */ }
  }
}

async function exportSupplyPDF(doc, pageWidth, pageHeight, scenario) {
  drawHeader(doc, pageWidth);
  doc.setTextColor(11, 12, 12);
  doc.setFontSize(16);
  doc.text(`Supply & Risk Assessment — ${IEA_SCENARIOS[scenario]?.label || scenario}`, 15, 38);

  const gapChart = getChart('supply-demand-gap-chart');
  if (gapChart) {
    try {
      const img = gapChart.toBase64Image('image/png', 1);
      doc.addImage(img, 'PNG', 15, 45, pageWidth - 30, 100);
    } catch (e) { /* skip */ }
  }

  const dominanceChart = getChart('country-dominance-chart');
  if (dominanceChart) {
    doc.addPage();
    drawHeader(doc, pageWidth);
    try {
      const img = dominanceChart.toBase64Image('image/png', 1);
      doc.addImage(img, 'PNG', 15, 30, pageWidth - 30, 100);
    } catch (e) { /* skip */ }
  }
}

function drawHeader(doc, pageWidth) {
  doc.setFillColor(29, 112, 184);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('UK Critical Minerals Dashboard', 15, 15);
}

function renderMineralTable(doc, mineral, year, pageWidth, pageHeight) {
  const config = MINERALS[mineral];
  const top = getTopProducers(mineral, year, 20);
  const worldTotal = getWorldTotal(mineral, year);
  const unit = config?.unit || 'tonnes';

  let yPos = 42;
  doc.setFontSize(10);

  doc.setFont(undefined, 'bold');
  doc.text('Rank', 15, yPos);
  doc.text('Country', 35, yPos);
  doc.text(`Production (${unit})`, 120, yPos);
  doc.text('Share', 200, yPos);
  yPos += 2;
  doc.setDrawColor(11, 12, 12);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 6;

  doc.setFont(undefined, 'normal');
  for (let i = 0; i < top.length; i++) {
    doc.text(`${i + 1}`, 15, yPos);
    doc.text(top[i].countryName, 35, yPos);
    doc.text(formatNumber(top[i].quantity), 120, yPos);
    const share = worldTotal > 0 ? ((top[i].quantity / worldTotal) * 100).toFixed(1) + '%' : 'N/A';
    doc.text(share, 200, yPos);
    yPos += 7;

    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 25;
    }
  }
}

function renderOverviewTable(doc, year, pageWidth, pageHeight) {
  const scores = getCrossMineralScores(year);
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 20);

  let yPos = 42;
  doc.setFontSize(10);

  doc.setFont(undefined, 'bold');
  doc.text('Rank', 15, yPos);
  doc.text('Country', 35, yPos);
  doc.text('Score', 120, yPos);
  doc.text('Top-5 In', 160, yPos);
  doc.text('Ranked In', 200, yPos);
  yPos += 2;
  doc.setDrawColor(11, 12, 12);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 6;

  doc.setFont(undefined, 'normal');
  for (let i = 0; i < sorted.length; i++) {
    const [, data] = sorted[i];
    doc.text(`${i + 1}`, 15, yPos);
    doc.text(data.countryName, 35, yPos);
    doc.text(`${data.score}`, 120, yPos);
    doc.text(`${data.top5Count} minerals`, 160, yPos);
    doc.text(`${data.mineralCount} minerals`, 200, yPos);
    yPos += 7;

    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 25;
    }
  }
}

/**
 * Convert an SVG element to a PNG data URL via canvas.
 */
function svgToPNG(svgElement, width, height) {
  return new Promise((resolve, reject) => {
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);

    if (!svgString.includes('xmlns=')) {
      svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
