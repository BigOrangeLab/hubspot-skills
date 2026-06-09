# HubSpot Skills TODO

Skills to build, grouped by domain. Existing skills: `hubl`, `hubspot-contact-sync`, `hubspot-public-api`, `jinjava`.

---

## CMS (Highest Priority)

### `hubspot-cms-themes`
Build and maintain HubSpot CMS themes locally using the HubSpot CLI.
- Theme file structure (`theme.json`, `fields.json`, `templates/`, `assets/`)
- Local development workflow: `hs init`, `hs auth`, `hs watch`, `hs upload`
- Theme settings and field types
- Drag-and-drop areas and flexible sections
- Child themes and overrides
- Lighthouse quality scoring via CLI
- VS Code extension integration
- Scaffolding with `npx @hubspot/create-cms-theme@latest`

### `hubspot-cms-modules`
Create custom CMS modules (the reusable content blocks placed in templates).
- Module file structure (`meta.json`, `fields.json`, `module.html`, `module.css`, `module.js`)
- Field types reference (text, image, link, richtext, color, choice, CRM object, etc.)
- Inline editing and design manager preview
- Global modules vs. page-level modules
- Module groups and repeating fields
- Testing module rendering locally

### `hubspot-cms-react`
Build CMS React projects — the modern alternative to HubL for templates and modules.
- Project structure (`hsproject.json`, `src/cms-assets/`, `cms-assets.json`)
- Bootstrapping: `hs project create`, `hs project upload`
- React component patterns within the CMS sandbox
- Fetching CRM/HubDB data from React components via serverless functions
- Differences between HubL themes and React CMS projects
- Node.js v20 requirement
- Auto-deploy configuration
- Content Hub Enterprise requirement for serverless + React CMS

### `hubspot-cms-templates`
Author page, blog, email, and system templates in HubL.
- Template types: page, blog listing, blog post, email, error pages, membership
- `extends` / `block` template inheritance
- Coded vs. drag-and-drop templates
- Dnd areas and layout sections
- Global content and global partials
- Custom coded email templates and drag-and-drop email areas
- Multi-language template variants

### `hubspot-cms-local-dev`
End-to-end local development workflow for CMS assets.
- CLI install and authentication (`hs init`, `hs auth`)
- Fetching, watching, and uploading assets
- `hslocal.net:3000` local preview server
- Multi-account config (CLI v7 multi-config support)
- Design Manager vs. CLI parity
- `.gitignore` patterns for HubSpot projects
- Syncing with GitHub / version control best practices

### `hubspot-hubdb`
Work with HubDB — HubSpot's relational table feature for dynamic CMS pages.
- Table creation and schema (`tablename.hubdb.json`)
- CLI commands: create, fetch, upload, clear rows (Developer Preview)
- Querying HubDB tables in HubL templates
- Dynamic pages pattern: listing page + detail page per row
- HubDB API (REST) for programmatic table management
- Row limits and publishing workflow
- Using HubDB as a lightweight CMS data source

### `hubspot-cms-serverless`
Write and deploy serverless functions for CMS pages (Content Hub Enterprise).
- Function file structure (`*.functions/`, `serverless.json`, `main` export)
- Endpoint functions vs. app functions
- Secrets management and environment variables
- `console.log` debugging and 90-day log retention
- Calling third-party APIs from serverless functions
- Node.js v20 runtime requirement
- Rate limits and cold-start considerations

### `hubspot-cms-membership`
Build password-protected, personalized member areas with Content Hub Enterprise.
- Enabling membership on pages and page groups
- Contact login and session management
- Personalizing content with CRM contact/company/deal properties in HubL
- Gating blog posts and landing pages
- Membership-compatible template patterns

---

## Developer Platform / Apps

### `hubspot-private-apps`
Create and manage private apps for single-account integrations.
- Creating a private app and configuring OAuth scopes
- Non-expiring access tokens vs. OAuth refresh flow
- Storing tokens as secrets
- Rate limits: 100 req/10 s, 250k req/day
- Using private apps in serverless functions and workflow custom actions
- Split-traffic pattern with multiple private apps

