# HubSpot Public API Endpoint Catalog

Generated from the OpenAPI 3.0 specs in the `HubSpot/public-api-spec-collection` repository.
Base URL for all endpoints: `https://api.hubapi.com`

---

## Auth

### OAuth (v3)
- `POST /oauth/v3/token` — Exchange code or refresh token
- `POST /oauth/v3/token/introspect` — Inspect a token
- `POST /oauth/v3/token/revoke` — Revoke a token

---

## CRM — Core Objects

All core objects follow the same CRUD + batch + search pattern. See SKILL.md §2 for the template.

### Contacts (v3)
- `GET /crm/v3/objects/contacts` — List contacts
- `POST /crm/v3/objects/contacts` — Create a contact
- `GET /crm/v3/objects/contacts/{contactId}` — Read a contact
- `PATCH /crm/v3/objects/contacts/{contactId}` — Update a contact
- `DELETE /crm/v3/objects/contacts/{contactId}` — Archive a contact
- `POST /crm/v3/objects/contacts/search` — Search contacts
- `POST /crm/v3/objects/contacts/merge` — Merge two contacts
- `POST /crm/v3/objects/contacts/gdpr-delete` — Permanently delete (GDPR)
- `POST /crm/v3/objects/contacts/batch/create`
- `POST /crm/v3/objects/contacts/batch/read`
- `POST /crm/v3/objects/contacts/batch/update`
- `POST /crm/v3/objects/contacts/batch/upsert`
- `POST /crm/v3/objects/contacts/batch/archive`

### Companies (v3)
- `GET /crm/v3/objects/companies` — List companies
- `POST /crm/v3/objects/companies` — Create a company
- `GET /crm/v3/objects/companies/{companyId}` — Read a company
- `PATCH /crm/v3/objects/companies/{companyId}` — Update a company
- `DELETE /crm/v3/objects/companies/{companyId}` — Archive a company
- `POST /crm/v3/objects/companies/search` — Search companies
- `POST /crm/v3/objects/companies/merge` — Merge two companies
- `POST /crm/v3/objects/companies/batch/create`
- `POST /crm/v3/objects/companies/batch/read`
- `POST /crm/v3/objects/companies/batch/update`
- `POST /crm/v3/objects/companies/batch/upsert`
- `POST /crm/v3/objects/companies/batch/archive`

### Deals (v3)
- `GET /crm/v3/objects/0-3` — List deals
- `POST /crm/v3/objects/0-3` — Create a deal
- `GET /crm/v3/objects/0-3/{dealId}` — Read a deal
- `PATCH /crm/v3/objects/0-3/{dealId}` — Update a deal
- `DELETE /crm/v3/objects/0-3/{dealId}` — Archive a deal
- `POST /crm/v3/objects/0-3/search` — Search deals
- `POST /crm/v3/objects/0-3/merge` — Merge two deals
- `POST /crm/v3/objects/0-3/batch/create`
- `POST /crm/v3/objects/0-3/batch/read`
- `POST /crm/v3/objects/0-3/batch/update`
- `POST /crm/v3/objects/0-3/batch/upsert`
- `POST /crm/v3/objects/0-3/batch/archive`

### Tickets (v3)
- `GET /crm/v3/objects/tickets` — List tickets
- `POST /crm/v3/objects/tickets` — Create a ticket
- `GET /crm/v3/objects/tickets/{ticketId}` — Read a ticket
- `PATCH /crm/v3/objects/tickets/{ticketId}` — Update a ticket
- `DELETE /crm/v3/objects/tickets/{ticketId}` — Archive a ticket
- `POST /crm/v3/objects/tickets/search` — Search tickets
- `POST /crm/v3/objects/tickets/merge`
- `POST /crm/v3/objects/tickets/batch/create`
- `POST /crm/v3/objects/tickets/batch/read`
- `POST /crm/v3/objects/tickets/batch/update`
- `POST /crm/v3/objects/tickets/batch/upsert`
- `POST /crm/v3/objects/tickets/batch/archive`

