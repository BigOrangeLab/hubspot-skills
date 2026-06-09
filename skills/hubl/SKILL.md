---
name: hubl
description: "Build HubSpot CMS templates and emails using HubL — HubSpot's Jinja2-based templating language. Use when writing or editing .html template files in HubSpot CMS, including template inheritance, modules, HubDB queries, CRM object rendering, and email personalization tokens."
compatibility: "HubSpot CMS Hub (all tiers). Some functions (HubDB, CRM objects) require Content Hub Professional or Enterprise. Email tokens require Marketing Hub."
license: MIT
metadata:
    author: georgestephanis
    version: "1.1"
    written: "2026-06-09"
    written_against:
        hubspot-cms-vscode: "1.7.4"
---

# HubL Templating Language

HubL is HubSpot's server-side templating language, built on [Jinjava](https://github.com/HubSpot/jinjava) (a Java implementation of Jinja2). Templates are `.html` files edited in the HubSpot Design Manager or via the Local Development CLI (`hs`).

See also:
- [references/functions.md](references/functions.md) — complete function catalog with signatures
- [references/variables.md](references/variables.md) — all template variables by context

## When to use

- Writing or modifying HubSpot CMS page templates, blog templates, email templates, or partial includes
- Querying HubDB tables or CRM objects to render dynamic content
- Building module fields and exposing them to the template via `export_to_template_context`
- Personalizing marketing emails with contact tokens
- Debugging a HubL template that renders incorrectly or produces whitespace artifacts

Do NOT use for HubSpot API integrations (REST), serverless functions, or React-based CMS components — those are separate concerns.

## Inputs required

- Access to the HubSpot Design Manager or a local project synced via `hs watch`
- Template file path within the portal's file system (e.g., `custom/page/web_page_basic/my-template.html`)
- HubSpot portal ID if querying HubDB/CRM by ID
- (For HubDB) table ID or name and column names

---

## Procedure

### 1. Understand HubL syntax basics

HubL uses three delimiter types:

| Delimiter | Purpose |
|---|---|
| `{{ expression }}` | Print/output a value |
| `{% statement %}` | Logic tag (if, for, set, block, etc.) |
| `{# comment #}` | Template comment (not rendered) |

**Whitespace control** — add `-` inside a delimiter to strip adjacent whitespace/newlines:

```hubl
{%- if condition -%}
  Content with no surrounding blank lines
{%- endif -%}
```

**Escaping HubL** — wrap raw HubL-like text in `{% raw %}...{% endraw %}` to prevent rendering:

```hubl
{% raw %}
  {{ this_will_not_be_evaluated }}
{% endraw %}
```

---

### 2. Template inheritance

HubL supports Django-style template inheritance. Define a **parent** layout with named blocks, then **extend** it in child templates.

**Parent (`layouts/base.html`):**

```hubl
<!doctype html>
<html>
<head>{% block head %}<title>Default Title</title>{% endblock head %}</head>
<body>
  {% block body %}{% endblock body %}
  {% block footer %}{% endblock footer %}
</body>
</html>
```

**Child template:**

```hubl
{% extends "./layouts/base.html" %}

{% block head %}
  <title>My Page</title>
{% endblock head %}

{% block body %}
  <h1>Hello World</h1>
  {{ super() }}  {# Renders parent block content alongside child content #}
{% endblock body %}
```

- `{% extends %}` must be the **first tag** in the file.
- `{{ super() }}` prints the parent block's content inside the child block.
- Block names are optional on `{% endblock %}` but recommended for readability.

---

### 3. Variables

**Assign a variable:**

```hubl
{% set primary_color = "#F7761F" %}
<div style="color: {{ primary_color }};">...</div>
```

**Namespace** — use `namespace()` to create a mutable object that can be updated inside loops (regular `set` variables are scoped to the block):

```hubl
{% set ns = namespace(count=0, found=false) %}
{% for item in items %}
  {% if item.active %}
    {% set ns.count = ns.count + 1 %}
    {% set ns.found = true %}
  {% endif %}
{% endfor %}
{{ ns.count }} active items found: {{ ns.found }}
```

