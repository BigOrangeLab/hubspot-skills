---
name: hubspot-cms-modules
description: "Create custom HubSpot CMS modules — file structure, all field types, Style tab, repeaters, conditional visibility, global modules, and scoped CSS/JS"
compatibility: "Content Hub Starter and above; CLI v7+"
license: MIT
metadata:
    author: georgestephanis
    version: "1.1"
    written: "2026-06-09"
    written_against:
        hubspot-cli: "7.10"
        content-hub: "Starter+"
---

## When to use

Use this skill when:
- Building a reusable content block for the drag-and-drop page editor (hero, card grid, testimonial, pricing table, etc.)
- Creating a module that exposes editor-configurable style options (background, border, spacing)
- Adding a global module shared across all pages (header, footer, navigation)
- Building a module that fetches and displays HubDB or CRM data

A **module** is the atomic unit of drag-and-drop content. Every block an editor can add, move, or configure in the page editor is a module.

## Inputs required

- HubSpot CLI installed and authenticated — see `hubspot-cms-local-dev`
- A theme directory to place the module in — see `hubspot-cms-themes`
- Module purpose: what it renders and what editors should be able to configure

## Procedure

### 1. Module file structure

Each module lives in its own `*.module` directory:

```
card.module/
├── meta.json       # module metadata: label, icon, template types, categories
├── fields.json     # editor-configurable fields (Content tab + Style tab)
├── module.html     # HubL template — renders the module output
├── module.css      # optional — scoped CSS loaded only when module is on page
└── module.js       # optional — scoped JS loaded only when module is on page
```

Create via CLI (prompts for label, template types, destination):
```bash
hs create module card
```

### 2. `meta.json`

