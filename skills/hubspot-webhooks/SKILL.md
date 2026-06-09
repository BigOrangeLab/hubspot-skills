---
name: hubspot-webhooks
description: "Configure and consume HubSpot v3 Webhooks API — subscriptions, payload handling, HMAC signature verification, retry/dedup, and hybrid polling patterns"
compatibility: "Requires a Public App (OAuth); v3 Webhooks API; HubSpot CRM contacts/companies/deals/tickets/products/line_items/conversations; v4 Journal API in beta"
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-06-09"
    written_against:
        hubspot-api: "v3 webhooks"
---

## When to use

Use this skill whenever you need to react to CRM changes in real time without continuous polling:

- Syncing HubSpot contacts, companies, or deals into an external system as they are created or updated.
- Triggering downstream workflows when a HubSpot property changes (e.g., lifecycle stage moves to `customer`).
- Keeping a data warehouse or BI tool current with HubSpot CRM state.
- Notifying a Slack channel or support desk when a new ticket is created.
- Building an event-sourced architecture that requires reliable event ordering and replay capability (use the v4 Journal API in that case; see Escalation).

**What webhooks are NOT suited for:**

- Bulk import events — HubSpot does NOT fire webhooks for records created via the Imports API or CSV import. Use periodic polling or a full reconciliation scan to catch those.
- Retroactive delivery — subscriptions only receive events that occur after subscription creation.
- Private apps — the v3 Webhooks API settings endpoint is read-only for private apps; subscriptions must be managed through the developer portal UI. The API-configurable webhooks described in this skill require a Public App (OAuth).

---

## Inputs required

Before starting, collect:

| Input | Description | Where to find it |
|---|---|---|
| `appId` | Numeric ID of your Public App | Developer account → Apps → your app |
| `clientSecret` | Your app's client secret (for HMAC verification) | Developer account → Apps → your app → Auth |
| `targetUrl` | HTTPS endpoint that will receive POST payloads | Your infrastructure; must respond within 5 s |
| `eventType(s)` | Which CRM events to subscribe to (see full list below) | Choose from the subscription types table |
| `propertyName` | Required when `eventType` ends in `.propertyChange` | HubSpot property name (e.g., `lifecyclestage`) |
| `portalId` | Hub ID(s) of the accounts whose events you expect | Customer/portal settings |
| `maxConcurrentRequests` | How many parallel requests your endpoint can handle (minimum 6) | Your infrastructure capacity |

For local development you also need:

- `ngrok` (or equivalent tunnel) to expose a local HTTP server to HubSpot.

---

## Procedure

### 1. Create a Public App

Webhooks require a Public App (OAuth). Private apps cannot be configured via the settings API.

1. Log into your HubSpot developer account at `app.hubspot.com/developer`.
2. Go to **Apps** → **Create app** → fill in the basic info.
3. Under **Auth**, note your `Client ID` and `Client Secret`.
4. Under **Features** → **Webhooks**, set a `Target URL` for the app-wide webhook endpoint.
5. Note your `App ID` shown in the URL (`/apps/{appId}`).

### 2. Configure the webhook target URL and throttle

```bash
# PUT /webhooks/v3/{appId}/settings
curl --request PUT \
  --url "https://api.hubapi.com/webhooks/v3/{appId}/settings" \
  --header "Authorization: Bearer {developerApiKey}" \
  --header "Content-Type: application/json" \
  --data '{
    "targetUrl": "https://your-domain.example.com/webhooks/hubspot",
    "throttling": {
      "maxConcurrentRequests": 10,
      "period": "SECONDLY"
    }
  }'
```

Notes:
- `maxConcurrentRequests` must be **greater than 5** (minimum effective value: 6). A value of 10 is the maximum.
- `period` is always `"SECONDLY"`.
- Throttle governs *requests*, not individual events. Each request can carry up to 100 batched events.

To read current settings:

```bash
curl --request GET \
  --url "https://api.hubapi.com/webhooks/v3/{appId}/settings" \
  --header "Authorization: Bearer {developerApiKey}"
```

