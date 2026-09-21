---
name: hubspot-cli
description: "Reference skill for the HubSpot CLI (hs / @hubspot/cli) — install, auth, account management, CMS upload/watch/fetch, project build/deploy/dev, HubDB, secrets, sandboxes, serverless functions, and the hs mcp setup command"
compatibility: "All Hub tiers; CLI v8.x (8.15.0 current as of 2026-09-21). CLI v8.0 dropped legacy commands removed October 2025 / February 2026."
license: MIT
metadata:
  author: georgestephanis
  version: "1.1"
  written: "2026-09-21"
  written_against:
    hubspot-cli: "8.15.0 (npm @hubspot/cli)"
---

## When to use

- Installing or updating the HubSpot CLI on a developer machine
- Authenticating a new machine or adding a second HubSpot account
- Uploading, fetching, or watching CMS themes/modules/templates via `hs upload/fetch/watch`
- Building, deploying, or running local dev for a Developer Platform project (`hs project`)
- Managing HubDB tables via CLI (`hs hubdb`)
- Adding or rotating secrets for serverless functions (`hs secrets`)
- Creating a sandbox account (`hs sandbox create`)
- Running diagnostics (`hs doctor`)
- Setting up the Developer MCP server in an agentic IDE (`hs mcp setup`)

For CMS theme development and structure, see the `hubspot-cms-themes` skill.
For MCP server tools reference, see the `hubspot-mcp-server` skill.

---

## Inputs required

- Node.js v22 or higher (required by Developer Platform 2025.2+)
- HubSpot account with appropriate access (portal ID + Personal Access Key)
- `npm` or `npx` available in PATH

---

## Procedure

### 1. Install / update

```bash
npm install -g @hubspot/cli          # Install globally
npm install -g @hubspot/cli@latest   # Upgrade to latest
hs --version                         # Verify installed version
```

Pin a specific version:

```bash
npm install -g @hubspot/cli@8.2.0
```

---

### 2. Authentication

#### Modern flow (recommended — v8+)

Global config lives at `~/.hscli/config.yml` (created automatically on first auth).

```bash
hs account auth                       # Authenticate with a Personal Access Key (prompted)
hs account auth --account=myco-prod   # Add/re-auth a named account
hs account list                       # List all authenticated accounts
hs account current                    # Show which account the current dir is using
hs account default                    # Set the default account for this directory
hs account link                       # Associate an account with the current directory
hs account unlink                     # Remove directory-level account association
```

Directory-level overrides are stored in `.hs/settings.json` (auto-added to `.gitignore`).

#### Legacy flow (hubspot.config.yml — still works but migrate away)

```bash
hs init              # Interactive wizard; writes hubspot.config.yml in CWD
hs auth              # Re-auth / add portal to hubspot.config.yml
hs config migrate    # One-time: migrate hubspot.config.yml → ~/.hscli/config.yml
```

**hubspot.config.yml full schema (legacy):**

```yaml
defaultPortal: myco-prod
portals:
  - name: myco-prod
    portalId: 12345678
    authType: personalaccesskey
    personalAccessKey: "<your-pak>"
    auth:
      tokenInfo:
        accessToken: "<short-lived token, auto-refreshed>"
        expiresAt: "2026-07-01T00:00:00.000Z"
  - name: myco-staging
    portalId: 98765432
    authType: personalaccesskey
    personalAccessKey: "<staging-pak>"
```

---

### 3. Account targeting

Every `hs` command accepts `--account=<name>` to override the default:

```bash
hs upload ./my-theme themes/my-theme --account=myco-staging
```

Directory-level default (takes precedence over global default):

```bash
hs account default --account=myco-prod
```

---

### 4. CMS file commands

```bash
hs fetch <remote-path> [local-dest]   # Download from Design Manager
hs upload <local-src> <remote-dest>   # Upload to Design Manager (live immediately)
hs watch  <local-src> <remote-dest>   # Watch and auto-upload on every save
hs list   <remote-path>               # List files in Design Manager directory
hs move   <remote-src> <remote-dest>  # Move files in Design Manager
```

**Key flags:**

| Flag               | Description                                                                        |
| ------------------ | ---------------------------------------------------------------------------------- |
| `--overwrite`      | Allow `hs fetch` to overwrite existing local files                                 |
| `--remove`         | `hs watch`: delete remote file when local file is deleted                          |
| `--use-env`        | Use `HUBSPOT_PORTAL_ID` + `HUBSPOT_PERSONAL_ACCESS_KEY` env vars instead of config |
| `--account=<name>` | Target a specific account                                                          |
| `--debug`          | Print verbose request/response detail                                              |

**Fetch examples:**

```bash
hs fetch themes/my-theme ./my-theme              # Fetch a whole theme
hs fetch @hubspot/cms-theme-boilerplate starter  # Fetch a HubSpot-owned starter
hs fetch themes/my-theme/modules/hero.module     # Fetch a single module
hs fetch --overwrite themes/my-theme ./my-theme  # Overwrite existing local files
```

**Upload example:**

```bash
hs upload ./my-theme themes/my-theme
```

