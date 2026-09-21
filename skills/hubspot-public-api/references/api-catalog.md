# HubSpot Public API Endpoint Catalog

Generated from the OpenAPI 3.0 specs in the `HubSpot/public-api-spec-collection` repository.
Base URL for all endpoints: `https://api.hubapi.com`

---

## Auth

### OAuth (2026-09)
- `POST /oauth/2026-09/token` — Exchange code or refresh token
- `POST /oauth/2026-09/token/introspect` — Inspect a token
- `POST /oauth/2026-09/token/revoke` — Revoke a token

---

## CRM — Core Objects

All core objects follow the same CRUD + batch + search pattern. See SKILL.md §2 for the template.

### Contacts (2026-09)
- `GET /crm/objects/2026-09/contacts` — List contacts
- `POST /crm/objects/2026-09/contacts` — Create a contact
- `GET /crm/objects/2026-09/contacts/{contactId}` — Read a contact
- `PATCH /crm/objects/2026-09/contacts/{contactId}` — Update a contact
- `DELETE /crm/objects/2026-09/contacts/{contactId}` — Archive a contact
- `POST /crm/objects/2026-09/contacts/search` — Search contacts
- `POST /crm/objects/2026-09/contacts/merge` — Merge two contacts
- `POST /crm/objects/2026-09/contacts/gdpr-delete` — Permanently delete (GDPR)
- `POST /crm/objects/2026-09/contacts/batch/create`
- `POST /crm/objects/2026-09/contacts/batch/read`
- `POST /crm/objects/2026-09/contacts/batch/update`
- `POST /crm/objects/2026-09/contacts/batch/upsert`
- `POST /crm/objects/2026-09/contacts/batch/archive`

### Companies (2026-09)
- `GET /crm/objects/2026-09/companies` — List companies
- `POST /crm/objects/2026-09/companies` — Create a company
- `GET /crm/objects/2026-09/companies/{companyId}` — Read a company
- `PATCH /crm/objects/2026-09/companies/{companyId}` — Update a company
- `DELETE /crm/objects/2026-09/companies/{companyId}` — Archive a company
- `POST /crm/objects/2026-09/companies/search` — Search companies
- `POST /crm/objects/2026-09/companies/merge` — Merge two companies
- `POST /crm/objects/2026-09/companies/batch/create`
- `POST /crm/objects/2026-09/companies/batch/read`
- `POST /crm/objects/2026-09/companies/batch/update`
- `POST /crm/objects/2026-09/companies/batch/upsert`
- `POST /crm/objects/2026-09/companies/batch/archive`

### Deals (2026-09)
- `GET /crm/objects/2026-09/0-3` — List deals
- `POST /crm/objects/2026-09/0-3` — Create a deal
- `GET /crm/objects/2026-09/0-3/{dealId}` — Read a deal
- `PATCH /crm/objects/2026-09/0-3/{dealId}` — Update a deal
- `DELETE /crm/objects/2026-09/0-3/{dealId}` — Archive a deal
- `POST /crm/objects/2026-09/0-3/search` — Search deals
- `POST /crm/objects/2026-09/0-3/merge` — Merge two deals
- `POST /crm/objects/2026-09/0-3/batch/create`
- `POST /crm/objects/2026-09/0-3/batch/read`
- `POST /crm/objects/2026-09/0-3/batch/update`
- `POST /crm/objects/2026-09/0-3/batch/upsert`
- `POST /crm/objects/2026-09/0-3/batch/archive`

### Tickets (2026-09)
- `GET /crm/objects/2026-09/tickets` — List tickets
- `POST /crm/objects/2026-09/tickets` — Create a ticket
- `GET /crm/objects/2026-09/tickets/{ticketId}` — Read a ticket
- `PATCH /crm/objects/2026-09/tickets/{ticketId}` — Update a ticket
- `DELETE /crm/objects/2026-09/tickets/{ticketId}` — Archive a ticket
- `POST /crm/objects/2026-09/tickets/search` — Search tickets
- `POST /crm/objects/2026-09/tickets/merge`
- `POST /crm/objects/2026-09/tickets/batch/create`
- `POST /crm/objects/2026-09/tickets/batch/read`
- `POST /crm/objects/2026-09/tickets/batch/update`
- `POST /crm/objects/2026-09/tickets/batch/upsert`
- `POST /crm/objects/2026-09/tickets/batch/archive`

### Leads (2026-09)
- `GET /crm/objects/2026-09/leads` — List leads
- `POST /crm/objects/2026-09/leads` — Create a lead
- `GET /crm/objects/2026-09/leads/{leadsId}` — Read a lead
- `PATCH /crm/objects/2026-09/leads/{leadsId}` — Update a lead
- `DELETE /crm/objects/2026-09/leads/{leadsId}` — Archive a lead
- `POST /crm/objects/2026-09/leads/search` — Search leads
- `POST /crm/objects/2026-09/leads/batch/create`
- `POST /crm/objects/2026-09/leads/batch/read`
- `POST /crm/objects/2026-09/leads/batch/update`
- `POST /crm/objects/2026-09/leads/batch/upsert`
- `POST /crm/objects/2026-09/leads/batch/archive`