For the complete variable reference (content, request, blog, email, page_meta, site_settings, etc.) see [references/variables.md](references/variables.md).

---

### 4. Control flow

**If / elif / else:**

```hubl
{% if content.tag_list %}
  <ul>
    {% for tag in content.tag_list %}
      <li><a href="{{ blog_tag_url(group.id, tag.slug) }}">{{ tag.name }}</a></li>
    {% endfor %}
  </ul>
{% elif content.meta_description %}
  <p>{{ content.meta_description }}</p>
{% else %}
  <p>No tags.</p>
{% endif %}
```

**Unless** — inverse of `if`:

```hubl
{% unless content.archived %}
  <p>This post is live.</p>
{% endunless %}
```

**For loops** — iterate over sequences; `loop` variable provides metadata:

```hubl
{% for item in items %}
  {{ loop.index }}    {# 1-based index #}
  {{ loop.index0 }}   {# 0-based index #}
  {{ loop.first }}    {# true on first iteration #}
  {{ loop.last }}     {# true on last iteration #}
  {{ loop.length }}   {# total items #}
  {{ item.name }}{% if not loop.last %}, {% endif %}
{% else %}
  <p>No items found.</p>  {# rendered when sequence is empty #}
{% endfor %}
```

**Break and continue inside loops:**

```hubl
{% for item in items %}
  {% if item.hidden %}{% continue %}{% endif %}
  {% if loop.index > 5 %}{% break %}{% endif %}
  {{ item.name }}
{% endfor %}
```

**Cycle** — print rotating values inside a loop (useful for zebra-striping):

```hubl
{% for item in items %}
  <tr class="{% cycle 'odd', 'even' %}">
    <td>{{ item.name }}</td>
  </tr>
{% endfor %}
```

**Flip** — output two blocks in normal or reversed order based on a condition:

```hubl
{% flip %}
  <div class="primary">...</div>
  <div class="secondary">...</div>
{% endflip %}
```

**Do tag** — execute side-effecting expressions without printing:

```hubl
{% set my_list = [] %}
{% do my_list.append("item one") %}
{% do my_list.append("item two") %}
{{ my_list | join(", ") }}
```

**Range** — generate a numeric sequence:

```hubl
{% for i in range(1, 6) %}{{ i }}{% if not loop.last %}, {% endif %}{% endfor %}
{# → 1, 2, 3, 4, 5 #}

{% for i in range(0, 10, 2) %}{{ i }} {% endfor %}
{# → 0 2 4 6 8  (max 1000 values) #}
```

---

### 5. Template inheritance extras: macros, import, call

**Define and call a macro:**

```hubl
{% macro render_card(title, body, cta_text="Learn more") %}
  <div class="card">
    <h3>{{ title }}</h3>
    <p>{{ body }}</p>
    <a href="#">{{ cta_text }}</a>
  </div>
{% endmacro %}

{{ render_card("Welcome", "Here is some intro text.") }}
{{ render_card("Offer", "Special deal.", cta_text="Claim now") }}
```

**Import macros from another template:**

```hubl
{% import "custom/macros/cards.html" as cards %}
{{ cards.render_card("My Title", "My body.") }}

{# Or import specific macros only: #}
{% from "custom/macros/cards.html" import render_card, render_hero %}
{{ render_card("Title", "Body") }}
```

**Call block** — pass a block of content into a macro:

```hubl
{% macro render_section(title) %}
  <section>
    <h2>{{ title }}</h2>
    {{ caller() }}
  </section>
{% endmacro %}

{% call render_section("Features") %}
  <ul><li>Fast</li><li>Reliable</li></ul>
{% endcall %}
```

---

### 6. Includes and partials

```hubl
{# Include a template fragment #}
{% include "custom/page/web_page_basic/my_footer.html" %}

{# Include a global partial (shared, managed separately in Design Manager) #}
{% global_partial path="../partials/header.html" %}

{# Include a drag-and-drop partial #}
{% include_dnd_partial "custom/partials/my_dnd_partial.html" %}
```

