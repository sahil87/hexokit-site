# Spec: `shll-ai-redirects.json` redirect-map contract

**Status**: Active
**Created**: 2026-09-12 (change `260912-1u4q-hexokit-site-cutover-prep`)
**Schema anchor**: [`sites/astro-starlight-terminal1/src/lib/shll-ai-redirects.ts`](../../sites/astro-starlight-terminal1/src/lib/shll-ai-redirects.ts)
**Endpoint**: [`sites/astro-starlight-terminal1/src/pages/shll-ai-redirects.json.ts`](../../sites/astro-starlight-terminal1/src/pages/shll-ai-redirects.json.ts) → `https://hexokit.com/shll-ai-redirects.json`
**Completeness floor**: `sites/astro-starlight-terminal1/scripts/fixtures/shll-ai-paths.txt` + `scripts/check-shll-ai-redirects.mjs` (CI step after `Build site`)
**Consumed by**: the X2 cutover stub generator in `sahil87/shll.ai` (run-kit plan `fab/plans/sahil/26-09-10-hexokit-rebrand.md`, row X2)

## Overview

This is the cross-repo contract for the **shll.ai → hexokit.com redirect map** — a static JSON document enumerating every URL shll.ai ever served and the final hexokit.com page each lands on. It is the cutover sibling of [`versions-manifest-contract.md`](./versions-manifest-contract.md) (another build-time static endpoint with a live cross-repo consumer).

**Why it exists**: the rebrand's Phase 2 (X2) replaces the `sahil87/shll.ai` repo with a redirect stub — one page per old URL. GitHub Pages cannot wildcard-redirect, so the stub needs a complete, machine-readable enumeration, and this repo is the only place that knows both the full live page set (the Starlight collection + the pulled `docs/site` trees) and the in-site redirect table. Composing the two at build time means every map value is a **real, final page** — no double hop through an in-site `<meta refresh>` stub — and the map can never drift from the routes it describes.

**Static-first (Constitution I)**: a build-time Astro static file endpoint (the `versions.json.ts` idiom: thin page, all logic in the unit-tested lib). **Zero new deps (Constitution VI)**.

The schema is defined in exactly **two** places — this spec (prose) and `shll-ai-redirects.ts` (code, the machine-checkable anchor). They MUST agree; on any discrepancy, `shll-ai-redirects.ts` is authoritative for machine validation.

## §1 Output schema

The endpoint emits a single JSON object (`application/json; charset=utf-8`), pretty-printed, trailing newline. Additive evolution under `"schema": 1`.

```jsonc
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
    "/tools/run-kit/readme/": "https://hexokit.com/docs/readme/",
    "/tools/wt/overview/": "https://hexokit.com/wt/",
    "/getting-started/install/": "https://hexokit.com/toolkit/install/",
    "/wt/readme/": "https://hexokit.com/wt/readme/",
    "/llms.txt": "https://hexokit.com/llms.txt"
    // … every live page (identity entries) ∪ every in-site redirect key
  },
  "rules": [["^/tools/?$", "/toolkit/"], ["^/(?:tools/)?run-kit(/.*)?$", "/docs$1"], "…"]
}
```

- **`schema`** — integer contract revision. Always `1` for this revision. A breaking change bumps it.
- **`generated_at`** — the build timestamp, ISO-8601 UTC.
- **`from` / `to`** — the origin being mapped from (constant `https://shll.ai`) and the origin every value is built from (`Astro.site`, never hardcoded).
- **`keep`** — paths that stay REAL FILES on shll.ai (§3). Exactly `["/install", "/versions.json"]`.
- **`redirects`** — old path (canonical form) → absolute final URL. Keys are sorted.
- **`rules`** — ordered `[regexSource, replacement]` pairs generalizing the enumeration, for the stub's `404.html` catch-all (§4).

### GIVEN/WHEN/THEN

- **Well-formed map** — GIVEN the seeded tree; WHEN the site builds; THEN `dist/shll-ai-redirects.json` is valid JSON with `schema === 1`, `from === "https://shll.ai"`, `to === "https://hexokit.com"`, and `redirects` containing `/run-kit/gui/` → `https://hexokit.com/docs/gui/` among the full enumeration.

