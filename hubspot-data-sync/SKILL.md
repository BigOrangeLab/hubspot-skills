---
name: hubspot-data-sync
description: "Sync data bidirectionally between HubSpot and external systems — field mapping, conflict resolution, deletion handling, and reliable incremental sync patterns"
compatibility: "HubSpot API v3/v4; Operations Hub Data Sync (native connectors); CRM Search API; Webhooks v3; Works with Private Apps and OAuth Public Apps"
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-06-09"
    written_against:
        hubspot-api: "v3 / v4"
---

## When to use

Use this skill when you need to keep HubSpot CRM data in sync with an external system — a database, data warehouse, ERP, customer support platform, or another CRM — and require:

- **Bidirectional or unidirectional field-level sync** between HubSpot and an external data source.
- **Conflict resolution** when both sides may update the same record concurrently.
- **Incremental sync** based on modification timestamps rather than full table scans.
- **Deletion / archival handling** — deciding what to do when a record is deleted on either side.
- **Custom field mapping and transformation** between HubSpot's property schema and an external schema.

This skill covers building a custom sync layer using HubSpot's REST APIs. For native out-of-the-box sync connectors (Salesforce, NetSuite, etc.) in Operations Hub, see the HubSpot App Marketplace — those are configured in the UI and are outside the scope of this skill.

**Do NOT use this skill for:**
- Bulk one-time migrations (use `hubspot-imports-exports`).
- Real-time event streaming without an incremental sync fallback (use `hubspot-webhooks`).

---

## Inputs required

| Input | Description | Where to find it |
|---|---|---|
| `accessToken` | Private App token or OAuth access token | HubSpot → Settings → Integrations → Private Apps |
| `portalId` | Hub ID of the target portal | Portal URL or `GET /oauth/v1/access-tokens/{token}` |
| `objectType` | CRM object type to sync: `contacts`, `companies`, `deals`, `tickets`, or custom object type ID | HubSpot CRM schema |
| `fieldMap` | Mapping of HubSpot property internal names → external system field names | Your schema documentation |
| `conflictStrategy` | Which side wins on concurrent update: `hubspot-wins`, `external-wins`, `last-write-wins`, or `manual` | Product decision |
| `deletionStrategy` | What to do when a record is deleted: `archive`, `hard-delete`, `mark-inactive`, or `ignore` | Product decision |
| `lastSyncTimestamp` | ISO 8601 or Unix ms timestamp of the last successful sync run | Your state store |

---

## Procedure

### 1. Choose a sync direction and architecture

Before writing code, decide:

| Question | Options |
|---|---|
| Direction | HubSpot → External, External → HubSpot, or Bidirectional |
| Trigger mechanism | Webhook-driven (real-time) + periodic catchup poll (recommended), or polling-only |
| State store | Where to persist `lastSyncTimestamp` and the ID cross-reference table |
| Conflict window | How long before a concurrent update is considered a conflict (e.g., records updated within 60 s of each other) |

The recommended architecture:
1. **Webhook listener** handles real-time property change and creation events.
2. **Hourly catchup poll** uses the Search API with `lastmodifieddate >= lastSyncTimestamp` to catch anything webhooks miss (bulk imports, automation-driven changes, etc.).
3. **Daily reconciliation** compares full record counts and spot-checks a sample of IDs to detect drift.

### 2. Build the ID cross-reference table

You need a persistent mapping between HubSpot record IDs and external system IDs. Store this in your database:

```sql
CREATE TABLE hs_id_map (
    hs_object_type   VARCHAR(64)  NOT NULL,
    hs_object_id     BIGINT       NOT NULL,
    external_id      VARCHAR(255) NOT NULL,
    created_at       TIMESTAMPTZ  DEFAULT NOW(),
    last_synced_at   TIMESTAMPTZ,
    sync_direction   VARCHAR(16),  -- 'hs_to_ext', 'ext_to_hs', 'bidirectional'
    PRIMARY KEY (hs_object_type, hs_object_id)
);
```

### 3. Define your field map

Map HubSpot property internal names to external fields. Store this as configuration, not hard-coded logic.

