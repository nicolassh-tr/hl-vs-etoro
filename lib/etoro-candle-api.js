/**
 * eToro chart candle API (same as www.etoro.com Network tab):
 * GET {host}/candles/asc.json/OneMinute/{count}/{instrumentId}?client_request_id={uuid}
 *
 * The middle segment is the number of 1-minute candles (not days). Use 1440 to match
 * the app’s ~24h Hyperliquid window; "2" in DevTools only returns two bars and makes
 * oil charts look like a few minutes of overlap.
 */

const DEFAULT_CANDLE_HOST = "https://candle.etoro.com";
const CANDLE_1M_BAR_COUNT = 1440;
const PATH_SEGMENT = `OneMinute/${CANDLE_1M_BAR_COUNT}`;

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

function buildCandleUrl(host, instrumentId, clientRequestId) {
  const h = (host || DEFAULT_CANDLE_HOST).replace(/\/$/, "");
  return `${h}/candles/asc.json/${PATH_SEGMENT}/${instrumentId}?client_request_id=${encodeURIComponent(clientRequestId)}`;
}

module.exports = {
  DEFAULT_CANDLE_HOST,
  CANDLE_1M_BAR_COUNT,
  PATH_SEGMENT,
  normalizeCandleResponse,
  buildCandleUrl,
};
