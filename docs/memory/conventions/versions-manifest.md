---
type: memory
description: "The `/versions.json` version manifest — logic in `src/lib/versions-manifest.ts`. The repo-root `versions-policy.json` is the roster, keyed by the consumer-facing roster name (matched by `shll check-updates`); `latest` is the envelope `version` stripped to bare, the optional `envelope` naming the help file when it differs from the key (the `run-kit` row reads `help/hexokit.json`). Pulled envelopes skip-degrade; the authored policy build-stops. Contract: `docs/specs/versions-manifest-contract.md`"
---
# Versions Manifest

**Domain**: conventions

## Overview

hexokit.com publishes a toolkit **version manifest** at `https://hexokit.com/versions.json` — a static JSON document listing each toolkit tool's latest version plus a per-tool notify policy. The consumer (run-kit's update check, which runs `shll check-updates --json`; shll matches manifest rows against its roster `Name`) fetches this ONE static CDN file instead of 7 unauthenticated GitHub Releases API calls, and applies each tool's notify threshold to decide whether a newer release is worth surfacing to the user.

This is a thin derivation over two already-committed repo-root data sources — the `help/<slug>.json` envelopes ([help-collection](/conventions/help-collection.md)) and the hand-edited `versions-policy.json` — so it adds no runtime, no fetch, and no new dependency. The **forward contract** (output schema, `notify` semantics, freshness cascade, live-site-swap obligation) lives in the spec [`docs/specs/versions-manifest-contract.md`](../../specs/versions-manifest-contract.md); this file documents how the manifest is derived, not the wire contract.

## Requirements

### Requirement: Build-time static `/versions.json` endpoint
The live site SHALL emit a static `application/json` document at build time, served at `https://shll.ai/versions.json`, via the Astro static file endpoint `sites/astro-starlight-terminal1/src/pages/versions.json.ts` — the same build-time, zero-runtime idiom as `src/pages/llms.txt.ts` (Constitution I: no SSR, no runtime fetch; Constitution VI: no new deps). The page is thin: it resolves the repo root via `repoRootFromModuleUrl(import.meta.url)`, calls `readPolicy` then `buildManifest` from `src/lib/versions-manifest.ts`, and returns the pretty-printed manifest.

#### Scenario: Manifest emitted at build
- **GIVEN** the live site is built with `pnpm build`
- **WHEN** the build completes
- **THEN** `dist/versions.json` exists, is valid JSON, and parses to an object with `schema` (=== `1`), an ISO-8601 UTC `generated_at`, and a `tools` map

### Requirement: Policy file is the roster; rows derived per key
The manifest's roster is the set of keys declared in the repo-root `versions-policy.json` — only tools with a policy entry are advertised (a tool with no policy has no notify semantics, so it should not appear). Each present, valid tool's row is keyed by its **consumer-facing roster name** — the `Name` in shll's roster, which `shll check-updates` matches against `manifest.Tools[name]` — carrying `latest`, `notify`, and `formula`.

- `latest` = the envelope's `version` passed through `stripVersionPrefix` (bare form, no leading `v`), read from `help/<envelope ?? key>.json`.
- `notify` = the policy entry's `notify` value.
- `formula` = the policy entry's optional `formula`, defaulting to the key.

The key is **NOT** the envelope's `tool` field, which is the *binary* name (`fab` for key `fab-kit`; `run-kit` for the `run-kit` key). And the key is **not necessarily the help-file slug**: an optional **`envelope`** policy field names which `help/<slug>.json` supplies `latest` when the two differ — the `run-kit` row carries `"envelope": "hexokit"`, so it reads `help/hexokit.json` (the site's `hexokit` slug sources from the run-kit binary) while the row key and the default `formula` stay `run-kit`, byte-shape identical for the consumer. Conflating key / slug / formula / binary is a known real bug class documented in `refresh-help.yml`; see [tool-roster](/conventions/tool-roster.md) for the four-name rule.

#### Scenario: Slug keying, not binary name
- **GIVEN** `help/fab-kit.json` whose envelope `tool` field is `"fab"`
- **WHEN** the manifest is built
- **THEN** the row key is `"fab-kit"` (the roster name), never `"fab"`

#### Scenario: The `envelope` override decouples the key from the help file
- **GIVEN** `versions-policy.json` with `"run-kit": { "notify": "minor", "envelope": "hexokit" }` and a valid `help/hexokit.json` with version `v3.19.37`
- **WHEN** the manifest is built
- **THEN** `tools['run-kit'] == { latest: '3.19.37', notify: 'minor', formula: 'run-kit' }` and no `tools['hexokit']` row exists

