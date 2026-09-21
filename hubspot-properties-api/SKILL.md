---
name: hubspot-properties-api
description: "Manage HubSpot CRM properties via the Properties API — all property types, field types, property groups, internal vs. label names, unique identifiers, decimal support, and CRUD patterns for standard and custom object properties"
compatibility: "All Hub tiers; CRM Properties API 2026-09. Property validation rules are enforced on all write paths from 2026-09."
license: MIT
metadata:
    author: georgestephanis
    version: "1.1"
    written: "2026-09-21"
    written_against:
        hubspot-api: "2026-09"
---

## When to use

- Adding a new property to any CRM object (contacts, companies, deals, tickets, or custom objects)
- Updating a property's label, options, or display order
- Creating property groups to organize related fields in the CRM UI
- Looking up internal property names when building filters, API calls, or imports
- Enabling a unique identifier property for upsert operations
- Using the 2026 decimal support for number fields (`unformattedNumber` display hint)

Do NOT use this skill for bulk data operations — that is covered in `hubspot-crm-objects`. For custom object schema creation (including the initial property list), see `hubspot-custom-objects`.

---

## Inputs required

- Account service key with `crm.schemas.{objectType}.read` and `crm.schemas.{objectType}.write` scopes
- `objectType` string: `contacts`, `companies`, `deals`, `tickets`, `leads`, `products`, `line_items`, `quotes`, `calls`, `emails`, `meetings`, `notes`, `tasks`, or numeric `objectTypeId` for custom objects (e.g., `2-12345678`)

---

## Procedure

### 1. Property types reference

| `type` | `fieldType` options | API value format | Notes |
|---|---|---|---|
| `string` | `text`, `textarea`, `html`, `file`, `phonenumber` | JSON string | `text` = single-line; `textarea` = multi-line |
| `number` | `number` | JSON string of a numeric value | Integer or decimal; see Step 4 for decimal |
| `date` | `date` | `"YYYY-MM-DD"` | Date only, no time component |
| `datetime` | `date` | Unix ms timestamp as string | Date + time |
| `enumeration` | `select`, `radio`, `checkbox`, `booleancheckbox` | Option `value` string | `checkbox` = multi-select (semicolon-separated in API) |
| `bool` | `booleancheckbox` | `"true"` or `"false"` | |
| `phone_number` | `phonenumber` | E.164 string (e.g., `"+15555550100"`) | Validated on write |

---

### 2. Create a property

```
POST /crm/properties/2026-09/{objectType}
```

#### String / text property

```json
{
  "name": "product_sku",
  "label": "Product SKU",
  "type": "string",
  "fieldType": "text",
  "groupName": "dealinformation",
  "description": "Internal product SKU for this deal"
}
```

#### Enumeration / select property

```json
{
  "name": "deal_region",
  "label": "Deal Region",
  "type": "enumeration",
  "fieldType": "select",
  "groupName": "dealinformation",
  "options": [
    { "label": "North America", "value": "north_america", "displayOrder": 0, "hidden": false },
    { "label": "EMEA",          "value": "emea",          "displayOrder": 1, "hidden": false },
    { "label": "APAC",          "value": "apac",          "displayOrder": 2, "hidden": false }
  ]
}
```

#### Multi-select (checkbox) property

```json
{
  "name": "interested_products",
  "label": "Interested Products",
  "type": "enumeration",
  "fieldType": "checkbox",
  "groupName": "contactinformation",
  "options": [
    { "label": "Widget A", "value": "widget_a", "displayOrder": 0, "hidden": false },
    { "label": "Widget B", "value": "widget_b", "displayOrder": 1, "hidden": false }
  ]
}
```

Multi-select values are stored and returned as a semicolon-separated string: `"widget_a;widget_b"`.

#### Date property

```json
{
  "name": "contract_start_date",
  "label": "Contract Start Date",
  "type": "date",
  "fieldType": "date",
  "groupName": "dealinformation"
}
```

#### Number property

```json
{
  "name": "employee_count",
  "label": "Employee Count",
  "type": "number",
  "fieldType": "number",
  "groupName": "companyinformation"
}
```

---

### 3. Internal name vs. label

- **Internal name** (`name`) — the snake_case identifier used in API calls, filters, imports, and HubL. Set on creation and **cannot be changed**.
- **Label** (`label`) — the display name shown in the CRM UI. Can be updated at any time.

When designing properties:

- Use lowercase snake_case for `name` (e.g., `monthly_recurring_revenue`).
- Keep names concise but unambiguous; they cannot be renamed later.
- HubSpot prepends nothing to custom property names — they appear as-is in the API.
- Built-in properties often use an `hs_` prefix (e.g., `hs_lead_status`, `hs_deal_stage_probability`).

To look up all properties for an object type:

```bash
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm/properties/2026-09/contacts" \
  | jq '[.results[] | {name: .name, label: .label, type: .type, fieldType: .fieldType}]'
```

---

### 4. Decimal support for number fields (2026)

As of 2026, HubSpot supports decimal/float values in `number` properties. To enable decimal display formatting, set `numberDisplayHint`:

```json
{
  "name": "commission_rate",
  "label": "Commission Rate (%)",
  "type": "number",
  "fieldType": "number",
  "groupName": "dealinformation",
  "numberDisplayHint": "percentage"
}
```

Available `numberDisplayHint` values:

| Value | Display example |
|---|---|
| `unformattedNumber` | `1234.56` (raw decimal, no formatting) |
| `formattedNumber` | `1,234.56` (locale-formatted) |
| `currency` | `$1,234.56` (portal currency) |
| `percentage` | `12.5%` |
| `duration` | `2h 3m` (stored as seconds) |

For unambiguous decimal storage without any display formatting, use `unformattedNumber`:

```json
{ "numberDisplayHint": "unformattedNumber" }
```

Number property values are stored and returned as strings in the API (e.g., `"99.5"`), not as JSON numbers.

---

### 5. Unique identifier properties

Marking a property as a unique identifier enables:
- Looking up records by that property in GET/batch-read using `?idProperty=name`
- Upsert (create-or-update) via `batch/upsert` with `"idProperty": "name"`

```json
{
  "name": "external_account_id",
  "label": "External Account ID",
  "type": "string",
  "fieldType": "text",
  "groupName": "companyinformation",
  "hasUniqueValue": true
}
```

Rules:
- Each object can have at most **one** custom unique identifier property per object type (contacts have `email` built-in).
- The property value must be unique across all records of that type. Attempting to write a duplicate value returns `409 CONFLICT`.
- You cannot change `hasUniqueValue` after creation. Delete and recreate the property to change it.

---

### 6. Property groups

Property groups organize related properties in the CRM UI and in API responses.

#### Create a property group

```
POST /crm/properties/2026-09/{objectType}/groups
```

```json
{
  "name": "subscription_details",
  "label": "Subscription Details",
  "displayOrder": 5
}
```

#### List all property groups

```
GET /crm/properties/2026-09/{objectType}/groups
```

#### Common built-in group names

| objectType | Common groups |
|---|---|
| `contacts` | `contactinformation`, `conversioninformation`, `emailinformation`, `socialmediainformation` |
| `companies` | `companyinformation`, `companyactivity` |
| `deals` | `dealinformation` |
| `tickets` | `ticketinformation` |

When creating a property, always specify `groupName`. If you omit it, HubSpot may assign a default group, making it harder to organize later.

---

### 7. Update a property

```
PATCH /crm/properties/2026-09/{objectType}/{propertyName}
```

You can update: `label`, `description`, `options` (for enumerations), `displayOrder`, `hidden`, `formField`.

You **cannot** change: `name`, `type`, `fieldType`, `hasUniqueValue`.

```json
{
  "label": "Updated Label",
  "description": "Updated description",
  "options": [
    { "label": "New Option", "value": "new_option", "displayOrder": 3, "hidden": false }
  ]
}
```

To hide an enum option from the UI without deleting it:

```json
{ "options": [{ "label": "Legacy", "value": "legacy", "displayOrder": 99, "hidden": true }] }
```

---

### 8. Archive a property

```
DELETE /crm/properties/2026-09/{objectType}/{propertyName}
```

Returns `204 No Content`. Archived properties are hidden from the UI but their data is preserved on existing records. The property name cannot be reused.

---

### 9. Read a single property

```bash
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm/properties/2026-09/contacts/lifecyclestage" \
  | jq '{name: .name, label: .label, type: .type, options: [.options[]?.value]}'
```

---

## Verification

```bash
# List all custom properties on contacts
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm/properties/2026-09/contacts?dataSensitivity=non_sensitive" \
  | jq '[.results[] | select(.hubspotDefined == false) | {name: .name, label: .label, type: .type}]'

# Create a test property
curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"test_skill_prop","label":"Test Skill Prop","type":"string","fieldType":"text","groupName":"contactinformation"}' \
  "https://api.hubapi.com/crm/properties/2026-09/contacts" \
  | jq '{name: .name, label: .label}'

# Archive it
curl -s -X DELETE \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm/properties/2026-09/contacts/test_skill_prop"
echo "Archived (expect no output)"
```

---

## Failure modes

| Error | Cause | Fix |
|---|---|---|
| `400 INVALID_NAME` | Property name contains uppercase, spaces, or starts with a number | Use lowercase snake_case; start with a letter |
| `400 DUPLICATE_VALUE` on unique property | Another record already has that value | Fetch the existing record using `?idProperty=name` before writing |
| `403 FORBIDDEN` on create | Token missing `crm.schemas.{type}.write` scope | Add the write schema scope to your service key |
| `404 NOT_FOUND` on PATCH | Property name typo or wrong objectType | List properties to confirm name and type |
| `409 CONFLICT` — property name taken | Name is used by an archived property | Use a different name (archived names cannot be reused) |
| Enum option not appearing in UI | `hidden: true` on the option | PATCH the property with `"hidden": false` for that option |
| Number value rejected | Storing a JavaScript `number` instead of a string | All property values in the API must be strings: `"99.5"`, not `99.5` |
| Multi-select value partially saved | Sending array instead of semicolon-separated string | Join values: `"widget_a;widget_b"` |
| Cannot change `hasUniqueValue` | Immutable after creation | Archive the property and recreate with correct flag; migrate data |
| `422 VALIDATION_ERROR` on enum create | `options` array has no items | Provide at least one option for any enumeration property |

---

## Escalation

- Properties API reference: https://developers.hubspot.com/docs/guides/api/crm/properties
- Property groups: https://developers.hubspot.com/docs/guides/api/crm/properties#property-groups
- For creating custom object schemas: see `hubspot-custom-objects` skill
- For reading/writing property values on records: see `hubspot-crm-objects` skill
- For importing data using property names: see `hubspot-imports-exports` skill
