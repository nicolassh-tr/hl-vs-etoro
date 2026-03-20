# HL vs eToro

Dashboard comparing Hyperliquid and eToro prices.

## eToro data sources

### 1. Official chart API (Vercel `/api` or Worker)

Same as **www.etoro.com** in DevTools:

`GET https://candle.etoro.com/candles/asc.json/OneMinute/2/{instrumentId}?client_request_id={uuid}`

The proxy normalizes the JSON to the candle array the UI expects.

- **CORS** on `candle.etoro.com` allows **`https://www.etoro.com`** only, so the **browser** cannot call it from this app’s origin. Use **`/api/etoro/*`** on Vercel or the **Worker** (`?proxy=`) so the **server** fetches candles.
- **Oil** defaults to instrument **17** (from your Network capture). For NQ, Gold, NatGas, open each chart on eToro, find the same candle URL pattern, and set in Vercel / Worker:

  - `ETORO_INSTRUMENT_NQ`
  - `ETORO_INSTRUMENT_GOLD`
  - `ETORO_INSTRUMENT_OIL` (optional; default `17`)
  - `ETORO_INSTRUMENT_NATGAS`

Optional: `ETORO_CANDLE_HOST` (default `https://candle.etoro.com`).

### 2. Legacy `/functions/…` JSON (fallback)

If **no** instrument ID is configured for a symbol, `/api/etoro/{name}` proxies:

`{ETORO_FUNCTIONS_BASE}/functions/etoroCandles` (and gold / oil / natgas names).  
Default base is the earlier integration host.

### Why Hyperliquid loads more easily

**Hyperliquid** serves **`api.hyperliquid.xyz`** to any origin. **eToro candles** require a **same-origin or server-side** fetch.

## Deploy (Vercel)

1. Import this repo.
2. Set **`ETORO_INSTRUMENT_*`** for each market you want from **candle.etoro.com** (oil works with defaults on redeploy).
3. Redeploy. Open the `*.vercel.app` URL so `/api/health` and `/api/etoro/*` are used.

## GitHub Pages (no `/api`)

Use a **Worker** + `?proxy=` (see `worker/`), or rely on **browser-direct** legacy `/functions/…` URLs via `?etoroBase=` / `localStorage` / `ETORO_FUNCTIONS_BASE` in `index.html` — not the official candle API (CORS).

## WiFi

Prefer Vercel or the Worker so the browser only hits **your** deployment.
