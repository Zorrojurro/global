#!/usr/bin/env node
/**
 * Layout-aware Price List Extractor
 *
 * Unlike extract.js (which uses pdf-parse and flattens tables into an unusable
 * blob), this reads each text fragment's x/y position via pdf2json and rebuilds
 * the original table rows — so a price stays aligned with its product code.
 *
 * Usage:
 *   node scripts/extract-structured.js --brand norton
 *   node scripts/extract-structured.js --all
 *   node scripts/extract-structured.js --brand kristeel --preview   (print rows, don't write)
 *
 * Output: price-data/<brand-slug>.structured.json
 *   { brand, sourceFile, pages: [ { page, rows: [ { y, cells: [{x,text}], line } ] } ] }
 *   `line` joins cells with a tab when there's a column-sized x gap between them.
 */

const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');
const brandMap = require('./brand-map');

const PRICE_LIST_DIR = path.join(__dirname, '../price list');
const OUTPUT_DIR = path.join(__dirname, '../price-data');

// Tuning knobs — pdf2json coordinates are in page grid units (~1/16 inch).
const ROW_TOL = 0.45;   // fragments within this y-distance belong to the same row
const COL_GAP = 1.6;    // x gap larger than this starts a new column in `line`

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function decode(t) {
  try { return decodeURIComponent(t); } catch { return t; }
}

function parsePDF(filePath) {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();
    parser.on('pdfParser_dataError', (e) => reject(e.parserError || e));
    parser.on('pdfParser_dataReady', (data) => resolve(data));
    parser.loadPDF(filePath);
  });
}

function buildRows(page) {
  // Collect fragments: { x, y, text }
  const frags = [];
  for (const t of page.Texts || []) {
    const text = (t.R || []).map((r) => decode(r.T)).join('').trim();
    if (text) frags.push({ x: t.x, y: t.y, text });
  }
  // Sort top-to-bottom, then left-to-right
  frags.sort((a, b) => (a.y - b.y) || (a.x - b.x));

  // Cluster into rows by y proximity
  const rows = [];
  let cur = null;
  for (const f of frags) {
    if (!cur || Math.abs(f.y - cur.y) > ROW_TOL) {
      cur = { y: f.y, cells: [] };
      rows.push(cur);
    }
    cur.cells.push({ x: f.x, text: f.text });
  }

  // Within each row sort by x and build a column-aware line string
  for (const row of rows) {
    row.cells.sort((a, b) => a.x - b.x);
    let line = '';
    let prevRight = null;
    for (const c of row.cells) {
      if (prevRight !== null && c.x - prevRight > COL_GAP) line += '\t';
      else if (line) line += ' ';
      line += c.text;
      prevRight = c.x;
    }
    row.line = line.trim();
    row.y = Math.round(row.y * 100) / 100;
  }
  return rows;
}

async function processBrand(pdfFile, brandName, { preview }) {
  const filePath = path.join(PRICE_LIST_DIR, pdfFile);
  if (!fs.existsSync(filePath)) {
    console.log(`  ✗  Not found: ${pdfFile}`);
    return;
  }
  const data = await parsePDF(filePath);
  const pages = (data.Pages || []).map((p, i) => ({ page: i + 1, rows: buildRows(p) }));

  if (preview) {
    const first = pages[0];
    console.log(`\n=== ${brandName} — page 1 (${first?.rows.length || 0} rows) ===`);
    for (const r of (first?.rows || []).slice(0, 40)) console.log(r.line.replace(/\t/g, ' | '));
    return;
  }

  const out = {
    brand: brandName,
    sourceFile: pdfFile,
    extractedAt: new Date().toISOString(),
    pageCount: pages.length,
    pages,
  };
  const outPath = path.join(OUTPUT_DIR, slugify(brandName) + '.structured.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  const rowCount = pages.reduce((n, p) => n + p.rows.length, 0);
  console.log(`  ✓  ${brandName}: ${pages.length} pages, ${rowCount} rows → ${slugify(brandName)}.structured.json`);
}

async function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const preview = args.includes('--preview');
  const bi = args.indexOf('--brand');
  const brandArg = bi !== -1 ? (args[bi + 1] || '').toLowerCase() : null;

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  const entries = Object.entries(brandMap).filter(([, name]) =>
    all ? true : brandArg ? name.toLowerCase().includes(brandArg) : false
  );
  if (entries.length === 0) {
    console.log('Specify --brand <name> or --all.');
    return;
  }

  console.log('\n📐 Structured Price List Extractor\n');
  for (const [pdfFile, brandName] of entries) {
    try {
      await processBrand(pdfFile, brandName, { preview });
    } catch (e) {
      console.log(`  ✗  ${brandName}: ${e.message || e}`);
    }
  }
  console.log('');
}

main().catch((e) => { console.error(e); process.exit(1); });