```js
const FIELD_MAP = {
  // HubSpot property name  : external field name
  'firstname':               'first_name',
  'lastname':                'last_name',
  'email':                   'email_address',
  'phone':                   'phone_number',
  'lifecyclestage':          'contact_stage',
  'hs_lead_status':          'lead_status',
  'company':                 'account_name',
  'jobtitle':                'title',
};

// Transform a HubSpot properties object to the external schema
function toExternalRecord(hsProperties) {
  const result = {};
  for (const [hsProp, extField] of Object.entries(FIELD_MAP)) {
    if (hsProp in hsProperties) {
      result[extField] = transformValue(hsProp, hsProperties[hsProp]);
    }
  }
  return result;
}

// Transform an external record to HubSpot properties
function toHubSpotProperties(externalRecord) {
  const invertedMap = Object.fromEntries(
    Object.entries(FIELD_MAP).map(([k, v]) => [v, k])
  );
  const result = {};
  for (const [extField, hsProp] of Object.entries(invertedMap)) {
    if (extField in externalRecord) {
      result[hsProp] = reverseTransformValue(extField, externalRecord[extField]);
    }
  }
  return result;
}
```

#### Value transformations

Common transforms to handle between systems:

```js
function transformValue(hsProp, value) {
  if (value === null || value === '' || value === undefined) return null;

  switch (hsProp) {
    // HubSpot dates are Unix ms strings; convert to ISO 8601
    case 'createdate':
    case 'lastmodifieddate':
    case 'closedate':
      return new Date(Number(value)).toISOString();

    // HubSpot enumeration values are strings; map to external codes
    case 'lifecyclestage':
      return LIFECYCLE_STAGE_MAP[value] ?? value;

    // Boolean stored as 'true'/'false' strings in HubSpot
    case 'hs_email_optout':
      return value === 'true';

    default:
      return value;
  }
}

const LIFECYCLE_STAGE_MAP = {
  'subscriber':  'SUBSCRIBER',
  'lead':        'LEAD',
  'marketingqualifiedlead': 'MQL',
  'salesqualifiedlead':     'SQL',
  'opportunity': 'OPPORTUNITY',
  'customer':    'CUSTOMER',
  'evangelist':  'EVANGELIST',
  'other':       'OTHER',
};
```

### 4. Implement incremental sync with the Search API

Pull records modified since the last sync timestamp:

```js
const hubspot = require('@hubspot/api-client');
const client = new hubspot.Client({ accessToken: process.env.HS_ACCESS_TOKEN });

async function incrementalSync(objectType, lastSyncMs, fieldMap) {
  const properties = Object.keys(fieldMap);
  let after;
  let totalSynced = 0;

  do {
    const response = await client.crm[objectType].searchApi.doSearch({
      filterGroups: [{
        filters: [{
          propertyName: 'lastmodifieddate',
          operator: 'GTE',
          value: String(lastSyncMs),
        }]
      }],
      properties: [...properties, 'hs_is_deleted'],
      sorts: ['lastmodifieddate'],
      limit: 100,
      after,
    });

    for (const record of response.results) {
      await upsertToExternalSystem(objectType, record, fieldMap);
      totalSynced++;
    }

    after = response.paging?.next?.after;
  } while (after);

  console.log(`Incremental sync complete: ${totalSynced} records processed`);
  return Date.now();  // return new lastSyncTimestamp
}
```

**Important:** Always use `lastmodifieddate` (not `createdate`) as your sync cursor — it updates on every property change, including association changes if you have `hs_object_source` enabled.

### 5. Implement conflict resolution

A conflict occurs when the same field has been updated on both sides since the last successful sync. Check your cross-reference table for the last sync time per record:

```js
async function upsertToExternalSystem(objectType, hsRecord, fieldMap) {
  const idMap = await db.getIdMap(objectType, hsRecord.id);

  if (!idMap) {
    // New record — push to external, save ID map
    const externalId = await externalApi.createRecord(toExternalRecord(hsRecord.properties));
    await db.saveIdMap(objectType, hsRecord.id, externalId);
    return;
  }

  const externalRecord = await externalApi.getRecord(idMap.external_id);

  if (hasConflict(hsRecord, externalRecord, idMap.last_synced_at)) {
    await resolveConflict(hsRecord, externalRecord, idMap);
  } else {
    await externalApi.updateRecord(idMap.external_id, toExternalRecord(hsRecord.properties));
  }

  await db.updateLastSynced(objectType, hsRecord.id);
}

function hasConflict(hsRecord, externalRecord, lastSyncedAt) {
  const hsUpdatedMs    = Number(hsRecord.properties.lastmodifieddate);
  const extUpdatedMs   = new Date(externalRecord.updated_at).getTime();
  const lastSyncedMs   = new Date(lastSyncedAt).getTime();
  // Conflict if BOTH sides have been updated since the last sync
  return hsUpdatedMs > lastSyncedMs && extUpdatedMs > lastSyncedMs;
}

async function resolveConflict(hsRecord, externalRecord, idMap) {
  switch (CONFLICT_STRATEGY) {
    case 'hubspot-wins':
      await externalApi.updateRecord(idMap.external_id, toExternalRecord(hsRecord.properties));
      break;

    case 'external-wins':
      await hubspotClient.crm.contacts.basicApi.update(hsRecord.id, {
        properties: toHubSpotProperties(externalRecord),
      });
      break;

    case 'last-write-wins': {
      const hsUpdatedMs  = Number(hsRecord.properties.lastmodifieddate);
      const extUpdatedMs = new Date(externalRecord.updated_at).getTime();
      if (hsUpdatedMs >= extUpdatedMs) {
        await externalApi.updateRecord(idMap.external_id, toExternalRecord(hsRecord.properties));
      } else {
        await hubspotClient.crm.contacts.basicApi.update(hsRecord.id, {
          properties: toHubSpotProperties(externalRecord),
        });
      }
      break;
    }

    case 'manual':
      await db.logConflict({ hsRecord, externalRecord, idMap });
      // Surface in a conflict resolution UI or Slack alert
      break;
  }
}
```

### 6. Handle deletions and archiving

HubSpot uses soft deletion (archiving). When a record is deleted via the UI or `DELETE /crm/v3/objects/{objectType}/{id}`, it is archived — not permanently removed.

**Detecting archived records:**

Archived records are excluded from Search API results by default. To detect deletions:

```js
// Option A: Webhook subscription — subscribe to contact.deletion events
// (see hubspot-webhooks skill)

// Option B: Periodic check — list archived records added since last sync
async function detectDeletions(objectType, lastSyncMs) {
  const response = await fetch(
    `https://api.hubapi.com/crm/v3/objects/${objectType}` +
    `?archived=true&limit=100&properties=lastmodifieddate`,
    { headers: { Authorization: `Bearer ${process.env.HS_ACCESS_TOKEN}` } }
  );
  const data = await response.json();

  for (const record of data.results) {
    const archivedMs = Number(record.properties.lastmodifieddate);
    if (archivedMs < lastSyncMs) continue;  // archived before our window

    await handleDeletion(objectType, record.id);
  }
}