From the [boilerplate card module](https://github.com/HubSpot/cms-theme-boilerplate/tree/main/src/modules/card.module):

```json
{
  "label": "Card",
  "css_assets": [],
  "external_js": [],
  "global": false,
  "host_template_types": ["PAGE"],
  "icon": "../../images/module-icons/info-circle-solid.svg",
  "js_assets": [],
  "other_assets": [],
  "smart_type": "NOT_SMART",
  "tags": [],
  "is_available_for_new_content": true,
  "categories": ["body_content"]
}
```

Key fields:
- `global` — `true` for a module shared across all pages (header, footer). Changes propagate everywhere.
- `host_template_types` — `["PAGE"]`, `["EMAIL"]`, `["BLOG_POST"]`, or combinations
- `is_available_for_new_content` — whether the module appears in the editor's add panel
- `categories` — `"body_content"`, `"commerce"`, `"forms_and_subscriptions"` — affects editor organisation
- `icon` — path to an SVG icon shown in the editor panel

### 3. `fields.json` — Content fields

Content fields appear on the **Content tab** in the editor sidebar.

**Real example — boilerplate card module with a repeater:**

```json
[
  {
    "label": "Card",
    "name": "card",
    "type": "group",
    "occurrence": {
      "default": 3,
      "min": 1,
      "sorting_label_field": "card.title"
    },
    "children": [
      {
        "label": "Image",
        "name": "image",
        "type": "image",
        "responsive": true,
        "resizable": true,
        "show_loading": true,
        "default": { "loading": "lazy" }
      },
      {
        "label": "Content",
        "name": "text",
        "type": "richtext",
        "enabled_features": [
          "advanced_emphasis", "alignment", "block",
          "font_family", "font_size", "lists", "standard_emphasis"
        ],
        "default": "<h3>Card title</h3><p>Card description.</p>"
      }
    ]
  }
]
```

**`occurrence`** — makes a group into a repeater:
- `min` / `max` — optional; omitting `max` allows unlimited items
- `sorting_label_field` — dotted path to the field shown as each item's label in the editor
- Editors can drag to reorder, add, and remove items

**Iterate in `module.html`:**
```html
{% for card in module.card %}
  <section class="card">
    {% if card.image.src %}
      <img src="{{ card.image.src|escape_url }}"
           alt="{{ card.image.alt|escape_attr }}"
           loading="{{ card.image.loading }}">
    {% endif %}
    <div class="card__text">{{ card.text|sanitize_html }}</div>
  </section>
{% endfor %}
```

### 4. Style fields — the STYLE tab

Adding `"tab": "STYLE"` to a group moves it to the **Style tab** in the editor sidebar. This separates editorial content from design choices.

```json
{
  "label": "Styles",
  "name": "styles",
  "type": "group",
  "tab": "STYLE",
  "children": [
    {
      "label": "Card background",
      "name": "background_type",
      "type": "choice",
      "choices": [
        ["none",     "None"],
        ["color",    "Color"],
        ["gradient", "Gradient"],
        ["image",    "Image"]
      ],
      "display": "radio",
      "default": "none"
    },
    {
      "label": "Color",
      "name": "bg_color",
      "type": "color",
      "visibility": {
        "controlling_field": "styles.background_type",
        "controlling_value_regex": "color",
        "operator": "EQUAL"
      }
    },
    {
      "label": "Gradient",
      "name": "bg_gradient",
      "type": "gradient",
      "visibility": {
        "controlling_field": "styles.background_type",
        "controlling_value_regex": "gradient",
        "operator": "EQUAL"
      }
    },
    {
      "label": "Border",
      "name": "border",
      "type": "border"
    },
    {
      "label": "Corner radius",
      "name": "radius",
      "type": "number",
      "display": "text",
      "max": 100,
      "step": 1,
      "suffix": "px"
    },
    {
      "label": "Spacing",
      "name": "spacing",
      "type": "spacing"
    }
  ]
}
```

**Emit style fields as CSS using `{% scope_css %}` inside `{% require_css %}`:**

```html
{% require_css %}
  <style>
    {% scope_css %}
      .card {
        {% if module.styles.background_type == "color" and module.styles.bg_color.color %}
          background-color: rgba(
            {{ module.styles.bg_color.color|convert_rgb }},
            {{ module.styles.bg_color.opacity / 100 }}
          );
        {% elif module.styles.background_type == "gradient" %}
          background: {{ module.styles.bg_gradient.css }};
        {% endif %}
        {{ module.styles.border.css }}
        {% if module.styles.radius >= 0 %}
          border-radius: {{ module.styles.radius ~ "px" }};
        {% endif %}
        {{ module.styles.spacing.css }}
      }
    {% end_scope_css %}
  </style>
{% end_require_css %}
```

`{% scope_css %}` namespaces the rules to avoid collisions between multiple instances of the same module on one page. `{% require_css %}` ensures the styles are only injected once regardless of how many instances are on the page.

### 5. Complete field type reference

| Type | Notes |
|---|---|
| `text` | Single-line plain text |
| `richtext` | WYSIWYG HTML; use `enabled_features` to restrict toolbar |
| `image` | Object with `src`, `alt`, `width`, `height`, `loading`, `size_type` |
| `embed` | External video / media / iframe. `supported_source_types`: `["oembed","html"]` (+ `supported_oembed_types` e.g. `["video","rich"]`). Render the oEmbed/HTML output — see the [oEmbed field docs](https://developers.hubspot.com/docs/cms/building-blocks/module-theme-fields/oembed). **There is no `video` module field type** — `type: "video"` fails upload with `'unknown' is not a valid field type`. |
| `link` | **Use for any URL/link.** Object with `url` (`{ href, type }`), `open_in_new_tab`, `no_follow`; optional `supported_types` (e.g. `["EXTERNAL","CONTENT","FILE","EMAIL_ADDRESS","BLOG"]`). **There is no `url` module field type** — `type: "url"` fails upload with `'unknown' is not a valid field type`. |
| `cta` | HubSpot CTA button picker; render with `{{ cta(module.cta_field) }}` |
| `color` | Object with `color` (hex) and `opacity` (0–100); use `\|convert_rgb` filter |
| `gradient` | Object with `.css` property — emit directly |
| `font` | Object with `font`, `font_set`, `size`, `size_unit`, `styles`, `color` |
| `border` | Object with `.css` property |
| `spacing` | Object with `.css` property (margin + padding) |
| `backgroundimage` | Object with `.css` property for background-image shorthand |
| `number` | Numeric input; optional `min`, `max`, `step`, `suffix` |
| `boolean` | Toggle; renders as checkbox |
| `choice` | Single-select; set `display: "radio"` or `"select"` |
| `checkbox` | Multi-select checkbox group |
| `date` | Date picker |
| `datetime` | Date + time picker |
| `email` | Email address input |
| `phone` | Phone number input |
| `icon` | FontAwesome icon picker |
| `logo` | Site logo picker |
| `menu` | Navigation menu picker |
| `page` | CMS page picker |
| `blog` | Blog picker |
| `form` | HubSpot form picker |
| `tag` | Blog tag picker |
| `hubdbrow` | Single HubDB row picker |
| `hubdbtable` | HubDB table picker |
| `crm_object` | CRM record picker |
| `file` | File attachment from File Manager. Value is a **plain URL string**, not an object — no `.url`/`.player_id`/`.thumbnail_url`. Add `"picker": "video"` (sibling of `id`, first key) to restrict the File Manager UI to video files — this is the correct type for a HubSpot-hosted MP4 that doesn't need Marketing-Hub-gated player features (CTAs, analytics); use `embed` instead for external oEmbed video (YouTube/Vimeo) |
| `group` | Groups other fields; optional `tab: "STYLE"` |

### 6. Conditional field visibility

Use `visibility` to show/hide fields based on another field's value:

```json
{
  "name": "button_url",
  "type": "link",
  "visibility": {
    "controlling_field": "show_button",
    "controlling_value_regex": "true",
    "operator": "EQUAL"
  }
}
```

Supported operators: `EQUAL`, `NOT_EQUAL`, `MATCHES_REGEX`, `EMPTY`, `NOT_EMPTY`.

### 7. Scoped CSS and JS

`module.css` and `module.js` are automatically:
- Loaded only on pages where the module is used
- Combined and cached by HubSpot's asset pipeline

```css
/* module.css */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.card__image {
  width: 100%;
  height: auto;
}
```

```js
/* module.js */
// Runs once per page load regardless of how many instances are placed
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mouseenter', () => card.classList.add('is-hovered'));
  card.addEventListener('mouseleave', () => card.classList.remove('is-hovered'));
});
```

### 8. Image rendering best practice

Always handle all three `size_type` values from an `image` field:

```html
{% if card.image.src %}
  {% set sizeAttrs %}
    {% if card.image.size_type == "auto" %}
      style="max-width:100%;height:auto;"
    {% elif card.image.size_type == "auto_custom_max" %}
      width="{{ card.image.max_width|escape_attr }}"
      height="{{ card.image.max_height|escape_attr }}"
      style="max-width:100%;height:auto;"
    {% else %}
      width="{{ card.image.width|escape_attr }}"
      height="{{ card.image.height|escape_attr }}"
    {% endif %}
  {% endset %}
  {% set loadingAttr = card.image.loading != "disabled" ? 'loading="' ~ card.image.loading ~ '"' : "" %}
  <img src="{{ card.image.src|escape_url }}"
       alt="{{ card.image.alt|escape_attr }}"
       {{ loadingAttr }}
       {{ sizeAttrs }}>
{% endif %}
```

Always escape: `|escape_url` on `src`, `|escape_attr` on `alt` and dimension attributes.
Always sanitise richtext: `{{ card.text|sanitize_html }}`

### 9. Global modules

```json
{ "global": true, ... }
```

Upload to a shared path (outside any specific theme):
```bash
hs upload ./site-header.module modules/global/site-header.module
```

Reference from any template:
```html
{% global_module "site_header" path="modules/global/site-header" %}
```

Editing a global module's content in any page editor updates all pages simultaneously.

### 10. Inline editing

`text` and `richtext` fields automatically enable **click-to-edit** directly on the page canvas — no extra configuration required. When the module is placed inside a `dnd_area`, editors can click the text or rich text output on the live page preview and type in place without opening the sidebar.

Rules and limitations:
- Inline editing is only active for modules placed in a `dnd_area`. Fixed (non-dnd) modules in templates do not support it.
- `text` fields inline-edit as a plain-text input. `richtext` fields open an inline WYSIWYG toolbar.
- Other field types (images, links, choices, etc.) are always edited via the sidebar panel, never inline.
- Adding `"inline_help_text"` to a field definition shows a tooltip in the sidebar but does not affect inline editing.

### 11. Upload

```bash
hs upload ./card.module themes/my-theme/modules/card.module
# or watch the whole theme
hs watch ./my-theme themes/my-theme
```

### 12. Upload round-trip: canonical key order (avoiding diff churn)

HubSpot re-serializes `fields.json` and `meta.json` on every upload/fetch into a
fixed canonical key order (Jackson-style formatting). If you hand-author fields
in a different order, the next `fetch` rewrites them — noisy diffs with no
semantic change. Two ways to avoid it:

- **Author minimal, then round-trip.** Write the fields you need, `hs upload`,
  then `hs fetch` the module back and commit *that*. Simplest, and the fetched
  form is authoritative.
- **Author in canonical order up front.** Every field's keys follow:

  `id → name → label → [inline_help_text] → required → locked → [occurrence] → [visibility] → «type-specific» → type → display_width → [default]`

  Exception: `file`'s `picker` key comes **before** `id`, not before `type`.

  Type-specific keys slot in before `type`: `text`→`allow_new_line`;
  `richtext`→`enabled_features`; `choice`→`display, choices, multiple,
  reordering_enabled, preset`; `number`→`display, min, max, step, suffix`;
  `boolean`→`display`; `link`→`supported_types, show_advanced_rel_options`;
  `image`→`responsive, resizable, show_loading`; `font`→`load_external_fonts`;
  `group`→`children, tab, expanded, group_occurrence_meta`.

HubSpot also injects `locked: false` and `display_width: null` on every field,
sets each field's `id` to its dotted path (`group.child` for nested fields), and
expands `visibility` to `{ controlling_field, controlling_field_path,
controlling_value_regex, property, operator, access }` and `occurrence` to
`{ min, max, sorting_label_field, default }`.

`meta.json` gains a **server-assigned `module_id`** on first upload — you cannot
pre-write it, so it always shows up in the first post-upload fetch. Commit it
then, in a follow-up commit after the one that scaffolds the module.

## Verification

- Module appears in the **Add** panel for the configured `host_template_types`
- Style tab appears when `"tab": "STYLE"` groups are defined
- Repeater allows adding/removing/reordering items in the editor
- `{% scope_css %}` styles are unique per module instance on page (inspect class names in DOM)
- `module.css` and `module.js` appear in page source only on pages where the module is placed
- Global module content changes propagate to all pages immediately on publish

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Module not in Add panel | `is_available_for_new_content: false` or wrong `host_template_types` | Update `meta.json` and re-upload |
| Fields not showing | `fields.json` parse error | Validate JSON; check all `type` values are valid strings |
| Upload fails: `'unknown' is not a valid field type` (often with spurious `missing field name` / `<group>.null is missing a label` alongside) | A field uses a `type` that isn't a real module field type — commonly `video` or `url` | Use `link` for URLs. For video: `embed` for external oEmbed (YouTube/Vimeo); `file` + `"picker": "video"` for a HubSpot File Manager-hosted MP4 (returns a plain URL string, not an object). One bad type triggers all three errors at once, so fix the type before chasing the "missing name/label" noise |
| Upload fails: `Unknown file type for module file <name>` | A non-module file (e.g. `README.md`, notes, `.DS_Store`) is sitting inside the `.module` directory | A `.module` dir accepts only `meta.json`, `fields.json`, `module.html`, `module.css`, `module.js`, and registered assets. Move other files out, or add the filename to a project-root `.hsignore` (the CLI honors it on upload/watch) |
| `module.fieldname` is undefined in template | Field `name` mismatch (case-sensitive) | Names in `fields.json` and `module.html` must match exactly |
| Repeater shows no add/remove controls | Missing or malformed `occurrence` object | Add `"occurrence": { "min": 1 }` to the group |
| Scoped CSS not applied | Using `<style>` directly instead of `require_css` + `scope_css` | Wrap in `{% require_css %}<style>{% scope_css %}...{% end_scope_css %}</style>{% end_require_css %}` |
| CSS/JS loaded on all pages | Files not in `module.css`/`module.js` — loaded via `require_css` in `module.html` always-runs path | Move global assets to theme CSS; use module files for module-specific assets |
| Style tab not showing | `tab` value typo | Value must be exactly `"STYLE"` (uppercase) |

## Escalation

- For HubL syntax in `module.html`, see `hubl`.
- For placing modules in dnd areas, see `hubspot-cms-themes` and `hubspot-cms-templates`.
- For HubDB-driven modules, see `hubspot-hubdb`.
- Reference: [cms-theme-boilerplate/modules](https://github.com/HubSpot/cms-theme-boilerplate/tree/main/src/modules)
