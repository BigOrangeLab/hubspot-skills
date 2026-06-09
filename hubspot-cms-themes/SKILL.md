---
name: hubspot-cms-themes
description: "Build, configure, and deploy HubSpot CMS themes — file structure, fields, drag-and-drop areas, child themes, and CLI workflow"
compatibility: "Content Hub Starter and above; CLI v7+"
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-06-09"
    written_against:
        hubspot-cli: "7.10"
        content-hub: "Starter+"
---

## When to use

Use this skill when:
- Creating a new HubSpot CMS website theme from scratch or from a boilerplate
- Customizing an existing theme (including the default Elevate theme)
- Creating a child theme to extend a parent without modifying its files
- Configuring theme settings panels for content editors
- Adding flexible sections / drag-and-drop areas to page templates

## Inputs required

- HubSpot CLI installed and authenticated (see `hubspot-cms-local-dev`)
- HubSpot account with Content Hub access
- Decision: HubL-based theme vs. React CMS project (see `hubspot-cms-react` for the latter)
- Design brief: brand colors, fonts, breakpoints, layout grid

## Procedure

### 1. Scaffold a new theme

**Option A — HubSpot boilerplate:**
```bash
hs fetch @hubspot/cms-theme-boilerplate my-theme
cd my-theme
```

**Option B — HubSpot scaffold tool (recommended for new projects):**
```bash
npx @hubspot/create-cms-theme@latest
# Prompts for: theme name, account, optional starter template
```

**Option C — Start from the Elevate default theme:**
```bash
hs fetch themes/Elevate my-theme   # fetch HubSpot's current default theme
```

### 2. Understand the theme file structure

```
my-theme/
├── theme.json          # theme metadata, preview settings
├── fields.json         # global theme settings (colors, fonts, spacing)
├── templates/          # HubL page templates (.html)
├── css/                # stylesheets (referenced in templates)
├── js/                 # scripts
├── images/             # static assets
├── macros/             # reusable HubL macros (.html)
├── modules/            # theme-scoped custom modules
└── layouts/            # optional: named layout wrappers
```

### 3. Configure `theme.json`

```json
{
  "label": "My Theme",
  "preview_path": "templates/home.html",
  "screenshot_path": "images/theme-preview.png",
  "enable_domain_stylesheets": true,
  "version": "1.0.0"
}
```

Key fields:
- `preview_path` — template HubSpot shows in the theme marketplace preview
- `screenshot_path` — 400×300px PNG shown in Design Manager
- `enable_domain_stylesheets` — allows per-domain CSS overrides

### 4. Define theme settings in `fields.json`

`fields.json` controls the **Theme Settings** panel visible to content editors.

```json
[
  {
    "type": "group",
    "name": "brand_colors",
    "label": "Brand Colors",
    "fields": [
      {
        "type": "color",
        "name": "primary",
        "label": "Primary Color",
        "default": { "color": "#0066CC" }
      },
      {
        "type": "color",
        "name": "secondary",
        "label": "Secondary Color",
        "default": { "color": "#FF6B35" }
      }
    ]
  },
  {
    "type": "font",
    "name": "body_font",
    "label": "Body Font",
    "default": {
      "font": "Open Sans",
      "font_set": "GOOGLE",
      "size": 16,
      "size_unit": "px"
    }
  }
]
```

Access theme settings in HubL templates with `theme.<field_name>`:
```html
<style>
  :root {
    --color-primary: {{ theme.brand_colors.primary.color }};
    --font-body: {{ theme.body_font.font }}, sans-serif;
  }
</style>
```

### 5. Create drag-and-drop areas in templates

Drag-and-drop areas let editors add, remove, and reorder modules on a page.

```html
{% dnd_area "main_content" label="Main Content" %}
  {% dnd_section %}
    {% dnd_column %}
      {% dnd_row %}
        {% dnd_module path="@hubspot/rich_text" %}
        {% end_dnd_module %}
      {% end_dnd_row %}
    {% end_dnd_column %}
  {% end_dnd_section %}
{% end_dnd_area %}
```

- `dnd_area` — the outermost container; `label` appears in the editor sidebar
- `dnd_section` — a full-width horizontal row with a background
- `dnd_column` — a column within a section (columns define the grid)
- `dnd_row` — a row within a column
- `dnd_module` — a pre-placed default module (editors can add more)

### 6. Create a child theme

Child themes extend a parent, overriding only specific files.

```
my-child-theme/
├── theme.json        # must declare parent_theme
└── css/
    └── overrides.css
```

In `theme.json`:
```json
{
  "label": "My Child Theme",
  "parent_theme": {
    "path": "themes/Elevate"
  }
}
```

Only files present in the child theme directory override the parent. Everything else inherits.

### 7. Upload and watch

```bash
# One-time upload
hs upload ./my-theme themes/my-theme

# Watch mode during development
hs watch ./my-theme themes/my-theme

# Preview in browser
hs theme preview ./my-theme
```

### 8. Run Lighthouse quality checks

The CLI bundles Google Lighthouse for theme quality scoring:

```bash
hs theme marketplace-validate ./my-theme
```

Reports scores for: performance, accessibility, best practices, SEO. Review failures before deploying to production.

## Verification

- Theme appears in **Design Manager → Themes** after upload
- **Theme Settings** panel in the page editor shows your `fields.json` groups and fields
- Dragging modules into `dnd_area` regions works in the page editor
- Child theme pages render parent templates for files not overridden
- `hs theme marketplace-validate` passes without critical errors

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Theme doesn't appear in Design Manager | Upload path mismatch or missing `theme.json` | Verify `theme.json` is at the root of the uploaded directory |
| Theme settings not showing | `fields.json` JSON syntax error | Validate JSON; check for trailing commas |
| `dnd_area` not editable | Template not set to "Flexible" layout type | In Design Manager, set template type or check `is_available_for_new_content` |
| Child theme shows parent styles only | Child CSS file not in correct path | Ensure child file path exactly matches the relative path in the parent |
| Font not loading from `fields.json` | `font_set` not set to `GOOGLE` or `CUSTOM` | Use `"font_set": "GOOGLE"` for Google Fonts; upload custom fonts to File Manager first |

## Escalation

- For React-based themes (not HubL), see `hubspot-cms-react`.
- For building custom modules within a theme, see `hubspot-cms-modules`.
- For HubL template syntax, see `hubspot-cms-templates` and `hubl`.
- HubSpot Elevate theme source: `hs fetch themes/Elevate`.
- [Theme development docs](https://developers.hubspot.com/docs/cms/building-blocks/themes)
