# Plan: HexoKit R1(d) — site install surfaces flip run-kit → hexokit

**Change**: 260928-u7sp-hexokit-r1d-install-surfaces
**Intake**: `intake.md`

All paths below are relative to the repo root; `S` = `sites/astro-starlight-terminal1`.

## Requirements

### Install endpoint: product-first default

#### R1: No-arg default installs `hexokit`, with a stale-shll fallback
The composed `hexokit.com/install` epilogue (`S/scripts/install-epilogue.sh`) SHALL, when invoked with no tool arguments, pass `hexokit` to `main`. It MUST instead pass `run-kit` when a `shll` is already on `PATH` and `shll install --dry-run hexokit` fails (shll ≤ v0.1.33 predates the roster rename and rejects `hexokit`). Tool arguments, when given, MUST pass through unchanged. The post-install hint MUST still print only on the no-arg path.

- **GIVEN** a fresh box with no `shll` on PATH **WHEN** `curl … | sh` runs with no args **THEN** `main hexokit` runs
- **GIVEN** shll v0.1.34+ installed **WHEN** run with no args **THEN** `main hexokit` runs
- **GIVEN** shll v0.1.33 installed **WHEN** run with no args **THEN** `main run-kit` runs (bootstrap does not abort on `unknown target "hexokit"`)
- **GIVEN** args `fab-kit wt` **WHEN** run **THEN** `main fab-kit wt` runs, no probe, no hint

#### R2: Composition contract unchanged
`compose-install.mjs` SHALL keep its anchor/HTML guard behavior; only its doc comment and the tests' expectations about the default change. The composed script MUST pass `sh -n`.

- **GIVEN** the upstream shll `install.sh` **WHEN** composed **THEN** it ends with the new epilogue and `sh -n` passes

### Tool roster & puller

#### R3: HexoKit formula/binary are `hexokit`; repo stays `run-kit`
`S/src/lib/tool-roster.mjs` hexokit row SHALL carry `formula: 'hexokit'`, `binary: 'hexokit'`, `repo: 'run-kit'` (unchanged, R2). `.github/workflows/refresh-help.yml` SHALL capture `"hexokit:hexokit:hexokit"`. Comments claiming formula/binary stay `run-kit` MUST be corrected; comments about the repo staying `run-kit` MUST stay.

- **GIVEN** the next scheduled help refresh **WHEN** it runs **THEN** it installs `sahil87/tap/hexokit` and runs `hexokit help-dump`

### Versions manifest

#### R4: Keep the `run-kit` key, override formula to `hexokit`
`versions-policy.json` SHALL keep the `run-kit` key (consumers: run-kit `internal/updatecheck`, shll ≤ v0.1.33) with `envelope: "hexokit"` and gain `formula: "hexokit"`. Served `versions.json` row `run-kit` MUST show `formula: "hexokit"`.

- **GIVEN** the build **WHEN** `versions.json` is generated **THEN** `tools["run-kit"].formula == "hexokit"` and `latest` still reads from `help/hexokit.json`

### Docs copy & landing terminal

#### R5: Hand-authored docs name the tool `hexokit` / HexoKit, examples use `rk`
`S/src/content/docs/toolkit/install.md`, `desktop.md`, `toolkit/daily-flow.md`, `toolkit/new-change.md` SHALL use `shll install|update hexokit`, `rk desktop …`, `rk riff …`, and "HexoKit" in prose instead of `run-kit` as the primary name. Passages that document `rk`/`xk`/`run-kit` as aliases/legacy names stay.

- **GIVEN** the built docs **WHEN** grepped for `run-kit` **THEN** only alias/legacy/repo-URL mentions remain on these pages

#### R6: Landing terminal product card is `hexokit`, aliases resolve
`S/src/components/TerminalPrompt.astro` SHALL key the product card as `hexokit` (tool list, taglines, cheat-sheet display, demo/install output lines, `cd` targets); `rk`, `xk`, and `run-kit` SHALL resolve as aliases to the same card; `cd hexokit|run-kit|rk` SHALL navigate to `/docs/`. Existing terminal unit tests (`S/scripts/terminal-*.test.mjs`) MUST pass, updated where they assert the old key.

- **GIVEN** the landing terminal **WHEN** the user types `hexokit`, `rk`, `xk`, or `run-kit` **THEN** the same HexoKit card shows, primary name `hexokit`
- **GIVEN** `cd run-kit` **WHEN** entered **THEN** it navigates to `/docs/`

### Non-Goals

- Repo slug / `github.com/sahil87/run-kit` URLs and `repo:` fields — R2
- Flipping the `versions.json` key to `hexokit` — needs run-kit updatecheck dual-read first
- `content/`, `help/` (puller-managed), `scripts/fixtures/*`, `sites/_playground/`, screenshot filenames, legacy redirect tables, `fab/` history

### Design Decisions

#### Stale-shll fallback in the epilogue
**Decision**: Probe an installed shll with `shll install --dry-run hexokit`; on failure pass `run-kit`.
**Why**: The upstream bootstrap hands args to an already-installed shll without upgrading it; shll ≤ v0.1.33 rejects `hexokit` (reproduced), which would abort every re-run by existing users.
**Rejected**: Plain `set -- hexokit` (breaks re-runs); keeping `run-kit` (new shll prints a rename note on every fresh install and the site keeps naming the old tool); a version-string compare (brittle vs. a capability probe). Root fix — upstream bootstrap upgrades shll before `shll install` — is a shll follow-up; then this guard can be dropped.
*Introduced by*: 260928-u7sp-hexokit-r1d-install-surfaces

