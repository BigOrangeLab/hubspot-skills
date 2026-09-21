---
name: hubspot-private-apps
description: "In-portal API credentials for HubSpot — service keys (the current mechanism) and legacy private apps (being sunset). Covers creating a service key, scope selection, rotation, token introspection, rate limits, and the split-traffic pattern. Use when a server-to-server integration needs to authenticate against a single portal."
compatibility: "All Hub tiers. Service keys require Developer Platform Projects 2026.09+ (public beta). Legacy private app creation ends 2026-09-28 (new portals) / 2026-10-26 (existing portals); legacy private apps unsupported September 2027."
license: MIT
metadata:
    author: georgestephanis
    version: "2.0"
    written: "2026-09-21"
    written_against:
        hubspot-api: "2026-09"
        hubspot-developer-platform: "2026.09"
---

> **Legacy private apps are being sunset.** New legacy private apps can no longer
> be created after **2026-09-28** (portals created on/after that date) or
> **2026-10-26** (existing portals), and existing ones become unsupported in
> **September 2027**. **Service keys** are the replacement. Create service keys for
> all new work; plan a migration for existing private app tokens.
>
> Both use the same `Authorization: Bearer <token>` pattern, so the calling code
> does not change — only how the credential is issued and managed.

## When to use

- Building a server-to-server integration that only needs to access **one** HubSpot portal
- Accessing HubSpot APIs from a CMS serverless function, CI script, or internal tool
- Replacing a deprecated legacy API key (`hapikey=`) with a modern token
- Needing to multiply API rate limits across multiple app tokens (split-traffic)
- Verifying what scopes are active on a given token

Do **not** use private apps when:
- The integration must work across multiple portals → use OAuth Public Apps instead
- You need Webhooks or Timeline Events APIs → those require a Public App

---

## Inputs required

- Access to HubSpot portal as a Super Admin (required to create private apps)
- Portal ID
- A clear list of the API scopes your integration needs
- A plan for storing the token securely (env var, secret manager, HubSpot secrets)

---

## Procedure

### 1. Create a service key (current mechanism)

Service keys require Developer Platform Projects **2026.09 or later**. They are in
public beta.

1. In HubSpot, go to **Development → Keys → Service keys**
2. Click **Create service key** and enter a name
3. Select the scopes the integration needs (see scope reference below) — search the
   list or review the full scope reference
4. Review and confirm

From the key's detail page you can edit scopes, view request logs, rotate, and
delete. Scopes are editable after creation, which legacy private apps did not
support cleanly.

**Service keys only work for REST API requests.** They cannot authenticate
webhooks, UI extensions, or other developer-platform features — those still need
an app. Rate limits match privately distributed apps.

---

### 1b. Create a legacy private app (existing portals only, until 2026-10-26)

Only do this to maintain an existing integration. New work should use a service key.

1. In HubSpot, go to **Settings → Integrations → Private Apps**
2. Click **Create a private app**
3. On the **Basic Info** tab: enter a name and optional description/logo
4. On the **Scopes** tab: select required scopes
5. Click **Create app** → confirm in the dialog
6. Copy the **Access token** immediately — it is shown once, though you can regenerate it later

---

### 2. Scope reference

Scopes are grouped by product area. Request only what your integration needs.

**CRM — Objects:**

| Scope | Access |
|---|---|
| `crm.objects.contacts.read` | Read contacts |
| `crm.objects.contacts.write` | Create / update / archive contacts |
| `crm.objects.companies.read` | Read companies |
| `crm.objects.companies.write` | Create / update / archive companies |
| `crm.objects.deals.read` | Read deals |
| `crm.objects.deals.write` | Create / update / archive deals |
| `crm.objects.tickets.read` | Read tickets |
| `crm.objects.tickets.write` | Create / update / archive tickets |
| `crm.objects.quotes.read` | Read quotes |
| `crm.objects.quotes.write` | Create / update / archive quotes |
| `crm.objects.line_items.read` | Read line items |
| `crm.objects.line_items.write` | Create / update / archive line items |
| `crm.objects.leads.read` | Read leads |
| `crm.objects.leads.write` | Create / update / archive leads |
| `crm.objects.orders.read` | Read orders |
| `crm.objects.goals.read` | Read goal targets |
| `crm.objects.custom.read` | Read custom object records |
| `crm.objects.custom.write` | Write custom object records |