### Generic Objects API (2026-09) — use for custom objects or any objectType
- `GET /crm/objects/2026-09/{objectType}` — List
- `POST /crm/objects/2026-09/{objectType}` — Create
- `GET /crm/objects/2026-09/{objectType}/{objectId}` — Read
- `PATCH /crm/objects/2026-09/{objectType}/{objectId}` — Update
- `DELETE /crm/objects/2026-09/{objectType}/{objectId}` — Archive
- `POST /crm/objects/2026-09/{objectType}/search`
- `POST /crm/objects/2026-09/{objectType}/batch/create`
- `POST /crm/objects/2026-09/{objectType}/batch/read`
- `POST /crm/objects/2026-09/{objectType}/batch/update`
- `POST /crm/objects/2026-09/{objectType}/batch/upsert`
- `POST /crm/objects/2026-09/{objectType}/batch/archive`

---

## CRM — Commerce Objects

All follow the same CRUD + batch + search pattern with their respective `{objectType}` slug.

| Object | slug |
|---|---|
| Products | `products` |
| Line Items | `line_items` |
| Quotes | `quotes` |
| Orders | `orders` |
| Invoices | `invoices` |
| Carts | `carts` |
| Payments | `payments` |
| Commerce Payments | `commerce_payments` |
| Commerce Subscriptions | `subscriptions` |
| Discounts | `discounts` |
| Fees | `fees` |
| Taxes | `taxes` |

Each supports the full CRUD + batch + search pattern at `/crm/objects/2026-09/{slug}/…`.

---

## CRM — Activity Objects

All follow the CRUD + batch + search pattern.

| Object | slug |
|---|---|
| Calls | `calls` |
| Emails | `emails` |
| Meetings | `meetings` |
| Notes | `notes` |
| Tasks | `tasks` |
| Communications (SMS/WhatsApp) | `communications` |
| Postal Mail | `postal_mail` |

---

## CRM — Schema & Structure

### Properties (2026-09)
- `GET /crm/properties/2026-09/{objectType}` — List all properties
- `POST /crm/properties/2026-09/{objectType}` — Create a property
- `GET /crm/properties/2026-09/{objectType}/{propertyName}` — Read a property
- `PATCH /crm/properties/2026-09/{objectType}/{propertyName}` — Update a property
- `DELETE /crm/properties/2026-09/{objectType}/{propertyName}` — Archive a property
- `POST /crm/properties/2026-09/{objectType}/batch/read` — Batch read properties
- `POST /crm/properties/2026-09/{objectType}/batch/create` — Batch create properties
- `POST /crm/properties/2026-09/{objectType}/batch/archive` — Batch archive properties
- `GET /crm/properties/2026-09/{objectType}/groups` — List property groups
- `POST /crm/properties/2026-09/{objectType}/groups` — Create a property group
- `GET /crm/properties/2026-09/{objectType}/groups/{groupName}` — Read a property group
- `PATCH /crm/properties/2026-09/{objectType}/groups/{groupName}` — Update a property group
- `DELETE /crm/properties/2026-09/{objectType}/groups/{groupName}` — Archive a property group

### Custom Object Schemas (2026-09)
- `GET /crm-object-schemas/2026-09/schemas` — List all custom schemas
- `POST /crm-object-schemas/2026-09/schemas` — Create a schema
- `POST /crm-object-schemas/2026-09/schemas/batch/read` — Batch read schemas
- `GET /crm-object-schemas/2026-09/schemas/{objectType}` — Read a schema
- `PATCH /crm-object-schemas/2026-09/schemas/{objectType}` — Update a schema
- `DELETE /crm-object-schemas/2026-09/schemas/{objectType}` — Delete a schema
- `POST /crm-object-schemas/2026-09/schemas/{objectType}/associations` — Create association definition
- `DELETE /crm-object-schemas/2026-09/schemas/{objectType}/associations/{associationIdentifier}`

### Associations (2026-09)
- `POST /crm/associations/2026-09/{fromObjectType}/{toObjectType}/batch/read` — Read associations
- `POST /crm/associations/2026-09/{fromObjectType}/{toObjectType}/batch/create` — Create associations
- `POST /crm/associations/2026-09/{fromObjectType}/{toObjectType}/batch/archive` — Remove associations
- `GET /crm/associations/2026-09/{fromObjectType}/{toObjectType}/labels` — List association labels (was `/types` on v3)
- `GET /crm/objects/2026-09/{objectType}/{objectId}/associations/{toObjectType}` — Read one record's associations

