# Databricks ↔ GitHub workflow

**Source of truth:** this repo on GitHub (`main`). Your PC is where you commit and push.

## After you `git push` to GitHub

### Option A — Databricks Repos (recommended for notebooks/code from this repo)

1. In Databricks: **Workspace** → **Repos** → open the repo linked to `nicolassh-tr/hl-vs-etoro` (or add it via **Add repo** → paste `https://github.com/nicolassh-tr/hl-vs-etoro.git`).
2. Click **Pull** (or **Sync**) so the workspace copy matches `main`.

That only updates **what is in this GitHub repo**. It does not run by itself when you push—you pull when you want the latest in Databricks.

### Option B — Asset bundle (`Nicolas_Cursor_Project`)

If you also maintain **Python/notebook** versions under `Nicolas_Cursor_Project` (e.g. `hl_vs_etoro_comparison.py` / notebooks), those are deployed with:

```powershell
cd C:\Users\nicolassh\Desktop\Nicolas_Cursor_Project
databricks bundle deploy -t dev
```

That uploads the **bundle project** to the workspace path configured in `databricks.yml`. It is **not** a `git push`; it is a file sync from your **local** `Nicolas_Cursor_Project` folder. Keep GitHub and that folder aligned with normal `git` workflow in each repo.

## Summary

| Action | What it does |
|--------|----------------|
| `git push` (this repo) | Updates **GitHub** |
| **Pull** in Databricks Repos | Updates **Databricks** from GitHub |
| `databricks bundle deploy` | Uploads **Nicolas_Cursor_Project** files to Databricks (separate from this repo unless you copy content) |
