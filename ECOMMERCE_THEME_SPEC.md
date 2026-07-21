# Horizon Theme — Branding Spec for Global Industrial Supplies

Apply these in **Shopify admin → Online Store → Themes → Horizon → Customize**.
Goal: match globaltoolbay.com (orange + navy, clean industrial look).

## Brand assets
- **Logo:** https://www.globaltoolbay.com/images/GIS_LOGO.png
- **Store name:** rename from "My Store 2" → **Global Industrial Supplies**
  (Settings → Store details → Store name. This also fixes Safety products that picked up the old vendor.)

## Colours (from globaltoolbay.com)
| Role | Hex |
|---|---|
| Primary (orange) | `#FF6B35` |
| Primary dark (hover) | `#E85A2A` |
| Primary light | `#FF8B5C` |
| Dark / headings (navy) | `#0F172A` |
| Secondary navy | `#1E293B` |
| Navy light | `#334155` |
| Page background | `#FFFFFF` |

In Horizon: **Theme settings → Colors**. Create a scheme:
- Background `#FFFFFF`, Text `#0F172A`
- Buttons/primary `#FF6B35`, button text `#FFFFFF`
- A dark scheme (footer/hero overlay): background `#0F172A`, text `#FFFFFF`, accent `#FF6B35`

## Typography (Theme settings → Typography)
- Headings: **Inter** (Bold/Extra-bold) — matches the site
- Body: **Inter** or **Roboto**, regular

## Header (Theme settings → Header)
- Upload the GIS logo (above). Logo width ~140–160px.
- Menu: **Main menu** (already set: Home + 6 categories).
- Enable sticky header; show cart + search icons.

## Homepage sections (top → bottom)
1. **Hero / image banner** — heading "Industrial Tools & Equipment, Bengaluru", subtext "Authorised dealer of Stanley, Norton, Addison, Totem & more — buy online or request a quote." Two buttons: "Shop products" (→ /collections/all), "Request a quote" (→ contact). Use navy overlay + orange button.
2. **Featured collections** — add the 6 collections (now have images). Title "Shop by category".
3. **Rich text / value props** (4 columns) — "100% genuine products", "Fast delivery", "Competitive trade pricing", "Expert support".
4. **Featured products** — pick a few from Cutting Tools / Abrasives.
5. **Contact strip / footer** — address: No 12, 1st Floor, M M Lane, SJP Road Cross, Bengaluru 560002 · Phone 080-41139305, +91 98801 69228 · WhatsApp 9880169228 · email globalindl.blr@gmail.com.

## Footer (Theme settings → Footer)
- Add business address + phones + email + WhatsApp.
- Link policy pages once created (Settings → Policies: Refund, Privacy, Terms, Shipping).

## Notes
- I can't edit the live theme via API (Shopify blocks live-theme writes), so the above is done in the Customize editor — but the menu, collection images, and catalog are already set via API.
- Hand Tools collection still needs an image (no hand-tools icon on the site yet).
- Product images are the biggest remaining visual win — sourced from `catalogue/*.pdf`.
