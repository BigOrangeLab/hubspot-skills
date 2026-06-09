---
name: hubl
description: "Build HubSpot CMS templates and emails using HubL — HubSpot's Jinja2-based templating language. Use when writing or editing .html template files in HubSpot CMS, including template inheritance, modules, HubDB queries, CRM object rendering, and email personalization tokens."
compatibility: "HubSpot CMS Hub (all tiers). Some functions (HubDB, CRM objects) require Content Hub Professional or Enterprise. Email tokens require Marketing Hub."
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-06-09"
    written_against:
        hubspot-cms: "2026"
        hubl: "Jinja2/Jinjava-based"
---

# HubL Templating Language

HubL is HubSpot's server-side templating language, built on [Jinjava](https://github.com/HubSpot/jinjava) (a Java implementation of Jinja2). Templates are `.html` files edited in the HubSpot Design Manager or via the Local Development CLI (`hs`).

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

**Key global variables available in page templates:**

| Variable | Description |
|---|---|
| `content` | The current page/post object (see below) |
| `content.name` | Page title |
| `content.meta_description` | Meta description |
| `content.absolute_url` | Full public URL |
| `content.publish_date` | Publish timestamp |
| `content.tag_list` | List of tags (blog posts) |
| `content.featured_image` | Featured image URL |
| `content.widgets` | Dict of all modules on the page |
| `group` | The blog object (on blog templates) |
| `group.id` | Blog ID |
| `group.absolute_url` | Blog root URL |
| `request.query_dict` | URL query parameters as a dict |
| `request.cookies` | Request cookies as a dict |
| `request.path` | Current path |
| `request.domain` | Current domain |
| `local_dt` | Local datetime object |
| `site_settings` | Portal site settings |

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

**Do tag** — execute side-effecting expressions (e.g., appending to a list) without printing:

```hubl
{% set my_list = [] %}
{% do my_list.append("item one") %}
{% do my_list.append("item two") %}
{{ my_list | join(", ") }}
```

---

### 5. Includes and partials

**Include a template fragment:**

```hubl
{% include "custom/page/web_page_basic/my_footer.html" %}
```

**Include a global partial** (shared across templates):

```hubl
{% global_partial path="../partials/header.html" %}
```

Global partials are managed separately in the Design Manager and can be shared across multiple templates. Changes to a global partial propagate everywhere it is included.

---

### 6. Macros

Macros are reusable template functions that output HTML:

```hubl
{% macro render_card(title, body, cta_text="Learn more") %}
  <div class="card">
    <h3>{{ title }}</h3>
    <p>{{ body }}</p>
    <a href="#">{{ cta_text }}</a>
  </div>
{% endmacro %}

{# Call it: #}
{{ render_card("Welcome", "Here is some intro text.") }}
{{ render_card("Offer", "Special deal.", cta_text="Claim now") }}
```

Strip whitespace inside macros with `-`:

```hubl
{% macro compact_tag(value) -%}
  <span>{{ value }}</span>
{%- endmacro %}
```

---

### 7. Modules and `export_to_template_context`

HubL modules embed editable content fields. Add `export_to_template_context=True` to expose a module's field values to the template as the `widget_data` dict — useful for driving conditional logic from editor-controlled values.

