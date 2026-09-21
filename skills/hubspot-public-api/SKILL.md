---
name: hubspot-public-api
description: "Reference for HubSpot's public REST APIs — authentication (service keys, OAuth), the CRM object pattern, search, batch operations, pagination, rate limits, and versioning. Use when building integrations against any HubSpot API surface: CRM, CMS, Marketing, Automation, Conversations, Files, Webhooks, or Settings."
compatibility: "All HubSpot tiers. Base URL: https://api.hubapi.com. Date-based versioning (2026-09 current GA); legacy v1–v4 unsupported September 2027."
license: MIT
metadata:
    author: georgestephanis
    version: "1.1"
    written: "2026-09-21"
    written_against:
        hubspot-api: "2026-09"
---

## When to use

- Building a new integration against any HubSpot API (CRM, CMS, Marketing, Automation, etc.)
- Debugging auth errors (`401`, `403`), rate limits (`429`), or unexpected response shapes
- Choosing between account service keys and OAuth for a given use case
- Looking up which endpoint to use for a specific object type or action
- Understanding pagination, search filters, or batch operation semantics

For the full endpoint listing by category see [references/api-catalog.md](references/api-catalog.md).

---

## Inputs required

- HubSpot portal (account) ID
- Auth credential: account service key **or** OAuth 2.0 access token
- The object type and action you need (e.g. `contacts` → create)
- For scoped operations: confirm the token's scopes include what the endpoint requires

---

## Procedure

### 1. Choose an auth method

| Method | Header | Best for |
|---|---|---|
| Account service key | `Authorization: Bearer <key>` | Internal tools, server-to-server, single portal |
| OAuth 2.0 access token | `Authorization: Bearer <access_token>` | Multi-portal apps, public integrations |
| Legacy private app token | `Authorization: Bearer <token>` | Existing integrations only — creation ends October 2026 |
| API key (legacy) | `?hapikey=<key>` query param | Removed — migrate to a service key |

**Account service keys** replace private apps for single-portal work: Development →
Keys → Service keys. Legacy private apps stop being creatable 2026-09-28 (new
portals) / 2026-10-26 (existing) and are unsupported from September 2027. See
`hubspot-private-apps`.

**OAuth flow:**
1. Redirect user to `https://app.hubspot.com/oauth/authorize?client_id=…&redirect_uri=…&scope=…`
2. Exchange `code` for tokens: `POST /oauth/2026-09/token` (form body: `grant_type=authorization_code`)
3. Refresh: `POST /oauth/2026-09/token` (`grant_type=refresh_token`)
4. Revoke: `POST /oauth/2026-09/token/revoke` (`token=<token>`)
5. Introspect: `POST /oauth/2026-09/token/introspect`

---

### 2. Understand the CRM object pattern

Almost all CRM objects (contacts, companies, deals, tickets, leads, products, line_items, quotes, orders, etc.) share identical URL structure and semantics:

```
GET    /crm/objects/2026-09/{objectType}                   # list (paginated)
POST   /crm/objects/2026-09/{objectType}                   # create
GET    /crm/objects/2026-09/{objectType}/{id}              # read by ID
PATCH  /crm/objects/2026-09/{objectType}/{id}              # update
DELETE /crm/objects/2026-09/{objectType}/{id}              # archive (soft delete)

POST   /crm/objects/2026-09/{objectType}/search            # search with filters
POST   /crm/objects/2026-09/{objectType}/merge             # merge two records
POST   /crm/objects/2026-09/{objectType}/gdpr-delete       # permanent delete (contacts only)

POST   /crm/objects/2026-09/{objectType}/batch/create      # batch create
POST   /crm/objects/2026-09/{objectType}/batch/read        # batch read by ID
POST   /crm/objects/2026-09/{objectType}/batch/update      # batch update
POST   /crm/objects/2026-09/{objectType}/batch/upsert      # create or update
POST   /crm/objects/2026-09/{objectType}/batch/archive     # batch archive
```

**Known `{objectType}` values:** `contacts`, `companies`, `deals`, `tickets`, `leads`, `products`, `line_items`, `quotes`, `orders`, `invoices`, `calls`, `emails`, `meetings`, `notes`, `tasks`, `communications`, `postal_mail`, `carts`, `payments`, `commerce_payments`, `subscriptions`, `discounts`, `fees`, `taxes`, `feedback_submissions`, `goal_targets`, `appointments`, `courses`, `contracts`, `services`, `listings`

For custom objects use the object type ID (e.g. `p12345678_MyObject`) returned from the Schemas API.

