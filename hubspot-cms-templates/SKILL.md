---
name: hubspot-cms-templates
description: "Author HubSpot CMS page, blog, email, and system templates using HubL — template types, inheritance, global content, and multi-language"
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
- Creating new page, blog, email, or system templates for a HubSpot theme
- Setting up template inheritance between a base layout and child templates
- Adding global content regions (header/footer shared across templates)
- Building multi-language template variants
- Configuring which templates are available to content editors

## Inputs required

- HubSpot CLI installed and authenticated (see `hubspot-cms-local-dev`)
- A theme directory to add templates to (see `hubspot-cms-themes`)
- Knowledge of HubL syntax (see `hubl`)
- List of template types needed: page, blog listing, blog post, email, system pages

## Procedure

### 1. Template types

| Template type | Purpose | File location convention |
|---|---|---|
| `page` | Standard website pages | `templates/page-name.html` |
| `blog_listing` | Blog index / archive page | `templates/blog-listing.html` |
| `blog_post` | Individual blog post | `templates/blog-post.html` |
| `email` | Marketing / transactional emails | `templates/email-name.html` |
| `error_page` | 404, 500 etc. | `templates/404.html` |
| `password_prompt` | Password-protected page login | `templates/password-prompt.html` |
| `membership_login` | Member login page | `templates/membership-login.html` |
| `search_results` | Site search results | `templates/search-results.html` |

Declare the type in the template's HubL `templateType` annotation:

```html
<!--
  templateType: page
  label: "Landing Page - Full Width"
  isAvailableForNewContent: true
  screenshotPath: ../images/template-previews/full-width.png
-->
```

### 2. Base template (master layout)

Create a `_base.html` that all other templates extend:

```html
<!--
  templateType: page
  label: Base Layout
  isAvailableForNewContent: false
-->
<!doctype html>
<html lang="{{ html_lang }}" {{ html_lang_dir }}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {{ standard_header_includes }}
  {% block head_css %}
    {{ require_css(get_asset_url('../css/main.css')) }}
  {% endblock %}
</head>
<body class="{{ body_classes }}">
  {% global_module "site_header" path="modules/global-header" %}

  {% block body %}{% endblock %}

  {% global_module "site_footer" path="modules/global-footer" %}

  {{ standard_footer_includes }}
  {% block footer_js %}{% endblock %}
</body>
</html>
```

Key built-in HubL variables:
- `{{ standard_header_includes }}` — HubSpot tracking, required meta tags
- `{{ standard_footer_includes }}` — HubSpot tracking scripts, required at end of `<body>`
- `{{ body_classes }}` — HubSpot-managed CSS classes on `<body>`
- `{{ html_lang }}` / `{{ html_lang_dir }}` — language/RTL support

### 3. Child templates using `extends` / `block`

```html
<!--
  templateType: page
  label: "Landing Page - Two Column"
  isAvailableForNewContent: true
-->
{% extends "./base.html" %}

{% block body %}
<main class="page-two-col">
  <aside>
    {% dnd_area "sidebar" label="Sidebar" %}{% end_dnd_area %}
  </aside>
  <section>
    {% dnd_area "main_content" label="Main Content" %}
      {% dnd_section %}
        {% dnd_column %}
          {% dnd_row %}
            {% dnd_module path="@hubspot/rich_text" %}{% end_dnd_module %}
          {% end_dnd_row %}
        {% end_dnd_column %}
      {% end_dnd_section %}
    {% end_dnd_area %}
  </section>
</main>
{% endblock %}
```

- `{% extends %}` path is relative to the current template file
- `{% block %}` / `{% endblock %}` marks overridable regions
- A block in a child template completely replaces the parent block

### 4. Blog templates

**Blog listing template** — shows the list of posts:
```html
<!--
  templateType: blog_listing
  label: Blog Listing
  isAvailableForNewContent: true
-->
{% extends "./base.html" %}

{% block body %}
<main>
  <h1>{{ blog_name }}</h1>
  {% for content in contents %}
    <article>
      <h2><a href="{{ content.absolute_url }}">{{ content.name }}</a></h2>
      <time>{{ content.publish_date|datetimeformat('%B %d, %Y') }}</time>
      <p>{{ content.post_summary }}</p>
    </article>
  {% endfor %}
  {% blog_pagination %}
</main>
{% endblock %}
```

