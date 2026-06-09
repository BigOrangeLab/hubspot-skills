---
name: hubspot-crm-objects
description: "General CRUD pattern for any HubSpot CRM object — contacts, companies, deals, tickets, leads, products, line items, quotes, and custom objects. Covers batch operations, the Search API, pagination, associations, merge, and 429 handling."
compatibility: "All Hub tiers; CRM v3 API"
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-06-09"
    written_against:
        hubspot-api: "crm/v3"
---

## When to use

- Creating, reading, updating, or archiving any CRM object record
- Batch-importing or batch-updating records (up to 100 per call)
- Searching for records matching property filters or full-text query
- Syncing CRM data to/from an external system
- Deduplicating records with upsert
- Fetching records with their associations inline
- Merging duplicate records

For association-specific operations (creating, labeling, paginating associations), see the `hubspot-associations-v4` skill.

---

## Inputs required

- Private App access token with appropriate CRM scopes (see `hubspot-private-apps` skill)
- `objectType` string for the target object
- For writes: knowledge of required and optional property names (internal snake_case names)

---

## Procedure

### 1. Know your objectType values

**Standard objects:**

| objectType string | Object |
|---|---|
| `contacts` | Contacts |
| `companies` | Companies |
| `deals` | Deals |
| `tickets` | Tickets |
| `leads` | Leads (Sales Hub Pro+) |
| `products` | Products (product library) |
| `line_items` | Line items (on quotes/deals) |
| `quotes` | Quotes |
| `orders` | Orders (Commerce) |
| `invoices` | Invoices (Commerce) |
| `calls` | Call engagements |
| `emails` | Email engagements |
| `meetings` | Meeting engagements |
| `notes` | Note engagements |
| `tasks` | Task engagements |
| `communications` | SMS/WhatsApp |

**Custom objects:** use the numeric `objectTypeId` (e.g., `2-12345678`) returned by the Schemas API.

---

### 2. Standard CRUD

**Base URL pattern:**

```
https://api.hubapi.com/crm/v3/objects/{objectType}
```

**List records:**

```
GET /crm/v3/objects/{objectType}
  ?limit=100
  &after=<cursor>
  &properties=firstname,lastname,email
  &associations=companies
  &archived=false
```

```javascript
const res = await fetch(
  'https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=firstname,email',
  { headers: { Authorization: `Bearer ${token}` } }
);
const { results, paging } = await res.json();
// paging.next.after is the cursor for the next page; absent when done
```

**Create a record:**

```
POST /crm/v3/objects/{objectType}
```

```json
{
  "properties": {
    "email": "alice@example.com",
    "firstname": "Alice",
    "lastname": "Smith",
    "phone": "+15555550100"
  },
  "associations": [
    {
      "to": { "id": "12345" },
      "types": [{ "associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 279 }]
    }
  ]
}
```

Response (`201 Created`):

```json
{
  "id": "98765432",
  "properties": {
    "email": "alice@example.com",
    "firstname": "Alice",
    "createdate": "2026-06-09T12:00:00.000Z",
    "lastmodifieddate": "2026-06-09T12:00:00.000Z",
    "hs_object_id": "98765432"
  },
  "createdAt": "2026-06-09T12:00:00.000Z",
  "updatedAt": "2026-06-09T12:00:00.000Z",
  "archived": false
}
```

**Get by ID:**

```
GET /crm/v3/objects/{objectType}/{objectId}
  ?properties=firstname,email,lifecyclestage
  &propertiesWithHistory=lifecyclestage
  &associations=companies,deals
  &archived=false
```

**Update (partial — PATCH only changes specified properties):**

```
PATCH /crm/v3/objects/{objectType}/{objectId}
```

```json
{
  "properties": {
    "lifecyclestage": "customer",
    "phone": "+15555550200"
  }
}
```

**Archive (soft delete):**

```
DELETE /crm/v3/objects/{objectType}/{objectId}
```

Returns `204 No Content`. Archived records are excluded from list/search by default (`?archived=false`). Pass `?archived=true` to include them.

**Permanent delete (contacts only — GDPR):**

```
POST /crm/v3/objects/contacts/gdpr-delete
```

```json
{ "objectId": "98765432" }
```

or by email:

```json
{ "idProperty": "email", "objectId": "alice@example.com" }
```

Permanently removes contact and all associated engagement data. Irreversible.

---

### 3. Batch operations

Batch endpoints process up to **100 records per call** and count as **1 API call** (not 100).

**Batch create:**

```
POST /crm/v3/objects/{objectType}/batch/create
```

```json
{
  "inputs": [
    { "properties": { "email": "a@example.com", "firstname": "Alice" } },
    { "properties": { "email": "b@example.com", "firstname": "Bob" } }
  ]
}
```

