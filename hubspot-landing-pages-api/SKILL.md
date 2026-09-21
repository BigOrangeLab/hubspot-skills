---
name: hubspot-landing-pages-api
description: "Manage HubSpot landing pages via the Pages API — create/read/update/delete pages, schedule publishing, clone pages, work with A/B tests, and retrieve page performance metrics"
compatibility: "Marketing Hub Starter+ for landing pages; Content Hub Core+ for advanced page editing; CMS Pages API 2026-09"
license: MIT
metadata:
    author: georgestephanis
    version: "1.1"
    written: "2026-09-21"
    written_against:
        hubspot-api: "2026-09"
---

## When to use

- Creating or cloning landing pages programmatically (campaign automation, multi-locale rollouts)
- Updating page metadata (title, slug, meta description, OG tags) in bulk
- Scheduling a landing page to publish or unpublish at a specific time
- Reading page performance data (views, submissions, bounce rate) for reporting
- Managing A/B test variants on existing landing pages
- Listing all landing pages for a portal for auditing or migration

Use the HubSpot Design Tools / CMS development workflow (`hubspot-cli` and `hubspot-cms-themes`) for actual template and module editing. This skill covers API-level page management only.

---

## Inputs required

| Input | Source |
|---|---|
| Account service key | `hubspot-private-apps` skill |
| `pageId` (integer string) | GET `/cms/pages/2026-09/landing-pages` or HubSpot Pages UI |
| Template path | HubSpot Design Manager or `hs fetch` |
| Domain and slug | Portal domain settings |

**Scopes:** `content`

---

## Procedure

### 1. List landing pages

```bash
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/cms/pages/2026-09/landing-pages?limit=20&state=PUBLISHED" \
  | jq '[.results[] | {id: .id, name: .name, slug: .slug, state: .state, url: .url}]'
```

**Query parameters:**

| Parameter | Description |
|---|---|
| `limit` | Page size (max 100) |
| `after` | Cursor for next page |
| `state` | `DRAFT`, `PUBLISHED`, `SCHEDULED`, `ARCHIVED`, `AUTOMATED` |
| `sort` | Property to sort by, e.g. `updatedAt` or `-updatedAt` (prefix `-` for descending) |
| `createdAfter`, `createdBefore` | ISO 8601 timestamps |
| `updatedAfter`, `updatedBefore` | ISO 8601 timestamps |
| `campaign` | Campaign ID to filter pages attached to a campaign |
| `slug` | Filter by URL slug (exact match) |

---

### 2. Get a single landing page

```bash
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/cms/pages/2026-09/landing-pages/$PAGE_ID" \
  | jq '{
      id: .id,
      name: .name,
      slug: .slug,
      state: .state,
      htmlTitle: .htmlTitle,
      metaDescription: .metaDescription,
      publishDate: .publishDate,
      url: .url,
      campaign: .campaign
    }'
```

---

### 3. Create a landing page

```
POST /cms/pages/2026-09/landing-pages
```

```json
{
  "name": "Summer Sale 2026",
  "slug": "summer-sale-2026",
  "htmlTitle": "Summer Sale — Up to 50% Off",
  "metaDescription": "Shop our biggest sale of the year. Limited time only.",
  "language": "en",
  "campaign": "CAMPAIGN_GUID",
  "domain": "www.acme.example.com",
  "templatePath": "generated_global_groups/acme-landing-template.html",
  "layoutSections": {},
  "widgets": {},
  "pageExpiryEnabled": false,
  "featuredImageUrl": "https://cdn.acme.example.com/images/summer-sale.jpg",
  "useFeaturedImage": true
}
```

Response (`201 Created`) includes the page `id` and `state: "DRAFT"`.

---

### 4. Update a landing page

```
PATCH /cms/pages/2026-09/landing-pages/{pageId}
```

Only include the fields you want to change:

```json
{
  "htmlTitle": "Updated Page Title",
  "metaDescription": "Updated description for SEO",
  "slug": "new-slug-2026"
}
```

**Updating Open Graph / social tags:**

```json
{
  "pageRedirected": false,
  "pageExpiryEnabled": false,
  "openGraphDescription": "Summer deals you can't miss",
  "openGraphImageUrl": "https://cdn.acme.example.com/og-summer-sale.jpg",
  "openGraphTitle": "Summer Sale — Acme Corp"
}
```

---

### 5. Publish, unpublish, and schedule

#### Publish immediately

```
POST /cms/pages/2026-09/landing-pages/{pageId}/draft/push-live
```

```bash
curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/cms/pages/2026-09/landing-pages/$PAGE_ID/draft/push-live"
```

Response: `204 No Content` on success.

#### Schedule publish at a future time

```
PATCH /cms/pages/2026-09/landing-pages/{pageId}
```

