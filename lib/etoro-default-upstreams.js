/** Default candle JSON endpoints when ETORO_CANDLES_* env vars are unset. Keep in sync with index.html ETORO_PUBLIC_FALLBACK. */
module.exports = {
  nq: "https://sidekick-c26b0845.base44.app/functions/etoroCandles",
  gold: "https://sidekick-c26b0845.base44.app/functions/etoroGoldCandles",
  oil: "https://sidekick-c26b0845.base44.app/functions/etoroOilCandles",
  natgas: "https://sidekick-c26b0845.base44.app/functions/etoroNatGasCandles",
};