**CRM — Schemas and properties:**

| Scope | Access |
|---|---|
| `crm.schemas.contacts.read` | Read contact property definitions |
| `crm.schemas.contacts.write` | Create / update contact properties |
| `crm.schemas.companies.read` | Read company property definitions |
| `crm.schemas.companies.write` | Create / update company properties |
| `crm.schemas.deals.read` | Read deal property definitions |
| `crm.schemas.deals.write` | Create / update deal properties |
| `crm.schemas.custom.read` | Read custom object schemas |
| `crm.schemas.custom.write` | Create / update custom object schemas |

**CRM — Associations:**

| Scope | Access |
|---|---|
| `crm.objects.associations.read` | Read associations between objects |
| `crm.objects.associations.write` | Create / delete associations |

**CRM — Lists:**

| Scope | Access |
|---|---|
| `crm.lists.read` | Read contact/company lists |
| `crm.lists.write` | Create / update lists |

**Content (CMS):**

| Scope | Access |
|---|---|
| `content` | Read/write CMS pages, blog posts, emails, files |
| `files` | Read/write Files in the Files tool |
| `hubdb` | Read/write HubDB tables and rows |

**Marketing:**

| Scope | Access |
|---|---|
| `marketing-email:read` | Read marketing emails |
| `marketing-email:write` | Create / update marketing emails |
| `forms` | Read/write forms |

**Automation:**

| Scope | Access |
|---|---|
| `automation` | Read/write workflows and sequences |

**Conversations:**

| Scope | Access |
|---|---|
| `conversations.read` | Read inbox conversations |
| `conversations.write` | Send messages, update conversations |
| `conversations.visitor_identification.tokens.create` | Create visitor ID tokens |

**Account:**

| Scope | Access |
|---|---|
| `account-info.security.read` | Read account security settings |
| `settings.users.read` | Read portal users |
| `settings.users.write` | Create / update / delete users |
| `settings.teams.read` | Read teams |
| `oauth` | Introspect OAuth tokens (required for `/oauth/2026-09/token/introspect`) |

---

### 3. Use the token in API calls

All requests use a Bearer token in the Authorization header:

```bash
curl -H "Authorization: Bearer pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  "https://api.hubapi.com/crm/objects/2026-09/contacts"
```

```javascript
// Node.js (fetch)
const res = await fetch('https://api.hubapi.com/crm/objects/2026-09/contacts', {
  headers: {
    'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});
```

**Never** pass the token as a query parameter — the old `?hapikey=` pattern is deprecated.

---

### 4. Store the token securely

**Environment variable (server / CI):**

```bash
export HUBSPOT_ACCESS_TOKEN="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**HubSpot CMS serverless functions:**

```bash
hs secrets add HUBSPOT_ACCESS_TOKEN
```

Reference in `serverless.json`:

```json
{
  "endpoints": {
    "my-endpoint": { "file": "main.js", "method": "POST" }
  },
  "secrets": ["HUBSPOT_ACCESS_TOKEN"]
}
```

Access inside the function:

```javascript
exports.main = async (context, sendResponse) => {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  // ...
};
```

**Secret managers:** AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager — retrieve at startup or per-request with caching.

---

### 5. Introspect a token

Verify which scopes are active on a token (requires the token itself and the `oauth` scope, or superadmin):

```
POST https://api.hubapi.com/oauth/2026-09/token/introspect
```

The legacy `GET /oauth/v1/access-tokens/{token}` form is on the v1 sunset path.
Note the method change from `GET` to `POST` — the token moves from the URL into
the request body, which also keeps it out of access logs.

Response:

```json
{
  "token": "pat-na1-...",
  "user": "user@example.com",
  "hub_domain": "mycompany.hubspot.com",
  "scopes": ["crm.objects.contacts.read", "crm.objects.deals.read"],
  "hub_id": 12345678,
  "app_id": 987654,
  "expires_in": -1,
  "user_id": 111222333,
  "token_type": "access"
}
```

`expires_in: -1` confirms the token does not expire.

Also available on the account info endpoint:

```
GET https://api.hubapi.com/account-info/2026-09/details
Authorization: Bearer <token>
```

Returns portal ID, hub domain, timezone, and available products.

---

### 6. Rate limits

| Token type | Per 10 seconds | Daily |
|---|---|---|
| Free tier | 100 requests | 250,000 |
| Paid tier (Starter and above) | 150 requests | 500,000 |

Limits are **per app token**, not per portal. All requests from a single private app share one bucket.

**429 handling:**

```javascript
async function hubspotRequest(url, options, retries = 3) {
  const res = await fetch(url, options);
  if (res.status === 429 && retries > 0) {
    const retryAfter = parseInt(res.headers.get('Retry-After') || '10', 10);
    await new Promise(r => setTimeout(r, retryAfter * 1000));
    return hubspotRequest(url, options, retries - 1);
  }
  return res;
}
```

Relevant response headers on `429`:
- `X-HubSpot-RateLimit-Remaining` — requests left in current 10s window
- `X-HubSpot-RateLimit-Reset` — Unix timestamp when window resets
- `Retry-After` — seconds to wait

---

### 7. Split-traffic pattern (multiplying rate limits)

Each private app has its own independent rate-limit bucket. Create multiple private apps with identical scopes and round-robin requests across their tokens to multiply throughput.

```javascript
const tokens = [
  process.env.HUBSPOT_TOKEN_1,
  process.env.HUBSPOT_TOKEN_2,
  process.env.HUBSPOT_TOKEN_3,
];
let counter = 0;

