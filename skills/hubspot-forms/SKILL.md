---
name: hubspot-forms
description: "Build and integrate HubSpot forms — v3 Forms API for CRUD, embed options, non-HubSpot form submissions, dependent fields, GDPR double opt-in, and submission data retrieval"
compatibility: "All Hub tiers (free); Forms API v3; Forms embed JS v2.9+"
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-06-09"
    written_against:
        hubspot-api: "marketing/v3/forms"
---

## When to use

- Creating or managing HubSpot forms programmatically (for portals with many forms or CI/CD-managed configs)
- Submitting data to HubSpot from a non-HubSpot form (standalone web app, mobile app, headless CMS)
- Retrieving form submission data for reporting or downstream processing
- Building forms with dependent fields (conditional field display)
- Implementing GDPR-compliant double opt-in flows
- Embedding HubSpot forms in external pages using the JS embed API

---

## Inputs required

| Input | Source |
|---|---|
| Private App token | `hubspot-private-apps` skill |
| `portalId` / Hub ID | HubSpot portal settings |
| `formId` (GUID) | GET `/marketing/v3/forms` or HubSpot Forms UI |
| Property names for fields | `hubspot-properties-api` skill |
| Subscription type IDs | GET `/communication-preferences/v3/definitions` |

**Scopes:** `forms`, `forms-uploaded-files` (for file-upload fields)

---

## Procedure

### 1. Create a form

```
POST /marketing/v3/forms
```

```json
{
  "name": "Contact Us Form",
  "formType": "hubspot",
  "configuration": {
    "language": "en",
    "cloneable": true,
    "editable": true,
    "archivable": true,
    "recaptchaEnabled": false,
    "notifyContactOwner": true,
    "notifyRecipients": ["sales@acme.example.com"],
    "createNewContactForNewEmail": true,
    "prePopulateKnownValues": true,
    "allowLinkToResetKnownValues": true,
    "shouldHideLoadingSpinner": false
  },
  "displayOptions": {
    "renderRawHtml": false,
    "cssClass": "hs-form",
    "submitButtonText": "Send Message",
    "style": { "fontFamily": "inherit", "backgroundWidth": "100%" }
  },
  "legalConsentOptions": {
    "type": "NONE"
  },
  "fieldGroups": [
    {
      "groupType": "default_group",
      "richTextType": "NONE",
      "fields": [
        {
          "objectTypeId": "0-1",
          "name": "firstname",
          "label": "First Name",
          "required": true,
          "hidden": false,
          "fieldType": "single_line_text",
          "validation": { "blockedEmailAddresses": [] }
        },
        {
          "objectTypeId": "0-1",
          "name": "lastname",
          "label": "Last Name",
          "required": true,
          "hidden": false,
          "fieldType": "single_line_text"
        }
      ]
    },
    {
      "groupType": "default_group",
      "richTextType": "NONE",
      "fields": [
        {
          "objectTypeId": "0-1",
          "name": "email",
          "label": "Email Address",
          "required": true,
          "hidden": false,
          "fieldType": "email"
        }
      ]
    }
  ]
}
```

Response includes the form's `id` (GUID) — save it.

---

### 2. Field types

| `fieldType` | Property type | Notes |
|---|---|---|
| `single_line_text` | `string` | Single-line text input |
| `multi_line_text` | `string` | Textarea |
| `email` | `string` | Email validation enforced |
| `phone_number` | `phone_number` | Phone validation |
| `number` | `number` | Numeric input |
| `dropdown` | `enumeration` | Select / dropdown |
| `radio` | `enumeration` | Radio buttons |
| `checkbox` | `enumeration` | Multi-select checkboxes |
| `boolean_checkbox` | `bool` | Single agree/disagree checkbox |
| `date` | `date` | Date picker |
| `file` | `string` | File upload (requires `forms-uploaded-files` scope) |
| `html` | n/a | Rich text display (not an input field; `richTextType: "CUSTOM"`) |

---

### 3. Dependent fields (conditional display)

Show or hide fields based on the value of another field. Add a `dependentFieldFilters` array to the controlling field:

```json
{
  "objectTypeId": "0-1",
  "name": "job_function",
  "label": "Job Function",
  "fieldType": "dropdown",
  "options": [
    { "label": "Sales",     "value": "sales",     "displayOrder": 0 },
    { "label": "Marketing", "value": "marketing", "displayOrder": 1 },
    { "label": "Other",     "value": "other",     "displayOrder": 2 }
  ],
  "dependentFieldFilters": [
    {
      "filters": [
        { "operator": "EQ", "strValue": "sales", "fieldName": "job_function" }
      ],
      "dependentFormField": {
        "objectTypeId": "0-1",
        "name": "num_employees",
        "label": "Team Size",
        "fieldType": "number",
        "required": false,
        "hidden": false
      },
      "formFieldAction": "DISPLAY"
    }
  ]
}
```

`formFieldAction` values: `DISPLAY` (show the dependent field when condition is met) or `REQUIRE` (show and mark required).

Filters use: `EQ`, `NEQ`, `CONTAINS`, `NOT_CONTAINS`, `STARTS_WITH`, `END_WITH`, `IS_KNOWN`, `IS_UNKNOWN`.

---

### 4. GDPR / double opt-in

#### Explicit consent checkbox

```json
{
  "legalConsentOptions": {
    "type": "EXPLICIT_CONSENT_WITH_OPT_IN",
    "checkboxes": [
      {
        "label": "I agree to receive marketing communications from Acme Corp",
        "required": true,
        "subscriptionTypeIds": [7889678]
      }
    ],
    "privacyPolicyText": "By submitting this form, you agree to our <a href=\"/privacy\">Privacy Policy</a>.",
    "isLegitimateInterest": false
  }
}
```

