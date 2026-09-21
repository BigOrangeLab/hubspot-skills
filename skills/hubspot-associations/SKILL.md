---
name: hubspot-associations
description: "Manage HubSpot CRM associations on the 2026-09 API — create labeled and unlabeled associations, read/paginate association lists, manage custom association labels, and handle the 250k-per-type limit. Covers migration from the deprecated v4 association endpoints."
compatibility: "All Hub tiers; CRM associations on 2026-09. The v4 association API is legacy — support ends 2027-03-30."
license: MIT
metadata:
  author: georgestephanis
  version: "2.0"
  written: "2026-09-21"
  written_against:
    hubspot-api: "2026-09"
---

## When to use

- Linking two CRM records together (contact → company, deal → contact, ticket → company, etc.)
- Applying a custom or labeled association type (e.g., "Primary Contact", "Decision Maker")
- Reading all records associated with a given object, with pagination
- Creating or managing custom association label schemas
- Removing a specific labeled association without breaking other labels between the same pair
- Batch-associating large numbers of record pairs efficiently

> **v4 associations are legacy.** Support ends **2027-03-30** — earlier than the
> September 2027 date for v1–v3. Use the `2026-09` paths below for all new work.

Migrating from v4? Three things move:

| Operation                      | v4 (legacy)                                                      | 2026-09                                                                    |
| ------------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Read one record's associations | `GET /crm/v4/associations/{from}/{id}/to/{to}`                   | `GET /crm/objects/2026-09/{from}/{id}/associations/{to}`                   |
| Write/delete a single pair     | `PUT` / `DELETE /crm/v4/associations/{from}/{id}/to/{to}/{toId}` | `PUT` / `DELETE /crm/objects/2026-09/{from}/{id}/associations/{to}/{toId}` |
| List valid types for a pair    | `GET /crm/v4/associations/{from}/{to}/types`                     | `GET /crm/associations/2026-09/{from}/{to}/labels`                         |

Single-record reads and single-pair writes move **under the object**; batch
operations and label management keep an associations prefix with the version slug
in the middle. The old `/types` endpoint is replaced by `/labels`.

For creating records with associations in the same call, see `hubspot-crm-objects` skill (associations inline on create).

---

## Inputs required

- Account service key with `crm.objects.*.read` and `crm.objects.*.write` scopes for the object types involved
- `fromObjectType` and `toObjectType` strings (e.g., `contacts`, `companies`, `deals`, `tickets`, or numeric `objectTypeId` for custom objects)
- `fromObjectId` / `toObjectId` — HubSpot record IDs (numeric strings)
- For labeled associations: `associationTypeId` + `associationCategory` (from Schema API or known defaults)

---

## Procedure

### 1. Association type categories

Every association has a category and a typeId:

| `associationCategory` | Meaning                                 |
| --------------------- | --------------------------------------- |
| `HUBSPOT_DEFINED`     | Built-in HubSpot association type       |
| `USER_DEFINED`        | Custom label created in this portal     |
| `INTEGRATOR_DEFINED`  | Custom label created by a connected app |

HubSpot-defined types are fixed integers. The most common:

| Pair                        | Direction         | typeId |
| --------------------------- | ----------------- | ------ |
| Contact → Company (primary) | contact → company | 279    |
| Company → Contact (primary) | company → contact | 280    |
| Contact → Deal              | contact → deal    | 4      |
| Deal → Contact              | deal → contact    | 3      |
| Contact → Ticket            | contact → ticket  | 16     |
| Ticket → Contact            | ticket → contact  | 15     |
| Company → Deal              | company → deal    | 342    |
| Deal → Company              | deal → company    | 5      |
| Deal → Line Item            | deal → line_item  | 19     |
| Line Item → Deal            | line_item → deal  | 20     |

To look up all types for a pair:

```bash
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm/associations/2026-09/contacts/companies/labels"
```

---

### 2. Create or update associations (single pair)

