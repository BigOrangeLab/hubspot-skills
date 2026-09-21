---
name: hubspot-hubdb
description: "Work with HubDB — create and manage tables, query data in HubL templates, build dynamic listing+detail pages, and manage tables via CLI and REST API"
compatibility: "Content Hub Professional and above; CLI v8+; HubDB API 2026-09"
license: MIT
metadata:
    author: georgestephanis
    version: "1.2"
    written: "2026-09-21"
    written_against:
        hubspot-cli: "8.15.0"
        hubspot-api: "2026-09"
        content-hub: "Professional+"
---

## When to use

Use this skill when:
- Building dynamic pages driven by structured data (team directory, product catalog, location finder, event listings, case study library)
- Replacing a hard-coded list with editor-managed tabular data
- Creating a CMS listing page + per-row detail page pair from a single data source
- Programmatically importing or managing table data via the REST API

HubDB is **not** available on Content Hub Starter — it requires Professional or Enterprise.

## Inputs required

- HubSpot account with Content Hub Professional or Enterprise
- HubSpot CLI installed and authenticated — see `hubspot-cms-local-dev`
- Table design: column names, types, which column is the page/row label
- Decision: **dynamic pages** (CMS generates one page per row automatically) vs. **query-only** (use `hubdb_table_rows()` in an existing template)

## Procedure

### 1. Create a table in the HubSpot UI

1. Go to **Marketing → Files and Templates → HubDB**
2. Click **Create table**
3. Set **Table name** — internal API identifier (no spaces; use underscores, e.g. `team_members`)
4. Set **Label** — human display name
5. Add columns — see types below
6. Enable **"Allow public API access"** if the table will be queried by HubL on public pages or via unauthenticated API calls

**Column types:**

| Type | Notes |
|---|---|
| `TEXT` | Short plain text |
| `RICHTEXT` | HTML-formatted content |
| `NUMBER` | Integer or decimal |
| `BOOLEAN` | True/false |
| `DATE` | Date only |
| `DATETIME` | Date and time |
| `SELECT` | Single-choice from defined options |
| `MULTISELECT` | Multiple-choice |
| `IMAGE` | Object: `url`, `alt`, `width`, `height` |
| `VIDEO` | Video embed |
| `URL` | Object: `url`, `name` (display text) |
| `EMAIL` | Email address |
| `PHONE` | Phone number |
| `LOCATION` | Lat/lng + address string |
| `FOREIGN_ID` | Row reference from another HubDB table |
| `CRM_OBJECT` | Reference to a HubSpot CRM record |

### 2. Manage tables via CLI (Developer Preview)

The CLI provides create/fetch/upload for local table management:

```bash
# Fetch an existing table's schema + rows to a local JSON file
hs hubdb fetch <tableIdOrName> ./my-table.hubdb.json

# Upload a local JSON file to create or update a table
hs hubdb upload ./my-table.hubdb.json

# Clear all rows from a table (keeps columns and settings)
hs hubdb clear <tableIdOrName>
```

**Table JSON format (`team_members.hubdb.json`):**

```json
{
  "name": "team_members",
  "label": "Team Members",
  "allowPublicApiAccess": true,
  "enableChildTablePages": false,
  "columns": [
    { "name": "name",   "label": "Full Name",  "type": "TEXT" },
    { "name": "role",   "label": "Job Title",  "type": "TEXT" },
    { "name": "bio",    "label": "Bio",        "type": "RICHTEXT" },
    { "name": "photo",  "label": "Headshot",   "type": "IMAGE" },
    { "name": "email",  "label": "Email",      "type": "EMAIL" },
    { "name": "order",  "label": "Sort Order", "type": "NUMBER" }
  ],
  "rows": [
    {
      "values": {
        "name":  "Alice Johnson",
        "role":  "Engineering Lead",
        "bio":   "<p>Alice leads the platform team.</p>",
        "email": "alice@example.com",
        "order": 1
      }
    }
  ]
}
```

These CLI commands are in **Developer Preview** — syntax may change. They are not yet generally available.

### 3. Query a table in HubL templates

**`hubdb_table_rows(tableIdOrName, queryString)`** — returns a list of row objects:

```html
{% set rows = hubdb_table_rows("team_members", "orderBy=order&limit=100") %}
{% for member in rows %}
  <div class="team-card">
    {% if member.photo.url %}
      <img src="{{ member.photo.url|escape_url }}"
           alt="{{ member.photo.alt|escape_attr }}"
           loading="lazy">
    {% endif %}
    <h3>{{ member.name|escape_html }}</h3>
    <p class="role">{{ member.role|escape_html }}</p>
    {{ member.bio }}
    {% if member.email %}
      <a href="mailto:{{ member.email|escape_attr }}">{{ member.email|escape_html }}</a>
    {% endif %}
  </div>
{% endfor %}
```

