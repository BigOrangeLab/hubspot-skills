---
name: hubspot-cms-templates
description: "Author HubSpot CMS page, blog, landing page, email, and system templates using HubL — template types, inheritance, partials, blog variables, and multi-language"
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
- Creating new page templates for a HubSpot CMS theme
- Setting up blog listing and blog post templates
- Building landing page templates (no header/footer, conversion-focused)
- Creating system templates (404, password-prompt, membership login/register)
- Understanding how `extends`/`block` inheritance works in HubL templates
- Adding template-specific CSS without modifying the base stylesheet

For React-based templates (JSX instead of HubL), see `hubspot-cms-react`.

## Inputs required

- HubSpot CLI installed and authenticated — see `hubspot-cms-local-dev`
- A theme with a base layout already in place — see `hubspot-cms-themes`
- Knowledge of HubL syntax — see `hubl`

## Procedure

### 1. Template types and annotations

Every HubL template file begins with an HTML comment containing YAML-style annotations:

```html
<!--
  templateType: page
  isAvailableForNewContent: true
  label: Home
  screenshotPath: ../images/template-previews/home.png
-->
```

| Annotation | Required | Notes |
|---|---|---|
| `templateType` | Yes | See table below |
| `isAvailableForNewContent` | Recommended | `false` hides from content editors but keeps available as a parent |
| `label` | Recommended | Name shown in the template picker |
| `screenshotPath` | Optional | Path to a preview image (400×300px PNG) |

**Template type values:**

| `templateType` | Use case |
|---|---|
| `page` | Standard website pages |
| `blog_listing` | Blog index / post archive |
| `blog_post` | Individual blog post |
| `email` | Marketing or transactional emails |
| `error_page` | 404, 500, etc. |
| `password_prompt` | Password-protected page login form |
| `membership_login` | Member login page |
| `membership_register` | Member registration page |
| `membership_reset_password` | Password reset flow |
| `search_results` | Site search results page |
| `none` | Base/partial layouts — never selectable directly |
| `global_partial` | Shared header/footer regions |

### 2. Base layout (`templateType: none`)

The base layout is the master shell that all other templates extend. It must use `templateType: none` so it never appears in the template picker.