```
PUT /crm/objects/2026-09/{fromObjectType}/{fromObjectId}/associations/{toObjectType}/{toObjectId}
```

```bash
curl -s -X PUT \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "associationCategory": "HUBSPOT_DEFINED",
      "associationTypeId": 279
    }
  ]' \
  "https://api.hubapi.com/crm/objects/2026-09/contacts/12345/associations/companies/67890"
```

The body is an array of `{ associationCategory, associationTypeId }` objects — you can apply multiple labels in one call.

**Adding a label without removing existing ones:** PUT replaces the full set of association types between the pair. To preserve existing labels, read the current types first (Step 5), then include them all in the PUT body alongside the new one.

Response (`200 OK`):

```json
{
  "fromObjectTypeId": "0-1",
  "fromObjectId": 12345,
  "toObjectTypeId": "0-2",
  "toObjectId": 67890,
  "labels": ["Primary"]
}
```

---

### 3. Batch create associations

Up to **100 pairs per call**, counts as 1 API request.

```
POST /crm/associations/2026-09/{fromObjectType}/{toObjectType}/batch/create
```

```bash
curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": [
      {
        "from": { "id": "12345" },
        "to": { "id": "67890" },
        "types": [
          { "associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 279 }
        ]
      },
      {
        "from": { "id": "12346" },
        "to": { "id": "67891" },
        "types": [
          { "associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 279 }
        ]
      }
    ]
  }' \
  "https://api.hubapi.com/crm/associations/2026-09/contacts/companies/batch/create"
```

---

### 4. Batch read associations (get all associations for multiple records)

```
POST /crm/associations/2026-09/{fromObjectType}/{toObjectType}/batch/read
```

```json
{
  "inputs": [{ "id": "12345" }, { "id": "12346" }]
}
```

Response per input:

```json
{
  "results": [
    {
      "from": { "id": "12345" },
      "to": [
        {
          "toObjectId": 67890,
          "associationTypes": [
            {
              "category": "HUBSPOT_DEFINED",
              "typeId": 279,
              "label": "Primary"
            }
          ]
        }
      ],
      "paging": {
        "next": {
          "after": "NTI1Cg%3D%3D",
          "link": "..."
        }
      }
    }
  ]
}
```

---

### 5. Read associations for a single record (with pagination)

```
GET /crm/objects/2026-09/{fromObjectType}/{fromObjectId}/associations/{toObjectType}
  ?limit=500
  &after=<cursor>
```

