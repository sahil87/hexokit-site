# Intake: HexoKit site cutover prep — shll.ai redirect map + cron seed

**Change**: 260912-1u4q-hexokit-site-cutover-prep
**Created**: 2026-09-12

## Origin

> X1 (Phase 2 of run-kit's fab/plans/sahil/26-09-10-hexokit-rebrand.md, slug hexokit-site-cutover-prep): Redirect map for the old shll.ai paths ready (D7) -- also shll.ai/workflows/* -> hexokit.com/toolkit/* and shll.ai/tools/* -> hexokit.com/tools/* (S3 already left static redirects for every old path). Slug-table source stays sahil87/run-kit until R2. Refresh crons run once so /docs/ carries the C3a README. Read /home/sahil/code/sahil87/run-kit/fab/plans/sahil/26-09-10-hexokit-rebrand.md in full for context before writing the intake.

One-shot `/fab-new` invocation, no prior discussion in this session. The plan doc (which lives in the run-kit repo; this repo never contains it) is the design authority — Decision log D4/D5/D7/D11/D13, § Site shape, the X1/X2 rows, and the Pickup protocol were read in full. The current site source was inspected directly (`tool-roster.mjs`, `astro.config.mjs` `redirects:`, `docs-site-sidebar.mjs`, the `[mount]/[...path].astro` route, the `versions.json.ts` / `llms.txt.ts` endpoint idiom, both refresh workflows, `deploy.yml`, `ci.yml`), the archived S3 change (`it5d`) intake/plan was read for what it deferred to X1, and four live facts were verified with `gh`/`curl` on 2026-09-12 (see § Why → "Found by inspection").

## Why

**The problem.** Phase 2 flips shll.ai into a permanent redirect host (X2). X2 replaces the `sahil87/shll.ai` repo's contents with a stub — CNAME, one redirect page per old URL, byte copies of `/install` and `/versions.json`. It cannot be written until someone has enumerated *every* URL shll.ai ever served and decided where each one lands on hexokit.com. That enumeration is X1's deliverable: the **redirect map**. Today it exists only as two prose rules in D7 plus the it5d note ("add `shll.ai/workflows/*` and `shll.ai/tools/*`") — nothing machine-readable, nothing checked against what shll.ai actually serves.

**Found by inspection (2026-09-12):**

1. **Both refresh crons are still disabled.** `gh workflow list --repo sahil87/hexokit-site` shows `Refresh: Help` and `Refresh: README` as `disabled_manually` — S1 disabled them and S3's post-merge operator step ("`gh workflow enable` both + one `gh workflow run` each") was never executed. Consequences: `content/hexokit/README.md` is still the S1-era copy (`hexokit.com/docs/readme/` says "run-kit is a remote console…"; run-kit's `main` README H1 has read "HexoKit" since C3a merged today), `help/hexokit.json` is the `git mv`'d copy, and hexokit.com is **missing two docs pages shll.ai has**: `shll.ai/run-kit/gui/` and `shll.ai/run-kit/skill/cron/` exist (shll.ai's crons kept pulling; run-kit's `docs/site/` has `gui.md` and `skill/cron.md`) but `hexokit.com/docs/gui/` is a 404. So the "crons run once" half of X1 is not a formality — without it the redirect map has two dangling targets.
2. **shll.ai's live sitemap has 75 URLs** (fetched 2026-09-12, `https://shll.ai/sitemap-0.xml`): `/`, `/tools/`, 3× `/getting-started/*`, 2× `/workflows/*`, `/reference/command-index/`, 19× `/run-kit/**`, and the six companions' `/<tool>/{,readme/,commands/,install/,skill/,workflows/}` plus `fab-kit/{fkf,merge-topologies}` and `shll/standards/*` (9 pages). hexokit.com's sitemap had 72: the same set with `/run-kit/**` → `/docs/**` (minus the two missing pages above), `/getting-started/*` + `/workflows/*` → `/toolkit/*`, plus `/desktop/`.
3. **shll.ai also carries a historical namespace the sitemap does not list**: the pre-3ke3 `/tools/<slug>/{overview,readme,commands,<docs-page>}` deep URLs, which shll.ai still serves as in-site redirect stubs (its `astro.config.mjs` reverses them). Those may be indexed or bookmarked and belong in the map.
4. **hexokit.com already redirects every retired path in-site** (S3): `/run-kit/**` → `/docs/**`, `/tools/<name>/**` → `/<mount>/**`, `/tools` → `/toolkit/`, `/getting-started/*` and `/workflows/*` → `/toolkit/*`, `/toolkit/overview` → `/toolkit/`. The table is built inline in `astro.config.mjs` from the roster (`legacyMounts`), `docsSiteRedirectEntries()`, and seven literal family entries.

