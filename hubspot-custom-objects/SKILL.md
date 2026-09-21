---
name: hubspot-custom-objects
description: "Create and manage custom CRM object types in HubSpot — Schemas API for type/property/display-property definition, CRUD for custom object records, p_* wildcard in UI extensions, and Object Definition Pages for schema introspection"
compatibility: "Operations Hub Professional or Enterprise required for custom objects; CRM API 2026-09 + Schemas API 2026-09"
license: MIT
metadata:
    author: georgestephanis
    version: "1.1"
    written: "2026-09-21"
    written_against:
        hubspot-api: "2026-09"
---

## When to use

- Modeling a domain entity not covered by standard CRM objects (e.g., Properties, Subscriptions, Events, Assets)
- Defining a custom object type with its own properties, required fields, and primary display name
- Creating, reading, updating, or archiving records of a custom object type
- Referencing custom object properties dynamically via the `p_*` wildcard in UI extensions
- Introspecting object schemas programmatically or via Object Definition Pages in the portal UI

**Not needed for:**
- Standard objects (contacts, companies, deals, tickets) — use `hubspot-crm-objects`
- Adding properties to standard objects — use `hubspot-properties-api`

**Tier requirement:** Custom object types require **Operations Hub Professional or Enterprise** (or equivalent legacy Marketing/Sales tiers that included custom objects). Creating schema types on Free/Starter portals returns `403`.

---

## Inputs required

- Account service key with `crm.schemas.custom.read`, `crm.schemas.custom.write`, and `crm.objects.custom.read`, `crm.objects.custom.write` scopes
- Object type name (singular and plural, e.g., "Subscription" / "Subscriptions")
- List of properties with their types, field types, and any validation rules
- `primaryDisplayProperty` — the property whose value appears as the record name in the CRM UI

---

## Procedure

### 1. Create a custom object schema

```
POST /crm-object-schemas/2026-09/schemas
```

```json
{
  "name": "subscriptions",
  "labels": {
    "singular": "Subscription",
    "plural": "Subscriptions"
  },
  "primaryDisplayProperty": "plan_name",
  "requiredProperties": ["plan_name", "status"],
  "searchableProperties": ["plan_name", "external_id"],
  "properties": [
    {
      "name": "plan_name",
      "label": "Plan Name",
      "type": "string",
      "fieldType": "text"
    },
    {
      "name": "status",
      "label": "Status",
      "type": "enumeration",
      "fieldType": "select",
      "options": [
        { "label": "Active",   "value": "active",   "displayOrder": 0, "hidden": false },
        { "label": "Paused",   "value": "paused",   "displayOrder": 1, "hidden": false },
        { "label": "Canceled", "value": "canceled", "displayOrder": 2, "hidden": false }
      ]
    },
    {
      "name": "external_id",
      "label": "External ID",
      "type": "string",
      "fieldType": "text",
      "hasUniqueValue": true
    },
    {
      "name": "mrr",
      "label": "Monthly Recurring Revenue",
      "type": "number",
      "fieldType": "number"
    },
    {
      "name": "renewal_date",
      "label": "Renewal Date",
      "type": "date",
      "fieldType": "date"
    }
  ],
  "associatedObjects": ["CONTACT", "COMPANY", "DEAL"]
}
```

Response (`201 Created`) includes:

```json
{
  "objectTypeId": "2-12345678",
  "name": "subscriptions",
  "labels": { "singular": "Subscription", "plural": "Subscriptions" },
  "primaryDisplayProperty": "plan_name",
  "fullyQualifiedName": "p12345678_subscriptions"
}
```

Save `objectTypeId` (e.g., `2-12345678`) — this is the identifier used in all subsequent API calls.

---

### 2. Property types and field types