### Pipelines (2026-09)
- `GET /crm/pipelines/2026-09/{objectType}` — List pipelines
- `POST /crm/pipelines/2026-09/{objectType}` — Create a pipeline
- `GET /crm/pipelines/2026-09/{objectType}/{pipelineId}` — Read a pipeline
- `PUT /crm/pipelines/2026-09/{objectType}/{pipelineId}` — Replace a pipeline
- `PATCH /crm/pipelines/2026-09/{objectType}/{pipelineId}` — Update a pipeline
- `DELETE /crm/pipelines/2026-09/{objectType}/{pipelineId}` — Delete a pipeline
- `GET /crm/pipelines/2026-09/{objectType}/{pipelineId}/audit` — Pipeline audit log
- `GET /crm/pipelines/2026-09/{objectType}/{pipelineId}/stages` — List stages
- `POST /crm/pipelines/2026-09/{objectType}/{pipelineId}/stages` — Create a stage
- `GET /crm/pipelines/2026-09/{objectType}/{pipelineId}/stages/{stageId}` — Read a stage
- `PUT /crm/pipelines/2026-09/{objectType}/{pipelineId}/stages/{stageId}` — Replace a stage
- `PATCH /crm/pipelines/2026-09/{objectType}/{pipelineId}/stages/{stageId}` — Update a stage
- `DELETE /crm/pipelines/2026-09/{objectType}/{pipelineId}/stages/{stageId}` — Delete a stage
- `GET /crm/pipelines/2026-09/{objectType}/{pipelineId}/stages/{stageId}/audit`

### Owners (2026-09)
- `GET /crm/owners/2026-09` — List owners
- `GET /crm/owners/2026-09/{ownerId}` — Read a specific owner

---

## CRM — Lists, Import/Export

### Lists (2026-09)
- `GET /crm/lists/2026-09` — List all lists
- `POST /crm/lists/2026-09` — Create a list
- `GET /crm/lists/2026-09/{listId}` — Fetch list by ID
- `DELETE /crm/lists/2026-09/{listId}` — Delete a list
- `PUT /crm/lists/2026-09/{listId}/restore` — Restore a deleted list
- `PUT /crm/lists/2026-09/{listId}/update-list-filters` — Update filter definition
- `PUT /crm/lists/2026-09/{listId}/update-list-name` — Rename a list
- `GET /crm/lists/2026-09/{listId}/memberships` — List memberships (ordered by ID)
- `GET /crm/lists/2026-09/{listId}/memberships/join-order` — List memberships (ordered by join date)
- `PUT /crm/lists/2026-09/{listId}/memberships/add` — Add records to list
- `PUT /crm/lists/2026-09/{listId}/memberships/remove` — Remove records from list
- `PUT /crm/lists/2026-09/{listId}/memberships/add-and-remove` — Add and remove in one call
- `PUT /crm/lists/2026-09/{listId}/memberships/add-from/{sourceListId}` — Copy all from another list
- `DELETE /crm/lists/2026-09/{listId}/memberships` — Remove all records from list
- `POST /crm/lists/2026-09/search` — Search lists
- `GET /crm/lists/2026-09/object-type-id/{objectTypeId}/name/{listName}` — Find list by name
- `GET /crm/lists/2026-09/records/{objectTypeId}/{recordId}/memberships` — Lists a record belongs to
- `GET /crm/lists/2026-09/folders` — List folders
- `POST /crm/lists/2026-09/folders` — Create folder
- `DELETE /crm/lists/2026-09/folders/{folderId}` — Delete folder
- `PUT /crm/lists/2026-09/folders/{folderId}/move/{newParentFolderId}` — Move folder
- `PUT /crm/lists/2026-09/folders/{folderId}/rename` — Rename folder
- `PUT /crm/lists/2026-09/folders/move-list` — Move list to folder
- `GET /crm/lists/2026-09/idmapping` — Translate legacy list ID
- `POST /crm/lists/2026-09/idmapping` — Batch translate legacy list IDs

### Imports (2026-09)
- `GET /crm/imports/2026-09` — List imports
- `POST /crm/imports/2026-09` — Start an import (multipart form with CSV)
- `GET /crm/imports/2026-09/{importId}` — Get import status
- `POST /crm/imports/2026-09/{importId}/cancel` — Cancel an import
- `GET /crm/imports/2026-09/{importId}/errors` — Get import errors

### Exports (2026-09)
- `POST /crm/exports/2026-09/export/async` — Start an export
- `GET /crm/exports/2026-09/export/async/tasks/{taskId}/status` — Poll export status (returns download URL)
- `GET /crm/exports/2026-09/export/{exportId}` — Get export details

---

## CRM — Extensions & Misc

