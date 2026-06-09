---
name: hubspot-cms-modules
description: "Create, configure, and deploy custom HubSpot CMS modules — file structure, field types, global modules, and editor experience"
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
- Building a reusable content block (hero, card grid, testimonial, pricing table, etc.) for the page editor
- Creating a module that fetches and displays CRM or HubDB data
- Adding editor-configurable fields to a template section
- Building a global module shared across many pages (header, footer, nav)

A **module** is the unit of drag-and-drop content in HubSpot. Every draggable block in the page editor is a module.

## Inputs required

- HubSpot CLI installed and authenticated (see `hubspot-cms-local-dev`)
- A theme to add the module to (see `hubspot-cms-themes`), or a standalone modules directory
- Module purpose: what content does it render, what should editors be able to configure?

## Procedure

### 1. Module file structure

Each module lives in its own directory with a `.module` suffix:

```
my-module.module/
├── meta.json       # module metadata: label, icon, categories, smart content
├── fields.json     # editor-configurable fields
├── module.html     # HubL template
├── module.css      # optional scoped CSS
└── module.js       # optional scoped JavaScript
```

Create the directory and files manually, or use the CLI:

```bash
hs create module my-module
# Prompts for: label, content types (page/email/blog), destination path
```

### 2. `meta.json`

```json
{
  "label": "Feature Card",
  "css_assets": [],
  "external_js": [],
  "global": false,
  "is_available_for_new_content": true,
  "smart_type": "NOT_SMART",
  "tags": ["content", "card"],
  "host_template_types": ["PAGE", "BLOG_POST", "EMAIL"]
}
```

Key fields:
- `global` — set `true` for a module shared across pages (header, footer). Global module changes update everywhere it's placed.
- `host_template_types` — controls which template types the module appears in
- `is_available_for_new_content` — whether it shows in the editor's add-module panel

### 3. `fields.json` — field types reference

```json
[
  {
    "type": "text",
    "name": "heading",
    "label": "Heading",
    "required": true,
    "default": "Feature Title"
  },
  {
    "type": "richtext",
    "name": "body",
    "label": "Body Content",
    "default": "<p>Describe the feature here.</p>"
  },
  {
    "type": "image",
    "name": "image",
    "label": "Feature Image",
    "default": {
      "src": "",
      "alt": ""
    }
  },
  {
    "type": "cta",
    "name": "cta_button",
    "label": "Call to Action"
  },
  {
    "type": "color",
    "name": "bg_color",
    "label": "Background Color",
    "default": { "color": "#FFFFFF" }
  },
  {
    "type": "choice",
    "name": "layout",
    "label": "Layout",
    "choices": [
      ["left", "Image Left"],
      ["right", "Image Right"],
      ["top", "Image Top"]
    ],
    "default": "left"
  },
  {
    "type": "boolean",
    "name": "show_divider",
    "label": "Show Divider",
    "default": true
  },
  {
    "type": "number",
    "name": "card_count",
    "label": "Cards Per Row",
    "default": 3
  }
]
```

**Full field type list:**

| Type | Use case |
|---|---|
| `text` | Single-line plain text |
| `richtext` | WYSIWYG HTML content |
| `image` | Image picker (src, alt, width, height) |
| `video` | Video embed (HubSpot or external) |
| `link` | URL + open-in-new-tab |
| `cta` | HubSpot CTA button picker |
| `color` | Color picker with opacity |
| `font` | Font family/size/weight picker |
| `number` | Numeric input |
| `boolean` | Toggle/checkbox |
| `choice` | Single-select dropdown |
| `checkbox` | Multi-select checkbox group |
| `date` | Date picker |
| `email` | Email address input |
| `file` | File attachment picker |
| `icon` | Icon picker (FontAwesome) |
| `logo` | Site logo picker |
| `menu` | Navigation menu picker |
| `page` | HubSpot page picker |
| `blog` | Blog listing picker |
| `form` | HubSpot form picker |
| `hubdbrow` | Single HubDB row picker |
| `hubdbtable` | HubDB table picker |
| `crm_object` | CRM record picker |
| `tag` | Blog tag picker |
| `group` | Group of fields (renders as a section) |
| `repeater` | Repeating group (e.g., list of cards) |

