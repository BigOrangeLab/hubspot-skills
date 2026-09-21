---
name: hubspot-cms-serverless
description: "Write and deploy HubSpot CMS serverless functions — two distinct patterns (standalone theme functions vs. project-based app functions), secrets, logging, and calling external APIs"
compatibility: "Content Hub Enterprise (standalone endpoint functions); Enterprise subscription for project app functions; Node.js v22+; CLI v8+"
license: MIT
metadata:
    author: georgestephanis
    version: "1.2"
    written: "2026-09-21"
    written_against:
        hubspot-cli: "8.15.0"
        content-hub: "Enterprise"
        nodejs: "v20"
---

## When to use

Use this skill when:
- A CMS page needs to call an external API server-side (weather, inventory, third-party enrichment)
- Processing form submissions or running server-side business logic from a CMS page
- A React CMS module needs to hit an API without exposing credentials in the browser
- Integrating CMS pages with HubSpot CRM data via server-side calls

**There are two distinct serverless patterns in HubSpot. Choose based on your project setup:**

| Pattern | Where functions live | URL prefix | Tier |
|---|---|---|---|
| **Standalone** (theme/CMS file system) | `*.functions/` directory uploaded via `hs upload` | `/_hcms/api/<endpoint>` | Content Hub Enterprise |
| **Project-based** (inside an `hsproject.json` project) | `<app>.functions/` inside a project's `src/app/` | `/hs/serverless/<endpoint>` | Enterprise subscription |

This skill covers both. The project-based pattern is the modern default for React CMS projects.

## Inputs required

- HubSpot account with **Content Hub Enterprise** (standalone) or **Enterprise subscription** (project-based)
- Node.js v22+ (`node --version`) — v18 and v20 are end-of-life for new HubSpot serverless deployments
- HubSpot CLI installed and authenticated — see `hubspot-cms-local-dev`
- External API credentials (store as HubSpot secrets, never hard-code)

## Procedure

---

## Pattern A: Standalone endpoint functions (theme / CMS file system)

Use this when working with a standard HubL theme — no `hsproject.json` required.

### A1. Create a functions directory

```bash
hs create function
# Prompts: parent folder name, function file name, HTTP methods, endpoint path
```

Creates:
```
my-functions.functions/
├── serverless.json     # registers endpoints
└── my-endpoint.js      # handler file
```

### A2. `serverless.json`

```json
{
  "runtime": "nodejs20.x",
  "version": "1.0",
  "environment": {
    "PUBLIC_CONFIG": "non-secret value"
  },
  "secrets": ["WEATHER_API_KEY", "HUBSPOT_TOKEN"],
  "endpoints": {
    "get-weather": {
      "method": "GET",
      "file": "get-weather.js"
    },
    "submit-lead": {
      "method": "POST",
      "file": "submit-lead.js"
    }
  }
}
```

- `runtime`: use `nodejs20.x` — `nodejs18.x` cannot be deployed for new functions
- `secrets`: names of secrets added via `hs secrets add`; injected as `process.env.*`
- `endpoints`: maps URL path segments to handler files

### A3. Handler structure

```js
// get-weather.js
const https = require('https');

exports.main = async (context, sendResponse) => {
  const { WEATHER_API_KEY } = process.env;
  const { queryParameters } = context;
  const city = queryParameters.city || 'London';

  try {
    const data = await fetchWeather(WEATHER_API_KEY, city);
    sendResponse({
      statusCode: 200,
      body: JSON.stringify({ city, forecast: data }),
    });
  } catch (err) {
    console.error('Weather fetch failed:', err.message);
    sendResponse({
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not fetch weather data' }),
    });
  }
};
```

**The `context` object:**

```js
{
  queryParameters: { city: 'London' },  // URL query string
  body: { ... },                         // parsed POST body
  headers: { 'x-custom': 'value' },
  accountId: 12345678,                   // HubSpot portal ID
  limits: { timeRemaining: 9000 }        // ms before 10s timeout
}
```

### A4. Call from page JavaScript

Standalone functions are available at `/_hcms/api/<endpoint-name>`:

```js
// In a module's module.js or a <script> block in a template:
fetch('/_hcms/api/get-weather?city=London')
  .then(r => r.json())
  .then(data => {
    document.getElementById('weather').textContent = data.forecast.summary;
  });
```

```js
// POST example
fetch('/_hcms/api/submit-lead', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', source: 'homepage' }),
})
  .then(r => r.json())
  .then(data => { /* handle response */ });
```

### A5. Upload and watch

```bash
hs upload ./my-functions.functions my-functions.functions
# or as part of a theme watch:
hs watch ./my-theme themes/my-theme
```

### A6. View logs

```bash
hs logs my-functions --follow
```

- Includes `console.log()` / `console.error()` output, execution time, status codes
- Retained for 90 days
- Also visible in **Design Manager → Serverless Functions**

---

## Pattern B: Project-based app functions (Developer Platform)

