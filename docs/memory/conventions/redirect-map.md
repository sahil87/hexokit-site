---
type: memory
description: "The two redirect surfaces of the live site: the single in-site redirect table (`src/lib/site-redirects.mjs` — `FAMILY_REDIRECTS` + `siteRedirects()`, four contributing sets, config-eval `.mjs`) and the cross-site shll.ai→hexokit.com map (`src/lib/shll-ai-redirects.ts` + the `/shll-ai-redirects.json` build-time endpoint: canonical keys, chain collapse with dangling-target build-stop, `keep`, roster-derived `rules` ≡ the enumeration, the fixture-floor CI checker, the X2 consumer contract)."
---
# Redirect Map

**Domain**: conventions

## Overview

The live site owns two redirect surfaces, single-sourced from the same tables. The **in-site redirect table** (`src/lib/site-redirects.mjs`) keeps every retired hexokit.com path landing via static `<meta refresh>` stub pages. The **cross-site map** (`src/lib/shll-ai-redirects.ts`, served at `https://hexokit.com/shll-ai-redirects.json`) is the machine-readable answer to "where does every URL shll.ai ever served land on hexokit.com?", consumed by the X2 cutover that replaces the `sahil87/shll.ai` repo with one redirect stub per old URL. Because the map composes the in-site table, it can never drift from the in-site stubs.

## The in-site table (`site-redirects.mjs`)

`src/lib/site-redirects.mjs` is the **single** in-site redirect table, extracted from `astro.config.mjs` (which now carries only `redirects: siteRedirects()`). It is plain ESM (`.mjs`, no TS types) because `astro.config.mjs` is evaluated at config-load time, a boundary that loads `.mjs` cleanly but not `.ts` (the `tool-roster.mjs` / `docs-site-sidebar.mjs` precedent — see [docs-site-tree](/conventions/docs-site-tree.md)).

It exports:

- **`FAMILY_REDIRECTS`** — the seven literal retired-family entries (change it5d): `/tools` → `/toolkit/`, `/getting-started/{overview,install,philosophy}` and `/workflows/{daily-flow,new-change}` → `/toolkit/…`, `/toolkit/overview` → `/toolkit/`.
- **`siteRedirects()`** — every in-site redirect, shaped for Astro's `redirects:` (bare old path → trailing-slash target). The four contributing sets, in spread order: the change-3ke3 set (old deep `/tools/<name>/{,overview,readme,commands}` URLs → `/<mount>/…`, keyed by every name the `/tools/` namespace ever used — slug plus `legacyMounts`), the legacy mounts (`/run-kit{,/readme,/commands}` → `/docs/…`), one entry per committed docs/site page from `docsSiteRedirectEntries()`, and `FAMILY_REDIRECTS`.

Static `<meta refresh>` pages are emitted at build; a redirect key that collides with a real route fails the build, which is why retired routes must be removed when the key is added. `scripts/site-redirects.test.mjs` pins the extraction: it reconstructs the four contributing sets and asserts the table's entries.

## The cross-site map (`/shll-ai-redirects.json`)

The map is built at `astro build` time and served as a static `application/json` endpoint (Constitution I; the `versions.json.ts` idiom — thin page, all logic in the unit-tested lib). The full cross-repo contract — schema, canonicalization, `keep`, `rules`, the stub-consumer shape — is [`docs/specs/shll-ai-redirect-map-contract.md`](../../specs/shll-ai-redirect-map-contract.md); the lib (`src/lib/shll-ai-redirects.ts`) is the machine-checkable anchor and wins on any discrepancy.

**Lib** (pure — no Astro imports, no disk; the page set and redirect table are passed in, so `node --test` imports the `.ts` directly under Node 22 type-stripping):

- **Sources** = every live page path ∪ every in-site redirect key ∪ the two agent endpoints `/llms.txt` and `/llms-full.txt` (`AGENT_ENDPOINTS` — build-time endpoints treated as live and mapped by identity). Live pages are enumerated by the endpoint as `/` (the `index.astro` landing) ∪ `/<entry.id>/` for every `getCollection('docs')` entry except `404` ∪ `/<mount>/<path>/` for every `collectDocsSitePages(repoRoot)` page (mount from the [tool roster](/conventions/tool-roster.md)).
- **Canonical keys** (`canonicalPath`): duplicate slashes collapse; page-like paths (last segment has no `.`) end with exactly one `/` — `/tools/wt/readme` and `/tools/wt/readme/` are one key, `/` stays `/`; file-like paths (`/llms.txt`, `/versions.json`) stay bare. Keys are emitted sorted; values are absolute URLs built from the `origin` (`Astro.site`, never hardcoded).
- **Chain collapse with a dangling-target build-stop** (`resolveFinal`): a source that is a live page maps to `origin + path` (identity entries are emitted — X2 writes one stub per key, so the identity set is most of the file); otherwise the in-site table is followed on the bare key, at most `MAX_REDIRECT_HOPS` (3) hops, until a live page is reached. A chain ending anywhere else **throws** an `Error` naming the source and the dangling target, failing the build — site-authored input, the `versions-policy.json` build-stop posture: a value in this map must be a page that exists. No value is ever a `<meta refresh>` stub, so X2 never double-hops.
- **`keep`** is exactly `['/install', '/versions.json']` (`KEEP_ON_SHLL_AI`) — paths baked into shipped `shll` binaries (rebrand decision D4), so X2 serves byte copies, never redirects. Neither path appears as a `redirects` key even if present in `pages`.
- **`rules`** (`buildRules` / `applyRules`) — the ordered `[regexSource, replacement]` generalization for X2's `404.html` catch-all, **derived** from the roster (`legacyMounts` → the `run-kit`→`docs` rewrite pair, plus exact rules for any slug≠mount tool) and `FAMILY_REDIRECTS`, never a second hand-typed table. Order is load-bearing: exact and legacy-mount rules precede the generic `/tools/<name>/*` rewrites, a collapsing family entry precedes its family's prefix rule, and the identity catch-all (`^(/.*)$` → `$1`) is last. **The rules≡enumeration invariant**: `origin + applyRules(rules, k)` equals `redirects[k]` for every key — asserted by `scripts/shll-ai-redirects.test.mjs` over synthetic and real tables and by the post-build checker (clause e) over the real build, so the generalization and the enumeration cannot disagree.

