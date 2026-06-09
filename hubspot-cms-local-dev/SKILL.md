---
name: hubspot-cms-local-dev
description: "Set up and operate the HubSpot local development environment — CLI install, auth, file sync, watch, and preview workflow"
compatibility: "All Content Hub tiers; CLI v7+"
license: MIT
metadata:
    author: georgestephanis
    version: "1.1"
    written: "2026-06-09"
    written_against:
        hubspot-cli: "7.10"
---

## When to use

Use this skill whenever starting any HubSpot CMS development work locally — it is the prerequisite for all CMS theme, module, and template skills. Also use when:
- Connecting a new machine to a HubSpot account
- Switching between or adding multiple HubSpot accounts
- Setting up CI/CD deployment via GitHub Actions
- Troubleshooting sync, upload, or authentication failures

## Inputs required

- Node.js v20 or higher (`node --version`)
- A HubSpot account with Content Hub access
- Your HubSpot **account ID** — visible in any HubSpot URL: `app.hubspot.com/settings/<accountId>/`
- A **Personal Access Key** — generate at `app.hubspot.com/portal/<accountId>/personal-access-key` (requires "Content" scope at minimum; tick "Design Manager" under CMS access)

## Procedure

### 1. Install the CLI

```bash
npm install -g @hubspot/cli
hs --version    # expect 7.x
```

For projects that pin the CLI as a dev dependency:
```bash
npm install --save-dev @hubspot/cli
# then use: npx hs <command>
```

### 2. Initialise configuration

Run from your project root (creates `hubspot.config.yml` there):

```bash
hs init
```

Prompts:
1. **Enter a name for this account** — a local alias, e.g. `myco-prod`
2. **Enter your Personal Access Key** — paste from the URL above

The generated `hubspot.config.yml` looks like:

```yaml
defaultPortal: myco-prod
portals:
  - name: myco-prod
    portalId: 12345678
    authType: personalaccesskey
    personalAccessKey: >-
      pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    auth:
      tokenInfo:
        accessToken: >-
          xxxxx
        expiresAt: '2026-06-09T12:00:00.000Z'
```

**Add `.gitignore` entry** — the config file contains credentials:
```
hubspot.config.yml
```

### 3. Add additional accounts

```bash
hs auth
# follow the same prompts; give the second account a distinct alias
```

CLI v7+ supports multiple portals in one config. The `defaultPortal` key controls which account `hs` commands target.

```bash
hs accounts list          # show all configured accounts
hs accounts use myco-qa   # switch default for this session
```

To set a different default permanently, edit `hubspot.config.yml` and change `defaultPortal`, or:
```bash
hs accounts use --set-default myco-qa
```

### 4. Fetch existing assets from your account

```bash
# Fetch HubSpot's official boilerplate theme to a local directory
hs fetch @hubspot/cms-theme-boilerplate my-theme

# Fetch a specific theme already in your account
hs fetch themes/my-existing-theme ./local-theme

# Fetch a single module
hs fetch themes/my-theme/modules/hero.module ./hero.module
```

Remote paths are relative to the root of the Design Manager file system. Browse your file system at `app.hubspot.com/design-manager/<accountId>`.

### 5. Upload local assets to HubSpot

```bash
hs upload ./my-theme themes/my-theme
```

- `src` — local path (file or directory)
- `dest` — destination path in the Design Manager file system

Upload is recursive for directories. Existing files are overwritten.

### 6. Watch mode — auto-upload on save

```bash
hs watch ./my-theme themes/my-theme
```

Keeps running and uploads every saved file immediately. Use during active development. Stop with `Ctrl-C`.

Combined with your editor's auto-save, this makes the edit → preview loop near-instant.

### 7. Local preview server

```bash
hs theme preview ./my-theme
```

Opens `https://hslocal.net:3000/` — lists all templates and modules in the theme with live preview links. Also shows connected domains for domain-scoped preview. Uses a self-signed certificate; accept the browser warning on first launch.

### 8. Per-project config (multi-account or monorepo)

CLI v7 resolves `hubspot.config.yml` by walking up from the current directory, then falling back to `~/.hubspot.config.yml`. You can place a project-level config in the repo root:

```bash
hs init --config ./hubspot.config.yml
```

Or pass `--account` / `--portal` on any command to override:
```bash
hs upload ./my-theme themes/my-theme --account myco-staging
```

### 9. CI/CD deployment with GitHub Actions