#### Scenario: Formula defaults to key
- **GIVEN** a policy entry with no `formula` key
- **WHEN** the row is built
- **THEN** `formula` is the key; a policy entry with an explicit `"formula"` override wins instead

### Requirement: `latest` normalized to bare version
`latest` SHALL strip a single leading `v` from the envelope `version` via `stripVersionPrefix` in `versions-manifest.ts`. The transform is idempotent. The envelopes are inconsistent — `fab`/`tu` emit `"2.15.4"`, `wt`/`hop`/`idea`/`run-kit`/`shll` emit `"v0.1.1"` — so normalizing at the producer keeps the machine contract clean (`"v3.7.4"` → `"3.7.4"`; `"2.15.4"` → unchanged).

#### Scenario: Leading `v` stripped, bare left alone
- **GIVEN** an envelope `version` of `"v3.7.4"`
- **WHEN** the row is built
- **THEN** `latest` is `"3.7.4"`; given `"2.15.4"`, `latest` is `"2.15.4"` unchanged

### Requirement: `notify` sourced from the policy; consumer semantics
`notify` for each tool SHALL be read from `versions-policy.json`. Allowed values are `"never" | "patch" | "minor"`. The consumer semantics (documented here, enforced in run-kit, not on the producer side): `never` never triggers; `patch` triggers on any version increase; `minor` triggers on a minor-or-major increase (a patch-only increase is suppressed). An absent row is treated by the consumer as "never matches", so omission (skip-degrade) is always safe.

## Failure isolation — two opposite postures

The manifest mixes **pulled** data (the envelopes) and **site-authored** data (the policy), and they degrade oppositely — the same split [help-collection](/conventions/help-collection.md) draws between pulled and authored inputs.

- **Pulled envelope → SKIP-DEGRADE.** A slug whose `help/<slug>.json` is **missing** (ENOENT), **malformed JSON**, or **schema-invalid** (`HelpDocSchema.safeParse` fails) is **omitted** from `tools`, and `buildManifest` continues over the remaining tools. This is the `/llms.txt` posture and the help-collection per-tool isolation — NOT `VersionTable`'s build-stop. Envelope parsing reuses the shared `HelpDocSchema` (`src/lib/schemas.ts`) — never hand-parsed. `buildManifest` distinguishes ENOENT (caught, skip) from an unexpected `fs` error (re-thrown), and uses `safeParse` so a present-but-invalid file skips rather than throws.
- **Site-authored policy → BUILD-STOP.** `readPolicy` uses `VersionsPolicySchema.parse` (not `safeParse`), so a missing file, malformed JSON, an unknown `notify` value, or a malformed entry **throws** and fails `astro build`. Site data is authored in this repo, so a defect is a bug to fix up front, not to ship silently.

### Requirement: Envelope failures skip-degrade; policy invalidity build-stops
A missing or Zod-invalid `help/<slug>.json` SHALL omit that tool's row while the build continues; an invalid `versions-policy.json` SHALL fail the build.

#### Scenario: Missing envelope skip-degrades
- **GIVEN** a tool declared in the policy whose `help/<slug>.json` is absent or fails `HelpDocSchema`
- **WHEN** the manifest is built
- **THEN** that tool has no row and the build succeeds with the remaining tools present

#### Scenario: Invalid policy build-stops
- **GIVEN** a `versions-policy.json` with a `notify` value outside `{never, patch, minor}` or a malformed entry
- **WHEN** the site builds
- **THEN** `astro build` fails loudly and non-zero

## The policy file — `versions-policy.json`

