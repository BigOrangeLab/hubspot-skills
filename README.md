# HubSpot Agent Skills

A shared repository of AI agent skills for working with HubSpot — CRM, Marketing Hub, Sales Hub, and related integrations. Skills teach AI assistants (Claude Code, Cursor, etc.) HubSpot-specific procedures for common tasks.

## Installation

### Claude Code (project-level)

Add this repo as a submodule inside your project's `.claude/skills/` directory:

```bash
git submodule add https://github.com/BigOrangeLab/hubspot-skills .claude/skills/hubspot
```

Then reference the skills you want in your project's `.claude/settings.json`:

```json
{
  "skills": [".claude/skills/hubspot/skills/hubspot-crm-objects"]
}
```

### Claude Code (user-level)

To make skills available in all your projects, clone to `~/.claude/skills/`:

```bash
git clone https://github.com/BigOrangeLab/hubspot-skills ~/.claude/skills/hubspot
```

Then add entries to `~/.claude/settings.json` as above.

## Skills

### Developer Infrastructure

Start here — these skills cover auth, the CLI, and API fundamentals that all other skills depend on.

| Skill                                                    | Description                                                                                                                                                                   | Written against                |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| [hubspot-api-versioning](skills/hubspot-api-versioning/) | Date-based API versioning — how `/2026-09/` paths work, the v1–v4 end-of-support calendar, legacy→date-based endpoint map, and which families have no GA version yet          | HubSpot API 2026-09            |
| [hubspot-public-api](skills/hubspot-public-api/)         | Reference for HubSpot's public REST APIs — auth, CRM object pattern, search, batch ops, pagination, rate limits, and full endpoint catalog                                    | HubSpot API 2026-09            |
| [hubspot-private-apps](skills/hubspot-private-apps/)     | Account service keys (current) and legacy private apps (sunsetting) — scoped tokens, rotation, introspection, rate limits, split-traffic pattern                              | HubSpot API 2026-09            |
| [hubspot-cli](skills/hubspot-cli/)                       | Full hs CLI reference — install, auth, account management, upload/fetch/watch, project build/deploy, HubDB, secrets, sandboxes, and hs mcp setup                              | CLI v8.15.0                    |
| [hubspot-mcp-server](skills/hubspot-mcp-server/)         | Configure and use HubSpot's Developer MCP (local, CLI-based) and Remote CRM MCP (mcp.hubspot.com) — tools, auth, and client config for Claude Code, Cursor, VS Code, Windsurf | CLI v8.15.0, Remote CRM MCP GA |

### CRM

Working with the HubSpot object model — records, schemas, properties, and associations.

| Skill                                                    | Description                                                                                                                               | Written against                  |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| [hubspot-crm-objects](skills/hubspot-crm-objects/)       | CRUD for any CRM object type — batch ops, Search API, cursor pagination, upsert, merge, and 429 handling                                  | HubSpot API 2026-09              |
| [hubspot-associations](skills/hubspot-associations/)     | Manage CRM associations — labeled/unlabeled types, batch create/read/delete, Schema API for custom labels, 250k-per-type limit            | HubSpot API 2026-09              |
| [hubspot-custom-objects](skills/hubspot-custom-objects/) | Create custom CRM object types — Schemas API, property definitions, record CRUD, p\_\* wildcard in UI extensions, Object Definition Pages | Operations Hub Pro+; CRM 2026-09 |
| [hubspot-properties-api](skills/hubspot-properties-api/) | Manage CRM properties — all field/type combinations, property groups, unique identifiers, decimal display hints (2026)                    | HubSpot API 2026-09              |

### Data & Integration

Moving data into and out of HubSpot, and reacting to changes in real time.

| Skill                                                      | Description                                                                                                                                           | Written against                                                |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [hubspot-contact-sync](skills/hubspot-contact-sync/)       | **Deprecated** — use `hubspot-crm-objects`, `hubspot-data-sync`, or `hubspot-imports-exports`                                                         | —                                                              |
| [hubspot-data-sync](skills/hubspot-data-sync/)             | Sync data bidirectionally between HubSpot and external systems — field mapping, conflict resolution, deletion handling, and incremental sync patterns | HubSpot API 2026-09                                            |
| [hubspot-imports-exports](skills/hubspot-imports-exports/) | Bulk import and export CRM data — Imports API file upload, column mapping, async job polling, error handling, and post-import reconciliation          | HubSpot API 2026-09                                            |
| [hubspot-webhooks](skills/hubspot-webhooks/)               | Configure webhook subscriptions, verify HMAC signatures, deduplicate events, handle retries, hybrid polling pattern                                   | HubSpot API 2026-09                                            |
| [hubspot-workflows-api](skills/hubspot-workflows-api/)     | Flows v4 API — CRUD, enrollment, custom coded actions, Breeze AI Agent Tools, Custom Behavioral Events                                                | automation/v4 (no GA date version), Developer Platform 2026.09 |