## §2 Sources, key canonicalization, and resolution

**Sources** = the union of:

1. every **live page** on hexokit.com — `/` (the landing), `/<entry.id>/` for every `docs` collection entry except `404`, and `/<mount>/<path>/` for every committed `content/<slug>/site/**` page (mount from the tool roster);
2. every **in-site redirect key** — the same table Astro's `redirects:` config builds from (`siteRedirects()`: the retired `/tools/<name>/*` deep URLs, the legacy `/run-kit/*` mount, the docs/site reverse map, and the retired family pages);
3. the two **agent endpoints** `/llms.txt` and `/llms-full.txt` (build-time endpoints, not collection pages — treated as live and mapped by identity).

**Keys are canonical**: page-like paths end with exactly one `/` (`/tools/wt/readme` and `/tools/wt/readme/` collapse to one key; `/` stays `/`); file-like paths (last segment contains a `.`) stay bare. shll.ai's own 301s (bare → slashed) confirm the trailing-slash spelling is canonical there too.

**Resolution**: a source that is a live page maps to `to + path` (identity entries are emitted — X2 writes one stub per key, so the identity set is most of the file). Otherwise the in-site table is followed (on the bare key, at most **3 hops**) until a live page is reached. A chain that ends at a path that is neither a live page nor a redirect key **throws** and fails `astro build` — site-authored input, build-stop posture (the `versions-policy.json` rule: a value in this map must be a page that exists).

### GIVEN/WHEN/THEN

- **Chain collapse** — GIVEN in-site entries `/a → /b/` and `/b → /c/` and live page `/c/`; WHEN the map is built; THEN both `/a/` and `/b/` map to `<to>/c/`.
- **Dangling target build-stops** — GIVEN an in-site entry `/a → /nowhere/` with no such page; WHEN the map is built; THEN the build throws an `Error` naming `/a` and `/nowhere/`.

## §3 `keep` semantics

`keep` is exactly `["/install", "/versions.json"]` (module constant `KEEP_ON_SHLL_AI`). These paths are **baked into shipped `shll` binaries** (rebrand decision D4), so the X2 stub serves them as **byte copies, refreshed by the stub's own CI — never redirects**. Neither path appears as a `redirects` key, even if present in the live page set. `/versions.json` is itself a cross-repo contract ([`versions-manifest-contract.md`](./versions-manifest-contract.md)) — its consumers fetch it from whichever origin the installed binaries name, so it must stay fetchable on shll.ai.

## §4 `rules` — the generalization, and the equivalence invariant

Pages cannot wildcard-redirect, so the enumeration is the artifact X2 consumes; `rules` is the safety net for **un-enumerated** old paths, applied by the stub's `404.html`. The rules are **derived mechanically** from the tool roster (`legacyMounts` → the `run-kit` → `docs` rewrite) and the family table (`FAMILY_REDIRECTS`) — never a second hand-typed list — and ordered so exact and legacy-mount rules precede the generic `/tools/<name>/*` rewrites, a collapsing family entry precedes its family's prefix rule, and the identity catch-all is last:

```
^/tools/?$                          → /toolkit/
^/(?:tools/)?run-kit/overview/?$    → /docs/          (roster legacyMounts; overview collapses)
^/(?:tools/)?run-kit(/.*)?$         → /docs$1         (roster legacyMounts)
^/tools/hexokit/overview/?$         → /docs/          (roster: slug ≠ mount tools)
^/tools/hexokit(/.*)?$              → /docs$1
^/tools/([^/]+)/overview/?$         → /$1/
^/tools/([^/]+)(/.*)?$              → /$1$2
^/getting-started/overview/?$       → /toolkit/       (family table)
^/getting-started(/.*)?$            → /toolkit$1
^/toolkit/overview/?$               → /toolkit/
^/workflows(/.*)?$                  → /toolkit$1
^(/.*)$                             → $1              (identity catch-all)
```

**Consumer algorithm** (`applyRules` in the anchor module): canonicalize the request path, apply the FIRST rule whose regex matches (`String.replace` semantics — `$1` back-references), canonicalize the result, then prefix `to`. The identity catch-all guarantees a rule always matches.

