#!/usr/bin/env node
/**
 * Reads every skill under skills/, parses the written_against frontmatter block,
 * fetches the current upstream version for each tool, decides whether the skill
 * has drifted, and writes a JSON report to stdout for the version-check workflow.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, "../../skills");
const GH_TOKEN = process.env.GITHUB_TOKEN;
const versionCache = new Map();

const SPEC_REPO = "HubSpot/HubSpot-public-api-spec-collection";

// Maps a written_against key to a function returning { current, note? }.
// Keys without an entry are reported as "no source".
const VERSION_SOURCES = {
  // HubSpot CMS VSCode extension — primary source of HubL language data
  "hubspot-cms-vscode": () => githubLatest("HubSpot/hubspot-cms-vscode"),
  // HubSpot CLI — drifts fastest, tracked by the most skills
  "hubspot-cli": () => npmLatest("@hubspot/cli"),
  // HubSpot REST API has no release feed, but the public OpenAPI spec collection
  // encodes each API's versions as directory names, so the newest GA date version
  // can be derived from the repo tree.
  "hubspot-api": currentApiVersion,
  jinjava: () => githubLatest("HubSpot/jinjava"),
};

// Skills that document "this family has no GA date-based version yet", mapped to
// the spec-collection family that claim depends on. If the family gains a
// non-beta date version, the skill's banner has silently become wrong.
const NO_GA_WATCH = {
  "hubspot-forms": "Marketing/Forms",
  "hubspot-workflows-api": "Automation/Automation V4",
};

// hubspot-cms-vscode uses semver. Flag when the MINOR version advances — minor
// releases frequently add new HubL functions/tags. All other semver tools flag
// on MAJOR only.
const MINOR_VERSIONED = new Set(["hubspot-cms-vscode"]);

const DATE_VERSION = /^\d{4}-\d{2}$/;

async function npmLatest(pkg) {
  const res = await fetch(`https://registry.npmjs.org/${pkg}/latest`);
  if (!res.ok) throw new Error(`npm registry ${res.status} for ${pkg}`);
  const { version } = await res.json();
  return { current: version ?? "no source" };
}

async function githubLatest(repo) {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/releases/latest`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {}),
      },
    },
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${repo}`);
  const { tag_name } = await res.json();
  // Tags come as "v1.7.5" or "jinjava-2.8.4" — strip any prefix before the digits.
  const version = tag_name?.replace(/^(?:v|[A-Za-z][\w.]*-)(?=\d)/, "");
  return { current: version ?? "no source" };
}

/**
 * One recursive tree call returns every spec path. Versions are encoded as
 * directory names: PublicApiSpecs/<Family>/<Api>/Rollouts/<id>/<version>/<spec>.json
 * Returns a Map of "Family/Api" -> Set of version strings.
 */
let specTreePromise;
function specVersions() {
  specTreePromise ??= (async () => {
    const res = await fetch(
      `https://api.github.com/repos/${SPEC_REPO}/git/trees/main?recursive=1`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {}),
        },
      },
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status} for ${SPEC_REPO}`);
    const { tree, truncated } = await res.json();
    if (truncated) throw new Error(`${SPEC_REPO} tree response was truncated`);

    const families = new Map();
    for (const { path } of tree) {
      const m = path.match(
        /^PublicApiSpecs\/([^/]+)\/([^/]+)\/Rollouts\/\d+\/([^/]+)\//,
      );
      if (!m) continue;
      const [, family, api, version] = m;
      // HubSpot keeps internal scratch APIs in the public tree; they carry
      // versions that were never shipped.
      if (family === "Test" || /_?Test\d*$/i.test(api)) continue;
      const key = `${family}/${api}`;
      if (!families.has(key)) families.set(key, new Set());
      families.get(key).add(version);
    }
    if (!families.size) throw new Error("no spec versions parsed from tree");
    return families;
  })();
  return specTreePromise;
}

/** Newest GA (non-beta) date version across the whole spec collection. */
async function currentApiVersion() {
  const families = await specVersions();
  const all = new Set();
  for (const versions of families.values()) {
    for (const v of versions) all.add(v);
  }
  const ga = [...all].filter((v) => DATE_VERSION.test(v)).sort();
  const beta = [...all].filter((v) => /^\d{4}-\d{2}-beta$/.test(v)).sort();

  const current = ga.at(-1) ?? "no source";
  const nextBeta = beta.at(-1);
  // A beta dated after the newest GA is the next version, visible before it ships.
  const note =
    nextBeta && nextBeta.slice(0, 7) > current
      ? `next version \`${nextBeta}\` is in beta`
      : undefined;
  return { current, note };
}

/** GA date versions available for one spec family, for the no-GA watch list. */
async function familyGaVersion(family) {
  const families = await specVersions();
  const versions = families.get(family);
  if (!versions) throw new Error(`family not found in spec tree: ${family}`);
  const ga = [...versions].filter((v) => DATE_VERSION.test(v)).sort();
  return ga.at(-1) ?? "no GA";
}

function isStale(tool, writtenVersion, current) {
  const written = String(writtenVersion);

  // Date-based versions compare lexically — YYYY-MM sorts correctly.
  if (DATE_VERSION.test(current) && DATE_VERSION.test(written)) {
    return current > written;
  }

  if (MINOR_VERSIONED.has(tool)) {
    const [wMaj, wMin] = written.split(".").map(Number);
    const [cMaj, cMin] = current.split(".").map(Number);
    return cMaj > wMaj || (cMaj === wMaj && cMin > wMin);
  }

  return current.split(".")[0] !== written.replace(/[^0-9].*/, "");
}