### 4. Repeating fields (repeater groups)

```json
{
  "type": "group",
  "name": "cards",
  "label": "Cards",
  "occurrence": {
    "min": 1,
    "max": 12,
    "default": 3
  },
  "fields": [
    { "type": "text", "name": "title", "label": "Title", "default": "Card Title" },
    { "type": "image", "name": "icon", "label": "Icon Image" },
    { "type": "richtext", "name": "description", "label": "Description" }
  ]
}
```

In `module.html`, iterate with:
```html
{% for card in module.cards %}
  <div class="card">
    <img src="{{ card.icon.src }}" alt="{{ card.icon.alt }}">
    <h3>{{ card.title }}</h3>
    {{ card.description }}
  </div>
{% endfor %}
```

### 5. `module.html` — accessing fields

All field values are available under the `module` variable:

```html
<section class="feature-card feature-card--{{ module.layout }}"
         style="background-color: {{ module.bg_color.color }};">
  {% if module.image.src %}
    <img src="{{ module.image.src }}" alt="{{ module.image.alt }}">
  {% endif %}
  <div class="feature-card__content">
    <h2>{{ module.heading }}</h2>
    {{ module.body }}
    {% if module.cta_button %}
      {{ cta(module.cta_button) }}
    {% endif %}
  </div>
</section>
```

For inline editing support (lets editors click text directly on the page):
```html
<h2>{{ module.heading }}</h2>
```
Text fields are automatically inline-editable when placed in a dnd_area.

### 6. Scoped CSS and JS

`module.css` and `module.js` are automatically scoped to the module and only loaded on pages where the module is placed. Use the module's unique class added by HubSpot for scoping:

```css
.feature-card {
  display: grid;
  gap: 1.5rem;
}
.feature-card--left { grid-template-columns: 1fr 2fr; }
.feature-card--right { grid-template-columns: 2fr 1fr; }
```

```js
// module.js — runs once per page load, even if module placed multiple times
document.querySelectorAll('.feature-card').forEach(card => {
  // init logic
});
```

### 7. Global modules (header, footer)

Set `"global": true` in `meta.json`. Global module content is edited once and propagates everywhere.

```bash
# Upload to a shared location, not inside a specific theme
hs upload ./global-header.module modules/global-header.module
```

Reference in templates:
```html
{% global_module "site_header" path="modules/global-header" %}
```

### 8. Upload

```bash
# Upload module into a theme
hs upload ./my-module.module themes/my-theme/modules/my-module.module

# Or watch during development
hs watch ./my-module.module themes/my-theme/modules/my-module.module
```

## Verification

- Module appears in the **Add** panel in the page editor under the correct content type
- All fields render as expected controls in the editor's right sidebar
- Saving field values and refreshing the page shows updated content
- Repeater groups allow adding/removing items up to `max`
- Global module changes appear on all pages using it

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Module not in editor panel | `is_available_for_new_content: false` or wrong `host_template_types` | Update `meta.json` and re-upload |
| Fields not showing | `fields.json` parse error | Validate JSON syntax; check field `type` is a known value |
| `module.fieldname` is undefined | Field `name` mismatch between `fields.json` and `module.html` | Names are case-sensitive and must match exactly |
| Repeater won't add items | Missing `occurrence` config | Add `occurrence.min`/`occurrence.max` to the group |
| CSS not applied | Module JS/CSS not loading | Check browser devtools network tab; ensure file is uploaded; check for syntax errors |
| Global module edits not propagating | Module not actually set as global | Verify `"global": true` in `meta.json` and re-upload |

## Escalation

- For HubL syntax in `module.html`, see `hubl`.
- For placing modules in drag-and-drop template layouts, see `hubspot-cms-themes`.
- For HubDB field types (`hubdbrow`, `hubdbtable`), see `hubspot-hubdb`.
- For CRM object field types, see `hubspot-crm-objects`.
- [Module development docs](https://developers.hubspot.com/docs/cms/building-blocks/modules)
