# HL vs eToro

Dashboard comparing Hyperliquid and eToro prices. The browser does **not** embed third-party candle hosts: Hyperliquid can be called directly or via `/api/hl`; **eToro candle URLs are only configured on the server** (Vercel env or Worker vars).

## eToro candle endpoints (required)

Copy `.env.example` and set full URLs to **your** HTTP endpoints that return the same JSON array shape the UI already expects (the previous Base44 functions are no longer referenced in code).

| Variable | Typical use |
|----------|-------------|
| `ETORO_CANDLES_NQ` | NQ / index candles |
| `ETORO_CANDLES_GOLD` | Gold |
| `ETORO_CANDLES_OIL` | Oil |
| `ETORO_CANDLES_NATGAS` | Natural gas |

**Vercel:** Project → Settings → Environment Variables → add all four, redeploy.

**Cloudflare Worker:** `wrangler.toml` `[vars]` or the dashboard → Variables for the same names.

## “Failed to fetch” on WiFi

Many networks block `api.hyperliquid.xyz`. Proxies in `api/` and `worker/` let the browser talk only to **your** deployment.

### Option A — Vercel (recommended)

1. Import this repo in [Vercel](https://vercel.com) (framework: Other; root: repo root).
2. Set the `ETORO_CANDLES_*` environment variables.
3. Deploy and open the `*.vercel.app` URL.

The app probes `/api/health`, then uses `/api/hl` and `/api/etoro/*` on the same origin.

### Option B — GitHub Pages + Cloudflare Worker

Pages cannot run `/api/*`. Deploy the worker:

```bash
cd worker
npx wrangler deploy
```

Configure the same `ETORO_CANDLES_*` variables on the worker, then open:

`https://YOURNAME.github.io/hl-vs-etoro/?proxy=https://YOUR_SUBDOMAIN.workers.dev`

Persist without the query string:

```js
localStorage.setItem("hlvs_proxy", "https://YOUR_SUBDOMAIN.workers.dev");
```
