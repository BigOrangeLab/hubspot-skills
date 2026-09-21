---
name: hubspot-contact-sync
description: "DEPRECATED — superseded by hubspot-crm-objects, hubspot-data-sync, and hubspot-imports-exports. Kept only for links from older material."
compatibility: "Deprecated 2026-09-21. Content is contacts-only and predates date-based API versioning."
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-09-21"
    deprecated: true
    written_against:
        hubspot-api: "v3"
---

> **Deprecated.** This skill covers a narrow slice of what three other skills now
> do better:
>
> - CRUD, batch, search and upsert on any object — `hubspot-crm-objects`
> - Bidirectional sync, conflict resolution, incremental strategy — `hubspot-data-sync`
> - Bulk file-based import/export — `hubspot-imports-exports`
>
> Nothing here is contacts-specific enough to justify a separate skill. Use those
> instead; this file will be removed in a later pass.

# HubSpot Contact Sync

Sync contacts between HubSpot and an external data source using the HubSpot CRM Contacts API v3. Covers single-contact upsert, batch operations, and deduplication by email.

## When to use

- Importing a CSV or database table of contacts into HubSpot
- Exporting HubSpot contacts to an external CRM, data warehouse, or mailing list
- Keeping a third-party system in sync with HubSpot on a recurring schedule
- Deduplicating contacts by email address before or after an import

Do NOT use for contacts owned by a HubSpot association (e.g., Deals, Companies) — those require the Associations API in addition to this workflow.

## Inputs required

Before starting, confirm:

- **Private App access token** — created in HubSpot Settings → Integrations → Private Apps. Must have `crm.objects.contacts.read` and `crm.objects.contacts.write` scopes.
- **Source data** — CSV, JSON, or database query result with at minimum an `email` column (used as the dedup key).
- **Field mapping** — a mapping from source columns to HubSpot property names (e.g., `first_name` → `firstname`, `last_name` → `lastname`).
- **Direction** — import (source → HubSpot), export (HubSpot → source), or bidirectional.

## Procedure

### 1. Authenticate

All requests use Bearer auth:

```bash
curl -H "Authorization: Bearer $HUBSPOT_TOKEN" \
     https://api.hubapi.com/crm/objects/2026-09/contacts?limit=1
```

Confirm you get a `200` with a `results` array before proceeding.

### 2. Map properties

List available contact properties to confirm your target field names exist:

```bash
curl -H "Authorization: Bearer $HUBSPOT_TOKEN" \
     https://api.hubapi.com/crm/properties/2026-09/contacts \
  | jq '.results[] | {name, label, type}'
```

Create any missing custom properties via the Properties API before importing.

### 3. Upsert contacts (batch)

Use the batch upsert endpoint to create-or-update up to 100 contacts at once, deduplicating on `email`:

```bash
curl -X POST \
  -H "Authorization: Bearer $HUBSPOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": [
      {
        "properties": {
          "email": "alice@example.com",
          "firstname": "Alice",
          "lastname": "Example"
        }
      }
    ]
  }' \
  https://api.hubapi.com/crm/objects/2026-09/contacts/batch/upsert
```

- `idProperty` defaults to `hs_object_id`; pass `"idProperty": "email"` to dedup by email.
- Max 100 inputs per request; loop with offset for larger datasets.
- A `207 Multi-Status` response means some records succeeded and some failed — inspect `results` and `errors` separately.

### 4. Export contacts

To pull all contacts (paginated):

```bash
curl -H "Authorization: Bearer $HUBSPOT_TOKEN" \
     "https://api.hubapi.com/crm/objects/2026-09/contacts?limit=100&properties=email,firstname,lastname&after=$CURSOR"
```

Store the `paging.next.after` cursor and loop until `paging` is absent.

### 5. Verify counts

After import, compare the expected row count against HubSpot's total:

```bash
curl -H "Authorization: Bearer $HUBSPOT_TOKEN" \
     "https://api.hubapi.com/crm/objects/2026-09/contacts?limit=1" \
  | jq '.total'
```

## Verification

- [ ] Authentication returns `200` with contact data.
- [ ] Batch upsert returns `200` or `207`; no unexpected errors in the `errors` array.
- [ ] Spot-check 3–5 contacts in the HubSpot UI to confirm field values landed correctly.
- [ ] Record counts match (within expected dedup collisions).

## Failure modes

| Error | Likely cause | Fix |
|---|---|---|
| `401 Unauthorized` | Token missing or wrong scopes | Re-create Private App token with correct scopes |
| `429 Too Many Requests` | Burst rate limit (100 req/10s on Free; higher on paid) | Add exponential backoff; batch larger payloads |
| `400 PROPERTY_DOESNT_EXIST` | Target property name typo or doesn't exist | Run the properties list (step 2) and create missing props |
| `207` with partial errors | Some records failed validation | Inspect `errors[].message` per record; fix and retry failed subset |
| Duplicate contacts created | `idProperty` not set to `email` in upsert | Add `"idProperty": "email"` to the request body |

## Escalation

- If deduplication logic is more complex than email-only (e.g., phone + company), involve the HubSpot Deduplicate API or a manual merge workflow.
- For scheduled syncs, consider using HubSpot Workflows or a dedicated integration platform (Zapier, Make, n8n) rather than a hand-rolled cron job.
- Rate limits above Free tier are documented at https://developers.hubspot.com/docs/api/usage-details.