Hand-edited, project-level data at the **repo root** (a sibling of `help/`, **NOT** inside it — `refresh-help.yml`'s staleness gate and `validate-help.mjs` glob `help/*.json` and must not see a non-envelope file). It maps each consumer-facing roster name to `{ "notify": <value> }` with optional `"formula"` and `"envelope"` overrides (`envelope` names which `help/<slug>.json` supplies `latest` when the help-file slug differs from the key). Current values: `run-kit` → `minor` with `envelope: "hexokit"` (reads `help/hexokit.json`); every other tool → `minor`, except `shll` → `patch`.

These are deliberately **data, not design**: tuning a threshold is a one-line commit here, picked up by deployed run-kit daemons within a poll cycle — no consumer binary update, no shipping a threshold through the very channel being tuned.

## Freshness cascade (no workflow changes)

The manifest rides the **existing** refresh→deploy cascade — no change to any workflow. `refresh-help.yml` commits fresh envelopes and dispatches `deploy.yml`; the deploy rebuild regenerates `versions.json` from those envelopes. Editing `versions-policy.json` on `main` triggers `deploy.yml` via its normal `on: push`. Worst-case consumer-visible latency is ~24h capture lag plus the consumer's poll interval — acceptable for update reminders. See [build-deploy/deployment](/build-deploy/deployment.md) for the cascade mechanics (the `xs1j` dispatch fix that makes a scheduled-puller commit actually deploy).

## Consumer

The manifest is consumed cross-repo by run-kit's update check (change `260718-d15e-toolkit-manifest-update-notifications`), which shells out to `shll check-updates --json`; **shll matches manifest rows against its roster `Name`** (`manifest.Tools[name]`), compares each `latest` against the locally-installed version, and applies the tool's `notify` threshold. This is why the `run-kit` row keeps its key while reading `help/hexokit.json` via the `envelope` override — renaming the key would silently stop update notices for every installed run-kit until shll's roster is renamed. The full consumer contract and `notify` table live in [`docs/specs/versions-manifest-contract.md`](../../specs/versions-manifest-contract.md).

## Design Decisions

### Manifest logic lives in a unit-tested lib, endpoint page is thin
**Decision**: the policy Zod schema, `stripVersionPrefix`, `readPolicy`, and the pure `buildManifest(repoRoot, policy, now?)` live in `src/lib/versions-manifest.ts`; `versions.json.ts` only resolves the repo root and delegates.
**Why**: a page cannot be imported by a plain `node --test` script, so extracting the logic makes it unit-testable in isolation (`scripts/versions-manifest.test.mjs`, 13 cases, registering `astro-content-alias.mjs` like `llms.test.mjs`). This matches the `llms.ts` / `terminal-toolcard.ts` lib-extraction precedent — endpoints stay thin, logic stays testable. `buildManifest`'s `now` is injectable so tests can pin `generated_at`.
**Rejected**: inlining all logic in the endpoint page (untestable without a full Astro build).
*Introduced by*: 260718-2lgz-versions-manifest-endpoint

### A dedicated bare-version normalizer, not reuse of `normalizeVersion`
**Decision**: `versions-manifest.ts` provides its own `stripVersionPrefix` (strips a leading `v`) rather than reusing `src/lib/version.ts`'s `normalizeVersion`.
**Why**: `normalizeVersion` *prepends* `v` for display (the `$ shll version` block / `CommandReference` toolbar); the manifest is a machine contract needing the *bare* form. The two are inverse transforms, so a small dedicated helper is clearer than overloading the display helper with a mode flag. `normalizeVersion` stays live for its display consumers (`VersionTable` / `CommandReference`).
**Rejected**: overloading `normalizeVersion` with a mode flag (muddies its single-purpose display contract).
*Introduced by*: 260718-2lgz-versions-manifest-endpoint

### The policy file's keys are the roster
**Decision**: `buildManifest` iterates the keys declared in `versions-policy.json` as the roster, not a `readdirSync(help/)` listing or a hardcoded site const.
**Why**: a tool with no policy has no notify semantics, so it should not be advertised; keying the roster off the policy makes "which tools to advertise" a one-file edit and avoids a third roster to keep in sync.
**Rejected**: `readdirSync(help/)` (would advertise a tool with no policy) or a hardcoded const (a third roster to drift).
*Introduced by*: 260718-2lgz-versions-manifest-endpoint

### Manifest key stays the consumer's roster name; `envelope` points at the help file
**Decision**: `versions-policy.json` keys are the consumer-facing roster names (`shll`'s `Name`), with an optional `envelope` naming the `help/<slug>.json` that supplies `latest`.
**Why**: `shll check-updates` matches `manifest.Tools[roster Name]` and the name is `run-kit` until shll's roster is renamed; dropping or renaming the row would silently stop update notices for every installed user.
**Rejected**: renaming the row to `hexokit` (breaks the consumer); keeping the product's help file unrenamed (leaves `hexokit` out of the pull pipeline's one-slug-change design).
*Introduced by*: 260910-it5d-hexokit-site-structure

### Opposite failure postures for pulled vs. authored data
**Decision**: pulled envelopes skip-degrade (`safeParse`, omit the row, continue); the site-authored policy build-stops (`parse`, throw, fail the build).
**Why**: this mirrors help-collection's pulled-vs-authored split. A pulled envelope's absence is a transient upstream state the consumer already treats as never-match, so omission is safe; the policy is authored in this repo, so a defect there is a bug to fix before it ships. Two data kinds, two consequences from the same `Zod` shape.
**Rejected**: a uniform posture (either would be wrong for one of the two data kinds — build-stopping on a transient missing envelope, or silently shipping a malformed authored policy).
*Introduced by*: 260718-2lgz-versions-manifest-endpoint
