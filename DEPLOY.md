# Deploy this project

## 1. GitHub Pages (static app)

1. Push `main` (includes `.github/workflows/deploy-pages.yml`).
2. On GitHub: **Settings → Pages**.
3. **Build and deployment → Source:** choose **GitHub Actions** (not “Deploy from a branch”).
4. Open **Actions** — wait for **Deploy GitHub Pages** to finish (green).
5. Pages shows your URL, usually:  
   `https://<username>.github.io/hl-vs-etoro/`

The workflow only publishes **`index.html`** (no `api/` on Pages).

## 2. Cloudflare Worker (proxy for eToro + WiFi)

### Option A — GitHub Actions

1. Cloudflare: [Create API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) with **Workers Scripts:Edit** (and account read if prompted).
2. Copy **Account ID** from Cloudflare dashboard (right sidebar on Workers overview).
3. GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**  
   - `CLOUDFLARE_API_TOKEN`  
   - `CLOUDFLARE_ACCOUNT_ID`
4. **Actions → Deploy Cloudflare Worker → Run workflow**.

Copy the `*.workers.dev` URL from the job log (or Workers dashboard).

### Option B — Your PC

Install [Node.js](https://nodejs.org/), then:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-worker.ps1
```

## 3. Point the app at the Worker

Open (replace both placeholders):

`https://<username>.github.io/hl-vs-etoro/?proxy=https://<your-worker>.workers.dev`

Or once in the browser console on that site:

```js
localStorage.setItem("hlvs_proxy", "https://<your-worker>.workers.dev");
location.reload();
```
