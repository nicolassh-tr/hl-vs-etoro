/**
 * eToro chart candle API (same as www.etoro.com Network tab):
 * GET {host}/candles/asc.json/OneMinute/2/{instrumentId}?client_request_id={uuid}
 */

const DEFAULT_CANDLE_HOST = "https://candle.etoro.com";
const PATH_SEGMENT = "OneMinute/2";

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
  PATH_SEGMENT,
  normalizeCandleResponse,
  buildCandleUrl,
};