### Timeline Events (2026-09)
- `POST /integrators/timeline/2026-09/events` — Create a single timeline event
- `POST /integrators/timeline/2026-09/events/batch/create` — Create multiple events
- `GET /integrators/timeline/2026-09/events/{eventTemplateId}/{eventId}` — Get event instance
- `GET /integrators/timeline/2026-09/{appId}/event-templates` — List event templates
- `POST /integrators/timeline/2026-09/{appId}/event-templates` — Create event template
- `GET /integrators/timeline/2026-09/{appId}/event-templates/{eventTemplateId}` — Read template
- `PUT /integrators/timeline/2026-09/{appId}/event-templates/{eventTemplateId}` — Update template
- `DELETE /integrators/timeline/2026-09/{appId}/event-templates/{eventTemplateId}` — Delete template
- `POST /integrators/timeline/2026-09/{appId}/event-templates/{eventTemplateId}/tokens` — Add tokens
- `PUT /integrators/timeline/2026-09/{appId}/event-templates/{eventTemplateId}/tokens/{tokenName}` — Update token
- `DELETE /integrators/timeline/2026-09/{appId}/event-templates/{eventTemplateId}/tokens/{tokenName}` — Delete token

### Feedback Submissions (2026-09)
- `GET /crm/objects/2026-09/feedback_submissions` — List
- `GET /crm/objects/2026-09/feedback_submissions/{feedbackSubmissionId}` — Read
- `POST /crm/objects/2026-09/feedback_submissions/batch/read`
- `POST /crm/objects/2026-09/feedback_submissions/search`

### Goal Targets (2026-09)
Full CRUD + batch + search at `/crm/objects/2026-09/goal_targets/…`

### Forecasts (2026-09)
- `GET /crm/objects/2026-09/{objectType}` — List forecasts
- `GET /crm/objects/2026-09/{objectType}/{objectId}` — Read a forecast

### Deal Splits (2026-09)
Endpoint under `/crm/objects/2026-09/deal_splits/…` (full CRUD + batch)

---

## CMS

### HubDB (2026-09)
- `GET /cms/hubdb/2026-09/tables` — List published tables
- `POST /cms/hubdb/2026-09/tables` — Create a table
- `GET /cms/hubdb/2026-09/tables/draft` — List draft tables
- `GET /cms/hubdb/2026-09/tables/{tableIdOrName}` — Get published table details
- `DELETE /cms/hubdb/2026-09/tables/{tableIdOrName}` — Archive a table
- `GET /cms/hubdb/2026-09/tables/{tableIdOrName}/draft` — Get draft table details
- `PATCH /cms/hubdb/2026-09/tables/{tableIdOrName}/draft` — Update draft table
- `POST /cms/hubdb/2026-09/tables/{tableIdOrName}/draft/publish` — Publish draft
- `POST /cms/hubdb/2026-09/tables/{tableIdOrName}/draft/reset` — Reset draft to published
- `POST /cms/hubdb/2026-09/tables/{tableIdOrName}/draft/clone` — Clone a table
- `POST /cms/hubdb/2026-09/tables/{tableIdOrName}/draft/import` — Import CSV into draft
- `GET /cms/hubdb/2026-09/tables/{tableIdOrName}/draft/export` — Export draft as CSV
- `GET /cms/hubdb/2026-09/tables/{tableIdOrName}/export` — Export published table as CSV
- `POST /cms/hubdb/2026-09/tables/{tableIdOrName}/unpublish` — Unpublish a table
- `GET /cms/hubdb/2026-09/tables/{tableIdOrName}/rows` — List rows (published)
- `POST /cms/hubdb/2026-09/tables/{tableIdOrName}/rows` — Add a row
- `POST /cms/hubdb/2026-09/tables/{tableIdOrName}/rows/batch/read` — Batch read rows
- `GET /cms/hubdb/2026-09/tables/{tableIdOrName}/rows/draft` — List draft rows
- `GET /cms/hubdb/2026-09/tables/{tableIdOrName}/rows/{rowId}` — Get a row
- `GET /cms/hubdb/2026-09/tables/{tableIdOrName}/rows/{rowId}/draft` — Get draft row
- `PUT /cms/hubdb/2026-09/tables/{tableIdOrName}/rows/{rowId}/draft` — Replace draft row
- `PATCH /cms/hubdb/2026-09/tables/{tableIdOrName}/rows/{rowId}/draft` — Update draft row
- `DELETE /cms/hubdb/2026-09/tables/{tableIdOrName}/rows/{rowId}/draft` — Delete draft row
- `POST /cms/hubdb/2026-09/tables/{tableIdOrName}/rows/{rowId}/draft/clone` — Clone a row
- `POST /cms/hubdb/2026-09/tables/{tableIdOrName}/rows/draft/batch/create`
- `POST /cms/hubdb/2026-09/tables/{tableIdOrName}/rows/draft/batch/read`
- `POST /cms/hubdb/2026-09/tables/{tableIdOrName}/rows/draft/batch/update`
- `POST /cms/hubdb/2026-09/tables/{tableIdOrName}/rows/draft/batch/replace`
- `POST /cms/hubdb/2026-09/tables/{tableIdOrName}/rows/draft/batch/clone`
- `POST /cms/hubdb/2026-09/tables/{tableIdOrName}/rows/draft/batch/purge`

