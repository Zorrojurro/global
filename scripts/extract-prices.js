const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function extract() {
  const priceListDir = path.join(__dirname, '../price list');
  const files = fs.readdirSync(priceListDir)
    .filter(f => f.toLowerCase().endsWith('.pdf'));

  const data = {};

  for (const file of files) {
    const filePath = path.join(priceListDir, file);
    const stat = fs.statSync(filePath);
    if (stat.size === 0) {
      console.log(`⚠  Skipped (empty): ${file}`);
      continue;
    }
    try {
      const buffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(buffer);
      const text = parsed.text.trim();
      if (!text) {
        console.log(`⚠  No text extracted (image-based PDF?): ${file}`);
        continue;
      }
      const brand = file.replace(/\.(pdf|PDF)$/, '');
      data[brand] = text.substring(0, 40000);
      console.log(`✓  ${file} — ${text.length.toLocaleString()} chars`);
    } catch (err) {
      console.log(`✗  ${file} — ${err.message}`);
    }
  }

  const outPath = path.join(__dirname, '../price-data.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));

  const totalChars = Object.values(data).reduce((s, t) => s + t.length, 0);
  console.log(`\nDone. ${Object.keys(data).length} price lists extracted.`);
  console.log(`Total characters: ${totalChars.toLocaleString()} (~${Math.round(totalChars / 4).toLocaleString()} tokens)`);
  console.log(`Saved to price-data.json`);
}

extract().catch(console.error);