---

### 7. Asset enqueuing

Use these to ensure CSS and JS are output in the correct location rather than inline:

```hubl
{# Enqueue a stylesheet URL into <head> #}
{{ require_css("https://example.com/style.css") }}
{{ require_css(get_asset_url("../css/main.css")) }}

{# Enqueue a script — position defaults to head; use 'footer' to defer #}
{{ require_js("https://example.com/app.js", {"position": "footer", "defer": true}) }}

{# Enqueue an inline stylesheet block #}
{% require_css %}
  <style>.hero { background: {{ primary_color }}; }</style>
{% end_require_css %}

{# Enqueue an inline script block #}
{% require_js position="footer" %}
  <script>console.log('loaded');</script>
{% end_require_js %}

{# Output all enqueued assets (use in base template) #}
{{ head_css() }}      {# all CSS in <head> #}
{{ head_js() }}       {# all JS in <head> #}
{{ footer_js() }}     {# all JS in footer #}
{{ head_elements() }} {# all other <head> elements #}

{# Include a design file directly (generates <link> or <script> tag) #}
{{ include_css("custom/css/theme.css") }}
{{ include_javascript("custom/js/app.js") }}
```

---

### 8. Modules and `export_to_template_context`

HubL modules embed editable content fields. Add `export_to_template_context=True` to expose a module's field values to the template as the `widget_data` dict:

```hubl
{% module "job_title"
   path="@hubspot/text"
   label="Job Title"
   value="Chief Morale Officer"
   export_to_template_context=True %}

{% if widget_data.job_title.body.value == "CEO" %}
  <div class="executive-banner">...</div>
{% endif %}
```

**Boolean field controlling visibility:**

```hubl
{% boolean "show_form" label="Show signup form?" value="true" no_wrapper="true" export_to_template_context="true" %}

{% if widget_data.show_form.value %}
  {% module "signup_form" path="@hubspot/form" ... %}
{% endif %}
```

**Background image from a module field:**

```hubl
{% module "bg_image" path="@hubspot/image" label="Background" export_to_template_context=True %}
<div style="background-image: url('{{ widget_data.bg_image.src }}')">...</div>
```

**Access a static module's value without `export_to_template_context`:**

```hubl
{{ content.widgets.my_text.body.value }}
{{ content.widgets.my_image.body.src }}
```

**Limitations:**
- `export_to_template_context` does NOT work with drag-and-drop (DnD) modules — DnD modules get arbitrary IDs at runtime.
- Does not support retrieving values from fields in global modules.

---

### 9. HubDB queries

HubDB is HubSpot's structured-data table system. Requires Content Hub Professional or Enterprise.

```hubl
{# All rows #}
{% for row in hubdb_table_rows("my_table") %}
  {{ row.hs_id }} — {{ row.title }} — {{ row.price }}
{% endfor %}

{# Filter with HQL query string #}
{% for row in hubdb_table_rows("my_table", "price__gt=100&orderBy=title&limit=20") %}
  ...
{% endfor %}

{# Paginate with offset #}
{% for row in hubdb_table_rows("my_table", "limit=10&offset=20") %}
  ...
{% endfor %}

{# Geo distance filter (HQL) #}
{% for row in hubdb_table_rows("locations", "geo_distance(coords,37.77,-122.41,mi)__lt=50") %}
  {{ row.name }}
{% endfor %}

{# Single row by row ID #}
{% set row = hubdb_table_row("my_table", 9876) %}
{{ row.title }}

{# Table metadata #}
{% set meta = hubdb_table("my_table") %}
{{ meta.name }} has {{ meta.row_count }} rows.
```

HQL filter operators: `eq` (default), `neq`, `lt`, `lte`, `gt`, `gte`, `is_null`, `not_null`, `in`, `not_in`.

**Rate limit:** `hubdb_table_rows()` is limited to 10 calls per template render.

---

### 10. CRM object queries

On public pages, only `product` objects and portal-specific custom objects are accessible. All other built-in CRM object types require password-protected or Membership-gated pages.

