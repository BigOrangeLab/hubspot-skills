---
name: hubspot-api-versioning
description: "HubSpot's date-based API versioning — how /2026-09/ paths work, the legacy v1–v4 end-of-support calendar, how to map a legacy endpoint to its date-based equivalent, and which API families have no GA date-based version yet. Use when writing any new HubSpot API call or migrating existing ones off v1/v2/v3/v4."
compatibility: "All Hub tiers. Date-based versions from 2025-09 onward; legacy v1–v4 unsupported September 2027."
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-09-21"
    written_against:
        hubspot-api: "2026-09"
        spec-collection: "HubSpot/HubSpot-public-api-spec-collection @ 2026-09-21"
---

## When to use

- Writing **any** new HubSpot REST API call — pick the version before you pick the endpoint
- Migrating an integration off `/v1/`, `/v2/`, `/v3/` or `/v4/` paths
- Deciding whether an API family is safe to use on a date-based version yet
- Auditing an existing integration against the September 2027 enforcement date
- Seeing a 404 on a path that "should" exist — the version slug usually moved

This skill is the routing hub for versioning. For the API surface itself, see the
per-area skills (`hubspot-crm-objects`, `hubspot-properties-api`, etc.), which now
carry date-based paths.

---

## Inputs required

- The legacy endpoint you are replacing (full path, including its `v1`/`v2`/`v3`/`v4` segment)
- The API family it belongs to (CRM objects, Marketing emails, CMS pages, …)
- Whether you need a **GA** version or can accept a beta

---

## Procedure

### 1. Know the timeline

| Date | What happens |
|---|---|
| 2026-09-08 | `2026-09` GA released — current version |
| 2026-09-15 | v1–v4, legacy public apps, legacy private apps declared **unsupported** |
| 2026-09-28 | New portals lose the ability to create legacy private apps |
| 2026-10-26 | Existing portals lose the ability to create legacy private apps |
| 2026-12-04 | Pipelines API **v1 sunsets** (hard) |
| 2027-03-30 | v4 support ends |
| 2027-09 | **Enforcement** — v1–v3 and legacy apps stop being served |

"Unsupported" means no bug fixes, reliability work, or security patches — the
endpoints keep responding until enforcement. Treat September 2027 as the real
deadline and v4's March 2027 date as the earlier one.

### 2. Understand the version scheme

GA versions ship **twice a year**, March and September, named for the release
window: `2026-03`, `2026-09`, `2027-03`. Each is:

- **Immutable** once released — only critical fixes land
- **Supported 18 months** — 6 months active, then 12 months critical-fix-only
- Preceded by a beta roughly six months earlier, e.g. `2026-09-beta` before `2026-09`

The version lives **in the URL path**, not a header. There is no account-level
switch and no `HubSpot-API-Version` header.

### 3. Map the path — the slug moves

This is the part that breaks naive migrations. The version segment does not stay
where it was:

```
# CRM objects — slug moves from position 2 to position 3
LEGACY  /crm/v3/objects/contacts
2026-09 /crm/objects/2026-09/contacts

# Schemas — the whole prefix changes
LEGACY  /crm/v3/schemas
2026-09 /crm-object-schemas/2026-09/schemas

# Webhooks — prefix renamed entirely
LEGACY  /webhooks/v3/{appId}/subscriptions
2026-09 /app-webhooks/2026-09/{appId}/subscriptions

# Imports / exports — split into their own prefixes
LEGACY  /crm/v3/imports
2026-09 /crm/imports/2026-09
LEGACY  /crm/v3/exports/export/async
2026-09 /crm/exports/2026-09/export/async

# Associations — reads move under the object, writes get their own prefix
LEGACY  /crm/v4/associations/{from}/{id}/to/{to}
2026-09 /crm/objects/2026-09/{from}/{id}/associations/{to}
LEGACY  /crm/v4/associations/{from}/{to}/batch/create
2026-09 /crm/associations/2026-09/{from}/{to}/batch/create
```

A regex that rewrites `/v3/` to `/2026-09/` in place will produce 404s. Look the
family up in `references/endpoint-map.md`, which is generated from HubSpot's own
published OpenAPI specs.

### 4. Check the family has a GA version at all

Several families are **beta-only** on date-based versioning. Keep production
traffic on their legacy paths until GA:

