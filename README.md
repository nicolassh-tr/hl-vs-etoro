# HL vs eToro

Dashboard comparing Hyperliquid and eToro prices.

## Free hosting (no paid subscription)

| Piece | Cost | What it does |
|--------|------|----------------|
| **[GitHub Pages](https://pages.github.com/)** | Free for public repos | Serves `index.html` at `you.github.io/repo-name` |
| **[Cloudflare Workers](https://developers.cloudflare.com/workers/platform/pricing/)** | Free tier (limits apply) | Small proxy so eToro/Hyperliquid calls run **server-side** (needed for eToro candles + some WiFi) |

You need a **free GitHub account** and a **free Cloudflare account** to sign up—no paid plan required for typical personal use. The Worker uses `npx wrangler deploy` (CLI); Cloudflare’s free tier includes a `*.workers.dev` URL.

**Totally static option (no Worker):** Pages only → $0, but eToro may rely on legacy `/functions/…` URLs in the browser and can break on strict networks or CORS/WiFi.

---

## Host on GitHub Pages (no Vercel)

1. Repo **Settings → Pages** → Source: branch **`main`**, folder **`/ (root)`** → Save.
2. Your app URL: **`https://<your-username>.github.io/hl-vs-etoro/`** (e.g. `nicolassh-tr.github.io/hl-vs-etoro`).

**What works on Pages alone**

- **Hyperliquid** — the browser calls `api.hyperliquid.xyz` directly (when your network allows it).
- **eToro** — `candle.etoro.com` **cannot** be called from `github.io` (CORS is limited to `www.etoro.com`).  
  Without a proxy, the app falls back to **direct** requests to the legacy **`/functions/…`** JSON URLs (same as `ETORO_DEFAULT_FUNCTIONS_BASE` in `index.html`). That may work on some networks and fail on others (e.g. strict WiFi).

**Recommended with Pages: Cloudflare Worker** (free tier is enough)

The Worker proxies `/hl`, `/etoro/*`, and `/health` so the browser only talks to **your** `*.workers.dev` host; the Worker fetches Hyperliquid and eToro server-side.

```bash
cd worker
npx wrangler deploy
```

In the Worker dashboard (or `wrangler.toml` `[vars]`), set:

- `ETORO_INSTRUMENT_OIL=17` (and `ETORO_INSTRUMENT_NQ`, `_GOLD`, `_NATGAS` when you have IDs from eToro’s Network tab)
- Optional: `ETORO_CANDLE_HOST`, `ETORO_FUNCTIONS_BASE` (see `.env.example` concepts)

Then open:

`https://<you>.github.io/hl-vs-etoro/?proxy=https://<your-worker>.workers.dev`

To skip the query string every time:

```js
localStorage.setItem("hlvs_proxy", "https://<your-worker>.workers.dev");
```

Reload the site.

---

## eToro data (technical)

### Official chart API

`GET https://candle.etoro.com/candles/asc.json/OneMinute/2/{instrumentId}?client_request_id=…`

Used **inside the Worker** (or any server proxy), not from the browser on GitHub Pages.

### Legacy `/functions/…` JSON

Fallback when an instrument ID isn’t set for the Worker route, or for **browser-direct** mode on Pages.

---

## Optional: `api/` folder

The **`api/`** directory is for hosts that run **Node serverless** routes (e.g. if you ever use another platform). **GitHub Pages does not run it.** You can ignore `api/` if you only use Pages + Worker.

## WiFi

If HL or eToro fail on office WiFi, the Worker (or mobile data) usually fixes it because your browser only calls **your** proxy URL.
