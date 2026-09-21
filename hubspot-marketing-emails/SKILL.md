---
name: hubspot-marketing-emails
description: "Send and manage HubSpot marketing and transactional emails — Marketing Email API, Single Send (Transactional) API, email templates, token personalization, subscription types, GDPR opt-in/out, and Campaigns API"
compatibility: "Marketing Hub Starter+ for marketing emails; Marketing Hub Professional+ or Transactional Email add-on for single-send transactional; Marketing emails, transactional and campaigns APIs on 2026-09"
license: MIT
metadata:
    author: georgestephanis
    version: "1.1"
    written: "2026-09-21"
    written_against:
        hubspot-api: "2026-09"
---

## When to use

- **Marketing emails** — bulk sends to lists (newsletters, promotions, nurture sequences) managed via HubSpot's email tool
- **Transactional emails** — one-to-one triggered sends (order confirmations, password resets, receipts) via the Single Send API
- Reading or updating marketing email drafts and stats via the Marketing Email API
- Building Campaigns and attaching emails to them for unified reporting
- Personalizing email content with contact tokens
- Managing subscription types and GDPR double opt-in flows

**Deciding between marketing and transactional:**

| | Marketing Email | Transactional Email |
|---|---|---|
| Use case | Bulk/promotional sends to lists | 1:1 triggered by user action |
| Opt-out | Subject to subscription preferences | Bypasses subscription opt-outs |
| Requires | Marketing Hub Starter+ | Transactional Email add-on |
| API | Marketing Email API | Single Send API |
| Rate | Standard send-rate limits | 10 req/s, 500k sends/day |

---

## Inputs required

| Input | Source |
|---|---|
| Account service key | `hubspot-private-apps` skill |
| Email content or template | HubSpot Design Tools or Marketing Emails UI |
| `emailId` (for marketing sends) | GET `/marketing/emails/2026-09` |
| `contactEmail` or `contactId` (for single sends) | CRM contact record |
| Subscription type ID (for single sends) | GET `/communication-preferences/2026-09/definitions` |
| Campaign ID (optional) | GET `/marketing/campaigns/2026-09` |

**Scopes required:**
- Marketing emails: `content`
- Single Send / Transactional: `transactional-email`
- Campaigns: `content`

---

## Procedure

### 1. Marketing Email API — read and manage email drafts

#### List marketing emails

```bash
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/marketing/emails/2026-09?limit=20&state=DRAFT" \
  | jq '[.results[] | {id: .id, name: .name, state: .state, subject: .subject}]'
```

**`state` filter values:** `DRAFT`, `SCHEDULED`, `PROCESSING`, `SENT`, `ERROR`, `AUTOMATED`

#### Get a single email (with stats)

```bash
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/marketing/emails/2026-09/$EMAIL_ID?includeStats=true" \
  | jq '{id: .id, subject: .subject, stats: .stats}'
```

#### Create a marketing email

```bash
curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "June Newsletter",
    "subject": "What'"'"'s new this month",
    "fromName": "Acme Team",
    "replyTo": "hello@acme.example.com",
    "type": "REGULAR_EMAIL",
    "content": {
      "body": "<h1>Hello {{ contact.firstname }}!</h1><p>Here is your update.</p>"
    }
  }' \
  "https://api.hubapi.com/marketing/emails/2026-09"
```

**`type` values:** `REGULAR_EMAIL`, `AUTOMATED_EMAIL`, `BLOG_EMAIL`, `RSS_EMAIL`, `OPTIN_EMAIL`, `OPTIN_FOLLOWUP_EMAIL`, `BATCHEMAIL`

---

### 2. Sending a single-send (transactional) email

The Single Send API is for programmatic 1:1 triggered sends. The recipient must be an existing contact in HubSpot (or will be created on send).

```
POST /marketing/transactional/2026-09/single-email/send
```

```json
{
  "emailId": 123456789,
  "message": {
    "to": "alice@example.com",
    "replyTo": "support@acme.example.com",
    "cc": [],
    "bcc": []
  },
  "contactProperties": {
    "firstname": "Alice",
    "company": "Acme Corp"
  },
  "customProperties": [
    { "name": "order_id",    "value": "ORD-9876" },
    { "name": "order_total", "value": "$149.00" }
  ]
}
```

