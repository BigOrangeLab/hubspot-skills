---
name: hubspot-mcp-server
description: "Configure and use HubSpot's two MCP servers: the Developer MCP (local, CLI-based) for building apps and CMS assets, and the Remote CRM MCP (mcp.hubspot.com) for reading and writing CRM data from agentic IDEs. Covers setup, tools, auth, and client config for Claude Code, Cursor, VS Code, and Windsurf."
compatibility: "Developer MCP: CLI v8.15.0+ (GA); Remote CRM MCP: generally available. Both require a HubSpot account."
license: MIT
metadata:
    author: georgestephanis
    version: "2.0"
    written: "2026-09-21"
    written_against:
        hubspot-cli: "8.15.0"
        hubspot-api: "2026-09"
        remote-crm-mcp: "GA"
---

## When to use

- Connecting an agentic IDE (Claude Code, Cursor, VS Code + Copilot, Windsurf) to HubSpot for developer work — use the **Developer MCP**
- Giving an AI agent read/write access to CRM contacts, companies, deals, etc. — use the **Remote CRM MCP**
- Scaffolding, uploading, or deploying HubSpot Developer Platform projects via an AI agent
- Searching HubSpot developer docs from within an agent session (`search-docs` tool)
- Automating CRM record creation or lookup from within an AI coding session

> HubSpot has **two distinct MCP servers** with different purposes, auth models, and tool sets. Read both sections and pick the right one.

---

## Inputs required

**Developer MCP:**
- HubSpot CLI v8.15.0+ installed (`npm install -g @hubspot/cli`)
- CLI authenticated with a Personal Access Key (`hs account auth`)
- An agentic IDE with MCP support (Claude Code, Cursor, VS Code, Windsurf)

**Remote CRM MCP:**
- A HubSpot Public App (OAuth 2.0 client) with appropriate CRM scopes, **or**
- The built-in OAuth flow via `hs mcp setup` (for Claude Code specifically)
- An MCP client that supports HTTP/SSE transport with OAuth 2.1 + PKCE

---

## Server 1 — Developer MCP (local, CLI-based)

### Purpose

Enables an AI agent to scaffold, build, validate, deploy, and inspect HubSpot Developer Platform projects and CMS assets. Operates on the **developer tooling layer**, not the CRM data layer.

Requires **Developer Platform v2025.2** or higher for schema-related tools.

---

### Setup: `hs mcp setup`

```bash
npm install -g @hubspot/cli   # Must be v8.15.0+
hs account auth               # Authenticate if not already done
hs mcp setup                  # Interactive: detects installed IDEs and writes config
```

`hs mcp setup` detects supported IDEs and writes the appropriate config file. It can also be run non-interactively with `--ide=<name>`.

**What `hs mcp setup` writes:**

The command injects a server entry into each IDE's MCP config file. The entry runs `hs` as a stdio MCP server:

```json
{
  "mcpServers": {
    "hubspot": {
      "command": "hs",
      "args": ["mcp", "start"],
      "type": "stdio"
    }
  }
}
```

**Config file locations by IDE:**