#### versions.json key stays `run-kit`
**Decision**: Keep the key, set `formula: "hexokit"`.
**Why**: run-kit's updatecheck (`runKitTool = "run-kit"`) and old shll look up by key; `formula` is informational to both.
**Rejected**: Flip the key now — silently breaks update notices in every shipped rk.
*Introduced by*: 260928-u7sp-hexokit-r1d-install-surfaces

## Tasks

### Phase 1: Core Implementation

- [x] T001 Rewrite the no-arg branch of `S/scripts/install-epilogue.sh` per R1 (probe + fallback, header comment updated); update `S/scripts/compose-install.mjs` doc comment; extend `S/scripts/compose-install.test.mjs` to assert the composed default is `hexokit` and the `run-kit` fallback is guarded by the `shll install --dry-run hexokit` probe. Add a behavioral test if cheap: run the epilogue under `sh` with a stub `main` and a stub `shll` on PATH (exit 0 / exit 1 / absent) and assert which args `main` received <!-- R1 -->
- [x] T002 Compose locally against the real upstream (`gh api repos/sahil87/shll/contents/scripts/install.sh -H "Accept: application/vnd.github.raw"` into a scratch file, `node S/scripts/compose-install.mjs <file>`, `sh -n <file>`) <!-- R2 -->
- [x] T003 [P] `S/src/lib/tool-roster.mjs` hexokit row formula/binary → `hexokit` + header comment; `.github/workflows/refresh-help.yml` triple + mapping comments; `.github/workflows/refresh-readme.yml` comments only where they claim formula/binary are `run-kit`; update `S/scripts/tool-roster.test.mjs` if it asserts the row <!-- R3 -->
- [x] T004 [P] `versions-policy.json` add `"formula": "hexokit"` to the `run-kit` row; `S/src/lib/versions-manifest.ts` comments; `S/scripts/versions-manifest.test.mjs` if it snapshots the row <!-- R4 -->
- [x] T005 [P] Docs copy: `S/src/content/docs/toolkit/install.md`, `S/src/content/docs/desktop.md`, `S/src/content/docs/toolkit/daily-flow.md`, `S/src/content/docs/toolkit/new-change.md` per R5 <!-- R5 -->
- [x] T006 `S/src/components/TerminalPrompt.astro` re-key product card to `hexokit` with `rk`/`xk`/`run-kit` aliases per R6; update any `S/src/lib/terminal-*.ts` helpers and `S/scripts/terminal-*.test.mjs` that assert the old key <!-- R6 -->

### Phase 2: Polish

- [x] T007 Fix stale comments claiming the binary/formula stay `run-kit` (CommandReference.astro, ReadmeSlice.astro, llms.ts, terminal-toolcard.ts, schemas.ts example, extract-readme-cli.mjs example); leave repo-stays-run-kit comments <!-- R3 -->
- [x] T008 Run `just verify` (validate, test, build) from the repo root; inspect `S/dist/versions.json` for the `run-kit` row's formula; grep the built docs pages for residual primary-name `run-kit` <!-- R4 -->

## Acceptance

### Functional Completeness

- [x] A-001 R1: No-arg epilogue passes `hexokit` when shll is absent or accepts `hexokit`, `run-kit` when an installed shll rejects it; args pass through unchanged; hint only on no-arg path
- [x] A-002 R2: Composed script against the real upstream passes `sh -n`; compose-install tests green
- [x] A-003 R3: Roster row formula/binary `hexokit`, repo `run-kit`; refresh-help triple `hexokit:hexokit:hexokit`
- [x] A-004 R4: Built `versions.json` has `tools["run-kit"].formula == "hexokit"`, key unchanged
- [x] A-005 R5: The four docs pages use `hexokit`/HexoKit/`rk` as primary names
- [x] A-006 R6: Landing terminal keys the card `hexokit`; `rk`/`xk`/`run-kit` resolve; `cd run-kit` → `/docs/`

### Scenario Coverage

- [x] A-007 R1: A test exercises the stale-shll fallback path (stub shll exiting non-zero)
- [x] A-008 R6: Terminal unit tests pass with the new key

### Edge Cases & Error Handling

- [x] A-009 R1: Probe output is silenced (stdout+stderr) and a failing probe does not trip `set -e` in the epilogue

### Code Quality

- [x] A-010 Pattern consistency: New code follows naming and structural patterns of surrounding code
- [x] A-011 No unnecessary duplication: Existing utilities reused where applicable
- [x] A-012 Scope discipline: no repo-slug/URL, `content/`, `help/`, fixture, or `_playground` edits

## Notes

- Check items as you review: `- [x]`
- All acceptance items must pass before `/fab-continue` (hydrate)
- If an item is not applicable, mark checked and prefix with **N/A**: `- [x] A-NNN **N/A**: {reason}`

## Deletion Candidates

- None — this change adds new functionality without making existing code redundant. The one redundancy it targeted (the `toolHelp['run-kit']` dual-key shim in `TerminalPrompt.astro` frontmatter) was removed by the change itself.

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Confident | Capability probe via `shll install --dry-run hexokit` | Verified exit codes on v0.1.33 (1 for hexokit, 0 for run-kit, ~0.4s); dry-run has no side effects | S:80 R:85 A:85 D:80 |
| 2 | Confident | `xk` added as a terminal alias | Plan rule D16: `xk` is a second alias of the command | S:80 R:90 A:80 D:80 |
| 3 | Confident | Historical comment examples (`run-kit riff --layout`) may stay unless touched | Harmless; D11 spirit | S:70 R:95 A:80 D:75 |

3 assumptions (0 certain, 3 confident, 0 tentative).
