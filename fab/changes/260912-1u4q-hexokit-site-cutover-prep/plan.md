# Plan: HexoKit site cutover prep — shll.ai redirect map + cron seed

**Change**: 260912-1u4q-hexokit-site-cutover-prep
**Intake**: `intake.md`

## Requirements

All paths below are relative to `sites/astro-starlight-terminal1/` (the live site, `SITE_DIR` in `deploy.yml`) unless they start with `.github/`, `docs/`, `fab/`, `help/`, or `content/` (repo root).

### Operations: Refresh crons seeded

#### R1: Both refresh workflows are enabled and have run once on `main` before the map is verified
The operator step S3 deferred SHALL be executed as the first task of apply: `Refresh: Help` (`refresh-help.yml`) and `Refresh: README` (`refresh-readme.yml`) MUST be enabled with `gh workflow enable`, dispatched once each with `gh workflow run … --ref main`, and observed to complete green. After both complete, `origin/main` MUST carry `content/hexokit/site/gui.md` and `content/hexokit/site/skill/cron.md`, MUST NOT carry `help/run-kit.json` or `content/run-kit/`, and `content/hexokit/README.md`'s first paragraph MUST no longer read "run-kit is a remote console". The change branch MUST then be fast-forwarded onto `origin/main` so every later build/test task runs on the seeded tree.

- **GIVEN** `gh workflow list --repo sahil87/hexokit-site` shows both Refresh workflows `disabled_manually`
- **WHEN** the operator step runs (enable both, run both with `--ref main`, watch each run to completion)
- **THEN** both workflows read `active`, both runs conclude `success`, and the dispatched Deploy run (if either committed) concludes `success`
- **AND** `git ls-tree origin/main content/hexokit/site/` lists `gui.md` and `skill/cron.md`, `git ls-tree origin/main help/run-kit.json content/run-kit` is empty, and `curl -s https://hexokit.com/docs/gui/` returns 200 once the deploy lands

### Site: In-site redirect table extracted

#### R2: `siteRedirects()` is the single in-site redirect table and the build is byte-identical
A new plain-ESM module `src/lib/site-redirects.mjs` SHALL export `FAMILY_REDIRECTS` (the seven literal family entries: `/tools`, `/getting-started/{overview,install,philosophy}`, `/toolkit/overview`, `/workflows/{daily-flow,new-change}`) and `siteRedirects()`, which returns exactly the object `astro.config.mjs` builds today: the roster-driven `/tools/<name>{,/overview,/readme,/commands}` set (keyed by slug and `legacyMounts`), the legacy-mount set (`/<legacy>{,/readme,/commands}` → `/<mount>/…`), `docsSiteRedirectEntries()`, and `FAMILY_REDIRECTS`. `astro.config.mjs` MUST use `redirects: siteRedirects()` and carry no inline redirect entries. The set of emitted redirect stub pages and their targets MUST be unchanged.

- **GIVEN** the current `astro.config.mjs` `redirects:` literal
- **WHEN** it is replaced by `redirects: siteRedirects()` from `src/lib/site-redirects.mjs`
- **THEN** `Object.entries(siteRedirects())` sorted equals the previous literal's entries sorted (asserted by a unit test that reconstructs the four contributing sets), and `pnpm build` emits the same `dist/**/index.html` redirect stubs with the same `<meta http-equiv="refresh">` targets as before (spot-check `dist/run-kit/index.html`, `dist/tools/wt/readme/index.html`, `dist/tools/index.html`, `dist/tools/hexokit/install/index.html`)

### Site: The cross-site redirect map

#### R3: `buildShllAiRedirectMap` enumerates every old shll.ai path with canonical keys
`src/lib/shll-ai-redirects.ts` SHALL export `buildShllAiRedirectMap(input: { pages: readonly string[]; redirects: Readonly<Record<string,string>>; origin: string }): RedirectMap` where `RedirectMap` is `{ schema: 1; generated_at: string; from: 'https://shll.ai'; to: string; keep: string[]; redirects: Record<string,string>; rules: [string,string][] }`. Its **sources** are the union of: every live page path, every in-site redirect key, and the two agent endpoints `/llms.txt` and `/llms-full.txt`. Every key MUST be **canonical**: page-like paths end with exactly one `/` (`/tools/wt/readme` and `/tools/wt/readme/` collapse to `/tools/wt/readme/`; `/` stays `/`), file-like paths (last segment contains a `.`) stay bare. Keys MUST be emitted in sorted order. Values MUST be absolute URLs built from `origin` (never hardcoded). The module MUST have no Astro or disk imports (pure, unit-testable with `node --test`).