| Family | Status as of 2026-09-21 | Use |
|---|---|---|
| Marketing Forms | `2026-09-beta` only | stay on `/marketing/v3/forms` |
| Automation / Flows (workflows) | `2026-09-beta` only | stay on `/automation/v4/flows` |
| Lead Scoring | `2026-09-beta` only | legacy |
| AEO | `2026-09-beta` only | legacy |
| Commerce Contracts | `2026-09-beta` only | legacy |
| Subscription Lifecycle | `2026-09-beta` only | legacy |
| Analytics Reporting | `2027-03-beta` only | legacy |

Note that **custom workflow actions** (`Actions V4`) *do* have GA at
`/automation/actions/2026-09/{appId}` — only the Flows API itself lags.

### 5. Migrate directly, not in steps

Go straight from whatever you are on to the date-based version. Do not migrate
`v1` → `v3` → date-based; `v3` is itself on the way out and you would pay the
cost twice.

### 6. Verify against the spec collection

HubSpot publishes every version's OpenAPI spec:

```bash
git clone --depth 1 https://github.com/HubSpot/HubSpot-public-api-spec-collection
# Paths live at PublicApiSpecs/<Area>/<Family>/Rollouts/<id>/2026-09/<family>.json
python3 -c "
import json,sys
d=json.load(open(sys.argv[1]))
for p in sorted(d['paths']): print(p)
" 'PublicApiSpecs/CRM/Contacts/Rollouts/144907/2026-09/contacts.json'
```

This is the only source that is guaranteed current. The rendered developer docs
require authentication and lag the specs.

### 7. Budget for the new write-validation behaviour

From `2026-09` onward HubSpot **enforces admin-configured property validation
rules on all CRM API write paths**. Calls that succeeded on `/crm/v3/` can fail
on `/crm/objects/2026-09/` with a validation error for the same payload. Before
cutting over writes:

- Pull the portal's rules: `GET /crm/property-validations/2026-09/{objectTypeId}`
- Re-test every write path against a sandbox, not just a schema diff
- Handle `400` validation responses explicitly — they are now an expected outcome

---

## Verification

```bash
# 1. A valid date-based path returns 401 unauthenticated; a bad one returns 404.
#    This distinguishes "wrong path" from "wrong token" without spending a token.
for p in /crm/objects/2026-09/contacts /crm/objects/9999-99/contacts; do
  printf '%s  %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "https://api.hubapi.com$p")" "$p"
done
# expect: 401  /crm/objects/2026-09/contacts
#         404  /crm/objects/9999-99/contacts
```

```bash
# 2. Authenticated smoke test on the new path
curl -s -o /dev/null -w '%{http_code}\n' \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/crm/objects/2026-09/contacts?limit=1"
# expect: 200
```

Confirm your integration logs show zero requests to `/v1/`, `/v2/`, `/v3/`, `/v4/`
paths before declaring a migration done. Check the portal's API usage chart
(Settings → Integrations → API usage) for stragglers you missed in code.

---

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `404` on a path you "just versioned" | Version slug moved position | Look the family up in `references/endpoint-map.md` |
| `404` on `/crm/schemas/2026-09/...` | Schemas moved host prefix | Use `/crm-object-schemas/2026-09/schemas` |
| `404` on `/webhooks/2026-09/...` | Webhooks renamed | Use `/app-webhooks/2026-09/{appId}/...` |
| `400` validation error on a write that used to pass | 2026-09 enforces admin validation rules | Read the rule set, fix the payload, or relax the rule |
| Beta path returns `404` in production portal | Beta versions need opt-in and are not for production | Stay on the legacy path until GA |
| Migration "done" but traffic still on v3 | An SDK pins the old path | Check SDK version; most pin paths internally |
| `401` on every date-based call while v3 works | Legacy private app token with a scope the new path checks differently | Re-issue as a service key with explicit scopes |

---

## Escalation

Ask a human when:

- An API family you depend on has **no GA date-based version** and your enforcement
  deadline is close — this is a roadmap question, not a code one
- A legacy v1/v2 endpoint has **no date-based equivalent at all** (several do not)
- The 2026-09 validation enforcement blocks a write your business process depends on —
  changing the portal's validation rules is an admin decision with CRM-wide effects
- You are deciding between migrating a legacy public app vs. rebuilding it on the
  Developer Platform Projects framework

See also: `hubspot-private-apps` (service keys and the legacy private app sunset),
`hubspot-public-api` (auth, rate limits, the general request pattern),
`hubspot-crm-objects` (the CRM object pattern on date-based paths).
