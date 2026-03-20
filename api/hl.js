const HL_INFO = "https://api.hyperliquid.xyz/info";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).send("POST only");
  try {
    const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
    const r = await fetch(HL_INFO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const text = await r.text();
    res
      .status(r.status)
      .setHeader("Content-Type", r.headers.get("content-type") || "application/json")
      .send(text);
  } catch (e) {
    res.status(502).json({ error: String(e && e.message) });
  }
}

export const config = {
  api: { bodyParser: true },
};
