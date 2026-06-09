---
name: hubspot-hubdb
description: "Work with HubDB — create and manage tables, query data in HubL templates, build dynamic pages, and manage tables via CLI and API"
compatibility: "Content Hub Professional and above (HubDB feature); CLI v7+"
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-06-09"
    written_against:
        hubspot-cli: "7.10"
        hubspot-api: "v3"
        content-hub: "Professional+"
---

## When to use

Use this skill when:
- Building dynamic pages driven by structured data (team directory, product catalog, location finder, event listings)
- Replacing a static HTML list with editor-manageable tabular content
- Creating CMS pages that need listing + detail page pairs driven by one data source
- Importing/exporting structured content programmatically via the HubDB API

HubDB is a relational table feature: rows become pages, columns become content fields. Think of it as a lightweight headless CMS data layer within HubSpot.

## Inputs required

- HubSpot account with Content Hub Professional or Enterprise (HubDB is not available on Starter)
- Table design: column names, types, which column is the display label
- Decision: dynamic pages (auto-generate CMS pages per row) vs. query-only (use table data in existing templates)

## Procedure

### 1. Create a HubDB table in the UI

1. Go to **Marketing → Files and Templates → HubDB**
2. Click **Create table**
3. Set **Table name** (becomes the internal API identifier, no spaces — use underscores)
4. Set **Label** (display name)
5. Add columns — see column types below
6. Enable **"Allow public API access"** if querying from front-end HubL or unauthenticated API calls

**Column types:**

| Type | Use case |
|---|---|
| `TEXT` | Short plain text |
| `RICHTEXT` | HTML formatted text |
| `NUMBER` | Integer or decimal |
| `BOOLEAN` | True/false |
| `DATE` | Date only |
| `DATETIME` | Date and time |
| `SELECT` | Single-choice from defined options |
| `MULTISELECT` | Multiple-choice |
| `IMAGE` | Image URL + alt text |
| `VIDEO` | Video embed |
| `URL` | URL with display text |
| `EMAIL` | Email address |
| `PHONE` | Phone number |
| `LOCATION` | Lat/lng + display address |
| `FOREIGN_ID` | Row from another HubDB table |
| `CRM_OBJECT` | Reference to a HubSpot CRM record |

### 2. Create a table via CLI (Developer Preview)

```bash
# Create table from a JSON schema file
hs hubdb create ./my-table.hubdb.json

# Fetch a table schema and rows to local file
hs hubdb fetch <tableId> ./my-table.hubdb.json

# Upload changes back
hs hubdb upload ./my-table.hubdb.json

# Clear all rows from a table
hs hubdb clear <tableId>
```

**Table JSON format (`my-table.hubdb.json`):**

```json
{
  "label": "Team Members",
  "name": "team_members",
  "allowPublicApiAccess": true,
  "columns": [
    { "name": "name", "label": "Name", "type": "TEXT" },
    { "name": "role", "label": "Role", "type": "TEXT" },
    { "name": "bio", "label": "Bio", "type": "RICHTEXT" },
    { "name": "photo", "label": "Photo", "type": "IMAGE" },
    { "name": "email", "label": "Email", "type": "EMAIL" }
  ],
  "rows": [
    {
      "values": {
        "name": "Alice Johnson",
        "role": "Engineering Lead",
        "bio": "<p>Alice leads the platform team.</p>",
        "email": "alice@example.com"
      }
    }
  ]
}
```

### 3. Query a table in HubL templates

```html
{% set rows = hubdb_table_rows(tableId, "orderBy=name&limit=100") %}
{% for row in rows %}
  <div class="team-card">
    {% if row.photo %}
      <img src="{{ row.photo.url }}" alt="{{ row.photo.alt }}">
    {% endif %}
    <h3>{{ row.name }}</h3>
    <p class="role">{{ row.role }}</p>
    {{ row.bio }}
  </div>
{% endfor %}
```

**Key HubDB HubL functions:**

```html
{# Get all rows from a table by name or ID #}
{% set rows = hubdb_table_rows("team_members", "orderBy=name") %}

{# Get a single row by its ID #}
{% set member = hubdb_table_row("team_members", rowId) %}

{# Get table metadata #}
{% set table = hubdb_table("team_members") %}

{# Count rows #}
{% set count = hubdb_table_rows_count("team_members") %}
```

**Query string parameters:**

| Parameter | Example | Effect |
|---|---|---|
| `orderBy` | `orderBy=name` | Sort ascending by column |
| `orderBy` | `orderBy=-name` | Sort descending (prefix `-`) |
| `limit` | `limit=10` | Max rows returned (default 100, max 1000) |
| `offset` | `offset=10` | Pagination offset |
| `<column>__contains` | `role__contains=Engineer` | Text contains filter |
| `<column>__eq` | `name__eq=Alice` | Exact match filter |
| `<column>__gt` | `salary__gt=50000` | Greater than |
| `<column>__lt` | `salary__lt=100000` | Less than |