Use the official [HubSpot CMS Deploy Action](https://github.com/HubSpot/hubspot-cms-deploy-action):

**GitHub repository setup:**
- Secret: `HUBSPOT_PERSONAL_ACCESS_KEY`
- Variable: `HUBSPOT_ACCOUNT_ID`

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to HubSpot
        uses: HubSpot/hubspot-cms-deploy-action@v2.0.1
        with:
          src_dir: src          # local path in repo
          dest_dir: themes/my-theme  # destination in Design Manager
          account_id: ${{ vars.HUBSPOT_ACCOUNT_ID }}
          personal_access_key: ${{ secrets.HUBSPOT_PERSONAL_ACCESS_KEY }}
```

For staging/QA: create a second workflow triggered by a `qa` branch, pointing to a different account. The `dest_dir` can be the same since it's a different HubSpot account.

### 10. `.hsignore` — exclude files from upload

Same syntax as `.gitignore`. Place at the root of the directory being watched/uploaded:

```
node_modules/
dist/
.git/
*.log
.DS_Store
hubspot.config.yml
```

Without this, `hs watch` will try to upload `node_modules/` which will hang or fail.

### 11. VS Code extension

Install the [HubSpot VS Code extension](https://marketplace.visualstudio.com/items?itemName=HubSpot.hubl-language-extension) for HubL syntax highlighting, snippet completions, and IntelliSense:

```bash
code --install-extension HubSpot.hubl-language-extension
```

Or search **HubSpot** in the Extensions panel (`⌘⇧X` / `Ctrl⇧X`).

**File associations** — add to `.vscode/settings.json` in the theme repo so VS Code uses the HubL language modes:

```json
{
  "files.associations": {
    "*.html": "html-hubl",
    "*.css":  "css-hubl"
  },
  "editor.suggest.snippetsPreventQuickSuggestions": false,
  "editor.parameterHints.enabled": true
}
```

`html-hubl` adds `{% %}` / `{{ }}` token colouring, tag snippets (`dnd_area`, `require_css`, `module`, etc.), and auto-complete for HubL filters. `css-hubl` handles `{{ }}` interpolation inside CSS files.

If the repo contains non-HubL HTML (e.g. a workspace with plain HTML files), scope the association to the theme subdirectory only using a nested `.vscode/settings.json`.

### 12. Design Manager vs. CLI — asset visibility

| Asset type | Design Manager file browser | `hs watch` / `hs upload` | `hs project dev` / `hs project upload` |
|---|---|---|---|
| HubL theme files (`.html`, `.css`, `.js`, `*.module/`) | ✅ Visible and editable | ✅ Two-way sync | — |
| Global partials | ✅ Editable inline | ✅ Syncs on save | — |
| Serverless functions (standalone `*.functions/`) | ✅ Under "Serverless Functions" | ✅ Uploads with theme | — |
| React CMS project source (`.tsx`, `.jsx`) | ❌ Not visible | — | ✅ Build + deploy only |
| React compiled bundles | ❌ Not visible | — | ✅ Deployed as opaque assets |
| Serverless functions (project-based) | ❌ Not visible | — | ✅ Deploy with project |
| HubDB tables | ✅ Under Marketing → Files → HubDB | CLI preview only | — |

**Key rule:** React CMS project assets live entirely outside the Design Manager. Use the CLI and project workflow exclusively for those assets.

## Verification

```bash
hs accounts list            # shows account with (default) marker
hs upload ./test-file.html themes/test-file.html   # completes without error
```

- File appears in Design Manager immediately after upload
- `https://hslocal.net:3000/` lists theme templates and modules
- `hs watch` logs "Uploaded [filename]" within 1–2 seconds of saving

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| `hs: command not found` | CLI not on `$PATH` after global install | Restart shell; check `npm bin -g` is on PATH |
| `401 Unauthorized` | Expired or wrong Personal Access Key | Regenerate key; run `hs auth` to update config |
| `403 Forbidden` on upload | Key lacks Design Manager scope | Regenerate key with Content/Design Manager scope |
| Config not found | Running `hs` outside a directory with config | Run `hs init` in project root or use `--config` flag |
| Watch hangs on large upload | `node_modules/` or build output not excluded | Add `.hsignore` |
| `hslocal.net` cert error | Self-signed cert not trusted by browser | Accept cert once, or open `https://hslocal.net:3000` directly and accept there |
| Wrong account targeted | Default portal set to wrong account | `hs accounts use <alias>` or pass `--account` |
| CI deploy fails with auth error | Secret name mismatch | Confirm secret is `HUBSPOT_PERSONAL_ACCESS_KEY` (not `HUBSPOT_ACCESS_KEY`) |

## Escalation

- If the Personal Access Key lacks permissions, ask the HubSpot account admin to grant access under `Settings → Users & Teams`.
- For environment variables in CI without `hubspot.config.yml`, set `HUBSPOT_PORTAL_ID` and `HUBSPOT_PERSONAL_ACCESS_KEY` env vars — the CLI reads them as a fallback.
- For project-based workflows (React CMS / `hsproject.json`), `hs project upload` and `hs project dev` replace `hs upload` and `hs watch` — see `hubspot-cms-react`.
- Reference repos: [hubspot-cli](https://github.com/HubSpot/hubspot-cli), [hubspot-cms-deploy-action](https://github.com/HubSpot/hubspot-cms-deploy-action)