| IDE | Config file path |
|---|---|
| Claude Code (project) | `.claude/settings.json` → `mcpServers` |
| Claude Code (global) | `~/.claude/settings.json` → `mcpServers` |
| Cursor | `.cursor/mcp.json` |
| VS Code (Copilot) | `.vscode/mcp.json` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` |

After setup, restart your IDE or reload the MCP servers list to activate.

#### Manual entry (if `hs mcp setup` fails or is not available)

```json
{
  "mcpServers": {
    "hubspot": {
      "command": "hs",
      "args": ["mcp", "start"],
      "type": "stdio"
    }
  }
}
```

The `hs` binary must be on PATH as seen by the IDE process. If it isn't, use the absolute path:

```json
"command": "/usr/local/bin/hs"
```

#### Account targeting

By default the server uses the account linked to the current directory (`hs account current`). To target a specific account:

```json
"args": ["mcp", "start", "--account=myco-sandbox"]
```

---

### Developer MCP tools

| Tool | Description |
|---|---|
| `validate-project` | Validates project config files (`app-hsmeta.json`, etc.) locally without uploading. Returns confirmation or a list of errors/warnings. Run this before `upload-project`. |
| `upload-project` | Builds and uploads a local project to HubSpot (creates it remotely if absent). **Destructive — only invoke on explicit user request.** Returns build ID and initial build status. |
| `deploy-project` | Deploys the most recent uploaded build to the account. Returns deployment status and deployment ID. |
| `get-feature-schema` | Returns the JSON schema for a feature's `-hsmeta.json` config file. **Always call before editing any `-hsmeta.json`.** Requires platform version 2025.2+ (use 2026.09 for new projects). |
| `get-build-status` | Retrieves build status and error messages for a project. Omit `buildId` for the most recent builds; provide it for detailed errors on a specific build. |
| `get-build-logs` | Retrieves full pipeline logs for a specific build. Use after `get-build-status` to investigate failures needing more detail. |
| `create-test-account` | Creates a new developer test account linked to the current portal. |
| `create-cms-template` | Scaffolds a new HubSpot CMS template file with correct HubL structure. |
| `get-cms-serverless-function-logs` | Retrieves production logs for a deployed CMS serverless function (90-day retention). |
| `cli-help` | Returns step-by-step CLI usage help, available flags, and next-command suggestions. Useful for onboarding or debugging CLI config issues. |
| `search-docs` | Searches official HubSpot developer documentation. Returns the most relevant pages with URLs. |

**Deprecated tools (replaced by CLI commands):**

| Tool | Replacement |
|---|---|
| `list-cms-serverless-functions` | `hs cms function list` CLI command |
| `list-cms-directory` | `hs cms list` CLI command |

---

### Developer MCP workflow example

A typical agent session scaffolding a UI Extension:

1. Agent calls `cli-help` → gets overview of project commands
2. Agent calls `get-feature-schema` for `card-hsmeta.json` → knows valid fields
3. Agent writes source files, edits `-hsmeta.json` to match schema
4. Agent calls `validate-project` → confirms config is valid
5. User approves upload; agent calls `upload-project`
6. Agent polls `get-build-status` until build completes
7. If build fails, agent calls `get-build-logs` for details → fixes and re-uploads
8. Agent calls `deploy-project` on user approval

---

## Server 2 — Remote CRM MCP (`mcp.hubspot.com`)

### Purpose

Gives AI agents direct read/write access to CRM data: contacts, companies, deals, tickets, activities, marketing emails, and more. Operates over HTTP/SSE with OAuth 2.1 + PKCE. No local CLI required.

---

### Authentication

The Remote CRM MCP uses **OAuth 2.0** via a HubSpot Public App:

1. **Create a Public App** in HubSpot → Settings → Integrations → App Marketplace → Create App
2. Under OAuth, add a redirect URI: `http://localhost:6274/oauth/callback` (for local agent clients)
   - Add `http://localhost:6274/oauth/callback/debug` for debug flows
3. Grant **read and/or write scopes** for the CRM objects you need (see scope list below)
4. Note your **Client ID** and **Client Secret**
5. Configure your IDE client with the server URL and OAuth credentials

**Minimum scopes for read-only CRM access:**
`crm.objects.contacts.read`, `crm.objects.companies.read`, `crm.objects.deals.read`

**Additional scopes:**
- Write: `crm.objects.contacts.write`, `crm.objects.companies.write`, `crm.objects.deals.write`
- Activities: `crm.objects.notes.read`, `crm.objects.calls.read`, `crm.objects.emails.read`
- Custom objects: `crm.objects.custom.read`
- Marketing: `content`, `marketing-email`

---

### Remote CRM MCP tools

**Session init (call first):**
- `get_user_details` — Returns portal ID, account type, timezone, currencies, and permission scope summary. Always call at session start to understand what data is available.

