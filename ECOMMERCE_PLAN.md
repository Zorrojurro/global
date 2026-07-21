# Global Industrial Supplies — E-Commerce Implementation Plan

**Platform:** Shopify (Basic plan)
**Model:** Hybrid — online checkout for standard items + "Request a Quote" (RFQ) for bulk/B2B
**Approach:** Start small (~30 key SKUs), grow from existing brand price lists
**Status:** Store created from preview `8c3203c2-97de-4e22-a4e9-004cdbe0a71c`

---

## ⛔ Blocker — do this first

The Shopify connector's authorization was invalidated when the new store was created.
**Action (you):** Reconnect/re-authorize the **Shopify** connector in Claude's connector settings,
log into the new store, and approve access. Then I can verify with `get-shop-info` and execute Phases 1–2 directly.

---

## What I can do via the connector (once reconnected)
- Create/update products, set prices, SKUs, vendor (brand), product type
- Create collections and assign products
- Upload product images to Shopify CDN
- Create discount codes
- Read/manage orders, customers, inventory
- Run sales analytics (ShopifyQL)
- Anything else via Admin GraphQL (metafields, pages, markets, etc.)

## What you must do (I can't — requires your account/billing/approval)
- Reconnect the connector (above)
- Choose & confirm Shopify Basic plan (billing)
- Install apps from the Shopify App Store (RFQ, GST invoicing)
- Set up Razorpay payment gateway (enter bank/KYC details)
- Connect the domain (DNS)

---

## Phase 1 — Store foundation (India-ready)

| Task | Owner |
|---|---|
| Confirm Shopify Basic plan | You |
| Set currency = INR, timezone = IST, country = India | Me (verify) / You |
| Razorpay or Cashfree payment gateway + UPI | You (KYC) |
| GST tax settings (CGST/SGST/IGST) | You + Me |
| GST-compliant invoice app (e.g. "GST Invoice + Reports") | You (install) |
| Shipping zones: Bengaluru → Karnataka → Rest of India | Me/You |
| Policy pages: Returns, Privacy, Terms, Shipping | Me (draft) |
| Business info: address, 3 phone numbers, email, WhatsApp | Me |

## Phase 2 — Catalog structure + initial ~30 SKUs

**Collections (by category):**
- Cutting Tools (HSS & Carbide) — Addison, Indian Tools, Miranda/Dormer, Totem, Emkay, RR
- Abrasives — Norton, CarboTec
- Hand Tools — Stanley
- Power Tools — Stanley / DeWalt
- Measuring Instruments — Kristeel, Baker
- Safety Equipment — (smart helmet, PPE)

**Also tag by brand** (vendor field) so customers can filter by brand — mirrors your current site's brand-first browsing.

**Initial SKUs:** I parse ~30 best-sellers from the price-list data in `price-data/*.json`
(raw extracted text — I'll structure each into title, SKU, price, description, brand, category).
We launch lean, then expand brand-by-brand.

**Data reality:** `price-data/` holds full-text PDF dumps, not clean rows. So catalog build = a parsing
step per brand. For the first ~30 I'll curate carefully; for scale-up we improve `scripts/extract.js`
into a structured parser → bulk product import.

## Phase 3 — The "both" model (checkout + quote)
- Online checkout: works out of the box for in-stock, fixed-price items
- RFQ: install a "Request a Quote / Hide Price" app → bulk buyers submit a quote cart instead of paying
- Route quote submissions to email + WhatsApp (matches current inquiry flow)
- Optional: B2B price tiers / customer-specific pricing later

## Phase 4 — Launch + connect to existing site
- Decide: **keep `globaltoolbay.com` as marketing/SEO site** with "Shop Now" → `shop.globaltoolbay.com`
  (recommended — preserves current SEO), **or** full migration
- Add Shop nav/CTA on current site; set up redirects
- Test full purchase + full quote flow end-to-end before going public

## Phase 5 — Grow traffic (ties into the SEO goal)
- Each product = its own indexable page → rank for "Norton abrasives price", "Kristeel steel rule", etc.
  (solves the single-page limitation of the current site)
- **Google Shopping feed** (free product listings) — new traffic channel
- Abandoned-cart recovery, customer reviews, email capture
- Submit new product URLs to Google Search Console

---

## Immediate next steps
1. **You:** reconnect the Shopify connector
2. **Me:** verify store, set up collections, draft policy pages
3. **Me:** parse first ~30 SKUs from `price-data/` and create them
4. **You:** install RFQ + GST apps, set up Razorpay
5. Test → connect domain → launch
