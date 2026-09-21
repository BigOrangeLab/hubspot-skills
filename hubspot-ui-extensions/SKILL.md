---
name: hubspot-ui-extensions
description: "Build React-based CRM cards and full-page UI extensions that appear inside HubSpot record sidebars, index pages, and home pages. Covers project structure, card configuration, the hubspot.extend() entry point, SDK hooks, the HubSpot component library, serverless function calls, and the hs project dev/upload/deploy workflow."
compatibility: "Sales Hub Enterprise, Service Hub Enterprise, or CRM Suite Enterprise required for production use. Developer Platform 2026.09. Legacy CRM Extensions API deprecated Oct 31, 2026; legacy public apps unsupported September 2027."
license: MIT
metadata:
    author: georgestephanis
    version: "1.1"
    written: "2026-09-21"
    written_against:
        hubspot-developer-platform: "2026.09"
        hubspot-cli: "8.15.0"
---

## When to use

- Adding a custom panel to a contact, company, deal, ticket, or custom object record sidebar
- Building a full-page tab on a CRM object index or home page
- Displaying external data (from a third-party API or your own backend) inline within a CRM record
- Allowing reps to trigger actions (send a message, create an external record, look up data) from within a HubSpot record
- Replacing a legacy CRM Extension card before the Oct 31, 2026 deprecation deadline

Do **not** use if you need to embed arbitrary HTML/CSS — the UI Extension SDK restricts rendering to HubSpot's own component library.

---

## Inputs required

- HubSpot account with Sales Hub Enterprise, Service Hub Enterprise, or CRM Suite Enterprise
- HubSpot CLI v8.x (`npm install -g @hubspot/cli`)
- CLI authenticated (`hs account auth`) with a developer account or sandbox
- Node.js v22+ (required by Developer Platform 2025.2+)
- An account service key if the card needs to call the HubSpot API from a serverless function

---

## Procedure

### 1. Scaffold the project

```bash
hs project create \
  --name=my-crm-extension \
  --dest=./my-crm-extension \
  --platform-version=2026.09
```

When prompted for features, select **CRM card** (or run `hs project add` after creation to add one).

**Resulting project structure:**

```
my-crm-extension/
├── hsproject.json                  # Project config
└── src/
    └── app/
        ├── extensions/
        │   ├── my-card.jsx         # React component
        │   └── my-card.functions/  # Optional serverless functions
        │       ├── serverless.json
        │       └── my-function.js
        └── app.functions/          # App-level serverless functions (optional)
```

**`hsproject.json`:**

```json
{
  "name": "my-crm-extension",
  "platformVersion": "2026.09"
}
```

---

### 2. Understand the card config file (`*-hsmeta.json`)

Every card is described by a `<uid>-hsmeta.json` file alongside the `.jsx` entry point.
Run `hs project get-feature-schema --feature=card` (via MCP) or check the docs for valid fields.

**Example: `my-card-hsmeta.json`**

```json
{
  "name": "My CRM Card",
  "uid": "my-card",
  "type": "crm-card",
  "data": {
    "title": "My Card Title",
    "location": "crm.record.sidebar",
    "objectTypes": [
      { "name": "contacts" },
      { "name": "companies" },
      { "name": "deals" }
    ]
  }
}
```

**`location` values:**

| Value | Displays in |
|---|---|
| `crm.record.sidebar` | Right sidebar of a CRM record (most common) |
| `crm.record.tab` | New tab on a CRM record page |
| `crm.index-page.tab` | Tab on object index page (contacts list, etc.) |
| `crm.home-page.tab` | Tab on the CRM home page |
| `crm.settings-page.tab` | Tab in account Settings |

**`objectTypes` — all valid `name` values:**

| name | Object |
|---|---|
| `contacts` | Contacts |
| `companies` | Companies |
| `deals` | Deals |
| `tickets` | Tickets |
| `p_*` | All custom object types (wildcard) |
| `p_<objectTypeId>` | A specific custom object type |

---

### 3. Write the card component

Every card entry point calls `hubspot.extend()` to register a render function.

```jsx
// my-card.jsx
import React, { useState } from 'react';
import { hubspot } from '@hubspot/ui-extensions';
import {
  Button,
  Flex,
  Text,
  Heading,
  LoadingSpinner,
  Alert,
} from '@hubspot/ui-extensions';

hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <MyCard
    context={context}
    runServerlessFunction={runServerlessFunction}
    actions={actions}
  />
));

function MyCard({ context, runServerlessFunction, actions }) {
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [result, setResult] = useState(null);

  const handleLookup = async () => {
    setStatus('loading');
    try {
      const { response } = await runServerlessFunction({
        name: 'lookup',
        parameters: { objectId: context.crm.objectId },
      });
      setResult(response);
      setStatus('done');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <Flex direction="column" gap="small">
      <Heading>External Data</Heading>
      {status === 'loading' && <LoadingSpinner label="Looking up..." />}
      {status === 'error' && <Alert title="Lookup failed" variant="error" />}
      {status === 'done' && result && (
        <Text>Status: {result.externalStatus}</Text>
      )}
      <Button onClick={handleLookup} disabled={status === 'loading'}>
        Fetch External Data
      </Button>
    </Flex>
  );
}
```