`contactProperties` are written to the contact record in HubSpot. `customProperties` are available as tokens in the email template but are NOT persisted to the contact.

Response (`200 OK`):

```json
{
  "sendResult": "SENT",
  "statusId": "be70c2f9-5c04-40e3-a49a-d24fd2e9d66b",
  "completedAt": "2026-06-09T12:00:00.000Z"
}
```

`sendResult` values: `SENT`, `QUEUED`, `INVALID_TO_ADDRESS`, `PREVIOUSLY_UNSUBSCRIBED`, `INVALID_EMAIL_ID`, `EMAIL_DISABLED`, `PORTAL_SUSPENDED`, `BLOCKED_DOMAIN`, `LIMIT_HIT`, `NOT_OWNER`, `UNSUBSCRIBED_ADDRESS`, `PORTAL_OVER_LIMIT`, `IN_BLACKLIST`, `USER_ERROR`, `SYSTEM_ERROR`

Check `sendResult` — a `200` status does NOT guarantee delivery.

---

### 3. Email template personalization tokens

Templates in HubSpot use HubL syntax for contact personalization:

```html
<!-- Standard contact properties -->
<p>Hi {{ contact.firstname | default: "there" }},</p>
<p>Your plan: {{ contact.hubspot_owner_id }}</p>

<!-- Custom contact properties -->
<p>Account tier: {{ contact.account_tier }}</p>

<!-- Custom properties sent in the Single Send API -->
<p>Order #{{ custom.order_id }} — Total: {{ custom.order_total }}</p>

<!-- Company properties (when contact is associated to a company) -->
<p>Company: {{ company.name }}</p>

<!-- Unsubscribe link — required in marketing emails -->
<a href="{{ unsubscribe_link }}">Unsubscribe</a>
```

**Token fallback syntax:** `{{ token | default: "fallback text" }}`

Transactional emails populated via `customProperties` in the Single Send API use `custom.property_name` as the token namespace.

---

### 4. Subscription types

Subscription types control what marketing emails a contact opts in or out of.

#### List all subscription types

```bash
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/communication-preferences/2026-09/definitions" \
  | jq '[.subscriptionDefinitions[] | {id: .id, name: .name, description: .description}]'
```

#### Get a contact's subscription status

```bash
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/communication-preferences/2026-09/status/email/alice@example.com" \
  | jq '.subscriptionStatuses'
```

#### Subscribe a contact

```bash
curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emailAddress": "alice@example.com",
    "subscriptionId": "7889678",
    "legalBasis": "LEGITIMATE_INTEREST_PQL",
    "legalBasisExplanation": "Contact filled out a demo request form"
  }' \
  "https://api.hubapi.com/communication-preferences/2026-09/subscribe"
```

#### Unsubscribe (opt out) a contact

```bash
curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emailAddress": "alice@example.com",
    "subscriptionId": "7889678",
    "legalBasis": "CONSENT_WITH_NOTICE",
    "legalBasisExplanation": "Contact clicked unsubscribe link"
  }' \
  "https://api.hubapi.com/communication-preferences/2026-09/unsubscribe"
```

**`legalBasis` values for GDPR portals:**

| Value | When to use |
|---|---|
| `LEGITIMATE_INTEREST_PQL` | Contact is a prospect / product-qualified lead |
| `LEGITIMATE_INTEREST_CLIENT` | Existing customer relationship |
| `PERFORMANCE_OF_CONTRACT` | Required by contract (transactional) |
| `CONSENT_WITH_NOTICE` | Explicit opt-in with clear consent |
| `NON_GDPR` | Portal not subject to GDPR |

---

### 5. GDPR opt-in handling

For GDPR-enabled portals, contacts require both an opt-in and a legal basis before receiving marketing emails.

```bash
# Write GDPR consent when creating a contact
curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "email": "alice@example.com",
      "firstname": "Alice"
    },
    "legalConsentOptions": {
      "consent": {
        "consentToProcess": true,
        "text": "I agree to the privacy policy",
        "communications": [
          {
            "value": true,
            "subscriptionTypeId": 7889678,
            "text": "I agree to receive marketing emails"
          }
        ]
      }
    }
  }' \
  "https://api.hubapi.com/crm/objects/2026-09/contacts"
```