From the [CMS Theme Boilerplate](https://github.com/HubSpot/cms-theme-boilerplate):

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

**Required variables — never omit these:**
- `{{ standard_header_includes }}` — HubSpot tracking code, page-level CSS/JS, required meta tags. Goes in `<head>`.
- `{{ standard_footer_includes }}` — HubSpot tracking scripts. Goes before `</body>`.
- `{{ builtin_body_classes }}` — HubSpot-managed classes on `<body>` (editor state, etc.)
- `{{ html_lang }}` / `{{ html_lang_dir }}` — language and text direction for i18n

**Template-specific CSS pattern** — `template_css` variable allows child templates to inject an additional stylesheet:
```html
<!-- In base.html: -->
{% if template_css %}
  {{ require_css(get_asset_url(template_css)) }}
{% endif %}

<!-- In a child template: -->
{% set template_css = "../../css/templates/blog.css" %}
{% extends "./layouts/base.html" %}
```

### 3. Page templates

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
          {% dnd_module
            path="@hubspot/rich_text",
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

### 4. Landing page template (conversion-optimised, no nav)

Landing pages override the `header` and `footer` blocks from the base to remove navigation:

```html
<!--
  templateType: page
  isAvailableForNewContent: true
  label: Landing page
  screenshotPath: ../images/template-previews/landing-page.png
-->
{% extends "./layouts/base.html" %}

{% block header %}
  {% global_partial path="./partials/header-no-navigation.html" %}
{% endblock header %}

{% block body %}
  {% dnd_area "dnd_area"
    label="Main section",
    class="body-container body-container--landing-page"
  %}
    {% include_dnd_partial
      path="../sections/hero-banner.html",
      context={
        "content": "<h1>Download your free eBook</h1><p>Use this space to describe your offer.</p>"
      }
    %}
  {% end_dnd_area %}
{% endblock body %}

{% block footer %}
{% endblock footer %}
```

`{% include_dnd_partial %}` with `context={}` passes default values to the partial — the editor can still override them.

### 5. Blog listing template

```html
<!--
  templateType: blog_listing
  isAvailableForNewContent: true
  label: Blog listing
  screenshotPath: ../images/template-previews/blog-index.png
-->
{% set template_css = "../../css/templates/blog.css" %}
{% extends "./layouts/base.html" %}

{% block body %}
  {% dnd_area "dnd_area"
    label="Main section",
    class="body-container body-container--blog-index"
  %}
    {% dnd_section background_color="#f8fafc" %}
      {% dnd_column %}
        {% dnd_row %}
          {% dnd_module
            path="@hubspot/rich_text",
            html='<div style="text-align:center;"><h1>Blog</h1></div>'
          %}
          {% end_dnd_module %}
        {% end_dnd_row %}
        {% dnd_row %}
          {% dnd_module path="@hubspot/blog_subscribe" title="" %}
          {% end_dnd_module %}
        {% end_dnd_row %}
      {% end_dnd_column %}
    {% end_dnd_section %}

    {% dnd_section %}
      {% dnd_column %}
        {% dnd_row %}
          {% dnd_module path="@hubspot/blog_posts" %}
          {% end_dnd_module %}
        {% end_dnd_row %}
        {% dnd_row %}
          {% dnd_module path="@hubspot/pagination" %}
          {% end_dnd_module %}
        {% end_dnd_row %}
      {% end_dnd_column %}
    {% end_dnd_section %}
  {% end_dnd_area %}
{% endblock body %}
```

`@hubspot/blog_posts` and `@hubspot/pagination` are default modules — they handle the post list rendering and page-to-page navigation automatically. Content editors configure them through the standard module sidebar.

### 6. Blog post template

```html
<!--
  templateType: blog_post
  isAvailableForNewContent: true
  label: Blog post
  screenshotPath: ../images/template-previews/blog-post.png
-->
{% set template_css = "../../css/templates/blog.css" %}
{% extends "./layouts/base.html" %}

{% block body %}
<div class="body-container body-container--blog-post">
  <div class="content-wrapper">
    <article class="blog-post">
      <h1>{{ content.name|sanitize_html }}</h1>

      <div class="blog-post__meta">
        <a href="{{ blog_author_url(group.id, content.blog_post_author.slug)|escape_url }}" rel="author">
          {{ content.blog_post_author.display_name|escape_html }}
        </a>
        <time datetime="{{ content.publish_date|escape_attr }}">
          {{ content.publish_date_localized|escape_html }}
        </time>
      </div>

      <div class="blog-post__body">
        {{ content.post_body }}
      </div>

      {% if content.tag_list %}
        <div class="blog-post__tags">
          {% for tag in content.tag_list %}
            <a href="{{ blog_tag_url(group.id, tag.slug) }}" rel="tag">
              {{ tag.name|escape_html }}
            </a>{% if not loop.last %}, {% endif %}
          {% endfor %}
        </div>
      {% endif %}
    </article>

    {% if group.allow_comments %}
      {% module "blog_comments" path="@hubspot/blog_comments" %}
    {% endif %}
  </div>

  {# Related posts — macro receives each post object one at a time #}
  {% macro related_posts(post, count, total) %}
    {% if count == 1 %}<section class="blog-related-posts"><div class="content-wrapper"><h2>Read On</h2><div class="blog-related-posts__list">{% endif %}
      <article class="blog-related-posts__post">
        {% if post.featured_image %}
          <a href="{{ post.absolute_url|escape_url }}">
            <img src="{{ post.featured_image|escape_url }}"
                 alt="{{ post.featured_image_alt_text|escape_attr }}"
                 loading="lazy" width="352">
          </a>
        {% endif %}
        <h3><a href="{{ post.absolute_url|escape_url }}">{{ post.name|escape_html }}</a></h3>
        {{ post.post_summary|truncatehtml(100)|sanitize_html("STRIP") }}
      </article>
    {% if count == total %}</div></div></section>{% endif %}
  {% endmacro %}

  {% related_blog_posts limit=3 no_wrapper=True post_formatter="related_posts" %}
</div>
{% endblock body %}
```

**Key blog post variables:**

| Variable | Value |
|---|---|
| `content.name` | Post title |
| `content.post_body` | Full post HTML body |
| `content.post_summary` | Auto or manually set excerpt |
| `content.publish_date` | Unix timestamp |
| `content.publish_date_localized` | Locale-formatted date string |
| `content.featured_image` | Featured image URL |
| `content.tag_list` | Array of tag objects with `.name` and `.slug` |
| `content.blog_post_author.display_name` | Author display name |
| `content.blog_post_author.slug` | Author slug for `blog_author_url()` |
| `content.absolute_url` | Full canonical URL of the post |
| `group.id` | Blog group ID — used in `blog_tag_url()`, `blog_author_url()` |
| `group.allow_comments` | Whether comments are enabled for this blog |

### 7. System templates (404, error, password, membership)

System templates require specific `templateType` values and are assigned in HubSpot settings.

**404 error page:**
```html
<!--
  templateType: error_page
  isAvailableForNewContent: true
  label: 404 error
-->
{% set template_css = "../../css/templates/system.css" %}
{% set pageTitle = "Error 404 | Page not found" %}
{% extends "./layouts/base.html" %}

{% block body %}
<section class="content-wrapper">
  <div class="error-page" data-error="404">
    {% module "content"
      path="@hubspot/rich_text",
      html="<h1>Page not found.</h1>"
    %}
    {% module "home_button"
      path="../../modules/button",
      button_text="Go Home",
      link={ "url": { "type": "EXTERNAL", "href": "/" }, "open_in_new_tab": false }
    %}
  </div>
</section>
{% endblock body %}
```

- `pageTitle` — used by the base layout `<title>` tag for system pages that don't have page metadata
- System templates are assigned in **Settings → Website → Pages → System pages**

**Password prompt (for private pages):**
```html
<!--
  templateType: password_prompt
  isAvailableForNewContent: false
  label: Password prompt
-->
{% extends "./layouts/base.html" %}

{% block body %}
<section class="content-wrapper">
  <h1>This page is password protected</h1>
  {{ password_prompt_form }}
</section>
{% endblock body %}
```

`{{ password_prompt_form }}` — HubSpot renders the password input form at this variable.

**Membership login** — see `hubspot-cms-membership` for the full membership template suite.

### 8. Global partials

```html
<!--
  templateType: global_partial
  label: Website header
-->
{% module "site_logo" path="@hubspot/linked_image" %}
{% module "main_nav" path="@hubspot/menu" %}
```

- Assigned in the base layout with `{% global_partial path="../partials/header.html" %}`
- Editing the global partial in any page editor updates all pages that include it
- Do not use dnd areas inside global partials — they don't support drag-and-drop editing

### 9. Macros and shared HubL

Complex reusable HubL goes in `macros/`:

```html
{# macros/image-helpers.html #}
{% macro responsive_img(img, css_class="") %}
  {% if img.src %}
    <img class="{{ css_class }}"
         src="{{ img.src|escape_url }}"
         alt="{{ img.alt|escape_attr }}"
         {% if img.width %}width="{{ img.width|escape_attr }}"{% endif %}
         {% if img.height %}height="{{ img.height|escape_attr }}"{% endif %}
         loading="{{ img.loading|default('lazy') }}">
  {% endif %}
{% endmacro %}
```

Import in a template or module:
```html
{% from "../macros/image-helpers.html" import responsive_img %}
{{ responsive_img(module.hero_image, "hero__img") }}
```

### 10. `require_css` and `require_js`

Load assets conditionally — only injected on pages where the call executes:

```html
{{ require_css(get_asset_url("../css/templates/pricing.css")) }}
{{ require_js(get_asset_url("../js/pricing-toggle.js")) }}
```

`get_asset_url()` resolves relative to the theme root and appends a cache-busting hash. Place calls anywhere in the template — HubSpot deduplicates and injects them in the right order.

### 11. Email templates

Email templates use `templateType: email` and differ from page templates in two important ways:

**1. Required email variables — different from page templates:**

```html
<!--
  templateType: email
  isAvailableForNewContent: true
  label: Marketing email
-->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="{{ content.language }}">
  <head>
    <meta charset="utf-8">
    {{ email_header }}
  </head>
  <body>
    <!-- email body content -->
    {{ email_footer }}
  </body>
</html>
```

| Variable | Use | Notes |
|---|---|---|
| `{{ email_header }}` | In `<head>` | Required — injects HubSpot tracking pixels, unsubscribe meta, preview text |
| `{{ email_footer }}` | Before `</body>` | Required — renders the CAN-SPAM unsubscribe footer block |
| `{{ content.language }}` | `<html lang="">` | Email's configured send language |

Do **not** use `standard_header_includes` or `standard_footer_includes` in email templates — those are for page templates only.

**2. Table-based layout for email client compatibility:**

Email clients (Outlook, Gmail, Apple Mail) have inconsistent support for CSS Flexbox, Grid, and modern layout. Use tables for reliable multi-column layout:

```html
<table width="600" cellpadding="0" cellspacing="0" border="0" align="center">
  <tr>
    <td width="300" valign="top">Left column content</td>
    <td width="300" valign="top">Right column content</td>
  </tr>
</table>
```

Keep all CSS inline (`style="..."`) for maximum client compatibility. Use `max-width: 600px` as the standard desktop width.

**3. Coded vs. drag-and-drop email templates:**

| | Coded email template | Drag-and-drop email template |
|---|---|---|
| Authoring | HubL file with `templateType: email` | Built in the drag-and-drop email editor (no HubL file) |
| Flexibility | Full control over HTML/CSS | Constrained to editor's row/column/module model |
| Modules | `{% module %}` tags, email-specific modules | Editor-managed modules |
| Use when | Pixel-perfect branded transactional email | Marketing email that editors build and iterate |

Default HubSpot email modules available in coded templates: `@hubspot/rich_text`, `@hubspot/linked_image`, `@hubspot/cta`, `@hubspot/divider`, `@hubspot/spacer`.

### 12. Multi-language support

HubSpot CMS supports multi-language variants of pages and blogs. Templates need to handle language switching and locale-aware content.

**`html_lang` and `content.language`:**

```html
<html lang="{{ html_lang }}" {{ html_lang_dir }}>
```

- `html_lang` — the language code for the current page variant (e.g. `en`, `fr`, `de`)
- `html_lang_dir` — text direction attribute (`dir="ltr"` or `dir="rtl"`)
- `content.language` — full locale string used for email templates

**Language switcher module:**

Add `@hubspot/language_switcher` to the header partial to render links to other language variants of the current page:

```html
{% module "language_switcher" path="@hubspot/language_switcher" %}
```

The module renders a `<select>` or list of links automatically — no additional configuration required. It only appears when the page has multi-language variants published.

**Cache-busting with `get_asset_version()`:**

The boilerplate header partial uses `get_asset_version()` to append a version hash to asset URLs, ensuring browsers pick up new CSS/JS after deploys:

```html
{{ require_css(get_asset_url("../../css/main.css")) }}
```

`get_asset_url()` already handles cache-busting — calling `get_asset_version()` separately is only needed for custom asset URL patterns outside `require_css`/`require_js`.

## Verification

- Template appears in the template picker when creating a new page (when `isAvailableForNewContent: true`)
- `extends` renders the parent base layout with correct header and footer
- `{{ standard_header_includes }}` and `{{ standard_footer_includes }}` present in page HTML source
- Blog listing shows post list with working pagination
- Blog post renders `content.post_body` and related posts at the bottom
- 404 template is served on unknown URLs after assignment in Settings
- Changing a global partial's content propagates to all pages on save

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Template not in picker | Wrong `templateType` or `isAvailableForNewContent: false` | Fix annotation and re-upload |
| `{% extends %}` renders blank | Wrong relative path to base layout | Path is relative to the current template file location |
| HubSpot tracking not firing | `standard_header_includes` or `standard_footer_includes` omitted | Both are required — add them to the base layout |
| Blog listing empty | Listing page not connected to a blog in Settings | Go to **Settings → Website → Blog** and assign the listing template |
| `content.post_body` renders as escaped HTML | Piping through an escaping filter | `post_body` is already safe HTML — do not add `|escape_html` |
| System page (404) not used | Template type not assigned in Settings | Go to **Settings → Website → Pages → System pages** |
| `pageTitle` variable not setting `<title>` | Base layout condition missing | Base layout must check `{% if page_meta.html_title or pageTitle %}` |

## Escalation

- For HubL variables, filters, and tags, see `hubl`.
- For module placement and dnd section patterns, see `hubspot-cms-modules` and `hubspot-cms-themes`.
- For membership system templates, see `hubspot-cms-membership`.
- Reference: [cms-theme-boilerplate/templates](https://github.com/HubSpot/cms-theme-boilerplate/tree/main/src/templates)
