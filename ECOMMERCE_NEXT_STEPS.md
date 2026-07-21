# E-Commerce — Next Session Plan (Cutting Tools depth + quote-only)

> **STATUS: ✅ COMPLETED.** Totem taps (80 SKUs), Addison centre drills (20 SKUs), and 12 quote-only
> products (3 each in Hand Tools / Power Tools / Measuring / Safety) all created as DRAFT.
> Catalog now: 17 products, ~138 SKUs, all 6 categories populated. See "Completion notes" at bottom.
>
> Goal (original): give **Cutting Tools** real depth (Totem taps + Addison drills) and make every
> category non-empty by setting the **data-less categories to quote-only**, for a genuine
> cross-category launch. All products created as **DRAFT**, price = list × **1.10**, rounded 2dp.

## Where we are (start of session recap)
- Store: "My Store 2" · `8vnn1i-qd.myshopify.com` · **trial** (can't sell until upgraded).
- 6 smart collections exist (auto-file by `productType`):
  - Cutting Tools `gid://shopify/Collection/470558834933`
  - Abrasives `gid://shopify/Collection/470558867701`
  - Hand Tools `gid://shopify/Collection/470558900469`
  - Power Tools `gid://shopify/Collection/470558933237`
  - Measuring Instruments `gid://shopify/Collection/470558966005`
  - Safety Equipment `gid://shopify/Collection/470558998773`
- Live (DRAFT) products: Norton Coated Fibre Disc (15 SKUs, Abrasives), CarboTec Carbide Ball Nose End Mill (11 SKUs, Cutting Tools).
- Structured price data: `price-data/*.structured.json` (from `scripts/extract-structured.js`).

## Pre-flight
1. Verify connector is live: call `get-shop-info`. If "Not connected" → reconnect Shopify connector AND restart the session (mid-session reconnects don't take effect until restart).
2. Confirm no duplicate products will be created (`search_products` for the vendor before bulk-creating).

## Task A — Totem HSS taps → Cutting Tools
Data: `price-data/totem.structured.json`. Row format = `size (M × pitch) | p1 | p2 | p3 | p4 | p5` where the 5 price columns are different tap *types*; `-` = not made in that size.

Steps:
1. Find the **header row(s)** near the top of the tap table to identify what p1..p5 are (e.g. Hand Tap / Machine Tap / Spiral Flute / Spiral Point / Roll). Do NOT guess — read the header.
2. Build **one product per tap type**, `productType: "Cutting Tools"`, `vendor: "Totem"`, option = `Size` (the M×pitch values), one variant per size that has a price (skip `-`).
3. Price = column value × 1.10, 2dp. SKU = generated (no mfr code in data), e.g. `TOTEM-HT-M3x0.5`.
4. Validate 3–4 prices against the source PDF (`price list/TOTEM_HSS_TAPS_Price_List.pdf`) before creating.

## Task B — Addison drills → Cutting Tools
Data: `price-data/addison.structured.json` (twist-drill section) — multi-column matrix `size | … | priceA | priceB`.

Steps:
1. Locate the **Parallel Shank Twist Drill** table + its header row; identify what each numeric column is (dia, length, and the 1–2 price columns — likely uncoated vs coated).
2. Build product "Addison HSS Parallel Shank Twist Drill", `productType: "Cutting Tools"`, `vendor: "Addison"`, option = `Diameter` (+ a `Coating` option only if two real price columns exist).
3. Price × 1.10, 2dp. SKU from Addison code if present, else generated.
4. Validate against `price list/Addison_Price_List.pdf`.

> Note: Emkay/Indian Tools have side-by-side tables that the parser merges on one row — they need a wider `COL_GAP` or x-region split in `extract-structured.js`. Defer until after Totem/Addison.

## Task C — Quote-only for data-less categories
Categories with no clean price data: **Hand Tools** (Stanley — graphical), **Power Tools**, **Measuring** (Kristeel broken; Baker graphical), **Safety**.

Steps:
1. Create a handful of representative products per category using **names only** (no reliable price). Sources: Stanley names are in the old `price-data/stanley.json` (hand tools: files, hammers, chisels, vices; power tools categories). Measuring: Kristeel steel rules/verniers/calipers. Safety: generic PPE (helmets, gloves, goggles).
2. Set correct `productType` (auto-files to its collection), `status: DRAFT`, tag `quote-only`, and put "Price on request — contact us" in the description. Price `0` placeholder until RFQ app hides it.
3. **User action (required for real quote UX):** install a "Request a Quote / Hide Price" app and configure it to hide price + show a quote button for `quote-only`-tagged products.

## Accuracy safeguards (do every time)
- Read each table's header before mapping columns; never assume column order.
- Spot-check 3–4 prices per product against the source PDF.
- Keep everything DRAFT; nothing goes ACTIVE until owner reviews.

## Open decisions to confirm with owner
- Totem: separate product per tap type (planned) vs one product with Type × Size options?
- Product images — source from brand catalogues (`catalogue/*.pdf`) or skip for launch?
- Which RFQ app to install for quote-only?

## Parallel owner tasks (gate actual selling — not blockers for catalog)
Upgrade to Basic · connect Razorpay/UPI · GST settings + invoice app · shipping zones · rename store to "Global Industrial Supplies".