function getToken() {
  return tokens[counter++ % tokens.length];
}
```

Useful for batch sync jobs that need to exceed 150 req/10s. Each app must be created separately in HubSpot Settings.

---

### 8. Rotate / regenerate a token

1. In HubSpot, go to **Settings → Integrations → Private Apps → [your app]**
2. Click **Rotate token** (or **Show token** → **Rotate**)
3. The old token is **immediately invalidated** — update all consumers before rotating
4. Copy and store the new token

Rotation should be done:
- On suspected compromise
- During regular key rotation cycles (e.g., quarterly)
- When offboarding a developer who had access

---

### 9. Delete a Private App

In **Settings → Integrations → Private Apps**, click the app → **Delete**. This immediately invalidates the token and removes all associated scopes. Existing API calls using that token will receive `401`.

---

## Verification

```bash
# Test auth and get portal info
curl -s -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  https://api.hubapi.com/account-info/2026-09/details | jq .

# Verify scopes on the token
curl -s -X POST "https://api.hubapi.com/oauth/2026-09/token/introspect" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$HUBSPOT_ACCESS_TOKEN\"}" | jq .scopes
```

Expected: 200 response with portal ID and hub domain. The scopes array should list all scopes you configured.

---

## Failure modes

| Error | Cause | Fix |
|---|---|---|
| `401 UNAUTHORIZED` | Token missing, invalid, or rotated | Confirm token in env var matches active token in HubSpot |
| `403 FORBIDDEN` | Token lacks required scope | Add scope to the private app and save (takes effect immediately) |
| `429 TOO_MANY_REQUESTS` | Rate limit hit | Back off with `Retry-After`; consider split-traffic pattern |
| `403` on scope introspection | Token doesn't have `oauth` scope | Add `oauth` scope to the app, or check scopes via HubSpot UI |
| Token works in dev, fails in prod | Different env var name between environments | Audit env var names and values across environments |
| Serverless function `401` | Secret name mismatch in `serverless.json` | Confirm secret name matches what `hs secrets add` used |
| New scope not taking effect | Scope added after token was issued | Private app tokens update immediately on scope change — no need to regenerate |
| `hapikey` query param rejected | Legacy API key style, deprecated | Switch to `Authorization: Bearer` header with Private App token |
| Can't create private app | Not a Super Admin | Requires Super Admin role in the portal |

---

## Escalation

- Private Apps docs: https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/account-service-keys
- Scope reference: https://developers.hubspot.com/docs/api/working-with-oauth#scopes
- Token introspection: `POST https://api.hubapi.com/oauth/2026-09/token/introspect`
- Service keys: https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/account-service-keys
- For the v1–v4 sunset timeline and endpoint mapping: see `hubspot-api-versioning` skill
- For multi-portal integrations (where private apps won't work): see `hubspot-public-apps-oauth` skill (to be built)
- For using the token in CMS functions: see `hubspot-cms-serverless` skill
- For rate-limited CRM operations: see `hubspot-crm-objects` skill