### Leads (v3)
- `GET /crm/v3/objects/leads` — List leads
- `POST /crm/v3/objects/leads` — Create a lead
- `GET /crm/v3/objects/leads/{leadsId}` — Read a lead
- `PATCH /crm/v3/objects/leads/{leadsId}` — Update a lead
- `DELETE /crm/v3/objects/leads/{leadsId}` — Archive a lead
- `POST /crm/v3/objects/leads/search` — Search leads
- `POST /crm/v3/objects/leads/batch/create`
- `POST /crm/v3/objects/leads/batch/read`
- `POST /crm/v3/objects/leads/batch/update`
- `POST /crm/v3/objects/leads/batch/upsert`
- `POST /crm/v3/objects/leads/batch/archive`

### Generic Objects API (v3) — use for custom objects or any objectType
- `GET /crm/v3/objects/{objectType}` — List
- `POST /crm/v3/objects/{objectType}` — Create
- `GET /crm/v3/objects/{objectType}/{objectId}` — Read
- `PATCH /crm/v3/objects/{objectType}/{objectId}` — Update
- `DELETE /crm/v3/objects/{objectType}/{objectId}` — Archive
- `POST /crm/v3/objects/{objectType}/search`
- `POST /crm/v3/objects/{objectType}/batch/create`
- `POST /crm/v3/objects/{objectType}/batch/read`
- `POST /crm/v3/objects/{objectType}/batch/update`
- `POST /crm/v3/objects/{objectType}/batch/upsert`
- `POST /crm/v3/objects/{objectType}/batch/archive`

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

Each supports the full CRUD + batch + search pattern at `/crm/v3/objects/{slug}/…`.

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

### Properties (v3)
- `GET /crm/v3/properties/{objectType}` — List all properties
- `POST /crm/v3/properties/{objectType}` — Create a property
- `GET /crm/v3/properties/{objectType}/{propertyName}` — Read a property
- `PATCH /crm/v3/properties/{objectType}/{propertyName}` — Update a property
- `DELETE /crm/v3/properties/{objectType}/{propertyName}` — Archive a property
- `POST /crm/v3/properties/{objectType}/batch/read` — Batch read properties
- `POST /crm/v3/properties/{objectType}/batch/create` — Batch create properties
- `POST /crm/v3/properties/{objectType}/batch/archive` — Batch archive properties
- `GET /crm/v3/properties/{objectType}/groups` — List property groups
- `POST /crm/v3/properties/{objectType}/groups` — Create a property group
- `GET /crm/v3/properties/{objectType}/groups/{groupName}` — Read a property group
- `PATCH /crm/v3/properties/{objectType}/groups/{groupName}` — Update a property group
- `DELETE /crm/v3/properties/{objectType}/groups/{groupName}` — Archive a property group

### Custom Object Schemas (v3)
- `GET /crm-object-schemas/v3/schemas` — List all custom schemas
- `POST /crm-object-schemas/v3/schemas` — Create a schema
- `POST /crm-object-schemas/v3/schemas/batch/read` — Batch read schemas
- `GET /crm-object-schemas/v3/schemas/{objectType}` — Read a schema
- `PATCH /crm-object-schemas/v3/schemas/{objectType}` — Update a schema
- `DELETE /crm-object-schemas/v3/schemas/{objectType}` — Delete a schema
- `POST /crm-object-schemas/v3/schemas/{objectType}/associations` — Create association definition
- `DELETE /crm-object-schemas/v3/schemas/{objectType}/associations/{associationIdentifier}`

### Associations (v3)
- `POST /crm/v3/associations/{fromObjectType}/{toObjectType}/batch/read` — Read associations
- `POST /crm/v3/associations/{fromObjectType}/{toObjectType}/batch/create` — Create associations
- `POST /crm/v3/associations/{fromObjectType}/{toObjectType}/batch/archive` — Remove associations
- `GET /crm/v3/associations/{fromObjectType}/{toObjectType}/types` — List association type definitions

