/**
 * Runs on GitHub Actions (Node 20). Fetches eToro feeds server-side and writes
 * cached-feed.json for same-origin load on GitHub Pages (browser CORS bypass).
 */
import fs from "fs";
import { randomUUID } from "crypto";

const LEGACY_BASE = "https://sidekick-c26b0845.base44.app";
const CANDLE_HOST = "https://candle.etoro.com";
const OIL_INSTRUMENT_ID = "17";

const LEGACY_FILES = {
  nq: "etoroCandles",
  gold: "etoroGoldCandles",
  oil: "etoroOilCandles",
  natgas: "etoroNatGasCandles",
};

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
    headers: { Accept: "application/json", ...(init.headers || {}) },
    signal: AbortSignal.timeout(28000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r.json();
}

async function main() {
  const etoro = { nq: [], gold: [], oil: [], natgas: [] };

  try {
    const reqId = randomUUID();
    const url = `${CANDLE_HOST}/candles/asc.json/OneMinute/2/${OIL_INSTRUMENT_ID}?client_request_id=${encodeURIComponent(reqId)}`;
    const j = await fetchJson(url);
    etoro.oil = normalizeCandleResponse(j);
  } catch (e) {
    console.warn("candle oil:", e.message || e);
  }

  if (!etoro.oil.length) {
    try {
      const j = await fetchJson(`${LEGACY_BASE}/functions/${LEGACY_FILES.oil}`);
      if (Array.isArray(j)) etoro.oil = j;
    } catch (e) {
      console.warn("legacy oil:", e.message || e);
    }
  }

  for (const key of ["nq", "gold", "natgas"]) {
    try {
      const j = await fetchJson(`${LEGACY_BASE}/functions/${LEGACY_FILES[key]}`);
      if (Array.isArray(j)) etoro[key] = j;
    } catch (e) {
      console.warn(`legacy ${key}:`, e.message || e);
    }
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    etoro,
  };
  fs.writeFileSync("cached-feed.json", JSON.stringify(payload), "utf8");
  const lens = Object.fromEntries(Object.entries(etoro).map(([k, v]) => [k, v.length]));
  console.log("cached-feed.json written", payload.updatedAt, lens);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
