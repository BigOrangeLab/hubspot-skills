# HubSpot Skills TODO

---

## CRM APIs

### `hubspot-associations-v4`
Model and traverse relationships between CRM objects.
- Associations v4 API endpoints
- `toObjectId` + `associationTypeId` parameters
- Default vs. custom association types
- Linking deals ↔ contacts ↔ companies
- Association limits (250k per object type as of Nov 2025)
- Paginating association results
- Unlabeled associations and schema API

### `hubspot-custom-objects`
Define and use custom CRM object schemas.
- Schemas API: create object type, define properties and display property
- Setting searchable properties and required-to-create properties
- Creating records of custom object type
- Using `p_*` wildcard in UI extensions
- Object definition pages (Beta) for schema introspection
- Property validation rules (API-level)

### `hubspot-properties-api`
Create and manage CRM properties at scale.
- Property types: string, number, date, datetime, enumeration, boolean, phone_number
- Creating/updating/archiving properties via API
- Property groups
- Internal name vs. label
- Unique identifier properties
- Decimal support for unformatted number fields (2026)

---

## Marketing

### `hubspot-marketing-emails`
Send and manage marketing emails via API.
- Marketing Email API vs. Transactional Email API
- Creating email templates programmatically
- Sending single-send / batch emails
- Email token personalization
- Subscription types and GDPR opt-in
- Campaigns API (`/marketing/v3/campaigns/`)

### `hubspot-forms`
Embed and process HubSpot forms.
- Forms API v3: create, update, read
- Embed options: JS embed, iFrame, inline
- New HubSpot forms embeddable on CMS pages (2025)
- Form submission API and custom submit handling
- GDPR fields and consent tracking
- Dependent fields and form logic

### `hubspot-landing-pages-api`
Create and publish landing pages via API.
- Pages API endpoints
- Template assignment
- A/B test configuration
- Slug and domain management
- SEO metadata fields
- Publishing and scheduling

---

## Operations / Integrations

### `hubspot-data-sync`
Sync data between HubSpot and external systems reliably.
- Operations Hub Data Sync feature overview
- Custom sync mapping with the Data Sync API
- Conflict resolution strategies
- Field mapping and transformation
- Handling deletions and archiving

### `hubspot-imports-exports`
Bulk import and export CRM data.
- Imports API: file upload, column mapping, error handling
- Async import job polling
- Exports API: generate and download exports
- Dedupe strategies on import
- Note: bulk imports do not trigger webhooks — reconciliation needed

---

## Tooling

---

## Prioritization Notes

**Build when needed:**
- Remaining marketing, operations, and specialized skills
