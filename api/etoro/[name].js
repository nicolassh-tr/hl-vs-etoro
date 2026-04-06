const crypto = require("crypto");
const {
  DEFAULT_CANDLE_HOST,
  normalizeCandleResponse,
  buildCandleUrl,
} = require("../../lib/etoro-candle-api");

const DEFAULT_FUNCTIONS_BASE = "https://sidekick-c26b0845.base44.app";

const FUNCTION_FILE = {
  nq: "etoroNQ247Candles",
  gold: "etoroGold247Candles",
  silver: "etoroSilver247Candles",
  oil: "etoroOil247Candles",
  natgas: "etoroNatGas247Candles",
};

const INSTRUMENT_ENV = {
  nq: "ETORO_INSTRUMENT_NQ",
  gold: "ETORO_INSTRUMENT_GOLD",
  silver: "ETORO_INSTRUMENT_SILVER",
  oil: "ETORO_INSTRUMENT_OIL",
  natgas: "ETORO_INSTRUMENT_NATGAS",
};

const DEFAULT_INSTRUMENT_ID = {
  nq: "686",
  gold: "559",
  silver: "783",
  oil: "784",
  natgas: "782",
};

async function fetchLegacyFunctions(name) {
  const file = FUNCTION_FILE[name];
  const base =
    (process.env.ETORO_FUNCTIONS_BASE && String(process.env.ETORO_FUNCTIONS_BASE).trim()) ||
    DEFAULT_FUNCTIONS_BASE;
  const url = `${base.replace(/\/$/, "")}/functions/${file}`;
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  const text = await r.text();
  return { status: r.status, text, contentType: r.headers.get("content-type") || "application/json" };
}

async function fetchCandleApi(instrumentId) {
  const host =
    (process.env.ETORO_CANDLE_HOST && String(process.env.ETORO_CANDLE_HOST).trim()) ||
    DEFAULT_CANDLE_HOST;
  const id = String(instrumentId).trim();
  const reqId = crypto.randomUUID();
  const url = buildCandleUrl(host, id, reqId);
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  const text = await r.text();
  if (!r.ok) {
    return {
      status: r.status,
      body: text.slice(0, 2000) || JSON.stringify({ error: `candle API HTTP ${r.status}` }),
      contentType: r.headers.get("content-type") || "application/json",
    };
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return {
      status: 502,
      body: JSON.stringify({ error: "Invalid JSON from candle API" }),
      contentType: "application/json",
    };
  }
  const candles = normalizeCandleResponse(json);
  return {
    status: 200,
    body: JSON.stringify(candles),
    contentType: "application/json",
  };
}

async function handler(req, res) {
  const name = req.query.name;
  const file = FUNCTION_FILE[name];
  const envKey = INSTRUMENT_ENV[name];
  if (!file || !envKey) return res.status(404).json({ error: "Unknown instrument" });

  const fromEnv = process.env[envKey] && String(process.env[envKey]).trim();
  const defaultId = DEFAULT_INSTRUMENT_ID[name];
  const instrumentId = fromEnv || defaultId;

  try {
    if (instrumentId) {
      const out = await fetchCandleApi(instrumentId);
      return res.status(out.status).setHeader("Content-Type", out.contentType).send(out.body);
    }
    const leg = await fetchLegacyFunctions(name);
    return res.status(leg.status).setHeader("Content-Type", leg.contentType).send(leg.text);
  } catch (e) {
    return res.status(502).json({ error: String(e && e.message) });
  }
}

module.exports = handler;
