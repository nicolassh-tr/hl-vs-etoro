# HL vs eToro

Dashboard comparing Hyperliquid and eToro prices.

## Test eToro candle API (live)

From the repo root:

- **Windows:** `powershell -ExecutionPolicy Bypass -File .\scripts\test-etoro-candle.ps1`  
  Optional: `-InstrumentId 27` (default **17** = oil).

- **macOS / Linux:** `bash scripts/test-etoro-candle.sh` or `bash scripts/test-etoro-candle.sh 17`

This hits `candle.etoro.com` directly (CLI, no CORS). Your static site still needs the Worker proxy for browsers.

---

**Deploy end-to-end:** see **[DEPLOY.md](./DEPLOY.md)** (GitHub Pages + optional Worker).

---

## Free hosting (no paid subscription)

| Piece | Cost | What it does |
|--------|------|----------------|
| **[GitHub Pages](https://pages.github.com/)** | Free for public repos | Serves `index.html` at `you.github.io/repo-name` |
| **[Cloudflare Workers](https://developers.cloudflare.com/workers/platform/pricing/)** | Free tier (limits apply) | Small proxy so eToro/Hyperliquid calls run **server-side** (needed for eToro candles + some WiFi) |

You need a **free GitHub account**. For the proxy, a **free Cloudflare** account is enough (`*.workers.dev`); **deploy the Worker from GitHub Actions** (no Node.js on your PC)—see **[DEPLOY.md](./DEPLOY.md)**.  
If **work email / IT policy** blocks Cloudflare, use a **personal** Cloudflare account for the Worker secrets, ask someone else to host the Worker URL, or run **without** `?proxy=` (limitations in “What works on Pages alone” below).

**Totally static option (no Worker):** Pages only → $0, but eToro may rely on legacy `/functions/…` URLs in the browser and can break on strict networks or CORS/WiFi.

---

## Host on GitHub Pages (no Vercel)

1. Repo **Settings → Pages** → Source: branch **`main`**, folder **`/ (root)`** → Save.
2. Your app URL: **`https://<your-username>.github.io/hl-vs-etoro/`** (e.g. `nicolassh-tr.github.io/hl-vs-etoro`).

**What works on Pages alone**

- **Hyperliquid** — the browser calls `api.hyperliquid.xyz` directly (when your network allows it).
- **eToro** — without `?proxy=`, the app tries **live** chart + legacy URLs, then **`cached-feed.json`** (built on **GitHub Actions** and served from the same site—no CORS), then **localStorage** from a previous successful load. See **`scripts/build-cached-feed.mjs`** and **Deploy GitHub Pages** workflow (scheduled + manual runs).

**Recommended with Pages: Cloudflare Worker** (free tier is enough)

The Worker proxies `/hl`, `/etoro/*`, and `/health` so the browser only talks to **your** `*.workers.dev` host; the Worker fetches Hyperliquid and eToro server-side.

**Deploy the Worker without installing anything locally:** follow **[DEPLOY.md](./DEPLOY.md)** (GitHub Actions + Cloudflare API token + repo secrets). Optional CLI steps: **`worker/README.md`**.

Oil is preconfigured in `wrangler.toml` `[vars]`. In the Cloudflare dashboard you can add more instruments (`ETORO_INSTRUMENT_NQ`, `_GOLD`, `_NATGAS`, …) when you have IDs from eToro’s Network tab, or override `ETORO_CANDLE_HOST` / `ETORO_FUNCTIONS_BASE` (see `.env.example` concepts).

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

`GET https://candle.etoro.com/candles/asc.json/OneMinute/1440/{instrumentId}?client_request_id=…` — `1440` is the number of **1-minute** bars (~24h), aligned with the Hyperliquid snapshot window (not “2 days”; `OneMinute/2/` is only two bars).

Used **inside the Worker** (or any server proxy), not from the browser on GitHub Pages.

### Legacy `/functions/…` JSON

Fallback when an instrument ID isn’t set for the Worker route, or for **browser-direct** mode on Pages.

---

## Optional: `api/` folder

The **`api/`** directory is for hosts that run **Node serverless** routes (e.g. if you ever use another platform). **GitHub Pages does not run it.** You can ignore `api/` if you only use Pages + Worker.

## WiFi

If HL or eToro fail on office WiFi, the Worker (or mobile data) usually fixes it because your browser only calls **your** proxy URL.