### Pipelines (v3)
- `GET /crm/v3/pipelines/{objectType}` — List pipelines
- `POST /crm/v3/pipelines/{objectType}` — Create a pipeline
- `GET /crm/v3/pipelines/{objectType}/{pipelineId}` — Read a pipeline
- `PUT /crm/v3/pipelines/{objectType}/{pipelineId}` — Replace a pipeline
- `PATCH /crm/v3/pipelines/{objectType}/{pipelineId}` — Update a pipeline
- `DELETE /crm/v3/pipelines/{objectType}/{pipelineId}` — Delete a pipeline
- `GET /crm/v3/pipelines/{objectType}/{pipelineId}/audit` — Pipeline audit log
- `GET /crm/v3/pipelines/{objectType}/{pipelineId}/stages` — List stages
- `POST /crm/v3/pipelines/{objectType}/{pipelineId}/stages` — Create a stage
- `GET /crm/v3/pipelines/{objectType}/{pipelineId}/stages/{stageId}` — Read a stage
- `PUT /crm/v3/pipelines/{objectType}/{pipelineId}/stages/{stageId}` — Replace a stage
- `PATCH /crm/v3/pipelines/{objectType}/{pipelineId}/stages/{stageId}` — Update a stage
- `DELETE /crm/v3/pipelines/{objectType}/{pipelineId}/stages/{stageId}` — Delete a stage
- `GET /crm/v3/pipelines/{objectType}/{pipelineId}/stages/{stageId}/audit`

### Owners (v3)
- `GET /crm/v3/owners` — List owners
- `GET /crm/v3/owners/{ownerId}` — Read a specific owner

---

## CRM — Lists, Import/Export

### Lists (v3)
- `GET /crm/v3/lists` — List all lists
- `POST /crm/v3/lists` — Create a list
- `GET /crm/v3/lists/{listId}` — Fetch list by ID
- `DELETE /crm/v3/lists/{listId}` — Delete a list
- `PUT /crm/v3/lists/{listId}/restore` — Restore a deleted list
- `PUT /crm/v3/lists/{listId}/update-list-filters` — Update filter definition
- `PUT /crm/v3/lists/{listId}/update-list-name` — Rename a list
- `GET /crm/v3/lists/{listId}/memberships` — List memberships (ordered by ID)
- `GET /crm/v3/lists/{listId}/memberships/join-order` — List memberships (ordered by join date)
- `PUT /crm/v3/lists/{listId}/memberships/add` — Add records to list
- `PUT /crm/v3/lists/{listId}/memberships/remove` — Remove records from list
- `PUT /crm/v3/lists/{listId}/memberships/add-and-remove` — Add and remove in one call
- `PUT /crm/v3/lists/{listId}/memberships/add-from/{sourceListId}` — Copy all from another list
- `DELETE /crm/v3/lists/{listId}/memberships` — Remove all records from list
- `POST /crm/v3/lists/search` — Search lists
- `GET /crm/v3/lists/object-type-id/{objectTypeId}/name/{listName}` — Find list by name
- `GET /crm/v3/lists/records/{objectTypeId}/{recordId}/memberships` — Lists a record belongs to
- `GET /crm/v3/lists/folders` — List folders
- `POST /crm/v3/lists/folders` — Create folder
- `DELETE /crm/v3/lists/folders/{folderId}` — Delete folder
- `PUT /crm/v3/lists/folders/{folderId}/move/{newParentFolderId}` — Move folder
- `PUT /crm/v3/lists/folders/{folderId}/rename` — Rename folder
- `PUT /crm/v3/lists/folders/move-list` — Move list to folder
- `GET /crm/v3/lists/idmapping` — Translate legacy list ID
- `POST /crm/v3/lists/idmapping` — Batch translate legacy list IDs

### Imports (v3)
- `GET /crm/v3/imports` — List imports
- `POST /crm/v3/imports` — Start an import (multipart form with CSV)
- `GET /crm/v3/imports/{importId}` — Get import status
- `POST /crm/v3/imports/{importId}/cancel` — Cancel an import
- `GET /crm/v3/imports/{importId}/errors` — Get import errors

### Exports (v3)
- `POST /crm/v3/exports/export/async` — Start an export
- `GET /crm/v3/exports/export/async/tasks/{taskId}/status` — Poll export status (returns download URL)
- `GET /crm/v3/exports/export/{exportId}` — Get export details

---

## CRM — Extensions & Misc

### Timeline Events (v3)
- `POST /integrators/timeline/v3/events` — Create a single timeline event
- `POST /integrators/timeline/v3/events/batch/create` — Create multiple events
- `GET /integrators/timeline/v3/events/{eventTemplateId}/{eventId}` — Get event instance
- `GET /integrators/timeline/v3/{appId}/event-templates` — List event templates
- `POST /integrators/timeline/v3/{appId}/event-templates` — Create event template
- `GET /integrators/timeline/v3/{appId}/event-templates/{eventTemplateId}` — Read template
- `PUT /integrators/timeline/v3/{appId}/event-templates/{eventTemplateId}` — Update template
- `DELETE /integrators/timeline/v3/{appId}/event-templates/{eventTemplateId}` — Delete template
- `POST /integrators/timeline/v3/{appId}/event-templates/{eventTemplateId}/tokens` — Add tokens
- `PUT /integrators/timeline/v3/{appId}/event-templates/{eventTemplateId}/tokens/{tokenName}` — Update token
- `DELETE /integrators/timeline/v3/{appId}/event-templates/{eventTemplateId}/tokens/{tokenName}` — Delete token

