/**
 * Proxies GET /api/etoro/:name → upstream JSON. If env unset, uses same default host as the
 * original direct browser integration (override with ETORO_FUNCTIONS_BASE or ETORO_CANDLES_*).
 */

const DEFAULT_FUNCTIONS_BASE = "https://sidekick-c26b0845.base44.app";

const ENV_KEYS = {
  nq: "ETORO_CANDLES_NQ",
  gold: "ETORO_CANDLES_GOLD",
  oil: "ETORO_CANDLES_OIL",
  natgas: "ETORO_CANDLES_NATGAS",
};

const FUNCTION_FILE = {
  nq: "etoroCandles",
  gold: "etoroGoldCandles",
  oil: "etoroOilCandles",
  natgas: "etoroNatGasCandles",
};

async function handler(req, res) {
  const name = req.query.name;
  const envKey = ENV_KEYS[name];
  const file = FUNCTION_FILE[name];
  if (!envKey || !file) return res.status(404).json({ error: "Unknown instrument" });

  const specific = process.env[envKey] && String(process.env[envKey]).trim();
  const base = (process.env.ETORO_FUNCTIONS_BASE && String(process.env.ETORO_FUNCTIONS_BASE).trim()) || DEFAULT_FUNCTIONS_BASE;
  const target =
    specific || `${base.replace(/\/$/, "")}/functions/${file}`;
  try {
    const r = await fetch(target, { headers: { Accept: "application/json" } });
    const text = await r.text();
    res
      .status(r.status)
      .setHeader("Content-Type", r.headers.get("content-type") || "application/json")
      .send(text);
  } catch (e) {
    res.status(502).json({ error: String(e && e.message) });
  }
}

module.exports = handler;