```hubl
{# Declare a text module and expose its value to template logic #}
{% module "job_title"
   path="@hubspot/text"
   label="Job Title"
   value="Chief Morale Officer"
   export_to_template_context=True %}

{# Use in logic without re-printing the module: #}
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

**Limitations:**
- `export_to_template_context` does NOT work with drag-and-drop (DnD) modules — DnD modules get arbitrary IDs at runtime.
- For static modules, access widget data directly via `{{ content.widgets.module_name.body.parameter }}`.

---

### 8. HubDB queries

HubDB is HubSpot's structured-data table system. Requires Content Hub Professional or Enterprise.

```hubl
{# Get all rows from a table #}
{% for row in hubdb_table_rows("my_table_name") %}
  {{ row.hs_id }} — {{ row.title }} — {{ row.price }}
{% endfor %}

{# Filter rows (query string syntax) #}
{% for row in hubdb_table_rows(1234567, "price__gt=100&orderBy=title") %}
  ...
{% endfor %}

{# Get a single row by row ID #}
{% set row = hubdb_table_row("my_table", 9876) %}
{{ row.title }}

{# Get table metadata #}
{% set meta = hubdb_table("my_table") %}
{{ meta.name }} has {{ meta.row_count }} rows.

{# Geo distance filter #}
{% for row in hubdb_table_rows("locations", "geo_distance(coords,37.77,-122.41,mi)__lt=50") %}
  {{ row.name }}
{% endfor %}
```

**Rate limit:** `hubdb_table_rows()` is limited to 10 calls per template render.

---

### 9. CRM object queries

```hubl
{# Single object by query #}
{% set company = crm_object("companies", "name=Acme", "name,domain,city") %}
{{ company.name }} — {{ company.city }}

{# Multiple objects #}
{% for contact in crm_objects("contacts", "email__contains=@example.com", "firstname,lastname,email", "lastname", 10) %}
  {{ contact.firstname }} {{ contact.lastname }}
{% endfor %}
```

`crm_objects(type, filter, properties, order_by, limit)` — all args after `type` are optional.

---

### 10. Blog functions

```hubl
{# Recent posts #}
{% set recent = blog_recent_posts("default", 5) %}
{% for post in recent %}
  <a href="{{ post.absolute_url }}">{{ post.name }}</a>
{% endfor %}

{# Popular posts (cached 6 hours) #}
{% for post in blog_popular_posts("default", 3) %}
  {{ post.name }}
{% endfor %}

{# Posts by tag #}
{% for post in blog_recent_tag_posts("default", "marketing", 5) %}
  {{ post.name }}
{% endfor %}

{# Author listing URL #}
{{ blog_author_url(group.id, author.slug) }}

{# Tag listing URL #}
{{ blog_tag_url(group.id, tag.slug) }}

{# Paginated listing URL #}
{{ blog_page_link(group.id, 2) }}

{# Total post count #}
{{ blog_total_post_count("default") }}
```

---

### 11. Content and utility functions

```hubl
{# Get a page/post by ID #}
{% set page = content_by_id(12345678) %}
{{ page.name }} — {{ page.absolute_url }}

{# Resize an image hosted in HubSpot #}
{{ resize_image("https://cdn2.hubspot.net/hubfs/...", 800, 600) }}

{# Today's date (start of day timestamp) #}
{% set today = today() %}
{{ today | date_to_format("yyyy-MM-dd") }}

{# Current Unix timestamp #}
{{ now() }}

{# Public URL of a design file #}
{{ get_public_template_url("custom/page/web_page_basic/my-template.html") }}

{# Render a CTA by GUID #}
{{ cta("abc12345-...") }}

{# Postal-code-based geolocation #}
{% set loc = postal_location("94105") %}
{{ loc.city }}, {{ loc.state }}
```

---

### 12. Filters reference

Filters transform values using the pipe syntax: `{{ value | filter_name(args) }}`.

**String filters:**

```hubl
{{ "hello world" | capitalize }}       → Hello world
{{ "hello world" | title }}            → Hello World
{{ "HELLO" | lower }}                  → hello
{{ "hello" | upper }}                  → HELLO
{{ "  hello  " | trim }}               → hello
{{ "hello world" | truncate(5, "…") }} → hello…
{{ "<b>hi</b>" | striptags }}          → hi
{{ "hello world" | replace("world", "HubSpot") }}  → hello HubSpot
{{ "hello" | center(11) }}             →    hello
{{ "slug-name-2" | regex_replace("[^a-zA-Z]", "") }} → slugname
{{ content.body | truncatehtml(200, "…", false) }}
{{ value | escape }}                   {# HTML-escape #}
{{ value | escape_jinjava }}           {# Escape for Jinjava contexts #}
{{ value | unescape_html }}            {# HTML entities → Unicode #}
```

**Date filters:**

```hubl
{{ post.publish_date | date_to_format("MMMM d, yyyy") }}   → June 9, 2026
{{ timestamp | datetimeformat("%B %d, %Y") }}              {# deprecated, use date_to_format #}
{{ start | between_times(end) }}       {# duration between two timestamps #}
```

**Number filters:**

```hubl
{{ -5 | abs }}         → 5
{{ "42" | int }}       → 42
{{ 42 | int + 8 }}     → 50
{{ 1234567 | filesizeformat }}  → 1.2 MB
```

**Sequence filters:**

```hubl
{{ items | sort }}
{{ items | sort(attribute="name") }}
{{ items | reverse | list }}
{{ items | unique | list }}
{{ items | first }}
{{ items | last }}
{{ items | length }}    {# or | count #}
{{ items | join(", ") }}
{{ items | join(", ", attribute="name") }}
{{ items | map(attribute="name") | join(", ") }}
{{ items | selectattr("active", "equalto", true) | list }}
{{ items | rejectattr("hidden") | list }}
{{ items | groupby("category") }}
{{ items | batch(3) }}      {# groups of 3 #}
{{ items | shuffle }}
{{ items | sum(attribute="price") }}
{{ items | min(attribute="price") }}
{{ items | max(attribute="price") }}
{{ items | union(other_list) | list }}
```

**Utility filters:**

```hubl
{{ my_dict | attr("key") }}
{{ my_var | pprint }}            {# debug dump #}
{{ value | safe }}               {# mark as safe, skip auto-escaping #}
{{ value | bool }}               {# coerce to boolean #}
{{ my_dict | list }}             {# convert to list of keys #}
{{ "#F7761F" | convert_rgb }}    {# color hex → rgb(...) #}
{{ text | indent(4) }}           {# indent lines by 4 spaces #}
{{ "hello" | cut("ll") }}        → heo
{{ text | wordcount }}           {# word count #}
{{ items | add(5) }}             {# add numeric value to each #}
```

---

### 13. Operators and expression tests

**Comparison and logic:**

```hubl
{% if a == b %}   {% if a != b %}
{% if a > b %}    {% if a >= b %}
{% if a < b %}    {% if a <= b %}
{% if a and b %}  {% if a or b %}  {% if not a %}
```

**Membership and containment:**

```hubl
{% if "foo" in my_list %}
{% if "key" in my_dict %}
{% if value is none %}
{% if value is not none %}
```

**Expression tests (use with `is`):**

| Test | Meaning |
|---|---|
| `is boolean` | Value is a boolean |
| `is containing(x)` | Sequence contains `x` |
| `is containingall([x,y])` | Sequence contains all of `x`, `y` |
| `is defined` | Variable is defined |
| `is divisibleby(n)` | Number is divisible by `n` |
| `is equalto(x)` / `is eq(x)` | Equals `x` |
| `is even` | Number is even |
| `is ge(x)` / `is greaterthanorequalto(x)` | ≥ x |
| `is gt(x)` / `is greaterthan(x)` | > x |
| `is iterable` | Value can be iterated |
| `is le(x)` / `is lessthanorequalto(x)` | ≤ x |
| `is lt(x)` / `is lessthan(x)` | < x |
| `is mapping` | Value is a dict/map |
| `is ne(x)` / `is notequalto(x)` | ≠ x |
| `is none` | Value is null/None |
| `is number` | Value is numeric |
| `is odd` | Number is odd |
| `is sameas(x)` | Same object identity |
| `is sequence` | Value is a sequence |
| `is string` | Value is a string |
| `is undefined` | Variable is not defined |

---

### 14. Email personalization (Marketing Hub)

HubL in email templates supports contact property tokens and conditional visibility:

```hubl
{# Contact tokens #}
Hi {{ contact.firstname | default("there") }},

{# Fallback values for missing properties #}
{{ contact.company | default("your company") }}

{# Content attribute blocks (email-specific layout) #}
{% content_attribute "email_body" %}
  <p>Hi {{ contact.firstname }},</p>
  <p>{{ content.email_body }}</p>
{% end_content_attribute %}
```

**Email-specific limits:**
- `postal_location()` is limited to 1 call per email render.
- Complex HubDB/CRM queries may not be available in all email contexts — test in preview mode.

---

## Verification

- [ ] Template renders without `Rendering error` in the Design Manager preview.
- [ ] Whitespace/newlines around `{%- -%}` blocks look correct in the rendered HTML source.
- [ ] `for` loops have a corresponding `{% else %}` fallback for empty sequences where appropriate.
- [ ] HubDB queries are within the 10-call-per-render limit.
- [ ] `export_to_template_context` modules are not inside DnD areas.
- [ ] Date formats use `date_to_format` (not deprecated `datetimeformat`).

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| `Variable "X" could not be resolved` | Variable name typo or not in scope | Check `{{ request \| pprint }}` or `{{ content \| pprint }}` to inspect available keys |
| Blank output from a `for` loop | Sequence is empty and no `{% else %}` | Add `{% else %}<p>No results.</p>{% endfor %}` |
| Extra blank lines in rendered HTML | Missing whitespace control | Add `-` to `{%- tag -%}` delimiters |
| HubDB returns no results | Table is in draft mode or wrong table name | Publish the table; confirm table name/ID in HubDB UI |
| `export_to_template_context` not working | Module is inside a DnD area | Move the module to a static template section |
| Date format shows wrong output | Using old `datetimeformat` patterns (strftime) | Switch to `date_to_format` with Java `SimpleDateFormat` patterns (e.g., `"MMMM d, yyyy"`) |
| `{{ value }}` printed literally | Wrapped in `{% raw %}` block | Remove the `raw` wrapper |
| CRM query returns 0 results | Filter syntax error or missing properties | Test the filter string in the HubSpot CRM directly first |

## Escalation

- For HubL syntax questions beyond this skill, consult the [official HubL reference](https://developers.hubspot.com/docs/cms/reference/hubl/overview).
- For HubDB schema design or CRM object associations, see `hubspot-hubdb` and `hubspot-crm-objects` skills (when created).
- For the Local Development CLI (`hs watch`, `hs upload`), see `hubspot-local-dev` skill (when created).
- HubL function limits for emails are tracked at [developers.hubspot.com/changelog](https://developers.hubspot.com/changelog/breaking-change-hubl-function-limits-for-marketing-emails).
