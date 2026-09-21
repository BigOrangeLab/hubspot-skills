---
name: hubspot-cms-themes
description: "Build, configure, and deploy HubSpot CMS themes — file structure, theme settings fields, drag-and-drop areas, partials, child themes, and CI/CD"
compatibility: "Content Hub Starter and above; CLI v8+"
license: MIT
metadata:
    author: georgestephanis
    version: "1.2"
    written: "2026-09-21"
    written_against:
        hubspot-cli: "8.15.0"
        content-hub: "Starter+"
---

## When to use

Use this skill when:
- Creating a new HubSpot CMS website theme from scratch or from the official boilerplate
- Customising or extending an existing theme (including the default Elevate theme)
- Creating a child theme to extend a parent without editing its files
- Configuring Theme Settings fields visible to content editors
- Adding drag-and-drop (dnd) areas and reusable sections to page templates

For React-based themes (JSX instead of HubL), see `hubspot-cms-react`.

## Inputs required

- HubSpot CLI installed and authenticated — see `hubspot-cms-local-dev`
- Content Hub account (Starter or higher)
- Brand assets: colours (hex), fonts, logo
- List of page types needed (home, interior, blog, landing page, etc.)

## Procedure

### 1. Scaffold from the official boilerplate

```bash
# Fetch HubSpot's CMS Theme Boilerplate (https://github.com/HubSpot/cms-theme-boilerplate)
hs fetch @hubspot/cms-theme-boilerplate my-theme

# Or use the scaffold tool which prompts you through setup
npx @hubspot/create-cms-theme@latest
```

The boilerplate gives you a production-ready starting structure with working CSS, JS, responsive breakpoints, an accessibility-focused header, and example templates.

### 2. Theme file structure

```
my-theme/
├── theme.json              # required — theme metadata & preview config
├── fields.json             # required — Theme Settings panel definition
├── css/
│   ├── main.css            # primary stylesheet (imported in base layout)
│   ├── theme-overrides.css # post-main overrides
│   ├── components/         # per-component CSS
│   ├── elements/           # base element styles
│   ├── objects/            # layout objects
│   ├── templates/          # template-specific CSS
│   └── utilities/          # helpers
├── js/
│   └── main.js             # primary script (loaded in base layout)
├── images/
│   ├── module-icons/       # SVG icons for module meta.json
│   └── template-previews/  # screenshots referenced in template annotations
├── macros/                 # reusable HubL macro files (.html)
├── modules/                # theme-scoped custom modules (*.module/)
├── sections/               # reusable dnd section partials
└── templates/
    ├── layouts/
    │   └── base.html       # master layout (templateType: none)
    ├── partials/
    │   ├── header.html     # global_partial
    │   └── footer.html     # global_partial
    ├── home.html
    ├── landing-page.html
    ├── blog-index.html
    └── blog-post.html
```

### 3. `theme.json`

```json
{
  "label": "My Theme",
  "author": {
    "name": "Your Company",
    "email": "dev@yourcompany.com",
    "url": "https://yourcompany.com"
  },
  "preview_path": "./templates/home.html",
  "screenshot_path": "./images/template-previews/home.png",
  "enable_domain_stylesheets": false,
  "license": "./license.txt",
  "responsive_breakpoints": [
    {
      "name": "mobile",
      "mediaQuery": "@media (max-width: 767px)",
      "previewWidth": { "value": 477 }
    },
    {
      "name": "tablet",
      "mediaQuery": "@media (max-width: 1023px)",
      "previewWidth": { "value": 768 }
    }
  ]
}
```

- `preview_path` — template shown in the marketplace/theme picker preview
- `screenshot_path` — 400×300px PNG shown in Design Manager
- `enable_domain_stylesheets` — allows per-domain CSS overrides via Settings
- `responsive_breakpoints` — drives the responsive preview buttons in the page editor

### 4. `fields.json` — Theme Settings

`fields.json` controls the **Theme Settings** panel. Editors set global brand values here; templates read them via `{{ theme.<field_path> }}`.

From the boilerplate — note `inherited_value` which auto-populates from HubSpot Brand Settings:

```json
[
  {
    "label": "Global colors",
    "name": "global_colors",
    "type": "group",
    "children": [
      {
        "label": "Primary",
        "name": "primary",
        "type": "color",
        "alternate_names": ["primary_color"],
        "visibility": {
          "hidden_subfields": { "opacity": true }
        },
        "inherited_value": {
          "property_value_paths": {
            "color": "brand_settings.primaryColor"
          }
        },
        "default": { "color": "#494A52" }
      },
      {
        "label": "Secondary",
        "name": "secondary",
        "type": "color",
        "default": { "color": "#F8FAFC" }
      }
    ]
  },
  {
    "label": "Global fonts",
    "name": "global_fonts",
    "type": "group",
    "children": [
      {
        "label": "Primary",
        "name": "primary",
        "type": "font",
        "alternate_names": ["body_font"],
        "visibility": {
          "hidden_subfields": { "size": true, "styles": true }
        },
        "inherited_value": {
          "property_value_paths": {
            "color": "theme.global_colors.primary.color"
          }
        },
        "default": {
          "fallback": "sans-serif",
          "font": "Lato",
          "font_set": "GOOGLE"
        }
      }
    ]
  }
]
```

**`visibility` — conditional field display:**

```json
{
  "name": "gradient",
  "type": "gradient",
  "visibility": {
    "controlling_field": "styles.background.type",
    "controlling_value_regex": "gradient",
    "operator": "EQUAL"
  }
}
```

**`tab: "STYLE"` — moves a group to the Style tab in the editor:**

```json
{
  "name": "styles",
  "type": "group",
  "tab": "STYLE",
  "children": [ ... ]
}
```

**Access theme settings in templates and module CSS:**

```html
<style>
  :root {
    --color-primary: {{ theme.global_colors.primary.color }};
    --font-primary: {{ theme.global_fonts.primary.font }}, {{ theme.global_fonts.primary.fallback }};
  }
</style>
```

### 5. Base layout (`templates/layouts/base.html`)

The boilerplate's base layout shows the correct pattern:

```html
<!--
  templateType: none
-->
<!doctype html>
<html lang="{{ html_lang }}" {{ html_lang_dir }}>
  <head>
    <meta charset="utf-8">
    {% if page_meta.html_title or pageTitle %}
      <title>{{ page_meta.html_title or pageTitle }}</title>
    {% endif %}
    {% if brand_settings.primaryFavicon.src %}
      <link rel="shortcut icon" href="{{ brand_settings.primaryFavicon.src }}" />
    {% endif %}
    <meta name="description" content="{{ page_meta.meta_description }}">
    {{ require_css(get_asset_url("../../css/main.css")) }}
    {% if template_css %}
      {{ require_css(get_asset_url(template_css)) }}
    {% endif %}
    {{ require_css(get_asset_url("../../css/theme-overrides.css")) }}
    {{ standard_header_includes }}
  </head>
  <body>
    <div class="body-wrapper {{ builtin_body_classes }}">
      {% block header %}
        {% global_partial path="../partials/header.html" %}
      {% endblock header %}

      <main id="main-content" class="body-container-wrapper">
        {% block body %}{% endblock body %}
      </main>

      {% block footer %}
        {% global_partial path="../partials/footer.html" %}
      {% endblock footer %}
    </div>
    {{ require_js(get_asset_url("../../js/main.js")) }}
    {{ standard_footer_includes }}
  </body>
</html>
```

Key rules:
- `templateType: none` — base layouts should never be directly selectable for new content
- `{{ standard_header_includes }}` and `{{ standard_footer_includes }}` are **required** — they inject HubSpot tracking, page-level CSS/JS overrides, and accessibility tooling
- `{{ builtin_body_classes }}` — HubSpot-managed classes on `<body>` (page editor state, etc.)
- `id="main-content"` on `<main>` — required for the accessibility skip-nav pattern

### 6. Global partials (header and footer)

```html
<!--
  templateType: global_partial
  label: Website header
-->
{% module "site-logo" path="@hubspot/linked_image" %}
{% module "main-nav" path="@hubspot/menu" %}
```

- `templateType: global_partial` marks the file as a shared global region
- Changes to a global partial propagate instantly to all pages using `{% global_partial %}`
- Reference from layout: `{% global_partial path="../partials/header.html" %}`

### 7. Page template — extending the base

