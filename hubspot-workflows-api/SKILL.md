---
name: hubspot-workflows-api
description: "Create and manage HubSpot automation workflows programmatically using the Flows v4 API — read existing workflows, enroll contacts, build custom coded actions in Developer Platform projects, trigger workflows from external events, and wire up Breeze AI Agent Tools."
compatibility: "Marketing Hub Pro/Enterprise, Sales Hub Pro/Enterprise, or Service Hub Pro/Enterprise for workflows. Operations Hub Pro/Enterprise for custom coded actions. Developer Platform v2025.2 for project-based custom actions."
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-06-09"
    written_against:
        hubspot-api: "automation/v4"
        hubspot-developer-platform: "2025.2"
---

## When to use

- Reading or auditing existing HubSpot workflows via API
- Enrolling a contact (or other object) in a workflow programmatically after an external trigger
- Building a **custom coded workflow action** that runs Node.js code as a step in a visual workflow
- Exposing a workflow action as a **Breeze AI Agent Tool** so HubSpot's AI can invoke it
- Triggering workflows from external events via Custom Behavioral Events
- Managing workflow state (enable/disable, clone) programmatically

**Not needed for:**
- Creating simple marketing workflows in the UI — do that in HubSpot directly
- Subscribing to CRM change events — use Webhooks instead (see `hubspot-webhooks` skill)

---

## Inputs required

- Private App token with `automation` scope for Flows API operations
- For custom coded actions: HubSpot CLI v8.x, Developer Platform project, Operations Hub Pro/Enterprise
- For enrollment API: `automation` scope + the workflow ID and enrolled object ID
- For Breeze AI Agent Tools: Developer Platform v2025.2 project

---

## Procedure

### 1. Flows API — CRUD

**Base URL:** `https://api.hubapi.com/automation/v4/flows/`

**List all workflows:**

```
GET /automation/v4/flows
  ?type=CONTACT_BASED
  &limit=100
  &after=<cursor>
```

Response:

```json
{
  "results": [
    {
      "id": "12345",
      "name": "New Lead Nurture",
      "type": "CONTACT_BASED",
      "enabled": true,
      "insertedAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z"
    }
  ],
  "paging": { "next": { "after": "NTI1" } }
}
```

**Get a specific workflow:**

```
GET /automation/v4/flows/{flowId}
```

Returns the full flow object including `enrollmentCriteria`, `actions` array, and execution settings.

**Create a workflow:**

```
POST /automation/v4/flows
```

```json
{
  "name": "Post-Demo Follow-Up",
  "type": "CONTACT_BASED",
  "enabled": true,
  "enrollmentCriteria": {
    "type": "LIST_MEMBERSHIP",
    "listId": "ILS-123456"
  },
  "actions": [
    {
      "type": "DELAY",
      "delayMillis": 86400000,
      "actionId": "delay-1"
    },
    {
      "type": "SET_PROPERTY",
      "objectType": "CONTACT",
      "propertyName": "hs_lead_status",
      "newValue": "IN_PROGRESS",
      "actionId": "set-1"
    }
  ]
}
```

**Update a workflow:**

```
PATCH /automation/v4/flows/{flowId}
```

```json
{ "enabled": false }
```

**Delete a workflow:**

```
DELETE /automation/v4/flows/{flowId}
```

**Workflow types:**

| type | Triggered by |
|---|---|
| `CONTACT_BASED` | Contact enrollment criteria |
| `COMPANY_BASED` | Company criteria |
| `DEAL_BASED` | Deal criteria |
| `TICKET_BASED` | Ticket criteria |
| `QUOTE_BASED` | Quote criteria |
| `GOAL_BASED` | Goal target criteria |
| `LEAD_BASED` | Lead criteria |
| `CONVERSATION_BASED` | Conversation criteria |
| `FEEDBACK_BASED` | Feedback submission |

---

### 2. Enrollment API — enroll objects programmatically

Trigger a workflow on demand for a specific object, regardless of enrollment criteria.

**Enroll a contact:**

```
POST /automation/v4/enrollments/contacts/{contactId}/flows/{flowId}
```

No request body needed. Returns `204 No Content` on success.

**Unenroll a contact:**

```
DELETE /automation/v4/enrollments/contacts/{contactId}/flows/{flowId}
```

**List current enrollments for a flow:**

```
GET /automation/v4/enrollments
  ?flowId={flowId}
  &limit=100
```

**Pattern — enroll after an external event:**

