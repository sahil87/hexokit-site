# Plan: HexoKit T2(b) — install stale-shll guard removal + `hexokit` versions.json row

**Change**: 260929-x2a2-hexokit-t2b-install-versions-cleanup
**Intake**: `intake.md`

## Requirements

### Install endpoint: product-first default

#### R1: The no-arg default always passes `hexokit`, with no shll probe
`scripts/install-epilogue.sh` SHALL set `set -- hexokit` whenever it is invoked with no arguments, and SHALL NOT invoke `shll` (no `command -v shll` / `shll install --dry-run` probe). The `hexokit_default` flag, the `( main "$@" )` subshell, and the toolkit hint are unchanged. The upstream bootstrap (shll `scripts/install.sh` ≥ `a8f11e2`, shll v0.1.36) upgrades a brew-installed shll before `shll install`, so an installed shll always accepts `hexokit`.

- **GIVEN** a shll on PATH that would reject `hexokit` (shll ≤ v0.1.33 behaviour)
- **WHEN** the composed installer runs with no arguments
- **THEN** `main` receives `hexokit`, the hint prints, and the stub shll is never invoked
- **AND** with no shll on PATH the behaviour is identical (`hexokit` + hint)

#### R2: The frozen upstream fixture tracks the T2(a) bootstrap
`scripts/fixtures/install-upstream.sh` SHALL be a byte-for-byte copy of `sahil87/shll` `scripts/install.sh` at commit `a8f11e2`, and every test naming the fixture commit SHALL name `a8f11e2`. Composition and `sh -n` tests SHALL pass against it.

- **GIVEN** the refreshed fixture
- **WHEN** `composeInstall(fixture, epilogue)` runs
- **THEN** the prefix is verbatim, the epilogue is the tail, and `sh -n` parses the result

### Versions manifest: product row under both keys

#### R3: `versions-policy.json` declares `hexokit` alongside an unchanged `run-kit`
The repo-root policy SHALL carry `"hexokit": { "notify": "minor" }` and SHALL keep `"run-kit": { "notify": "minor", "envelope": "hexokit", "formula": "hexokit" }` byte-identical. No `versions-manifest.ts` logic change.

- **GIVEN** the committed policy and `help/hexokit.json`
- **WHEN** the site builds
- **THEN** `dist/versions.json` has `tools.hexokit` and `tools['run-kit']`, both `{ latest: <help/hexokit.json version, bare>, notify: 'minor', formula: 'hexokit' }`

#### R4: Tests pin both rows
`scripts/versions-manifest.test.mjs` SHALL include a case where a policy with both keys and one `help/hexokit.json` envelope yields identical `run-kit` and `hexokit` rows, and a case that reads the real repo-root `versions-policy.json` and asserts both keys exist with the `run-kit` entry unchanged.

- **GIVEN** policy `{ 'run-kit': {notify:'minor', envelope:'hexokit', formula:'hexokit'}, hexokit: {notify:'minor'} }` and envelope `hexokit` at `v3.20.23`
- **WHEN** `buildManifest` runs
- **THEN** both rows equal `{ latest: '3.20.23', notify: 'minor', formula: 'hexokit' }`

#### R5: Contract prose and code comments describe the two-key row
`versions-manifest.ts`'s `PolicyEntrySchema` comment, `compose-install.mjs`'s header comment, and `docs/specs/versions-manifest-contract.md` (§1 example, §2 keying paragraph + envelope-override note, §Policy file example + bullets, Changelog) SHALL describe present truth: the product is advertised under `hexokit` and `run-kit`; the installer default has no fallback.

- **GIVEN** the updated files
- **WHEN** grepping for the stale-shll fallback / "no hexokit row" wording
- **THEN** no present-tense surface claims the fallback exists or that the live manifest lacks a `hexokit` row

### Design Decisions

#### Advertise the product under both `hexokit` and `run-kit` manifest keys
**Decision**: Add a `hexokit` policy entry (defaults: envelope and formula = key) alongside the unchanged `run-kit` entry, so the manifest carries two identical product rows.
**Why**: shll ≥ v0.1.34 names the product `hexokit` and tries that key first; shll ≤ v0.1.33 looks up only the exact key `run-kit`. Two identical rows serve both with no consumer-visible difference.
**Rejected**: Renaming `run-kit` → `hexokit` (drops update notices for every older shll install); leaving only `run-kit` (keeps the present-truth name out of the manifest).
*Introduced by*: 260929-x2a2-hexokit-t2b-install-versions-cleanup