**Endpoint** (`src/pages/shll-ai-redirects.json.ts`): resolves the repo root, the docs collection, and the docs/site trees; composes `buildShllAiRedirectMap({ pages, redirects: siteRedirects(), origin })`; emits pretty-printed JSON with a trailing newline. `generated_at` is the build moment (ISO-8601, like `versions.json`). It is a ride-along build output — no workflow change; the existing refresh→deploy cascade ships it (see [deployment](/build-deploy/deployment.md)).

## The completeness floor (fixture + CI checker)

Completeness against what shll.ai actually serves is proven by a committed fixture and a post-build checker, both under the live site:

- **`scripts/fixtures/shll-ai-paths.txt`** — one path per line (comments/blank lines ignored; header carries the fetch date and the `curl` used): shll.ai's 75-URL sitemap plus the historical `/tools/<slug>/*` namespace (the per-slug `{,overview,readme,commands}` set and one entry per docs/site page) generated from it. The fixture is a **floor, not a ceiling** — pages added after the fetch appear on both sites and map by identity.
- **`scripts/check-shll-ai-redirects.mjs`** — run from the live site directory after `pnpm build`; reads `dist/shll-ai-redirects.json` and the fixture and exits non-zero listing every violation of: (a) every fixture path, canonicalized, is a `redirects` key or a `keep` entry; (b) every value exists in `dist/` (`<path>/index.html` for page-like, the bare file for file-like) and is NOT a `<meta refresh>` stub; (c) no value's path is itself a `redirects` key with a different value (no chains survived the collapse); (d) every `keep` path exists in `dist/` (a missing `/install` is a WARNING when `public/install` is absent — `deploy.yml` fetches it before building, a plain `pnpm build` and CI never have it); (e) the rules≡enumeration invariant. No npm deps (Constitution VI); the lib's `.ts` is imported directly via Node type-stripping. Wired into `.github/workflows/ci.yml` as the `Check shll.ai redirect map` step immediately after `Build site`, so a roster/route change that strands an old shll.ai URL fails the PR.

## Design Decisions

### Cross-site map is a build-time endpoint composed from the in-site table
**Decision**: Publish the shll.ai→hexokit.com map as `/shll-ai-redirects.json`, built at `astro build` time from the live page set (content collection + docs/site trees) and the extracted `siteRedirects()` table, with every value collapsed to a final live page.
**Why**: Only the build knows the live route set; X2's stub CI already fetches `/install` and `/versions.json` from hexokit.com, so the map rides the same copy step; composing the in-site table means the map cannot drift from the routes it describes, and collapsing chains avoids two `<meta refresh>` hops.
**Rejected**: A committed JSON file (a second table that goes stale the day a docs page lands); prefix rules only (Pages cannot wildcard, so X2 needs one stub per URL regardless); the literal double hop `shll.ai/tools/* → hexokit.com/tools/*` (slow, SEO-lossy, and free to collapse in-repo).
*Introduced by*: 260912-1u4q-hexokit-site-cutover-prep

### Completeness is a fixture floor checked post-build, not a runtime fetch
**Decision**: Commit shll.ai's sitemap (plus the historical `/tools/<slug>/*` set) as `scripts/fixtures/shll-ai-paths.txt` and verify coverage with a post-build checker wired into CI.
**Why**: Constitution I forbids runtime fetches and the build must stay hermetic; a frozen fixture makes "every old URL lands" a checkable PR-time claim (the `scripts/fixtures/` precedent), and the map covers pages added after the fetch by identity so the fixture is a floor, not a ceiling.
**Rejected**: Fetching the sitemap during the build (non-hermetic, network-flaky); trusting the enumeration without a cross-check (the exact failure the cutover prep exists to prevent).
*Introduced by*: 260912-1u4q-hexokit-site-cutover-prep

### `rules` are derived, and asserted equal to the enumeration
**Decision**: Emit the ordered prefix rules from `TOOL_ROSTER.legacyMounts` and `FAMILY_REDIRECTS`, and assert in test + checker that applying them to every enumerated key reproduces its value.
**Why**: X2's `404.html` needs a generalization for un-enumerated paths; deriving it from the same sources and asserting equivalence keeps it from becoming a third hand-typed redirect table.
**Rejected**: Hand-writing the regex list in the spec only (drifts silently); omitting rules (leaves every un-enumerated old URL a hard 404).
*Introduced by*: 260912-1u4q-hexokit-site-cutover-prep
