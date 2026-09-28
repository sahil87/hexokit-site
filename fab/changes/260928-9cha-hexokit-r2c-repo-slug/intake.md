# Intake: HexoKit R2(c) — site slug-table repo source run-kit → hexokit

**Change**: 260928-9cha-hexokit-r2c-repo-slug
**Created**: 2026-09-28

## Origin

> Phase 3 of the HexoKit rebrand, plan row R2 step (c) (run-kit repo, `fab/plans/sahil/26-09-12-hexokit-rebrand-remaining.md` — do NOT edit it; parallel agents own R2(b)/(d) and a follow-up agent consolidates). R2(a) is done: GitHub repo `sahil87/run-kit` was renamed to `sahil87/hexokit` (GitHub redirects web/clone/releases/raw — verified). R2(c): hexokit-site slug-table source → `sahil87/hexokit`, run both Refresh crons once.

One-shot, operator-dispatched. Pre-intake investigation in the conversation established the facts below (do not re-derive).

## Why

The repo rename is live; GitHub's redirect keeps everything working, but the site still sources the product README/docs from `sahil87/run-kit`, links to it, and documents "only the repo stays `run-kit` until R2" as present truth. After R2 the four-name divergence for HexoKit shrinks to slug/formula/binary/repo all `hexokit` with only the mount (`docs`) differing. Relying on redirects indefinitely is fragile (a future `run-kit` repo creation would silently hijack the source) and leaves stale docs.

## What Changes

### 1. Roster (the slug table)

`sites/astro-starlight-terminal1/src/lib/tool-roster.mjs:51`:

```js
{ slug: 'hexokit', label: 'HexoKit', mount: 'docs', repo: 'hexokit', formula: 'hexokit', binary: 'hexokit', legacyMounts: ['run-kit'] },
```

Header comment (around line 20–22) that says "only the repo stays `run-kit` for HexoKit" → rewrite to present truth: HexoKit's source-side names all read `hexokit`; only the mount (`docs`) differs from the slug. `legacyMounts: ['run-kit']` stays (URL redirects).

`repoFor('hexokit')` drives: `HeaderNav.astro` GitHub link, `GithubButton.astro`, `github-stars.ts` star fetch (`/repos/<repo>`), `landing-data.ts` (`hexokitRepo`, landing CTA + footer GitHub link), `Head.astro` JSON-LD `url`, `ReadmeSlice.astro`/`CommandReference.astro` link rewriting. No code change needed there beyond stale comments.

### 2. Refresh workflows

- `.github/workflows/refresh-readme.yml`: both `tools=(...)` arrays (README step ~line 135 and docs/site step ~line 217) `"hexokit:run-kit"` → `"hexokit:hexokit"` (kept in lockstep). Comment ~line 107–111 ("hexokit is the slug≠repo case … stays `run-kit` until the source-side rename") → hexokit's slug and repo now match; fab-kit remains the slug≠binary case.
- `.github/workflows/refresh-help.yml`: comments ~line 106 and ~119 ("hexokit's repo is still `run-kit`", "only the repo stays run-kit until the slug rename") → present truth (all four source names `hexokit`). The triple `hexokit:hexokit:hexokit` is already correct.

### 3. Stale comments in src (claims now false)

- `src/lib/github-stars.ts:9`, `src/components/GithubButton.astro:7` — "slug ≠ repo for hexokit, whose repo stays `run-kit`"
- `src/components/HeaderNav.astro:14` — "sahil87/run-kit via … GitHub redirects after"
- `src/lib/landing-data.ts:88` — "The repo is still named `run-kit`; GitHub redirects after the …"
- `src/components/ReadmeSlice.astro:106`, `src/components/CommandReference.astro:104`, `src/components/Head.astro:141`, `src/components/TerminalPrompt.astro:48` — "stays `run-kit` until the source-side rename / R2"
- `src/assets/logo.svg:2` provenance comment "Mirrored verbatim from sahil87/run-kit" → `sahil87/hexokit` (comment only; SVG bytes otherwise unchanged. Note `public/favicon.svg` is claimed byte-identical to run-kit's logo — check whether logo.svg's comment is part of that claim; do not touch favicon.svg).

Leave comments that cite `run-kit riff --layout` as historical cobra examples, the legacy-mount redirect comments, and the TerminalPrompt `run-kit` alias.

### 4. Hand-authored live URLs

- `src/content/docs/desktop.md:14` — `https://github.com/sahil87/run-kit/releases` → `https://github.com/sahil87/hexokit/releases`
- `README.md:5` — "The product's own source repo stays [sahil87/run-kit](https://github.com/sahil87/run-kit)" → "The product's source repo is [sahil87/hexokit](https://github.com/sahil87/hexokit)"
- `fab/project/context.md:3` and `:40` — same flip.

### 5. Tests

- `scripts/tool-roster.test.mjs:44–47,69` — `hexokit.repo` / `repoFor('hexokit')` → `'hexokit'`; retitle the test (hexokit is now the slug≠mount tool; repo/formula/binary equal the slug).
- `scripts/landing-data.test.mjs:173` — comment "The repo is still `run-kit`" and any assertion on the value.
- Grep for other asserts on `sahil87/run-kit` or `repo: 'run-kit'` in `scripts/*.test.mjs` and update.

### 6. Memory/specs (present-truth lines only, D11 — changelog rows stay)