### 3. Create webhook subscriptions

#### 3a. Supported subscription event types

**Standard CRM objects** — replace `<object>` with `contact`, `company`, `deal`, `ticket`, `product`, or `line_item`:

| Event type | Description |
|---|---|
| `<object>.creation` | New record created |
| `<object>.deletion` | Record deleted (moved to trash) |
| `<object>.restore` | Deleted record restored |
| `<object>.merge` | Two records merged |
| `<object>.propertyChange` | A named property value changed (requires `propertyName`) |
| `<object>.associationChange` | An association between records was added or removed |

**Contact-specific extras:**
| Event type | Description |
|---|---|
| `contact.privacyDeletion` | GDPR deletion request processed |

**Conversation events** (require `conversations.read` OAuth scope):
| Event type | Description |
|---|---|
| `conversation.creation` | New conversation thread opened |
| `conversation.deletion` | Thread deleted |
| `conversation.privacyDeletion` | GDPR deletion for a conversation |
| `conversation.newMessage` | A new message posted to an existing thread |
| `conversation.propertyChange` | Thread property changed; valid `propertyName` values: `assignedTo`, `status` (`OPEN`/`CLOSED`), `isArchived` (always `FALSE` on restore) |

**Generic (expanded) subscriptions** — for custom and app objects, include `objectTypeId` (e.g., `0-1` for contact, `0-2` for company) in the request body. The response payload will also include `objectTypeId`. Restrictions: `ENGAGEMENT` object type is not supported; `hs_email_html`/`hs_email_subject` properties on `EMAIL` and `hs_communication_body` on `COMMUNICATION` are restricted.

#### 3b. Create a subscription (API example)

```bash
# Simple creation event
curl --request POST \
  --url "https://api.hubapi.com/webhooks/v3/{appId}/subscriptions" \
  --header "Authorization: Bearer {developerApiKey}" \
  --header "Content-Type: application/json" \
  --data '{
    "eventType": "contact.creation",
    "active": true
  }'

# Property change — requires propertyName
curl --request POST \
  --url "https://api.hubapi.com/webhooks/v3/{appId}/subscriptions" \
  --header "Authorization: Bearer {developerApiKey}" \
  --header "Content-Type: application/json" \
  --data '{
    "eventType": "contact.propertyChange",
    "propertyName": "lifecyclestage",
    "active": true
  }'
```

- New subscriptions default to `active: false` (paused) unless explicitly set to `true`.
- To reactivate a paused subscription later, `PATCH` with `{ "active": true }`:

```bash
curl --request PATCH \
  --url "https://api.hubapi.com/webhooks/v3/{appId}/subscriptions/{subscriptionId}" \
  --header "Authorization: Bearer {developerApiKey}" \
  --header "Content-Type: application/json" \
  --data '{ "active": true }'
```

#### 3c. List and delete subscriptions

```bash
# List all subscriptions for the app
curl "https://api.hubapi.com/webhooks/v3/{appId}/subscriptions" \
  --header "Authorization: Bearer {developerApiKey}"

# Delete a subscription
curl --request DELETE \
  "https://api.hubapi.com/webhooks/v3/{appId}/subscriptions/{subscriptionId}" \
  --header "Authorization: Bearer {developerApiKey}"
```

#### 3d. Batch update

```bash
curl --request POST \
  --url "https://api.hubapi.com/webhooks/v3/{appId}/subscriptions/batch/update" \
  --header "Authorization: Bearer {developerApiKey}" \
  --header "Content-Type: application/json" \
  --data '{
    "inputs": [
      { "id": 1001, "active": false },
      { "id": 1002, "active": true }
    ]
  }'
```

### 4. Expose a local endpoint (local development with ngrok)

```bash
# Terminal 1 — run your local server (e.g., Node/Express on port 3000)
node server.js

# Terminal 2 — expose it via ngrok
ngrok http 3000
# Copy the https://xxxxx.ngrok.io URL
```

