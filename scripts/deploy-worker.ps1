# Deploy Cloudflare Worker (requires Node.js + free Cloudflare account).
# Run from repo root: powershell -ExecutionPolicy Bypass -File .\scripts\deploy-worker.ps1

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent
$workerDir = (Join-Path $repoRoot "worker" | Resolve-Path).Path

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed. Install LTS from https://nodejs.org/ then run this script again." -ForegroundColor Red
    exit 1
}

Set-Location $workerDir
Write-Host "From: $workerDir" -ForegroundColor Cyan
Write-Host "Running: npx wrangler@3 login (browser opens) ..." -ForegroundColor Yellow
npx --yes wrangler@3 login
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Deploying..." -ForegroundColor Yellow
npx --yes wrangler@3 deploy
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Done. Use the workers.dev URL as ?proxy= on GitHub Pages (see worker/README.md)." -ForegroundColor Green
