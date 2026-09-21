---
name: hubspot-cms-react
description: "Build HubSpot CMS React projects — project structure, JSX fields API, Island components for interactivity, HubL templates referencing React modules, and deployment"
compatibility: "Content Hub Professional+ for React modules/templates; Enterprise for serverless; CLI v8+; Node.js v22+; Developer Platform 2026.09"
license: MIT
metadata:
    author: georgestephanis
    version: "1.2"
    written: "2026-09-21"
    written_against:
        hubspot-cli: "8.15.0"
        hubspot-developer-platform: "2026.09"
        hubspot-cms-components: "latest"
        content-hub: "Professional+"
        nodejs: "v22"
---

## When to use

Use this skill when:
- Building CMS templates or modules using React and TypeScript rather than HubL
- The project team prefers JSX component patterns over HubL templating
- You need React state, hooks, or the npm ecosystem within CMS content modules
- Starting a new project-based CMS workflow with `hsproject.json`

**HubL theme vs. React CMS project:**

| | HubL Theme | React CMS Project |
|---|---|---|
| Language | HubL (Jinja-based) | JSX / TSX + React |
| Design Manager | Full file browser | Not visible — CLI only |
| Local dev | `hs watch` | `hs project dev` (or `npm start`) |
| Deploy | `hs upload` | `hs project upload` |
| Min tier | Starter | Professional |
| With serverless | Enterprise | Enterprise |
| Build step | None | npm build via Vite |

Use HubL for content-focused sites with editors comfortable in Design Manager. Use React CMS for developer-owned codebases that need component composition, TypeScript, or interactive UIs.

## Inputs required

- Node.js v22+ (`node --version`) — required by Developer Platform 2025.2 and later
- HubSpot CLI installed and authenticated — see `hubspot-cli`
- Content Hub Professional or Enterprise subscription
- HubSpot account ID (needed for the dev server proxy)

## Procedure

### 1. Scaffold a new project

```bash
# Scaffold using the official create tool
npx @hubspot/create-cms-theme@latest
# Prompts for: project name, account, template (getting-started or blank)

# Or use the CLI project create command:
hs project create
# Select "CMS Theme" from the template list
```

Both approaches produce:

```
my-project/
├── hsproject.json
└── src/
    └── getting-started-theme/     # your theme directory
        ├── theme.json
        ├── fields.json            # Theme Settings (same format as HubL)
        ├── package.json
        ├── tsconfig.json
        ├── Globals.d.ts
        ├── constants.ts
        ├── utils.ts
        ├── assets/
        ├── components/
        │   ├── islands/           # interactive (client-side) components
        │   └── modules/           # module entry points
        │       ├── Header/
        │       ├── Footer/
        │       └── Weather/
        ├── styles/                # CSS modules (.module.css)
        └── templates/
            ├── layouts/
            │   └── base.hubl.html
            └── weather.hubl.html
```

### 2. `hsproject.json`

```json
{
  "name": "my-cms-project",
  "srcDir": "src",
  "platformVersion": "2026.09"
}
```

`platformVersion` controls which Developer Platform features are available. Use
`2026.09` (current GA) for new projects. Note that `2023.2` **sunset on 2025-10-01**
and `2025.1` sunset on 2026-08-01 — projects pinned to either will fail to build.

### 3. `package.json` — key dependencies