```javascript
async function enrollAfterExternalTrigger(contactId, workflowId, token) {
  const res = await fetch(
    `https://api.hubapi.com/automation/v4/enrollments/contacts/${contactId}/flows/${workflowId}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Enrollment failed: ${err.message}`);
  }
}
```

---

### 3. Custom coded workflow actions (Developer Platform)

A custom coded action is a Node.js function that runs as a step in any visual workflow. Users drag it into the workflow canvas like any built-in action.

#### 3a. Scaffold the project

```bash
hs project create \
  --name=my-workflow-actions \
  --dest=./my-workflow-actions \
  --platform-version=2025.2
```

When prompted (or via `hs project add`), add a **custom workflow action** feature.

**Project structure:**

```
my-workflow-actions/
├── hsproject.json
└── src/
    └── app/
        └── extensions/
            └── my-action.functions/
                ├── serverless.json
                ├── my-action.js          # The function code
                └── my-action-hsmeta.json # Action configuration
```

#### 3b. Configure the action (`my-action-hsmeta.json`)

```json
{
  "type": "CUSTOM_ACTION",
  "uid": "my-action",
  "data": {
    "actionLabels": {
      "actionName": "Enrich Contact from My API",
      "actionDescription": "Looks up the contact in My API and updates a property"
    },
    "functions": [
      {
        "functionType": "EXECUTE",
        "functionSource": "my-action.js"
      }
    ],
    "inputFields": [
      {
        "typeDefinition": {
          "name": "email",
          "type": "STRING",
          "fieldType": "TEXT",
          "optionTypes": []
        },
        "supportedValueTypes": ["STATIC_VALUE", "OBJECT_PROPERTY"],
        "isRequired": true,
        "automationFieldType": "CONTACT",
        "label": "Contact Email"
      }
    ],
    "outputFields": [
      {
        "typeDefinition": {
          "name": "externalScore",
          "type": "NUMBER",
          "fieldType": "NUMBER"
        },
        "label": "External Score"
      }
    ]
  }
}
```

**Input field types:**

| `type` | Use for |
|---|---|
| `STRING` | Text values |
| `NUMBER` | Numeric values |
| `BOOL` | True/false |
| `DATE` | Date (millisecond timestamp) |
| `DATETIME` | Datetime (millisecond timestamp) |
| `ENUMERATION` | Picklist — pair with `options` array |

`supportedValueTypes`:
- `STATIC_VALUE` — user types a fixed value in the workflow editor
- `OBJECT_PROPERTY` — user maps to a CRM property on the enrolled object

#### 3c. Write the function handler

```javascript
// my-action.js
const fetch = require('node-fetch');

exports.main = async (event, callback) => {
  try {
    // Input fields bound by the workflow editor
    const email = event.inputFields['email'];
    const objectId = event.object.objectId;
    const objectType = event.object.objectType; // e.g., "CONTACT"
    const portalId = event.origin.portalId;

    // Call external API using a secret
    const apiKey = process.env.EXTERNAL_API_KEY;
    const response = await fetch(`https://api.example.com/lookup?email=${encodeURIComponent(email)}`, {
      headers: { 'X-Api-Key': apiKey },
    });

    if (!response.ok) {
      // Mark action as failed — workflow will surface an error to the user
      return callback({ error: `External API returned ${response.status}` });
    }

    const data = await response.json();

    // Output fields become available to downstream workflow steps
    callback({
      outputFields: {
        externalScore: data.score,
      },
    });
  } catch (err) {
    callback({ error: err.message });
  }
};
```

**`event` object shape:**

```javascript
{
  object: {
    objectType: "CONTACT",          // Object type being processed
    objectId: "98765432",           // ID of the enrolled object
  },
  inputFields: {
    email: "alice@example.com",     // Values from workflow editor
  },
  origin: {
    portalId: 12345678,
    actionDefinitionId: "...",
  }
}
```

**`callback` options:**

```javascript
// Success with output fields
callback({ outputFields: { myField: "value" } });

// Success with no outputs
callback({});

