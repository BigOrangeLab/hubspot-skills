---
name: hubspot-cms-local-dev
description: "Set up and operate the HubSpot local development environment — CLI install, auth, file sync, and preview workflow"
compatibility: "All Content Hub tiers; CLI v7+"
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-06-09"
    written_against:
        hubspot-cli: "7.10"
---

## When to use

Use this skill whenever starting any HubSpot CMS development work locally — before building themes, modules, or templates. Also use when:
- Connecting a new machine to a HubSpot account
- Switching between multiple HubSpot accounts
- Troubleshooting sync or upload issues
- Setting up version control for CMS assets

## Inputs required

- HubSpot account with Content Hub access (Starter or higher for most features)
- Node.js v20 or higher (`node --version`)
- npm (comes with Node)
- HubSpot account ID (found in account settings URL: `app.hubspot.com/settings/<accountId>`)
- Personal Access Key from HubSpot (for CLI auth) — generate at: `app.hubspot.com/portal/<accountId>/personal-access-key`

## Procedure

### 1. Install the CLI

```bash
npm install -g @hubspot/cli
hs --version   # confirm install; expect 7.x
```

### 2. Initialize configuration

Run from your project root (or home directory for global config):

```bash
hs init
```

This creates `hubspot.config.yml` in the current directory. It will prompt for:
- **Account nickname** — a local alias (e.g., `mycompany-prod`)
- **Personal Access Key** — paste the key generated from the portal URL above

For multiple accounts, run `hs auth` to add additional accounts to the same config file:

```bash
hs auth
```

CLI v7+ supports multi-config — you can have per-project `hubspot.config.yml` files that override the global one. The CLI resolves configs walking up from the current directory.

### 3. Verify authentication

```bash
hs accounts list    # shows all configured accounts and which is default
```

To switch the default account for the current session:

```bash
hs accounts use <nickname>
```

### 4. Fetch existing assets from HubSpot

```bash
# Fetch a specific directory from the Design Manager file system
hs fetch <remote-path> <local-path>

# Examples:
hs fetch @hubspot/cms-theme-boilerplate my-theme
hs fetch themes/my-theme ./local-theme
```

The remote path is relative to the root of the Design Manager file system.

### 5. Watch for local changes and auto-upload

```bash
cd <local-project-directory>
hs watch <local-path> <remote-path>

# Example: watch and sync a theme
hs watch ./my-theme themes/my-theme
```

Keep the watch process running during development. Every saved file is uploaded immediately.

### 6. Manual upload

```bash
hs upload <local-src> <remote-dest>

# Upload an entire theme directory:
hs upload ./my-theme themes/my-theme
```

### 7. Local preview server

```bash
hs theme preview <local-theme-path>
```

Opens `https://hslocal.net:3000/` — lists all templates and modules in the theme with clickable preview links. Also shows connected domains for domain-specific preview.

### 8. Fetch Design Manager logs

```bash
hs logs <function-name>    # serverless function logs
```

### Project-based workflow (themes as Projects)

For React CMS projects or themes wrapped in an `hsproject.json`:

```bash
hs project create           # scaffold a new project
hs project upload           # build and deploy to HubSpot
hs project dev              # local dev server (React projects)
```

## Verification

- `hs accounts list` shows your account with a `(default)` marker
- `hs upload` completes without error and files appear in Design Manager
- `https://hslocal.net:3000/` loads and lists theme templates/modules
- Changes made locally appear on a preview page within seconds of saving

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| `hs: command not found` | CLI not on PATH after install | Restart shell or run `npm install -g @hubspot/cli` again with correct Node version |
| `401 Unauthorized` | Expired or wrong Personal Access Key | Regenerate key at `app.hubspot.com/portal/<id>/personal-access-key`, run `hs auth` again |
| Config not found | Running `hs` outside a directory with `hubspot.config.yml` | Run `hs init` in project root, or set `--config` flag |
| Watch upload hangs | Large binary files or `.gitignore` not excluding `node_modules` | Add a `.hsignore` file (same syntax as `.gitignore`) to exclude build artifacts |
| `hslocal.net` certificate error | Browser not trusting self-signed cert | Accept the cert in browser, or run `hs theme preview` again which re-generates certs |
| Multi-account confusion | Wrong default account | Run `hs accounts use <nickname>` to switch |

## Escalation

- If Personal Access Key permissions are insufficient, ask the HubSpot account admin to grant Design Manager access in `Settings → Users & Teams`.
- For CI/CD environments, use `HUBSPOT_PORTAL_ID` and `HUBSPOT_PERSONAL_ACCESS_KEY` environment variables instead of `hubspot.config.yml`.
- See also: `hubspot-cms-themes`, `hubspot-cms-react` for next steps after environment setup.
