#!/usr/bin/env node
/**
 * Price List Extractor
 *
 * Usage:
 *   npm run extract              → only re-process PDFs that changed
 *   npm run extract -- --all    → force re-process everything
 *   npm run extract -- --brand "Norton"  → re-process one brand
 *
 * Output: price-data/<brand-slug>.json + price-data/manifest.json
 */

const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const brandMap = require('./brand-map');

const PRICE_LIST_DIR = path.join(__dirname, '../price list');
const OUTPUT_DIR = path.join(__dirname, '../price-data');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

// ─── helpers ────────────────────────────────────────────────────────────────

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function fileHash(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buf).digest('hex');
}

function loadManifest() {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }
  return {};
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function cleanText(raw) {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')   // collapse blank lines
    .replace(/[ \t]{2,}/g, ' ')   // collapse spaces
    .trim();
}

// ─── core extract ───────────────────────────────────────────────────────────

async function extractBrand(pdfFile, brandName) {
  const filePath = path.join(PRICE_LIST_DIR, pdfFile);
  const stat = fs.statSync(filePath);

  if (stat.size === 0) {
    console.log(`  ⚠  Empty file, skipping: ${pdfFile}`);
    return null;
  }

  const buffer = fs.readFileSync(filePath);
  const parsed = await pdfParse(buffer);
  const text = cleanText(parsed.text);

  if (!text || text.length < 50) {
    console.log(`  ⚠  No readable text (image-based PDF?): ${pdfFile}`);
    console.log(`     → Manually add content to price-data/${slugify(brandName)}.json`);
    return null;
  }

  const outData = {
    brand: brandName,
    sourceFile: pdfFile,
    extractedAt: new Date().toISOString(),
    charCount: text.length,
    text,
  };

  const outPath = path.join(OUTPUT_DIR, slugify(brandName) + '.json');
  fs.writeFileSync(outPath, JSON.stringify(outData, null, 2));

  return text.length;
}

// ─── main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const forceAll = args.includes('--all');
  const brandArg = (() => {
    const i = args.indexOf('--brand');
    return i !== -1 ? args[i + 1]?.toLowerCase() : null;
  })();

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  const manifest = loadManifest();
  let processed = 0, skipped = 0, failed = 0;

  console.log('\n📋 GIS Price List Extractor\n');

  for (const [pdfFile, brandName] of Object.entries(brandMap)) {
    const filePath = path.join(PRICE_LIST_DIR, pdfFile);

    if (!fs.existsSync(filePath)) {
      console.log(`  ✗  File not found: ${pdfFile}`);
      failed++;
      continue;
    }

    // filter by --brand flag
    if (brandArg && !brandName.toLowerCase().includes(brandArg)) continue;

    const hash = fileHash(filePath);
    const slug = slugify(brandName);

    if (!forceAll && !brandArg && manifest[slug]?.hash === hash) {
      console.log(`  –  Unchanged: ${brandName}`);
      skipped++;
      continue;
    }

    process.stdout.write(`  ↻  ${brandName}… `);
    try {
      const chars = await extractBrand(pdfFile, brandName);
      if (chars !== null) {
        manifest[slug] = { hash, brandName, sourceFile: pdfFile, extractedAt: new Date().toISOString() };
        console.log(`${chars.toLocaleString()} chars → ${slug}.json`);
        processed++;
      } else {
        failed++;
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      failed++;
    }
  }

  saveManifest(manifest);

  console.log(`\n✅ Done — ${processed} extracted, ${skipped} unchanged, ${failed} failed`);
  if (failed > 0) console.log('   ↳ Failed entries need image OCR or manual data entry');
  console.log('');
}

main().catch(err => { console.error(err); process.exit(1); });