---

### 3. Request / response shapes

**Create / update request body:**
```json
{
  "properties": {
    "firstname": "Alice",
    "email": "alice@example.com"
  },
  "associations": [
    {
      "to": { "id": "7890" },
      "types": [{ "associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 279 }]
    }
  ]
}
```

**Response object shape:**
```json
{
  "id": "12345",
  "properties": { "firstname": "Alice", "email": "alice@example.com" },
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-06-01T00:00:00Z",
  "archived": false
}
```

**Batch read request body:**
```json
{
  "inputs": [{ "id": "123" }, { "id": "456" }],
  "properties": ["firstname", "email"]
}
```

**Upsert** uses `idProperty` to match on a unique property (e.g. `email`):
```json
{
  "inputs": [
    { "idProperty": "email", "id": "alice@example.com", "properties": { "firstname": "Alice" } }
  ]
}
```

---

### 4. Query parameters for list / read endpoints

| Param | Description |
|---|---|
| `limit` | Max records to return (default 10, max 100) |
| `after` | Cursor for next page (from `paging.next.after` in response) |
| `properties` | Comma-separated property names to include |
| `propertiesWithHistory` | Comma-separated properties to include with value history |
| `associations` | Comma-separated association types to include |
| `archived` | `true` to return archived records |
| `idProperty` | Alternate unique property to use as record identifier |

---

### 5. Search API

`POST /crm/objects/2026-09/{objectType}/search`

```json
{
  "filterGroups": [
    {
      "filters": [
        { "propertyName": "lifecyclestage", "operator": "EQ", "value": "customer" },
        { "propertyName": "createdate", "operator": "GTE", "value": "1700000000000" }
      ]
    }
  ],
  "properties": ["firstname", "email", "lifecyclestage"],
  "sorts": [{ "propertyName": "createdate", "direction": "DESCENDING" }],
  "limit": 100,
  "after": "0",
  "query": "alice"
}
```

**Filter operators:** `EQ`, `NEQ`, `LT`, `LTE`, `GT`, `GTE`, `BETWEEN`, `IN`, `NOT_IN`, `HAS_PROPERTY`, `NOT_HAS_PROPERTY`, `CONTAINS_TOKEN`, `NOT_CONTAINS_TOKEN`

Multiple `filters` within a group are ANDed; multiple `filterGroups` are ORed.

Search is limited to 10,000 results total; use `/exports` for full data dumps.

---

### 6. Pagination

List endpoints return a cursor-based `paging` envelope:
```json
{
  "results": [...],
  "paging": {
    "next": { "after": "NTI1Cg%3D%3D", "link": "/crm/objects/2026-09/contacts?after=NTI1Cg%3D%3D" }
  }
}
```
Pass `after` value in the next request. No `paging.next` means you've reached the end.

---

### 7. Associations

**Create associations:**
```
POST /crm/associations/2026-09/{fromObjectType}/{toObjectType}/batch/create
```
```json
{
  "inputs": [
    {
      "from": { "id": "123" },
      "to": { "id": "456" },
      "types": [{ "associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 279 }]
    }
  ]
}
```

**Read association labels (replaces the legacy `/types` endpoint):**
`GET /crm/associations/2026-09/{fromObjectType}/{toObjectType}/labels`

**Read a record's associations:**
`GET /crm/objects/2026-09/{objectType}/{objectId}/associations/{toObjectType}`

Common built-in type IDs: `contact→company = 279`, `contact→deal = 4`, `contact→ticket = 16`, `company→deal = 342`, `deal→line_item = 20`.

---

### 8. Properties API

```
GET    /crm/properties/2026-09/{objectType}                         # list all properties
POST   /crm/properties/2026-09/{objectType}                         # create property
GET    /crm/properties/2026-09/{objectType}/{propertyName}          # read property
PATCH  /crm/properties/2026-09/{objectType}/{propertyName}          # update property
DELETE /crm/properties/2026-09/{objectType}/{propertyName}          # archive property
GET    /crm/properties/2026-09/{objectType}/groups                  # list groups
POST   /crm/properties/2026-09/{objectType}/groups                  # create group
```

Property `fieldType` values: `text`, `textarea`, `number`, `date`, `datetime`, `enumeration`, `booleancheckbox`, `checkbox`, `radio`, `select`, `file`, `phonenumber`, `html`.

---

### 9. Custom object schemas