**What happens if we don't.** X2 gets hand-written from the D7 prose: it misses the historical `/tools/<slug>/*` set, misses `gui`/`skill/cron`, and has no way to prove completeness. Every miss is a 404 on a domain that has been the toolkit's only URL for months — exactly the cutover failure the phase ordering was designed to avoid. And `/docs/` keeps advertising "run-kit" after the announce.

**Why this shape.**

- *Generate the map from the same tables the site builds from, and publish it as a build-time endpoint.* hexokit-site is the only place that knows (a) the full live page set (Starlight collection + the pulled `docs/site` trees) and (b) the in-site redirect table. Composing the two gives a map whose every value is a **real, final page** — no double hop through a `<meta refresh>` stub, which the literal "`shll.ai/tools/* → hexokit.com/tools/*` (hops once more in-site)" phrasing would produce. Emitting it as `/shll-ai-redirects.json` (the `versions.json.ts` idiom: thin page, logic in a unit-tested lib) means X2's stub CI can fetch it alongside `/install` and `/versions.json` in the same copy step, and the map can never drift from the routes it describes.
- *Prove completeness against what shll.ai really serves.* A committed fixture of shll.ai's sitemap plus the historical `/tools/<slug>/*` set, and a post-build checker asserting every fixture path maps to a non-stub page in `dist/`. This is what turns "ready" in the X1 row into a checkable claim.
- *Run the crons first.* The seed runs commit to `main`; the map's build verification needs their output (the two missing pages). So the operator step is Phase 1 of apply, and the change branch rebases onto the post-seed `main` before the map is verified.

**Rejected:**

- *A committed JSON file instead of an endpoint.* Rejected: enumerating the live page set needs Astro's content collection (or a `dist/` walk), so it is a build artifact either way; a committed copy is a second table that goes stale the day a docs page lands. The endpoint costs nothing at runtime (static file) and is the established idiom.
- *Prefix rules only, no enumeration.* Rejected: GitHub Pages cannot wildcard-redirect, so X2 needs one stub file per old URL regardless — the enumeration is the artifact X2 consumes. Rules are still emitted, as the generalization for X2's `404.html` catch-all.
- *Double-hop mapping (`shll.ai/tools/wt/readme` → `hexokit.com/tools/wt/readme` → `/wt/readme/`).* Rejected: two `<meta refresh>` hops are slow and lossy for search engines, and collapsing them is free because the in-site table is in the same repo. The it5d note described what S3 made *possible*, not a requirement to hop twice.
- *Flipping the roster `repo`/`formula`/`binary` or the `versions.json` `run-kit` row now.* Out of scope by the plan: `repo` flips at R2, formula/binary and the `envelope` carry-over retire at R1. The map is independent of them.

## What Changes

### 1. Operator step (apply Phase 1): enable and seed both refresh crons, then rebase

Both workflows pin `ref: main`, so this runs against `main`, before any code task, from the apply session via `gh` (the `sahil-noon` account is a write collaborator; `gh workflow enable`/`run` need `actions: write`, which write grants — if GitHub refuses, wrap in `gh auth switch --user sahil87 … gh auth switch --user sahil-noon` with a trap, per the project memory):

```sh
gh workflow enable refresh-help.yml   --repo sahil87/hexokit-site
gh workflow enable refresh-readme.yml --repo sahil87/hexokit-site
gh workflow run    refresh-help.yml   --repo sahil87/hexokit-site --ref main   # brews sahil87/tap/run-kit, runs `run-kit help-dump` → help/hexokit.json
gh workflow run    refresh-readme.yml --repo sahil87/hexokit-site --ref main   # pulls sahil87/run-kit README + docs/site tree → content/hexokit/**
gh run watch …                                                                # both green
```

Verify after both complete (each dispatches `deploy.yml` only if it committed):