**Blog post template** — renders individual posts:
```html
<!--
  templateType: blog_post
  label: Blog Post
  isAvailableForNewContent: true
-->
{% extends "./base.html" %}

{% block body %}
<article>
  <h1>{{ content.name }}</h1>
  <div class="post-body">{{ content.post_body }}</div>
  {% blog_comments "default" %}
</article>
{% endblock %}
```

### 5. Email templates

```html
<!--
  templateType: email
  label: "Marketing Email - Standard"
-->
<html>
<head>
  {{ email_header }}
</head>
<body>
  <table>
    <tr>
      <td>
        {% dnd_area "email_body" label="Email Body" %}
          {% dnd_section %}
            {% dnd_column %}
              {% dnd_row %}
                {% dnd_module path="@hubspot/text" %}{% end_dnd_module %}
              {% end_dnd_row %}
            {% end_dnd_column %}
          {% end_dnd_section %}
        {% end_dnd_area %}
      </td>
    </tr>
  </table>
  {{ email_footer }}
</body>
</html>
```

Required email variables:
- `{{ email_header }}` — tracking pixels, preheader
- `{{ email_footer }}` — unsubscribe link (legally required), HubSpot tracking

### 6. Global content

Global partials are shared across templates — edit once, update everywhere.

**Declare a global module in a template:**
```html
{% global_module "unique_id" path="modules/global-header" %}
```

**Declare a global group (wraps multiple elements):**
```html
{% global_group "site_nav" %}
  {% module "logo" path="@hubspot/linked_image" %}
  {% module "main_nav" path="@hubspot/menu" %}
{% end_global_group %}
```

### 7. `require_css` and `require_js`

Load assets conditionally — only included on pages where the call runs:

```html
{{ require_css(get_asset_url('../css/hero.css')) }}
{{ require_js(get_asset_url('../js/hero.js')) }}
```

`get_asset_url()` resolves paths relative to the theme root and handles CDN fingerprinting.

### 8. Multi-language template variants

HubSpot uses language slugs and `html_lang` automatically when multi-language variants are created in the CMS. In templates, use `{{ html_lang }}` on the `<html>` tag and check `{{ content.language }}` for conditional content.

### 9. Template annotations reference

```html
<!--
  templateType: page
  label: "My Template Label"
  isAvailableForNewContent: true
  screenshotPath: ../images/previews/my-template.png
-->
```

`isAvailableForNewContent: false` hides a template from content editors while keeping it available as a parent for `extends`.

## Verification

- Template appears in the **Select a template** dialog when creating a new page (if `isAvailableForNewContent: true`)
- `extends` / `block` inheritance renders parent layout correctly
- `standard_header_includes` and `standard_footer_includes` are present in rendered HTML source
- Blog listing shows posts; blog post shows `content.post_body`
- Email template renders in HubSpot email editor with dnd areas

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Template not in new-page picker | `isAvailableForNewContent: false` or wrong `templateType` | Update annotation and re-upload |
| `extends` renders blank page | Wrong relative path in `{% extends %}` | Path must be relative to the template file, not the theme root |
| Missing tracking scripts | `standard_header_includes` / `standard_footer_includes` omitted | Add both — HubSpot will warn about missing tracking |
| Blog listing shows no posts | Blog listing not connected to a blog in Settings | In Settings → Website → Blog, assign the listing template to a blog |
| Email unsubscribe link missing | `email_footer` omitted | Always include `{{ email_footer }}` in email templates |

## Escalation

- For HubL variables, filters, and functions, see `hubl`.
- For module placement and drag-and-drop layout, see `hubspot-cms-modules` and `hubspot-cms-themes`.
- For membership-gated templates, see `hubspot-cms-membership`.
- [Template types reference](https://developers.hubspot.com/docs/cms/building-blocks/templates/types)