#### Legitimate interest (no checkbox — legal basis is implicit)

```json
{
  "legalConsentOptions": {
    "type": "LEGITIMATE_INTEREST",
    "subscriptionTypeIds": [7889678],
    "lawfulBasis": "LEGITIMATE_INTEREST_PQL",
    "privacyPolicyText": "We'll use your info to follow up — see our <a href=\"/privacy\">Privacy Policy</a>."
  }
}
```

`type` values: `NONE`, `EXPLICIT_CONSENT_WITH_OPT_IN`, `LEGITIMATE_INTEREST`, `COMMUNICATION_CONSENT`

---

### 5. Embed a form on an external page

#### Option A: HubSpot JavaScript embed (recommended for non-HubSpot pages)

```html
<script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/embed/v2.js"></script>
<script>
  hbspt.forms.create({
    region: "na1",
    portalId: "12345678",
    formId: "abc123de-0000-0000-0000-ffffffffffff",
    onFormSubmit: function($form) {
      console.log('Form submitted');
    },
    onFormSubmitted: function($form, data) {
      console.log('Submission accepted', data);
    }
  });
</script>
```

`region` values: `na1` (North America), `eu1` (Europe), `na2`.

#### Option B: iFrame embed

```html
<iframe
  src="https://share.hsforms.com/{formId}"
  width="100%"
  height="600"
  frameborder="0">
</iframe>
```

---

### 6. Submit to a form from a non-HubSpot page (server-side or headless)

Use the Forms v3 submission endpoint to push data into HubSpot from any source without rendering the HubSpot embed JS.

```
POST https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formId}
```

This endpoint uses **no auth token** — it is a public endpoint that mirrors what the browser SDK sends. Rate limit: 50 req/s.

```json
{
  "fields": [
    { "objectTypeId": "0-1", "name": "email",     "value": "alice@example.com" },
    { "objectTypeId": "0-1", "name": "firstname",  "value": "Alice" },
    { "objectTypeId": "0-1", "name": "lastname",   "value": "Smith" },
    { "objectTypeId": "0-1", "name": "phone",      "value": "+15555550100" }
  ],
  "context": {
    "hutk": "hubspotutk_cookie_value",
    "pageUri": "https://acme.example.com/contact",
    "pageName": "Contact Us",
    "ipAddress": "203.0.113.42"
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
}
```

**`context.hutk`** — the value of the `hubspotutk` cookie from the visitor's browser. Include when available to associate the submission with an existing contact activity session and enable analytics attribution.

Response (`200 OK`):

```json
{ "inlineMessage": "Thanks for submitting the form." }
```

---

### 7. Retrieve form submissions

```
GET /form-integrations/v1/submissions/forms/{formId}?limit=50&after=<cursor>
```

```bash
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubspot.com/form-integrations/v1/submissions/forms/$FORM_ID?limit=10" \
  | jq '[.results[] | {submittedAt: .submittedAt, values: [.values[] | {name: .name, value: .value}]}]'
```

Results are returned in reverse chronological order (newest first). Each submission includes a `values` array of `{name, value, objectTypeId}` objects.

---

### 8. Archive a form

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/marketing/v3/forms/$FORM_ID"
```

Archived forms stop accepting new submissions. Existing submission data is preserved.

---

## Verification

```bash
# List forms in the portal
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/marketing/v3/forms?limit=5" \
  | jq '[.results[] | {id: .id, name: .name}]'

# Get a specific form
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/marketing/v3/forms/$FORM_ID" \
  | jq '{id: .id, name: .name, fields: [.fieldGroups[].fields[].name]}'

# Test submission (no auth needed)
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"fields":[{"objectTypeId":"0-1","name":"email","value":"test@example.com"},{"objectTypeId":"0-1","name":"firstname","value":"Test"}]}' \
  "https://api.hsforms.com/submissions/v3/integration/submit/$PORTAL_ID/$FORM_ID"
```

---

## Failure modes

| Error | Cause | Fix |
|---|---|---|
| `400 BAD_REQUEST` on form create | Required field missing or wrong `fieldType` | Check that `objectTypeId`, `name`, and `fieldType` are all present |
| `400` on submission — unknown property | `name` does not match a portal property | Verify property internal name via Properties API |
| Submission accepted but no contact created | Email field missing or blank | Ensure `email` field is included and non-empty |
| `429` on submission endpoint | > 50 submissions/second | Rate limit submissions; use batch imports for bulk loads |
| Dependent field not showing | `formFieldAction: "DISPLAY"` but field is also in `fieldGroups` | Dependent fields should only appear in `dependentFormField` — not in the top-level `fieldGroups` array |
| GDPR checkbox rejected | Subscription type ID not found | List subscription types from `/communication-preferences/v3/definitions` |
| Double opt-in email not sent | `type` is `EXPLICIT_CONSENT_WITH_OPT_IN` but portal opt-in not configured | Enable double opt-in in HubSpot portal email settings |
| `hutk` not associating session | Cookie value stale or from different domain | Only pass `hutk` when the user just loaded the page in the same session |
| File upload field rejected | Missing `forms-uploaded-files` scope | Add scope to the private app |

---

## Escalation

- Forms API v3: https://developers.hubspot.com/docs/api/marketing/forms
- Form submission API: https://legacydocs.hubspot.com/docs/methods/forms/submit_form_v3
- Communication Preferences (subscription types): https://developers.hubspot.com/docs/api/marketing/subscriptions-preferences
- For triggering emails after form submission: see `hubspot-marketing-emails` skill
- For landing pages that contain forms: see `hubspot-landing-pages-api` skill
- For contact property names: see `hubspot-properties-api` skill
