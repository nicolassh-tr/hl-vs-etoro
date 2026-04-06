# Cloudflare Worker proxy

Replaces the old **Base44** pattern: your app calls **this** URL; the Worker fetches Hyperliquid + eToro server-side.

## Deploy without installing anything locally

Use **GitHub Actions** (Wrangler runs on GitHub’s servers). See **[../DEPLOY.md](../DEPLOY.md)** — section **2. Cloudflare Worker**.

Summary:

1. Cloudflare: API token + Account ID  
2. GitHub repo: **Settings → Secrets** → `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`  
3. **Actions → Deploy Cloudflare Worker → Run workflow**

## After deploy

Smoke test (replace `YOUR_WORKER` with your `*.workers.dev` origin, no trailing slash):

- `https://YOUR_WORKER/health` → `ok`
- `https://YOUR_WORKER/etoro/oil` → JSON array of candles (also `/etoro/nq`, `/gold`, `/silver`, `/natgas`)

## GitHub Pages

`https://<you>.github.io/hl-vs-etoro/?proxy=https://YOUR_WORKER`

---

### Optional: deploy from your own computer

Only if you have **Node.js** installed:

```bash
cd worker
npx wrangler@3 login
npx wrangler@3 deploy
```

Or: `scripts/deploy-worker.ps1` from the repo root.
