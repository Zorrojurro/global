import fs from 'fs';

// Totem metric HSS tap table → Shopify variant JSON, 10% margin.
// Isolate ONE verified table block: rows AFTER a "Size X Pitch ... Long Shank" header,
// up to the footnote, so we never mix tap series (HSS vs carbide reuse the same sizes).
// Columns: Standard | SF/RS (spiral flute) | SPPT | Long Shank A/C/D | Long Shank B
const data = JSON.parse(fs.readFileSync('price-data/totem.structured.json', 'utf8'));
const px = (n) => (Math.round(n * 1.1 * 100) / 100).toFixed(2);

const allRows = [];
for (const page of data.pages) for (const r of page.rows) allRows.push(r.line);

let capturing = false;
const rows = [];
for (const line of allRows) {
  if (/Size X Pitch/i.test(line) && /Long Shank/i.test(line)) { capturing = true; continue; }
  if (!capturing) continue;
  if (/Minimum Order|Only in BSW|^#/.test(line)) break;            // footnote ends the block
  const cells = line.split('\t').map((s) => s.trim());
  if (!/^\d+(\.\d+)? X \d+(\.\d+)? ?[#~*]?$/.test(cells[0])) continue;   // single-pitch sizes only
  const prices = cells.slice(1, 6).map((c) => {
    const m = c.replace(/[^\d.]/g, '');
    return c === '-' || m === '' ? null : parseFloat(m);
  });
  rows.push({ size: cells[0].replace(/[#~*]/g, '').replace(/\s+/g, ' ').trim(), prices });
}
const seen = new Set();
const uniq = rows.filter((r) => (seen.has(r.size) ? false : seen.add(r.size)));

function variants(colIdx, prefix) {
  return uniq.filter((r) => r.prices[colIdx] != null).map((r) => ({
    price: px(r.prices[colIdx]),
    sku: `TOTEM-${prefix}-M${r.size.replace(/ X /, 'x').replace(/\s/g, '')}`,
    optionValues: [{ optionName: 'Size', name: `M${r.size.replace(' X ', ' × ')}` }],
  }));
}

const out = { standard: variants(0, 'STD'), spiralFlute: variants(1, 'SF') };
fs.writeFileSync('price-data/_totem-variants.json', JSON.stringify(out, null, 2));
console.log(`block sizes: ${uniq.length} | Standard variants: ${out.standard.length} | Spiral Flute: ${out.spiralFlute.length}`);
console.log('sizes:', uniq.map((r) => r.size).join(', '));