- **GIVEN** `pages = ['/', '/docs/', '/wt/readme/']`, `redirects = { '/tools/wt/readme': '/wt/readme/', '/run-kit': '/docs/' }`, `origin = 'https://hexokit.com'`
- **WHEN** `buildShllAiRedirectMap` runs
- **THEN** `redirects` contains exactly `'/'`, `'/docs/'`, `'/wt/readme/'`, `'/tools/wt/readme/'`, `'/run-kit/'`, `'/llms.txt'`, `'/llms-full.txt'` as keys, `'/tools/wt/readme/'` → `'https://hexokit.com/wt/readme/'`, `'/run-kit/'` → `'https://hexokit.com/docs/'`, `'/llms.txt'` → `'https://hexokit.com/llms.txt'`, and the keys are sorted

#### R4: Every value is a final live page — chains collapse, dangling targets throw
For each source, resolution SHALL be: if the canonical path is a live page → `origin + path`; otherwise follow the in-site table (matching the bare key, at most 3 hops) until a live page is reached. A chain that ends at a path that is neither a live page nor a redirect key MUST throw an `Error` naming the source and the dangling target (site-authored input; build-stop posture). `/llms.txt` and `/llms-full.txt` are treated as live (they are build-time endpoints, not collection pages).

- **GIVEN** `redirects = { '/a': '/b/', '/b': '/c/' }` and `pages = ['/c/']`
- **WHEN** the map is built
- **THEN** `'/a/'` → `'https://hexokit.com/c/'` and `'/b/'` → `'https://hexokit.com/c/'` (no value's path is itself a redirect key with a different value)
- **GIVEN** `redirects = { '/a': '/nowhere/' }` and `pages = []`
- **WHEN** the map is built
- **THEN** it throws an `Error` whose message contains `/a` and `/nowhere/`

#### R5: `keep` is exactly `/install` and `/versions.json`, excluded from `redirects`
The map's `keep` array SHALL be `['/install', '/versions.json']` (a module constant `KEEP_ON_SHLL_AI`). Neither path MAY appear as a `redirects` key, even if present in `pages`.

- **GIVEN** any input
- **WHEN** the map is built
- **THEN** `keep` deep-equals `['/install', '/versions.json']` and `Object.keys(redirects)` contains neither

#### R6: `rules` generalize the enumeration and are consistent with it
The map SHALL emit ordered `rules` as `[regexSource, replacement][]` derived mechanically from the roster (`legacyMounts` → the `run-kit`→`docs` rewrite) and `FAMILY_REDIRECTS` — never a second hand-typed table:

```
^/tools/?$                     → /toolkit/
^/(?:tools/)?run-kit(/.*)?$    → /docs$1
^/tools/([^/]+)/overview/?$    → /$1/
^/tools/([^/]+)(/.*)?$         → /$1$2
^/getting-started/overview/?$  → /toolkit/
^/getting-started(/.*)?$       → /toolkit$1
^/workflows(/.*)?$             → /toolkit$1
^/toolkit/overview/?$          → /toolkit/
^(/.*)$                        → $1
```

The block above is illustrative; the emitted list also carries the two overview-collapse rules (`^/(?:tools/)?run-kit/overview/?$` and `^/tools/hexokit/overview/?$`) ahead of their generic siblings — 12 rules in total, listed exactly in the spec §4.

An exported helper `applyRules(rules, pathname): string` SHALL apply the first matching rule and canonicalize the result. For every key `k` of `redirects`, `origin + canonical(applyRules(rules, k))` MUST equal `redirects[k]` (asserted by a unit test over a roster-shaped synthetic input and by the checker over the real build). The `run-kit` rule MUST be built from `TOOL_ROSTER` entries that carry `legacyMounts`, so a future legacy mount extends the rules without editing them.

- **GIVEN** the real roster and the real `siteRedirects()` composed with the real page set
- **WHEN** `applyRules` is evaluated on every enumerated key
- **THEN** it reproduces that key's enumerated value for 100% of keys

#### R7: `/shll-ai-redirects.json` is a build-time static endpoint
`src/pages/shll-ai-redirects.json.ts` SHALL emit the map as `application/json; charset=utf-8` (pretty-printed, trailing newline — the `versions.json.ts` shape) using: `pages` = `'/'` ∪ `'/' + entry.id + '/'` for every `getCollection('docs')` entry except `404` ∪ `'/' + mountFor(page.slug) + '/' + page.path + '/'` for every `collectDocsSitePages(repoRoot)` entry; `redirects = siteRedirects()`; `origin = site` (from the endpoint context — `Astro.site` is `https://hexokit.com`). `generated_at` is `new Date().toISOString()` at build. The endpoint MUST import the map logic from the lib, not reimplement it.

- **GIVEN** `pnpm build` on the seeded tree
- **WHEN** `dist/shll-ai-redirects.json` is read
- **THEN** it parses as JSON with `schema: 1`, `from: 'https://shll.ai'`, `to: 'https://hexokit.com'`, contains keys `/run-kit/`, `/run-kit/gui/`, `/run-kit/skill/cron/`, `/tools/run-kit/readme/`, `/tools/`, `/getting-started/install/`, `/workflows/daily-flow/`, `/wt/readme/`, `/shll/standards/update/`, `/llms.txt`, and its `/run-kit/gui/` value is `https://hexokit.com/docs/gui/`

### Verification: Completeness against what shll.ai serves

#### R8: A committed fixture plus a post-build checker prove every old shll.ai URL lands
`scripts/fixtures/shll-ai-paths.txt` SHALL list one path per line (blank lines and `#` comments ignored; header comment carrying the fetch date and command): the 75 paths from `https://shll.ai/sitemap-0.xml` fetched 2026-09-12, plus the historical set — `/tools/<slug>`, `/tools/<slug>/overview`, `/tools/<slug>/readme`, `/tools/<slug>/commands` for each of `idea hop fab-kit wt run-kit tu shll`, and `/tools/<slug>/<page>` for every sitemap path of the form `/<slug>/<page>/` (page ≠ readme/commands) under those slugs. `scripts/check-shll-ai-redirects.mjs` (no deps; run from the site dir after `pnpm build`) SHALL read `dist/shll-ai-redirects.json` and the fixture and exit non-zero listing every violation of: (a) every fixture path, canonicalized, is a `redirects` key or a `keep` entry; (b) every `redirects` value, stripped of `to`, exists in `dist/` (`<path>index.html` for page-like, the bare file for file-like) and that HTML does **not** contain `http-equiv="refresh"`; (c) no value's path is a `redirects` key whose value differs (no chains); (d) every `keep` path exists in `dist/` (`/install` is produced by the deploy-time fetch step, so the checker treats a missing `dist/install` as a warning, not a failure, when `public/install` is absent); (e) `applyRules` over every key reproduces its value (R6). `.github/workflows/ci.yml` SHALL run it as a `Check shll.ai redirect map` step immediately after `Build site`.

- **GIVEN** the seeded tree and a green `pnpm build`
- **WHEN** `node scripts/check-shll-ai-redirects.mjs` runs
- **THEN** it exits 0 and prints a one-line summary (`{N} fixture paths covered, {M} map entries verified, {K} keep files present`)
- **GIVEN** a fixture line `/run-kit/does-not-exist/` is added temporarily
- **WHEN** the checker runs
- **THEN** it exits non-zero naming that path under violation (a)

### Documentation

#### R9: The cross-repo contract and the verify recipe are written down
`docs/specs/shll-ai-redirect-map-contract.md` SHALL document, in the `versions-manifest-contract.md` style: the endpoint URL, the schema (fields, key canonicalization, `keep` semantics, `rules` ordering and the `applyRules` algorithm), the producer (this repo, build-time), the consumer (X2's stub generator in `sahil87/shll.ai`: one `<key>index.html` per `redirects` entry carrying `<meta http-equiv="refresh" content="0; url=…">`, `<link rel="canonical" href=…>`, and a `location.replace` fallback; a `404.html` applying `rules`; `keep` paths served as byte copies refreshed by the stub's CI), the freshness note (the fixture is a floor; X2 re-fetches shll.ai's final sitemap into the fixture, re-runs the checker, then removes shll.ai's crons so the set freezes), and the change-id citation. `docs/specs/index.md` SHALL gain its row. The site `README.md` verify block SHALL gain the checker command after `pnpm build`.

- **GIVEN** a reader in the `sahil87/shll.ai` repo authoring X2
- **WHEN** they open the spec
- **THEN** they can generate the stub from the endpoint alone, without reading this repo's source

### Non-Goals

- Flipping `TOOL_ROSTER.repo`/`formula`/`binary`, `versions-policy.json`'s `run-kit` key or `envelope`, or `help/hexokit.json`'s `tool` — R1/R2 of the rebrand plan.
- Any edit to the `sahil87/shll.ai` repo, its DNS, or `www.shll.ai` — X2. Standards prose — X4. Install-script default — R1.
- Mapping `robots.txt`, `sitemap*.xml`, favicons, `og-image.png`, `/.well-known/security.txt`, `/screenshots/*` — X2 authors the stub's own chrome.
- Memory/spec hydration beyond the spec file in R9 — hydrate stage.
- Substrate identifiers (`rk`, `RK_*`, `@rk_*`) — never touched.

### Design Decisions

#### Cross-site map is a build-time endpoint composed from the in-site table
**Decision**: Publish the shll.ai→hexokit.com map as `/shll-ai-redirects.json`, built at `astro build` time from the live page set (content collection + docs/site trees) and the extracted `siteRedirects()` table, with every value collapsed to a final live page.
**Why**: Only the build knows the live route set; X2's stub CI already fetches `/install` and `/versions.json` from hexokit.com, so the map rides the same copy step; composing the in-site table means the map cannot drift from the routes it describes, and collapsing chains avoids two `<meta refresh>` hops.
**Rejected**: A committed JSON file (a second table that goes stale the day a docs page lands); prefix rules only (Pages cannot wildcard, so X2 needs one stub per URL regardless); the literal double hop `shll.ai/tools/* → hexokit.com/tools/*` (slow, SEO-lossy, and free to collapse in-repo).
*Introduced by*: 260912-1u4q-hexokit-site-cutover-prep

#### Completeness is a fixture floor checked post-build, not a runtime fetch
**Decision**: Commit shll.ai's sitemap (plus the historical `/tools/<slug>/*` set) as `scripts/fixtures/shll-ai-paths.txt` and verify coverage with a post-build checker wired into CI.
**Why**: Constitution I forbids runtime fetches and the build must stay hermetic; a frozen fixture makes "every old URL lands" a checkable PR-time claim (the `scripts/fixtures/` precedent), and the map covers pages added after the fetch by identity so the fixture is a floor, not a ceiling.
**Rejected**: Fetching the sitemap during the build (non-hermetic, network-flaky); trusting the enumeration without a cross-check (the exact failure X1 exists to prevent).
*Introduced by*: 260912-1u4q-hexokit-site-cutover-prep

#### `rules` are derived, and asserted equal to the enumeration
**Decision**: Emit the ordered prefix rules from `TOOL_ROSTER.legacyMounts` and `FAMILY_REDIRECTS`, and assert in test + checker that applying them to every enumerated key reproduces its value.
**Why**: X2's `404.html` needs a generalization for un-enumerated paths; deriving it from the same sources and asserting equivalence keeps it from becoming a third hand-typed redirect table.
**Rejected**: Hand-writing the regex list in the spec only (drifts silently); omitting rules (leaves every un-enumerated old URL a hard 404).
*Introduced by*: 260912-1u4q-hexokit-site-cutover-prep

## Tasks

### Phase 1: Setup — seed the crons and rebase

- [x] T001 Operator step on `main` (repo `sahil87/hexokit-site`, `gh` as the default `sahil-noon` account; only if GitHub refuses with a permissions error, wrap in `gh auth switch --user sahil87 … ; trap 'gh auth switch --user sahil-noon' EXIT`): `gh workflow enable refresh-help.yml --repo sahil87/hexokit-site && gh workflow enable refresh-readme.yml --repo sahil87/hexokit-site`; then `gh workflow run refresh-help.yml --repo sahil87/hexokit-site --ref main` and `gh workflow run refresh-readme.yml --repo sahil87/hexokit-site --ref main`; find each run with `gh run list --repo sahil87/hexokit-site --workflow=<file> --limit 1 --json databaseId,status --jq '.[0].databaseId'` and `gh run watch <id> --repo sahil87/hexokit-site --exit-status` (the help run brews `sahil87/tap/run-kit` and can take 5–10 min). Verify: `gh workflow list --repo sahil87/hexokit-site` shows both `active`; `git fetch origin` then `git ls-tree -r --name-only origin/main content/hexokit/site | grep -E 'gui.md|skill/cron.md'` prints both; `git ls-tree origin/main help/run-kit.json content/run-kit` prints nothing; `git show origin/main:content/hexokit/README.md | head -3` no longer contains "run-kit is a remote console"; the dispatched Deploy run (`gh run list --workflow=deploy.yml --limit 1`) is `success`; `curl -s -o /dev/null -w '%{http_code}' https://hexokit.com/docs/gui/` is 200 after the deploy. If a refresh run fails, read `gh run view <id> --log-failed` and STOP with the reason (do not proceed to T002 on a stale tree). Record the run IDs and the verify results under `## Notes` below. <!-- R1 -->
- [x] T002 Fast-forward the change branch onto the seeded main: `git fetch origin && git merge --ff-only origin/main` (the branch has no commits of its own yet; the working tree's only changes are under `fab/changes/260912-1u4q-…/`, which the seed commits never touch). Confirm `ls content/hexokit/site/gui.md content/hexokit/site/skill/cron.md` succeeds locally, then baseline: `cd sites/astro-starlight-terminal1 && node scripts/validate-help.mjs && node --test scripts/*.test.mjs` must be green before any code change. <!-- R1 -->

### Phase 2: Core Implementation

- [x] T003 Create `sites/astro-starlight-terminal1/src/lib/site-redirects.mjs` exporting `FAMILY_REDIRECTS` and `siteRedirects()` (move the four contributing sets verbatim from `astro.config.mjs`, keep the explanatory comments, import `TOOL_ROSTER` from `./tool-roster.mjs` and `docsSiteRedirectEntries` from `./docs-site-sidebar.mjs`); in `astro.config.mjs` replace the literal with `redirects: siteRedirects()` and drop the now-unused `docsSiteRedirectEntries` import (keep `docsSiteSidebarItems`). Header comment explains the extraction's second consumer (the cross-site map). <!-- R2 -->
- [x] T004 [P] Add `sites/astro-starlight-terminal1/scripts/site-redirects.test.mjs` (plain ESM, no alias needed): asserts `FAMILY_REDIRECTS` has the seven entries; `siteRedirects()` contains `/tools/hexokit/readme` → `/docs/readme/`, `/tools/run-kit/readme` → `/docs/readme/`, `/run-kit/commands` → `/docs/commands/`, `/tools/wt/overview` → `/wt/`, `/tools` → `/toolkit/`, and every `docsSiteRedirectEntries()` entry; and that no value lacks a trailing slash. <!-- R2 -->
- [x] T005 Create `sites/astro-starlight-terminal1/src/lib/shll-ai-redirects.ts` (pure; imports only `TOOL_ROSTER` from `./tool-roster.mjs` and `FAMILY_REDIRECTS` from `./site-redirects.mjs`): export `MAP_SCHEMA = 1`, `SHLL_AI_ORIGIN = 'https://shll.ai'`, `KEEP_ON_SHLL_AI = ['/install', '/versions.json']`, `AGENT_ENDPOINTS = ['/llms.txt', '/llms-full.txt']`, `canonicalPath(p)` (collapse duplicate slashes; page-like → exactly one trailing `/`; file-like → bare; `/` stays), `buildRules()` (the R6 list, `run-kit` rule built from roster `legacyMounts`, family rules from `FAMILY_REDIRECTS`), `applyRules(rules, pathname)`, `resolveFinal(path, pages, redirects)` (≤ 3 hops, throws on dangling), and `buildShllAiRedirectMap(input)` per R3–R6 (sorted keys, `keep` excluded, `generated_at` ISO). JSDoc header in the `versions-manifest.ts` voice. <!-- R3 R4 R5 R6 -->
- [x] T006 Add `sites/astro-starlight-terminal1/scripts/shll-ai-redirects.test.mjs` (imports the `.ts` lib directly — Node 22 type-stripping, the `versions-manifest.test.mjs` precedent; no `astro:content` alias needed since the lib has no Astro imports): cover `canonicalPath` (bare/slashed collapse, file-like bare, `/`), the R3 GIVEN/WHEN/THEN, R4's chain collapse and dangling throw, R5's keep exclusion, R6's rules≡enumeration over a synthetic roster-shaped input (a `/tools/<name>/*` set, a legacy-mount set, family entries, a few docs pages), sorted keys, and absolute values from `origin`. <!-- R3 R4 R5 R6 -->
- [x] T007 Create `sites/astro-starlight-terminal1/src/pages/shll-ai-redirects.json.ts` per R7 (imports `getCollection` from `astro:content`, `collectDocsSitePages` from `../lib/docs-site-tree.ts`, `mountFor` from `../lib/tool-slugs.ts`, `repoRootFromModuleUrl` from `../lib/repo-root.ts`, `siteRedirects` from `../lib/site-redirects.mjs`, `buildShllAiRedirectMap` from `../lib/shll-ai-redirects.ts`); header comment in the `versions.json.ts` voice naming the consumer (X2) and the spec. <!-- R7 -->

### Phase 3: Integration & Verification

- [x] T008 Create `sites/astro-starlight-terminal1/scripts/fixtures/shll-ai-paths.txt` per R8: fetch `curl -fsSL https://shll.ai/sitemap-0.xml | grep -o '<loc>[^<]*</loc>' | sed 's#<loc>https://shll.ai##;s#</loc>##' | sort` (expect 75 lines), then append the historical `/tools/<slug>/*` set generated from those lines; header comment with date + command; add a row to `scripts/fixtures/README.md`. <!-- R8 -->
- [x] T009 Create `sites/astro-starlight-terminal1/scripts/check-shll-ai-redirects.mjs` per R8 (a)–(e): args default to `dist/shll-ai-redirects.json` and `scripts/fixtures/shll-ai-paths.txt`; import `canonicalPath`/`applyRules` from `../src/lib/shll-ai-redirects.ts`; print every violation with its clause letter and the path; exit 1 on any failure; one-line success summary. <!-- R8 -->
- [x] T010 Wire it: add a `Check shll.ai redirect map` step to `.github/workflows/ci.yml` right after `Build site` (`working-directory: sites/astro-starlight-terminal1`, `run: node scripts/check-shll-ai-redirects.mjs`); add the same command to the site `README.md` verify block after `pnpm build`. <!-- R8 R9 -->
- [x] T011 Verify end to end from `sites/astro-starlight-terminal1`: `node scripts/validate-help.mjs && node --test scripts/*.test.mjs && pnpm build && node scripts/check-shll-ai-redirects.mjs`; confirm the R2 stub spot-checks are byte-identical to a pre-change build of the same tree (build once before T003 on the seeded tree into a scratch copy of `dist/` if practical, or compare the four listed stubs' `<meta>` targets), confirm R7's listed keys and the `/run-kit/gui/` value in `dist/shll-ai-redirects.json`, and run the R8 negative case (temporary bogus fixture line → non-zero, then revert). Fix anything found and re-run. <!-- R2 R7 R8 -->

### Phase 4: Polish

- [x] T012 Write `docs/specs/shll-ai-redirect-map-contract.md` per R9 and add its row to `docs/specs/index.md`; cite the change id once in the spec's provenance line. <!-- R9 -->

## Execution Order

- T001 blocks T002; T002 blocks everything after it (all builds/tests must run on the seeded tree).
- T003 blocks T004, T005 (imports `FAMILY_REDIRECTS`), T007.
- T005 blocks T006, T007, T009.
- T008 and T009 block T011; T010 is independent of T011 but lands before it.

## Acceptance

### Functional Completeness

- [x] A-001 R1: both Refresh workflows are `active`, each has one green dispatched run, `origin/main` carries `content/hexokit/site/gui.md` and `skill/cron.md`, carries no `help/run-kit.json` / `content/run-kit/`, and the run IDs + verify results are recorded under `## Notes` — re-verified at review: `gh workflow list` shows both `active`; the seeded files are on `origin/main`; no `run-kit` data dirs
- [x] A-002 R2: `src/lib/site-redirects.mjs` exists with `FAMILY_REDIRECTS` and `siteRedirects()`; `astro.config.mjs` uses `redirects: siteRedirects()` and contains no inline redirect entries
- [x] A-003 R3: `buildShllAiRedirectMap` enumerates live pages ∪ redirect keys ∪ the two agent endpoints with canonical, sorted keys and absolute values from `origin` — unit tests pass; built map keys verified canonical and sorted
- [x] A-004 R4: chains collapse to final live pages and a dangling target throws an `Error` naming source and target — both unit tests pass
- [x] A-005 R5: `keep` equals `['/install', '/versions.json']` and neither appears in `redirects` — unit test passes; verified in `dist/shll-ai-redirects.json`
- [x] A-006 R6: `rules` are built from `TOOL_ROSTER.legacyMounts` + `FAMILY_REDIRECTS`; `applyRules` reproduces every enumerated value (unit test + checker clause (e)) — 12 rules, equivalence holds over synthetic input, the real table, and the real build. Note: the implementation correctly emits two overview-collapse rules (`/(?:tools/)?run-kit/overview`, `/tools/hexokit/overview`) that R6's illustrative list omitted — the invariant, not the illustration, is normative; spec §4 lists the real 12
- [x] A-007 R7: `dist/shll-ai-redirects.json` exists after `pnpm build`, parses, and contains the ten listed keys with `/run-kit/gui/` → `https://hexokit.com/docs/gui/` — all ten verified in the built output (199 entries, sorted, trailing newline)
- [x] A-008 R8: `scripts/fixtures/shll-ai-paths.txt` has the 75 sitemap paths plus the historical set; `check-shll-ai-redirects.mjs` implements clauses (a)–(e) and is a `ci.yml` step after `Build site` — met in substance: the fixture carries the full sitemap as fetched (75 paths, not the 73 the plan counted — diffed against a fresh `curl` of `https://shll.ai/sitemap-0.xml` at review: identical) plus the 74-line historical set; all five clauses implemented; CI step sits immediately after `Build site`
- [x] A-009 R9: the spec exists with schema/producer/consumer/freshness sections, `docs/specs/index.md` has its row, and the site README verify block names the checker

### Behavioral Correctness

- [x] A-010 R2: the built redirect stubs are unchanged — `dist/run-kit/index.html`, `dist/tools/wt/readme/index.html`, `dist/tools/index.html`, `dist/tools/hexokit/install/index.html` carry the same `<meta http-equiv="refresh">` targets as before the extraction — verified byte-for-byte at review: a baseline `pnpm build` from a HEAD worktree (pre-extraction) diffed against the post-change build; the complete stub file sets are identical and every stub page compares byte-identical (the only `dist/` deltas are `shll-ai-redirects.json` (new) and build-timestamp churn in `versions.json` / `security.txt`)
- [x] A-011 R1: after the seed deploy, `https://hexokit.com/docs/gui/` returns 200 and `https://hexokit.com/docs/readme/` no longer contains "run-kit is a remote console" — re-verified at review: both `/docs/gui/` and `/docs/skill/cron/` return 200; the phrase has 0 matches

### Scenario Coverage

- [x] A-012 R3: the R3 GIVEN/WHEN/THEN is a passing unit test
- [x] A-013 R4: both R4 scenarios (collapse, dangling throw) are passing unit tests
- [x] A-014 R8: the checker exits 0 on the real build with the one-line summary (`149 fixture paths covered, 199 map entries verified, 1 keep files present`, plus the expected warn-only `/install` line), and exits non-zero naming the path when a bogus fixture line is added — negative case run at review: `/run-kit/does-not-exist/` → exit 1, `FAIL (a) /run-kit/does-not-exist/`, then reverted

- [x] A-015 R3: `canonicalPath` handles `/`, duplicate slashes, bare vs slashed page paths, and file-like paths (`/llms.txt`, `/versions.json`) as specified — all four unit tests pass
- [x] A-016 R8: a missing `dist/install` (no `public/install` locally) is a warning, not a failure — observed at review (`WARN (d) /install: missing in dist/ …`, exit 0); a missing `dist/shll-ai-redirects.json` is a clear error naming `pnpm build` (`check-shll-ai-redirects.mjs:49-54`)

### Code Quality

- [x] A-017 Pattern consistency: new lib/endpoint/test/checker files follow the `versions-manifest.ts` / `versions.json.ts` / `*.test.mjs` / `validate-help.mjs` header-comment and structure conventions; config-eval modules are `.mjs`
- [x] A-018 No unnecessary duplication: the endpoint reuses `collectDocsSitePages`, `mountFor`, `repoRootFromModuleUrl`, `siteRedirects`; the checker reuses `canonicalPath`/`applyRules` from the lib; no second redirect or roster table anywhere (the `site-redirects.test.mjs` reconstruction re-derives the sets deliberately — it is the pure-refactor pin T004 specified, not drift)
- [x] A-019 Readability over cleverness: `buildShllAiRedirectMap` and the checker are split into named helpers (`canonicalPath`, `resolveFinal`, `buildRules`, `applyRules`, per-clause check functions); no function exceeds ~50 lines (`buildRules` runs ~60 lines incl. comments, but is a linear rule-list assembly where splitting would hurt readability — accepted)
- [x] A-020 No magic strings: origins, keep list, agent endpoints, hop limit, and schema version are named constants (`MAP_SCHEMA`, `SHLL_AI_ORIGIN`, `KEEP_ON_SHLL_AI`, `AGENT_ENDPOINTS`, `MAX_REDIRECT_HOPS`)
- [x] A-021 Constitution I/VI: no runtime fetch, no new dependency (`package.json` / `pnpm-lock.yaml` untouched; everything build-time)

## Notes

- Check items as you review: `- [x]`
- All acceptance items must pass before `/fab-continue` (hydrate)
- If an item is not applicable, mark checked and prefix with **N/A**: `- [x] A-NNN **N/A**: {reason}`
- T001 operator record (run IDs, timestamps, verify results): 2026-09-12 — both workflows enabled (`gh workflow list --all`: `Refresh: Help`/`Refresh: README` → `active`). First dispatch: refresh-help run 34701123608 **failed** at the commit-push step (`main -> main (fetch first)`) — a push race with refresh-readme run 34701124781 (dispatched simultaneously; readme committed first). Re-dispatched refresh-help after the readme commit landed: run 34701219373 → `success` (commit `24436c7` "chore(help): refresh help/*.json"). refresh-readme run 34701124781 → `success` (commit `7921cd9`, incl. `content/hexokit/site/gui.md` + `skill/cron.md`). Verifies: `git ls-tree origin/main content/hexokit/site` lists `gui.md` and `skill/cron.md`; no `help/run-kit.json` / `content/run-kit` on origin/main; `content/hexokit/README.md` opens with the C3a HexoKit text (no "run-kit is a remote console"). Deploy runs: 34701142648 (readme commit) `success`; 34701286463 (help commit) `success`. Live: `https://hexokit.com/docs/gui/` → 200, `/docs/skill/cron/` → 200, `/docs/readme/` no longer contains "run-kit is a remote console" (0 matches).

## Deletion Candidates

- None beyond what the change itself removed — the one redundancy this change created (the inline `redirects:` literal in `astro.config.mjs`) was deleted by the extraction (T003) in the same diff. `docsSiteRedirectEntries()` keeps its call site (now via `site-redirects.mjs`); no other file, symbol, branch, or config was made redundant or left unused.

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Confident | `generated_at` is included in the map (ISO-8601 at build), matching `versions.json` | Parity with the sibling endpoint; harmless churn on a non-committed artifact | S:40 R:95 A:85 D:80 |
| 2 | Confident | Live pages are enumerated from `getCollection('docs')` entry ids (route slugs — the `llms.txt.ts` precedent) plus `/` plus `collectDocsSitePages`; the `404` entry is excluded | Exactly the route set the HTML build emits; `index.astro` is the only non-collection page | S:55 R:85 A:85 D:80 |
| 3 | Confident | The lib is `.ts` with no Astro imports so `node --test` imports it directly (no `astro-content-alias` hook), while `site-redirects.mjs` is plain ESM for the config-eval boundary | `versions-manifest.test.mjs` imports `.ts` under Node 22 type-stripping; config-eval loads `.mjs` only | S:50 R:90 A:90 D:85 |
| 4 | Confident | The historical fixture set is generated from the sitemap lines (`/tools/<slug>/…` for each `/<slug>/…/`), not typed by hand | Same anti-hand-copy discipline as the rest of the repo; the sitemap already lists every page | S:45 R:90 A:85 D:75 |
| 5 | Confident | The checker treats a missing `dist/install` as a warning locally (the file is produced by deploy's fetch step, absent in a plain `pnpm build`) and CI's build likewise lacks it, so clause (d) is warn-only for `/install` | `deploy.yml` fetches `public/install` before building; `ci.yml` does not | S:50 R:90 A:85 D:80 |
| 6 | Confident | T002 uses `git merge --ff-only origin/main` rather than `rebase` — the branch has no commits of its own at apply time | The change folder is uncommitted; a ff-merge is the no-op-safe form | S:60 R:95 A:90 D:85 |

6 assumptions (0 certain, 6 confident, 0 tentative).