**Other HubDB HubL functions:**

```html
{# Get a single row by ID #}
{% set row = hubdb_table_row("team_members", rowId) %}

{# Get table metadata (columns, row count, etc.) #}
{% set table = hubdb_table("team_members") %}

{# Count matching rows #}
{% set count = hubdb_table_rows_count("team_members", "role__contains=Engineer") %}
```

**Query string parameter reference:**

| Parameter | Example | Effect |
|---|---|---|
| `orderBy` | `orderBy=name` | Sort ascending by column |
| `orderBy` | `orderBy=-name` | Sort descending (prefix `-`) |
| `limit` | `limit=25` | Max rows (default 1,000, max 10,000) |
| `offset` | `offset=25` | Pagination offset |
| `<col>__eq` | `role__eq=Designer` | Exact match |
| `<col>__ne` | `status__ne=inactive` | Not equal |
| `<col>__contains` | `bio__contains=React` | Text contains |
| `<col>__startswith` | `name__startswith=A` | Text starts with |
| `<col>__gt` / `__gte` | `order__gt=5` | Numeric greater than |
| `<col>__lt` / `__lte` | `order__lt=10` | Numeric less than |
| `<col>__isnull` | `photo__isnull=true` | Null check |
| `properties` | `properties=name,role` | Only return specified columns |

### 4. Dynamic pages — auto-generate CMS pages per row

This is the signature HubDB pattern: one table drives a listing page + individual detail page per row.

**Step 1: Enable dynamic pages on the table**

In table settings:
- Check **"Allow creation of dynamic pages from row data"**
- Set **"Page title column"** — this column's value becomes each detail page's title and URL slug
- Set **"Page path prefix"** — e.g. `/team/` → detail pages at `/team/alice-johnson`

**Step 2: Create the listing template**

```html
<!--
  templateType: page
  isAvailableForNewContent: true
  label: Team Listing
  screenshotPath: ../images/template-previews/team-listing.png
-->
{% extends "./layouts/base.html" %}

{% block body %}
<section class="content-wrapper">
  <h1>Our Team</h1>
  <div class="team-grid">
    {% set members = hubdb_table_rows("team_members", "orderBy=order") %}
    {% for member in members %}
      <a href="{{ request.path }}/{{ member.hs_path }}" class="team-card">
        {% if member.photo.url %}
          <img src="{{ member.photo.url|escape_url }}"
               alt="{{ member.photo.alt|escape_attr }}"
               loading="lazy">
        {% endif %}
        <h2>{{ member.name|escape_html }}</h2>
        <p>{{ member.role|escape_html }}</p>
      </a>
    {% endfor %}
  </div>
</section>
{% endblock body %}
```

`member.hs_path` — built-in HubDB property: the URL slug for that row's detail page.

**Step 3: Create the detail template**

This template uses special dynamic page variables populated by HubSpot from the current row:

```html
<!--
  templateType: page
  isAvailableForNewContent: false
  label: Team Member Detail
-->
{% extends "./layouts/base.html" %}

{% block body %}
{# In production: dynamic_page_hubdb_row is the row for the current URL.
   In Design Manager preview: use the testing variables below. #}

{% set testing = true %}
{% set testing_table_id = null %}  {# set to integer table ID #}
{% set testing_row_id = null %}    {# set to integer row ID #}
{% set testing_page_level = 1 %}   {# 0 = root listing, 1 = detail page #}

{% if testing %}
  {% set table_id = testing_table_id %}
  {% set row = hubdb_table_row(table_id, testing_row_id) %}
  {% set page_level = testing_page_level %}
{% else %}
  {% set table_id = dynamic_page_hubdb_table_id %}
  {% set row = dynamic_page_hubdb_row %}
  {% set page_level = dynamic_page_route_level %}
{% endif %}

{% if page_level == 1 and row %}
  <article class="content-wrapper team-member">
    <h1>{{ row.name|escape_html }}</h1>
    <p class="role">{{ row.role|escape_html }}</p>
    {% if row.photo.url %}
      <img src="{{ row.photo.url|escape_url }}"
           alt="{{ row.photo.alt|escape_attr }}"
           loading="eager">
    {% endif %}
    <div class="bio">{{ row.bio }}</div>
    {% if row.email %}
      <a href="mailto:{{ row.email|escape_attr }}">{{ row.email|escape_html }}</a>
    {% endif %}
  </article>
{% endif %}
{% endblock body %}
```