### Pages — Landing Pages (2026-09)
- `GET /cms/pages/2026-09/landing-pages` — List landing pages
- `POST /cms/pages/2026-09/landing-pages` — Create a landing page
- `GET /cms/pages/2026-09/landing-pages/{objectId}` — Read
- `PATCH /cms/pages/2026-09/landing-pages/{objectId}` — Update
- `DELETE /cms/pages/2026-09/landing-pages/{objectId}` — Delete
- `GET /cms/pages/2026-09/landing-pages/{objectId}/draft` — Get draft
- `PATCH /cms/pages/2026-09/landing-pages/{objectId}/draft` — Update draft
- `POST /cms/pages/2026-09/landing-pages/{objectId}/draft/push-live` — Push draft live
- `POST /cms/pages/2026-09/landing-pages/{objectId}/draft/reset` — Reset draft
- `GET /cms/pages/2026-09/landing-pages/{objectId}/revisions` — List revisions
- `POST /cms/pages/2026-09/landing-pages/{objectId}/revisions/{revisionId}/restore` — Restore revision
- `POST /cms/pages/2026-09/landing-pages/ab-test/create-variation` — Create A/B variation
- `POST /cms/pages/2026-09/landing-pages/ab-test/end` — End A/B test
- `POST /cms/pages/2026-09/landing-pages/clone` — Clone a page
- `POST /cms/pages/2026-09/landing-pages/schedule` — Schedule publish
- `POST /cms/pages/2026-09/landing-pages/batch/create`
- `POST /cms/pages/2026-09/landing-pages/batch/read`
- `POST /cms/pages/2026-09/landing-pages/batch/update`
- `POST /cms/pages/2026-09/landing-pages/batch/archive`
- `GET /cms/pages/2026-09/landing-pages/folders` — List page folders
- `POST /cms/pages/2026-09/landing-pages/multi-language/create-language-variation`
- `POST /cms/pages/2026-09/landing-pages/multi-language/attach-to-lang-group`
- `POST /cms/pages/2026-09/landing-pages/multi-language/detach-from-lang-group`
- `PUT /cms/pages/2026-09/landing-pages/multi-language/set-new-lang-primary`

### Pages — Site Pages (2026-09)
Same pattern as landing pages at `/cms/pages/2026-09/site-pages/…`

### Blog Posts (2026-09)
- `GET /cms/blogs/2026-09/posts` — List posts
- `POST /cms/blogs/2026-09/posts` — Create a post
- `GET /cms/blogs/2026-09/posts/{objectId}` — Read
- `PATCH /cms/blogs/2026-09/posts/{objectId}` — Update
- `DELETE /cms/blogs/2026-09/posts/{objectId}` — Delete
- `GET /cms/blogs/2026-09/posts/{objectId}/draft` — Get draft
- `PATCH /cms/blogs/2026-09/posts/{objectId}/draft` — Update draft
- `POST /cms/blogs/2026-09/posts/{objectId}/draft/push-live` — Publish draft
- `POST /cms/blogs/2026-09/posts/{objectId}/draft/reset` — Reset draft
- `GET /cms/blogs/2026-09/posts/{objectId}/revisions` — List revisions
- `POST /cms/blogs/2026-09/posts/{objectId}/revisions/{revisionId}/restore`
- `POST /cms/blogs/2026-09/posts/clone`
- `POST /cms/blogs/2026-09/posts/schedule`
- `POST /cms/blogs/2026-09/posts/batch/create`
- `POST /cms/blogs/2026-09/posts/batch/read`
- `POST /cms/blogs/2026-09/posts/batch/update`
- `POST /cms/blogs/2026-09/posts/batch/archive`
- `POST /cms/blogs/2026-09/posts/multi-language/create-language-variation`

### Domains (2026-09)
- `GET /cms/domains/2026-09` — List domains
- `GET /cms/domains/2026-09/{domainId}` — Get a domain

### Source Code (2026-09)
- `GET /cms/source-code/2026-09/{environment}/content/{path}` — Download file (`draft` or `published`)
- `PUT /cms/source-code/2026-09/{environment}/content/{path}` — Create or update file
- `POST /cms/source-code/2026-09/{environment}/content/{path}` — Create file
- `DELETE /cms/source-code/2026-09/{environment}/content/{path}` — Delete file
- `GET /cms/source-code/2026-09/{environment}/metadata/{path}` — File metadata
- `POST /cms/source-code/2026-09/{environment}/validate/{path}` — Validate file syntax
- `POST /cms/source-code/2026-09/extract/async` — Extract ZIP file
- `GET /cms/source-code/2026-09/extract/async/tasks/{taskId}/status` — Extraction status

### URL Redirects (2026-09)
- `GET /cms/url-redirects/2026-09` — List redirects
- `POST /cms/url-redirects/2026-09` — Create a redirect
- `GET /cms/url-redirects/2026-09/{urlRedirectId}` — Read
- `PATCH /cms/url-redirects/2026-09/{urlRedirectId}` — Update
- `DELETE /cms/url-redirects/2026-09/{urlRedirectId}` — Delete

