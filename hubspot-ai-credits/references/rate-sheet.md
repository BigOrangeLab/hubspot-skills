# HubSpot Credits — rate sheet, allotments, and pricing history

Snapshot as of **2026-09-09** (date of the HubSpot billing KB article's last
update). The authoritative source is the **HubSpot Credits Rate Sheet** section
of the [Products & Services Catalog](https://legal.hubspot.com/hubspot-product-and-services-catalog).
Re-check it before quoting a number.

## Price of a credit

| Item | Price |
|---|---|
| Base rate | $0.010 per credit |
| Capacity pack | $10 USD per 1,000 credits / month, added for the rest of the term |
| Pay-as-you-go overage | $0.010 per credit, invoiced monthly in arrears, in 10-credit increments (rounded down), on a separate invoice |
| Annual-term packs | Some third-party sources report about $9 per 1,000 on annual commitments. **Unverified**, so confirm with the HubSpot rep |

## Included monthly credits

| Product | Starter | Professional | Enterprise |
|---|---|---|---|
| Smart CRM, Marketing Hub, Sales Hub, Service Hub, Content Hub, Revenue Hub | 500 | 3,000 | 5,000 |
| Data Hub, or Customer Platform (all products bundled at one edition) | 500 | 5,000 | 10,000 |

- **Not additive.** Multiple products get the allotment of the highest edition owned.
- Every seat-based-pricing account gets included credits. Free tools get none.
- Allotments reset monthly on the usage-period start date. There is no rollover.

## Consumption model

- **Per action:** credits are charged each time the action happens.
- **Per recurrence:** credits are charged when the feature is turned on, then every month while it stays on. Intent monitoring works this way.
- Credit features can bring **other charges too** (telephony minutes, SMS) that aren't billed in credits.
- Automated, bulk, and high-volume features use credits fastest.

## Rate sheet

### AI agents

| Feature | Action | Credits | Status |
|---|---|---|---|
| Customer Agent | Resolve one conversation (text channels: chat, email, forms) | 50 | GA |
| Customer Agent | Hold one minute of voice conversation | 50 | Beta |
| Prospecting Agent | Recommend outreach for one lead | 100 | GA |
| Data Agent | Generate a response to one prompt for one record | 10 | GA |
| Content Agent | Generate one piece of content | 1,000 | Beta |
| Knowledge Base Agent | Generate one new knowledge base article | 200 | Beta |
| Nurture Agent | Personalize one email for a contact | 10 | Beta |
| Revenue Agent | Start payment-collection outreach for one invoice (needs human approval) | 500 | Beta |
| Custom agents (Agent Builder) | Use one action unit | 1 | Beta |

### HubSpot Work

| Feature | Action | Credits | Status |
|---|---|---|---|
| Work agents | Use one action unit | 1 | Beta |

### AI automation

| Feature | Action | Credits |
|---|---|---|
| Workflows | Execute one AI action in a workflow | 10 |

### Intent (powered by Data Agent)

| Action | Credits | Status |
|---|---|---|
| Enable intent signals to create and/or monitor one company for one month | 10 (recurring) | GA |
| Create one company record from market segments | 10 | Beta |
| Monitor one company for one custom signal for one month | 50 (recurring) | Beta |

### Data Studio (beta)

Charged **per use** of a dataset in a workflow, segment, CRM sync, or export.
The bracket is set by the row count of the primary source:

| Primary-source rows | Credits per use |
|---|---|
| < 500,000 | 25 |
| 500,000 – 5,000,000 | 75 |
| > 5,000,000 | 200 |

Using a dataset **in a report** costs nothing.

### Not on the rate sheet (no credits)

- **Breeze Assistant** (formerly ChatSpot → Copilot → Breeze Copilot) is a free tool in every edition. Third parties report a rate limit of about 30 requests/min and 1,000/day. That limit isn't confirmed in HubSpot docs.
- **Standard data enrichment** (formerly Breeze Intelligence): the KB says "Data enrichment does not consume HubSpot Credits." Smart properties *do* use credits, at the Data Agent rate.
- **Conversational context** (enrichment) is limited per paid seat per month: 50 on Starter, 250 on Pro, 350 on Enterprise. Free accounts get 25 records per account. These are allowances, not credits.

## Pricing history

| Date | Change |
|---|---|
| 2025-06-02 → 06-15 | Breeze Intelligence credits were migrated to HubSpot Credits. Monthly plans converted 100 → 3,000, 1,000 → 15,000, and 10,000 → 125,000. Plans that had several packs were converted together (2 × 100 → 6,000). |
| ~2025-09 | Standard enrichment became included with paid tiers, with no per-record credit charge. Workflow AI actions launched at 10 credits. |
| 2026-04-02 | Outcome-based agent pricing was announced. |
| 2026-04-14 | **Customer Agent** went from 100 credits per conversation (resolved or not) to **50 per resolved conversation**. "Resolved" means the agent handled it and it wasn't escalated to a human within 72 hours, or the agent qualified a lead. A return after 72 hours counts as a new conversation. **Prospecting Agent** went from a monthly per-enrolled-contact fee (free for early adopters) to **100 per lead given outreach**. Applied to all customers, with no opt-out or grandfathering. A 28-day trial was added for Pro and Enterprise. |
| 2026-07-23 | **Agent Hub** launched and Breeze Studio was renamed **Agent Builder**. Custom agents went from free (private beta) to **1 credit per action unit**. Feature-level credit limits were added. Several beta agents were retired. |
| 2026-09-09 | The billing KB article was last updated. This snapshot is based on it. |

## Source confidence

| Claim | Source |
|---|---|
| Allotments, rate sheet, pack and overage prices | HubSpot Products & Services Catalog (official) |
| Reset, rollover, limits, alerts, auto-upgrade, overage mechanics | HubSpot KB billing article (official) |
| 72-hour resolution definition, April 14 dates | Third-party coverage of HubSpot's announcement (HuboExperts, Resolve247). It's consistent across sources, but confirm in the portal |
| July 23 Agent Hub launch and custom-agent charging | HubSpot product pages plus third-party coverage |
| Annual-term pack discount, Breeze Assistant rate limits, "Run agent" 500/day cap | Third-party only. **Unverified** |

Watch for stale numbers. Many 2025 and early-2026 guides quote Customer Agent at
100 per conversation, enrichment at 10 per record, or "1 credit per record".
All of these predate the current sheet.
