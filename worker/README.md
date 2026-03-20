# Cloudflare Worker proxy

Deploy once, then point GitHub Pages at it with `?proxy=https://<your-subdomain>.workers.dev`.

## Prerequisites

- [Node.js LTS](https://nodejs.org/) (includes `npx`)
- Free [Cloudflare](https://dash.cloudflare.com/) account

## Deploy

```bash
cd worker
npx wrangler@3 login
npx wrangler@3 deploy
```

Wrangler prints a URL like **`https://hl-vs-etoro-proxy.<your-subdomain>.workers.dev`**.

`wrangler.toml` already sets **`ETORO_INSTRUMENT_OIL=17`** so **oil** uses `candle.etoro.com` server-side. Add `ETORO_INSTRUMENT_NQ`, etc. under `[vars]` or in the dashboard when you have IDs.

## Smoke test (after deploy)

Replace `YOUR_WORKER` with your `*.workers.dev` origin (no trailing slash):

```text
https://YOUR_WORKER/health
https://YOUR_WORKER/etoro/oil
```

`/etoro/oil` should return a **JSON array** of candles.

## Use with GitHub Pages

1. Enable Pages on the repo (branch `main`, `/`).
2. Open:

   `https://<you>.github.io/hl-vs-etoro/?proxy=https://YOUR_WORKER`

3. Or persist:

   ```js
   localStorage.setItem("hlvs_proxy", "https://YOUR_WORKER");
   ```

Reload. The app will use `/hl` and `/etoro/*` on the Worker instead of calling Hyperliquid / eToro directly from the browser.