Use the `ngrok` HTTPS URL as the `targetUrl` in Step 2. Ngrok provides a web inspector at `http://127.0.0.1:4040` where you can replay webhook requests for debugging.

### 5. Implement signature verification (v3, recommended)

HubSpot attaches two headers to every webhook delivery:
- `X-HubSpot-Signature-v3` — Base64-encoded HMAC-SHA256 signature
- `X-HubSpot-Request-Timestamp` — Unix timestamp in **milliseconds**

The HMAC source string is:
```
{HTTP_METHOD}{full_request_uri}{raw_request_body}{timestamp}
```

Example (Node.js / Express):

```js
const express = require('express');
const crypto  = require('crypto');

const app = express();
const CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;

// Preserve the raw body for signature verification
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; }
}));

function verifyHubSpotSignature(req, res, next) {
  const signature  = req.get('X-HubSpot-Signature-v3');
  const timestamp  = req.get('X-HubSpot-Request-Timestamp');

  if (!signature || !timestamp) {
    return res.status(401).json({ error: 'Missing HubSpot signature headers' });
  }

  // Reject stale requests (replay attack protection) — timestamp is in milliseconds
  const ageMs = Date.now() - Number(timestamp);
  if (ageMs > 5 * 60 * 1000) {
    return res.status(401).json({ error: 'Request timestamp too old' });
  }

  // Reconstruct the full URI exactly as HubSpot saw it
  const fullUri   = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const rawBody   = req.rawBody ? req.rawBody.toString('utf8') : '';
  const source    = `POST${fullUri}${rawBody}${timestamp}`;

  const expected = crypto
    .createHmac('sha256', CLIENT_SECRET)
    .update(source)
    .digest('base64');

  if (signature !== expected) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
}

app.post('/webhooks/hubspot', verifyHubSpotSignature, (req, res) => {
  // Acknowledge receipt immediately — process asynchronously
  res.status(200).json({ received: true });
  processEventsAsync(req.body);
});
```

**Critical gotchas for v3 signature verification:**
- Compute HMAC over the **raw request bytes**, not a re-serialized JSON string. Any JSON reformatting will break the signature.
- The source string concatenates four values with no separator: method + uri + body + timestamp.
- If your app sits behind a reverse proxy or load balancer, ensure the `Host` header and the full original URL are forwarded unchanged.
- The signature value is **Base64-encoded**, not hex.

### 6. Process payloads — batching and deduplication

HubSpot batches up to 100 events per HTTP POST. Each event in the array is an independent notification and should be processed idempotently.

**Payload fields per event:**

| Field | Type | Description |
|---|---|---|
| `eventId` | number | Unique ID for this specific delivery attempt; use as idempotency key |
| `subscriptionId` | number | Which subscription triggered this event |
| `portalId` | number | Hub ID of the portal where the event occurred |
| `appId` | number | Your app's ID |
| `occurredAt` | number (ms epoch) | When the event occurred in HubSpot |
| `subscriptionType` | string | e.g., `contact.propertyChange` |
| `attemptNumber` | number | 0 for first delivery; increments on each retry |
| `objectId` | number | ID of the CRM record |
| `objectTypeId` | string | Present on generic/custom object events (e.g., `0-1` for contact) |
| `propertyName` | string | Property that changed (only on `.propertyChange` events) |
| `propertyValue` | string | New value after the change |
| `changeSource` | string | What triggered the change: `CRM`, `IMPORT`, `WORKFLOWS`, `INTEGRATION`, `ACADEMY`, etc. |
| `changeFlag` | string | Present on creation events; e.g., `NEW` |

**Example batch payload:**

```json
[
  {
    "eventId": 3816279340,
    "subscriptionId": 25,
    "portalId": 33,
    "appId": 1160452,
    "occurredAt": 1462216307945,
    "subscriptionType": "contact.propertyChange",
    "attemptNumber": 0,
    "objectId": 1246965,
    "propertyName": "lifecyclestage",
    "propertyValue": "customer",
    "changeSource": "CRM"
  },
  {
    "eventId": 3816279480,
    "subscriptionId": 22,
    "portalId": 33,
    "appId": 1160452,
    "occurredAt": 1462216307945,
    "subscriptionType": "contact.creation",
    "attemptNumber": 0,
    "objectId": 1246978,
    "changeSource": "IMPORT",
    "changeFlag": "NEW"
  }
]
```