### Feedback Submissions (v3)
- `GET /crm/v3/objects/feedback_submissions` — List
- `GET /crm/v3/objects/feedback_submissions/{feedbackSubmissionId}` — Read
- `POST /crm/v3/objects/feedback_submissions/batch/read`
- `POST /crm/v3/objects/feedback_submissions/search`

### Goal Targets (v3)
Full CRUD + batch + search at `/crm/v3/objects/goal_targets/…`

### Forecasts (v3)
- `GET /crm/objects/v3/{objectType}` — List forecasts
- `GET /crm/objects/v3/{objectType}/{objectId}` — Read a forecast

### Deal Splits (v3)
Endpoint under `/crm/v3/objects/deal_splits/…` (full CRUD + batch)

---

## CMS

### HubDB (v3)
- `GET /cms/v3/hubdb/tables` — List published tables
- `POST /cms/v3/hubdb/tables` — Create a table
- `GET /cms/v3/hubdb/tables/draft` — List draft tables
- `GET /cms/v3/hubdb/tables/{tableIdOrName}` — Get published table details
- `DELETE /cms/v3/hubdb/tables/{tableIdOrName}` — Archive a table
- `GET /cms/v3/hubdb/tables/{tableIdOrName}/draft` — Get draft table details
- `PATCH /cms/v3/hubdb/tables/{tableIdOrName}/draft` — Update draft table
- `POST /cms/v3/hubdb/tables/{tableIdOrName}/draft/publish` — Publish draft
- `POST /cms/v3/hubdb/tables/{tableIdOrName}/draft/reset` — Reset draft to published
- `POST /cms/v3/hubdb/tables/{tableIdOrName}/draft/clone` — Clone a table
- `POST /cms/v3/hubdb/tables/{tableIdOrName}/draft/import` — Import CSV into draft
- `GET /cms/v3/hubdb/tables/{tableIdOrName}/draft/export` — Export draft as CSV
- `GET /cms/v3/hubdb/tables/{tableIdOrName}/export` — Export published table as CSV
- `POST /cms/v3/hubdb/tables/{tableIdOrName}/unpublish` — Unpublish a table
- `GET /cms/v3/hubdb/tables/{tableIdOrName}/rows` — List rows (published)
- `POST /cms/v3/hubdb/tables/{tableIdOrName}/rows` — Add a row
- `POST /cms/v3/hubdb/tables/{tableIdOrName}/rows/batch/read` — Batch read rows
- `GET /cms/v3/hubdb/tables/{tableIdOrName}/rows/draft` — List draft rows
- `GET /cms/v3/hubdb/tables/{tableIdOrName}/rows/{rowId}` — Get a row
- `GET /cms/v3/hubdb/tables/{tableIdOrName}/rows/{rowId}/draft` — Get draft row
- `PUT /cms/v3/hubdb/tables/{tableIdOrName}/rows/{rowId}/draft` — Replace draft row
- `PATCH /cms/v3/hubdb/tables/{tableIdOrName}/rows/{rowId}/draft` — Update draft row
- `DELETE /cms/v3/hubdb/tables/{tableIdOrName}/rows/{rowId}/draft` — Delete draft row
- `POST /cms/v3/hubdb/tables/{tableIdOrName}/rows/{rowId}/draft/clone` — Clone a row
- `POST /cms/v3/hubdb/tables/{tableIdOrName}/rows/draft/batch/create`
- `POST /cms/v3/hubdb/tables/{tableIdOrName}/rows/draft/batch/read`
- `POST /cms/v3/hubdb/tables/{tableIdOrName}/rows/draft/batch/update`
- `POST /cms/v3/hubdb/tables/{tableIdOrName}/rows/draft/batch/replace`
- `POST /cms/v3/hubdb/tables/{tableIdOrName}/rows/draft/batch/clone`
- `POST /cms/v3/hubdb/tables/{tableIdOrName}/rows/draft/batch/purge`

