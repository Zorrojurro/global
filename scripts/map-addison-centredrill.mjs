import fs from 'fs';

// Addison Micro Grain Solid Carbide Centre Drill (Type A) → Shopify variants, 10% margin.
// Isolate ONE verified block: rows after the "Pilot Dia | Body Dia | OAL | List price" header
// (cols: pilotDia mm-k12 | bodyDia mm-h9 | OAL mm | Uncoated ₹ | Coated ₹), stop at next section.
const data = JSON.parse(fs.readFileSync('price-data/addison.structured.json', 'utf8'));
const px = (n) => (Math.round(n * 1.1 * 100) / 100).toFixed(2);

const allRows = [];
for (const page of data.pages) for (const r of page.rows) allRows.push(r.line);

let capturing = false;
const rows = [];
for (const line of allRows) {
  if (/Pilot Dia/i.test(line) && /List price/i.test(line)) { capturing = true; continue; }
  if (!capturing) continue;
  if (/mm - k12|Uncoated/i.test(line)) continue;                 // skip the unit/sub-header row
  const c = line.split('\t').map((s) => s.trim());
  // data row: pilot | body | OAL | uncoated | coated — all numeric
  if (c.length < 5 || !c.slice(0, 5).every((v) => /^\d+(\.\d+)?$/.test(v))) break;
  rows.push({ pilot: c[0], body: c[1], oal: c[2], uncoated: parseFloat(c[3]), coated: parseFloat(c[4]) });
}

const variants = [];
for (const r of rows) {
  const size = `Ø${r.pilot} × ${r.body}mm (OAL ${r.oal})`;
  variants.push({ price: px(r.uncoated), sku: `ADD-CD-${r.pilot}x${r.body}-U`, optionValues: [{ optionName: 'Size', name: size }, { optionName: 'Coating', name: 'Uncoated' }] });
  variants.push({ price: px(r.coated), sku: `ADD-CD-${r.pilot}x${r.body}-C`, optionValues: [{ optionName: 'Size', name: size }, { optionName: 'Coating', name: 'TiAlN Coated' }] });
}
fs.writeFileSync('price-data/_addison-centredrill-variants.json', JSON.stringify(variants, null, 2));
console.log(`Addison centre drills: ${rows.length} sizes → ${variants.length} variants`);
console.log('sizes:', rows.map((r) => `${r.pilot}x${r.body}`).join(', '));
console.log('sample:', JSON.stringify(variants.slice(0, 2)));
