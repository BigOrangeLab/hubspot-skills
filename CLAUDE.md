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

## Contributing

1. One skill per directory under `skills/`.
2. `SKILL.md` frontmatter is required — the `description` field is used for routing by AI assistants.
3. Keep skills focused on a single task; link to related skills with `See also:` in the Escalation section.
4. Update this `CLAUDE.md` and `README.md` when adding a skill.