### Pages — Landing Pages (v3)
- `GET /cms/v3/pages/landing-pages` — List landing pages
- `POST /cms/v3/pages/landing-pages` — Create a landing page
- `GET /cms/v3/pages/landing-pages/{objectId}` — Read
- `PATCH /cms/v3/pages/landing-pages/{objectId}` — Update
- `DELETE /cms/v3/pages/landing-pages/{objectId}` — Delete
- `GET /cms/v3/pages/landing-pages/{objectId}/draft` — Get draft
- `PATCH /cms/v3/pages/landing-pages/{objectId}/draft` — Update draft
- `POST /cms/v3/pages/landing-pages/{objectId}/draft/push-live` — Push draft live
- `POST /cms/v3/pages/landing-pages/{objectId}/draft/reset` — Reset draft
- `GET /cms/v3/pages/landing-pages/{objectId}/revisions` — List revisions
- `POST /cms/v3/pages/landing-pages/{objectId}/revisions/{revisionId}/restore` — Restore revision
- `POST /cms/v3/pages/landing-pages/ab-test/create-variation` — Create A/B variation
- `POST /cms/v3/pages/landing-pages/ab-test/end` — End A/B test
- `POST /cms/v3/pages/landing-pages/clone` — Clone a page
- `POST /cms/v3/pages/landing-pages/schedule` — Schedule publish
- `POST /cms/v3/pages/landing-pages/batch/create`
- `POST /cms/v3/pages/landing-pages/batch/read`
- `POST /cms/v3/pages/landing-pages/batch/update`
- `POST /cms/v3/pages/landing-pages/batch/archive`
- `GET /cms/v3/pages/landing-pages/folders` — List page folders
- `POST /cms/v3/pages/landing-pages/multi-language/create-language-variation`
- `POST /cms/v3/pages/landing-pages/multi-language/attach-to-lang-group`
- `POST /cms/v3/pages/landing-pages/multi-language/detach-from-lang-group`
- `PUT /cms/v3/pages/landing-pages/multi-language/set-new-lang-primary`

### Pages — Site Pages (v3)
Same pattern as landing pages at `/cms/v3/pages/site-pages/…`

### Blog Posts (v3)
- `GET /cms/v3/blogs/posts` — List posts
- `POST /cms/v3/blogs/posts` — Create a post
- `GET /cms/v3/blogs/posts/{objectId}` — Read
- `PATCH /cms/v3/blogs/posts/{objectId}` — Update
- `DELETE /cms/v3/blogs/posts/{objectId}` — Delete
- `GET /cms/v3/blogs/posts/{objectId}/draft` — Get draft
- `PATCH /cms/v3/blogs/posts/{objectId}/draft` — Update draft
- `POST /cms/v3/blogs/posts/{objectId}/draft/push-live` — Publish draft
- `POST /cms/v3/blogs/posts/{objectId}/draft/reset` — Reset draft
- `GET /cms/v3/blogs/posts/{objectId}/revisions` — List revisions
- `POST /cms/v3/blogs/posts/{objectId}/revisions/{revisionId}/restore`
- `POST /cms/v3/blogs/posts/clone`
- `POST /cms/v3/blogs/posts/schedule`
- `POST /cms/v3/blogs/posts/batch/create`
- `POST /cms/v3/blogs/posts/batch/read`
- `POST /cms/v3/blogs/posts/batch/update`
- `POST /cms/v3/blogs/posts/batch/archive`
- `POST /cms/v3/blogs/posts/multi-language/create-language-variation`

### Domains (v3)
- `GET /cms/v3/domains` — List domains
- `GET /cms/v3/domains/{domainId}` — Get a domain

### Source Code (v3)
- `GET /cms/v3/source-code/{environment}/content/{path}` — Download file (`draft` or `published`)
- `PUT /cms/v3/source-code/{environment}/content/{path}` — Create or update file
- `POST /cms/v3/source-code/{environment}/content/{path}` — Create file
- `DELETE /cms/v3/source-code/{environment}/content/{path}` — Delete file
- `GET /cms/v3/source-code/{environment}/metadata/{path}` — File metadata
- `POST /cms/v3/source-code/{environment}/validate/{path}` — Validate file syntax
- `POST /cms/v3/source-code/extract/async` — Extract ZIP file
- `GET /cms/v3/source-code/extract/async/tasks/{taskId}/status` — Extraction status

