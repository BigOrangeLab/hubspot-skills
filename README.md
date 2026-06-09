# HubSpot Agent Skills

A shared repository of AI agent skills for working with HubSpot — CRM, Marketing Hub, Sales Hub, and related integrations. Skills teach AI assistants (Claude Code, Cursor, etc.) HubSpot-specific procedures for common tasks.

## Installation

### Claude Code (project-level)

Add this repo as a submodule inside your project's `.claude/skills/` directory:

```bash
git submodule add https://github.com/bigorangelab/hubspot-skills .claude/skills/hubspot
```

Then reference the skills you want in your project's `.claude/settings.json`:

```json
{
  "skills": [
    ".claude/skills/hubspot/skills/hubspot-contact-sync"
  ]
}
```

### Claude Code (user-level)

To make skills available in all your projects, clone to `~/.claude/skills/`:

```bash
git clone https://github.com/bigorangelab/hubspot-skills ~/.claude/skills/hubspot
```

Then add entries to `~/.claude/settings.json` as above.

## Skills

| Skill | Description | Written against |
|---|---|---|
| [hubspot-contact-sync](skills/hubspot-contact-sync/) | Sync contacts between HubSpot and an external system via the Contacts API | HubSpot API v3 |
| [hubl](skills/hubl/) | Build HubSpot CMS templates and emails using HubL — template inheritance, modules, HubDB, CRM objects, filters, and email tokens | HubSpot CMS 2026 |
| [jinjava](skills/jinjava/) | Render Jinja-style templates in Java using HubSpot's Jinjava library — setup, config, custom tags/filters/functions, and error handling | Jinjava 2.x |
| [hubspot-public-api](skills/hubspot-public-api/) | Reference for HubSpot's public REST APIs — auth, CRM object pattern, search, batch ops, pagination, rate limits, and full endpoint catalog | HubSpot API v3 / 2025-09 |
| [hubspot-cms-local-dev](skills/hubspot-cms-local-dev/) | Set up the HubSpot local dev environment — CLI install, auth, file sync, and preview workflow | CLI v7.10 |
| [hubspot-cms-themes](skills/hubspot-cms-themes/) | Build HubSpot CMS themes — file structure, theme settings, drag-and-drop areas, child themes | CLI v7.10 |
| [hubspot-cms-modules](skills/hubspot-cms-modules/) | Create custom CMS modules — all field types, repeaters, global modules, editor experience | CLI v7.10 |
| [hubspot-cms-templates](skills/hubspot-cms-templates/) | Author page, blog, email, and system templates in HubL — inheritance, global content, multi-language | CLI v7.10 |
| [hubspot-hubdb](skills/hubspot-hubdb/) | Work with HubDB — table creation, HubL queries, dynamic pages, CLI and REST API | HubSpot API v3, CLI v7.10 |
| [hubspot-cms-serverless](skills/hubspot-cms-serverless/) | CMS serverless endpoint functions — secrets, logging, third-party APIs (Content Hub Enterprise) | CLI v7.10, Node.js v20 |
| [hubspot-cms-react](skills/hubspot-cms-react/) | CMS React projects — React templates/modules, project structure, local dev, CI/CD deploy | CLI v7.10, Node.js v20 |
| [hubspot-cms-membership](skills/hubspot-cms-membership/) | Member-only content — access groups, login templates, CRM personalization (Content Hub Enterprise) | CLI v7.10 |
| [hubspot-cli](skills/hubspot-cli/) | Full hs CLI reference — install, auth, account management, upload/fetch/watch, project build/deploy, HubDB, secrets, sandboxes, and hs mcp setup | CLI v8.x |
| [hubspot-mcp-server](skills/hubspot-mcp-server/) | Configure and use HubSpot's Developer MCP (local, CLI-based) and Remote CRM MCP (mcp.hubspot.com) — tools, auth, and client config for Claude Code, Cursor, VS Code, Windsurf | CLI v8.2.0, GA June 2025 |
| [hubspot-private-apps](skills/hubspot-private-apps/) | Create and use HubSpot Private Apps — non-expiring scoped access tokens, scope selection, token rotation, rate limits, and split-traffic pattern | HubSpot API v3 |
| [hubspot-crm-objects](skills/hubspot-crm-objects/) | CRUD for any CRM object type — batch ops, Search API, cursor pagination, upsert, merge, and 429 handling | HubSpot API crm/v3 |
| [hubspot-ui-extensions](skills/hubspot-ui-extensions/) | React-based CRM cards and full-page extensions — hsmeta config, SDK hooks, component library, serverless functions, dev/deploy workflow | Developer Platform v2025.2 |
| [hubspot-webhooks](skills/hubspot-webhooks/) | Configure webhook subscriptions, verify HMAC signatures, deduplicate events, handle retries, hybrid polling pattern | HubSpot webhooks/v3 |
| [hubspot-workflows-api](skills/hubspot-workflows-api/) | Flows v4 API — CRUD, enrollment, custom coded actions, Breeze AI Agent Tools, Custom Behavioral Events | automation/v4, Developer Platform v2025.2 |
| [hubspot-data-sync](skills/hubspot-data-sync/) | Sync data bidirectionally between HubSpot and external systems — field mapping, conflict resolution, deletion handling, and incremental sync patterns | HubSpot API v3/v4 |
| [hubspot-imports-exports](skills/hubspot-imports-exports/) | Bulk import and export CRM data — Imports API file upload, column mapping, async job polling, error handling, and post-import reconciliation | HubSpot API v3 |

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
