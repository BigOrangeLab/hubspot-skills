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
