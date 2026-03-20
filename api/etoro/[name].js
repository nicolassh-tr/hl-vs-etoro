const MAP = {
  nq: "https://sidekick-c26b0845.base44.app/functions/etoroCandles",
  gold: "https://sidekick-c26b0845.base44.app/functions/etoroGoldCandles",
  oil: "https://sidekick-c26b0845.base44.app/functions/etoroOilCandles",
  natgas: "https://sidekick-c26b0845.base44.app/functions/etoroNatGasCandles",
};

export default async function handler(req, res) {
  const name = req.query.name;
  const target = MAP[name];
  if (!target) return res.status(404).json({ error: "Unknown instrument" });
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