### URL Redirects (v3)
- `GET /cms/v3/url-redirects` — List redirects
- `POST /cms/v3/url-redirects` — Create a redirect
- `GET /cms/v3/url-redirects/{urlRedirectId}` — Read
- `PATCH /cms/v3/url-redirects/{urlRedirectId}` — Update
- `DELETE /cms/v3/url-redirects/{urlRedirectId}` — Delete

### Site Search (v3)
- `GET /cms/v3/site-search/indexed-data/{contentId}` — Get indexed properties for a page

---

## Marketing

### Forms (v3)
- `GET /marketing/v3/forms` — List forms
- `POST /marketing/v3/forms` — Create a form
- `GET /marketing/v3/forms/{formId}` — Get form definition
- `PUT /marketing/v3/forms/{formId}` — Replace form definition
- `PATCH /marketing/v3/forms/{formId}` — Update form definition
- `DELETE /marketing/v3/forms/{formId}` — Archive a form

### Marketing Emails (v3)
- `GET /marketing/v3/emails` — List emails
- `POST /marketing/v3/emails` — Create an email
- `GET /marketing/v3/emails/{emailId}` — Read an email
- `PATCH /marketing/v3/emails/{emailId}` — Update an email
- `DELETE /marketing/v3/emails/{emailId}` — Delete an email
- `GET /marketing/v3/emails/{emailId}/draft` — Get draft
- `PATCH /marketing/v3/emails/{emailId}/draft` — Update draft
- `POST /marketing/v3/emails/{emailId}/draft/reset` — Reset draft
- `POST /marketing/v3/emails/{emailId}/publish` — Send / publish email
- `POST /marketing/v3/emails/{emailId}/unpublish` — Cancel scheduled send
- `GET /marketing/v3/emails/{emailId}/revisions` — List revisions
- `POST /marketing/v3/emails/{emailId}/revisions/{revisionId}/restore`
- `POST /marketing/v3/emails/ab-test/create-variation`
- `GET /marketing/v3/emails/{emailId}/ab-test/get-variation`
- `POST /marketing/v3/emails/clone`
- `GET /marketing/v3/emails/statistics/list` — Aggregate statistics
- `GET /marketing/v3/emails/statistics/histogram` — Statistics over time

### Marketing Events (v3)
- `POST /marketing/v3/marketing-events/events` — Create an event
- `GET /marketing/v3/marketing-events/events/{externalEventId}` — Get by external ID
- `PUT /marketing/v3/marketing-events/events/{externalEventId}` — Create or update by external ID
- `PATCH /marketing/v3/marketing-events/events/{externalEventId}` — Update by external ID
- `DELETE /marketing/v3/marketing-events/events/{externalEventId}` — Delete by external ID
- `GET /marketing/v3/marketing-events/{objectId}` — Get by object ID
- `PATCH /marketing/v3/marketing-events/{objectId}` — Update by object ID
- `DELETE /marketing/v3/marketing-events/{objectId}` — Delete by object ID
- `POST /marketing/v3/marketing-events/events/upsert` — Upsert multiple events
- `POST /marketing/v3/marketing-events/events/delete` — Bulk delete by external IDs
- `GET /marketing/v3/marketing-events/events/search` — Search events
- `POST /marketing/v3/marketing-events/events/{externalEventId}/cancel` — Cancel event
- `POST /marketing/v3/marketing-events/events/{externalEventId}/complete` — Mark complete
- `POST /marketing/v3/marketing-events/events/{externalEventId}/{subscriberState}/upsert` — Record attendance by contact ID
- `POST /marketing/v3/marketing-events/events/{externalEventId}/{subscriberState}/email-upsert` — Record attendance by email
- `POST /marketing/v3/marketing-events/attendance/{externalEventId}/{subscriberState}/create`
- `POST /marketing/v3/marketing-events/attendance/{externalEventId}/{subscriberState}/email-create`
- `GET /marketing/v3/marketing-events/participations/{marketingEventId}` — Read participation counts
- `GET /marketing/v3/marketing-events/participations/{marketingEventId}/breakdown`
- `GET /marketing/v3/marketing-events/{appId}/settings` — App settings
- `POST /marketing/v3/marketing-events/{appId}/settings` — Update app settings
- `PUT /marketing/v3/marketing-events/associations/{marketingEventId}/lists/{listId}` — Associate list
- `DELETE /marketing/v3/marketing-events/associations/{marketingEventId}/lists/{listId}` — Disassociate list
- `POST /marketing/v3/marketing-events/batch/update` — Batch update events
- `POST /marketing/v3/marketing-events/batch/archive` — Batch delete events

