# HubSpot Agent Skills Repository

This repo collects AI agent skills for working with HubSpot CRM, Marketing Hub, Sales Hub, and related integrations.

## Layout

- `skills/` — skills authored here; follow the SKILL.md format below

## Skill file format

Each skill lives in its own directory containing `SKILL.md` with mandatory YAML frontmatter:

```yaml
---
name: skill-name
description: "One-line description used for routing"
compatibility: "HubSpot tier and API version constraints"
license: MIT
metadata:
    author: <github-handle>
    version: "1.0"
    written: "YYYY-MM-DD"
    written_against:
        hubspot-api: "vX"
---
```

Required sections (in order):

1. **When to use** — trigger conditions and routing hints
2. **Inputs required** — what to gather before starting
3. **Procedure** — step-by-step checklist
4. **Verification** — how to confirm success
5. **Failure modes** — common gotchas and error messages
6. **Escalation** — when to ask a human

Push deep reference material into a `references/` subdirectory; keep `SKILL.md` concise.

## Current skills

### Developer Infrastructure

| Skill | Description |
|---|---|
| [hubspot-public-api](skills/hubspot-public-api/) | Reference for HubSpot's public REST APIs — auth, CRM object pattern, search, batch ops, pagination, rate limits, versioning, and full endpoint catalog |
| [hubspot-private-apps](skills/hubspot-private-apps/) | Create and use HubSpot Private Apps — non-expiring scoped access tokens, scope selection, token rotation, rate limits, and split-traffic pattern for multiplying throughput |
| [hubspot-cli](skills/hubspot-cli/) | Full hs CLI reference — install, auth, account management, CMS upload/watch/fetch, project build/deploy/dev, HubDB, secrets, sandboxes, serverless functions, and hs mcp setup |
| [hubspot-mcp-server](skills/hubspot-mcp-server/) | Configure and use HubSpot's two MCP servers: Developer MCP (local, CLI-based) and Remote CRM MCP (mcp.hubspot.com) — tools, auth, IDE config for Claude Code, Cursor, VS Code, Windsurf |

### CRM

| Skill | Description |
|---|---|
| [hubspot-crm-objects](skills/hubspot-crm-objects/) | CRUD for any CRM object — contacts, companies, deals, tickets, and custom objects — plus batch ops, Search API, pagination, upsert, merge, and 429 handling |
| [hubspot-associations-v4](skills/hubspot-associations-v4/) | Manage CRM associations using the v4 API — labeled/unlabeled types, batch create/read/delete, custom label schemas, and the 250k-per-type limit |
| [hubspot-custom-objects](skills/hubspot-custom-objects/) | Create and manage custom CRM object types — Schemas API, property definition, display properties, record CRUD, p_* wildcard in UI extensions, Object Definition Pages |
| [hubspot-properties-api](skills/hubspot-properties-api/) | Manage CRM properties — all field types, property groups, internal vs. label names, unique identifiers, decimal/number display hints |

### Data & Integration

| Skill | Description |
|---|---|
| [hubspot-contact-sync](skills/hubspot-contact-sync/) | Sync contacts between HubSpot and an external system via the Contacts API |
| [hubspot-data-sync](skills/hubspot-data-sync/) | Sync data bidirectionally between HubSpot and external systems — field mapping, conflict resolution, deletion handling, and reliable incremental sync patterns |
| [hubspot-imports-exports](skills/hubspot-imports-exports/) | Bulk import and export CRM data — Imports API file upload, column mapping, async job polling, error handling, and post-import reconciliation |
| [hubspot-webhooks](skills/hubspot-webhooks/) | Subscribe to and process HubSpot webhooks — configure subscriptions, verify HMAC signatures, handle retries, deduplicate events, and fill coverage gaps with periodic polling |
| [hubspot-workflows-api](skills/hubspot-workflows-api/) | Manage automation workflows via the Flows v4 API — read/create/enroll, build custom coded actions in Developer Platform projects, Breeze AI Agent Tools, and Custom Behavioral Events |

### Marketing

| Skill | Description |
|---|---|
| [hubspot-marketing-emails](skills/hubspot-marketing-emails/) | Send marketing and transactional emails — Marketing Email API, Single Send API, token personalization, subscription types, GDPR opt-in, Campaigns API |
| [hubspot-forms](skills/hubspot-forms/) | Build and integrate HubSpot forms — v3 Forms API, non-HubSpot form submissions, dependent fields, GDPR double opt-in, submission retrieval |
| [hubspot-landing-pages-api](skills/hubspot-landing-pages-api/) | Manage landing pages via the Pages API — create/clone/publish/schedule, A/B tests, page expiry, and performance metrics |

### CMS / Content

| Skill | Description |
|---|---|
| [hubspot-cms-local-dev](skills/hubspot-cms-local-dev/) | Set up and operate the HubSpot local development environment — CLI install, auth, file sync, and preview workflow |
| [hubspot-cms-themes](skills/hubspot-cms-themes/) | Build and configure HubSpot CMS themes — file structure, fields, drag-and-drop areas, child themes, and CLI workflow |
| [hubspot-cms-modules](skills/hubspot-cms-modules/) | Create custom HubSpot CMS modules — file structure, all field types, repeaters, global modules, and editor experience |
| [hubspot-cms-templates](skills/hubspot-cms-templates/) | Author page, blog, email, and system templates in HubL — template types, inheritance, global content, and multi-language |
| [hubspot-hubdb](skills/hubspot-hubdb/) | Work with HubDB — create tables, query in HubL, build dynamic pages, and manage via CLI and API |
| [hubspot-cms-serverless](skills/hubspot-cms-serverless/) | Write and deploy CMS serverless endpoint functions — secrets, logging, third-party API calls (Content Hub Enterprise) |
| [hubspot-cms-react](skills/hubspot-cms-react/) | Build HubSpot CMS React projects — React templates/modules, project structure, local dev, and deployment |
| [hubspot-cms-membership](skills/hubspot-cms-membership/) | Build member-only content areas — access groups, login templates, CRM personalization (Content Hub Enterprise) |
| [hubl](skills/hubl/) | Build HubSpot CMS templates and emails using HubL — template inheritance, modules, HubDB, CRM objects, filters, and email tokens |
| [jinjava](skills/jinjava/) | Render Jinja-style templates in Java using HubSpot's Jinjava library — setup, config, custom tags/filters/functions, and error handling |

### App Development

| Skill | Description |
|---|---|
| [hubspot-ui-extensions](skills/hubspot-ui-extensions/) | Build React-based CRM cards and full-page extensions — project structure, card hsmeta config, hubspot.extend(), SDK hooks, component library, serverless functions, and hs project workflow |

## Contributing

1. One skill per directory under `skills/`.
2. `SKILL.md` frontmatter is required — the `description` field is used for routing by AI assistants.
3. Keep skills focused on a single task; link to related skills with `See also:` in the Escalation section.
4. Update this `CLAUDE.md` and `README.md` when adding a skill.