```hubl
{# Single object by query #}
{% set company = crm_object("companies", "name=Acme Corp", "name,domain,city") %}
{{ company.name }} — {{ company.city }}

{# Single object by ID #}
{% set contact = crm_object("contacts", "12345", "firstname,lastname,email") %}

{# Multiple objects with pagination #}
{% for product in crm_objects("products", "price__gt=50&limit=12&offset=0", "name,price,hs_sku") %}
  {{ product.name }} — ${{ product.price }}
{% endfor %}

{# CRM associations — get objects related to another object #}
{% set deals = crm_associations(company.hs_object_id, "HUBSPOT_DEFINED", 5, "", "dealname,amount") %}
{% for deal in deals %}
  {{ deal.dealname }}: ${{ deal.amount }}
{% endfor %}

{# Get a property's definition (label, options, type) #}
{% set prop = crm_property_definition("contacts", "lifecyclestage") %}
{{ prop.label }}: {% for opt in prop.options %}{{ opt.label }}{% if not loop.last %}, {% endif %}{% endfor %}
```

CRM object type names are case-sensitive except for HubSpot built-ins (`contact`/`CONTACT` are the same; custom objects are not). Use fully-qualified names (`p{portalId}_typename`) only to disambiguate collisions.

---

### 11. Blog functions

```hubl
{# Recent posts (max 200) #}
{% for post in blog_recent_posts("default", 5) %}
  <a href="{{ post.absolute_url }}">{{ post.name }}</a>
{% endfor %}

{# Popular posts (cached 6 hours; optional tag and timeframe filters) #}
{% for post in blog_popular_posts("default", 3, ["marketing"], "popular_past_month") %}
  {{ post.name }}
{% endfor %}

{# Posts by tag — tag_slug can be a slug string or list + logical_operator #}
{% for post in blog_recent_tag_posts("default", "design", 5) %}...{% endfor %}
{% for post in blog_recent_tag_posts("default", ["design","ux"], 5, "OR") %}...{% endfor %}

{# Posts by author #}
{% for post in blog_recent_author_posts("default", "jane-doe", 5) %}...{% endfor %}

{# Single post by ID #}
{% set post = blog_post_by_id(12345678) %}

{# Blog metadata #}
{% set blog = blog_by_id("default") %}
{{ blog.name }} — {{ blog.absolute_url }}

{# Tag/author listing URLs #}
{{ blog_tag_url(group.id, tag.slug) }}
{{ blog_author_url(group.id, author.slug) }}
{{ blog_page_link(group.id, 2) }}
{{ blog_post_archive_url("default", 2025, 11) }}
{{ blog_all_posts_url("default") }}

{# All tags sorted by post count (max 250) #}
{% for tag in blog_tags("default", 20) %}{{ tag.name }}{% endfor %}

{# All authors #}
{% for author in blog_authors("default", 10) %}{{ author.display_name }}{% endfor %}

{{ blog_total_post_count("default") }}
```

---

### 12. Content and utility functions