### Campaigns (v3)
- `GET /marketing/v3/campaigns` — List campaigns
- `POST /marketing/v3/campaigns` — Create a campaign
- `GET /marketing/v3/campaigns/{campaignGuid}` — Read a campaign
- `PATCH /marketing/v3/campaigns/{campaignGuid}` — Update a campaign
- `DELETE /marketing/v3/campaigns/{campaignGuid}` — Delete a campaign
- `POST /marketing/v3/campaigns/batch/create`
- `POST /marketing/v3/campaigns/batch/read`
- `POST /marketing/v3/campaigns/batch/update`
- `POST /marketing/v3/campaigns/batch/archive`
- `GET /marketing/v3/campaigns/{campaignGuid}/assets/{assetType}` — List associated assets
- `PUT /marketing/v3/campaigns/{campaignGuid}/assets/{assetType}/{assetId}` — Associate asset
- `DELETE /marketing/v3/campaigns/{campaignGuid}/assets/{assetType}/{assetId}` — Remove asset
- `GET /marketing/v3/campaigns/{campaignGuid}/reports/metrics` — Campaign metrics
- `GET /marketing/v3/campaigns/{campaignGuid}/reports/revenue` — Revenue report
- `POST /marketing/v3/campaigns/{campaignGuid}/budget` — Add budget item
- `GET /marketing/v3/campaigns/{campaignGuid}/budget/totals`

### Transactional Email (v3)
- `POST /marketing/v3/transactional/single-email/send` — Send a transactional email
- `GET /marketing/v3/transactional/smtp-tokens` — List SMTP tokens
- `POST /marketing/v3/transactional/smtp-tokens` — Create SMTP token
- `GET /marketing/v3/transactional/smtp-tokens/{tokenId}` — Read token
- `DELETE /marketing/v3/transactional/smtp-tokens/{tokenId}` — Delete token
- `POST /marketing/v3/transactional/smtp-tokens/{tokenId}/password-reset` — Reset password

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

### Inbox & Messages (v3)
- `GET /conversations/v3/conversations/inboxes` — List inboxes
- `GET /conversations/v3/conversations/inboxes/{inboxId}` — Read an inbox
- `GET /conversations/v3/conversations/threads` — List threads
- `GET /conversations/v3/conversations/threads/{threadId}` — Read a thread
- `PATCH /conversations/v3/conversations/threads/{threadId}` — Update a thread
- `DELETE /conversations/v3/conversations/threads/{threadId}` — Archive a thread
- `GET /conversations/v3/conversations/threads/{threadId}/messages` — Message history
- `POST /conversations/v3/conversations/threads/{threadId}/messages` — Send a message
- `GET /conversations/v3/conversations/threads/{threadId}/messages/{messageId}` — Read a message
- `GET /conversations/v3/conversations/channels` — List channels
- `GET /conversations/v3/conversations/channels/{channelId}` — Read a channel
- `GET /conversations/v3/conversations/channel-accounts` — List channel accounts
- `GET /conversations/v3/conversations/actors/{actorId}` — Read an actor
- `POST /conversations/v3/conversations/actors/batch/read` — Batch read actors

### Visitor Identification (v3)
- `POST /visitor-identification/v3/tokens/create` — Generate identification token for a visitor

---

## Files

