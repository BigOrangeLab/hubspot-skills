# Budgeting HubSpot Credits — worked examples

Rates are from the 2026-09-09 rate sheet ([rate-sheet.md](rate-sheet.md)). At
$0.010 per credit, **100 credits ≈ $1**.

## Formula

```
monthly_credits = Σ (volume_per_month × credits_per_unit)
                + Σ (recurring_units × credits_per_month)      # intent
budget          = max(included allotment across products) + capacity packs × 1,000
shortfall       = monthly_credits − budget
cost_if_payg    = max(0, shortfall) × $0.010
cost_if_packs   = ceil(max(0, shortfall) / 1,000) × $10 / month  (for the rest of the term)
```

Use `scripts/estimate-credits.mjs` to run this from a JSON file of volumes.

## Example 1 — Service Hub Pro, Customer Agent only

- 2,000 chat and email conversations a month, with a 40% resolution rate
- Usage: 800 resolutions × 50 = **40,000 credits**
- Budget: 3,000 included, so the shortfall is 37,000
- Pay-as-you-go: about $370 a month. Capacity packs: 37 packs = $370 a month, locked in for the term

At this rate the included allotment is a rounding error. Budget the Customer
Agent as a variable support cost of about $0.50 per resolution.

## Example 2 — Sales Hub Enterprise + Marketing Pro, mixed

| Feature | Volume | Rate | Credits |
|---|---|---|---|
| Prospecting Agent | 30 leads | 100 | 3,000 |
| Workflow AI action (lead summary) | 400 executions | 10 | 4,000 |
| Intent monitoring | 150 companies | 10/mo | 1,500 |
| **Total** | | | **8,500** |

- Budget: Enterprise gets 5,000. Marketing Pro **doesn't add** to that.
- Shortfall: 3,500, which is about $35 on pay-as-you-go, or 4 packs ($40 a month for the term).

## Example 3 — the smart-property backfill trap

- 20,000 company records, plus 2 smart properties created with **Quick fill**
- Usage: 20,000 × 2 × 10 = **400,000 credits ≈ $4,000**, charged the moment it runs
- About a third of the records have no domain, so roughly $1,300 of that buys blank values

**Safer approach:**
1. Create the property **without** Quick fill.
2. Build a workflow that enrolls only records with the required input (e.g. `domain` is known) in the target segment.
3. Run it on 50 records first, then check the values and the credit delta.
4. Set a Data Agent feature limit before the full run.

## Example 4 — Data Studio sync

- One dataset with a 1.2M-row primary source, synced to the CRM daily
- Usage: 75 × 30 = **2,250 credits a month**
- Switching to a weekly sync costs 75 × ~4 = 300 a month. Reporting on the dataset is free.

## Example 5 — native vs. bring-your-own-LLM classification

Task: classify 100,000 contacts by industry from free-text notes.

| Approach | Credits | Other cost |
|---|---|---|
| Smart property, 1 prompt | 100,000 × 10 = 1,000,000 (≈ $10,000) | none |
| API batch read → own LLM → batch update | 0 | LLM tokens + compute; API calls count toward rate limits (100 records/batch → about 2,000 calls) |

For one-off or bulk work over large record counts, the API route is usually
much cheaper. Native smart properties make sense for ongoing,
low-volume, in-portal enrichment where no-code upkeep matters more than unit cost.

## Volume patterns that cause surprises

1. **Auto-upgrade ratchet.** With packs purchased and the default setting, one spike month permanently adds packs until renewal.
2. **Re-enrollment.** Workflows with re-enrollment on property change can loop an AI action, especially if the AI action itself updates a property that triggers re-enrollment.
3. **Recurring features left on.** Intent monitoring and Data Studio syncs charge every month or run, even when nobody is looking at the output.
4. **Automatic Prospecting enrollment triggers** (page view, form submission) at 100 per lead.
5. **One shared pool.** Without feature limits, a marketing backfill can pause the support agent mid-month.
6. **Beta features flipping to paid.** "Run agent" in workflows and other beta features may start charging with little notice.
