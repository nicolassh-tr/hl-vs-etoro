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
