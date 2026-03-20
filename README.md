# HL vs eToro

Dashboard comparing Hyperliquid and eToro prices.

## Why Hyperliquid loads but eToro sometimes doesn’t

- **Hyperliquid** uses their **public** REST API (`api.hyperliquid.xyz`) — the browser calls it **directly** (or via `/api/hl` on Vercel if you use the proxy).
- **eToro** has **no** equivalent public candle URL in this app. Candles come from **HTTP JSON** endpoints under `/functions/…` (the integration you started with). By default the app uses the same host as before; you can point it elsewhere.

Paths:

- `{BASE}/functions/etoroCandles`
- `{BASE}/functions/etoroGoldCandles`
- `{BASE}/functions/etoroOilCandles`
- `{BASE}/functions/etoroNatGasCandles`

**Override `BASE`** when you move off the default host:

### On Vercel (recommended)

1. Deploy this project.
2. In **Project → Settings → Environment Variables**, set **`ETORO_FUNCTIONS_BASE`** to the **origin** that serves those `/functions/…` routes on your infrastructure (e.g. `https://candles.internal.company.com`).
3. Redeploy.

Optional: override a single instrument with a full URL: `ETORO_CANDLES_NQ`, `ETORO_CANDLES_GOLD`, `ETORO_CANDLES_OIL`, `ETORO_CANDLES_NATGAS`.

### Static / GitHub Pages (no `/api`)

Set the base without redeploying HTML:

- Query: `?etoroBase=https://your-host`  
- Or once: `localStorage.setItem("hlvs_etoro_functions_base", "https://your-host")` then reload.

Or edit **`ETORO_FUNCTIONS_BASE`** in `index.html` (empty string by default).

### Cloudflare Worker

Set **`ETORO_FUNCTIONS_BASE`** (and optional `ETORO_CANDLES_*`) in wrangler `[vars]` or the dashboard, same as Vercel.

## WiFi / “Failed to fetch”

Use Vercel or the Worker so the browser talks to **your** origin; the server then calls Hyperliquid and your eToro base.
