---
name: hubspot-cms-react
description: "Build HubSpot CMS React projects — the modern alternative to HubL themes for CMS templates and modules using React and the HubSpot CLI"
compatibility: "Content Hub Enterprise (serverless); Content Hub Professional+ (React modules/templates); CLI v7+; Node.js v20+"
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-06-09"
    written_against:
        hubspot-cli: "7.10"
        content-hub: "Professional+"
        nodejs: "v20"
---

## When to use

Use this skill when:
- Building CMS templates or modules in React rather than HubL
- The team prefers JavaScript/JSX over HubL templating
- You need component composition, hooks, or the React ecosystem in CMS assets
- Starting a new project-based (hsproject.json) CMS development workflow

**HubL vs. React CMS — choose based on:**
- **HubL theme**: simpler setup, works on Starter+, more Design Manager-friendly, best for content-focused sites
- **React CMS project**: richer component model, familiar DX for JS teams, requires Content Hub Professional+, best for app-like or data-rich pages

React CMS assets are developed entirely via CLI — they do **not** appear in the Design Manager file browser.

## Inputs required

- HubSpot CLI installed and authenticated (see `hubspot-cms-local-dev`)
- Node.js v20+
- Content Hub Professional or Enterprise subscription
- Content Hub Enterprise if serverless functions will be used alongside React assets
- Decision: **theme project** (wraps a full site theme) vs. **cms-assets project** (React modules/templates only, no full theme wrapping)

## Procedure

### 1. Project structure: two patterns

**Pattern A — Theme project** (React-enhanced theme):

```
my-project/
├── hsproject.json
└── src/
    └── theme/
        ├── theme-hsmeta.json
        └── my-theme/
            ├── theme.json
            ├── fields.json
            ├── templates/
            ├── components/      # React components
            ├── styles/
            └── package.json
```

**Pattern B — CMS assets project** (React modules/templates, no theme):

```
my-project/
├── hsproject.json
└── src/
    └── cms-assets/
        ├── cms-assets-hsmeta.json
        └── my-react-assets/
            ├── cms-assets.json
            ├── components/
            ├── styles/
            └── package.json
```

Use Pattern A when building a full site. Use Pattern B when adding React-powered modules to an existing HubL theme.

### 2. Scaffold a new project

```bash
# Install CLI if not already installed
npm install -g @hubspot/cli

# Create a new CMS theme project (Pattern A)
npx @hubspot/create-cms-theme@latest
# Follow prompts for project name, account, theme name

# OR create from project template
hs project create
# Select "CMS Theme" or "CMS Assets" from the list
```

### 3. `hsproject.json`

The project manifest at the root:

```json
{
  "name": "my-cms-project",
  "srcDir": "src",
  "platformVersion": "2023.2"
}
```

`platformVersion` controls which HubSpot developer platform features are available. Use the most recent stable version when starting new projects.

### 4. React component patterns

React components in HubSpot CMS are standard React with some constraints:

```jsx
// src/theme/my-theme/components/FeatureCard.jsx
import React from 'react';

export function FeatureCard({ title, description, imageUrl, imageAlt }) {
  return (
    <article className="feature-card">
      {imageUrl && <img src={imageUrl} alt={imageAlt} />}
      <h2>{title}</h2>
      <p>{description}</p>
    </article>
  );
}
```

### 5. React module fields

React modules define their editable fields in a `fields.json` file alongside the component, using the same field type system as HubL modules:

```json
[
  { "type": "text", "name": "title", "label": "Title", "default": "Card Title" },
  { "type": "image", "name": "image", "label": "Card Image" },
  { "type": "richtext", "name": "description", "label": "Description" }
]
```

The module entry point receives field values as props:

```jsx
// FeatureCard/index.jsx — the module entry point
import React from 'react';
import { FeatureCard } from './FeatureCard';
import fields from './fields.json';

// HubSpot passes field values as props matching field names
export default function FeatureCardModule({ title, image, description }) {
  return (
    <FeatureCard
      title={title}
      description={description}
      imageUrl={image?.src}
      imageAlt={image?.alt}
    />
  );
}

export { fields };
```

### 6. React templates

A React template is a full page layout:

```jsx
// templates/LandingPage.jsx
import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function LandingPage({ children, pageTitle }) {
  return (
    <>
      <Header />
      <main>
        <h1>{pageTitle}</h1>
        {children}
      </main>
      <Footer />
    </>
  );
}

export const meta = {
  label: 'Landing Page',
  isAvailableForNewContent: true,
};
```

### 7. Fetching data in React CMS assets

React CMS components **cannot make direct API calls** from the browser to external APIs in an authenticated context. Use one of these patterns:

**Pattern A — HubSpot serverless function (Content Hub Enterprise):**
```jsx
import { useState, useEffect } from 'react';

export function TeamList() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetch('/_hcms/api/get-team-members')
      .then(r => r.json())
      .then(data => setMembers(data.members));
  }, []);

  return (
    <ul>
      {members.map(m => <li key={m.id}>{m.name}</li>)}
    </ul>
  );
}
```

**Pattern B — HubDB via public API (no auth needed if table is public):**
```jsx
useEffect(() => {
  fetch(`/cms/v3/hubdb/tables/team_members/rows`)
    .then(r => r.json())
    .then(data => setMembers(data.results));
}, []);
```

**Pattern C — Static data passed via module fields** (simplest, no API call):
Use `fields.json` to let editors enter or select data directly.

### 8. Local development server

```bash
cd my-project

# Install dependencies
npm install

# Start local dev (watches, builds, and proxies to HubSpot)
hs project dev
```

- Opens a local preview at `https://hslocal.net:3000/`
- Hot-reloads React components on save
- Requires CLI authentication to proxy CMS data from HubSpot

### 9. Build and deploy

```bash
# Build and upload to HubSpot
hs project upload

# Check deploy status
hs project logs
```

`hs project upload` runs the build step (`npm run build` in the project) and then deploys the compiled assets to HubSpot.

### 10. Auto-deploy configuration

To enable auto-deploy on push in CI/CD:

```yaml
# .github/workflows/deploy.yml
name: Deploy to HubSpot
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g @hubspot/cli
      - run: npm install
      - run: hs project upload
        env:
          HUBSPOT_PORTAL_ID: ${{ secrets.HUBSPOT_PORTAL_ID }}
          HUBSPOT_PERSONAL_ACCESS_KEY: ${{ secrets.HUBSPOT_PERSONAL_ACCESS_KEY }}
```

### 11. Differences from HubL themes

| Aspect | HubL Theme | React CMS Project |
|---|---|---|
| Language | HubL (Jinja-based) | JSX / React |
| Design Manager visibility | Full file browser | Not visible in Design Manager |
| Local dev | `hs watch` | `hs project dev` |
| Deploy | `hs upload` | `hs project upload` |
| Min subscription | Starter | Professional |
| Serverless | Enterprise (endpoint functions) | Enterprise (app functions) |
| Component reuse | HubL macros | React components |
| Build step | None | npm build |

## Verification

- `hs project dev` starts without error and opens preview at `https://hslocal.net:3000/`
- React components render in the local preview
- `hs project upload` succeeds and the theme/modules appear in HubSpot
- Edited module fields in the page editor update the React component props
- CI/CD deploy via GitHub Actions completes without error

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| `hs project dev` fails with Node version error | Node < v20 | Run `nvm use 20` or install Node 20 |
| Components not showing in editor | Wrong `cms-assets.json` or missing `isAvailableForNewContent` | Check module meta config and re-upload |
| Build fails on `hs project upload` | TypeScript/JSX errors | Run `npm run build` locally first to see errors |
| React assets not in Design Manager | Expected — React CMS assets are not Design Manager assets | Use CLI only for these assets |
| `/_hcms/api/` calls return 404 | Serverless function not uploaded or endpoint mismatch | Verify serverless upload and `serverless.json` endpoint name |
| Hot reload not working in `hs project dev` | Proxy connection dropped | Restart `hs project dev`; check CLI auth |

## Escalation

- For serverless functions backing React data fetching, see `hubspot-cms-serverless`.
- For HubL-based themes and modules, see `hubspot-cms-themes` and `hubspot-cms-modules`.
- For UI extensions inside CRM records (not CMS pages), see `hubspot-ui-extensions`.
- [CMS React projects docs](https://developers.hubspot.com/docs/cms/react-cms)