### Site Search (2026-09)
- `GET /cms/site-search/2026-09/indexed-data/{contentId}` — Get indexed properties for a page

---

## Marketing

### Forms (v3)
- `GET /marketing/v3/forms` — List forms
- `POST /marketing/v3/forms` — Create a form
- `GET /marketing/v3/forms/{formId}` — Get form definition
- `PUT /marketing/v3/forms/{formId}` — Replace form definition
- `PATCH /marketing/v3/forms/{formId}` — Update form definition
- `DELETE /marketing/v3/forms/{formId}` — Archive a form

### Marketing Emails (2026-09)
- `GET /marketing/emails/2026-09` — List emails
- `POST /marketing/emails/2026-09` — Create an email
- `GET /marketing/emails/2026-09/{emailId}` — Read an email
- `PATCH /marketing/emails/2026-09/{emailId}` — Update an email
- `DELETE /marketing/emails/2026-09/{emailId}` — Delete an email
- `GET /marketing/emails/2026-09/{emailId}/draft` — Get draft
- `PATCH /marketing/emails/2026-09/{emailId}/draft` — Update draft
- `POST /marketing/emails/2026-09/{emailId}/draft/reset` — Reset draft
- `POST /marketing/emails/2026-09/{emailId}/publish` — Send / publish email
- `POST /marketing/emails/2026-09/{emailId}/unpublish` — Cancel scheduled send
- `GET /marketing/emails/2026-09/{emailId}/revisions` — List revisions
- `POST /marketing/emails/2026-09/{emailId}/revisions/{revisionId}/restore`
- `POST /marketing/emails/2026-09/ab-test/create-variation`
- `GET /marketing/emails/2026-09/{emailId}/ab-test/get-variation`
- `POST /marketing/emails/2026-09/clone`
- `GET /marketing/emails/2026-09/statistics/list` — Aggregate statistics
- `GET /marketing/emails/2026-09/statistics/histogram` — Statistics over time

### Marketing Events (2026-09)
- `POST /marketing/marketing-events/2026-09/events` — Create an event
- `GET /marketing/marketing-events/2026-09/events/{externalEventId}` — Get by external ID
- `PUT /marketing/marketing-events/2026-09/events/{externalEventId}` — Create or update by external ID
- `PATCH /marketing/marketing-events/2026-09/events/{externalEventId}` — Update by external ID
- `DELETE /marketing/marketing-events/2026-09/events/{externalEventId}` — Delete by external ID
- `GET /marketing/marketing-events/2026-09/{objectId}` — Get by object ID
- `PATCH /marketing/marketing-events/2026-09/{objectId}` — Update by object ID
- `DELETE /marketing/marketing-events/2026-09/{objectId}` — Delete by object ID
- `POST /marketing/marketing-events/2026-09/events/upsert` — Upsert multiple events
- `POST /marketing/marketing-events/2026-09/events/delete` — Bulk delete by external IDs
- `GET /marketing/marketing-events/2026-09/events/search` — Search events
- `POST /marketing/marketing-events/2026-09/events/{externalEventId}/cancel` — Cancel event
- `POST /marketing/marketing-events/2026-09/events/{externalEventId}/complete` — Mark complete
- `POST /marketing/marketing-events/2026-09/events/{externalEventId}/{subscriberState}/upsert` — Record attendance by contact ID
- `POST /marketing/marketing-events/2026-09/events/{externalEventId}/{subscriberState}/email-upsert` — Record attendance by email
- `POST /marketing/marketing-events/2026-09/attendance/{externalEventId}/{subscriberState}/create`
- `POST /marketing/marketing-events/2026-09/attendance/{externalEventId}/{subscriberState}/email-create`
- `GET /marketing/marketing-events/2026-09/participations/{marketingEventId}` — Read participation counts
- `GET /marketing/marketing-events/2026-09/participations/{marketingEventId}/breakdown`
- `GET /marketing/marketing-events/2026-09/{appId}/settings` — App settings
- `POST /marketing/marketing-events/2026-09/{appId}/settings` — Update app settings
- `PUT /marketing/marketing-events/2026-09/associations/{marketingEventId}/lists/{listId}` — Associate list
- `DELETE /marketing/marketing-events/2026-09/associations/{marketingEventId}/lists/{listId}` — Disassociate list
- `POST /marketing/marketing-events/2026-09/batch/update` — Batch update events
- `POST /marketing/marketing-events/2026-09/batch/archive` — Batch delete events