- `git fetch origin && git ls-tree origin/main content/hexokit/site/` lists `gui.md` and `skill/cron.md`; `help/run-kit.json` and `content/run-kit/` do **not** reappear (the it5d double-scaffold guard).
- `content/hexokit/README.md` on `origin/main` opens with the C3a text (H1/tagline say HexoKit; the extractor strips the H1 and the "Part of HexoKit" blockquote, so check the first paragraph no longer reads "run-kit is a remote console").
- The dispatched Deploy is green; `curl -s https://hexokit.com/docs/gui/` is 200 and `https://hexokit.com/docs/readme/` no longer contains "run-kit is a remote console".
- `gh workflow list` shows both workflows `active`.

Then `git rebase origin/main` the change branch (the seed commits are content-only; no conflicts expected with this change's files). Every later build/test task runs on the rebased tree.

### 2. Extract the in-site redirect table: `src/lib/site-redirects.mjs`

Move the `redirects:` object literal out of `astro.config.mjs` into a new plain-ESM module (config-eval boundary — same reason `tool-roster.mjs` and `docs-site-sidebar.mjs` are `.mjs`):

```js
// src/lib/site-redirects.mjs
import { TOOL_ROSTER } from './tool-roster.mjs';
import { docsSiteRedirectEntries } from './docs-site-sidebar.mjs';

/** The retired family pages (change it5d). */
export const FAMILY_REDIRECTS = {
  '/tools': '/toolkit/',
  '/getting-started/overview': '/toolkit/',
  '/toolkit/overview': '/toolkit/',
  '/getting-started/install': '/toolkit/install/',
  '/getting-started/philosophy': '/toolkit/philosophy/',
  '/workflows/daily-flow': '/toolkit/daily-flow/',
  '/workflows/new-change': '/toolkit/new-change/',
};

/** Every in-site redirect, shaped for Astro's `redirects:` — the 3ke3 `/tools/<name>/*`
 *  set, the it5d legacy mounts, the docs/site reverse map, and the family pages. */
export function siteRedirects() { /* the exact object astro.config.mjs builds today */ }
```

`astro.config.mjs` becomes `redirects: siteRedirects()`. Pure refactor: `pnpm build` output is byte-identical (same keys, same targets, same stub pages). A unit test pins the four contributing sets (a `/tools/hexokit/readme`, a `/run-kit/install`, a `/tools/wt/skill`, and `/tools`).

### 3. The cross-site map: `src/lib/shll-ai-redirects.ts` + `src/pages/shll-ai-redirects.json.ts`

**Lib (pure, unit-tested — no disk, no Astro):**

```ts
export interface RedirectMapInput {
  /** Every live HTML page on hexokit.com, canonical trailing-slash form: '/', '/docs/', '/wt/readme/', … */
  pages: readonly string[];
  /** The in-site table from siteRedirects(): bare-key → trailing-slash target. */
  redirects: Readonly<Record<string, string>>;
  /** 'https://hexokit.com' — from Astro.site, never hardcoded. */
  origin: string;
}
export interface RedirectMap {
  schema: 1;
  generated_at: string;             // ISO-8601, like versions.json
  from: 'https://shll.ai';
  to: string;                       // origin
  keep: string[];                   // ['/install', '/versions.json'] — stay real files on shll.ai (D4)
  redirects: Record<string, string>; // old path (canonical form) → absolute final URL
  rules: [string, string][];        // ordered [regex, replacement] generalization for a 404 catch-all
}
export function buildShllAiRedirectMap(input: RedirectMapInput): RedirectMap;
```

`buildShllAiRedirectMap`:

- **Sources** = every live page path ∪ every in-site redirect key ∪ the historical `/tools/<slug>/*` names (already redirect keys) ∪ the two agent endpoints `/llms.txt`, `/llms-full.txt`. Keys are normalized to canonical form: page paths get a trailing slash (`/tools/wt/readme` and `/tools/wt/readme/` collapse to one key), file-like paths (`.txt`, `.json`) stay bare. shll.ai's live 301 (`/tools/wt/readme` → `/tools/wt/readme/`) confirms trailing-slash is the canonical spelling there too.
- **Resolution** — for each source `S`: if `S` is a live page → `origin + S`; else follow the in-site table (bounded, ≤ 3 hops) until a live page; a chain that ends anywhere else **throws** (a site-authored table with a dangling target is a build-stop, the `versions-policy.json` posture — a value in this map must be a page that exists). Live-page identity entries are emitted too (`/wt/readme/` → `https://hexokit.com/wt/readme/`): X2 writes one stub per key, so the identity set is most of the file.
- **`keep`** = exactly `['/install', '/versions.json']` (D4: baked into shipped `shll` binaries; X2 serves byte copies, never redirects). Both are omitted from `redirects`.
- **`rules`** (the generalization, in order; regex → replacement on the pathname, then prefix `to`):

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

  Derived mechanically from the roster (`legacyMounts` → the `run-kit` rule) and `FAMILY_REDIRECTS`, not hand-typed twice. A unit test asserts that applying `rules` to every key of `redirects` reproduces that key's value (the rules and the enumeration cannot disagree).

**Endpoint** (`src/pages/shll-ai-redirects.json.ts`, `application/json`, the `versions.json.ts` shape): builds `pages` from `getCollection('docs')` (every entry's route `/${entry.id}/`, excluding `404`), plus `/` (the landing `index.astro`), plus `/${mountFor(page.slug)}/${page.path}/` for each `collectDocsSitePages(repoRoot)` entry; `redirects` from `siteRedirects()`; `origin` from `site`. Served at `https://hexokit.com/shll-ai-redirects.json`.

Illustrative output (abridged):

```json
{
  "schema": 1,
  "generated_at": "2026-09-12T18:00:00.000Z",
  "from": "https://shll.ai",
  "to": "https://hexokit.com",
  "keep": ["/install", "/versions.json"],
  "redirects": {
    "/": "https://hexokit.com/",
    "/run-kit/": "https://hexokit.com/docs/",
    "/run-kit/gui/": "https://hexokit.com/docs/gui/",
    "/run-kit/skill/cron/": "https://hexokit.com/docs/skill/cron/",
    "/tools/": "https://hexokit.com/toolkit/",
    "/tools/run-kit/readme/": "https://hexokit.com/docs/readme/",
    "/tools/wt/overview/": "https://hexokit.com/wt/",
    "/getting-started/install/": "https://hexokit.com/toolkit/install/",
    "/workflows/daily-flow/": "https://hexokit.com/toolkit/daily-flow/",
    "/wt/readme/": "https://hexokit.com/wt/readme/",
    "/shll/standards/update/": "https://hexokit.com/shll/standards/update/",
    "/llms.txt": "https://hexokit.com/llms.txt"
  },
  "rules": [["^/tools/?$", "/toolkit/"], ["^/(?:tools/)?run-kit(/.*)?$", "/docs$1"], "…"]
}
```

### 4. Completeness check against shll.ai: fixture + post-build checker

- `scripts/fixtures/shll-ai-paths.txt` — one path per line: the 75 sitemap paths fetched 2026-09-12 (header comment with the date and the `curl` used), plus the historical set: `/tools/<slug>{,/overview,/readme,/commands}` for the seven old slugs (`idea hop fab-kit wt run-kit tu shll`) and `/tools/<slug>/<page>` for every docs/site page shll.ai lists under `/<slug>/`. This is a floor, not a ceiling — pages run-kit adds before X2 appear on both sites and map by identity.
- `scripts/check-shll-ai-redirects.mjs` — reads `dist/shll-ai-redirects.json` and the fixture; asserts (a) every fixture path (normalized) is a key in `redirects` or in `keep`; (b) every `redirects` value, stripped of `to`, exists as `dist/<path>index.html` (or the bare file for `.txt`) **and is not a `<meta http-equiv="refresh">` stub**; (c) no value's path is itself a `redirects` key with a different value (no chains); (d) `keep` files exist in `dist/`. Exit non-zero with the offending entries listed. Wired into `ci.yml` after the build step (and documented in the README's verify section), so a future roster/route change that strands an old shll.ai URL fails the PR.
- `scripts/shll-ai-redirects.test.mjs` — unit tests for the lib with a synthetic roster-shaped input: normalization, chain collapse, dangling-target throw, `keep` exclusion, rules≡enumeration.

### 5. Documentation

- `docs/specs/shll-ai-redirect-map-contract.md` (new, short — the `versions-manifest-contract.md` precedent for a cross-repo static endpoint): the schema above, key normalization, the `keep` semantics, the rules ordering, the consumer (X2's stub generator in `sahil87/shll.ai`: one `<key>/index.html` per entry with `<meta http-equiv="refresh" content="0; url=…">` + `<link rel="canonical">` + a `location.replace` fallback, `404.html` applying `rules`, `keep` served as byte copies), and the freshness note (X2 re-fetches shll.ai's final sitemap into the fixture and re-runs the checker at cutover, then removes shll.ai's crons so the set freezes).
- `sites/astro-starlight-terminal1/README.md` verify section: the checker command.
- Plan doc (run-kit repo, separate commit at ship — Pickup protocol #4): fill X1's PR/Status cells; record that the S3 cron re-enable was executed here on 2026-09-12; note for X2 the endpoint URL and the two missing-page discovery.

### Explicitly not in this change

- `TOOL_ROSTER.repo` / `formula` / `binary` stay `run-kit` (R2 / R1). `versions-policy.json` keeps its `run-kit` key and `envelope: hexokit` (R1). `help/hexokit.json` `tool` stays `run-kit`.
- No change to the `sahil87/shll.ai` repo, its DNS, or `www.shll.ai` (X2). No standards edits (X4). No install-script default change (R1).
- The map does not cover shll.ai's `robots.txt`, `sitemap*.xml`, favicons, `og-image.png`, `/.well-known/security.txt`, or `/screenshots/*` — X2 authors the stub's own chrome; none of those are user-navigated URLs.
- Substrate identifiers (`rk`, `RK_*`, `@rk_*`) are untouched (Pickup protocol #3).

## Affected Memory

- `build-deploy/deployment`: (modify) both refresh crons re-enabled and seeded 2026-09-12 (the S3 post-merge step, executed in X1 — the two-day gap and its symptom, hexokit.com lagging shll.ai by two docs pages); `/shll-ai-redirects.json` joins `versions.json` / `llms.txt` as a build-time static endpoint and ride-along deploy output; `check-shll-ai-redirects.mjs` in the CI step list.
- `conventions/redirect-map`: (new) the in-site redirect table extracted to `site-redirects.mjs` (four contributing sets, config-eval `.mjs`), the cross-site `shll-ai-redirects` lib/endpoint (sources, canonical-key normalization, chain collapse to final pages, dangling-target build-stop, `keep`, `rules` ≡ enumeration), the fixture-floor completeness checker, and the X2 consumer contract pointer.
- `conventions/docs-site-tree`: (modify) `docsSiteRedirectEntries()` is now consumed via `site-redirects.mjs` (not directly by `astro.config.mjs`), and the same walk feeds the cross-site map.
- `conventions/tool-roster`: (modify) one line — `legacyMounts` now also drives the cross-site `rules` (`run-kit` → `docs`).

## Impact

- **Files**: `sites/astro-starlight-terminal1/astro.config.mjs` (redirects → import), new `src/lib/site-redirects.mjs`, new `src/lib/shll-ai-redirects.ts`, new `src/pages/shll-ai-redirects.json.ts`, new `scripts/check-shll-ai-redirects.mjs`, new `scripts/shll-ai-redirects.test.mjs`, new `scripts/fixtures/shll-ai-paths.txt`, `.github/workflows/ci.yml` (one step), site `README.md`, new `docs/specs/shll-ai-redirect-map-contract.md`, `docs/specs/index.md` row, memory per above. Cross-repo at ship: the run-kit plan doc (separate commit).
- **Public surface**: one new static endpoint `https://hexokit.com/shll-ai-redirects.json`; every existing route, redirect stub, `versions.json`, and `llms*.txt` byte-identical. After the seed runs: `/docs/readme/`, `/docs/commands/`, and the docs/site pages refresh to run-kit `main` (incl. two new pages `/docs/gui/`, `/docs/skill/cron/`); `versions.json`'s `run-kit` row `latest` updates to the current release.
- **Dependencies**: none new (Constitution VI). Static-first (Constitution I): everything is build-time.
- **Tests**: `node --test scripts/*.test.mjs` (+ the new suite), `node scripts/validate-help.mjs`, `pnpm build`, then `node scripts/check-shll-ai-redirects.mjs` against `dist/` — all must pass on the rebased tree.
- **Reversibility**: the endpoint and checker are additive; the extraction is a pure refactor; the crons can be `gh workflow disable`d again. shll.ai is untouched (D13) — nothing here is irreversible.
- **Ordering**: X2 depends on this endpoint being live on hexokit.com (i.e. this PR merged and deployed, after the seed runs).

## Open Questions

- None blocking. One judgment call flagged in Assumptions (#3): map values are collapsed to final pages rather than the literal "`hexokit.com/tools/*`, hops once more in-site" phrasing.

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Certain | Scope is the X1 row exactly: a machine-readable shll.ai→hexokit.com redirect map plus one seed run of both refresh crons; no roster source flip (`repo` stays `run-kit` → R2), no formula/binary/`envelope` change (→ R1), no shll.ai repo edits (→ X2) | The X1 row, the user's scope text, and the Phase 3 rules say exactly this | S:90 R:80 A:95 D:95 |
| 2 | Certain | The S3 post-merge cron step was never run (both workflows `disabled_manually` on 2026-09-12); X1 executes it as apply Phase 1 — enable + one dispatch each on `main`, verify, then rebase the change branch — before the map is build-verified | Verified with `gh workflow list`; the map's targets `/docs/gui/`, `/docs/skill/cron/` only exist after the pull; both workflows pin `ref: main` | S:85 R:90 A:95 D:90 |
| 3 | Confident | Map values are **final** hexokit.com pages (in-site chains collapsed), not the literal double hop `shll.ai/tools/* → hexokit.com/tools/* → /<mount>/*` | The it5d note described what S3 made possible; collapsing is free in the same repo and avoids two `<meta refresh>` hops; a test still proves every old path lands | S:60 R:90 A:80 D:70 |
| 4 | Confident | Delivery is a build-time static JSON endpoint `/shll-ai-redirects.json` (the `versions.json.ts` idiom: thin page + unit-tested lib), not a committed file | Enumerating live pages needs the content collection at build; X2's stub CI already fetches `/install` + `/versions.json` from hexokit.com, so the map rides the same copy step; a committed copy is a second table | S:40 R:75 A:75 D:60 |
| 5 | Confident | The in-site `redirects:` literal is extracted to `src/lib/site-redirects.mjs` (config-eval `.mjs`) so the cross-site map composes the same object — no second redirect table | Byte-identical build; the `tool-roster.mjs`/`docs-site-sidebar.mjs` precedent for config-eval modules | S:50 R:85 A:90 D:80 |
| 6 | Certain | `keep` is exactly `/install` and `/versions.json`; both are excluded from `redirects` | D4 + the X2 row: baked into shipped binaries, must be byte copies, never redirects | S:90 R:85 A:95 D:95 |
| 7 | Confident | `/llms.txt` and `/llms-full.txt` are map entries redirecting to their hexokit.com twins (X2 may choose byte copies instead — the map does not forbid it) | Not named anywhere in the plan; a redirect is the honest minimum so nothing 404s; trivially reclassified | S:20 R:90 A:50 D:35 |
| 8 | Confident | The map also emits ordered `rules` (regex → replacement) derived from the roster's `legacyMounts` and the family table, for X2's `404.html` catch-all; a test asserts rules reproduce the enumeration | Pages cannot wildcard; the enumeration is the artifact, rules are the safety net for un-enumerated paths | S:45 R:85 A:80 D:65 |
| 9 | Confident | Completeness is proven against a committed fixture — shll.ai's 75-URL sitemap (2026-09-12) plus the historical `/tools/<slug>/*` set — by a post-build checker wired into `ci.yml`; X2 re-fetches the final sitemap at cutover | The only way "ready" in the X1 row is checkable; the fixture is a floor (new pages map by identity) | S:50 R:85 A:85 D:75 |
| 10 | Confident | Keys are canonical: trailing slash for page paths (bare and slashed collapse), bare for file-like paths; values are absolute URLs from `Astro.site`; a chain ending at a non-page throws at build | shll.ai itself 301s bare → slashed; the absolute-URL discipline is the site's rule (`seo-social-meta`); site-authored inputs build-stop (`versions-policy.json` posture) | S:40 R:90 A:85 D:75 |
| 11 | Confident | A short cross-repo spec `docs/specs/shll-ai-redirect-map-contract.md` documents the schema and the X2 consumer | The repo's precedent for a cross-repo static endpoint is `versions-manifest-contract.md`; X2 is authored in another repo by another session | S:40 R:85 A:80 D:70 |
| 12 | Certain | The operator step uses `gh` as `sahil-noon` (write collaborator; `actions: write`), falling back to a trapped `gh auth switch --user sahil87` block only if refused | Project memory records the collaborator and the switch pattern | S:70 R:95 A:85 D:85 |
| 13 | Certain | Not in the map: `robots.txt`, `sitemap*.xml`, favicons, `og-image.png`, `/.well-known/security.txt`, `/screenshots/*` — X2 authors the stub's own chrome | None are user-navigated URLs; the map's job is that no old *page* 404s | S:60 R:95 A:90 D:85 |

13 assumptions (5 certain, 8 confident, 0 tentative, 0 unresolved).
