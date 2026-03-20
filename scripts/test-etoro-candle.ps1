# Live smoke test: eToro chart candle API (same as www.etoro.com Network tab).
# Usage: .\scripts\test-etoro-candle.ps1
#        .\scripts\test-etoro-candle.ps1 -InstrumentId 27

param(
    [int] $InstrumentId = 17,
    [string] $CandleHost = "https://candle.etoro.com"
)

$ErrorActionPreference = "Stop"
$reqId = [guid]::NewGuid().ToString()
$base = $CandleHost.TrimEnd("/")
$barCount = 1440
$url = "$base/candles/asc.json/OneMinute/${barCount}/${InstrumentId}?client_request_id=$reqId"

Write-Host "GET $url" -ForegroundColor Cyan
$r = Invoke-WebRequest -Uri $url -UseBasicParsing -Headers @{ Accept = "application/json" }
if ($r.StatusCode -ne 200) {
    Write-Host "HTTP $($r.StatusCode)" -ForegroundColor Red
    exit 1
}

$j = $r.Content | ConvertFrom-Json
if (-not $j.Candles -or $j.Candles.Count -lt 1) {
    Write-Host "Unexpected JSON (no Candles[])" -ForegroundColor Red
    exit 1
}

$series = $j.Candles[0].Candles
if (-not $series -or $series.Count -lt 1) {
    Write-Host "No inner candle rows" -ForegroundColor Red
    exit 1
}

$n = $series.Count
$first = $series[0]
$last = $series[$n - 1]
Write-Host "OK  HTTP 200  bars=$n" -ForegroundColor Green
Write-Host "First: $($first.FromDate)  C=$($first.Close)"
Write-Host "Last:  $($last.FromDate)  C=$($last.Close)  (latest close)"