### Campaigns (2026-09)
- `GET /marketing/campaigns/2026-09` — List campaigns
- `POST /marketing/campaigns/2026-09` — Create a campaign
- `GET /marketing/campaigns/2026-09/{campaignGuid}` — Read a campaign
- `PATCH /marketing/campaigns/2026-09/{campaignGuid}` — Update a campaign
- `DELETE /marketing/campaigns/2026-09/{campaignGuid}` — Delete a campaign
- `POST /marketing/campaigns/2026-09/batch/create`
- `POST /marketing/campaigns/2026-09/batch/read`
- `POST /marketing/campaigns/2026-09/batch/update`
- `POST /marketing/campaigns/2026-09/batch/archive`
- `GET /marketing/campaigns/2026-09/{campaignGuid}/assets/{assetType}` — List associated assets
- `PUT /marketing/campaigns/2026-09/{campaignGuid}/assets/{assetType}/{assetId}` — Associate asset
- `DELETE /marketing/campaigns/2026-09/{campaignGuid}/assets/{assetType}/{assetId}` — Remove asset
- `GET /marketing/campaigns/2026-09/{campaignGuid}/reports/metrics` — Campaign metrics
- `GET /marketing/campaigns/2026-09/{campaignGuid}/reports/revenue` — Revenue report
- `POST /marketing/campaigns/2026-09/{campaignGuid}/budget` — Add budget item
- `GET /marketing/campaigns/2026-09/{campaignGuid}/budget/totals`

### Transactional Email (2026-09)
- `POST /marketing/transactional/2026-09/single-email/send` — Send a transactional email
- `GET /marketing/transactional/2026-09/smtp-tokens` — List SMTP tokens
- `POST /marketing/transactional/2026-09/smtp-tokens` — Create SMTP token
- `GET /marketing/transactional/2026-09/smtp-tokens/{tokenId}` — Read token
- `DELETE /marketing/transactional/2026-09/smtp-tokens/{tokenId}` — Delete token
- `POST /marketing/transactional/2026-09/smtp-tokens/{tokenId}/password-reset` — Reset password

---

## Automation

### Workflows (v4)
- `GET /automation/v4/flows` — List workflows
- `POST /automation/v4/flows/batch/read` — Batch read workflows
- `GET /automation/v4/flows/{flowId}` — Read a workflow
- `GET /automation/v4/flows/performance` — Workflow performance data

### Sequences (2025-09)
- `GET /automation/sequences/2025-09` — List sequences
- `GET /automation/sequences/2025-09/{sequenceId}` — Read a sequence
- `POST /automation/sequences/2025-09/enrollments` — Enroll a contact
- `GET /automation/sequences/2025-09/enrollments/contact/{contactId}` — Get contact enrollments

### Custom Workflow Actions (2025-09)
- `GET /automation/actions/2025-09/{appId}` — List custom actions
- `POST /automation/actions/2025-09/{appId}` — Create a custom action
- `GET /automation/actions/2025-09/{appId}/{definitionId}` — Read an action
- `PATCH /automation/actions/2025-09/{appId}/{definitionId}` — Update an action
- `DELETE /automation/actions/2025-09/{appId}/{definitionId}` — Delete an action
- `GET /automation/actions/2025-09/{appId}/{definitionId}/functions` — List functions
- `PUT /automation/actions/2025-09/{appId}/{definitionId}/functions/{functionType}` — Upsert function
- `DELETE /automation/actions/2025-09/{appId}/{definitionId}/functions/{functionType}`
- `GET /automation/actions/2025-09/{appId}/{definitionId}/revisions` — List revisions
- `POST /automation/actions/callbacks/2025-09/complete` — Complete a callback (batch)
- `POST /automation/actions/callbacks/2025-09/{callbackId}/complete` — Complete a callback

---

## Conversations

### Inbox & Messages (2026-09)
- `GET /conversations/conversations/2026-09/inboxes` — List inboxes
- `GET /conversations/conversations/2026-09/inboxes/{inboxId}` — Read an inbox
- `GET /conversations/conversations/2026-09/threads` — List threads
- `GET /conversations/conversations/2026-09/threads/{threadId}` — Read a thread
- `PATCH /conversations/conversations/2026-09/threads/{threadId}` — Update a thread
- `DELETE /conversations/conversations/2026-09/threads/{threadId}` — Archive a thread
- `GET /conversations/conversations/2026-09/threads/{threadId}/messages` — Message history
- `POST /conversations/conversations/2026-09/threads/{threadId}/messages` — Send a message
- `GET /conversations/conversations/2026-09/threads/{threadId}/messages/{messageId}` — Read a message
- `GET /conversations/conversations/2026-09/channels` — List channels
- `GET /conversations/conversations/2026-09/channels/{channelId}` — Read a channel
- `GET /conversations/conversations/2026-09/channel-accounts` — List channel accounts
- `GET /conversations/conversations/2026-09/actors/{actorId}` — Read an actor
- `POST /conversations/conversations/2026-09/actors/batch/read` — Batch read actors

### Visitor Identification (2026-09)
- `POST /visitor-identification/2026-09/tokens/create` — Generate identification token for a visitor

---

## Files