Remote paths are relative to the Design Manager root visible at
`app.hubspot.com/design-manager/<portalId>`.

**`.hsignore` — exclude from watch/upload:**

```
node_modules/
.git/
*.log
dist/
```

---

### 5. Theme commands

```bash
hs theme preview ./my-theme             # Live preview at https://hslocal.net:3000/
hs theme generate-editor-preview        # Generate editor-preview.json for theme
```

`hs theme preview` opens a local preview server listing all templates and modules with live-reload links. The account must be connected for domain-scoped preview.

---

### 6. Project commands (`hs project`)

Used for Developer Platform projects (UI Extensions, Public Apps, React CMS, Serverless Functions). Project source includes `hsproject.json`.

```bash
hs project create                       # Scaffold a new project interactively
hs project upload                       # Build and upload project to HubSpot
hs project deploy                       # Deploy the most recent build
hs project dev                          # Start local development server
hs project watch                        # Watch and auto-upload on save
hs project download                     # Download the last uploaded project version
hs project list                         # List existing uploaded projects
hs project open                         # Open project in HubSpot browser UI
hs project info                         # Show project and app metadata
hs project delete                       # Delete project from HubSpot account
hs project validate                     # Validate app-hsmeta.json locally
hs project lint                         # Run ESLint v9 on project components
hs project logs                         # Tail serverless function logs
hs project migrate                      # Migrate older project format
hs project install-deps                 # Install npm dependencies for all components
hs project update-deps                  # Update npm dependencies
hs project add                          # Add a new feature to an existing project
hs project profile add                  # Add a deploy profile
hs project profile delete               # Delete a deploy profile
```

**Key flags:**

| Flag                       | Description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| `--name=<name>`            | Project name                                                 |
| `--dest=<path>`            | Local destination directory                                  |
| `--platform-version=<ver>` | Platform version: `2026.09` (current), `2026.03`, `2025.2`   |
| `--features=<list>`        | Features: `card`, `settings`, `webhooks`, `workflow`, `scim` |
| `--account=<name>`         | Target account                                               |
| `--buildId=<id>`           | Target a specific build ID                                   |
| `--force`                  | Bypass blocked deploy warnings or skip deletion confirmation |
| `--port=<number>`          | Custom port for `hs project dev` local server                |

**Typical project workflow:**

```bash
hs project create --name=my-app --dest=./my-app
cd my-app
hs project install-deps
hs project dev              # Local dev with hot-reload
hs project upload           # Build and upload when ready
hs project deploy           # Promote build to live
hs project logs             # Inspect function logs
```

**Platform versions:**

- `2026.09` — **current GA** (released 2026-09-08); adds user-level app access and service keys
- `2026.03` — supported (released 2026-03-30); reintroduced serverless function support
- `2025.2` — supported (released 2025-09-02); requires Node.js v22+
- `2025.1` — **sunset** 2026-08-01
- `2023.2` — **sunset** 2025-10-01

Platform versions ship every 6 months and are supported for 18 months. Set the
version in `hsproject.json` via `"platformVersion"`.

---

### 7. HubDB commands (`hs hubdb`) — Developer Preview

```bash
hs hubdb create               # Create a new HubDB table interactively
hs hubdb fetch <tableId>      # Download table schema + rows → <tablename>.hubdb.json
hs hubdb delete <tableId>     # Delete a HubDB table from the account
hs hubdb list                 # List all HubDB tables in the account
```

Table data is saved as `<tablename>.hubdb.json`. Upload a modified file back via the HubDB API (no CLI upload command yet — use `POST /cms/hubdb/2026-09/tables/{tableId}/rows/batch/create`).

---

### 8. Secrets commands (`hs secrets`)

Secrets are account-level encrypted values exposed to serverless functions via `serverless.json`.

```bash
hs secrets add <secretName>       # Prompt for value (never echoed to terminal history)
hs secrets update <secretName>    # Update existing secret (prompt for new value)
hs secrets delete <secretName>    # Delete a secret
hs secrets list                   # List all secret names (values not shown)
```

Reference secrets in `serverless.json`:

```json
{
  "endpoints": {
    "my-endpoint": {
      "file": "main.js",
      "method": "GET"
    }
  },
  "secrets": ["MY_API_KEY"]
}
```

---

### 9. Sandbox commands (`hs sandbox`)

```bash
hs sandbox create              # Create a new sandbox (standard or development)
```

Interactive prompt asks for sandbox type:

- **Standard sandbox** — syncs supported assets from production; last 5,000 contacts + associated objects copied once.
- **Development sandbox** — blank environment for testing.

> `hs sandbox sync` was **sunset September 10, 2024**. Use the HubSpot UI to sync production assets to a standard sandbox.

---

### 10. Functions / serverless commands

```bash
hs functions list              # List all deployed serverless functions
hs functions list --account=<name>
hs cms create function         # Scaffold a new CMS serverless function
```

Logs are viewed via `hs project logs` for project-based functions or the old:

```bash
hs functions ls --account=<name>   # Legacy: also prints console.log output (90-day retention)
```

---

### 11. API command (`hs api`) — v8+

