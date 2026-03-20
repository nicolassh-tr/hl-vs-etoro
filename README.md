# HL vs eToro

Static dashboard comparing Hyperliquid and eToro prices.

## “Failed to fetch” on WiFi

Many networks block direct browser access to `api.hyperliquid.xyz` or `*.base44.app`. This repo includes **server-side proxies** so your browser only talks to **your** deployment (usually allowed).

### Option A — Vercel (recommended)

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com) (framework: Other; root: repo root).
3. Deploy. Open the `*.vercel.app` URL.

The app calls `/api/health` first; if it succeeds, all market data goes through `/api/hl` and `/api/etoro/*` on the same origin, which bypasses typical WiFi blocks.

### Option B — GitHub Pages + Cloudflare Worker

GitHub Pages cannot run `/api/*`. Deploy the worker in `worker/`:

```bash
cd worker
npx wrangler deploy
```

Then open the site with your worker URL (no trailing slash):

`https://YOURNAME.github.io/hl-vs-etoro/?proxy=https://hl-vs-etoro-proxy.YOUR_SUBDOMAIN.workers.dev`

To persist the proxy without the query string:

```js
localStorage.setItem("hlvs_proxy", "https://hl-vs-etoro-proxy.YOUR_SUBDOMAIN.workers.dev");
```

Then reload.