### Marketing

Email, forms, landing pages, and campaign management.

| Skill                                                          | Description                                                                                                                               | Written against                           |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [hubspot-marketing-emails](skills/hubspot-marketing-emails/)   | Marketing and transactional emails — Marketing Email API, Single Send API, token personalization, subscription types, GDPR, Campaigns API | Marketing Hub Starter+; marketing 2026-09 |
| [hubspot-forms](skills/hubspot-forms/)                         | HubSpot forms — Forms API v3, headless submissions, dependent fields, GDPR double opt-in, submission retrieval                            | marketing/v3/forms (no GA date version)   |
| [hubspot-landing-pages-api](skills/hubspot-landing-pages-api/) | Landing pages API — create/clone/publish/schedule, A/B tests, page expiry, performance metrics                                            | Marketing Hub Starter+; cms 2026-09       |

### CMS / Content

Building and authoring on the HubSpot CMS — templates, modules, themes, and dynamic content.

| Skill                                                    | Description                                                                                                                             | Written against                  |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| [hubspot-cms-local-dev](skills/hubspot-cms-local-dev/)   | **Deprecated** — use `hubspot-cli` and `hubspot-cms-themes`                                                                             | —                                |
| [hubspot-cms-themes](skills/hubspot-cms-themes/)         | Build HubSpot CMS themes — file structure, theme settings, drag-and-drop areas, child themes                                            | CLI v8.15.0                      |
| [hubspot-cms-modules](skills/hubspot-cms-modules/)       | Create custom CMS modules — all field types, repeaters, global modules, editor experience                                               | CLI v8.15.0                      |
| [hubspot-cms-templates](skills/hubspot-cms-templates/)   | Author page, blog, email, and system templates in HubL — inheritance, global content, multi-language                                    | CLI v8.15.0                      |
| [hubspot-hubdb](skills/hubspot-hubdb/)                   | Work with HubDB — table creation, HubL queries, dynamic pages, CLI and REST API                                                         | HubSpot API 2026-09, CLI v8.15.0 |
| [hubspot-cms-serverless](skills/hubspot-cms-serverless/) | CMS serverless endpoint functions — secrets, logging, third-party APIs (Content Hub Enterprise)                                         | CLI v8.15.0, Node.js v22         |
| [hubspot-cms-react](skills/hubspot-cms-react/)           | CMS React projects — React templates/modules, project structure, local dev, CI/CD deploy                                                | CLI v8.15.0, Node.js v22         |
| [hubspot-cms-membership](skills/hubspot-cms-membership/) | Member-only content — access groups, login templates, CRM personalization (Content Hub Enterprise)                                      | CLI v8.15.0                      |
| [hubl](skills/hubl/)                                     | Build HubSpot CMS templates and emails using HubL — template inheritance, modules, HubDB, CRM objects, filters, and email tokens        | HubSpot CMS 2026                 |
| [jinjava](skills/jinjava/)                               | Render Jinja-style templates in Java using HubSpot's Jinjava library — setup, config, custom tags/filters/functions, and error handling | Jinjava 2.x                      |

### App Development

Extending the HubSpot platform with custom UI and application components.

| Skill                                                  | Description                                                                                                                             | Written against            |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| [hubspot-ui-extensions](skills/hubspot-ui-extensions/) | React-based CRM cards and full-page extensions — hsmeta config, SDK hooks, component library, serverless functions, dev/deploy workflow | Developer Platform 2026.09 |

## Skill format

Each skill is a `SKILL.md` file with YAML frontmatter and these sections:

1. **When to use** — trigger conditions
2. **Inputs required** — prerequisites
3. **Procedure** — step-by-step checklist
4. **Verification** — how to confirm success
5. **Failure modes** — common gotchas
6. **Escalation** — when to ask a human

## Contributing

See [CLAUDE.md](CLAUDE.md) for the skill format spec and conventions.

PRs welcome. Skills should be focused on a single task and include real API versions in the `written_against` frontmatter so freshness can be tracked over time.

## License

[MIT](LICENSE)