// Failure (surfaces error in workflow history)
callback({ error: "Descriptive error message" });
```

#### 3d. Add secrets

```bash
hs secrets add EXTERNAL_API_KEY
```

Reference in `serverless.json`:

```json
{
  "functions": [
    { "path": "my-action", "file": "my-action.js", "environment": "NODE_18" }
  ],
  "secrets": ["EXTERNAL_API_KEY"]
}
```

#### 3e. Deploy

```bash
hs project install-deps
hs project upload
hs project deploy
```

After deploy, the action appears in the workflow editor under **Custom** → your action name.

---

### 4. Breeze AI Agent Tools

An **Agent Tool** is a custom workflow action that HubSpot's Breeze AI can autonomously call. When defined as an Agent Tool, Breeze can invoke it when processing an AI-powered task.

Add `"isAgentTool": true` to the action's hsmeta `data` block:

```json
{
  "type": "CUSTOM_ACTION",
  "uid": "my-agent-tool",
  "data": {
    "isAgentTool": true,
    "actionLabels": {
      "actionName": "Look Up Customer Risk Score",
      "actionDescription": "Returns a risk score for the enrolled contact from the risk API. Higher score = more risk."
    },
    "functions": [...],
    "inputFields": [...],
    "outputFields": [...]
  }
}
```

The `actionDescription` is surfaced to the AI model — write it clearly and include what the outputs mean. The function implementation is identical to a normal custom coded action.

---

### 5. Custom Behavioral Events — trigger workflows from external actions

Custom Behavioral Events let you send an event from outside HubSpot (e.g., a user clicks something in your app) and use it as a workflow enrollment trigger.

**Create the event definition** (one-time, via API or UI):

```
POST https://api.hubapi.com/events/v3/event-definitions
```

```json
{
  "name": "User Completed Onboarding",
  "description": "Fired when a user completes the onboarding flow in the external app",
  "primaryObject": "CONTACT",
  "propertyDefinitions": [
    { "name": "plan_type", "label": "Plan Type", "type": "enumeration",
      "options": [{"label": "Free", "value": "free"}, {"label": "Paid", "value": "paid"}] },
    { "name": "steps_completed", "label": "Steps Completed", "type": "number" }
  ]
}
```

**Send an event occurrence:**

```
POST https://api.hubapi.com/events/v3/send
```

```json
{
  "eventName": "pe12345678_user_completed_onboarding",
  "email": "alice@example.com",
  "properties": {
    "plan_type": "paid",
    "steps_completed": 7
  },
  "occurredAt": "2026-06-09T12:00:00Z"
}
```

`eventName` format: `pe{portalId}_{snake_case_name}` — the full name is returned when you create the definition.

In HubSpot, create a workflow with enrollment trigger **"Has completed event: User Completed Onboarding"**. Properties from the event are available as tokens in workflow actions.

---

## Verification

```bash
# List first 10 workflows
curl -s \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/automation/v4/flows?limit=10" \
  | jq '.results[] | {id, name, type, enabled}'

# Enroll a contact in a workflow
curl -s -X POST \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
  "https://api.hubapi.com/automation/v4/enrollments/contacts/CONTACT_ID/flows/FLOW_ID"
# Expect 204 No Content
```

For custom actions:
1. Deploy with `hs project upload && hs project deploy`
2. Open a workflow in HubSpot → Add action → Custom → your action should appear
3. Configure inputs and save the workflow
4. Enroll a test contact → check workflow history for action execution and output values

---

## Failure modes

| Error | Cause | Fix |
|---|---|---|
| `403 FORBIDDEN` on Flows API | Token missing `automation` scope | Add `automation` scope to the private app |
| `404` on enrollment | Wrong flow ID or contact not found | Confirm IDs via `GET /automation/v4/flows` and CRM API |
| `409` on enrollment | Contact already enrolled | Check enrollment status first; unenroll before re-enrolling |
| Custom action not visible in workflow editor | Not deployed or deployed to wrong account | Run `hs project deploy`; check `hs account current` |
| `callback` not called within 60s | Function timeout | Optimize external API calls; add timeout handling |
| Output fields not available downstream | Wrong field name in `outputFields` config vs. `callback` | Names must match exactly between hsmeta `outputFields[].typeDefinition.name` and `callback({outputFields:{...}})` |
| Breeze not using the Agent Tool | `isAgentTool` missing or description unclear | Set `"isAgentTool": true`; write a clear `actionDescription` |
| Custom Behavioral Event not triggering workflow | Wrong `eventName` format or portal mismatch | Use the full `pe{portalId}_name` format returned by the definition API |
| Workflow runs but custom action errors | Secret missing or external API down | Check `hs project logs`; verify `hs secrets list` |

---

## Escalation

- Flows API reference: https://developers.hubspot.com/docs/api/automation/workflows
- Enrollment API: https://developers.hubspot.com/docs/api/automation/workflow-enrollment
- Custom coded actions: https://developers.hubspot.com/docs/developer-tooling/custom-workflow-actions
- Custom Behavioral Events: https://developers.hubspot.com/docs/api/analytics/events
- For project build/deploy: see `hubspot-cli` skill
- For secrets management: see `hubspot-cms-serverless` skill
- For CRM data access inside actions: see `hubspot-crm-objects` skill + `hubspot-private-apps` skill