```json
{
  "publishDate": "2026-08-01T09:00:00.000Z",
  "currentState": "SCHEDULED_FOR_PUBLISH"
}
```

`publishDate` is an ISO 8601 UTC timestamp. The page will automatically go live at that time.

#### Schedule unpublish (page expiry)

```json
{
  "pageExpiryEnabled": true,
  "pageExpiryDate": 1753948800000,
  "pageExpiryRedirectId": 0,
  "pageExpiryRedirectUrl": "https://www.acme.example.com/"
}
```

`pageExpiryDate` is a Unix ms timestamp. When the page expires, visitors are redirected to `pageExpiryRedirectUrl`.

#### Unpublish immediately

```json
{
  "currentState": "DRAFT"
}
```

---

### 6. Clone a page

```
POST /cms/pages/2026-09/landing-pages/{pageId}/clone
```

```json
{
  "name": "Summer Sale 2026 — Clone"
}
```

The cloned page is created in `DRAFT` state. Update its `slug` before publishing — two published pages cannot share a slug.

---

### 7. A/B tests

#### Create an A/B test on a page

```
POST /cms/pages/2026-09/landing-pages/{pageId}/ab-test/create-variant
```

```json
{
  "name": "Summer Sale 2026 — Variant B",
  "trafficSplitPercentage": 50
}
```

HubSpot creates a new variant page cloned from the original. Edit the variant independently, then run the test.

#### End an A/B test and pick a winner

```
POST /cms/pages/2026-09/landing-pages/{pageId}/ab-test/end-test
```

```json
{
  "winner": "VARIANT"
}
```

`winner` values: `ORIGINAL` (keep the original) or `VARIANT` (promote the variant).

---

### 8. Page performance metrics

```bash
# Get analytics for a specific page (7-day window)
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/analytics/v2/breakdown/landing-pages/path/$PAGE_SLUG/total?start=2026-06-01&end=2026-06-08&interval=day&portalId=$PORTAL_ID" \
  | jq '.'
```

For more flexible analytics queries, use the Analytics API v3:

```bash
curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dimensions": ["content"],
    "metrics": ["pageviews", "sessions", "submissions"],
    "filters": {
      "dateRange": {
        "startDate": "2026-06-01",
        "endDate": "2026-06-08"
      }
    }
  }' \
  "https://api.hubapi.com/analytics/v3/reports/custom/total?objectType=LANDING_PAGE" \
  | jq '.results'
```

---

### 9. Delete a landing page

```bash
# Archive (soft delete)
curl -s -X DELETE \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/cms/pages/2026-09/landing-pages/$PAGE_ID"
```

Returns `204 No Content`. Archived pages are excluded from default list results. Pass `?state=ARCHIVED` to include them.

---

## Verification

```bash
# List 5 most recently updated published pages
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/cms/pages/2026-09/landing-pages?limit=5&state=PUBLISHED&sort=-updatedAt" \
  | jq '[.results[] | {id: .id, name: .name, slug: .slug, url: .url}]'

# Get page state after publish
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/cms/pages/2026-09/landing-pages/$PAGE_ID" \
  | jq '{state: .state, publishDate: .publishDate, url: .url}'
```

---

## Failure modes

| Error | Cause | Fix |
|---|---|---|
| `400 BAD_REQUEST` — slug conflict | Another published page has the same slug | Change the slug to a unique value before publishing |
| `400 BAD_REQUEST` — template not found | `templatePath` references a template not in the portal | Verify path using `hs fetch --all` or Design Manager |
| `403 FORBIDDEN` | Token missing `content` scope | Add `content` scope to the service key |
| `404 NOT_FOUND` | Page archived or wrong portal | Check `?state=ARCHIVED`; verify `portalId` and page `id` |
| `push-live` returns 400 | Page has validation errors (empty required modules) | Open page in page editor and resolve validation warnings first |
| Scheduled publish doesn't fire | `publishDate` is in the past, or `currentState` not set | Set `publishDate` to a future ISO 8601 timestamp; confirm `currentState: "SCHEDULED_FOR_PUBLISH"` |
| Clone creates duplicate slug | Clone has same slug as original | After cloning, PATCH the new page with a unique `slug` before publishing |
| A/B variant not visible | Variant is still in DRAFT | Publish the variant via `push-live` before traffic split takes effect |
| Analytics data missing | Page published less than 24 hours ago | Analytics data has a ~24-hour processing delay |

---

## Escalation

- Landing Pages API: https://developers.hubspot.com/docs/api/cms/pages
- Analytics API v3: https://developers.hubspot.com/changelog
- For local template/module editing: see `hubspot-cli` and `hubspot-cms-templates` skills
- For attaching pages to campaigns: see `hubspot-marketing-emails` skill (Campaigns API)
- For forms embedded in landing pages: see `hubspot-forms` skill
- For HubDB-driven dynamic pages: see `hubspot-hubdb` skill