### 4. Dynamic pages pattern

Dynamic pages auto-generate a CMS page per HubDB row — ideal for team directories, location finders, product catalogs.

**Step 1: Enable dynamic pages on the table**
- In the table settings, check **"Enable dynamic pages"**
- Set the **"Page title column"** (what becomes the `<title>` and URL slug)
- Set the **"Page path prefix"** (e.g., `/team/` → pages at `/team/alice-johnson`)

**Step 2: Create a detail template**

```html
<!--
  templateType: page
  label: Team Member Detail
  isAvailableForNewContent: false
-->
{% extends "./base.html" %}

{% block body %}
{# hubdb_table_row for the current page's row is automatically available #}
{% set row = dynamic_page_hubdb_row %}

<article class="team-member">
  <h1>{{ row.name }}</h1>
  <p class="role">{{ row.role }}</p>
  {% if row.photo %}
    <img src="{{ row.photo.url }}" alt="{{ row.photo.alt }}">
  {% endif %}
  <div class="bio">{{ row.bio }}</div>
  {% if row.email %}
    <a href="mailto:{{ row.email }}">{{ row.email }}</a>
  {% endif %}
</article>
{% endblock %}
```

**Step 3: Create a listing template**

```html
<!--
  templateType: page
  label: Team Listing
  isAvailableForNewContent: true
-->
{% extends "./base.html" %}

{% block body %}
<section>
  <h1>Our Team</h1>
  <div class="team-grid">
    {% set members = hubdb_table_rows("team_members", "orderBy=name") %}
    {% for member in members %}
      <a href="{{ member.hs_path }}" class="team-card">
        {% if member.photo %}
          <img src="{{ member.photo.url }}" alt="{{ member.photo.alt }}">
        {% endif %}
        <h2>{{ member.name }}</h2>
        <p>{{ member.role }}</p>
      </a>
    {% endfor %}
  </div>
</section>
{% endblock %}
```

`member.hs_path` — built-in HubDB property giving the dynamic page URL for that row.

**Step 4: Assign the detail template**
- In table settings under Dynamic Pages, select the detail template
- In HubSpot CMS, create a new page using the listing template
- HubSpot will generate detail pages for each row automatically

### 5. HubDB REST API

For programmatic management (ETL, imports, automation):

```bash
# Get all tables
GET /cms/v3/hubdb/tables

# Get rows from a table
GET /cms/v3/hubdb/tables/{tableIdOrName}/rows

# Create a row
POST /cms/v3/hubdb/tables/{tableIdOrName}/rows
Body: { "values": { "name": "Bob Smith", "role": "Designer" } }

# Update a row
PATCH /cms/v3/hubdb/tables/{tableIdOrName}/rows/{rowId}/draft

# Publish table changes (draft → live)
POST /cms/v3/hubdb/tables/{tableIdOrName}/draft/publish
```

Important: all write operations go to the **draft** version of the table. Run the publish endpoint to make changes live.

### 6. Publish workflow

All row additions/edits land in **draft** state. Content is not live until published:
- **UI**: Click **"Publish"** in the HubDB table editor
- **API**: `POST /cms/v3/hubdb/tables/{tableIdOrName}/draft/publish`
- **CLI**: `hs hubdb upload` followed by manual publish via UI (CLI upload creates draft)

## Verification

- Table appears in **Marketing → Files and Templates → HubDB**
- HubL `hubdb_table_rows("table_name")` returns expected rows in a preview page
- Dynamic pages: navigating to `/team/alice-johnson` renders the detail template with correct row data
- `row.hs_path` values in listing template point to correct detail page URLs
- API `GET /cms/v3/hubdb/tables/{name}/rows` returns rows in JSON

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| `hubdb_table_rows` returns empty | Table not published | Publish the table; drafts are not accessible in templates |
| HubL shows `null` for a column | Column name typo or wrong case | Column names in HubL must exactly match the column `name` (not label) |
| Dynamic pages return 404 | Table dynamic pages not enabled or detail template not assigned | Check table settings and re-assign template |
| API returns 403 | Table doesn't have public API access enabled | Enable "Allow public API access" in table settings |
| Row edits not going live | Forgot to publish after edits | Publish table after every batch of edits |
| `hs hubdb` commands fail | Feature in Developer Preview; account access issue | Verify account has HubDB and CLI >= v7 |

## Escalation

- For querying HubDB rows in a module, see `hubspot-cms-modules` (field type `hubdbrow`, `hubdbtable`).
- For programmatic bulk import/export, see `hubspot-imports-exports`.
- For CRM-linked data that doesn't fit a static table, see `hubspot-crm-objects`.
- [HubDB docs](https://developers.hubspot.com/docs/cms/features/hubdb)
