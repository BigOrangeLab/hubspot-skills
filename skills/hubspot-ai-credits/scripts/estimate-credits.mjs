#!/usr/bin/env node
/**
 * Estimate monthly HubSpot Credits burn from expected volumes.
 *
 * Usage:
 *   node estimate-credits.mjs volumes.json
 *   node estimate-credits.mjs --example   # print a sample volumes.json
 *
 * volumes.json:
 *   {
 *     "allotment": 5000,          // highest included allotment (not summed across hubs)
 *     "packs": 0,                 // purchased 1,000-credit capacity packs
 *     "volumes": { "customerAgentResolutions": 800, "workflowAiActions": 400 }
 *   }
 *
 * Rates are a snapshot of the HubSpot Credits Rate Sheet as of 2026-09-09.
 * Update RATES when the rate sheet changes.
 */
import { readFileSync } from "node:fs";

const RATES = {
	customerAgentResolutions: { credits: 50, label: "Customer Agent — resolved text conversation" },
	customerAgentVoiceMinutes: { credits: 50, label: "Customer Agent — voice minute (beta)" },
	prospectingLeads: { credits: 100, label: "Prospecting Agent — lead given outreach" },
	dataAgentPromptRecords: { credits: 10, label: "Data Agent / smart property — prompt × record" },
	workflowAiActions: { credits: 10, label: "Workflow AI action — execution" },
	contentPieces: { credits: 1000, label: "Content Agent — piece (beta)" },
	kbArticles: { credits: 200, label: "Knowledge Base Agent — article (beta)" },
	nurtureEmails: { credits: 10, label: "Nurture Agent — personalized email (beta)" },
	revenueInvoices: { credits: 500, label: "Revenue Agent — invoice outreach (beta)" },
	customAgentActionUnits: { credits: 1, label: "Custom / Work agent — action unit (beta)" },
	intentCompaniesMonitored: { credits: 10, label: "Intent — company monitored / month" },
	intentCompaniesCreated: { credits: 10, label: "Intent — company created from segment (beta)" },
	intentCustomSignalCompanies: { credits: 50, label: "Intent — company × custom signal / month (beta)" },
	dataStudioUsesSmall: { credits: 25, label: "Data Studio — dataset use, <500k rows (beta)" },
	dataStudioUsesMedium: { credits: 75, label: "Data Studio — dataset use, 500k–5M rows (beta)" },
	dataStudioUsesLarge: { credits: 200, label: "Data Studio — dataset use, >5M rows (beta)" },
};

const USD_PER_CREDIT = 0.01;
const PACK_SIZE = 1000;
const PACK_USD = 10;

const arg = process.argv[2];
if (!arg) {
	console.error("Usage: node estimate-credits.mjs volumes.json | --example");
	process.exit(1);
}

if (arg === "--example") {
	const volumes = Object.fromEntries(Object.keys(RATES).map((k) => [k, 0]));
	console.log(JSON.stringify({ allotment: 3000, packs: 0, volumes }, null, 2));
	process.exit(0);
}

const input = JSON.parse(readFileSync(arg, "utf8"));
const { allotment = 0, packs = 0, volumes = {} } = input;

const unknown = Object.keys(volumes).filter((k) => !(k in RATES));
if (unknown.length) {
	console.error(`Unknown volume keys: ${unknown.join(", ")}`);
	console.error(`Known keys: ${Object.keys(RATES).join(", ")}`);
	process.exit(1);
}

let total = 0;
const rows = [];
for (const [key, qty] of Object.entries(volumes)) {
	if (!qty) continue;
	const credits = qty * RATES[key].credits;
	total += credits;
	rows.push([RATES[key].label, qty, RATES[key].credits, credits]);
}

const budget = allotment + packs * PACK_SIZE;
const shortfall = Math.max(0, total - budget);
const fmt = (n) => n.toLocaleString("en-US");

console.log("Feature".padEnd(52), "Volume".padStart(10), "Rate".padStart(6), "Credits".padStart(11));
for (const [label, qty, rate, credits] of rows) {
	console.log(label.padEnd(52), fmt(qty).padStart(10), fmt(rate).padStart(6), fmt(credits).padStart(11));
}
console.log("");
console.log(`Total monthly credits:      ${fmt(total)}  (≈ $${fmt(Math.round(total * USD_PER_CREDIT))})`);
console.log(`Budget (allotment + packs): ${fmt(budget)}`);
if (shortfall === 0) {
	console.log(`Headroom:                   ${fmt(budget - total)} credits (${Math.round((total / (budget || 1)) * 100)}% used)`);
} else {
	const extraPacks = Math.ceil(shortfall / PACK_SIZE);
	console.log(`Shortfall:                  ${fmt(shortfall)} credits`);
	console.log(`  Pay-as-you-go overage:    ≈ $${fmt(Math.floor(shortfall / 10) * 10 * USD_PER_CREDIT)} this month`);
	console.log(`  Auto-upgrade / packs:     ${extraPacks} pack(s) = $${fmt(extraPacks * PACK_USD)}/month for the rest of the term`);
	console.log(`  Included credits only:    features pause once ${fmt(budget)} credits are used`);
}
console.log("\nRates: HubSpot Credits Rate Sheet snapshot 2026-09-09 — verify current rates before budgeting.");
