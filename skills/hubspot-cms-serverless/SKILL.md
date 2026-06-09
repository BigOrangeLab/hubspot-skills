---
name: hubspot-cms-serverless
description: "Write and deploy HubSpot CMS serverless functions — endpoint functions, secrets, logging, and calling third-party APIs from CMS pages"
compatibility: "Content Hub Enterprise only; Node.js v20+; CLI v7+"
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-06-09"
    written_against:
        hubspot-cli: "7.10"
        content-hub: "Enterprise"
        nodejs: "v20"
---

## When to use

Use this skill when:
- A CMS page needs to call an external API (weather, inventory, third-party data) server-side
- You need to process form data or run logic not expressible in HubL
- Building a dynamic data endpoint accessible via URL from JavaScript on a CMS page
- Integrating a CMS page with HubSpot CRM data via server-side logic

**Important:** CMS serverless functions (endpoint functions in themes/standalone) are a **Content Hub Enterprise** feature. They are distinct from serverless functions in Developer Projects (Private Apps), which have different requirements. This skill covers CMS theme-based serverless functions.

## Inputs required

- HubSpot account with **Content Hub Enterprise** subscription
- HubSpot CLI installed and authenticated (see `hubspot-cms-local-dev`)
- Node.js v20+ (v18 support ended October 2025; new functions must use v20+)
- The function's purpose: what endpoint does it expose, what data does it fetch/process?
- Any API keys or secrets the function needs

## Procedure

### 1. Create a serverless function via CLI

```bash
hs create function
# Prompts for:
#   - Name of the parent functions folder
#   - Function file name
#   - HTTP methods (GET, POST, etc.)
#   - Endpoint path (e.g., /my-endpoint)
```

This creates a `.functions` directory:

```
my-functions.functions/
├── serverless.json       # registers functions and their endpoints
└── my-endpoint.js        # the function handler
```

### 2. `serverless.json` structure

```json
{
  "runtime": "nodejs20.x",
  "version": "1.0",
  "environment": {
    "MY_CONFIG_VAR": "non-secret value"
  },
  "secrets": ["MY_API_KEY"],
  "endpoints": {
    "get-data": {
      "method": "GET",
      "file": "get-data.js"
    },
    "submit-form": {
      "method": "POST",
      "file": "submit-form.js"
    }
  }
}
```

- `runtime`: always use `nodejs20.x` (v18 is end-of-life for new deployments)
- `secrets`: array of secret names to inject as environment variables
- `endpoints`: maps URL path segments to handler files and HTTP methods
- The function is accessible at `/_hcms/api/<endpoint-name>`

### 3. Function handler structure

```js
// get-data.js
const https = require('https');

exports.main = async (context, sendResponse) => {
  const { MY_API_KEY } = process.env;
  const { queryParameters, body, headers } = context;

  try {
    // Fetch from an external API
    const data = await fetchExternalData(MY_API_KEY, queryParameters.query);

    sendResponse({
      statusCode: 200,
      body: JSON.stringify({ results: data }),
    });
  } catch (err) {
    console.error('Function error:', err.message);
    sendResponse({
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data' }),
    });
  }
};

async function fetchExternalData(apiKey, query) {
  // ... your fetch logic
}
```

**The `context` object:**

```js
{
  queryParameters: { key: 'value' },   // URL query string params
  body: { ... },                        // POST body (parsed JSON or form data)
  headers: { authorization: '...' },   // request headers
  params: { },                          // path parameters
  accountId: 123456,                    // the HubSpot portal ID
  limits: {
    timeRemaining: 9000                 // ms remaining before timeout (10s max)
  }
}
```

### 4. Manage secrets

Secrets are stored encrypted in HubSpot — never hardcode API keys in function files.

```bash
# Add a secret
hs secrets add MY_API_KEY
# Prompts for the secret value

# List secrets
hs secrets list

# Delete a secret
hs secrets delete MY_API_KEY
```

Reference in function code:
```js
const apiKey = process.env.MY_API_KEY;
```

### 5. Upload and deploy

```bash
# Upload the functions directory
hs upload ./my-functions.functions my-functions.functions

# Watch during development
hs watch ./my-functions.functions my-functions.functions
```

The endpoint becomes available at:
`https://<your-hubspot-domain>/_hcms/api/<endpoint-name>`

### 6. Call the function from a CMS page

In a module's `module.js` or a `<script>` in a template:

```js
// GET request with query params
fetch('/_hcms/api/get-data?query=mySearch')
  .then(res => res.json())
  .then(data => {
    document.querySelector('#results').innerHTML = data.results
      .map(r => `<li>${r.name}</li>`)
      .join('');
  })
  .catch(err => console.error(err));
```

```js
// POST request with body
fetch('/_hcms/api/submit-form', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', name: 'Alice' })
})
  .then(res => res.json())
  .then(data => { /* handle response */ });
```

### 7. View logs

```bash
hs logs <function-name>
```

- Logs include `console.log()` / `console.error()` output, execution time, and status codes
- Logs are retained for **90 days**
- You can also view logs in HubSpot UI: **CRM Development → Private Apps → [App] → Logs**

### 8. Local testing

The CLI does not run functions locally. Options for local testing:
1. Upload to a sandbox/developer HubSpot account and test there
2. Extract business logic into a testable module and unit-test it with Node.js
3. Use `hs watch` to get rapid upload-and-test cycles

### 9. Constraints and limits

| Constraint | Limit |
|---|---|
| Execution timeout | 10 seconds |
| Memory | 128 MB |
| Log retention | 90 days |
| Runtime | Node.js v20.x only (v18 deprecated) |
| Concurrent executions | Subject to HubSpot account limits |
| Secrets per function | Unlimited |

## Verification

- `hs upload` completes without error
- `GET https://<domain>/_hcms/api/<endpoint>` returns expected JSON
- `hs logs <function-name>` shows `console.log()` output from test requests
- Function responses are visible in browser devtools Network tab when called from page JS

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| 404 on endpoint URL | `serverless.json` endpoint name typo or upload not completed | Check `serverless.json` endpoint key matches URL segment; re-upload |
| 500 with no body | Unhandled exception in handler | Check `hs logs`; add `try/catch` and `console.error` |
| Timeout (10s) | External API too slow or network issue | Add timeout to your `fetch` calls; consider caching |
| `process.env.MY_SECRET` is undefined | Secret not added or wrong name | Run `hs secrets list`; names are case-sensitive |
| "Content Hub Enterprise required" | Account not on Enterprise | Confirm subscription; serverless functions are Enterprise-only |
| Old v18 function won't re-deploy | Node v18 end-of-life | Update `serverless.json` `runtime` to `nodejs20.x` |

## Escalation

- For server-side functions within Developer Projects (private apps), the pattern differs — see `hubspot-private-apps`.
- For React CMS projects with serverless integration, see `hubspot-cms-react`.
- For accessing HubSpot CRM data from a function, add the private app access token as a secret and call the HubSpot API from the function.
- [Serverless functions docs](https://developers.hubspot.com/docs/cms/features/serverless-functions)