```html
<!--
  templateType: page
  isAvailableForNewContent: true
  label: Home
  screenshotPath: ../images/template-previews/home.png
-->
{% extends "./layouts/base.html" %}

{% block body %}
  {% dnd_area "dnd_area"
    label="Main section",
    class="body-container body-container--home"
  %}
    {% include_dnd_partial path="../sections/hero-banner.html" %}

    {% dnd_section background_color="#f8fafc" vertical_alignment="MIDDLE" %}
      {% dnd_column %}
        {% dnd_row %}
          {% dnd_module path="@hubspot/rich_text",
            html="<h2>Your content here.</h2>",
            offset=0, width=12
          %}
          {% end_dnd_module %}
        {% end_dnd_row %}
      {% end_dnd_column %}
    {% end_dnd_section %}
  {% end_dnd_area %}
{% endblock body %}
```

### 8. Reusable dnd sections as partials

Extract repeated section patterns into `sections/`:

```
sections/
├── hero-banner.html
├── call-to-action.html
├── multi-column-content.html
└── multi-row-content.html
```

Include in a template's dnd area:
```html
{% include_dnd_partial path="../sections/hero-banner.html" %}
```

`include_dnd_partial` is dnd-aware — the included content renders inside the parent `dnd_area` and remains editable.

### 9. Child themes

A child theme extends a parent, overriding only the files it includes. Everything else inherits from the parent.

```
my-child-theme/
├── theme.json          # must declare parent_theme
├── fields.json         # optional — overrides parent theme settings
└── css/
    └── child-overrides.css
```

```json
{
  "label": "My Child Theme",
  "preview_path": "./templates/home.html",
  "parent_theme": {
    "path": "themes/my-parent-theme"
  }
}
```

The parent path is relative to the Design Manager file system root. Only place files in the child theme that differ from the parent.

### 10. Upload and watch

```bash
# Upload entire theme to Design Manager
hs upload ./my-theme themes/my-theme

# Watch during development (auto-uploads on save)
hs watch ./my-theme themes/my-theme

# Local preview server
hs theme preview ./my-theme
```

### 11. Quality check before publishing

```bash
hs theme marketplace-validate ./my-theme
```

Runs Google Lighthouse against your templates and reports scores for performance, accessibility, best practices, and SEO. Fix any critical failures before deploying to production or submitting to the HubSpot Theme Marketplace.

### 12. CI/CD — auto-deploy on push

Use the [official deploy action](https://github.com/HubSpot/hubspot-cms-deploy-action):

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: HubSpot/hubspot-cms-deploy-action@v2.0.1
        with:
          src_dir: src
          dest_dir: themes/my-theme
          account_id: ${{ vars.HUBSPOT_ACCOUNT_ID }}
          personal_access_key: ${{ secrets.HUBSPOT_PERSONAL_ACCESS_KEY }}
```

## Verification

- Theme appears in **Design Manager → Themes** and in the theme picker
- **Theme Settings** panel in the page editor shows your `fields.json` groups and fields, and updates `{{ theme.* }}` values on save
- Adding modules to a `dnd_area` works in the editor; pages using the base layout show header and footer from global partials
- `hs theme marketplace-validate` passes without critical errors
- Child theme pages render the parent template for files not present in the child

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Theme not in Design Manager after upload | Missing or malformed `theme.json` at the upload root | Verify `theme.json` is at the root of `dest_dir`; check JSON syntax |
| Theme Settings panel empty | `fields.json` JSON parse error | Validate JSON; trailing commas are invalid |
| dnd area not editable | Template not being served as a page template | Check `templateType: page` annotation; `templateType: none` is not editable |
| `{{ theme.x }}` returns empty | Field name path mismatch | Name path is dot-notation: `theme.<group_name>.<field_name>` |
| `standard_header_includes` missing | Omitted from base layout `<head>` | Always include both `standard_header_includes` and `standard_footer_includes` |
| Child theme not inheriting parent | Wrong `parent_theme.path` | Path must match the exact Design Manager path of the uploaded parent |
| Google Fonts not loading | `font_set` wrong value | Use `"font_set": "GOOGLE"` — other values: `"DEFAULT"`, `"CUSTOM"` |
| `include_dnd_partial` not editable | Used `{% include %}` instead of `{% include_dnd_partial %}` | Only `include_dnd_partial` preserves dnd editability |

## Escalation

- For module development within a theme, see `hubspot-cms-modules`.
- For HubL template syntax, see `hubspot-cms-templates` and `hubl`.
- For React-based themes, see `hubspot-cms-react`.
- Reference: [cms-theme-boilerplate](https://github.com/HubSpot/cms-theme-boilerplate), [hubspot-cms-deploy-action](https://github.com/HubSpot/hubspot-cms-deploy-action)
