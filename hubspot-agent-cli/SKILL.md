---
name: hubspot-agent-cli
description: "HubSpot's official Agent CLI (the `hubspot` binary) — a command-line tool purpose-built for AI agents (Claude Code, Codex, ChatGPT) to work directly with CRM objects, pipelines, properties, associations, custom object schemas, workflows, activities, and saved reports. Covers install, auth, the dry-run/digest safety pattern required before any write, output formats, and how it differs from the `hs` CLI and the Remote CRM MCP server. Public beta since 2026-06-23."
compatibility: "Public beta. Single binary, macOS/Linux/Windows. Requires HubSpot user auth (`hubspot auth login`) or a service key via `HUBSPOT_ACCESS_TOKEN` for automation."
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-09-28"
    written_against:
        hubspot-agent-cli: "public beta (2026-06-23)"
---

> **Public beta.** HubSpot's own README warns: "Commands, flags, and behavior may
> change without notice." Write operations can permanently modify or delete live
> CRM data. Always prefer a sandbox account, and never skip `--dry-run` on a
> destructive command — the CLI itself refuses most destructive operations
> without a completed dry-run digest first.

## When to use

- You (the agent) are working directly in a terminal/local or agent workspace
  and need to read, bulk-edit, or report on HubSpot CRM data — not build a
  hosted integration or CMS asset
- The user asks to bulk-update, bulk-delete, or bulk-merge CRM records,
  properties, pipelines, or workflows and wants a previewable, auditable way to
  do it instead of hand-rolling REST calls
- The user wants to run an ad-hoc SQL-style aggregate query against CRM objects
  (e.g. deals grouped by stage) and turn it into a saved report, without waiting
  for the separate HubSQL beta (see `hubspot-hubsql`)
- Setting up a Claude Code / Codex / ChatGPT agent workspace to operate against
  a specific HubSpot portal

Do **not** use this skill for:
- Building a server-side integration or webhook consumer → use
  `hubspot-crm-objects` / the REST API directly
- CMS theme/module/project development, HubDB, or serverless functions → use
  `hubspot-cli` (the `hs` CLI — a completely different tool with a similar name)
- Giving an agent live, in-conversation read/write access to a portal via MCP
  tool calls rather than a local CLI process → use `hubspot-mcp-server`
  (Remote CRM MCP)

### Agent CLI vs. `hs` CLI vs. MCP — pick the right tool

| | **Agent CLI** (`hubspot`) | **`hs` CLI** | **Remote CRM MCP** |
|---|---|---|---|
| Skill | this one | `hubspot-cli` | `hubspot-mcp-server` |
| Audience | AI agents operating on CRM data | Developers building CMS/apps/projects | AI agents via MCP tool calls, no local process |
| Domain | CRM objects, pipelines, properties, associations, workflows, activities, reports | Themes, modules, projects, HubDB, secrets, serverless, sandboxes | CRM read/write via MCP |
| Safety model | Mandatory `--dry-run` digest before destructive ops, local audit log | Standard confirm prompts | Whatever the MCP client/host enforces |
| Status | Public beta | GA | GA |

---

## Inputs required

- A HubSpot portal to authenticate against
- Either interactive browser auth (`hubspot auth login`) or, for
  unattended/automation use, a service key token in `HUBSPOT_ACCESS_TOKEN` (see
  `hubspot-private-apps`)
- For anything destructive: ideally a sandbox account (Enterprise), since a
  standard sandbox copies production pipelines, properties, and workflows for
  safe testing

---

## Procedure

### 1. Install

```bash
# macOS / Linux
curl -fsSL https://api.hubapi.com/hub/cli/backend/hub-cli/latest/install.sh | sh

# Windows (PowerShell)
irm https://api.hubapi.com/hub/cli/backend/hub-cli/latest/install.ps1 | iex

hubspot --version
```

Single static binary, no runtime dependencies. All traffic goes through
`api.hubapi.com` — allowlist that host in network-restricted environments.

### 2. Set up an agent workspace (Claude Code, Codex, Claude Cowork)

Run the install command above, then:

```bash
hubspot auth login
npx skills add hubspot/agent-cli-skills   # HubSpot's own companion skills package
hubspot --help                             # explore the command tree
```

`agent-cli-skills` is HubSpot's first-party skills package purpose-built for
this CLI (CRM lookup, bulk operations, data quality, workflow automation). If
it's installed in the current environment, prefer it over improvising raw CLI
calls — it will have more current command coverage than this skill, since the
CLI is beta and evolving quickly.

### 3. Authenticate

```bash
hubspot auth login      # interactive browser auth, scoped to the user's permissions, auto-refreshed
hubspot whoami           # confirm which account/token is active
hubspot auth logout      # clear cached credentials
```

For unattended/scripted use, set `HUBSPOT_ACCESS_TOKEN` to a service key token
instead (see `hubspot-private-apps` for creating one). Admin-gated commands
(schema create/update/delete, some pipeline/property deletes) require a service
key with sufficient scopes, not just interactive user auth.

### 4. Explore the command tree

Every level is self-documenting:

```bash
hubspot --help
hubspot objects --help
hubspot objects list --help
```

Command groups as of this writing:

| Group | Subcommands | Notes |
|---|---|---|
| `objects` | `types`, `list`, `get <id>`, `search`, `create`, `update <id>`, `merge`, `upsert`, `delete <id>` | Core CRM record CRUD across any object type |
| `pipelines` | `list`, `get`, `create`, `update`, `delete`, `stages`, `stages-get/create/update/delete` | Deal/ticket pipeline and stage management |
| `properties` | `list`, `get`, `create`, `update`, `delete`, `batch-read`, `batch-create`, `batch-archive` | |
| `associations` | `list`, `create`, `delete`, `batch-read`, `batch-delete`, `batch-delete-labels`, `labels-*`, `limits-*` | See also `hubspot-associations` for the underlying v4 model |
| `owners` | `list` | Read-only |
| `schemas` | `list`, `get <objectType>`, `create`, `update`, `delete` | Custom object schemas; admin-gated |
| `workflows` | `list`, `get <flowId>`, `create`, `update <flowId>`, `delete <flowId>` | Update/delete require the `automation` scope; see the companion blog post on safe bulk workflow edits |
| `views` | `list`, `get`, `create`, `update`, `replace-field`, `delete` | Saved CRM list views |
| `activities` | `list`, `transcript get/delete`, `emails threads get`, `calls dispositions list` | |
| `reports` | `create`, `list`, `get`, `fetch-dataset`, `insights`, `clone`, `favorite`, `unfavorite`, `delete` | `create` accepts a SQL-style query directly — see step 6 |
| top-level | `auth login/logout`, `whoami`, `upgrade`, `history`, `feedback <message>` | `history` is the local audit log of destructive operations |

### 5. The dry-run / digest safety pattern (required for destructive ops)

The CLI will not let you run most destructive commands (delete, some updates,
merges, batch archives) without first completing a dry-run:

```bash
# 1. Dry run — previews the change, returns a digest + confirmation value
hubspot views delete contacts 12345 --dry-run

# 2. Re-run supplying the digest and a matching confirmation string
hubspot views delete contacts 12345 --digest blast-radius-abc123 --confirm "VIP contacts"
```

`--dry-run` output is shape-compatible with the input of the next command, so
it's safe to pipe a dry-run preview into review tooling before committing. Use
`hubspot history` afterward to see the local audit log of what actually ran.

Apply this pattern to **every** destructive operation you perform on behalf of
a user, not just the ones the CLI happens to hard-block — the whole point of
this tool is bulk/repeated changes across many records, which is exactly where
an unreviewed mistake is expensive.

### 6. Ad-hoc SQL-style queries via `reports create`

`reports create` already accepts a SQL-style query string against CRM objects,
independent of the separate (and still fully private) HubSQL beta — see
`hubspot-hubsql`:

```bash
hubspot reports create "SELECT dealstage, COUNT(*) FROM DEAL GROUP BY dealstage" \
  --name "Deals by stage" --chart-type bar

hubspot reports create "SELECT dealname, amount FROM DEAL WHERE amount > 10000" \
  --name "Big deals" --filter-owners 12345 --filter-teams 67890
```

Other flags seen: `--description`, `--date-range`, `--access-classification`,
`--permission-level`. This is undocumented in full formal syntax (no published
grammar, no confirmed list of queryable objects beyond `DEAL` in the examples)
— treat it as directionally useful, verify object/field names against
`hubspot objects types` and `hubspot properties list` first, and don't assume
every CRM object or join HubSQL eventually promises is already supported here.

### 7. Output formats

- `--format jsonl` (default) — one JSON object per line, good for piping/scripting
- `--format json` — a single wrapped JSON array with metadata
- `--format table` — human-readable ASCII table for interactive use
- `--properties` flattens requested fields to top-level, prefixed `prop_`
- `objects search` takes `--filter`; `--type` selects the object type across commands

### 8. Keeping it current

```bash
hubspot upgrade        # update the CLI binary itself
npx skills update       # update the agent-cli-skills companion package
```

Since this is public beta, re-verify command syntax against `--help` output
before relying on anything in this skill that looks stale — HubSpot has
explicitly said commands and flags may change without notice.

---

## Verification

```bash
hubspot --version
hubspot whoami
hubspot objects types --type contacts   # sanity-check auth + connectivity
```

For a destructive operation, verification is the dry-run digest step itself
(step 5) plus checking `hubspot history` after the real run to confirm exactly
what was changed.

---

## Failure modes

| Situation | Cause | Fix |
|---|---|---|
| Command refuses to run, asks for `--dry-run` | Destructive op attempted directly | Run with `--dry-run` first, then re-run with the returned `--digest`/`--confirm` |
| `403`/permission error on `schemas` or `pipelines` commands | Interactive user auth lacks admin rights | Use a service key (`HUBSPOT_ACCESS_TOKEN`) with sufficient scopes, see `hubspot-private-apps` |
| Workflow update/delete rejected | Missing `automation` scope on the auth token | Add the scope to the service key or re-authenticate with a user who has workflow permissions |
| CLI blocked by network policy | Outbound traffic to `api.hubapi.com` not allowlisted | Allowlist that host in the managed/restricted environment |
| Confused with the `hs` CLI | Similar naming, unrelated tools | See the comparison table above — `hs` is for CMS/projects, this is for CRM data ops |
| Command/flag from this skill no longer exists | Public beta, changes without notice | Re-check `hubspot <group> --help`; prefer the live `agent-cli-skills` package if installed |

---

## Escalation

- Official docs: https://developers.hubspot.com/docs/developer-tooling/local-development/agent-cli/guide
- GitHub (issues, install scripts): https://github.com/HubSpot/agent-cli
- Companion skills package: https://github.com/HubSpot/agent-cli-skills
- Knowledge base (end-user framing): https://knowledge.hubspot.com/integrations/use-the-hubspot-agent-cli
- For the underlying REST semantics behind any CLI command: `hubspot-crm-objects`, `hubspot-associations`, `hubspot-properties-api`, `hubspot-workflows-api`
- For credentials: `hubspot-private-apps`
- If asked to do something the CLI doesn't yet cover: fall back to the REST API skills above, or `hubspot-mcp-server`