**`context` object shape:**

```javascript
{
  crm: {
    objectId: "123456",          // ID of the current record
    objectTypeId: "0-1",         // 0-1=contacts, 0-2=companies, 0-3=deals, 0-5=tickets
    portalId: 12345678,
  },
  user: {
    id: 111222,
    email: "rep@company.com",
    locale: "en",
  }
}
```

---

### 4. SDK hooks

Import from `@hubspot/ui-extensions`:

```javascript
import {
  useCrmProperties,
  useAssociations,
  useCrmSearch,
  useObjectId,
  useObjectTypeId,
  useAlert,
  hubspot,
} from '@hubspot/ui-extensions';
```

**`useCrmProperties`** — read and write CRM properties on the current record:

```jsx
const { properties, loading } = useCrmProperties(['firstname', 'email', 'lifecyclestage']);
// properties: { firstname: "Alice", email: "alice@example.com", lifecyclestage: "lead" }
```

Write CRM properties back to the record:

```jsx
const { saveProperties } = useCrmProperties(['lifecyclestage']);
await saveProperties({ lifecyclestage: 'customer' });
```

**`useAssociations`** — read associated records:

```jsx
const { results: associated, loading } = useAssociations('companies');
// results: [{ id: "789", label: "ACME Corp" }, ...]
```

**`useCrmSearch`** — search CRM objects from within the card:

```jsx
const { runSearch, results, loading } = useCrmSearch();
await runSearch({
  objectType: 'deals',
  query: 'renewal',
  properties: ['dealname', 'amount', 'closedate'],
});
```

**`useObjectId` / `useObjectTypeId`** — get the current record's identifiers:

```jsx
const objectId = useObjectId();
const objectTypeId = useObjectTypeId();
```

**`useAlert`** — show a toast notification:

```jsx
const { addAlert } = useAlert();
addAlert({ message: 'Done!', type: 'success' });
```

---

### 5. HubSpot component library

All UI must use `@hubspot/ui-extensions` components — no raw HTML, no custom CSS files. Import from the package:

```jsx
import {
  Button, Flex, Box, Text, Heading,
  Input, Select, DateInput, NumberInput, TextArea,
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
  Tag, Divider, Image, Link, Alert,
  DescriptionList, DescriptionListItem,
  EmptyState, LoadingSpinner,
  Modal, Panel,
  Form, FormField,
  Badge, ButtonRow, ToggleGroup,
} from '@hubspot/ui-extensions';
```

**Layout:**

```jsx
<Flex direction="column" gap="medium" align="start">
  <Box padding="medium">
    <Heading>Section Title</Heading>
    <Text>Content here</Text>
  </Box>
</Flex>
```

**Button variants:** `primary`, `secondary`, `destructive`, `transparent`

**Alert variants:** `info`, `success`, `warning`, `error`

**Table example:**

```jsx
<Table>
  <TableHead>
    <TableRow>
      <TableHeader>Name</TableHeader>
      <TableHeader>Amount</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    {deals.map(d => (
      <TableRow key={d.id}>
        <TableCell>{d.properties.dealname}</TableCell>
        <TableCell>{d.properties.amount}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### 6. Calling serverless functions

The card calls your serverless function for anything that requires server-side auth (calling external APIs, calling HubSpot API with a service key, accessing secrets).

**Card side:**

```jsx
const { response } = await runServerlessFunction({
  name: 'lookup',                          // matches filename in *.functions/
  parameters: { objectId: '123' },          // passed as event.parameters
  propertiesToSend: ['email', 'firstname'], // CRM properties to include in event
});
```

**Function side** (`my-card.functions/lookup.js`):

```javascript
const https = require('https');

exports.main = async (context, sendResponse) => {
  const { objectId } = context.parameters;
  const token = process.env.HUBSPOT_TOKEN; // from hs secrets add HUBSPOT_TOKEN

  // Call HubSpot API
  const contact = await fetch(
    `https://api.hubapi.com/crm/objects/2026-09/contacts/${objectId}?properties=email,firstname`,
    { headers: { Authorization: `Bearer ${token}` } }
  ).then(r => r.json());

  // Call an external API
  const external = await fetch(
    `https://api.example.com/lookup?email=${contact.properties.email}`,
    { headers: { 'X-API-Key': process.env.EXTERNAL_API_KEY } }
  ).then(r => r.json());

  sendResponse({ externalStatus: external.status });
};
```

**`serverless.json`** in `my-card.functions/`:

```json
{
  "functions": [
    { "path": "lookup", "file": "lookup.js", "environment": "NODE_18" }
  ],
  "secrets": ["HUBSPOT_TOKEN", "EXTERNAL_API_KEY"]
}
```

Add secrets:

```bash
hs secrets add HUBSPOT_TOKEN
hs secrets add EXTERNAL_API_KEY
```

---

### 7. Actions API

Use `actions` (from `hubspot.extend`) or `useActions()` hook to trigger HubSpot behaviors:

```jsx
// Navigate to a CRM record
actions.openCrmRecordPage({ objectTypeId: '0-3', objectId: dealId });