```
GET    /crm-object-schemas/2026-09/schemas                          # list all custom schemas
POST   /crm-object-schemas/2026-09/schemas                          # create schema
GET    /crm-object-schemas/2026-09/schemas/{objectType}             # read schema
PATCH  /crm-object-schemas/2026-09/schemas/{objectType}             # update schema
DELETE /crm-object-schemas/2026-09/schemas/{objectType}             # delete schema
POST   /crm-object-schemas/2026-09/schemas/{objectType}/associations  # create association def
```

After creating, use the returned `objectTypeId` (e.g. `2-12345678`) as `{objectType}` in CRM object endpoints.

---

### 10. Rate limits

| Token type | Requests per 10 seconds | Daily limit |
|---|---|---|
| Service key / private app (free) | 100 | 250,000 |
| Service key / private app (paid) | 150 | 500,000 |
| OAuth app | 100 / 10s per portal | 250,000 |

When a `429` is returned, inspect `X-HubSpot-RateLimit-Remaining` and `Retry-After` headers. Back off exponentially.

Bulk operations (`batch/*`) count as one API call regardless of record count (up to 100 records per batch call).

---

### 11. API versioning

HubSpot has moved to **date-based versioning**. Numbered versions are legacy.

- **Date-based** (`2026-03`, `2026-09`) — GA versions, released each March and
  September, immutable, supported 18 months. `2026-09` is current. Use these.
- **`-beta`** (`2026-09-beta`, `2027-03-beta`) — preview, subject to change,
  not for production.
- **`v1`–`v4`** — legacy. Declared unsupported 2026-09-15, **enforced
  September 2027** (v4 ends earlier, 2027-03-30). Do not start new work here.

The version sits in the URL path — there is no version header and no
account-level switch. The slug's **position changes** between legacy and
date-based paths, so migration is not a find-and-replace:

```
/crm/v3/objects/contacts   →  /crm/objects/2026-09/contacts
/crm/v3/schemas            →  /crm-object-schemas/2026-09/schemas
/webhooks/v3/{appId}/...   →  /app-webhooks/2026-09/{appId}/...
```

Not every family has a GA date-based version yet — Marketing Forms and the
Automation Flows API are beta-only and must stay on `/marketing/v3/forms` and
`/automation/v4/flows` for now.

From `2026-09` onward, HubSpot **enforces admin-configured property validation
rules on all CRM write paths**. A payload that wrote cleanly on `/crm/v3/` can
return `400` on the date-based path.

See the `hubspot-api-versioning` skill for the full timeline, the generated
legacy→date-based endpoint map, and migration procedure.

---

## Verification

- `200 OK` or `201 Created` with a JSON body containing `id` and `properties`
- For batch operations: `200` with a `results` array
- For async operations: `202 Accepted` with a `taskId` — poll `GET .../tasks/{taskId}/status`
- Test auth by calling `GET /account-info/2026-09/details` — returns portal ID, hub domain, timezone

---

## Failure modes

| Status | Cause | Fix |
|---|---|---|
| `401 UNAUTHORIZED` | Missing or expired token | Refresh OAuth token; check the service key is active |
| `403 FORBIDDEN` | Token lacks required scope | Add the scope to the service key or OAuth consent |
| `404 NOT_FOUND` | Record archived or wrong object type | Check `archived=true`; verify objectType string |
| `409 CONFLICT` | Duplicate unique property on create | Use upsert (`/batch/upsert`) instead |
| `422 VALIDATION_ERROR` | Required property missing or invalid value | Check property `fieldType` constraints |
| `429 TOO_MANY_REQUESTS` | Rate limit hit | Honor `Retry-After`, use batch endpoints, cache reads |
| `500 INTERNAL_ERROR` | Transient server error | Retry with exponential backoff (up to 3 times) |
| Pagination returns duplicate records | Clock skew on `updatedAt` filter | Use `after` cursor, not timestamp filters, for full syncs |
| Search returns max 10,000 results | Search API hard cap | Use `/exports` for full data dumps |
| Batch upsert creates duplicates | `idProperty` mismatch | Ensure the property is marked as unique in Properties API |

---

## Escalation

- Official API docs: https://developers.hubspot.com/docs/api/overview
- Developer changelog: https://developers.hubspot.com/changelog
- OpenAPI spec source: `/tmp/HubSpot-public-api-spec-collection/PublicApiSpecs/` (local clone)
- Full endpoint catalog: [references/api-catalog.md](references/api-catalog.md)
- For CRM data sync workflows, see the `hubspot-crm-objects`, `hubspot-data-sync`, or `hubspot-imports-exports` skills
- For HubDB and CMS templates, see the `hubl` skill
