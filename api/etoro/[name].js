const DEFAULT_UPSTREAM = require("../../lib/etoro-default-upstreams");

const ENV_KEYS = {
  nq: "ETORO_CANDLES_NQ",
  gold: "ETORO_CANDLES_GOLD",
  oil: "ETORO_CANDLES_OIL",
  natgas: "ETORO_CANDLES_NATGAS",
};

async function handler(req, res) {
  const name = req.query.name;
  const envKey = ENV_KEYS[name];
  if (!envKey) return res.status(404).json({ error: "Unknown instrument" });
  const fromEnv = process.env[envKey];
  const target = (fromEnv && String(fromEnv).trim()) || DEFAULT_UPSTREAM[name];
  if (!target) {
    return res.status(503).json({ error: `Missing upstream for ${name}` });
  }
  try {
    const r = await fetch(String(target).trim(), { headers: { Accept: "application/json" } });
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