**Batch read by ID:**

```
POST /crm/v3/objects/{objectType}/batch/read
```

```json
{
  "properties": ["email", "firstname", "lifecyclestage"],
  "inputs": [
    { "id": "123" },
    { "id": "456" }
  ]
}
```

**Batch read by unique property** (e.g., email):

```json
{
  "idProperty": "email",
  "properties": ["firstname", "lifecyclestage"],
  "inputs": [
    { "id": "alice@example.com" },
    { "id": "bob@example.com" }
  ]
}
```

**Batch update:**

```
POST /crm/v3/objects/{objectType}/batch/update
```

```json
{
  "inputs": [
    { "id": "123", "properties": { "lifecyclestage": "customer" } },
    { "id": "456", "properties": { "lifecyclestage": "lead" } }
  ]
}
```

**Batch upsert (create-or-update):**

```
POST /crm/v3/objects/{objectType}/batch/upsert
```

```json
{
  "idProperty": "email",
  "inputs": [
    {
      "id": "alice@example.com",
      "properties": { "firstname": "Alice", "lifecyclestage": "customer" }
    }
  ]
}
```

`idProperty` must be a property marked as **unique** in the portal. For contacts, `email` is unique by default. Returns `200` with `results` array; each result indicates `"status": "CREATED"` or `"UPDATED"`.

**Batch archive:**

```
POST /crm/v3/objects/{objectType}/batch/archive
```

```json
{ "inputs": [{ "id": "123" }, { "id": "456" }] }
```

---

### 4. Search API

```
POST /crm/v3/objects/{objectType}/search
```

```json
{
  "filterGroups": [
    {
      "filters": [
        { "propertyName": "lifecyclestage", "operator": "EQ", "value": "lead" },
        { "propertyName": "createdate", "operator": "GT", "value": "1717200000000" }
      ]
    },
    {
      "filters": [
        { "propertyName": "lifecyclestage", "operator": "EQ", "value": "opportunity" }
      ]
    }
  ],
  "properties": ["email", "firstname", "lifecyclestage"],
  "sorts": [{ "propertyName": "createdate", "direction": "DESCENDING" }],
  "limit": 100,
  "after": 0,
  "query": "alice"
}
```

`filterGroups` is **OR** between groups; filters within a group are **AND**.
`query` is a full-text search across indexed string properties.

**All filter operators:**

| Operator | Description |
|---|---|
| `EQ` | Equals |
| `NEQ` | Not equals |
| `LT` | Less than |
| `LTE` | Less than or equal |
| `GT` | Greater than |
| `GTE` | Greater than or equal |
| `BETWEEN` | Between two values (requires `highValue`) |
| `IN` | Value is in a list (`values` array instead of `value`) |
| `NOT_IN` | Value is not in a list |
| `HAS_PROPERTY` | Property exists and is not empty |
| `NOT_HAS_PROPERTY` | Property is empty or does not exist |
| `CONTAINS_TOKEN` | Multi-value enumeration contains value |
| `NOT_CONTAINS_TOKEN` | Multi-value enumeration does not contain value |

**Date values** must be Unix timestamps in **milliseconds**:

```javascript
const since = new Date('2026-01-01').getTime(); // 1735689600000
```

**Hard cap:** Search returns a maximum of **10,000 results**. For full exports, use the Exports API (`POST /crm/v3/exports`) instead.

**Pagination in search** uses `after` as an integer offset (not a cursor string like the list endpoint):

```json
{ "after": 100, "limit": 100 }
```

---

### 5. Query parameters reference

| Param | Applies to | Description |
|---|---|---|
| `limit` | GET list | Records per page, max 100 |
| `after` | GET list | Cursor from `paging.next.after` |
| `properties` | GET, batch read, search | Comma-separated property names to include |
| `propertiesWithHistory` | GET by ID | Properties to include with historical values |
| `associations` | GET | Association types to include inline |
| `archived` | GET list, GET by ID | Include archived records (`true`/`false`, default `false`) |
| `idProperty` | GET by ID, batch read, upsert | Alternate unique property to use as the ID |

---

### 6. Pagination — full-sync pattern

**List endpoint (cursor-based):**