Use this for React CMS projects or any project built with `hsproject.json`. Based on the [HubSpot CMS React + Serverless example](https://github.com/HubSpot/cms-react/tree/main/examples/serverless).

### B1. Project structure

```
my-project/
├── hsproject.json
└── src/
    └── app/
        ├── app.json                    # app metadata and OAuth scopes
        └── app.functions/              # functions directory
            ├── serverless.json         # registers app functions
            ├── parrot-function.js      # handler
            └── package.json            # per-functions npm dependencies
```

### B2. `app.json`

```json
{
  "name": "My CMS App",
  "description": "CMS React project with serverless data fetching",
  "scopes": [
    "crm.objects.contacts.read",
    "crm.objects.companies.read",
    "collector.graphql_schema.read",
    "collector.graphql_query.execute"
  ],
  "uid": "my_cms_app",
  "public": false
}
```

Add only the OAuth scopes your functions actually use.

### B3. Project `serverless.json`

Project-based functions use `appFunctions` instead of `endpoints`:

```json
{
  "appFunctions": {
    "parrotFunction": {
      "file": "parrot-function.js",
      "endpoint": {
        "path": "parrot",
        "method": ["GET"]
      }
    },
    "fetchContact": {
      "file": "fetch-contact.js",
      "endpoint": {
        "path": "contact",
        "method": ["GET"]
      }
    }
  }
}
```

### B4. Handler — same `exports.main` signature

```js
// parrot-function.js — from HubSpot's cms-react serverless example
exports.main = async (context) => {
  return {
    statusCode: 200,
    body: {
      message: `SQUAWK: ${context.params.message}`,
    },
  };
};
```

Note: project handlers **return** the response object rather than calling `sendResponse`.

```js
// fetch-contact.js — CRM API call example
exports.main = async (context) => {
  const { contactId } = context.params;
  const token = process.env.HUBSPOT_TOKEN;

  const res = await fetch(
    `https://api.hubapi.com/crm/objects/2026-09/contacts/${contactId}?properties=firstname,lastname,email`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const contact = await res.json();

  return {
    statusCode: 200,
    body: { firstname: contact.properties.firstname, email: contact.properties.email },
  };
};
```

### B5. Call from a React Island component

Project-based functions are at `/hs/serverless/<endpoint-path>`:

```jsx
// MakeServerlessRequestIsland.jsx
import { useState } from 'react';

export default function MakeServerlessRequestIsland() {
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    fetch(`/hs/serverless/parrot?message=${encodeURIComponent(message)}`)
      .then(r => r.json())
      .then(data => setResults(prev => [...prev, data.message]));
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
      <ul>
        {results.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </form>
  );
}
```

The Island component wraps this in the parent module entry point:

```jsx
// index.jsx
import { Island } from '@hubspot/cms-components';
import MakeServerlessRequestIsland from './MakeServerlessRequestIsland?island';

export function Component() {
  return (
    <Island
      id="make-serverless-request"
      module={MakeServerlessRequestIsland}
    />
  );
}
export const fields = [];
export const meta = { label: 'Serverless Demo' };
```

### B6. Deploy the project

```bash
hs project upload
```

This builds and deploys both the React assets and the serverless functions together.

---

## Managing secrets (both patterns)

```bash
# Add a secret
hs secrets add WEATHER_API_KEY
# Prompts for the value (not echoed)

# List secrets (names only — values never shown)
hs secrets list

# Delete a secret
hs secrets delete WEATHER_API_KEY
```

Reference in any handler:
```js
const apiKey = process.env.WEATHER_API_KEY;
```

Never commit secret values. Never read them from `process.argv` or query parameters.

## Constraints and limits

| Constraint | Limit |
|---|---|
| Execution timeout | 10 seconds |
| Memory | 128 MB |
| Runtime | `nodejs20.x` only (v18 deprecated Oct 2025) |
| Log retention | 90 days |
| Standalone endpoint URL | `/_hcms/api/<endpoint>` |
| Project function URL | `/hs/serverless/<path>` |

## Verification

- Standalone: `GET https://<domain>/_hcms/api/<endpoint>` returns expected JSON
- Project: `GET https://<domain>/hs/serverless/<path>` returns expected JSON
- `hs logs` shows `console.log()` output and execution time
- Secrets listed in `hs secrets list`; `process.env.MY_SECRET` is non-null at runtime

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| 404 on `/_hcms/api/` | Wrong endpoint name or standalone function not uploaded | Check `serverless.json` key matches URL segment; re-upload |
| 404 on `/hs/serverless/` | Project not deployed or `endpoint.path` mismatch | Run `hs project upload`; check `appFunctions` path in `serverless.json` |
| 500 with empty body | Unhandled exception in handler | Add `try/catch`; check `hs logs` |
| 10-second timeout | External API slow or hung | Add `AbortController` timeout to `fetch` calls; cache aggressively |
| `process.env.MY_SECRET` undefined | Secret not added or wrong name | Run `hs secrets list`; names are case-sensitive |
| "Enterprise required" error | Account not on Content Hub Enterprise | Confirm subscription tier |
| `nodejs18.x` deploy rejected | v18 end-of-life | Change `runtime` in `serverless.json` to `nodejs20.x` |

## Escalation

- For calling HubSpot CRM APIs from a function, store an account service key as a secret and call `https://api.hubapi.com/crm/objects/2026-09/...` with `Authorization: Bearer <token>`.
- For UI extension app functions (in CRM cards, not CMS pages), see `hubspot-ui-extensions`.
- For React Island components that call serverless functions, see `hubspot-cms-react`.
- Reference: [cms-react serverless example](https://github.com/HubSpot/cms-react/tree/main/examples/serverless)