// Show a toast notification
actions.addAlert({ message: 'Saved!', type: 'success' });

// Force refresh of properties displayed in the sidebar
actions.refreshObjectProperties();

// Open a modal with an external URL in an iframe
actions.openIFrameModal({
  uri: `https://yourapp.com/modal?objectId=${objectId}`,
  height: 600,
  width: 800,
  title: 'External App',
});
```

---

### 8. Dev, upload, and deploy workflow

```bash
cd my-crm-extension
hs project install-deps          # Install npm packages for all components
hs project dev                   # Start local dev with hot reload
```

`hs project dev` starts a sandbox preview. Changes to `.jsx` files hot-reload in the sandbox. Serverless function changes require a restart.

When ready to test in production account:

```bash
hs project upload                # Build and upload (creates build ID)
hs project get-build-status      # Wait for build to complete
hs project deploy                # Deploy the build to your account
```

Check card is visible: open a contact record in HubSpot → look in the right sidebar for your card.

---

### 9. Permissions

Define what CRM properties the card can read/write in the hsmeta.json under `data.permissions`:

```json
{
  "data": {
    "permissions": {
      "readCrmProperties": ["email", "firstname", "lifecyclestage"],
      "writeCrmProperties": ["lifecyclestage"]
    }
  }
}
```

Users also need the CRM object access permissions in HubSpot (set by admins under Settings → Users & Teams).

---

### 10. User-level access (2026.09, GA)

Developer Platform **2026.09** adds user-level app access: the app acts on behalf
of the specific logged-in user and enforces *that user's* HubSpot permissions,
rather than holding broad account-wide access.

Prefer this whenever an extension surfaces data the viewing user may not be
entitled to. It removes the class of bug where a card renders records the user
could not otherwise open.

Requires `"platformVersion": "2026.09"` in `hsproject.json`.

---

### 11. App Actions (public beta)

App Actions are a UI extension type that exposes a custom operation on selected
CRM records, surfaced through a modal or panel rather than an embedded card.

Reach for an App Action instead of a card when the extension is a *verb* the user
invokes against one or more records ("send to ERP", "recalculate quote") rather
than a *view* that renders alongside the record. A card that is mostly a button
is usually an App Action.

Public beta as of 2026-09 — confirm availability in the target portal before
building a production workflow on it.

---

## Verification

1. `hs project upload` completes without errors
2. `hs project deploy` returns success
3. Open a contact record in HubSpot → the card appears in the right sidebar under its configured title
4. The card renders without "Something went wrong" error
5. Clicking the action button calls the serverless function and updates the card

Check build errors:

```bash
hs project get-build-status      # Via MCP tool or CLI
hs project logs                  # Serverless function console.log output
```

---

## Failure modes

| Error | Cause | Fix |
|---|---|---|
| Card not visible after deploy | Wrong `objectTypes` or card deployed to wrong account | Confirm `objectTypes` includes the object type you're viewing; confirm `hs account current` |
| "Something went wrong" in card | Uncaught JS error in component | Open browser console on the HubSpot page; check `hs project logs` |
| Serverless function returns no data | Secret not added or wrong secret name | Run `hs secrets list`; check `serverless.json` secrets array matches |
| `hubspot.extend is not a function` | Wrong import or wrong package version | `import { hubspot } from '@hubspot/ui-extensions'` (not default import) |
| Custom HTML/CSS not rendering | Not supported — SDK only | Replace with `@hubspot/ui-extensions` components |
| `p_*` wildcard not matching custom objects | Platform version below 2025.2 | Update `hsproject.json` platformVersion to `2026.09` |
| Build fails with "feature schema" error | hsmeta.json has invalid fields | Call `get-feature-schema` MCP tool to get valid schema; fix hsmeta |
| Card appears but properties not loading | Properties not listed in `readCrmProperties` | Add the property names to `permissions.readCrmProperties` |
| Legacy card stopped working | CRM Extensions API deprecated Oct 31, 2026 | Migrate to UI Extensions using `hs project create` + card feature |

---

## Escalation

- UI Extensions overview: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/overview
- Component library: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/ui-extensions-sdk
- Migration from legacy: https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/overview
- For project build/deploy CLI commands: see `hubspot-cli` skill
- For serverless function secrets: see `hubspot-cms-serverless` skill
- For CRM property reading/writing (via API in serverless): see `hubspot-crm-objects` skill
- For MCP-assisted scaffolding: see `hubspot-mcp-server` skill
