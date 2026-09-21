---
name: hubspot-imports-exports
description: "Bulk import and export CRM data via HubSpot's Imports and Exports APIs — file upload, column mapping, async job polling, deduplication, and reconciliation after import"
compatibility: "HubSpot API 2026-09; Imports API /crm/imports/2026-09/; Exports API /crm/exports/2026-09/; requires a service key or OAuth access token with crm.objects.*.write and crm.export scopes"
license: MIT
metadata:
    author: georgestephanis
    version: "1.1"
    written: "2026-09-21"
    written_against:
        hubspot-api: "2026-09"
---

## When to use

Use this skill for **bulk, one-time or scheduled batch operations** on CRM data:

- Migrating a large contact, company, or deal list into HubSpot from a CSV or external database dump.
- Performing a full data refresh — overwriting a large set of properties in one shot.
- Exporting CRM data to a data warehouse, BI tool, or backup archive.
- Seeding a new HubSpot portal with records from another system.
- Running periodic full-export reconciliation scans against an external system.

**Do NOT use this skill for:**
- Real-time or near-real-time record creation/update — use the CRM Objects API (`hubspot-crm-objects`) for that.
- Keeping two systems continuously in sync — use `hubspot-data-sync`.
- Records that must trigger HubSpot workflows or webhooks on create — bulk imports do NOT fire webhooks or trigger enrollment in active workflows.

---

## Inputs required

### For imports

| Input | Description | Notes |
|---|---|---|
| `accessToken` | Account service key or OAuth access token | Needs `crm.objects.contacts.write` (or equivalent) scope |
| `importFile` | CSV or spreadsheet file with records to import | UTF-8, max 512 MB, max 1,048,576 rows |
| `importName` | Human-readable label for the import job | Shown in HubSpot import history |
| `objectType` | CRM object to import into: `CONTACT`, `COMPANY`, `DEAL`, `TICKET`, or custom object type ID | |
| `columnMappings` | Array mapping CSV column names → HubSpot property internal names | See Step 2 |
| `dedupeField` | Which HubSpot property to use as the unique key for upsert | `email` for contacts; `domain` for companies |

### For exports

| Input | Description | Notes |
|---|---|---|
| `accessToken` | Account service key or OAuth access token | Needs `crm.export` scope |
| `objectType` | CRM object type to export | |
| `exportFormat` | `CSV` or `XLSX` | |
| `propertiesToExport` | Array of HubSpot property internal names | Optional; defaults to all properties |
| `filters` | Optional filter criteria to limit the export | Uses the same filter structure as the Search API |

---

## Procedure

### Imports

#### 1. Prepare your CSV file

HubSpot's Imports API expects a well-formed CSV:

- **Encoding:** UTF-8 (with or without BOM).
- **Header row:** Required. Column names are arbitrary — you'll map them to HubSpot properties in Step 2.
- **Date fields:** Use `MM/DD/YYYY` format or Unix timestamps in milliseconds.
- **Boolean fields:** Use `true` / `false` (case-insensitive) or `yes` / `no`.
- **Enumeration fields:** Use the internal name of the enumeration option (not the display label).
- **Phone numbers:** Include the country code (e.g., `+1 415-555-0100`).
- **Empty cells:** Treated as "do not update this property." To explicitly clear a property value, use `[HS_NULL]`.

Example CSV (`contacts.csv`):

```csv
First Name,Last Name,Email,Phone,Lifecycle Stage
Alice,Smith,alice@example.com,+14155550100,customer
Bob,Jones,bob@example.com,,lead
```

#### 2. Build the column mapping

Each column in the CSV requires a mapping object. The `columnObjectTypeId` must be the HubSpot object type ID:

| Object | `columnObjectTypeId` |
|---|---|
| Contact | `0-1` |
| Company | `0-2` |
| Deal | `0-3` |
| Ticket | `0-5` |
| Custom object | `2-{schemaId}` (retrieve from schema API) |