**Deduplication and ordering (Node.js example with Redis):**

```js
const redis = require('redis');
const client = redis.createClient();

async function processEventsAsync(events) {
  for (const event of events) {
    const idempotencyKey = `hs:event:${event.eventId}`;

    // SET NX with 24-hour TTL — returns null if key already exists
    const isNew = await client.set(idempotencyKey, '1', {
      NX: true,
      EX: 86400 // 24 hours — matches HubSpot's retry window
    });

    if (!isNew) {
      console.log(`Skipping duplicate event ${event.eventId}`);
      continue;
    }

    // Validate portalId to prevent cross-tenant data leaks
    if (event.portalId !== Number(process.env.EXPECTED_PORTAL_ID)) {
      console.warn(`Unexpected portalId ${event.portalId}, skipping`);
      continue;
    }

    await handleEvent(event);
  }
}

async function handleEvent(event) {
  switch (event.subscriptionType) {
    case 'contact.creation':
      await syncContactToExternalSystem(event.objectId);
      break;

    case 'contact.propertyChange':
      // Use occurredAt for last-write-wins ordering on concurrent updates
      await updateContactProperty(event.objectId, event.propertyName, event.propertyValue, event.occurredAt);
      break;

    case 'contact.deletion':
      await archiveContact(event.objectId);
      break;

    default:
      console.log(`Unhandled event type: ${event.subscriptionType}`);
  }
}
```

### 7. Implement the hybrid pattern for full coverage

Webhooks miss bulk import events. A robust integration combines:

1. **Webhooks** — real-time push for incremental changes (step 3–6 above).
2. **Periodic polling** — hourly or every 15 minutes using the [HubSpot Search API](https://developers.hubspot.com/docs/api/crm/search) filtered by `lastmodifieddate > {lastPollTimestamp}` to catch anything webhooks might miss.
3. **Daily full reconciliation** — once per day, compare your data store against a full CRM export or paginated list to detect bulk import records and fix any drift.

```js
// Hourly catchup poll (pseudocode)
async function catchupPoll(objectType, lastPollMs) {
  const response = await hubspot.crm.contacts.searchApi.doSearch({
    filterGroups: [{
      filters: [{
        propertyName: 'lastmodifieddate',
        operator: 'GTE',
        value: String(lastPollMs)
      }]
    }],
    sorts: ['lastmodifieddate'],
    limit: 100
  });

  for (const result of response.results) {
    await syncRecord(objectType, result.id, result.properties);
  }

  return Date.now();
}
```

---

## Verification

After setup, confirm correct operation with these checks:

1. **Settings endpoint returns your target URL:**
   ```bash
   curl "https://api.hubapi.com/webhooks/v3/{appId}/settings" \
     --header "Authorization: Bearer {developerApiKey}"
   ```
   Response should include `"targetUrl": "https://your-domain.example.com/webhooks/hubspot"`.

2. **Subscription list is non-empty and shows `active: true`:**
   ```bash
   curl "https://api.hubapi.com/webhooks/v3/{appId}/subscriptions" \
     --header "Authorization: Bearer {developerApiKey}"
   ```

3. **Trigger a test event** — create a contact via the HubSpot UI or API while watching your server logs. You should receive a POST within seconds containing an event with `subscriptionType: "contact.creation"`.

4. **Signature verifies correctly** — log the `X-HubSpot-Signature-v3` and `X-HubSpot-Request-Timestamp` headers on your first real delivery and confirm your computed HMAC matches.

5. **Confirm idempotency** — if `attemptNumber > 0` appears in a payload, verify your deduplication logic discarded it cleanly without double-processing.

6. **Response time is under 5 seconds** — check your server-side request logs. Any response after 5 s will be treated as a failure by HubSpot, triggering a retry.

---

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| No events arriving at all | Subscription is paused (`active: false`) | `PATCH` the subscription with `{ "active": true }` |
| No events for bulk-imported records | Bulk imports do not trigger webhooks by design | Add periodic polling catchup (Step 7) |
| `401 Unauthorized` on incoming request | Signature mismatch | Check raw body is not reformatted before HMAC; check `Host` header if behind a proxy; ensure Base64 comparison, not hex |
| Signature mismatch but timestamp is correct | Body is being modified by middleware (body-parser, gzip, etc.) | Capture raw bytes with `express.json({ verify: ... })` before any transformation |
| Stale timestamp rejection (>5 min) | Clock skew on your server, or HubSpot timestamp misread as seconds | HubSpot timestamps are in **milliseconds**; divide by 1000 if comparing to `Date.now() / 1000` |
| Duplicate events arriving | HubSpot retrying a previous delivery (`attemptNumber > 0`) | Normal; deduplicate on `eventId` using Redis or a DB unique constraint |
| Events arriving out of order | Network or retry timing | Use `occurredAt` to determine last-write-wins ordering; do not rely on HTTP arrival order |
| `connection refused` / 5 s timeouts | Your endpoint is too slow or not running | Acknowledge with `200` immediately; push event to a queue (SQS, BullMQ, etc.) for async processing |
| Endpoint returns `200` but processing fails | Silent failure after acknowledgement | Log failures to a dead-letter queue; implement reconciliation scan |
| Missing events from custom objects | Using old-style subscriptions without `objectTypeId` | Use generic subscriptions with `objectTypeId` in the POST body |
| `ENGAGEMENT` object type subscription fails | Not supported in generic webhooks | Use the Conversations API or timeline events instead |
| Events from unexpected portal | Multi-tenant app with shared endpoint | Validate `event.portalId` against expected set; reject and log unknown portals |
| `maxConcurrentRequests` value rejected | Value must be > 5 | Set to at least 6; maximum is 10 |
| Bulk import records never appear | Webhooks are not fired for CSV/Import API | Add hourly polling via Search API filtered by `lastmodifieddate` |
| Webhook not receiving `contact.privacyDeletion` | Requires explicit subscription + GDPR feature enabled | Create subscription for `contact.privacyDeletion`; confirm GDPR features on the portal |

---

## Escalation

Escalate to a human developer or HubSpot support in these situations:

- **Persistent signature failures** after verifying raw body capture, proxy headers, and Base64 encoding — your infrastructure may be transparently modifying requests.
- **Events consistently missing** for a specific object type after confirming the subscription is active and the event type is supported.
- **Webhook delivery fully stalled** for over 30 minutes — check the [HubSpot Status page](https://status.hubspot.com/) for platform incidents.
- **High event volume exceeding your endpoint capacity** — explore moving to the **v4 Webhooks Journal API** (poll-based), which offers replay up to 3 days and higher reliability under load. See: [Webhooks Journal API docs](https://developers.hubspot.com/docs/api-reference/webhooks-journal-v4/guide).
- **Need historical backfill** beyond what webhooks provide — the v4 Journal API can replay up to 3 days of events; older data requires a full CRM export via the Contacts/Companies/Deals APIs.
- **Custom object association webhooks** on v3 not firing reliably — migrate to v4 subscriptions which have explicit `ASSOCIATION` subscription type support.
- **Spring 2026 batched reads or list membership subscriptions needed** — these are only available in the v4 Journal API. See: [Spring 2026 Spotlight](https://developers.hubspot.com/changelog/spring-2026-spotlight).

See also:
- `hubspot-public-api` — for making HubSpot CRM API calls (read/write) once a webhook fires
- `hubspot-cms-serverless` — for running webhook receivers as HubSpot-hosted serverless functions (Content Hub Enterprise)
- `jinjava` / `hubl` — unrelated to webhooks; for CMS template rendering