async function handleDeletion(objectType, hsId) {
  const idMap = await db.getIdMap(objectType, hsId);
  if (!idMap) return;

  switch (DELETION_STRATEGY) {
    case 'archive':
      await externalApi.archiveRecord(idMap.external_id);
      break;
    case 'hard-delete':
      await externalApi.deleteRecord(idMap.external_id);
      break;
    case 'mark-inactive':
      await externalApi.updateRecord(idMap.external_id, { status: 'inactive' });
      break;
    case 'ignore':
      break;
  }

  await db.removeIdMap(objectType, hsId);
}
```

**Permanent deletion (GDPR):**

GDPR deletion permanently removes a contact and all associated data. Subscribe to `contact.privacyDeletion` webhooks to handle these. Unlike archiving, permanently deleted records cannot be retrieved — ensure your deletion logic removes or anonymizes the counterpart in the external system immediately.

### 7. Persist sync state between runs

Store at minimum:
- `lastSyncTimestamp` — updated at the end of each successful run
- `hs_id_map` table — maps HubSpot IDs to external IDs
- A `sync_errors` log — failed record sync attempts with the error message and payload for retry

Use optimistic locking or a distributed lock (e.g., Redis `SET NX`) to prevent concurrent sync runs from corrupting the `lastSyncTimestamp`.

```js
// Redis-based distributed lock (prevents concurrent sync runs)
async function runSyncWithLock(lockKey, ttlSeconds, syncFn) {
  const acquired = await redis.set(lockKey, '1', { NX: true, EX: ttlSeconds });
  if (!acquired) {
    console.log('Another sync is already running, skipping.');
    return;
  }
  try {
    await syncFn();
  } finally {
    await redis.del(lockKey);
  }
}
```

---

## Verification

After implementing, validate each layer:

1. **Field map round-trip** — transform a known HubSpot record to external format and back; confirm no data loss.

2. **New record sync** — create a contact in HubSpot; confirm it appears in the external system within the next sync cycle with correct field values.

3. **Update propagation** — change a property in HubSpot; confirm the external system reflects it within one sync cycle (or in real time if webhook-driven).

4. **Conflict test** — update the same field on both sides before the next sync; confirm your conflict strategy is applied correctly and no data is silently overwritten.

5. **Deletion test** — archive a record in HubSpot; confirm the external system reflects the correct deletion strategy.

6. **GDPR deletion test** (if applicable) — confirm `contact.privacyDeletion` events trigger full removal in the external system.

7. **Timestamp integrity** — verify `lastSyncTimestamp` advances only after a successful run and is not written on partial failure.

---

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Records drift over time despite sync running | `lastSyncTimestamp` written before all records processed | Write timestamp only after confirmed completion; add daily reconciliation |
| Duplicate records in external system | ID map not consulted before inserting | Check `hs_id_map` for existing mapping before creating new external records |
| HubSpot properties returning empty string instead of `null` | HubSpot represents cleared properties as `""` | Normalize `""` to `null` during transformation |
| Deleted HubSpot records still appearing in Search API results | Deleted records are excluded by default | Use `archived=true` parameter to fetch deleted records; subscribe to deletion webhooks |
| Sync loop — HubSpot update triggers external update which triggers HubSpot update | External system webhook triggers a HubSpot update that bounces back | Set a sync-source flag (`hs_last_sync_source`) on HubSpot records; skip updates where the source matches your integration |
| 429 rate limit errors during large sync runs | Exceeding HubSpot's 110 req/s for private apps | Add exponential backoff with jitter; use batch APIs (batch read/update) to reduce request count |
| `lastmodifieddate` not updating after automation-driven property change | Some workflow actions do not update `lastmodifieddate` | Supplement with webhook subscriptions for specific property changes |
| Concurrent sync runs overwriting each other's `lastSyncTimestamp` | No distributed lock | Implement Redis `SET NX` lock or DB-level advisory lock |
| GDPR deletion data not removed from external system | No `contact.privacyDeletion` webhook subscription | Add explicit subscription and handler for `contact.privacyDeletion` |
| Enum mismatch — values that exist in HubSpot not mapped in external system | Incomplete `LIFECYCLE_STAGE_MAP` or similar | Add a fallback that passes the raw HubSpot value and logs an unmapped-value warning |

---

## Escalation

Escalate to a human when:

- **Reconciliation reveals persistent drift** of >1% of records after multiple sync cycles — indicates a systematic issue with the conflict strategy or ID map.
- **GDPR deletion gaps** — if any uncertainty exists about whether privacy deletion events are being fully propagated to the external system, pause the sync and escalate immediately.
- **Schema changes** — when HubSpot property types change (e.g., a text field becomes an enumeration), field mapping will silently produce bad data; requires schema migration.
- **Operations Hub native connector available** — if HubSpot offers a first-party connector for the external system (Salesforce, NetSuite, etc.), evaluate whether it meets your needs before maintaining a custom sync.

See also:
- `hubspot-webhooks` — for real-time event delivery to drive the incremental sync trigger
- `hubspot-imports-exports` — for bulk one-time migrations and CSV import/export
- `hubspot-crm-objects` — for CRM CRUD, batch ops, search, and pagination patterns
- `hubspot-private-apps` — for obtaining and managing the access token