```js
const columnMappings = [
  {
    columnName:           'First Name',       // matches CSV header exactly
    propertyName:         'firstname',        // HubSpot internal property name
    columnObjectTypeId:   '0-1',              // contact
  },
  {
    columnName:           'Last Name',
    propertyName:         'lastname',
    columnObjectTypeId:   '0-1',
  },
  {
    columnName:           'Email',
    propertyName:         'email',
    columnObjectTypeId:   '0-1',
    idColumnType:         'CONTACT_ID',       // marks this as the dedup key
  },
  {
    columnName:           'Phone',
    propertyName:         'phone',
    columnObjectTypeId:   '0-1',
  },
  {
    columnName:           'Lifecycle Stage',
    propertyName:         'lifecyclestage',
    columnObjectTypeId:   '0-1',
  },
];
```

**Deduplication key (`idColumnType`):**

Set `idColumnType` on the column you want HubSpot to use to match existing records:

| `idColumnType` | Match key |
|---|---|
| `CONTACT_ID` | HubSpot contact ID |
| `EMAIL` | Email address (contacts only) |
| `HS_OBJECT_ID` | Any object's HubSpot ID |
| `EXTERNAL_OBJECT_ID` | A custom unique identifier property |

When a match is found, HubSpot updates the existing record. When no match is found, HubSpot creates a new record. This is an upsert — not a pure insert.

#### 3. Upload the import file

The Imports API uses a `multipart/form-data` request. The `importRequest` part is a JSON object serialized as a string:

```js
const FormData = require('form-data');
const fs       = require('fs');
const fetch    = require('node-fetch');

async function startImport(filePath, importName, columnMappings) {
  const importRequest = {
    name: importName,
    files: [{
      fileName:      'contacts.csv',
      fileFormat:    'CSV',
      fileImportPage: {
        hasHeader:     true,
        columnMappings,
      },
    }],
  };

  const form = new FormData();
  form.append('importRequest', JSON.stringify(importRequest), {
    contentType: 'application/json',
  });
  form.append('files', fs.createReadStream(filePath), {
    filename:    'contacts.csv',
    contentType: 'text/csv',
  });

  const response = await fetch('https://api.hubapi.com/crm/imports/2026-09/', {
    method:  'POST',
    headers: {
      Authorization: `Bearer ${process.env.HS_ACCESS_TOKEN}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Import failed: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  console.log(`Import started. Job ID: ${data.id}, Status: ${data.state}`);
  return data.id;
}
```

#### 4. Poll for import completion

Imports are asynchronous. Poll `/crm/imports/2026-09/{importId}` until `state` is terminal:

| `state` | Meaning |
|---|---|
| `STARTED` | Job accepted and queued |
| `PROCESSING` | Actively importing rows |
| `DONE` | Import completed successfully |
| `FAILED` | Import failed entirely |
| `CANCELED` | Import was cancelled |
| `DEFERRED` | Waiting for a pre-requisite |
| `REVERTED` | Import was rolled back |

```js
async function pollImport(importId, pollIntervalMs = 5000, timeoutMs = 600000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const response = await fetch(
      `https://api.hubapi.com/crm/imports/2026-09/${importId}`,
      { headers: { Authorization: `Bearer ${process.env.HS_ACCESS_TOKEN}` } }
    );
    const data = await response.json();

    console.log(`Import ${importId}: state=${data.state}, ` +
      `processed=${data.metadata?.counters?.TOTAL_ROWS ?? '?'}, ` +
      `created=${data.metadata?.counters?.PROPERTY_UPDATES_SUCCESSFUL ?? '?'}`);

    if (['DONE', 'FAILED', 'CANCELED', 'REVERTED'].includes(data.state)) {
      return data;
    }

    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`Import ${importId} did not complete within ${timeoutMs}ms`);
}
```

**Counters available in `metadata.counters`:**

| Counter key | Description |
|---|---|
| `TOTAL_ROWS` | Total rows in the file (excluding header) |
| `PROPERTY_UPDATES_SUCCESSFUL` | Rows that created or updated a record |
| `PROPERTY_UPDATES_FAILED` | Rows that failed to apply |
| `NEW_OBJECT_COUNT` | Net new records created |
| `UPDATED_OBJECT_COUNT` | Existing records updated |

#### 5. Retrieve and handle import errors

When `state === 'DONE'` but `PROPERTY_UPDATES_FAILED > 0`, download the error file:

```js
async function getImportErrors(importId) {
  const response = await fetch(
    `https://api.hubapi.com/crm/imports/2026-09/${importId}/errors`,
    { headers: { Authorization: `Bearer ${process.env.HS_ACCESS_TOKEN}` } }
  );
  const data = await response.json();
  // Returns an array of error objects with row number, column, and reason
  return data.results;
}
```

Each error object contains:
- `id` — unique error ID
- `createdAt` — timestamp
- `lineNumber` — 1-based row number in the CSV (including header, so data rows start at 2)
- `sourceData` — the raw value that failed
- `objectType` — object type affected
- `error` — error code (e.g., `INVALID_EMAIL`, `REQUIRED_PROPERTY_MISSING`)
- `knownColumnHeader` — the column header that caused the error

Typical fix loop: correct the source data for failed rows, create a new CSV with only those rows, and re-run the import.

#### 6. Cancel an in-progress import

```js
async function cancelImport(importId) {
  const response = await fetch(
    `https://api.hubapi.com/crm/imports/2026-09/${importId}/cancel`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${process.env.HS_ACCESS_TOKEN}` },
    }
  );
  return response.json();
}
```

#### 7. Post-import: reconciliation (critical)

**Bulk imports do NOT fire webhooks and do NOT trigger workflow enrollment.** If your integration depends on either:

- **Webhooks:** Add a post-import reconciliation step that fetches all records created/modified since the import started (using the Search API filtered by `createdate GTE {importStartTimestamp}`) and explicitly pushes them to downstream systems.
- **Workflow enrollment:** Use the `POST /automation/v4/enrollments` API to manually enroll records into workflows after import completes.

```js
async function reconcileAfterImport(objectType, importStartMs) {
  const searchResponse = await hubspotClient.crm[objectType].searchApi.doSearch({
    filterGroups: [{
      filters: [{
        propertyName: 'createdate',
        operator:     'GTE',
        value:        String(importStartMs),
      }]
    }],
    sorts:      ['createdate'],
    properties: ['email', 'firstname', 'lastname', 'createdate'],
    limit:      100,
  });

  for (const record of searchResponse.results) {
    await pushToDownstreamSystems(objectType, record);
  }
}
```

---

### Exports

#### 8. Request an export

```js
async function startExport(objectType, format, propertiesToExport, filters = []) {
  const body = {
    exportType:   'LIST',            // 'LIST' or 'VIEW'
    format,                          // 'CSV' or 'XLSX'
    exportName:   `${objectType}-export-${Date.now()}`,
    objectType,
    objectProperties: propertiesToExport,
    associatedObjectType: null,
    language: 'EN',
    ...(filters.length > 0 && {
      publicCrmSearchRequest: {
        filterGroups: [{ filters }],
        sorts:        [],
        query:        '',
        properties:   propertiesToExport,
        limit:        0,
        after:        0,
      }
    }),
  };

  const response = await fetch('https://api.hubapi.com/crm/exports/2026-09/export/async', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${process.env.HS_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log(`Export started. Task ID: ${data.taskId}`);
  return data.taskId;
}
```

#### 9. Poll for export completion

```js
async function pollExport(taskId, pollIntervalMs = 5000, timeoutMs = 900000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const response = await fetch(
      `https://api.hubapi.com/crm/exports/2026-09/export/async/tasks/${taskId}/status`,
      { headers: { Authorization: `Bearer ${process.env.HS_ACCESS_TOKEN}` } }
    );
    const data = await response.json();

    console.log(`Export ${taskId}: status=${data.status}`);

    if (data.status === 'COMPLETE') {
      return data.result;     // contains the download URL
    }
    if (['ERROR', 'CANCELED'].includes(data.status)) {
      throw new Error(`Export ${taskId} failed: ${data.status}`);
    }

    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`Export ${taskId} did not complete within ${timeoutMs}ms`);
}
```

#### 10. Download the export file

The `result` from the completed export contains a `url` field — a pre-signed, time-limited download URL:

```js
async function downloadExport(downloadUrl, outputPath) {
  const fs       = require('fs');
  const response = await fetch(downloadUrl);

  if (!response.ok) throw new Error(`Download failed: ${response.status}`);

  const dest = fs.createWriteStream(outputPath);
  await new Promise((resolve, reject) => {
    response.body.pipe(dest);
    dest.on('finish', resolve);
    dest.on('error', reject);
  });

  console.log(`Export saved to ${outputPath}`);
}
```

---

## Verification

### Import verification

1. **Job reached `DONE` state** — confirm via `GET /crm/imports/2026-09/{importId}`.
2. **Error count is zero or within tolerance** — `PROPERTY_UPDATES_FAILED === 0` (or known acceptable rows).
3. **Spot-check records** — search for 5–10 emails from your CSV and confirm properties match.
4. **New record count makes sense** — `NEW_OBJECT_COUNT + UPDATED_OBJECT_COUNT` should equal `TOTAL_ROWS - error rows`.
5. **Downstream systems notified** — if webhooks are expected, verify your reconciliation step ran after import.

### Export verification

1. **Downloaded file is non-empty** — open and confirm row count.
2. **Properties match requested list** — check column headers in the CSV match `objectProperties`.
3. **Row count is plausible** — compare against the count returned by the Search API with the same filters.

---

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Import `state` stays `PROCESSING` for >30 min | Large file or HubSpot platform congestion | Check HubSpot Status page; increase poll timeout; consider splitting into smaller files (≤50k rows each) |
| `PROPERTY_UPDATES_FAILED > 0` | Invalid values in some rows | Download errors via `/errors` endpoint; fix those rows and re-import |
| `INVALID_EMAIL` errors on contacts | Malformed email addresses in CSV | Validate email format client-side before import; `[HS_NULL]` to clear bad emails |
| Duplicate records created despite `idColumnType: 'EMAIL'` | Email column has whitespace or case difference | Normalize emails (trim, lowercase) in CSV before upload |
| Import appears to succeed but records not found in HubSpot | Import created records in the wrong portal | Confirm `accessToken` is scoped to the correct portal (`POST /oauth/2026-09/token/introspect` returns `hub_id`) |
| Workflows not triggering for imported contacts | Bulk imports do not trigger workflow enrollment | Manually enroll via Automation Enrollments API after import (Step 7) |
| Webhooks not firing for imported records | Bulk imports bypass webhook dispatch by design | Run post-import reconciliation against the Search API (Step 7) |
| `413 Request Entity Too Large` | File exceeds 512 MB | Split into multiple files; compress to reduce size; consider streaming import via the API |
| Export download URL expired | Pre-signed URLs expire after ~15 min | Re-request the export; download immediately after `COMPLETE` status |
| Export returns 0 rows despite records existing | Filters too restrictive or wrong `objectType` | Test filter with the Search API first; confirm `objectType` matches (`CONTACT` not `contact`) |
| `403 Forbidden` on import | Token lacks `crm.objects.*.write` scope | Rotate the service key with the required scope |
| `403 Forbidden` on export | Token lacks `crm.export` scope | Add `crm.export` scope to the service key |
| Import column mapping rejected | `columnObjectTypeId` or `idColumnType` value is wrong | Check object type ID table in Step 2; validate JSON structure against the API schema |
| Re-import creates duplicates instead of updating | `idColumnType` not set on the dedup column | Add `idColumnType` to the email/domain/ID column in `columnMappings` |

---

## Escalation

Escalate to a human when:

- **Import fails with `state: FAILED`** and the error response does not clearly indicate a data issue — may be a platform-side problem; open a HubSpot support ticket with the `importId`.
- **Large imports (>500k rows) stalling** — HubSpot may rate-throttle very large jobs; request guidance from HubSpot support on recommended file sizes and scheduling windows.
- **GDPR compliance required on export** — exports may include personal data; ensure data handling agreements and access controls are in place before distributing export files.
- **Association data needed in export** — the standard export API exports object properties only, not association data; associations require a separate query via the Associations API or a custom export script.

See also:
- `hubspot-crm-objects` — for real-time single-record CRUD, batch ops, and Search API patterns
- `hubspot-data-sync` — for continuous bidirectional sync between HubSpot and an external system
- `hubspot-webhooks` — for understanding why bulk imports do not fire webhooks and the hybrid polling pattern
- `hubspot-private-apps` — for scoped access token setup and required scopes
