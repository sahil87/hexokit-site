# Plan: HexoKit R2(c) — site slug-table repo source run-kit → hexokit

**Change**: 260928-9cha-hexokit-r2c-repo-slug
**Intake**: `intake.md`

All paths below are relative to the repo root; `S` = `sites/astro-starlight-terminal1`.

## Requirements

### Tool roster & pullers

#### R1: HexoKit's roster repo is `hexokit`
`S/src/lib/tool-roster.mjs` hexokit record SHALL carry `repo: 'hexokit'` (slug, repo, formula, binary all `hexokit`; mount `docs`; `legacyMounts: ['run-kit']` unchanged). `repoFor('hexokit')` MUST return `'hexokit'`, so every roster-derived GitHub link, star fetch, and JSON-LD url resolves to `github.com/sahil87/hexokit`. The roster header comment MUST state present truth (only the mount differs from the slug for HexoKit).

- **GIVEN** the built site **WHEN** the header nav / landing CTA / footer GitHub link renders **THEN** it points at `https://github.com/sahil87/hexokit`

#### R2: README/docs puller sources `sahil87/hexokit`
`.github/workflows/refresh-readme.yml` SHALL carry `"hexokit:hexokit"` in BOTH `tools=(...)` arrays (README step and docs/site step, lockstep). Comments in `refresh-readme.yml` and `refresh-help.yml` claiming the repo stays `run-kit` MUST be corrected.

- **GIVEN** the next refresh-readme run **WHEN** it fetches the product README and docs/site tree **THEN** it reads from `sahil87/hexokit`

### Site surfaces

#### R3: Hand-authored live GitHub URLs and stale comments
`S/src/content/docs/desktop.md` releases link, `README.md`, and `fab/project/context.md` SHALL name `sahil87/hexokit`. Source comments that claim the repo is/stays `run-kit` (github-stars, GithubButton, HeaderNav, landing-data, ReadmeSlice, CommandReference, Head, TerminalPrompt, logo.svg provenance) MUST be corrected. The `versions-manifest.ts` key rationale MUST be accurate (shll ≤ v0.1.33 exact-key lookup; run-kit's updatecheck keys on shll's output row name, not the manifest key).

- **GIVEN** `grep -rn 'sahil87/run-kit'` over `S/src`, `S/scripts` (excluding fixtures), `.github`, `README.md`, `fab/project` **WHEN** run **THEN** no present-tense hits remain

#### R4: Tests follow the roster
`S/scripts/tool-roster.test.mjs` and `S/scripts/landing-data.test.mjs` SHALL assert `repo`/`repoFor('hexokit')` == `'hexokit'`. The full `S` test suite and build MUST pass.

### Non-Goals

- `versions-policy.json` `run-kit` key — stays (see Design Decisions)
- Pulled `content/**`, `help/**`; `scripts/fixtures/*`; `fab/` archives and dated changelog rows (D11); legacy `/run-kit` redirects and `legacyMounts`; TerminalPrompt `run-kit` alias; `run-kit-*.webp` filenames; `sites/_playground/`; the run-kit plan doc

### Design Decisions

#### versions.json key stays `run-kit` after the repo rename
**Decision**: Keep `versions-policy.json`'s `run-kit` key (with `envelope: hexokit`, `formula: hexokit`).
**Why**: shll ≤ v0.1.33 looks the row up by exact key `run-kit` (no fallback); shll v0.1.34 looks up `hexokit` then LegacyNames `rk`, `run-kit`, so it finds the row either way. run-kit's `internal/updatecheck` never reads the manifest — it matches `shll check-updates --json` rows by shll's roster Name.
**Rejected**: Flip to `hexokit` — breaks check-updates for every shll ≤ v0.1.33 and gains nothing on v0.1.34.
*Introduced by*: 260928-9cha-hexokit-r2c-repo-slug

## Tasks

### Phase 1: Core Implementation

- [x] T001 [P] `S/src/lib/tool-roster.mjs` repo → `'hexokit'` + header comment; `S/scripts/tool-roster.test.mjs` + `S/scripts/landing-data.test.mjs` assertions/comments <!-- R1 -->
- [x] T002 [P] `.github/workflows/refresh-readme.yml` both pairs → `"hexokit:hexokit"` + comment; `.github/workflows/refresh-help.yml` comments <!-- R2 -->
- [x] T003 [P] Live URLs (`S/src/content/docs/desktop.md`, `README.md`, `fab/project/context.md`) and stale src comments listed in R3, incl. `S/src/lib/versions-manifest.ts` rationale <!-- R3 -->
- [x] T004 Run `S` tests + build (`just verify` or equivalent); fix fallout <!-- R4 -->

## Acceptance

### Functional Completeness

- [x] A-001 R1: `repoFor('hexokit') === 'hexokit'`; roster record otherwise unchanged
- [x] A-002 R2: both refresh-readme `tools` arrays carry `"hexokit:hexokit"`; no `hexokit:run-kit` remains
- [x] A-003 R3: no present-tense `sahil87/run-kit` / "repo stays run-kit" claims remain in site source, workflows, README, project context
- [x] A-004 R4: tool-roster and landing-data tests assert `hexokit`; full test suite and build pass

### Scenario Coverage

- [x] A-005 R1: built `dist` HTML GitHub links point at `github.com/sahil87/hexokit`

### Code Quality

- [x] A-006 Pattern consistency: edits follow surrounding comment style; no new abstractions
- [x] A-007 No unnecessary duplication: repo name still single-sourced from the roster

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Certain | versions-policy key unchanged | Verified shll v0.1.33/v0.1.34 lookup code and run-kit updatecheck | S:90 R:90 A:95 D:90 |
| 2 | Confident | Memory/spec updates happen at hydrate, not as apply tasks | fab pipeline: hydrate owns docs/memory; specs present-truth lines touched alongside | S:80 R:90 A:85 D:80 |

2 assumptions (1 certain, 1 confident, 0 tentative, 0 unresolved).

## Deletion Candidates

- None — this change updates a roster value, stale comments, and URLs without making any existing code redundant.
