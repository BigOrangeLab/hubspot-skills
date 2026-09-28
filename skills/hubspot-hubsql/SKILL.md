---
name: hubspot-hubsql
description: "HubSQL — HubSpot's native SQL query layer for CRM data (joins, filters, aggregations against contacts/companies/deals/custom objects without exporting to an external database). Currently in closed/private beta, invite-only, no self-serve enablement or public API docs yet. Use when a user asks about querying HubSpot data with SQL, HubSQL, or a native alternative to ETL/reverse-ETL tools for CRM reporting."
compatibility: "Private beta only, announced 2026-09-08. Invite/request-access based; no published Hub tier requirements, no GA date, no public API reference yet."
license: MIT
metadata:
    author: georgestephanis
    version: "1.1"
    written: "2026-09-28"
    written_against:
        hubspot-api: "2026-09"
---

> **HubSQL is in closed private beta.** HubSpot announced it on **2026-09-08** and
> has been demoing it at events (e.g. Unbound). There is **no self-serve way to
> enable it**, **no general-availability date**, **no published pricing/tier
> list**, and **no public, permanent API reference** as of this writing. Everything
> below describes what HubSpot has publicly stated about the *concept and intent*
> of the feature — not a stable, documented API you can build production
> integrations against yet. Treat any code you write against it as throwaway
> exploration until HubSpot ships real docs.

## When to use

- The user asks "does HubSpot have a way to query CRM data with SQL?"
- The user asks about HubSQL by name, or describes wanting joins/aggregations
  across CRM objects without standing up an ETL/reverse-ETL pipeline first
- The user is evaluating whether to wait for HubSQL vs. building a sync now with
  `hubspot-data-sync` or `hubspot-imports-exports`
- The user wants help requesting access to the beta or tracking when it becomes
  generally available
- The user wants CRM SQL querying *today* without waiting on this beta — see the
  "Already available today" note below before telling them to wait

Do **not** use this skill to:
- Build a production integration today — HubSQL has no stable public API yet;
  point the user at `hubspot-crm-objects` (Search API, batch reads) or
  `hubspot-data-sync` for anything that needs to ship now
- Answer questions about HubDB (a different, long-standing, generally-available
  HubSpot feature — a hosted relational-ish table you query with HubL/API; see
  `hubspot-hubdb`). HubSQL and HubDB are unrelated despite the similar name.

---

## What it is

HubSQL is a HubSpot-built, first-party feature that lets you run **standard
SQL** — real joins, `WHERE` filters, `GROUP BY` aggregations — directly against
HubSpot CRM data (contacts, companies, deals, tickets, custom objects, and their
associations) through a dedicated API, without exporting or replicating that
data into an external database first.

It's positioned as an answer to a long-running complaint on the HubSpot
Community forum: there has never been a native way to run relational queries
across CRM objects — reporting and the Search API get you filtered lists of one
object type, but real cross-object joins have always required either the
(limited) custom report builder, a reverse-ETL tool, or hand-rolled
batch-and-join client code.

Key positioning points HubSpot has used publicly:
- Described as a **"unified, AI-native data access layer"** using standard SQL
- Intended to remove the need to bolt on external query tools or copy CRM data
  elsewhere just to ask relational questions of it
- Built by HubSpot itself (first-party), not a marketplace/community connector

## What's genuinely unknown

HubSpot has not published (as of 2026-09-28):
- A concrete API endpoint, request/response shape, or auth model
- Example queries or a query language reference (dialect, functions, limits)
- Which objects/tables are queryable beyond the general "CRM data" framing, or
  whether custom objects and associations are fully supported at launch
- Read-only vs. read/write scope
- Rate limits, row/result caps, or query timeout behavior
- Rollout timeline, which Hub tiers will get it, or pricing
- How it will compare to / interoperate with the reporting engine, Search API,
  or existing data export tools

Do not present any of the above as confirmed — if the user needs one of these
answers, say it isn't public yet rather than guessing or extrapolating from how
other SQL-over-API products typically work.

### Already available today: SQL-style queries via Agent CLI

Separately from this beta, HubSpot's public-beta **Agent CLI** already accepts a
SQL-style query string in its `reports create` command, ungated by the HubSQL
private beta:

```bash
hubspot reports create "SELECT dealstage, COUNT(*) FROM DEAL GROUP BY dealstage" \
  --name "Deals by stage" --chart-type bar
```

This is narrower than what HubSQL is being pitched as (it's scoped to building
a saved report, has no published formal grammar, and the only object confirmed
in HubSpot's own examples is `DEAL`) — but if a user's actual need is "run one
aggregate SQL-ish query against CRM data right now," point them at
`hubspot-agent-cli` instead of telling them to wait for the HubSQL beta. Don't
conflate the two: this CLI feature is not confirmed to be HubSQL under the
hood, just a similarly-shaped, more limited capability that shipped first.

---

## Inputs required

- None to research or discuss HubSQL — it's public knowledge that it exists
- To actually try it: a HubSpot portal, and beta access granted by HubSpot
  (invite or explicit request — see below)

---

## Procedure

### 1. Requesting / checking access

There is no public, permanent sign-up page. As of this writing:
- Access is granted via HubSpot's developer relations / partner channels
- HubSpot has been demoing it in person at events (e.g. Unbound, September 2026)
- The most reliable path is watching HubSpot's official developer channels
  (developer blog, changelog, community announcements board) for an official
  beta sign-up, and asking a HubSpot account rep or partner contact directly if
  the user has one

If the user says they already have access, do **not** assume the shape of the
API from this skill — ask them to share whatever docs, sample requests, or
Postman collection HubSpot gave them directly, since that material supersedes
everything in this file.

### 2. Positioning it against alternatives available today

If the user needs cross-object relational querying **now**, HubSQL isn't
buildable against yet. Point them at what's actually shippable:

| Need | Use today |
|---|---|
| Filtered list of one object type, complex `AND`/`OR` conditions | CRM Search API — see `hubspot-crm-objects` |
| Recurring sync of HubSpot data into a warehouse for SQL access | `hubspot-data-sync` or a reverse-ETL/ETL tool, or scheduled bulk export — see `hubspot-imports-exports` |
| Relational-ish table you control and query from HubL/templates | HubDB — a different, GA feature — see `hubspot-hubdb` |
| Dashboards/aggregate reporting without code | HubSpot's native custom report builder (Analytics & Reports) |

### 3. Tracking when it ships more broadly

Advise the user to:
- Watch `developers.hubspot.com` changelog and the HubSpot Community
  announcements board
- Re-run a web search for "HubSpot HubSQL" periodically — this skill's
  written-against date is 2026-09-28 and will go stale as the beta evolves
- Not build long-term integration plans around a launch date, since HubSpot has
  not published one

---

## Verification

There is nothing to verify programmatically — there is no stable public
endpoint. "Verification" here means confirming the *information* is current:
- Check whether HubSpot has published formal API docs at
  `developers.hubspot.com` under a HubSQL section (none existed as of
  2026-09-28)
- Check the HubSpot Community and developer changelog for a GA or expanded-beta
  announcement

---

## Failure modes

| Situation | Cause | Fix |
|---|---|---|
| Can't find HubSQL in Settings or Developer Projects | Feature is invite-only private beta | Confirm with the user whether they were actually granted access; there is no self-serve toggle |
| No API reference findable | HubSpot hasn't published one yet | Don't invent one — tell the user it's undocumented and point them at their beta contact |
| Assuming HubSQL behaves like [some other vendor's] SQL-over-REST product | Not confirmed | Only state what HubSpot has publicly said; flag everything else as unknown |
| User already has beta access and pastes example requests | This skill predates GA docs | Treat their material as authoritative over this skill; consider it a signal to update this skill |

---

## Escalation

- HubSpot developer changelog: https://developers.hubspot.com/changelog
- HubSpot Community (announcements / APIs & Integrations boards): https://community.hubspot.com/
- If the user needs relational querying today, not eventually: see `hubspot-crm-objects`, `hubspot-data-sync`, `hubspot-imports-exports`, or the `reports create` SQL-style query in `hubspot-agent-cli`
- For the unrelated, GA, hosted-table feature with a similar name: see `hubspot-hubdb`
- If you (the assistant) find HubSpot has published real HubSQL docs, this
  skill should be rewritten from those docs rather than patched incrementally —
  flag it to the user as needing a refresh