- `POST /files/v3/files` — Upload a file (multipart)
- `PUT /files/v3/files/{fileId}` — Replace a file
- `GET /files/v3/files/{fileId}` — Read file metadata
- `PATCH /files/v3/files/{fileId}` — Update file properties
- `DELETE /files/v3/files/{fileId}` — Delete a file
- `DELETE /files/v3/files/{fileId}/gdpr-delete` — Permanently delete (GDPR)
- `GET /files/v3/files/{fileId}/signed-url` — Get signed URL for private file
- `GET /files/v3/files/{fileId}/download` — Download file
- `GET /files/v3/files/search` — Search files
- `GET /files/v3/files/stat/{path}` — Retrieve file by path
- `POST /files/v3/files/import-from-url/async` — Import from URL (async)
- `GET /files/v3/files/import-from-url/async/tasks/{taskId}/status` — Import status
- `POST /files/v3/folders` — Create a folder
- `GET /files/v3/folders/{folderId}` — Read folder by ID
- `PATCH /files/v3/folders/{folderId}` — Update folder by ID
- `DELETE /files/v3/folders/{folderId}` — Delete folder by ID
- `GET /files/v3/folders/{folderPath}` — Read folder by path
- `DELETE /files/v3/folders/{folderPath}` — Delete folder by path
- `GET /files/v3/folders/search` — Search folders
- `POST /files/v3/folders/update/async` — Async folder update
- `GET /files/v3/folders/update/async/tasks/{taskId}/status`

---

## Webhooks

- `GET /webhooks/v3/{appId}/settings` — Read webhook settings
- `PUT /webhooks/v3/{appId}/settings` — Update webhook settings (targetUrl, maxConcurrentRequests)
- `DELETE /webhooks/v3/{appId}/settings` — Delete webhook settings
- `GET /webhooks/v3/{appId}/subscriptions` — List subscriptions
- `POST /webhooks/v3/{appId}/subscriptions` — Create a subscription
- `GET /webhooks/v3/{appId}/subscriptions/{subscriptionId}` — Read a subscription
- `PATCH /webhooks/v3/{appId}/subscriptions/{subscriptionId}` — Update (enable/disable) subscription
- `DELETE /webhooks/v3/{appId}/subscriptions/{subscriptionId}` — Delete a subscription
- `POST /webhooks/v3/{appId}/subscriptions/batch/update` — Batch enable/disable subscriptions

**Subscription event types** (sample): `contact.creation`, `contact.propertyChange`, `contact.deletion`, `company.creation`, `deal.creation`, `deal.propertyChange`, `deal.deletion`, `ticket.creation`, `conversation.newMessage`

---

## Events

### Custom Behavioral Events (v3)
- `GET /events/v3/events` — Query events
- `GET /events/v3/events/event-types` — List event types

### Manage Event Definitions (v3)
- `GET /events/v3/event-definitions` — List event definitions
- `POST /events/v3/event-definitions` — Create event definition
- `GET /events/v3/event-definitions/{eventTemplateId}` — Read definition
- `PATCH /events/v3/event-definitions/{eventTemplateId}` — Update definition
- `DELETE /events/v3/event-definitions/{eventTemplateId}` — Delete definition

### Send Event Completions (v3)
- `POST /events/v3/send` — Send event completion

---

## Settings & Account

### User Provisioning (v3)
- `GET /settings/v3/users` — List users
- `POST /settings/v3/users` — Create a user
- `GET /settings/v3/users/{userId}` — Read a user
- `PUT /settings/v3/users/{userId}` — Update a user
- `DELETE /settings/v3/users/{userId}` — Remove a user
- `GET /settings/v3/users/roles` — List roles
- `GET /settings/v3/users/teams` — List teams

### Account Info (v3)
- `GET /account-info/v3/details` — Account details (portal ID, domain, timezone, hub type)
- `GET /account-info/v3/api-usage/daily/private-apps` — Daily API usage for Private Apps

### Communication Preferences / Subscriptions (v3)
- `GET /communication-preferences/v3/definitions` — List subscription type definitions
- `GET /communication-preferences/v3/status/email/{emailAddress}` — Get subscription status for email
- `POST /communication-preferences/v3/subscribe` — Subscribe a contact
- `POST /communication-preferences/v3/unsubscribe` — Unsubscribe a contact

### Business Units (v3)
- `GET /business-units/v3/business-units/user/{userId}` — List business units for a user

### Multicurrency (v3)
- `GET /settings/v3/currencies` — List enabled currencies
- Endpoints for exchange rate management

---

## Data Studio

### Datasource Ingestion (2025-09)
- `POST /data-ingestion/2025-09` — Ingest data into a custom data source
- `GET /data-ingestion/2025-09/{taskId}` — Check ingestion task status

---

*Full OpenAPI schemas available at `/tmp/HubSpot-public-api-spec-collection/PublicApiSpecs/` (local clone) or https://github.com/HubSpot/public-api-spec-collection*