| `type` | `fieldType` options | Notes |
|---|---|---|
| `string` | `text`, `textarea`, `html`, `file`, `phonenumber` | `text` is single-line; `textarea` is multi-line |
| `number` | `number` | Integer or decimal; use `numberDisplayHint` for currency/percent formatting |
| `date` | `date` | Date only (no time); ISO 8601 string in API (`YYYY-MM-DD`) |
| `datetime` | `date` | Date + time; Unix ms timestamp in API |
| `enumeration` | `select`, `radio`, `checkbox`, `booleancheckbox` | `checkbox` = multi-select; requires `options` array |
| `bool` | `booleancheckbox` | true/false |
| `phone_number` | `phonenumber` | Stored in E.164 format |

**Property validation rules (2026):**

```json
{
  "name": "contract_value",
  "label": "Contract Value",
  "type": "number",
  "fieldType": "number",
  "validationRules": [
    { "name": "GT", "value": "0" }
  ]
}
```

Supported validation rule names: `GT`, `GTE`, `LT`, `LTE`, `BETWEEN`, `REGEX`, `MAX_LENGTH`.

**Unique identifier properties:**

```json
{
  "name": "external_id",
  "label": "External ID",
  "type": "string",
  "fieldType": "text",
  "hasUniqueValue": true
}
```

Only one property per object type can have `hasUniqueValue: true` (beyond `hs_object_id`). Use it to enable `idProperty`-based lookups and upserts.

---

### 3. Add a property to an existing schema

```
POST /crm/properties/2026-09/{objectTypeId}
```

```json
{
  "name": "billing_cycle",
  "label": "Billing Cycle",
  "type": "enumeration",
  "fieldType": "select",
  "groupName": "subscriptioninformation",
  "options": [
    { "label": "Monthly", "value": "monthly", "displayOrder": 0, "hidden": false },
    { "label": "Annual",  "value": "annual",  "displayOrder": 1, "hidden": false }
  ]
}
```

> The Properties API endpoint uses the numeric `objectTypeId` (e.g., `2-12345678`), not the name. See `hubspot-properties-api` for full property management.

---

### 4. Read the schema

```bash
# Get a specific schema by objectType (name or objectTypeId)
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm-object-schemas/2026-09/schemas/2-12345678" \
  | jq '{objectTypeId: .objectTypeId, name: .name, properties: [.properties[].name]}'

# List all custom schemas in the portal
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm-object-schemas/2026-09/schemas" \
  | jq '[.results[] | {objectTypeId: .objectTypeId, name: .name}]'
```

---

### 5. Update the schema (labels, primaryDisplayProperty, searchableProperties)

```
PATCH /crm-object-schemas/2026-09/schemas/{objectTypeId}
```

```json
{
  "labels": {
    "singular": "Subscription Plan",
    "plural": "Subscription Plans"
  },
  "primaryDisplayProperty": "plan_name",
  "requiredProperties": ["plan_name", "status", "external_id"],
  "searchableProperties": ["plan_name", "external_id", "mrr"]
}
```

---

### 6. CRUD for custom object records

Custom object records use the same CRM v3 pattern as standard objects. Substitute the `objectTypeId` for `objectType`:

```bash
# Create a record
curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "plan_name": "Growth Annual",
      "status": "active",
      "external_id": "sub_abc123",
      "mrr": 999
    }
  }' \
  "https://api.hubapi.com/crm/objects/2026-09/2-12345678"

# Get by ID
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm/objects/2026-09/2-12345678/98765?properties=plan_name,status,mrr"

# Upsert by external_id
curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idProperty": "external_id",
    "inputs": [
      {
        "id": "sub_abc123",
        "properties": { "status": "paused", "mrr": 0 }
      }
    ]
  }' \
  "https://api.hubapi.com/crm/objects/2026-09/2-12345678/batch/upsert"
```

All batch operations, Search API, associations, and merge patterns from `hubspot-crm-objects` work identically with custom object `objectTypeId`.

---

### 7. p_* wildcard in UI extensions

When building a React UI extension (CRM card), you can reference all custom object properties dynamically using the `p_*` wildcard in the `hsmeta.json` properties config:

```json
{
  "type": "crm-card",
  "data": {
    "fetch": {
      "targetFunction": "main",
      "objectTypes": [
        {
          "name": "subscriptions",
          "propertyNames": ["p_*"]
        }
      ]
    }
  }
}
```

`p_*` expands to every property on the object. Standard metadata properties (`hs_object_id`, `hs_createdate`, etc.) are not included — request them explicitly if needed.

In the card's React component, the properties arrive in `context.crm.objectProperties`:

```jsx
export const onCrmPropertyPrefixChange = ({ properties }) => {
  // properties includes all p_* prefixed custom object properties
  const planName = properties.plan_name;
  const status   = properties.status;
};
```

---

### 8. Object Definition Pages (Beta)

HubSpot portals with Operations Hub Pro+ have an **Object Definition Pages** UI at:

```
https://app.hubspot.com/object-definitions/{portalId}
```

This provides a visual schema editor where you can:
- View all custom and standard object schemas
- Add/edit/delete properties
- Set required properties, display names, and searchable properties
- Preview the object's CRM record view layout

This is equivalent to the Schemas API but requires no code. For automation or CI/CD pipelines, the Schemas API (Steps 1–5) is preferred.

---

### 9. Archive (soft delete) and purge a schema

Archiving a schema prevents new record creation but preserves existing records.

```bash
# Archive (disable) the schema
curl -s -X DELETE \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm-object-schemas/2026-09/schemas/2-12345678"
```

Permanently purge (irreversible — deletes all records):

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm-object-schemas/2026-09/schemas/2-12345678?archived=true"
```

---

## Verification

```bash
# Confirm schema was created and properties are correct
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm-object-schemas/2026-09/schemas/subscriptions" \
  | jq '{
      objectTypeId: .objectTypeId,
      primaryDisplayProperty: .primaryDisplayProperty,
      required: .requiredProperties,
      properties: [.properties[] | {name: .name, type: .type}]
    }'

# Create a test record and read it back
RECORD_ID=$(curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"properties":{"plan_name":"Test","status":"active","external_id":"test-001"}}' \
  "https://api.hubapi.com/crm/objects/2026-09/2-12345678" \
  | jq -r '.id')

curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm/objects/2026-09/2-12345678/$RECORD_ID?properties=plan_name,status" \
  | jq .properties
```

---

## Failure modes

| Error | Cause | Fix |
|---|---|---|
| `403 FORBIDDEN` on schema create | Portal doesn't have Operations Hub Pro+ | Upgrade tier or use a sandbox with the right tier |
| `409 CONFLICT` on schema create | Object type with that `name` already exists | GET `/crm-object-schemas/2026-09/schemas` to find the existing `objectTypeId` |
| `422 VALIDATION_ERROR` on property | Invalid `type`/`fieldType` combination | Check the property types table in Step 2 |
| `422` on enumeration property | Missing `options` array | Enumeration and boolean fields require at least one option |
| Property missing from search results | Property not in `searchableProperties` | PATCH the schema to add the property name |
| Record create fails with required property error | `requiredProperties` not all provided | Include all required properties in the `properties` object |
| `hasUniqueValue` upsert creates duplicates | Wrong `idProperty` or property not unique | Confirm `hasUniqueValue: true` is set on that property in the schema |
| `p_*` wildcard returns no properties | Object type name mismatch in hsmeta.json | Use the schema `name` field (lowercase), not `fullyQualifiedName` |
| Purge fails | Archived flag not set | Add `?archived=true` query parameter to the DELETE request |

---

## Escalation

- Custom Objects Schemas API: https://developers.hubspot.com/docs/api/crm/crm-custom-objects
- Object Definition Pages: https://knowledge.hubspot.com/object-settings/create-custom-objects
- For CRM record CRUD operations: see `hubspot-crm-objects` skill
- For adding/modifying properties: see `hubspot-properties-api` skill
- For associations to/from custom objects: see `hubspot-associations` skill
- For UI extension p_* usage: see `hubspot-ui-extensions` skill