Transactional emails (Single Send API) with `sendResult: SENT` bypass subscription opt-outs by design, but the contact must not have been GDPR-deleted.

---

### 6. Campaigns API

Campaigns group related marketing assets (emails, landing pages, social posts) for unified attribution reporting.

#### Create a campaign

```bash
curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer 2026 Promotion",
    "startDate": "2026-06-01",
    "endDate": "2026-08-31",
    "currencyCode": "USD",
    "budget": {
      "total": {
        "amount": 5000,
        "currencyCode": "USD"
      }
    }
  }' \
  "https://api.hubapi.com/marketing/campaigns/2026-09"
```

#### List campaigns

```bash
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/marketing/campaigns/2026-09?limit=20" \
  | jq '[.results[] | {id: .id, name: .name, startDate: .startDate}]'
```

#### Attach an email to a campaign

```bash
curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetType": "EMAIL",
    "assetId": "'$EMAIL_ID'"
  }' \
  "https://api.hubapi.com/marketing/campaigns/2026-09/$CAMPAIGN_ID/assets"
```

`assetType` options: `EMAIL`, `LANDING_PAGE`, `BLOG_POST`, `SOCIAL_POST`, `AD`, `CTA`, `FORM`

---

## Verification

```bash
# Confirm a marketing email exists
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/marketing/emails/2026-09/$EMAIL_ID" \
  | jq '{id: .id, subject: .subject, state: .state}'

# Test single send to yourself (use your own email address)
curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"emailId\": $EMAIL_ID,
    \"message\": { \"to\": \"you@example.com\" }
  }" \
  "https://api.hubapi.com/marketing/transactional/2026-09/single-email/send" \
  | jq '{sendResult: .sendResult, statusId: .statusId}'

# Check contact subscription status
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/communication-preferences/2026-09/status/email/you@example.com" \
  | jq '[.subscriptionStatuses[] | {name: .name, status: .status}]'
```

---

## Failure modes

| Error | Cause | Fix |
|---|---|---|
| `403 FORBIDDEN` on single send | Missing `transactional-email` scope or add-on not purchased | Add scope; verify Transactional Email add-on is active |
| `sendResult: PREVIOUSLY_UNSUBSCRIBED` | Contact opted out of that subscription type | Check subscription status; do not re-subscribe without explicit consent |
| `sendResult: INVALID_EMAIL_ID` | Email is in wrong state (DRAFT, not published) | Publish the email in HubSpot before using it in Single Send API |
| `sendResult: BLOCKED_DOMAIN` | Recipient domain is on HubSpot's block list | Use a different test email or contact HubSpot support |
| `400 VALIDATION_ERROR` on campaigns | `startDate` format wrong | Use `"YYYY-MM-DD"` strings |
| Token renders as blank in email | Contact property is empty and no `default` fallback | Add `| default: "value"` to the token |
| GDPR portal rejects send | Legal basis not recorded for contact | Create/update contact with `legalConsentOptions` on the contact create call |
| `sendResult: LIMIT_HIT` | Daily or per-second rate limit exceeded | Back off; Single Send max is 10 req/s and 500k/day |
| Campaign asset attach returns 404 | Wrong `assetType` or asset ID | Confirm the email ID and use `EMAIL` (uppercase) as assetType |

---

## Escalation

- Marketing Email API: https://developers.hubspot.com/docs/api/marketing/marketing-emails
- Single Send (Transactional): https://developers.hubspot.com/docs/guides/api/marketing/emails/transactional-emails
- Subscription Types & Preferences: https://developers.hubspot.com/docs/guides/api/marketing/subscriptions-preferences
- Campaigns API: https://developers.hubspot.com/docs/api/marketing/campaigns
- For contact creation with GDPR consent: see `hubspot-crm-objects` skill
- For landing page management: see `hubspot-landing-pages-api` skill
- For form submissions that trigger sends: see `hubspot-forms` skill
