/**
 * Runs on GitHub Actions (Node 20). Fetches eToro feeds server-side and writes
 * cached-feed.json for same-origin load on GitHub Pages (browser CORS bypass).
 *
 * Always exits 0 and always writes cached-feed.json (CI copies it next to index.html).
 * Default instrument IDs are baked in for the 24/7 products. Override via repo Variables:
 * ETORO_INSTRUMENT_NQ, ETORO_INSTRUMENT_GOLD, ETORO_INSTRUMENT_SILVER, ETORO_INSTRUMENT_OIL, ETORO_INSTRUMENT_NATGAS.
 */
import fs from "fs";
import { randomUUID } from "crypto";

const LEGACY_BASE = "https://sidekick-c26b0845.base44.app";
const CANDLE_HOST = "https://candle.etoro.com";
/** Match index.html / HL: ~24h of 1m bars (segment was wrongly "2" = only two minutes). */
const CANDLE_1M_BAR_COUNT = 1440;

const LEGACY_FILES = {
  nq: "etoroNQ247Candles",
  gold: "etoroGold247Candles",
  silver: "etoroSilver247Candles",
  oil: "etoroOil247Candles",
  natgas: "etoroNatGas247Candles",
};

const KEYS = ["nq", "gold", "silver", "oil", "natgas"];

const BROWSER_HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Referer: "https://www.etoro.com/",
};

function candleIdsFromEnv() {
  return {
    nq: (process.env.ETORO_INSTRUMENT_NQ || "686").trim(),
    gold: (process.env.ETORO_INSTRUMENT_GOLD || "559").trim(),
    silver: (process.env.ETORO_INSTRUMENT_SILVER || "783").trim(),
    oil: (process.env.ETORO_INSTRUMENT_OIL || "784").trim(),
    natgas: (process.env.ETORO_INSTRUMENT_NATGAS || "782").trim(),
  };
}

function normalizeCandleResponse(json) {
  if (!json || !Array.isArray(json.Candles) || json.Candles.length === 0) return [];
  const inner = json.Candles[0].Candles;
  if (!Array.isArray(inner)) return [];
  return inner.map((c) => {
    const t = new Date(c.FromDate).getTime();
    return {
      t,
      time: new Date(t).toISOString().slice(11, 16),
      open: Number(c.Open),
      high: Number(c.High),
      low: Number(c.Low),
      close: Number(c.Close),
    };
  });
}

async function fetchJson(url, init = {}) {
  const r = await fetch(url, {
    ...init,
    headers: { ...BROWSER_HEADERS, ...(init.headers || {}) },
    signal: AbortSignal.timeout(28000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function writeCachedFeed(etoro) {
  const payload = {
    updatedAt: new Date().toISOString(),
    etoro,
  };
  fs.writeFileSync("cached-feed.json", JSON.stringify(payload), "utf8");
  const lens = Object.fromEntries(Object.entries(etoro).map(([k, v]) => [k, v.length]));
  console.log("cached-feed.json", payload.updatedAt, lens);
}

async function main() {
  const etoro = { nq: [], gold: [], silver: [], oil: [], natgas: [] };
  const ids = candleIdsFromEnv();

  try {
    for (const key of KEYS) {
      const id = ids[key];
      if (id) {
        try {
          const reqId = randomUUID();
          const url = `${CANDLE_HOST}/candles/asc.json/OneMinute/${CANDLE_1M_BAR_COUNT}/${id}?client_request_id=${encodeURIComponent(reqId)}`;
          const j = await fetchJson(url);
          const arr = normalizeCandleResponse(j);
          if (arr.length) etoro[key] = arr;
        } catch (e) {
          console.warn(`candle ${key}:`, e.message || e);
        }
      }
      if (!etoro[key].length) {
        try {
          const j = await fetchJson(`${LEGACY_BASE}/functions/${LEGACY_FILES[key]}`);
          if (Array.isArray(j) && j.length) etoro[key] = j;
        } catch (e) {
          console.warn(`legacy ${key}:`, e.message || e);
        }
      }
    }
  } catch (e) {
    console.error("build-cached-feed:", e);
  } finally {
    writeCachedFeed(etoro);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