```hubl
{# Page/post lookup #}
{% set page = content_by_id(12345678) %}
{% set pages = content_by_ids([111, 222, 333]) %}
{% set page = page_by_id(12345678) %}

{# File metadata from File Manager #}
{% set f = file_by_id(99999) %}
{{ f.url }} — {{ f.size }}
{% set files = files_by_ids([11, 22]) %}

{# Images — resize a HubSpot-hosted image #}
{{ resize_image_url("https://cdn2.hubspot.net/...", 800, 600) }}
{{ video_thumbnail({"url": "https://cdn.hubspot.net/...", "width": 800, "color": "#FF0000"}) }}

{# Color utilities #}
{{ color_variant("#336699", -30) }}   {# darken #}
{{ color_variant("#336699", 30) }}    {# lighten #}
{% if color_contrast("#fff", "#333", "AA") %}Passes WCAG AA{% endif %}

{# Dates #}
{% set today = today() %}
{{ today | date_to_format("MMMM d, yyyy") }}
{{ now() }}  {# Unix timestamp #}
{{ to_local_time(content.publish_date) | date_to_format("yyyy-MM-dd HH:mm") }}
{% set d = strtodate("2025-12-01", "yyyy-MM-dd") %}
{% set dt = strtotime("2025-12-01 09:00", "yyyy-MM-dd HH:mm") %}

{# Geo distance (standalone, not just HQL) #}
{{ geo_distance(row.location_col, 37.77, -122.41, "MI") }}

{# i18n (works within modules) #}
{% set lang = i18n_getlanguage() %}
{{ i18n_getmessage("cta.button_text") }}
{% set t = load_translations("../locales", request.locale, "en") %}
{{ t.greeting }}
{{ locale_name("fr", "en") }}  {# → "French" #}

{# CTA rendering #}
{{ cta("abc12345-guid", "justifycenter") }}

{# HTTP #}
{{ set_response_code(404) }}  {# Use on 404 pages #}

{# Asset URLs #}
{{ get_asset_url("custom/css/theme.css") }}
{{ get_public_template_url("custom/page/web_page_basic/my-template.html") }}
{{ get_public_template_url_by_id(12345) }}
{{ module_asset_url("icon.svg") }}

{# Product recommendations (ecommerce) #}
{% for product in product_recommendations("all", 6, "USD", 0, 200) %}
  {{ product.name }} — {{ product.price }}
{% endfor %}

{# Topic cluster #}
{% set cluster = topic_cluster_by_content_id(content.id) %}

{# Japanese name/address formatting #}
{{ format_name("Taro", "Yamada", true) }}
{{ format_company_name("株式会社ハブスポット", true) }}
{{ format_address("ja-JP", {"address": "1-1", "city": "Tokyo", "country": "JP", "zip": "100-0001"}) }}

{# Unique string from input #}
{{ unique_string("my-module-id") }}
```

---

### 13. Personalization (CMS pages)

HubSpot supports personalizing CMS pages using contact/company data via the Personalization API. This requires a signed URL and JavaScript to hydrate values client-side (server-side rendering of contact data on cacheable pages is not supported).

```hubl
{# Declare which properties are needed — outputs a signed API URL script tag #}
{% require_personalization_properties
   contact_properties="firstname,lastname,lifecyclestage"
   company_properties="name,industry" %}

{# Include the signed URL in a script for client-side JS to use #}
<script>
  var personalizationUrl = "{{ personalization_api_url('firstname,lastname', 'name') }}";
</script>

{# Use personalization_token for direct server-side rendering (non-cached contexts only) #}
{{ personalization_token("contact.firstname", "there") }}
```

---

### 14. Filters reference

Filters transform values with the pipe syntax: `{{ value | filter_name(args) }}`.

**String:**

```hubl
{{ "hello world" | capitalize }}           → Hello world
{{ "hello world" | title }}                → Hello World
{{ "HELLO" | lower }}                      → hello
{{ "hello" | upper }}                      → HELLO
{{ "  hello  " | trim }}                   → hello
{{ "hello world" | truncate(5, "…") }}     → hello…
{{ html | truncatehtml(200, "…", false) }}
{{ "<b>hi</b>" | striptags }}              → hi
{{ "hello world" | replace("world", "HubSpot") }}
{{ "hello" | center(11) }}                 →    hello
{{ "slug-2" | regex_replace("[^a-zA-Z]", "") }}  → slug
{{ value | escape }}            {# HTML-escape #}
{{ value | escape_jinjava }}    {# Jinjava-safe escaping #}
{{ value | unescape_html }}     {# HTML entities → Unicode #}
{{ text | cut("ll") }}          {# remove all occurrences of substring #}
{{ text | wordcount }}
{{ text | indent(4) }}
{{ value | safe }}              {# mark as HTML-safe, skip auto-escaping #}
```

**Date:**

```hubl
{{ content.publish_date | date_to_format("MMMM d, yyyy") }}   → June 9, 2026
{{ content.publish_date | date_to_format("yyyy-MM-dd HH:mm:ss") }}
{{ start | between_times(end) }}   {# duration string between two timestamps #}
```

