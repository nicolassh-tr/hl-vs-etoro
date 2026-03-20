const HL_INFO = "https://api.hyperliquid.xyz/info";
const ETORO = {
  nq: "https://sidekick-c26b0845.base44.app/functions/etoroCandles",
  gold: "https://sidekick-c26b0845.base44.app/functions/etoroGoldCandles",
  oil: "https://sidekick-c26b0845.base44.app/functions/etoroOilCandles",
  natgas: "https://sidekick-c26b0845.base44.app/functions/etoroNatGasCandles",
};

function corsHeaders(request) {
  const o = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": o || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export default {
  async fetch(request) {
    const h = corsHeaders(request);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "") || "/";

    if (path === "/hl") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: h });
      const body = await request.text();
      const r = await fetch(HL_INFO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const text = await r.text();
      return new Response(text, {
        status: r.status,
        headers: { ...h, "Content-Type": r.headers.get("content-type") || "application/json" },
      });
    }

    const m = path.match(/^\/etoro\/(nq|gold|oil|natgas)$/);
    if (m) {
      if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405, headers: h });
      const target = ETORO[m[1]];
      const r = await fetch(target, { headers: { Accept: "application/json" } });
      const text = await r.text();
      return new Response(text, {
        status: r.status,
        headers: { ...h, "Content-Type": r.headers.get("content-type") || "application/json" },
      });
    }

    if (path === "/health") return new Response("ok", { status: 200, headers: h });

    return new Response("Not found", { status: 404, headers: h });
  },
};