- `docs/memory/conventions/tool-roster.md` (~line 28): HexoKit record `repo: 'hexokit'`; four-name rule — for HexoKit only the mount differs now.
- `docs/memory/conventions/readme-extraction.md` (~85), `docs/memory/build-deploy/deployment.md` (~127): pair `hexokit:hexokit`, sources `sahil87/hexokit`.
- `docs/memory/conventions/help-collection.md` (~41, ~125) if they state the repo stays run-kit.
- `docs/memory/conventions/tool-page-rubric.md` (~141, ~145, ~224, ~226), `docs/memory/conventions/seo-social-meta.md` (~55, ~67): repo URL `sahil87/hexokit`.
- `docs/memory/conventions/versions-manifest.md` (~32) and `docs/specs/versions-manifest-contract.md` (~60): drop "sourced from repo `sahil87/run-kit`"; KEEP the statement that the manifest key stays `run-kit` (see §7).
- `docs/specs/help-dump-contract.md` (~169) and `docs/specs/readme-extraction-contract.md` (~374): present-truth repo → `sahil87/hexokit`; append a dated changelog row (2026-09-28, change `9cha`) to each spec whose contract text changed.
- Append log entries to the domain `log.md` files per the repo's memory convention.

### 7. versions.json key — NO CHANGE (decided)

`versions-policy.json` keeps `"run-kit": { "notify": "minor", "envelope": "hexokit", "formula": "hexokit" }`. Verified in source:

- shll v0.1.33 `check_updates.go:289` does `manifest.Tools[tgt.name]` with roster Name `run-kit` — no fallback. Flipping the key would drop the row for every shll ≤ v0.1.33 install.
- shll v0.1.34 (`origin/main` `check_updates.go:313`) looks up `hexokit` first then LegacyNames `rk`, `run-kit` — finds the row either way. Flipping gains nothing.
- run-kit `internal/updatecheck` does NOT read versions.json: it reads `shll check-updates --json` rows by `name`, which is shll's roster Name. Its `runKitTool = "run-kit"` therefore already misses on shll v0.1.34 (row name `hexokit`) regardless of the manifest key — a run-kit-side bug to report, not fixable here.

The `versions-manifest.ts` comment ("KEY stays `run-kit` … run-kit's update checker and shll ≤ v0.1.33 look the row up by that key") should be corrected to the accurate reason: shll ≤ v0.1.33 looks up by `run-kit`; run-kit's updatecheck keys on shll's output row name, not the manifest key. Same correction in versions-manifest memory/spec if they repeat the claim.

### Out of scope

Pulled `content/**` and `help/**` (refreshed by the crons from upstream — never hand-edit); `fab/` archives and dated changelog rows (D11); legacy `/run-kit` mount redirects and `legacyMounts`; TerminalPrompt `run-kit` alias; screenshot filenames `run-kit-*.webp`; test fixtures snapshotting historical upstream output; `sites/_playground/`; the plan doc in the run-kit repo.

### Post-merge (operator step, not an apply task)

Trigger `gh workflow run refresh-help.yml --repo sahil87/hexokit-site` and `gh workflow run refresh-readme.yml --repo sahil87/hexokit-site`, verify both succeed and refresh-readme fetches from `sahil87/hexokit`.

## Affected Memory

- `conventions/tool-roster`: (modify) HexoKit repo `hexokit`; only mount differs from slug
- `conventions/readme-extraction`: (modify) product pair `hexokit:hexokit`
- `build-deploy/deployment`: (modify) refresh-readme pair / source repo
- `conventions/help-collection`: (modify) repo naming lines if stale
- `conventions/tool-page-rubric`: (modify) repo URL `sahil87/hexokit`
- `conventions/seo-social-meta`: (modify) JSON-LD url resolves to `sahil87/hexokit`
- `conventions/versions-manifest`: (modify) key-stays-`run-kit` rationale corrected

## Impact

`sites/astro-starlight-terminal1/src/{lib,components,content,assets}`, `scripts/*.test.mjs`, `.github/workflows/refresh-{readme,help}.yml`, `README.md`, `fab/project/context.md`, `docs/memory/**`, `docs/specs/**`. Live effect on merge: GitHub links/star count/JSON-LD point at `sahil87/hexokit`; next refresh-readme run fetches from `sahil87/hexokit` (raw + tarball). Verify with `just verify` (or the relevant test scripts + build).

## Open Questions

- None blocking.

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Certain | Slug-table source = `tool-roster.mjs` repo field + refresh-readme `slug:repo` pairs | Verified by grep; plan row R2(c) | S:95 R:95 A:95 D:90 |
| 2 | Certain | versions-policy.json `run-kit` key stays | Verified shll v0.1.33 exact-key lookup; v0.1.34 legacy fallback; run-kit updatecheck keys on shll output name | S:90 R:90 A:95 D:90 |
| 3 | Confident | Hand-authored live GitHub URLs flip to `sahil87/hexokit` | Redirects work but canonical target is the new repo (D15) | S:85 R:95 A:85 D:85 |
| 4 | Certain | content/, help/, archives, legacy redirects untouched | Puller-managed / D11 | S:95 R:95 A:95 D:95 |
| 5 | Confident | Memory/spec present-truth lines updated, changelog rows appended not rewritten | D11 + repo memory convention | S:85 R:90 A:85 D:85 |

5 assumptions (3 certain, 2 confident, 0 tentative, 0 unresolved).