Date format uses Java `SimpleDateFormat` patterns. Common tokens: `yyyy` year, `MM` month, `dd` day, `HH` 24h hour, `mm` minute, `ss` second, `a` AM/PM.

**Number:**

```hubl
{{ -5 | abs }}                → 5
{{ "42" | int }}              → 42
{{ 1234567 | filesizeformat }} → 1.2 MB
{{ "#336699" | convert_rgb }} → rgb(51, 102, 153)
{{ value | add(10) }}
{{ value | bool }}
```

**Sequence:**

```hubl
{{ items | sort }}
{{ items | sort(attribute="name") }}
{{ items | reverse | list }}
{{ items | unique | list }}
{{ items | first }}
{{ items | last }}
{{ items | length }}           {# or | count #}
{{ items | join(", ") }}
{{ items | join(", ", attribute="name") }}
{{ items | map(attribute="name") | join(", ") }}
{{ items | selectattr("active", "equalto", true) | list }}
{{ items | rejectattr("hidden") | list }}
{{ items | groupby("category") }}
{{ items | batch(3) }}         {# groups of 3 #}
{{ items | shuffle }}
{{ items | sum(attribute="price") }}
{{ items | min(attribute="price") }}
{{ items | max(attribute="price") }}
{{ items | union(other_list) | list }}
{{ my_dict | attr("key") }}
{{ my_dict | list }}           {# keys only #}
{{ value | pprint }}           {# debug dump #}
```

---

### 15. Operators and expression tests

**Comparison and logic:**

```hubl
{% if a == b %}   {% if a != b %}
{% if a > b %}    {% if a >= b %}
{% if a < b %}    {% if a <= b %}
{% if a and b %}  {% if a or b %}  {% if not a %}
{% if "key" in my_dict %}
{% if "foo" in my_list %}
```

**Expression tests (use with `is` / `is not`):**

| Test | Meaning |
|---|---|
| `is boolean` | Is a boolean |
| `is true` | Is boolean `true` |
| `is false` | Is boolean `false` |
| `is truthy` | Evaluates to truthy |
| `is none` | Is null/None |
| `is undefined` | Variable is not defined |
| `is defined` | Variable is defined |
| `is string` | Is a string |
| `is string_containing(x)` | String contains `x` |
| `is string_startingwith(x)` | String starts with `x` |
| `is lower` | All lowercase |
| `is upper` | All uppercase |
| `is number` | Is numeric |
| `is integer` | Is integer or long |
| `is float` | Is a float |
| `is even` | Number is even |
| `is odd` | Number is odd |
| `is divisibleby(n)` | Divisible by `n` |
| `is sequence` | Is iterable |
| `is iterable` | Can be iterated |
| `is mapping` | Is a dict/map |
| `is containing(x)` | List contains `x` |
| `is containingall([x,y])` | List contains all of `x`, `y` |
| `is in(list)` | Value is in the iterable |
| `is equalto(x)` / `is eq(x)` | Equals `x` |
| `is ne(x)` / `is notequalto(x)` | ≠ x |
| `is gt(x)` / `is greaterthan(x)` | > x |
| `is ge(x)` | ≥ x |
| `is lt(x)` / `is lessthan(x)` | < x |
| `is le(x)` | ≤ x |
| `is sameas(x)` | Same object identity |

---

### 16. Email templates (Marketing Hub)

**Required variables in every email template:**

```hubl
{{ unsubscribe_section }}      {# renders full unsubscribe block — REQUIRED by CAN-SPAM #}
{{ unsubscribe_anchor }}       {# just the <a> tag link #}
{{ unsubscribe_link_all }}     {# link to unsubscribe from all emails #}
{{ view_as_page_url }}         {# link to web version #}
{{ view_as_page_section }}     {# web version link with help text #}
{{ subscription_confirmation_url }}
{{ subscription_name }}
```

**Contact personalization:**

```hubl
Hi {{ contact.firstname | default("there") }},

{{ contact.company | default("your company") }}
```

**Email-specific style variables** (aliases for `site_settings.*` configured in Marketing > Email > Configuration):