#### Drop the installer's stale-shll probe
**Decision**: The epilogue's no-arg path is plain `set -- hexokit`.
**Why**: shll `scripts/install.sh` (`a8f11e2`, v0.1.36) upgrades a brew-installed shll before `shll install`, and the deploy fetches install.sh from shll `main`, so the served installer never hands `hexokit` to a stale brew shll.
**Rejected**: Keeping the probe (an extra shll call per run guarding a case the upstream now prevents; only a non-brew dev build on PATH escapes the upstream upgrade, which is maintainer-only).
*Introduced by*: 260929-x2a2-hexokit-t2b-install-versions-cleanup

### Deprecated Requirements

#### Stale-shll `run-kit` fallback in the install epilogue
**Reason**: Superseded by the upstream bootstrap upgrading an installed shll first (T2(a)).
**Migration**: R1 — the default is always `hexokit`.

## Tasks

### Phase 1: Core Implementation

- [x] T001 Remove the probe from `sites/astro-starlight-terminal1/scripts/install-epilogue.sh` (plain `set -- hexokit`, short comment on why no probe is needed) and drop the fallback clause from `scripts/compose-install.mjs`'s header comment <!-- R1 -->
- [x] T002 Refresh `sites/astro-starlight-terminal1/scripts/fixtures/install-upstream.sh` to shll `a8f11e2`; in `scripts/compose-install.test.mjs` replace the stale-shll fallback test with a no-probe test (stub shll records invocation), update helper comments and fixture-commit references <!-- R1 R2 -->
- [x] T003 Add `"hexokit": { "notify": "minor" }` to `versions-policy.json`; update the `PolicyEntrySchema` comment in `src/lib/versions-manifest.ts`; add the two-row and real-policy tests to `scripts/versions-manifest.test.mjs` <!-- R3 R4 -->
- [x] T004 Update `docs/specs/versions-manifest-contract.md` (§1, §2, §Policy file, Changelog) <!-- R5 -->

### Phase 2: Verification

- [x] T005 Run `just validate`, `just test`, `just build`; inspect `dist/versions.json` for both rows and `dist/`-independent `sh -n` on a fixture composition <!-- R1 R2 R3 R4 -->

## Acceptance

### Functional Completeness

- [x] A-001 R1: `install-epilogue.sh` no-arg path is `set -- hexokit` with no `shll` invocation
- [x] A-002 R2: fixture equals shll `a8f11e2` `scripts/install.sh` byte-for-byte; tests name `a8f11e2`
- [x] A-003 R3: `versions-policy.json` has a `hexokit` entry and the `run-kit` entry is byte-identical to before
- [x] A-004 R4: new manifest tests exist and pass
- [x] A-005 R5: spec + comments describe both keys and no installer fallback

### Behavioral Correctness

- [x] A-006 R3: built `dist/versions.json` contains identical `hexokit` and `run-kit` rows

### Removal Verification

- [x] A-007 R1: no `dry-run hexokit` probe or `set -- run-kit` remains in the epilogue; the stale-shll fallback test is gone

### Scenario Coverage

- [x] A-008 R1: a test proves an installed (would-reject) shll is not invoked and `hexokit` is passed

### Code Quality

- [x] A-009 Pattern consistency: New code follows naming and structural patterns of surrounding code
- [x] A-010 No unnecessary duplication: Existing utilities reused where applicable

## Notes

- Check items as you review: `- [x]`
- All acceptance items must pass before `/fab-continue` (hydrate)
- If an item is not applicable, mark checked and prefix with **N/A**: `- [x] A-NNN **N/A**: {reason}`

## Deletion Candidates

- None remaining — this change is itself a removal: the stale-shll probe, its `shllStubDir(kind)`/`envWithShll(kind)` test scaffolding (including the now-meaningless `'accept'` case), and the fallback test were all deleted in the same diff, and a repo-wide grep shows no surviving references to the removed symbols or the `run-kit` fallback outside memory files (which hydrate updates next).

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Confident | Real-policy test reads repo-root `versions-policy.json` via the test file's existing repo-root resolution | Guards the "keep run-kit" constraint against future edits | S:75 R:95 A:85 D:80 |
| 2 | Confident | Existing envelope-override test (no `hexokit` row when policy lacks the key) is kept | Still a valid mechanics test; R4 adds the two-key case | S:85 R:95 A:90 D:85 |

2 assumptions (0 certain, 2 confident, 0 tentative).