From the [official getting-started example](https://github.com/HubSpot/cms-react/tree/main/examples/getting-started-project-theme):

```json
{
  "type": "module",
  "dependencies": {
    "@hubspot/cms-components": "latest",
    "react": "^18.1.0"
  },
  "devDependencies": {
    "@hubspot/cms-dev-server": "latest",
    "@vitejs/plugin-react": "^2.1.0",
    "vitest": "^0.24.3"
  },
  "scripts": {
    "start": "hs-cms-dev-server . --ssl",
    "test": "vitest"
  }
}
```

`@hubspot/cms-components` provides HubSpot's React component library, field primitives, and the `Island` wrapper. `@hubspot/cms-dev-server` powers the local dev server.

### 4. Module structure — the three exports

Every React module is a directory containing `index.tsx` (or `.jsx`) with three named exports:

```tsx
// components/modules/Header/index.tsx
import React from 'react';
import { Menu } from '@hubspot/cms-components';
import {
  ImageField,
  MenuField,
  ModuleFields,
} from '@hubspot/cms-components/fields';
import logo from '../../../assets/sprocket.svg';
import headerStyles from '../../../styles/header.module.css';

// 1. Component — receives fieldValues as props
export function Component({ fieldValues }: any) {
  const { src, alt, width, height } = fieldValues.logo;
  return (
    <header className={headerStyles.wrapper}>
      <nav>
        <img src={src} alt={alt} width={width} height={height} />
        <Menu fieldPath="menu" />
      </nav>
    </header>
  );
}

// 2. fields — JSX field definitions (replaces fields.json for React modules)
const DEFAULT_MENU_ID = 'YOUR_MENU_ID_HERE';
export const fields = (
  <ModuleFields>
    <ImageField
      name="logo"
      label="Logo"
      default={{ src: logo, height: 100, alt: 'Site logo' }}
      resizable={true}
    />
    <MenuField name="menu" label="Menu" default={DEFAULT_MENU_ID} />
  </ModuleFields>
);

// 3. meta — module metadata
export const meta = {
  label: 'Header Module',
};
```

**JSX field components from `@hubspot/cms-components/fields`:**

| JSX component | Equivalent JSON type |
|---|---|
| `<TextField>` | `text` |
| `<RichTextField>` | `richtext` |
| `<ImageField>` | `image` |
| `<LinkField>` | `link` |
| `<NumberField>` | `number` |
| `<BooleanField>` | `boolean` |
| `<ChoiceField>` | `choice` |
| `<ColorField>` | `color` |
| `<FontField>` | `font` |
| `<MenuField>` | `menu` |
| `<PageField>` | `page` |
| `<FormField>` | `form` |
| `<GroupField>` | `group` |
| `<RepeatedGroupField>` | `group` with `occurrence` |
| `<ModuleFields>` | root wrapper (required) |

### 5. Island components — client-side interactivity

React components render **server-side by default**. For interactive components that need `useState`, `useEffect`, or browser APIs, use the **Island** pattern — the component is hydrated in the browser.

```tsx
// components/modules/Weather/index.tsx
import { Island } from '@hubspot/cms-components';
import WeatherForecast from '../../islands/WeatherForecast.tsx?island';
import { ModuleFields, TextField } from '@hubspot/cms-components/fields';

export function Component({ fieldValues }: any) {
  const { headline } = fieldValues;
  return <Island module={WeatherForecast} headline={headline} />;
}

export const fields = (
  <ModuleFields>
    <TextField
      label="Weather Headline"
      name="headline"
      default="Get the latest weather forecast"
    />
  </ModuleFields>
);

export const meta = { label: 'Weather Module' };
```

```tsx
// components/islands/WeatherForecast.tsx  ← note the ?island import suffix above
import { useState } from 'react';

interface Props { headline: string; }

export default function WeatherForecast({ headline }: Props) {
  const [city, setCity] = useState('');
  const [data, setData] = useState<any>(null);

  const fetchWeather = () => {
    // Fetch from your serverless function or a public API
    fetch(`/hs/serverless/weather?city=${encodeURIComponent(city)}`)
      .then(r => r.json())
      .then(setData);
  };

  return (
    <div>
      <h1>{headline}</h1>
      <input
        type="text"
        placeholder="Enter city"
        onChange={e => setCity(e.target.value)}
      />
      <button onClick={fetchWeather}>Get Forecast</button>
      {data?.forecast && <p>{data.forecast.summary}</p>}
    </div>
  );
}
```

**Island rules:**
- Import the file with `?island` suffix to mark it for client-side hydration
- The Island file must be the **default export**
- Props passed to `<Island>` are serialised to JSON — keep them serialisable
- CSS modules work in both server and island components

### 6. CSS modules

Co-locate styles with components:

```
styles/
├── header.module.css
├── weather.module.css
└── global.css          # non-module global styles
```

```css
/* header.module.css */
.wrapper {
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
}
```

```tsx
import headerStyles from '../../../styles/header.module.css';
// ...
<header className={headerStyles.wrapper}>
```

HubSpot's build pipeline scopes CSS module class names automatically.

### 7. HubL template wrapping a React module

Templates in a React theme are still HubL `.hubl.html` files that reference React modules via `{% module %}`:

```html
<!--
  templateType: page
  isAvailableForNewContent: true
  label: Getting Started - Weather Forecast
-->
{% extends "./layouts/base.hubl.html" %}

{% block body %}
  {% module "weather" path="../components/modules/Weather" %}
{% endblock body %}
```

The base layout is a HubL file too:

```html
<!--
  templateType: none
-->
<!DOCTYPE html>
<html lang="{{ html_lang }}" {{ html_lang_dir }}>
  <head>
    <meta charset="utf-8" />
    <title>{{ page_meta.html_title }}</title>
    {{ standard_header_includes }}
  </head>
  <body>
    <div class="body-wrapper {{ builtin_body_classes }}">
      {% block header %}
        {% module 'main header' path="../../components/modules/Header" %}
      {% endblock header %}

      {% block body %}{% endblock body %}

      {% block footer %}
        {% module 'footer' path="../../components/modules/Footer" %}
      {% endblock footer %}
    </div>
    {{ standard_footer_includes }}
  </body>
</html>
```

The `{% module %}` tag with a path pointing into `components/modules/` is how HubL templates mount React components.

### 8. Local development

```bash
cd my-project
npm install

# Start local dev server (watches, builds, proxies HubSpot)
npm start
# or: hs project dev
```

Opens `https://hslocal.net:3000/`. The dev server:
- Hot-reloads React components on save (no page refresh needed for component changes)
- Proxies CMS data from your HubSpot account
- Requires CLI authentication

Accept the self-signed SSL certificate on first launch.

### 9. Deploy to HubSpot

```bash
hs project upload
```

Runs the Vite build and uploads compiled assets to HubSpot. Typically takes 30–60 seconds.

**Check deploy logs if it fails:**
```bash
hs project logs
```

### 10. CI/CD with GitHub Actions

Use the [hubspot-project-upload-action](https://github.com/HubSpot/hubspot-project-upload-action):

```yaml
# .github/workflows/deploy.yml
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
      - name: Deploy HubSpot Project
        uses: HubSpot/hubspot-project-upload-action@v1
        with:
          account_id: ${{ vars.HUBSPOT_ACCOUNT_ID }}
          personal_access_key: ${{ secrets.HUBSPOT_PERSONAL_ACCESS_KEY }}
```

Note: for theme-only projects (no `app.json`), use the `hubspot-cms-deploy-action` with `src_dir`/`dest_dir` instead (see `hubspot-cms-themes`).

### 11. `cms-assets` pattern — adding React modules to an existing HubL theme

The full React CMS project pattern (`hsproject.json` + `src/`) replaces a HubL theme entirely. When you want to add React modules to an **existing HubL theme** without a full conversion, use the `cms-assets` project pattern instead.

**Structure:**

```
my-project/
├── hsproject.json
└── src/
    └── cms-assets/                  # React modules living alongside the HubL theme
        ├── cms-assets.json          # replaces theme.json for this pattern
        ├── package.json
        └── components/
            └── modules/
                └── InteractiveMap/
                    └── index.tsx
```

`cms-assets.json` (instead of `theme.json`):

```json
{
  "label": "CMS Assets",
  "type": "cms-assets"
}
```

The HubL theme files remain in their existing Design Manager location. React modules in `src/cms-assets/` are deployed by `hs project upload` and referenced from HubL templates using a project path:

```html
{% module "interactive_map"
  path="@projects/my-project/cms-assets/components/modules/InteractiveMap"
%}
```

Use this pattern when:
- An existing HubL theme is already live and you do not want to migrate it
- You want to introduce one or two React modules without a full project rewrite
- The team works primarily in HubL but needs a specific interactive component

### 12. GraphQL data fetching

React CMS modules can query HubSpot CRM and CMS data at render time using GraphQL via HubSpot's Collector API. This is the server-side data fetching pattern for React modules (no serverless function required).

**Enable in `app.json`:**

```json
{
  "scopes": [
    "collector.graphql_schema.read",
    "collector.graphql_query.execute"
  ]
}
```

**Fetch data in a module component:**

```tsx
// components/modules/ContactList/index.tsx
import { useServerlessFunctionResult } from '@hubspot/cms-components';

export function Component({ fieldValues }: any) {
  const { data } = useServerlessFunctionResult(
    '/hs/serverless/contacts',
    { method: 'GET' }
  );

  if (!data) return <p>Loading…</p>;

  return (
    <ul>
      {data.contacts.map((c: any) => (
        <li key={c.id}>{c.properties.firstname} {c.properties.lastname}</li>
      ))}
    </ul>
  );
}
```

For full GraphQL query examples and schema exploration, see the [graphql-storybook example](https://github.com/HubSpot/cms-react/tree/main/examples/graphql-storybook) in the `HubSpot/cms-react` repo. The example demonstrates:
- Querying CRM objects (contacts, companies, custom objects) by GraphQL
- The `/collector/graphql` endpoint
- Storybook-based component development with mocked GraphQL responses

The GraphQL endpoint is at `/_hcms/api/graphql` (available once the required scopes are added to `app.json` and the project is deployed).

## Verification

- `npm start` opens `https://hslocal.net:3000/` and lists theme templates
- Editing a component file triggers hot reload without a full page refresh
- `hs project upload` completes with no build errors
- Module appears in the HubSpot page editor with the fields defined in `fields`
- Island component renders interactively in the browser (not just server-rendered HTML)
- TypeScript: `npx tsc --noEmit` passes with no errors

## Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| `npm start` fails with Node error | Node < v22 | `nvm use 22` or install Node 22 |
| Module not in editor | Missing or wrong `meta.label`, or project not uploaded | Check `meta` export; run `hs project upload` |
| Island not interactive | Missing `?island` import suffix | Import as `import Foo from './Foo.tsx?island'` |
| Props not reaching Island | Non-serialisable props passed to `<Island>` | Props must be JSON-serialisable (no functions, class instances) |
| Build fails: "cannot find module" | Dependency not installed | Run `npm install` inside the theme directory |
| HubL template can't find React module | Wrong relative path in `{% module %}` | Path is relative to template file; use `..` to navigate up |
| `standard_header_includes` missing | Omitted from base layout | Required in all HubL base layouts — add to `<head>` |
| React assets not in Design Manager | Expected — React CMS assets are not Design Manager files | Use CLI / project workflow only for these assets |

## Escalation

- For serverless functions called from Island components, see `hubspot-cms-serverless`.
- For HubL templates and module field types in non-React themes, see `hubspot-cms-modules` and `hubspot-cms-templates`.
- For UI extensions in CRM record sidebars (not CMS pages), see `hubspot-ui-extensions`.
- Reference repos: [cms-react examples](https://github.com/HubSpot/cms-react/tree/main/examples), [hubspot-project-upload-action](https://github.com/HubSpot/hubspot-project-upload-action)