```javascript
async function getAllRecords(objectType, token, properties = []) {
  const records = [];
  let after;
  do {
    const url = new URL(`https://api.hubapi.com/crm/v3/objects/${objectType}`);
    url.searchParams.set('limit', '100');
    url.searchParams.set('properties', properties.join(','));
    if (after) url.searchParams.set('after', after);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    records.push(...data.results);
    after = data.paging?.next?.after;
  } while (after);
  return records;
}
```

**Delta-sync** (only recently modified records):

```json
{
  "filterGroups": [{
    "filters": [{
      "propertyName": "lastmodifieddate",
      "operator": "GT",
      "value": "1717200000000"
    }]
  }],
  "sorts": [{ "propertyName": "lastmodifieddate", "direction": "ASCENDING" }],
  "limit": 100
}
```

Use `lastmodifieddate` filter on the Search API with a stored high-water mark timestamp.

---

### 7. Associations inline on create

Include associations when creating a record to link it in one call:

```json
{
  "properties": { "dealname": "Big Deal", "amount": "50000" },
  "associations": [
    {
      "to": { "id": "CONTACT_ID" },
      "types": [{ "associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 3 }]
    },
    {
      "to": { "id": "COMPANY_ID" },
      "types": [{ "associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 5 }]
    }
  ]
}
```

**Common HUBSPOT_DEFINED association type IDs:**

| From → To | typeId |
|---|---|
| Contact → Company | 279 |
| Contact → Deal | 4 |
| Contact → Ticket | 16 |
| Company → Contact | 280 |
| Company → Deal | 342 |
| Deal → Contact | 3 |
| Deal → Company | 5 |
| Deal → Line Item | 19 |
| Ticket → Contact | 15 |

For a complete list: `GET /crm/v4/associations/{fromObjectType}/{toObjectType}/types`

---

### 8. Merge records

```
POST /crm/v3/objects/{objectType}/merge
```

```json
{
  "primaryObjectId": "123",
  "objectIdToMerge": "456"
}
```

The record with `primaryObjectId` survives; `objectIdToMerge` is archived. Properties from the merged record fill in any blanks on the primary. Associations are transferred.

---

### 9. Rate limits and backoff

See `hubspot-private-apps` skill for rate limit values. Handling pattern:

```javascript
async function apiCall(url, options, maxRetries = 4) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options);
    if (res.status !== 429) return res;
    const retryAfter = parseInt(res.headers.get('Retry-After') ?? '10', 10);
    const backoff = retryAfter * 1000 * Math.pow(2, attempt);
    await new Promise(r => setTimeout(r, Math.min(backoff, 60000)));
  }
  throw new Error('Max retries exceeded');
}
```

Prefer **batch endpoints** over individual calls when processing many records — they count as 1 request regardless of record count (up to 100).

---

## Verification

```bash
# List first page of contacts
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm/v3/objects/contacts?limit=5&properties=email,firstname" \
  | jq '{total: .total, count: (.results | length), first: .results[0].properties}'

# Create a test contact
curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"email": "test-skill@example.com", "firstname": "Test"}}' \
  "https://api.hubapi.com/crm/v3/objects/contacts" \
  | jq '{id: .id, email: .properties.email}'
```

Expected: 200 with `results` array for list; 201 with `id` for create.

---

## Failure modes

| Error | Cause | Fix |
|---|---|---|
| `401 UNAUTHORIZED` | Missing / expired token | Check `Authorization: Bearer` header; verify token in HubSpot |
| `403 FORBIDDEN` | Token lacks CRM scope | Add `crm.objects.{type}.read/write` scope to private app |
| `404 NOT_FOUND` | Record archived or wrong objectType | Check `?archived=true`; verify objectType string is correct |
| `409 CONFLICT` | Duplicate on unique property (e.g., email) | Use `batch/upsert` with `idProperty` instead of `create` |
| `422 VALIDATION_ERROR` | Required property missing, invalid enum value | Check property `fieldType` via Properties API; validate enum options |
| `429 TOO_MANY_REQUESTS` | Rate limit hit | Back off per `Retry-After`; use batch endpoints |
| `500 INTERNAL_ERROR` | Transient server error | Retry with exponential backoff (up to 3 times) |
| Search returns 0 results | `filterGroups` wrong structure; wrong data type | Wrap all filters in `filterGroups[0].filters`; use ms timestamps for dates |
| Search misses records | Clock skew or `lastmodifieddate` not updated on all changes | Use `after` cursor, not timestamp filter, for reliable full sync |
| Batch upsert creates duplicates | Wrong `idProperty` or property not marked unique | Confirm the property is marked unique in Properties API |
| Pagination skips records | Mixing cursor and offset in same loop | Use only `paging.next.after` cursor for list; only integer `after` for search |

---

## Escalation

- CRM Objects API docs: https://developers.hubspot.com/docs/api/crm/crm-objects
- Search API: https://developers.hubspot.com/docs/api/crm/search
- Batch operations: https://developers.hubspot.com/docs/api/crm/batch-operations
- Exports API (for >10k records): https://developers.hubspot.com/docs/api/crm/exports
- For auth setup: see `hubspot-private-apps` skill
- For associations: see `hubspot-associations-v4` skill (to be built)
- For custom object schemas: see `hubspot-custom-objects` skill (to be built)
