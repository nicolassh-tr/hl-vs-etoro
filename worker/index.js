const HL_INFO = "https://api.hyperliquid.xyz/info";
/** eToro path OneMinute/{n}: n = count of 1m bars (~24h, matches HL candle window in the app). */
const ETORO_CANDLE_1M_BAR_COUNT = 1440;

const FUNCTION_FILE = {
  nq: "etoroNQ247Candles",
  gold: "etoroGold247Candles",
  silver: "etoroSilver247Candles",
  oil: "etoroOil247Candles",
  natgas: "etoroNatGas247Candles",
};

const DEFAULT_FUNCTIONS_BASE = "https://sidekick-c26b0845.base44.app";

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

function legacyEtoroUrl(env, key) {
  const base = (env.ETORO_FUNCTIONS_BASE && String(env.ETORO_FUNCTIONS_BASE).trim()) || DEFAULT_FUNCTIONS_BASE;
  const file = FUNCTION_FILE[key];
  return `${base.replace(/\/$/, "")}/functions/${file}`;
}

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

    const m = path.match(/^\/etoro\/(nq|gold|silver|oil|natgas)$/);
    if (m) {
      if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405, headers: h });
      const key = m[1];
      const envK = INSTRUMENT_ENV[key];
      const fromEnv = envK && env[envK] && String(env[envK]).trim();
      const instId = fromEnv || DEFAULT_INSTRUMENT_ID[key];

      try {
        if (instId) {
          const host =
            (env.ETORO_CANDLE_HOST && String(env.ETORO_CANDLE_HOST).trim()) || "https://candle.etoro.com";
          const reqId = crypto.randomUUID();
          const cUrl = `${host.replace(/\/$/, "")}/candles/asc.json/OneMinute/${ETORO_CANDLE_1M_BAR_COUNT}/${instId}?client_request_id=${encodeURIComponent(reqId)}`;
          const r = await fetch(cUrl, { headers: { Accept: "application/json" } });
          const text = await r.text();
          if (!r.ok) {
            return new Response(text.slice(0, 2000), {
              status: r.status,
              headers: { ...h, "Content-Type": r.headers.get("content-type") || "text/plain" },
            });
          }
          let json;
          try {
            json = JSON.parse(text);
          } catch {
            return new Response(JSON.stringify({ error: "Invalid JSON from candle API" }), {
              status: 502,
              headers: { ...h, "Content-Type": "application/json" },
            });
          }
          const candles = normalizeCandleResponse(json);
          return new Response(JSON.stringify(candles), {
            status: 200,
            headers: { ...h, "Content-Type": "application/json" },
          });
        }

        const leg = legacyEtoroUrl(env, key);
        const r = await fetch(leg, { headers: { Accept: "application/json" } });
        const text = await r.text();
        return new Response(text, {
          status: r.status,
          headers: { ...h, "Content-Type": r.headers.get("content-type") || "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e && e.message) }), {
          status: 502,
          headers: { ...h, "Content-Type": "application/json" },
        });
      }
    }

    if (path === "/health") return new Response("ok", { status: 200, headers: h });

    return new Response("Not found", { status: 404, headers: h });
  },
};
