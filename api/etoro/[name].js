/**
 * Same URL shape as the old integration: {ETORO_FUNCTIONS_BASE}/functions/etoroCandles etc.
 * Set ETORO_FUNCTIONS_BASE in Vercel (e.g. https://api.yourcompany.com), or override any
 * feed with full URL via ETORO_CANDLES_NQ, ETORO_CANDLES_GOLD, ETORO_CANDLES_OIL, ETORO_CANDLES_NATGAS.
 */

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
  const base = process.env.ETORO_FUNCTIONS_BASE && String(process.env.ETORO_FUNCTIONS_BASE).trim();
  const target =
    specific ||
    (base ? `${base.replace(/\/$/, "")}/functions/${file}` : null);

  if (!target) {
    return res.status(503).json({
      error:
        "Set ETORO_FUNCTIONS_BASE (origin for /functions/etoroCandles, …) or ETORO_CANDLES_* full URLs — see README.",
    });
  }
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
