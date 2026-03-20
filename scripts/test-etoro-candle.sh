#!/usr/bin/env bash
# Live smoke test: eToro chart candle API.
# Usage: ./scripts/test-etoro-candle.sh [instrument_id]
set -euo pipefail
ID="${1:-17}"
HOST="${ETORO_CANDLE_HOST:-https://candle.etoro.com}"
REQ_ID="$(command -v uuidgen >/dev/null && uuidgen || cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "cli-$(date +%s)")"
URL="${HOST%/}/candles/asc.json/OneMinute/2/${ID}?client_request_id=${REQ_ID}"
echo "GET $URL"
code="$(curl -sS -o /tmp/etoro-candle.json -w "%{http_code}" -H "Accept: application/json" "$URL")"
if [[ "$code" != "200" ]]; then
  echo "HTTP $code" >&2
  exit 1
fi
python3 - <<'PY'
import json, sys
with open("/tmp/etoro-candle.json") as f:
    j = json.load(f)
rows = j.get("Candles", [{}])[0].get("Candles") or []
if not rows:
    print("No candles", file=sys.stderr)
    sys.exit(1)
first, last = rows[0], rows[-1]
print(f"OK  HTTP 200  bars={len(rows)}")
print(f"First: {first.get('FromDate')}  C={first.get('Close')}")
print(f"Last:  {last.get('FromDate')}  C={last.get('Close')}  (latest close)")
PY