**Equivalence invariant**: for every key `k` of `redirects`, `to + applyRules(rules, k) === redirects[k]`. Asserted by the unit test (`scripts/shll-ai-redirects.test.mjs`) over synthetic and real tables, and by the post-build checker (clause e) over the real build — the rules and the enumeration cannot disagree.

### GIVEN/WHEN/THEN

- **Roster extension** — GIVEN a future tool gains a `legacyMounts` entry; WHEN the map is built; THEN the rules gain its rewrite with no edit to `buildRules`.

## §5 Producer and consumer

**Producer** (this repo): `src/pages/shll-ai-redirects.json.ts` at build time; the page set from `getCollection('docs')` + `collectDocsSitePages(repoRoot)`, the in-site table from `siteRedirects()`, the origin from `Astro.site`. Ships via the normal push-to-`main` deploy cascade — no workflow change (the same ride-along model as `versions.json`).

**Consumer** (X2, in `sahil87/shll.ai`): a stub generator that, per `redirects` entry, writes `<key>/index.html` carrying:

- `<meta http-equiv="refresh" content="0; url=<value>">`
- `<link rel="canonical" href="<value>">`
- a `location.replace(<value>)` script fallback

plus a `404.html` that applies `rules` to the requested path, and serves each `keep` path as a byte copy refreshed by the stub's CI (the same copy step that fetches this map, `/install`, and `/versions.json` from hexokit.com).

A reader authoring X2 needs ONLY this spec and the live endpoint — not this repo's source.

## §6 Completeness floor and freshness

The committed fixture `scripts/fixtures/shll-ai-paths.txt` (shll.ai's sitemap fetched 2026-09-12, plus the historical `/tools/<slug>/*` namespace generated from it) is a **floor, not a ceiling**: pages added after the fetch appear on both sites and map by identity. The post-build checker `scripts/check-shll-ai-redirects.mjs` (wired into `ci.yml` after `Build site`) asserts over `dist/`:

- **(a)** every fixture path is a `redirects` key or a `keep` entry;
- **(b)** every value exists in `dist/` and is NOT a `<meta refresh>` stub;
- **(c)** no value's path is itself a `redirects` key with a different value (no chains);
- **(d)** every `keep` path exists in `dist/` (a missing `/install` is warn-only when `public/install` is absent — deploy fetches it);
- **(e)** the §4 equivalence invariant.

**Freshness at cutover**: X2 re-fetches shll.ai's FINAL sitemap into the fixture, re-runs the checker, then removes shll.ai's crons so the served set freezes. After cutover the map keeps describing a frozen source; regenerating it costs nothing and keeps the endpoint honest.

**Out of scope** (the stub's own chrome, X2-authored): `robots.txt`, `sitemap*.xml`, favicons, `og-image.png`, `/.well-known/security.txt`, `/screenshots/*` — none are user-navigated URLs.

## §Schema reference

The machine-checkable definitions live in `shll-ai-redirects.ts`:

- `MAP_SCHEMA` (=== 1), `SHLL_AI_ORIGIN`, `KEEP_ON_SHLL_AI`, `AGENT_ENDPOINTS`, `MAX_REDIRECT_HOPS` — the named constants.
- `RedirectMapInput` / `RedirectMap` — the input/output shapes.
- `canonicalPath` / `resolveFinal` / `buildRules` / `applyRules` / `buildShllAiRedirectMap` — the derivation logic, unit-pinned by `scripts/shll-ai-redirects.test.mjs`.

### GIVEN/WHEN/THEN

- **Anchor agreement** — GIVEN this prose contract and `shll-ai-redirects.ts`; WHEN they disagree on the map shape; THEN `shll-ai-redirects.ts` is authoritative and this prose is corrected to match.

## Changelog

- **2026-09-12 (change `260912-1u4q-hexokit-site-cutover-prep`)**: Initial contract. The `/shll-ai-redirects.json` endpoint, the canonical-key/chain-collapse/dangling-build-stop rules, the `keep` set, the derived `rules` with the equivalence invariant, the fixture-floor checker in CI, and the X2 consumer shape. Provenance: run-kit rebrand plan `fab/plans/sahil/26-09-10-hexokit-rebrand.md`, row X1 (decisions D4/D7).
