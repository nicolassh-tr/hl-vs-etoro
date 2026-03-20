const HL_INFO = "https://api.hyperliquid.xyz/info";

const ETORO_ENV = {
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

function corsHeaders(request) {
  const o = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": o || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function etoroUpstream(env, key) {
  const k = ETORO_ENV[key];
  const specific = k && env[k] && String(env[k]).trim();
  const base = env.ETORO_FUNCTIONS_BASE && String(env.ETORO_FUNCTIONS_BASE).trim();
  const file = FUNCTION_FILE[key];
  if (specific) return specific;
  if (base && file) return `${base.replace(/\/$/, "")}/functions/${file}`;
  return null;
}

export default {
  async fetch(request, env) {
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
      const target = etoroUpstream(env, m[1]);
      if (!target) {
        return new Response(
          JSON.stringify({
            error: "Set ETORO_FUNCTIONS_BASE or ETORO_CANDLES_* on the Worker (see README).",
          }),
          { status: 503, headers: { ...h, "Content-Type": "application/json" } }
        );
      }
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
