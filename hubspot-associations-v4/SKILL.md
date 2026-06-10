---
name: hubspot-associations-v4
description: "Manage HubSpot CRM associations using the v4 API — create labeled and unlabeled associations, read/paginate association lists, manage custom association labels via the Schema API, and handle the 250k-per-type limit"
compatibility: "All Hub tiers; CRM Associations v4 API (GA)"
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-06-09"
    written_against:
        hubspot-api: "crm/v4/associations"
---

## When to use

- Linking two CRM records together (contact → company, deal → contact, ticket → company, etc.)
- Applying a custom or labeled association type (e.g., "Primary Contact", "Decision Maker")
- Reading all records associated with a given object, with pagination
- Creating or managing custom association label schemas
- Removing a specific labeled association without breaking other labels between the same pair
- Batch-associating large numbers of record pairs efficiently

Use the v4 API for all new association work. The v3 associations endpoint is legacy and does not support labels.

For creating records with associations in the same call, see `hubspot-crm-objects` skill (associations inline on create).

---

## Inputs required

- Private App access token with `crm.objects.*.read` and `crm.objects.*.write` scopes for the object types involved
- `fromObjectType` and `toObjectType` strings (e.g., `contacts`, `companies`, `deals`, `tickets`, or numeric `objectTypeId` for custom objects)
- `fromObjectId` / `toObjectId` — HubSpot record IDs (numeric strings)
- For labeled associations: `associationTypeId` + `associationCategory` (from Schema API or known defaults)

---

## Procedure

### 1. Association type categories

Every association has a category and a typeId:

| `associationCategory` | Meaning |
|---|---|
| `HUBSPOT_DEFINED` | Built-in HubSpot association type |
| `USER_DEFINED` | Custom label created in this portal |
| `INTEGRATOR_DEFINED` | Custom label created by a connected app |

HubSpot-defined types are fixed integers. The most common:

| Pair | Direction | typeId |
|---|---|---|
| Contact → Company (primary) | contact → company | 279 |
| Company → Contact (primary) | company → contact | 280 |
| Contact → Deal | contact → deal | 4 |
| Deal → Contact | deal → contact | 3 |
| Contact → Ticket | contact → ticket | 16 |
| Ticket → Contact | ticket → contact | 15 |
| Company → Deal | company → deal | 342 |
| Deal → Company | deal → company | 5 |
| Deal → Line Item | deal → line_item | 19 |
| Line Item → Deal | line_item → deal | 20 |

To look up all types for a pair:

```bash
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm/v4/associations/contacts/companies/types"
```

---

### 2. Create or update associations (single pair)

```
PUT /crm/v4/associations/{fromObjectType}/{fromObjectId}/to/{toObjectType}/{toObjectId}
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
  "https://api.hubapi.com/crm/v4/associations/contacts/12345/to/companies/67890"
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
POST /crm/v4/associations/{fromObjectType}/{toObjectType}/batch/create
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
  "https://api.hubapi.com/crm/v4/associations/contacts/companies/batch/create"
```

---

### 4. Batch read associations (get all associations for multiple records)

```
POST /crm/v4/associations/{fromObjectType}/{toObjectType}/batch/read
```

```json
{
  "inputs": [
    { "id": "12345" },
    { "id": "12346" }
  ]
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
GET /crm/v4/associations/{fromObjectType}/{fromObjectId}/to/{toObjectType}
  ?limit=500
  &after=<cursor>
```

```javascript
async function getAllAssociations(fromType, fromId, toType, token) {
  const results = [];
  let after;
  const base = `https://api.hubapi.com/crm/v4/associations/${fromType}/${fromId}/to/${toType}`;

  do {
    const url = new URL(base);
    url.searchParams.set('limit', '500');
    if (after) url.searchParams.set('after', after);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
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
DELETE /crm/v4/associations/{fromObjectType}/{fromObjectId}/to/{toObjectType}/{toObjectId}
```

This removes every association type between the two records. Use with care.

#### Delete specific labels only

```
POST /crm/v4/associations/{fromObjectType}/{toObjectType}/batch/labels/archive
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
POST /crm/v4/associations/{fromObjectType}/{toObjectType}/batch/archive
```

```json
{
  "inputs": [
    { "from": { "id": "12345" }, "to": { "id": "67890" } }
  ]
}
```

---

### 7. Manage custom association labels (Schema API)

Custom labels allow portals to define named relationship types (e.g., "Primary Contact", "Decision Maker").

#### Create a custom label

```
POST /crm/v4/associations/{fromObjectType}/{toObjectType}/labels
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
GET /crm/v4/associations/{fromObjectType}/{toObjectType}/labels
```

Returns all HUBSPOT_DEFINED and USER_DEFINED label types with their IDs.

#### Delete a custom label

```
DELETE /crm/v4/associations/{fromObjectType}/{toObjectType}/labels/{associationTypeId}
```

---

### 8. Unlabeled associations

An unlabeled association uses a HUBSPOT_DEFINED typeId but carries no display label. These are the legacy v3 association types. They still work in v4:

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
  "https://api.hubapi.com/crm/v4/associations/contacts/companies/types" \
  | jq '[.results[] | {typeId: .typeId, label: .label, category: .category}]'

# Associate a contact to a company
curl -s -X PUT \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"associationCategory":"HUBSPOT_DEFINED","associationTypeId":279}]' \
  "https://api.hubapi.com/crm/v4/associations/contacts/$CONTACT_ID/to/companies/$COMPANY_ID"

# Read back the association
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm/v4/associations/contacts/$CONTACT_ID/to/companies" \
  | jq '.results'
```

---

## Failure modes

| Error | Cause | Fix |
|---|---|---|
| `400 ASSOCIATIONS_LIMIT_EXCEEDED` | Record has hit 250k associations of that type | Redesign the data model; remove stale associations |
| `400 INVALID_ASSOCIATION_TYPE` | `typeId` does not exist for this object pair | Fetch valid types from `/crm/v4/associations/{from}/{to}/types` |
| `403 FORBIDDEN` | Token missing object read/write scope | Add `crm.objects.{type}.read` + `crm.objects.{type}.write` scopes |
| `404 NOT_FOUND` | One or both object IDs do not exist or are archived | Verify record IDs; check `?archived=true` on the records endpoint |
| `409 CONFLICT` on label create | Label name already exists for this pair | GET existing labels; reuse the existing typeId |
| PUT wipes existing labels | PUT replaces the full type set | Read existing types first, then include them all in the PUT body |
| Batch read missing results | Object has more associations than the page limit | Paginate using `paging.next.after` per result |
| `ENGAGEMENT` or `EMAIL` object type rejected | Not supported in generic v4 associations | Use the Engagements API to attach engagements to CRM records |

---

## Escalation

- Associations v4 reference: https://developers.hubspot.com/docs/api/crm/associations
- Association Schema API (labels): https://developers.hubspot.com/docs/api/crm/association-schema
- For CRM record CRUD: see `hubspot-crm-objects` skill
- For custom object type definitions: see `hubspot-custom-objects` skill
- For auth and token setup: see `hubspot-private-apps` skill
