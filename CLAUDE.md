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

| Skill | Description |
|---|---|
| [hubspot-contact-sync](skills/hubspot-contact-sync/) | Sync contacts between HubSpot and an external system via the Contacts API |
| [hubl](skills/hubl/) | Build HubSpot CMS templates and emails using HubL — template inheritance, modules, HubDB, CRM objects, filters, and email tokens |
| [jinjava](skills/jinjava/) | Render Jinja-style templates in Java using HubSpot's Jinjava library — setup, config, custom tags/filters/functions, and error handling |
| [hubspot-public-api](skills/hubspot-public-api/) | Reference for HubSpot's public REST APIs — auth, CRM object pattern, search, batch ops, pagination, rate limits, versioning, and full endpoint catalog |
| [hubspot-cms-local-dev](skills/hubspot-cms-local-dev/) | Set up and operate the HubSpot local development environment — CLI install, auth, file sync, and preview workflow |
| [hubspot-cms-themes](skills/hubspot-cms-themes/) | Build and configure HubSpot CMS themes — file structure, fields, drag-and-drop areas, child themes, and CLI workflow |
| [hubspot-cms-modules](skills/hubspot-cms-modules/) | Create custom HubSpot CMS modules — file structure, all field types, repeaters, global modules, and editor experience |
| [hubspot-cms-templates](skills/hubspot-cms-templates/) | Author page, blog, email, and system templates in HubL — template types, inheritance, global content, and multi-language |
| [hubspot-hubdb](skills/hubspot-hubdb/) | Work with HubDB — create tables, query in HubL, build dynamic pages, and manage via CLI and API |
| [hubspot-cms-serverless](skills/hubspot-cms-serverless/) | Write and deploy CMS serverless endpoint functions — secrets, logging, third-party API calls (Content Hub Enterprise) |
| [hubspot-cms-react](skills/hubspot-cms-react/) | Build HubSpot CMS React projects — React templates/modules, project structure, local dev, and deployment |
| [hubspot-cms-membership](skills/hubspot-cms-membership/) | Build member-only content areas — access groups, login templates, CRM personalization (Content Hub Enterprise) |

## Contributing

1. One skill per directory under `skills/`.
2. `SKILL.md` frontmatter is required — the `description` field is used for routing by AI assistants.
3. Keep skills focused on a single task; link to related skills with `See also:` in the Escalation section.
4. Update this `CLAUDE.md` and `README.md` when adding a skill.