**CRM object read/write:**
- `search_crm` — Search CRM objects (contacts, companies, deals, tickets, etc.) with filters; based on the Search API
- `get_crm_object` — Get a single CRM record by ID with specified properties
- `create_crm_object` — Create a new CRM record
- `update_crm_object` — Update properties on an existing record
- `archive_crm_object` — Soft-delete (archive) a CRM record

**Properties and metadata:**
- `get_crm_properties` — List all properties for a CRM object type; pass `object_type` (`contacts`, `companies`, `deals`, etc.)
- `get_oauth_token_info` — Returns metadata for current OAuth token: user ID, hub ID, scopes, expiration

**Activities and engagements:**
- `search_contacts_by_email` — Look up contacts by email address
- `get_contact_history` — Retrieve engagement history for a contact (calls, emails, meetings, notes)

**Marketing and content:**
- `list_marketing_emails` / `get_marketing_email` — Marketing email campaigns
- `list_campaigns` / `get_campaign` — Campaigns and their associated assets
- `list_landing_pages` / `get_landing_page` — Landing pages

**Commerce:**
- `list_quotes` / `get_quote` — Quotes and their line items

**Conversations:**
- `list_threads` / `get_thread` — Inbox threads and messages

Coverage as of 2026-09 also includes **custom objects** (pass the `p_*` fully
qualified name or object type ID to the generic `*_crm_object` tools), **leads**,
and **configuration writes** — creating properties and editing pipeline stages.
Those last two mutate portal-wide schema, not a single record: confirm with the
account owner before letting an agent run them unattended.

Tool names drift between releases. Call `tools/list` (or your client's tool
listing) at session start rather than hardcoding the list above.

---

### Remote CRM MCP config by IDE

#### Claude Code (project-level)

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "hubspot": {
      "type": "http",
      "url": "https://mcp.hubspot.com",
      "oauth": {
        "clientId": "<YOUR_CLIENT_ID>",
        "authorizationEndpoint": "https://app.hubspot.com/oauth/authorize",
        "tokenEndpoint": "https://api.hubapi.com/oauth/v1/token"
      }
    }
  }
}
```

Or add via CLI:

```bash
claude mcp add --transport http hubspot "https://mcp.hubspot.com"
```

#### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "hubspot": {
      "transport": "http",
      "url": "https://mcp.hubspot.com",
      "oauth": {
        "clientId": "<YOUR_CLIENT_ID>",
        "clientSecret": "<YOUR_CLIENT_SECRET>",
        "authorizationUrl": "https://app.hubspot.com/oauth/authorize",
        "tokenUrl": "https://api.hubapi.com/oauth/v1/token",
        "redirectUrl": "http://localhost:6274/oauth/callback"
      }
    }
  }
}
```

#### VS Code (Copilot / GitHub Copilot agent mode)

Add to `.vscode/mcp.json` or user settings under `mcp`:

```json
{
  "servers": {
    "hubspot": {
      "type": "http",
      "url": "https://mcp.hubspot.com",
      "gallery": false
    }
  }
}
```

#### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "hubspot": {
      "serverType": "http",
      "url": "https://mcp.hubspot.com"
    }
  }
}
```

---

### Using `hs mcp setup` for Remote CRM MCP (Claude Code)

If you have the CLI installed and authenticated, `hs mcp setup` can configure the Remote CRM MCP as well as the Developer MCP. Follow the prompts and select "Remote CRM" when asked which server type to configure.

---

## Shipping your own MCP server in an app

Developer Platform **2026.09** adds an MCP Server component to apps: you declare
it in the project like any other component, and HubSpot hosts the endpoint and
handles auth with the installing portal's credentials. Agents connected to that
portal then see your tools alongside HubSpot's.

Use it when you want an agent to reach *your* backend with HubSpot context
already attached. If all you need is HubSpot's own data, the Remote CRM MCP
already covers it — do not wrap it.

Requires `"platformVersion": "2026.09"`. Public beta as of 2026-09; confirm
availability before committing a roadmap to it.

---

## Known limitations

### Developer MCP

- Requires CLI v8.15.0+ installed and on PATH accessible to the IDE process
- `upload-project` and `deploy-project` are **irreversible** — always validate first
- `get-feature-schema` requires Developer Platform v2025.2+; fails on older project configs
- `create-test-account` is limited by account sandbox quotas
- MCP session inherits whichever account `hs account current` resolves to — double-check with `cli-help` before destructive operations

### Remote CRM MCP

- **No vector/semantic search** — uses CRM Search API (filter-based); complex natural-language queries must be translated to property filters
- **Sensitive data mode**: if your portal has sensitive data mode enabled, Activity objects (calls, emails, meetings) are blocked — you'll get empty results, not an error
- **Short-lived tokens**: OAuth tokens rotate; if your MCP client's token storage is not atomic you risk mid-session deauthentication. Re-run `hs mcp setup` or re-authorize if this occurs
- **Rate limits apply**: all MCP tool calls count against your HubSpot API tier limits (100 req/10s on free, 150 on paid). Heavy agent loops can hit rate limits
- **Use internal property names**: `firstname`, `dealname`, `hs_object_id` — not UI display labels
- **Search hard cap**: Search API returns max 10,000 results; use the Exports API for full data dumps
- **Write tools are destructive** — always confirm with the user before `create_crm_object`, `update_crm_object`, or `archive_crm_object`

---

## Verification

**Developer MCP:**

```bash
hs --version                # Confirm v8.15.0+
hs account current          # Confirm correct account is active
hs mcp setup --list-ides    # List IDEs that hs mcp setup detected
```

In the IDE, open the MCP server list and confirm `hubspot` appears as connected. Run the `cli-help` tool — it should return CLI usage guidance.

**Remote CRM MCP:**

1. In the IDE, open the MCP server list — `hubspot` should show as connected
2. Call `get_user_details` — should return your portal ID and timezone
3. Call `get_crm_properties` with `object_type: contacts` — should return a list of property definitions

---

## Failure modes

| Error | Cause | Fix |
|---|---|---|
| MCP server not found / not connecting (Developer) | `hs` not on PATH for IDE process | Use absolute path in `command` field; check with `which hs` |
| `Developer Platform v2025.2 required` | `get-feature-schema` called on older project | Set `"platformVersion": "2026.09"` in `hsproject.json` (2023.2 sunset 2025-10-01, 2025.1 sunset 2026-08-01) |
| `upload-project` creates wrong account | Wrong account linked to directory | Run `hs account current` and `hs account default` before agent session |
| OAuth flow never completes (Remote) | Redirect URI not registered in app | Add `http://localhost:6274/oauth/callback` to the app's allowed redirect URIs |
| `403` on CRM tool calls | Token missing required scope | Edit the Public App and add needed scopes; reauthorize |
| Empty results from activity tools | Sensitive data mode enabled on portal | Use HubSpot UI to check Settings → Privacy & Consent; activity access may be blocked |
| Rate limit errors during agent loop | Agent issuing many back-to-back tool calls | Add delays between calls; use batch operations via the API directly for large ops |
| Token expired mid-session | OAuth token storage not atomic | Re-run `hs mcp setup` or reauthorize in IDE to get fresh tokens |
| `list-cms-serverless-functions` not working | Tool deprecated | Use `hs functions list` CLI command instead |

---

## Escalation

- Developer MCP docs: https://developers.hubspot.com/docs/developer-tooling/local-development/developer-mcp
- Developer MCP tools reference: https://developers.hubspot.com/docs/developer-tooling/local-development/developer-mcp/tools
- Remote CRM MCP docs: https://developers.hubspot.com/mcp
- Remote MCP changelog announcement: https://developers.hubspot.com/changelog/remote-hubspot-mcp-server-is-now-generally-available
- HubSpot CLI GitHub: https://github.com/HubSpot/hubspot-cli
- For CLI install/auth: see `hubspot-cli` skill
- For Developer Platform project structure: see `hubspot-cms-react` skill
- For CRM API patterns (when MCP is insufficient): see `hubspot-public-api` skill
