# HubSpot AI features — requirements, credit triggers, gotchas

The 2026 naming is a mix. In July 2026 HubSpot moved its agents into **Agent
Hub**, renamed Breeze Studio to **Agent Builder**, and largely dropped "Breeze"
as an umbrella brand. "Breeze" survives mainly in **Breeze Assistant** (the
in-app chat assistant, formerly Copilot) and older enrichment docs ("Breeze
Intelligence"). Users and docs use the old and new names interchangeably.

All agents need the account-wide AI toggles described in
*Settings → Account management → AI → Access* (see the end of this file), a
paid seat, and a non-zero credit balance. Credit actions never run in sandboxes.

---

## Breeze Assistant (formerly Copilot)

- **Cost:** free. It isn't on the rate sheet.
- **Availability:** all editions, including free tools.
- **Toggles:** the generative AI master switch plus "Give users access to Breeze Assistant."
- **What it does:** a chat assistant with access to CRM data, the user's role, and page context. It can update records and enroll contacts into the Prospecting Agent (with approval). It's also available inside Microsoft 365 Copilot.
- **Gotcha:** actions it *starts* may cost credits. For example, enrolling a lead into a Prospecting Agent play charges the Prospecting Agent rate.

## Customer Agent

- **Cost:** 50 per resolved text conversation; 50 per minute of voice (beta). Escalated conversations (to a human within 72h) are free. Testing, previews, and the free trial period are free.
- **Requirements:** Professional or Enterprise of Marketing, Sales, Service, Data, Content, or Revenue Hub, or Smart CRM. Credits are needed before deploying to channels. Users need the **Customer agent editor** permission.
- **Channels:** chat, email, forms, calling (beta). It can also run from workflows and bots, and suggest replies in help desk.
- **Knowledge sources:** HubSpot KB and content, public URLs (crawls up to 5,000 URLs per domain, with include/exclude path filters), and short answers.
- **Setup:** *Service → Customer Agent → Set up your agent*. Give it a name and personality (or brand voice) and add sources. Then configure identity, CRM access, content, actions, guidelines, and handoff. Test it over email or live chat as a specific contact or segment, then deploy.
- **Gotchas:**
  - Agents **can't be deleted**, only edited or paused.
  - Forecast *resolutions*, not conversations. A high resolution rate means higher cost, which is the point.
  - At 50 per resolution, the Pro allotment of 3,000 covers about 60 resolutions a month if nothing else draws from the pool.
  - Use a separate agent per brand if the account uses brands.

## Prospecting Agent

- **Cost:** 100 per lead the agent writes personalized outreach for. This applies to recommended **and** manually enrolled leads. Some play settings add more charged steps. Third parties report a research task at 10, which isn't on the official sheet.
- **Requirements:** Starter, Pro, or Enterprise of Marketing, Sales, Service, Data, or Content Hub. **Smart CRM requires Pro or Enterprise.** Users must be a Super Admin or have **Access prospecting agent**. Pausing credit use requires **Modify billing and change name on contract**.
- **AI toggles:** generative AI, CRM data, customer conversation data, **and files data** (which is off by default).
- **Setup:** *Sales → Prospecting Agent → Create play*. The play has these tabs:
  - **Audience:** segments, intent signals, personas, and a daily suggestion limit. The agent finds up to 3 contacts per company.
  - **Selling context**
  - **Outreach:** Sequence or Adaptive (Adaptive sets the maximum emails per enrollment).
  - **Guardrails:** sender, tone, language, CTAs, send window.
  - **Automation:** review before sending, or send automatically.

  Then *Test → Review and turn on → Publish*.
- **Enrollment:** monitored-company recommendations; automatic triggers (page view, form submission, days since engagement, added to list); manual bulk enrollment; Breeze Assistant; workflow actions; one external source at a time (Apollo, Surfe, ZoomInfo, or Seamless).
- **Gotchas:**
  - Edits to a play apply only to newly enrolled contacts.
  - The agent only considers engagement from the last 12 months.
  - Automatic enrollment triggers plus a high daily limit can burn 100 credits per lead quickly. Lower the daily suggestion limit first, then set a feature limit.
  - Third parties report lead caps and 30-day auto-unenrollment (added in April 2026). Neither appears in the KB article.

## Data Agent and smart properties

- **Cost:** 10 per prompt per record, charged **whether or not a useful value comes back**.
- **Requirements:** Starter, Pro, or Enterprise of Marketing, Sales, Service, Data, or Content Hub. Smart CRM and Revenue Hub need Pro or Enterprise. Each user needs the **Data Agent access** toggle (Super Admins have it by default).
- **AI toggles:** generative AI, CRM data, customer conversation data, files data.
- **Surfaces:**
  - **Smart properties:** AI-filled custom properties whose prompt can reference other properties via tokens. Each prompt uses one source: web research, company website, property data, or call transcripts.
  - **Workflow actions:** *Data Agent: Fill Smart Property* and *Data Agent: Research*.
  - **Data Studio smart columns:** AI research or analysis columns on datasets.
  - **Intent signals** (see below).
- **Setup:** *Data Management → Data Agent → Create smart property*. Pick the object, label, and field type, then *Add data agent prompt*. Choose a source, preview, and apply. **Quick fill** is optional, and it starts spending immediately.
- **Gotchas:**
  - The cost is records × prompts. 5,000 companies × 3 smart properties = 150,000 credits (≈ $1,500).
  - "Quick fill" on create charges for every existing record of that object. Fill a filtered segment through a workflow instead.
  - Records missing the input (no domain, no transcript) still charge and come back blank.
  - Don't put sensitive data in prompts.

## Workflow AI actions

- **Cost:** 10 per execution of a Breeze or AI action inside a workflow. The rest of the workflow is free.
- **Gotchas:**
  - Re-enrollment, loops, or branches that hit the action more than once per record multiply the cost.
  - Put filters *before* the AI action.
- **"Run agent" action:** runs an agent from a workflow. It's free while in beta, and HubSpot says it will charge once out of beta. It's reportedly capped at 500 executions per day.

## Agent Builder custom agents and Work agents

- **Cost:** 1 per **action unit**. The number of units varies per run depending on how much work the agent does, so the cost isn't fixed per outcome.
- **Availability:** Agent Builder is included in Starter (simple automation), Pro, and Enterprise (advanced automation and event-based triggers).
- **Controls:**
  - The editor shows an **estimated credit cost** while you test. Testing itself is free.
  - Set per-agent run limits and a feature limit before publishing.
- **Charging since:** 2026-07-23. Before that, custom agents were free in private beta.
- **Developer-built tools:** an agent tool defined in a Developer Platform project isn't billed by itself. The agent's action units are. See `hubspot-workflows-api` §4.

## Other agents (beta)

| Agent | Credits | Notes |
|---|---|---|
| Content Agent | 1,000 per piece | The most expensive unit on the sheet. One piece uses a third of a Pro allotment |
| Knowledge Base Agent | 200 per new article | Mines tickets and conversations for undocumented questions; pairs with Customer Agent |
| Nurture Agent | 10 per personalized email | Scales linearly with list size |
| Revenue Agent | 500 per invoice outreach | Requires human approval for each action |

## Intent (buyer intent, powered by Data Agent)

- **Cost:** 10 per monitored company per month (recurring, charged on enable). Creating a company from market segments costs 10 (beta). A custom signal costs 50 per company per signal per month (beta).
- **Free tier:** intent orchestration shows only the top 10 companies by visits.
- **Control:** this is the only feature with **action-level** limits (*Manage usage by feature → Intent → Usage by action*).
- **Gotcha:** it's recurring, so 1,000 monitored companies costs 10,000 credits **every month** until they're removed.

## Data Studio (beta)

- **Cost:** 25, 75, or 200 per dataset use in a workflow, segment, CRM sync, or export, depending on the primary source's row count (<500k / 500k–5M / >5M). Reporting use is free.
- **Gotcha:** a recurring CRM sync charges on every run. A daily sync of a 1M-row dataset is 75 × 30 = 2,250 credits a month.

## Standard data enrichment

- **Cost:** none. It used to be Breeze Intelligence on separate credits, and has been included with paid tiers since about September 2025.
- **Limits:** about 14 contact and 26 company properties. It never fills email or phone, skips contacts without a business email, and caps bulk enrichment from index pages at 100 records per action. It isn't available on free CRM.
- **Gotcha:** smart properties are **not** enrichment and do cost credits.

---

## AI settings toggles

Go to *Settings → Account management → AI → Access*. The toggles are account-wide.

| Toggle | Default | Needed by |
|---|---|---|
| Give users access to generative AI tools and features | On | Everything |
| CRM data | On | Agents, Assistant, smart properties |
| Customer conversation data | On | Customer, Prospecting, and Data agents; inbox AI |
| Files data | **Off** | Prospecting Agent, Data Agent, content generation |
| Give users access to Breeze Assistant | On | Breeze Assistant |
| AI model training (opt-out) | n/a | Separate from feature access. Opting out keeps features working, and data removal takes up to about a week |

- **No per-record exclusion.** There's no setting to keep specific contacts or companies out of AI processing.
- Turning off data toggles to hide one feature is a blunt fix. It can break other features, such as the Assistant.
