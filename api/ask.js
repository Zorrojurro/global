const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Loaded once per cold start, cached in memory after
let priceContext = null;

function buildPriceContext() {
  if (priceContext !== null) return priceContext;

  const dataDir = path.join(process.cwd(), 'price-data');
  if (!fs.existsSync(dataDir)) {
    priceContext = '';
    return priceContext;
  }

  const files = fs.readdirSync(dataDir)
    .filter(f => f.endsWith('.json') && f !== 'manifest.json');

  const sections = [];
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
      if (data.text) {
        sections.push(`=== ${data.brand} ===\n${data.text}`);
      }
    } catch {
      // skip malformed files
    }
  }

  priceContext = sections.join('\n\n');
  return priceContext;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { question } = req.body || {};
  if (!question?.trim()) return res.status(400).json({ error: 'No question provided' });

  const context = buildPriceContext();

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    system: [
      {
        type: 'text',
        text: `You are a pricing assistant for Global Industrial Supplies, Bengaluru — an industrial tools and equipment shop. You help staff quickly answer customer price queries over the phone.

Guidelines:
- Be brief and direct — 1 to 2 sentences
- State the brand, product name, and price clearly
- If a price range exists, give it
- If you cannot find the exact item, say so and suggest the closest match
- Never make up prices — only answer from the data below
- Speak naturally, as if helping someone on a phone call

Price list data:
${context}`,
        cache_control: { type: 'ephemeral' }
      }
    ],
    messages: [{ role: 'user', content: question }]
  });

  res.json({ answer: message.content[0].text });
};