Make authenticated HTTP requests to any HubSpot API using CLI credentials:

```bash
hs api GET /crm/objects/2026-09/contacts --account=myco-prod
hs api POST /crm/objects/2026-09/contacts --body='{"properties":{"email":"test@example.com"}}'
```

Useful for quick API exploration without managing tokens manually.

---

### 12. MCP setup

```bash
hs mcp setup     # Configure Developer MCP server in supported agentic IDEs
```

Requires CLI v8.2.0+. See the `hubspot-mcp-server` skill for full MCP details.

---

### 13. Diagnostics and misc

```bash
hs doctor          # Run health check: config, auth, port availability, Node version
hs open            # Open various HubSpot URLs in browser
hs open --list     # List all browser shortcut targets
hs lint <path>     # Lint HubL templates and module files
hs completion      # Print shell completion script (bash/zsh/fish)
hs feedback        # Open HubSpot Developers feedback page
```

---

### 14. Global flags

| Flag               | Effect                                  |
| ------------------ | --------------------------------------- |
| `--account=<name>` | Target a specific authenticated account |
| `--debug`          | Verbose request/response logging        |
| `--overwrite`      | Allow local file overwrite on fetch     |
| `--remove`         | Delete remote on local delete (watch)   |
| `--force`          | Skip confirmation prompts               |
| `--buildId=<id>`   | Specify a build ID                      |
| `--use-env`        | Read credentials from env vars          |
| `--help`           | Show command help                       |

**Environment variable overrides:**

```bash
HUBSPOT_PORTAL_ID=12345678
HUBSPOT_PERSONAL_ACCESS_KEY=pat-na1-xxxxx
```

These override config file values and are compatible with `--use-env`.

---

### 15. CI/CD deployment (GitHub Actions)

```yaml
name: Deploy to HubSpot
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm install -g @hubspot/cli
      - run: hs upload ./my-theme themes/my-theme --use-env
        env:
          HUBSPOT_PORTAL_ID: ${{ secrets.HUBSPOT_PORTAL_ID }}
          HUBSPOT_PERSONAL_ACCESS_KEY: ${{ secrets.HUBSPOT_PERSONAL_ACCESS_KEY }}
```

For project-based deploys replace the `hs upload` step with `hs project upload && hs project deploy`.

---

## Verification

```bash
hs --version                         # Should print current version (8.x)
hs account list                      # Should show authenticated accounts
hs account current                   # Should show active account
hs doctor                            # Should report no errors
```

For a CMS upload:

- Check `app.hubspot.com/design-manager/<portalId>` for uploaded files
- `hs list themes/my-theme` should show the uploaded directory

For a project build:

- `hs project list` shows the project
- `hs project get-build-status` / `hs project logs` shows build details

---

## Failure modes

| Error                                     | Cause                                                    | Fix                                                                                                                                    |
| ----------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `Command not found: hs`                   | CLI not installed or not in PATH                         | `npm install -g @hubspot/cli`; restart terminal                                                                                        |
| `Failed to update the configuration file` | `~/.hscli/config.yml` read-only or owned by another user | Check file ownership: `ls -la ~/.hscli/config.yml`; fix with `chown`                                                                   |
| `403 Forbidden` on upload                 | Personal Access Key lacks Design Manager scope           | Regenerate PAK with CMS/Design Manager scope enabled                                                                                   |
| `Config not found`                        | Running `hs` outside a directory with config             | Run `hs account link` in project root or pass `--account=<name>`                                                                       |
| Watch hangs on large upload               | `node_modules/` not excluded                             | Add `node_modules/` to `.hsignore`                                                                                                     |
| `hslocal.net` certificate error           | Self-signed cert not trusted                             | Accept cert once in browser at `https://hslocal.net:3000`                                                                              |
| Wrong account targeted                    | Default portal mismatch                                  | `hs account default --account=<alias>` or pass `--account`                                                                             |
| CI deploy fails with auth error           | Env var name wrong                                       | Confirm var names are `HUBSPOT_PORTAL_ID` and `HUBSPOT_PERSONAL_ACCESS_KEY`                                                            |
| `hs sandbox sync` not found               | Command was sunset Sep 2024                              | Use HubSpot UI to sync sandbox                                                                                                         |
| Build fails after `hs project upload`     | Code error or config issue                               | Run `hs project logs` and inspect `buildErrorMessage`                                                                                  |
| Legacy command not found (v8)             | Command removed Feb 2026                                 | See [v8 migration guide](https://developers.hubspot.com/docs/developer-tooling/local-development/hubspot-cli) for replacement commands |

---

## Escalation

- CLI docs: https://developers.hubspot.com/docs/developer-tooling/local-development/hubspot-cli
- Changelog: https://developers.hubspot.com/changelog (filter by "CLI")
- GitHub: https://github.com/HubSpot/hubspot-cli
- v8 migration guide: https://developers.hubspot.com/docs/developer-tooling/local-development/hubspot-cli
- For MCP server setup: see `hubspot-mcp-server` skill
- For CMS theme development: see `hubspot-cms-themes` skill
- For project/app builds: see `hubspot-cms-react` skill
