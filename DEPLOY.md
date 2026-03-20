# Deploy this project (no software to install on your PC)

Everything below uses **GitHub** in the browser and **Cloudflare** in the browser. Wrangler runs **inside GitHub Actions**, not on your machine.

---

## 1. GitHub Pages (static app)

1. Code is already on `main` with `.github/workflows/deploy-pages.yml`.
2. On GitHub: **Settings → Pages**.
3. **Build and deployment → Source:** **GitHub Actions**.
4. **Actions** → wait for **Deploy GitHub Pages** (green check).
5. Your site URL (example):  
   `https://<username>.github.io/hl-vs-etoro/`

**eToro without Cloudflare:** each deploy runs `scripts/build-cached-feed.mjs` on GitHub’s servers and publishes **`cached-feed.json`** next to `index.html`. Your browser loads it from the **same origin** (no CORS). A **seed** `cached-feed.json` is committed so the file is never missing (404) even if a run fails; CI overwrites it when fetches succeed.

The workflow also runs on a **schedule** (4× daily UTC) and **`workflow_dispatch`** so you can refresh under **Actions → Deploy GitHub Pages → Run workflow**.

**If only Oil fills in CI:** Base44 legacy URLs often return **403** from GitHub’s datacenter IPs. Oil still works via `candle.etoro.com` (instrument **17**). For NQ / Gold / NatGas in the cache, add repo **Settings → Secrets and variables → Actions → Variables** (not secrets): `ETORO_INSTRUMENT_NQ`, `ETORO_INSTRUMENT_GOLD`, `ETORO_INSTRUMENT_NATGAS` with the IDs from eToro’s site (Network tab on `candle.etoro.com` requests). Optional: `ETORO_INSTRUMENT_OIL` to override **17**.

---

## 2. Cloudflare Worker (proxy — same role as old Base44 functions)

### Step A — Cloudflare API token

1. Log in: [dash.cloudflare.com](https://dash.cloudflare.com)
2. **My Profile** (or user menu) → **API Tokens** → **Create Token**.
3. Use template **“Edit Cloudflare Workers”** or create custom with:
   - **Account** → **Cloudflare Workers Scripts** → **Edit**
   - **Account** → **Account Settings** → **Read** (if the wizard asks)
4. **Create token**, copy it once (you won’t see it again).

### Step B — Account ID

1. In Cloudflare: **Workers & Pages** (or any zone).
2. Copy **Account ID** from the **right-hand sidebar**.

### Step C — GitHub secrets

1. Repo **Settings → Secrets and variables → Actions**.
2. **New repository secret**:
   - Name: `CLOUDFLARE_API_TOKEN` → paste the token  
   - Name: `CLOUDFLARE_ACCOUNT_ID` → paste the account ID  

### Step D — Run the workflow

1. **Actions** tab → workflow **“Deploy Cloudflare Worker”**.
2. **Run workflow** → branch **main** → **Run workflow**.
3. Open the run → expand **deploy** step → find your Worker URL (`https://…workers.dev`) in the log, or open **Workers & Pages** in Cloudflare and click the worker **hl-vs-etoro-proxy**.

`wrangler.toml` already sets **oil** instrument **17** for `candle.etoro.com`. Add more variables in the Cloudflare dashboard (**Workers** → your worker → **Settings → Variables**) if needed.

### If work email / company policy blocks Cloudflare

Many employers block signing up for external infra with a **corporate email**, or restrict **Cloudflare** specifically. You still have options:

1. **Personal Cloudflare (usual fix)**  
   Create a **free** Cloudflare account with a **personal** address (e.g. Gmail). You do **not** need a custom domain for Workers—`*.workers.dev` is enough.  
   Put the API token and Account ID in **this repo’s GitHub Actions secrets** as above. The Worker runs on your personal Cloudflare account; the app on GitHub Pages is unchanged.  
   *If your job forbids even that, skip to option 3.*

2. **Someone else deploys the Worker**  
   A colleague or friend can run the same workflow from a fork (or deploy once and send you the `https://….workers.dev` URL). You only add `?proxy=…` to the Pages URL—no Cloudflare access required on your side.

3. **No proxy (Pages only)**  
   Skip section 2 entirely. Open the site **without** `?proxy=`. Hyperliquid may work from the browser; eToro often falls back to legacy URLs and can fail on strict WiFi or due to CORS—see **[README.md](./README.md)** (“What works on Pages alone”).

---

## 3. Point the app at the Worker

Open (no trailing slash on the worker URL):

`https://<username>.github.io/hl-vs-etoro/?proxy=https://<your-subdomain>.workers.dev`

Optional — save in the browser on that site (DevTools → Console):

```js
localStorage.setItem("hlvs_proxy", "https://<your-subdomain>.workers.dev");
location.reload();
```

---

### Advanced (optional)

If you later install **Node.js** on a machine, you can deploy from a terminal with Wrangler; the repo also has `scripts/deploy-worker.ps1` for that. **Not required** for the flow above.