function parseFrontmatter(content) {
  return content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? null;
}

function parseWrittenAgainst(frontmatter) {
  if (!frontmatter) return {};

  const blockMatch = frontmatter.match(
    /(?:^|\n)\s*written_against:\r?\n((?:[ \t]+\S[^\n\r]*(?:\r?\n|$))*)/,
  );
  if (!blockMatch) return {};

  const result = {};
  for (const line of blockMatch[1].split(/\r?\n/)) {
    const kv = line.match(/^\s+([^:]+):\s*"?([^"\n]+)"?/);
    if (kv) result[kv[1].trim()] = kv[2].trim();
  }
  return result;
}

function parseWrittenDate(frontmatter) {
  return (
    frontmatter?.match(/(?:^|\n)\s*written:\s*"?(\d{4}-\d{2}-\d{2})"?/)?.[1] ??
    null
  );
}

function getCurrentVersion(tool) {
  if (!versionCache.has(tool)) {
    const fetcher = VERSION_SOURCES[tool];
    versionCache.set(
      tool,
      (async () => {
        if (!fetcher) return { current: "no source" };
        try {
          return await fetcher();
        } catch (error) {
          return { current: `error: ${error.message}` };
        }
      })(),
    );
  }
  return versionCache.get(tool);
}

function buildRow({ skill, writtenDate, tool, writtenVersion, current, note }) {
  const comparable = current !== "no source" && !current.startsWith("error:");
  return {
    skill,
    writtenDate,
    tool,
    writtenVersion,
    current,
    note,
    stale: comparable && isStale(tool, writtenVersion, current),
  };
}

// ponytail: `--self-check` over a test file — the only logic worth pinning is
// isStale, and it needs no fixtures. Run: node check-skill-versions.mjs --self-check
if (process.argv.includes("--self-check")) {
  const { strict: assert } = await import("assert");

  // Date-based versions compare by date, not by leading integer.
  assert.equal(isStale("hubspot-api", "2026-09", "2026-09"), false);
  assert.equal(isStale("hubspot-api", "2026-09", "2027-03"), true);
  assert.equal(isStale("hubspot-api", "2026-03", "2026-09"), true, "same year, later month");
  assert.equal(isStale("hubspot-api", "2026-09", "2026-03"), false, "never flag backwards");

  // Semver tools flag on major only, except the VSCode extension (minor).
  assert.equal(isStale("hubspot-cli", "8.15.0", "8.20.1"), false);
  assert.equal(isStale("hubspot-cli", "8.15.0", "9.0.0"), true);
  assert.equal(isStale("hubspot-cms-vscode", "1.7.4", "1.7.5"), false, "patch");
  assert.equal(isStale("hubspot-cms-vscode", "1.7.4", "1.8.0"), true, "minor");

  // The no-GA tripwire: a family gaining a GA date invalidates the skill banner.
  assert.equal(DATE_VERSION.test("no GA"), false, "no GA stays quiet");
  assert.equal(DATE_VERSION.test("2027-03"), true, "GA fires");
  assert.equal(DATE_VERSION.test("2027-03-beta"), false, "beta does not fire");

  console.log("self-check ok");
  process.exit(0);
}

const skillDirs = readdirSync(SKILLS_DIR).filter((name) =>
  statSync(join(SKILLS_DIR, name)).isDirectory(),
);

const rows = [];

for (const skillName of skillDirs.sort()) {
  let content;
  try {
    content = readFileSync(join(SKILLS_DIR, skillName, "SKILL.md"), "utf8");
  } catch {
    continue;
  }

  const frontmatter = parseFrontmatter(content);

  // Deprecated skills are intentionally frozen — flagging their drift is noise.
  if (/(?:^|\n)\s*description:\s*"?DEPRECATED\b/.test(frontmatter ?? "")) {
    continue;
  }

  const writtenAgainst = parseWrittenAgainst(frontmatter);
  if (!Object.keys(writtenAgainst).length) continue;

  const writtenDate = parseWrittenDate(frontmatter);

  for (const [tool, writtenVersion] of Object.entries(writtenAgainst)) {
    // These skills pin a family with no GA version, so their written_against
    // records legacy paths rather than a date. The spec-ga row below is the
    // authoritative signal for them; comparing to the global GA date is noise.
    if (tool === "hubspot-api" && NO_GA_WATCH[skillName]) continue;

    const { current, note } = await getCurrentVersion(tool);
    rows.push(
      buildRow({ skill: skillName, writtenDate, tool, writtenVersion, current, note }),
    );
  }

  // These skills document "no GA date version exists for this family yet".
  // That claim expires the moment the family ships one.
  const family = NO_GA_WATCH[skillName];
  if (family) {
    let current;
    try {
      current = await familyGaVersion(family);
    } catch (error) {
      current = `error: ${error.message}`;
    }
    rows.push({
      skill: skillName,
      writtenDate,
      tool: `spec-ga: ${family}`,
      writtenVersion: "no GA",
      current,
      note:
        current === "no GA"
          ? undefined
          : "family now has a GA date version — the skill's \"no GA yet\" banner is out of date",
      stale: DATE_VERSION.test(current),
    });
  }
}

process.stdout.write(JSON.stringify(rows, null, 2) + "\n");