```javascript
async function getAllAssociations(fromType, fromId, toType, token) {
  const results = [];
  let after;
  const base = `https://api.hubapi.com/crm/objects/2026-09/${fromType}/${fromId}/associations/${toType}`;

  do {
    const url = new URL(base);
    url.searchParams.set("limit", "500");
    if (after) url.searchParams.set("after", after);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    results.push(...(data.results ?? []));
    after = data.paging?.next?.after;
  } while (after);

  return results;
}
```

**Association limit:** Each object can have at most **250,000 associations per object type** (as of November 2025). If you approach this limit, HubSpot will return a `400` with `ASSOCIATIONS_LIMIT_EXCEEDED`. Consider whether the relationship should be modeled differently (e.g., using HubDB or custom properties).

---

### 6. Delete associations

#### Delete all associations between a pair

```
DELETE /crm/objects/2026-09/{fromObjectType}/{fromObjectId}/associations/{toObjectType}/{toObjectId}
```

This removes every association type between the two records. Use with care.

#### Delete specific labels only

```
POST /crm/associations/2026-09/{fromObjectType}/{toObjectType}/batch/labels/archive
```

```json
{
  "inputs": [
    {
      "from": { "id": "12345" },
      "to": { "id": "67890" },
      "types": [
        { "associationCategory": "USER_DEFINED", "associationTypeId": 44 }
      ]
    }
  ]
}
```

This removes only the listed labels, leaving any other association types between the pair intact.

#### Batch delete all associations

```
POST /crm/associations/2026-09/{fromObjectType}/{toObjectType}/batch/archive
```

```json
{
  "inputs": [{ "from": { "id": "12345" }, "to": { "id": "67890" } }]
}
```

---

### 7. Manage custom association labels (Schema API)

Custom labels allow portals to define named relationship types (e.g., "Primary Contact", "Decision Maker").

#### Create a custom label

```
POST /crm/associations/2026-09/{fromObjectType}/{toObjectType}/labels
```

```json
{
  "name": "Decision Maker",
  "label": "Decision Maker",
  "inverseLabel": "Decision Maker's Company"
}
```

- `label` — the name shown from the `fromObjectType` perspective.
- `inverseLabel` — name shown from the `toObjectType` perspective (optional; defaults to same as `label`).

Response includes the assigned `typeId` and `inverseTypeId`.

#### List all labels for a pair

```
GET /crm/associations/2026-09/{fromObjectType}/{toObjectType}/labels
```

Returns all HUBSPOT_DEFINED and USER_DEFINED label types with their IDs.

#### Delete a custom label

```
DELETE /crm/associations/2026-09/{fromObjectType}/{toObjectType}/labels/{associationTypeId}
```

---

### 8. Unlabeled associations

An unlabeled association uses a HUBSPOT_DEFINED typeId but carries no display label. These are the legacy v3 association types. They still work in 2026-09:

```json
{
  "associationCategory": "HUBSPOT_DEFINED",
  "associationTypeId": 279
}
```

The `labels` array in the response will be empty for unlabeled types.

---

## Verification

```bash
# Get all association types for contacts → companies
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm/associations/2026-09/contacts/companies/labels" \
  | jq '[.results[] | {typeId: .typeId, label: .label, category: .category}]'

# Associate a contact to a company
curl -s -X PUT \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"associationCategory":"HUBSPOT_DEFINED","associationTypeId":279}]' \
  "https://api.hubapi.com/crm/objects/2026-09/contacts/$CONTACT_ID/associations/companies/$COMPANY_ID"

# Read back the association
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm/objects/2026-09/contacts/$CONTACT_ID/associations/companies" \
  | jq '.results'
```

---

## Failure modes

| Error                                        | Cause                                               | Fix                                                                   |
| -------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| `400 ASSOCIATIONS_LIMIT_EXCEEDED`            | Record has hit 250k associations of that type       | Redesign the data model; remove stale associations                    |
| `400 INVALID_ASSOCIATION_TYPE`               | `typeId` does not exist for this object pair        | Fetch valid types from `/crm/associations/2026-09/{from}/{to}/labels` |
| `403 FORBIDDEN`                              | Token missing object read/write scope               | Add `crm.objects.{type}.read` + `crm.objects.{type}.write` scopes     |
| `404 NOT_FOUND`                              | One or both object IDs do not exist or are archived | Verify record IDs; check `?archived=true` on the records endpoint     |
| `409 CONFLICT` on label create               | Label name already exists for this pair             | GET existing labels; reuse the existing typeId                        |
| PUT wipes existing labels                    | PUT replaces the full type set                      | Read existing types first, then include them all in the PUT body      |
| Batch read missing results                   | Object has more associations than the page limit    | Paginate using `paging.next.after` per result                         |
| `ENGAGEMENT` or `EMAIL` object type rejected | Not supported in generic CRM associations           | Use the Engagements API to attach engagements to CRM records          |

---

## Escalation

- Associations reference: https://developers.hubspot.com/docs/api/crm/associations
- Association Schema API (labels): https://developers.hubspot.com/docs/guides/api/crm/associations/associations-v4
- For CRM record CRUD: see `hubspot-crm-objects` skill
- For custom object type definitions: see `hubspot-custom-objects` skill
- For auth and token setup: see `hubspot-private-apps` skill