```hubl
{{ email_body_width }}           {# e.g. "600px" #}
{{ email_body_padding }}
{{ primary_font }}
{{ primary_font_color }}
{{ primary_font_size }}
{{ primary_font_size_num }}      {# number only, no "px" #}
{{ primary_accent_color }}
{{ secondary_font }}
{{ secondary_font_color }}
{{ body_color }}
{{ background_color }}
{{ body_border_color }}
{{ body_border_color_choice }}   {# BORDER_AUTOMATIC | BORDER_MANUAL | BORDER_NONE #}
{{ email_body_border_css }}      {# generates inline border CSS #}
```

**Email content variables:**

```hubl
{{ content.subject }}
{{ content.from_name }}
{{ content.reply_to }}
{{ content.email_body }}         {# renders main rich text module #}
{{ content.emailbody_plaintext }}
{% if content.create_page %}     {# true if web version exists #}
  {{ view_as_page_url }}
{% endif %}
```

**Unsubscribe tags:**

```hubl
{% email_subscriptions header="Manage your preferences" %}
{% email_simple_subscription header="Unsubscribe" %}
{% email_subscriptions_confirmation header="Preferences updated" %}
```

**Email-specific limits:**
- `postal_location()` is limited to 1 call per email render.
- Complex HubDB/CRM queries may not be available in all email contexts.

---

## Verification

- [ ] Template renders without `Rendering error` in the Design Manager preview.
- [ ] Whitespace/newlines around `{%- -%}` blocks look correct in rendered HTML source.
- [ ] `for` loops have `{% else %}` fallbacks for empty sequences where appropriate.
- [ ] HubDB queries are within the 10-call-per-render limit.
- [ ] `export_to_template_context` modules are not inside DnD areas.
- [ ] Date formats use `date_to_format` with Java `SimpleDateFormat` patterns (not deprecated `datetimeformat`/strftime patterns).
- [ ] Email templates include `{{ unsubscribe_section }}` (required by CAN-SPAM).
- [ ] CRM object types that require membership gating are only used on password-protected pages.

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| `Variable "X" could not be resolved` | Variable name typo or not in scope | Use `{{ request \| pprint }}` or `{{ content \| pprint }}` to inspect available keys |
| Blank output from `for` loop | Empty sequence, no `{% else %}` | Add `{% else %}<p>No results.</p>{% endfor %}` |
| Extra blank lines in rendered HTML | Missing whitespace control | Add `-` to `{%- tag -%}` delimiters |
| HubDB returns no results | Table in draft mode, wrong name | Publish the table; confirm table ID/name in HubDB UI |
| `export_to_template_context` not working | Module is inside a DnD area | Move the module to a static section |
| Date format shows wrong output | Using strftime patterns with `date_to_format` | Switch to Java patterns: `yyyy`, `MM`, `dd`, `HH`, `mm` |
| `{{ value }}` printed literally | Wrapped in `{% raw %}` | Remove the `raw` block |
| CRM query returns 0 on public page | Built-in CRM object type on unprotected page | Restrict page with password or Membership; only `product` and custom objects are public |
| `namespace()` variable not updating inside loop | Using `set` directly instead of `set ns.key` | Use `{% set ns = namespace(...) %}` and update with `{% set ns.key = value %}` |
| Loop variable not accessible after `break` | Expected — `break` exits the loop entirely | Capture needed values before `break`, or use `namespace()` |
| Email unsubscribe link missing | Template doesn't include `{{ unsubscribe_section }}` | Add the required tag; HubSpot may block sends without it |

## Escalation

- Full function signatures: [references/functions.md](references/functions.md)
- Full variable reference: [references/variables.md](references/variables.md)
- Official HubL reference: https://developers.hubspot.com/docs/cms/reference/hubl/overview
- HubL function limits for emails: https://developers.hubspot.com/changelog/breaking-change-hubl-function-limits-for-marketing-emails
- For HubDB schema design, see `hubspot-hubdb` skill (when created).
- For the Local Development CLI (`hs watch`, `hs upload`), see `hubspot-local-dev` skill (when created).