- `POST /files/2026-09/files` — Upload a file (multipart)
- `PUT /files/2026-09/files/{fileId}` — Replace a file
- `GET /files/2026-09/files/{fileId}` — Read file metadata
- `PATCH /files/2026-09/files/{fileId}` — Update file properties
- `DELETE /files/2026-09/files/{fileId}` — Delete a file
- `DELETE /files/2026-09/files/{fileId}/gdpr-delete` — Permanently delete (GDPR)
- `GET /files/2026-09/files/{fileId}/signed-url` — Get signed URL for private file
- `GET /files/2026-09/files/{fileId}/download` — Download file
- `GET /files/2026-09/files/search` — Search files
- `GET /files/2026-09/files/stat/{path}` — Retrieve file by path
- `POST /files/2026-09/files/import-from-url/async` — Import from URL (async)
- `GET /files/2026-09/files/import-from-url/async/tasks/{taskId}/status` — Import status
- `POST /files/2026-09/folders` — Create a folder
- `GET /files/2026-09/folders/{folderId}` — Read folder by ID
- `PATCH /files/2026-09/folders/{folderId}` — Update folder by ID
- `DELETE /files/2026-09/folders/{folderId}` — Delete folder by ID
- `GET /files/2026-09/folders/{folderPath}` — Read folder by path
- `DELETE /files/2026-09/folders/{folderPath}` — Delete folder by path
- `GET /files/2026-09/folders/search` — Search folders
- `POST /files/2026-09/folders/update/async` — Async folder update
- `GET /files/2026-09/folders/update/async/tasks/{taskId}/status`

---

## Webhooks

- `GET /app-webhooks/2026-09/{appId}/settings` — Read webhook settings
- `PUT /app-webhooks/2026-09/{appId}/settings` — Update webhook settings (targetUrl, maxConcurrentRequests)
- `DELETE /app-webhooks/2026-09/{appId}/settings` — Delete webhook settings
- `GET /app-webhooks/2026-09/{appId}/subscriptions` — List subscriptions
- `POST /app-webhooks/2026-09/{appId}/subscriptions` — Create a subscription
- `GET /app-webhooks/2026-09/{appId}/subscriptions/{subscriptionId}` — Read a subscription
- `PATCH /app-webhooks/2026-09/{appId}/subscriptions/{subscriptionId}` — Update (enable/disable) subscription
- `DELETE /app-webhooks/2026-09/{appId}/subscriptions/{subscriptionId}` — Delete a subscription
- `POST /app-webhooks/2026-09/{appId}/subscriptions/batch/update` — Batch enable/disable subscriptions

**Subscription event types** (sample): `contact.creation`, `contact.propertyChange`, `contact.deletion`, `company.creation`, `deal.creation`, `deal.propertyChange`, `deal.deletion`, `ticket.creation`, `conversation.newMessage`

---

## Events

### Custom Behavioral Events (2026-09)
- `GET /events/2026-09/events` — Query events
- `GET /events/2026-09/events/event-types` — List event types

### Manage Event Definitions (2026-09)
- `GET /events/2026-09/event-definitions` — List event definitions
- `POST /events/2026-09/event-definitions` — Create event definition
- `GET /events/2026-09/event-definitions/{eventTemplateId}` — Read definition
- `PATCH /events/2026-09/event-definitions/{eventTemplateId}` — Update definition
- `DELETE /events/2026-09/event-definitions/{eventTemplateId}` — Delete definition

### Send Event Completions (2026-09)
- `POST /events/2026-09/send` — Send event completion

---

## Settings & Account

### User Provisioning (2026-09)
- `GET /settings/users/2026-09` — List users
- `POST /settings/users/2026-09` — Create a user
- `GET /settings/users/2026-09/{userId}` — Read a user
- `PUT /settings/users/2026-09/{userId}` — Update a user
- `DELETE /settings/users/2026-09/{userId}` — Remove a user
- `GET /settings/users/2026-09/roles` — List roles
- `GET /settings/users/2026-09/teams` — List teams

### Account Info (2026-09)
- `GET /account-info/2026-09/details` — Account details (portal ID, domain, timezone, hub type)
- `GET /account-info/2026-09/api-usage/daily/private-apps` — Daily API usage for Private Apps

### Communication Preferences / Subscriptions (2026-09)
- `GET /communication-preferences/2026-09/definitions` — List subscription type definitions
- `GET /communication-preferences/2026-09/status/email/{emailAddress}` — Get subscription status for email
- `POST /communication-preferences/2026-09/subscribe` — Subscribe a contact
- `POST /communication-preferences/2026-09/unsubscribe` — Unsubscribe a contact

### Business Units (2026-09)
- `GET /business-units/public/2026-09/business-units/user/{userId}` — List business units for a user

### Multicurrency (2026-09)
- `GET /settings/currencies/2026-09` — List enabled currencies
- Endpoints for exchange rate management

---

## Data Studio

### Datasource Ingestion (2025-09)
- `POST /data-ingestion/2025-09` — Ingest data into a custom data source
- `GET /data-ingestion/2025-09/{taskId}` — Check ingestion task status

---

*Full OpenAPI schemas available at `/tmp/HubSpot-public-api-spec-collection/PublicApiSpecs/` (local clone) or https://github.com/HubSpot/public-api-spec-collection*