### `hubspot-public-apps-oauth`
Build public apps that work across multiple HubSpot accounts.
- OAuth 2.0 flow: authorization URL, token exchange, refresh
- Scope configuration and incremental authorization
- Token expiry (~30 min) and refresh-token rotation pitfalls
- App Marketplace listing requirements
- Webhooks API (public app required)
- Timeline events API

### `hubspot-ui-extensions`
Build React-based CRM cards and full-page UI extensions inside HubSpot records.
- Project structure and `*-hsmeta.json` card config
- `hubspot.extend()` entry point pattern
- HubSpot component library (no custom CSS/HTML)
- SDK hooks: `useCrmProperties`, `useAssociations`, `useCrmSearch`
- Calling serverless functions from card front-end
- GraphQL via `/collector/graphql`
- Extension locations: CRM record sidebars, home pages, settings pages
- `p_*` wildcard for targeting all custom object types
- Legacy CRM Extensions API deprecation: Oct 31, 2026
- Enterprise subscription requirements

### `hubspot-webhooks`
Subscribe to and process HubSpot webhooks reliably.
- Configuring webhook subscriptions in a public app
- Supported event types (contact created/updated, deal stage change, etc.)
- Payload structure and verification (client secret HMAC)
- Gaps in webhook coverage (bulk imports, some property changes)
- Hybrid pattern: webhooks + periodic polling + daily reconciliation
- Retry and deduplication strategies

### `hubspot-workflows-api`
Create and manage automation workflows programmatically.
- Workflows v4 API (`/automation/v4/flows/`)
- Reading existing workflow state
- Creating custom coded workflow actions
- Custom workflow actions in Developer Projects
- Triggering workflows from external events
- Agent Tools (Breeze AI integration)

---

## CRM APIs

### `hubspot-crm-objects`
General pattern for working with any CRM object (contacts, companies, deals, tickets, custom).
- Standard CRUD: `POST /crm/v3/objects/{objectType}`
- Batch create/read/update/archive
- Properties object structure and custom properties
- `associations` parameter in create/read calls
- Search API: `POST /crm/v3/objects/{objectType}/search` with filters
- Pagination with `after` cursor
- 429 handling and `Retry-After` backoff

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

### `hubspot-cli`
Reference skill for the HubSpot CLI (`hs` / `@hubspot/cli`).
- Install and version management
- `hs auth` and multi-account config (v7+)
- Core commands: `upload`, `fetch`, `watch`, `project upload`, `project create`
- HubDB CLI commands (Developer Preview)
- Debugging with `hs logs`
- MCP Server tooling (CLI v7.10+, Public Beta)

### `hubspot-mcp-server`
Use HubSpot's CLI-based Developer MCP Server with agentic IDEs.
- MCP Server Public Beta setup (CLI v7.10+)
- Available MCP tools and capabilities
- Connecting to Claude Code, Cursor, and other agentic IDEs
- Authentication and account targeting
- Known limitations and beta caveats

---

## Prioritization Notes

**Build first (CMS-focused, highest agent utility):**
1. `hubspot-cms-themes` — most common CMS dev entry point
2. `hubspot-cms-modules` — needed for any content block work
3. `hubspot-hubdb` — dynamic pages are a very common CMS pattern
4. `hubspot-cms-local-dev` — prerequisite knowledge for all CMS skills
5. `hubspot-cms-templates` — HubL template authoring depth

**Build second (platform / integrations):**
6. `hubspot-private-apps` — auth foundation for all API work
7. `hubspot-crm-objects` — general CRM CRUD pattern
8. `hubspot-ui-extensions` — modern CRM card development
9. `hubspot-webhooks` — event-driven integrations
10. `hubspot-workflows-api` — automation use cases

**Build when needed:**
- Remaining marketing, operations, and specialized skills