**Dynamic page variables:**

| Variable | Value |
|---|---|
| `dynamic_page_hubdb_table_id` | Integer ID of the table driving dynamic pages |
| `dynamic_page_hubdb_row` | The row object corresponding to the current URL |
| `dynamic_page_route_level` | `0` = listing (root path), `1` = detail (row path) |

**Step 4: Assign the detail template**
- In the HubDB table settings under Dynamic Pages, select your detail template
- In the HubSpot CMS editor, create a new page and select your listing template
- HubSpot auto-generates detail page URLs for every published row

**Step 5: Publish the table**
All row changes go to draft first. Content is not live until you publish:
- UI: click **Publish** in the HubDB table editor
- API: `POST /cms/hubdb/2026-09/tables/{tableIdOrName}/draft/publish`

### 5. HubDB REST API

Use the API for ETL pipelines, bulk imports, or external integrations.

```bash
# Get all tables
GET /cms/hubdb/2026-09/tables
Authorization: Bearer <access_token>

# Get rows from a table
GET /cms/hubdb/2026-09/tables/team_members/rows?orderBy=order&limit=50

# Create a row
POST /cms/hubdb/2026-09/tables/team_members/rows
Content-Type: application/json
{ "values": { "name": "Bob Smith", "role": "Designer", "order": 4 } }

# Update a row (goes to draft)
PATCH /cms/hubdb/2026-09/tables/team_members/rows/{rowId}/draft
{ "values": { "role": "Senior Designer" } }

# Publish draft changes
POST /cms/hubdb/2026-09/tables/team_members/draft/publish
```

All write operations target the **draft** version. Always publish after writes to make changes live.

### 6. Iterate over columns with table metadata

The boilerplate's HubDB template demonstrates introspecting the table schema to render generic column/value output:

```html
{% set table = hubdb_table(table_id) %}
<table>
  <thead>
    <tr>
      {% for col in table.columns %}
        <th>{{ col.label|escape_html }}</th>
      {% endfor %}
    </tr>
  </thead>
  <tbody>
    {% for row in rows %}
      <tr>
        {% for col in table.columns %}
          <td>{{ row[col.name] }}</td>
        {% endfor %}
      </tr>
    {% endfor %}
  </tbody>
</table>
```

### 7. Design Manager testing pattern

When previewing a dynamic detail template in Design Manager, `dynamic_page_hubdb_row` is `null` because there's no URL to derive the row from. Use the testing variables at the top of the template:

```html
{% set testing = true %}           {# set to false before publishing #}
{% set testing_table_id = 12345 %} {# your table's numeric ID #}
{% set testing_row_id = 67890 %}   {# a specific row ID to preview #}
{% set testing_page_level = 1 %}   {# 1 for detail page #}
```

When the template goes live, set `testing = false`.

## Verification

- Table appears at **Marketing → Files and Templates → HubDB**
- `hubdb_table_rows("table_name")` returns expected data in a template preview page
- Dynamic pages: navigating to `/team/alice-johnson` renders the detail template with Alice's row data
- `row.hs_path` in listing links correctly to each member's detail page URL
- API: `GET /cms/hubdb/2026-09/tables/team_members/rows` returns rows as JSON
- Unpublished row changes are not visible on live pages until published

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| `hubdb_table_rows` returns empty | Table not published | Click Publish in HubDB UI; draft data is not accessible in HubL |
| `row.columnname` returns null | Column name mismatch (case-sensitive) | Use the exact `name` from column settings, not the `label` |
| Dynamic detail pages return 404 | Table dynamic pages not enabled or detail template not assigned | Check table settings; re-assign the detail template |
| API returns 403 | Table doesn't have public API access enabled | Enable "Allow public API access" in table settings |
| Edits not going live | Table not published after edit | Publish after every batch of edits |
| `dynamic_page_hubdb_row` is null | Previewing in Design Manager without testing variables | Set `testing = true` and provide `testing_row_id` |
| HubDB not available in account | Account on Content Hub Starter | HubDB requires Professional or Enterprise |

## Escalation

- For HubDB field types in module editors (`hubdbrow`, `hubdbtable`), see `hubspot-cms-modules`.
- For bulk import/export via the API, see the Imports API in `hubspot-public-api`.
- For CRM-linked data, see `hubspot-crm-objects`.
- Reference: [cms-theme-boilerplate HubDB template](https://github.com/HubSpot/cms-theme-boilerplate/blob/main/src/templates/hubdb.html), [HubDB API docs](https://developers.hubspot.com/docs/cms/features/hubdb)
