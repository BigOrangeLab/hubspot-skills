---
name: hubspot-ai-credits
description: "HubSpot's AI features (Breeze Assistant, Customer/Prospecting/Data/Content/Knowledge Base agents, custom agents in Agent Builder, workflow AI actions, smart properties, buyer intent, Data Studio) and how HubSpot Credits pay for them — included monthly allotments by tier, the per-action rate sheet, capacity packs vs. pay-as-you-go overages, auto-upgrade, account/feature/action spend limits, usage monitoring, AI settings toggles, and estimating credit burn before turning a feature on. Use when a user asks what HubSpot AI costs, why credits ran out, how to cap AI spend, or whether a developer-built agent tool, MCP connection, or API integration consumes credits."
compatibility: "Seat-based pricing model, Starter/Professional/Enterprise editions of any Hub, Smart CRM, or Customer Platform. Credits are usable only by paid seats (Core, Sales, Service, Revenue) and Partner seats. Free tools and View-only seats cannot consume credits. Credit-consuming actions do not run in sandbox accounts."
license: MIT
metadata:
    author: georgestephanis
    version: "1.0"
    written: "2026-10-02"
    written_against:
        hubspot-credits-rate-sheet: "2026-09-09"
        hubspot-api: "2026-09"
---

> **Prices change, often with little notice.** HubSpot's billing article says
> rates for credit-consuming features "may change," that beta features may start
> consuming credits later, and that HubSpot aims for — but does not guarantee —
> 30 days' notice. Two repricings have already happened in 2026 (April 14 and
> July 23). Every number in this skill is a **snapshot as of 2026-09-09**. Before
> giving anyone a budget, re-check the **HubSpot Credits Rate Sheet** in the
> [Products & Services Catalog](https://legal.hubspot.com/hubspot-product-and-services-catalog)
> and the portal's own *Usage & Limits → HubSpot Credits* page. Many third-party
> guides still quote pre-April-2026 rates (e.g. Customer Agent at 100 credits per
> conversation) — treat blog figures as stale until confirmed.

## When to use

- "What does HubSpot's AI cost?" / "Do we pay extra for Breeze?" / "What are HubSpot Credits?"
- Credits ran out, a Breeze feature paused, or an unexpected capacity-pack charge or overage invoice appeared
- Estimating credit burn **before** enabling an agent, a smart property backfill, a workflow AI action, intent monitoring, or a Data Studio sync
- Setting up spend controls: maximum monthly credits, per-feature caps, pay-as-you-go vs. auto-upgrade
- An AI feature is greyed out or missing (usually an AI settings toggle, a seat, the edition, or a zero credit balance)
- A developer asks whether their **agent tool**, **custom workflow action**, **Remote CRM MCP** connection, or **API integration** consumes credits
- Comparing native HubSpot AI to bringing your own LLM via MCP or the API

Do **not** use this skill for:
- *Building* agent tools / custom workflow actions — see `hubspot-workflows-api`
- Connecting Claude Code, Cursor, etc. to HubSpot — see `hubspot-mcp-server`
- API call rate limits (requests per second/day) — those are a separate system; see `hubspot-public-api` and `hubspot-private-apps`
- Contact tiers, marketing contact limits, or seat pricing in general — not credit-based

---

## Mental model

```
 ┌───────────────────────── FREE (no credits) ─────────────────────────┐
 │ Breeze Assistant (formerly Copilot) · standard data enrichment       │
 │ plain workflows · Agent Builder automations · reports on Data Studio │
 │ datasets · API calls · Remote CRM MCP · agent/feature testing        │
 └──────────────────────────────────────────────────────────────────────┘
 ┌────────────────────── METERED (HubSpot Credits) ─────────────────────┐
 │ Per action:     Customer Agent resolution · Prospecting lead ·       │
 │                 Data Agent prompt × record · smart property fill ·   │
 │                 workflow AI action · Content/KB/Nurture/Revenue agent│
 │                 output · custom-agent action units · Data Studio use │
 │ Per recurrence: intent monitoring (charged on enable, then monthly)  │
 └──────────────────────────────────────────────────────────────────────┘
          │
          ▼ draws from one shared monthly pool per account
 included allotment (highest edition you own, NOT summed across hubs)
   + capacity packs (1,000 credits / $10, permanent for the term)
   + pay-as-you-go overage ($0.010/credit, billed in arrears) — opt-in
```

**Key rules:**

1. **One pool per account.** Every credit-consuming feature draws from the same monthly balance. A runaway smart-property backfill can starve the Customer Agent.
2. **The allotment comes from your highest edition and isn't added up across hubs.** Marketing Pro + Sales Enterprise gets the Enterprise allotment (5,000), not 3,000 + 5,000.
3. **Monthly reset, no rollover.** Credits reset on the usage-period start date. Unused credits expire.
4. **Included credits are used first**, then purchased capacity, then overage (if enabled).
5. **Only paid seats can trigger usage.** Free and View-only users can't use credit features.
6. **Outcome-based pricing for some agents.** Since 2026-04-14 the Customer Agent charges only for *resolved* conversations, and the Prospecting Agent only for *recommended or enrolled leads it writes outreach for*.

---

## Inputs required

Gather these before estimating or troubleshooting:

- **Editions owned** (all hubs, plus whether it's a Customer Platform bundle or Data Hub). This sets the included allotment.
- **Current credit settings**: purchased capacity packs, overage mode (auto-upgrade vs. pay-as-you-go), maximum monthly credits, and any feature limits. These are found in *Account & Billing → Usage & Limits → HubSpot Credits*.
- **Who's asking**: changing overage or limits requires a **Super Admin** or **Billing Admin**. Pausing a feature's credit use requires "Modify billing and change name on contract."
- **Expected volumes per month**, broken down by feature. For example: support conversations × expected resolution rate, leads to prospect, records × smart properties, workflow enrollments that hit an AI action, companies monitored for intent, and Data Studio dataset uses × row-count bracket.
- **Whether a feature is in beta.** Beta rates can change and features may start charging later (e.g. the "Run agent" workflow action).

---

## Procedure

### 1. Determine the monthly budget

| Product | Starter | Professional | Enterprise |
|---|---|---|---|
| Smart CRM, Marketing, Sales, Service, Content, or Revenue Hub | 500 | 3,000 | 5,000 |
| Data Hub, or Customer Platform (all-hubs bundle) | 500 | 5,000 | 10,000 |

Take the **single highest** allotment across everything the account owns, then add any purchased capacity packs. For example, Enterprise with two packs gets 5,000 + 2,000 = 7,000 credits a month.

### 2. Estimate burn per feature

Use the rate sheet summary below. The full table, the history, and source confidence are in [references/rate-sheet.md](references/rate-sheet.md).

| Feature | Unit | Credits |
|---|---|---|
| Customer Agent (text) | 1 resolved conversation | 50 |
| Customer Agent voice (beta) | 1 minute of voice | 50 |
| Prospecting Agent | 1 lead given outreach | 100 |
| Data Agent / smart property | 1 prompt × 1 record | 10 |
| Workflow AI action | 1 execution | 10 |
| Content Agent (beta) | 1 piece of content | 1,000 |
| Knowledge Base Agent (beta) | 1 new KB article | 200 |
| Nurture Agent (beta) | 1 personalized email | 10 |
| Revenue Agent (beta) | 1 invoice collection outreach | 500 |
| Custom agents / Work agents (beta) | 1 action unit | 1 |
| Intent monitoring | 1 company / month (recurring) | 10 |
| Intent custom signal (beta) | 1 company × 1 signal / month | 50 |
| Intent company creation (beta) | 1 company from market segments | 10 |
| Data Studio (beta) | 1 dataset use in workflow/segment/sync/export | 25 / 75 / 200 by rows (<500k / 500k–5M / >5M) |

To estimate, multiply each volume by its rate and add them up. Then compare the total to the step 1 budget. [scripts/estimate-credits.mjs](scripts/estimate-credits.mjs) does this from a JSON volume file:

```bash
node skills/hubspot-ai-credits/scripts/estimate-credits.mjs volumes.json
```

See [references/budgeting.md](references/budgeting.md) for worked examples and the volume patterns that most often cause surprises.

### 3. Decide what happens when the pool runs out

There are three possible states. Know which one the account is in:

| Account state | What happens at the limit |
|---|---|
| **Included credits only** (no packs purchased) | Credit features **pause** until the reset, or until a pack is bought. No surprise charges. |
| **Packs purchased, default setting** | **Auto-upgrade.** The next pack is added automatically and stays **for the rest of the contract**. Example: 5,000 included + 1,000 pack = 6,000. Using 6,500 adds a pack, so the limit becomes 7,000 *every month until renewal*. |
| **Pay-as-you-go enabled** | Overage is billed at $0.010/credit, monthly in arrears, in 10-credit increments (rounded down), on a separate invoice. The limit returns to its original level at each reset. |

Auto-upgrade is the expensive surprise. One spike month permanently raises the monthly commitment. Packs can only be cancelled or downgraded **at the end of the commitment term**, by contacting Support before renewal.

To enable pay-as-you-go (Super Admin or Billing Admin only), go to *Account & Billing → Usage & Limits → HubSpot Credits → Overage setting → Edit → Pay-as-you-go → Confirm*. You can't turn on overages with included credits alone; you must have bought extra credits first.

**Timing of setting changes:** if credits have already been used this period, the change takes effect **next period**. If none have been used, it takes effect immediately.

### 4. Set spend limits

None of these are on by default. They can be used together:

1. **Account level:** *HubSpot Credits tab → Maximum monthly credits → Edit*. If a later pack purchase pushes the total above this maximum, the new total becomes the maximum and you're asked to review it.
2. **Feature level:** *Feature credit limits → Set a feature limit → pick a feature → + Set limit → Save limit*. A feature limit **caps** spending but **doesn't reserve** credits. It can't exceed the account limit.
3. **Action level (buyer intent only):** *Manage usage by feature → Intent → Usage by action → Add limits → Save*. It can't exceed the intent feature limit.

**Recommended baseline for any account turning on agents:**
- Set the account maximum to the included allotment plus whatever overage you'll accept.
- Give each agent or feature its own limit, so one runaway feature can't starve the others. The Customer Agent is the usual one to protect.
- For Agent Builder custom agents, also use the per-agent run limits and the estimated-cost preview shown while testing.

When a limit you set is reached, features pause until the next cycle unless the limit is raised.

### 5. Make sure the feature can actually run

A credit feature that "doesn't work" is usually one of the following. Check them in this order:

1. **Edition.** Customer Agent needs Professional or Enterprise. Prospecting Agent and Data Agent work on Starter and up for most hubs, but **Smart CRM needs Professional or Enterprise** for them. See [references/ai-features.md](references/ai-features.md).
2. **Seat.** The user needs a paid seat (Core, Sales, Service, Revenue) or a Partner seat.
3. **AI settings toggles** (*Settings → Account management → AI → Access*). These are account-wide:
   - *Give users access to generative AI tools and features*: the master switch, on by default.
   - *CRM data*: on by default.
   - *Customer conversation data*: on by default.
   - *Files data*: **off by default**. Prospecting Agent and Data Agent both need it on.
   - *Give users access to Breeze Assistant*: a separate switch.
4. **Per-user permissions**: "Customer agent editor", "Access prospecting agent", the Data Agent access toggle in user settings, and so on.
5. **Credit balance or limits.** The feature (or the whole pool) may be paused because a limit was hit.
6. **Sandbox.** Credit-consuming actions don't run in sandbox accounts at all.

### 6. Monitor usage

- **Where:** *Account & Billing → Usage & Limits → HubSpot Credits*. It shows the monthly allocation, current and past usage, and a per-feature breakdown. Click a feature to pause it.
- **Automatic alerts:** billing contacts and Super Admins get banners and emails at **75%, 85% and 90%**, and when the limit is exceeded (triggering an upgrade or overage). Super Admins and Billing Admins also get alerts as they approach a limit they've set.
- **No API.** There's no public endpoint for credit balance or usage as of 2026-09. `/account-info/v3/api-usage/...` and the Developer MCP's `get-api-usage-patterns-by-app-id` report **API call** usage, not credits. Automated credit monitoring means a person checking the UI, or relying on the threshold emails (which can be routed to a shared inbox via billing contacts).

### 7. Developer surfaces: what does and doesn't consume credits

| Surface | Consumes credits? |
|---|---|
| REST API calls (any endpoint, service key or OAuth) | **No.** They count against API rate limits instead. |
| Remote CRM MCP (`mcp.hubspot.com`) or Developer MCP | **No.** Your own LLM does the reasoning, and calls count as API usage. |
| Custom workflow action (plain) | **No.** |
| Workflow AI action (a Breeze action placed in a workflow) | **Yes**, 10 per execution |
| Agent tool you build (`supportedClients: [{ client: "AGENTS" }]`) | **Not by itself.** The **agent that calls it** is billed (e.g. a custom agent at 1 credit per action unit). Your own endpoint's hosting costs are separate and yours. |
| "Run agent" workflow action | Free **while in beta**. HubSpot says it will charge after beta, and it's capped at about 500 executions/day. Re-check before relying on it. |
| Agent Builder automations (non-agent steps) | **No** |
| Testing or previewing agents in their editors | **No** |

If an integration needs heavy AI processing (e.g. classifying 100k records), compare the cost of native smart properties (10 credits ≈ $0.10 per record per prompt) with pulling records via the API, running your own model, and writing results back. The API route spends no credits.

---

## Verification

- *Usage & Limits → HubSpot Credits* shows the expected allocation: highest edition plus packs.
- After enabling a feature, run a small batch (e.g. 10 records through a smart property, or one test day of the Customer Agent). Then check that the per-feature breakdown increased by about volume × rate.
- Feature limits are listed under *Feature credit limits*, and each is ≤ the account maximum.
- The overage setting shows the intended mode. If auto-upgrade is unwanted, confirm pay-as-you-go is selected, or that no packs exist and features will just pause.
- At least one person who will act on them receives the 75/85/90% alert emails.

---

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Agent or smart property stopped mid-month | Pool exhausted with included credits only, or a feature/account limit was hit | Raise the limit, buy a pack, or wait for the reset; then set per-feature limits so it doesn't happen again |
| Monthly bill went up permanently after one busy month | Auto-upgrade added a capacity pack for the rest of the contract | It can't be removed mid-term. Switch to pay-as-you-go for future spikes, and set an account maximum |
| Allotment lower than expected for multiple hubs | Allotments aren't additive; only the highest edition counts | Expected behavior. Data Hub or Customer Platform bundles have the larger 5,000/10,000 allotments |
| Smart property backfill used thousands of credits for blank values | Charged per prompt × record **whether or not a useful value comes back** (wrong domain, empty source) | Test on a small filtered segment first, and filter out records missing the input data (e.g. no domain) |
| Credit use doubles after a workflow change | AI action placed in a workflow with re-enrollment, or in a branch hit more than once per record | Check enrollment and re-enrollment triggers, and put the AI action after filters |
| Customer Agent costs more than forecast | Each conversation that comes back after 72 hours is a new billable resolution; high resolution rate | Expected. Forecast resolved conversations, not total conversations |
| Customer Agent costs *less* than old guides said | Pricing changed 2026-04-14 from 100 per conversation to 50 per *resolved* conversation (no human handoff within 72h) | Use the current rate sheet, not blog posts |
| Intent charges show up every month with no activity | Intent is a **per-recurrence** feature: charged on enable, then monthly for each monitored company | Reduce monitored companies, or set an action-level limit under Intent |
| AI feature missing or greyed out | AI toggle off (Files data is off by default), user lacks a paid seat or permission, edition too low, or in a sandbox | Work through Procedure step 5 |
| "Can't turn on pay-as-you-go" | Only included credits exist, or the user isn't a Super Admin or Billing Admin | Buy at least one capacity pack first, and use an admin account |
| Limit change didn't apply | Credits were already used this period, so the change applies next period | Expected. Note the effective date |
| Old "Breeze Intelligence credits" figures don't match | They were migrated to HubSpot Credits June 2–15, 2025 (100→3,000; 1,000→15,000; 10,000→125,000 monthly) | Use HubSpot Credits only. Standard enrichment no longer consumes credits |
| Custom agent started charging | Custom agents were free in private beta and started consuming credits on 2026-07-23 (Agent Hub launch) | Set per-agent run limits and a feature limit |

---

## Escalation

Ask a human (account owner, Billing Admin, or HubSpot rep) when:
- A budget decision is needed: buying packs, enabling overage, or raising a limit is a spending commitment. Don't change billing settings without explicit approval.
- Disputing a charge, or cancelling or downgrading packs (only possible at term end, via Support)
- The rate sheet and portal disagree, or a beta feature's pricing is unclear
- Contract-specific terms (custom allotments, negotiated credit rates, annual-prepay pricing) may override list prices

**References:**
- Billing and controls: https://knowledge.hubspot.com/account-management/understand-hubspot-credits-and-billing
- Rate sheet and allotments: https://legal.hubspot.com/hubspot-product-and-services-catalog
- AI settings: https://knowledge.hubspot.com/account-management/manage-your-ai-settings
- Beta terms: https://legal.hubspot.com/hubspot-beta-terms
- Per-feature setup docs: see [references/ai-features.md](references/ai-features.md)

**See also:**
- `hubspot-workflows-api`: building agent tools and custom workflow actions that Breeze agents can call
- `hubspot-mcp-server`: bring-your-own-LLM access to the CRM (no credits)
- `hubspot-agent-cli`: CLI for external AI agents operating on CRM data (no credits)
- `hubspot-public-api`: API rate limits (a separate system from credits)
