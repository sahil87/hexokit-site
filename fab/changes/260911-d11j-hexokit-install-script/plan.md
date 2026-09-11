# Plan: hexokit.com/install — product-first default composed onto the shll install script (D10)

**Change**: 260911-d11j-hexokit-install-script
**Intake**: `intake.md`

## Requirements

All paths below are relative to the live site `sites/astro-starlight-terminal1/` unless they start with `.github/`, `.gitignore`, or `docs/` (repo root).

### Install endpoint: composer

#### R1: `composeInstall` rewrites exactly the upstream anchor line
`scripts/compose-install.mjs` MUST export a pure function `composeInstall(source, epilogue)` that returns `source` with its **last non-empty line** replaced by `epilogue`, and MUST leave every other byte of `source` untouched. The last non-empty line (trailing whitespace trimmed) MUST equal `main "$@"`; otherwise the function MUST throw an error whose message names the expected anchor and quotes the line found. The function MUST also throw when `source` is empty/whitespace-only or when its first non-whitespace character is `<` (an HTML body saved by a mis-fetch).

- **GIVEN** the frozen upstream script (`scripts/fixtures/install-upstream.sh`) and the epilogue fragment
- **WHEN** `composeInstall(source, epilogue)` runs
- **THEN** the result starts with the upstream text verbatim up to (excluding) the final `main "$@"` line, ends with the epilogue, contains no bare `main "$@"` line, and contains exactly one `( main "$@" )`.

- **GIVEN** a source whose last non-empty line is `main` or `run_main "$@"`
- **WHEN** `composeInstall` runs
- **THEN** it throws, and the message contains `main "$@"` and the offending line.

- **GIVEN** a source beginning `<!DOCTYPE html>`
- **WHEN** `composeInstall` runs
- **THEN** it throws with a message saying the input does not look like the shll install script.

#### R2: CLI rewrites the fetched file in place and fails loudly
`node scripts/compose-install.mjs <path>` MUST read `<path>`, read `scripts/install-epilogue.sh` (resolved relative to the script's own location, not the CWD), write `composeInstall(...)` back to `<path>`, and exit 0. Any thrown error MUST be printed to stderr prefixed `compose-install:` and exit 1. A missing `<path>` argument MUST print usage and exit 2. Importing the module MUST NOT run the CLI (module-is-main guard, the idiom `scripts/extract-readme-cli.mjs` uses).

- **GIVEN** `public/install` holding the fetched upstream script
- **WHEN** `node scripts/compose-install.mjs public/install` runs
- **THEN** `public/install` is the composed script and the exit code is 0.

- **GIVEN** `public/install` holding a Pages 404 HTML page
- **WHEN** the CLI runs
- **THEN** it exits 1 with a `compose-install:` message on stderr and the file is left unchanged.

### Install endpoint: epilogue behaviour

#### R3: Product-first default, verbatim pass-through, post-install hint
`scripts/install-epilogue.sh` MUST (a) when `$#` is 0, `set -- run-kit` and remember that the default fired; (b) run `( main "$@" )` in a subshell so the script continues after `main`'s `exec shll update`; (c) after a successful `main`, print the toolkit hint **only when the default fired**; (d) let a non-zero exit from the subshell abort the script with that exit status and no hint (`set -eu` is already active from the upstream header). The `run-kit` token MUST be the only place the roster/formula name appears in the epilogue's commands; prose (comments, hint) says HexoKit. The hint MUST name only `shll install` and `rk` (commands present in `help/shll.json` / `help/hexokit.json`) and the URL `https://hexokit.com/toolkit/`. The epilogue MUST start with a comment block stating that everything above it is `sahil87/shll scripts/install.sh` fetched verbatim and that the default is composed at deploy by `sahil87/hexokit-site`.

- **GIVEN** a stub script `main() { printf 'main:%s\n' "$*"; }` + `main "$@"` composed with the epilogue
- **WHEN** run as `sh composed.sh` with no arguments
- **THEN** stdout contains `main:run-kit` followed by the hint lines (`shll install`, `https://hexokit.com/toolkit/`), exit 0.

- **GIVEN** the same composed stub
- **WHEN** run as `sh composed.sh fab-kit wt`
- **THEN** stdout contains `main:fab-kit wt` and no hint, exit 0.

- **GIVEN** a stub `main() { exit 7; }` composed with the epilogue
- **WHEN** run with no arguments
- **THEN** exit status is 7 and stdout contains no hint.

- **GIVEN** the composed real upstream fixture
- **WHEN** `sh -n` parses it
- **THEN** exit 0 (valid POSIX sh).

#### R4: Unit tests pin the composer and the epilogue with a frozen upstream fixture
`scripts/compose-install.test.mjs` (native `node --test`, no network, dependency-free) MUST cover every scenario in R1–R3 using `scripts/fixtures/install-upstream.sh` — a byte-for-byte copy of `sahil87/shll/scripts/install.sh` at shll commit `8f5b250` (2026-09-11) — and stub scripts written to `os.tmpdir()`. Behavioural cases run `sh` via `child_process`; if `sh` is not on PATH the behavioural cases MUST `t.skip()` with a reason rather than fail.

- **GIVEN** the live site's toolchain
- **WHEN** `node --test scripts/*.test.mjs` runs
- **THEN** the new suite is discovered by the existing glob and passes.

### Build & deploy

#### R5: Deploy composes after the fetch; nothing generated is committed
`.github/workflows/deploy.yml` MUST run `node scripts/compose-install.mjs public/install` (working-directory `${{ env.SITE_DIR }}`) as a new step immediately after the existing fetch step, whose `curl` command is unchanged. Step comments MUST state that hexokit.com serves a deploy-time copy with a composed product-first default and that a missing anchor fails the deploy; they MUST NOT claim the script is served unchanged. `.gitignore`'s comment on `sites/*/public/install` MUST say the file is fetched and composed at deploy time and served at `hexokit.com/install`. `ci.yml` MUST NOT change (CI stays offline; the unit suite covers the composer).

- **GIVEN** the deploy workflow
- **WHEN** the build job runs
- **THEN** the step order is fetch → compose → build, and `public/install` remains gitignored.

### Site copy: hand-authored install surfaces

#### R6: `InstallOneLiner.astro` renders hexokit.com's product-first forms
The component MUST single-source the bootstrap line as `curl -fsSL https://hexokit.com/install | sh` (rename `WHOLE_TOOLKIT_ONE_LINER` → `BOOTSTRAP_ONE_LINER`; no `shll.ai` string may remain in the component, doc-comment included) and render, per tool:

| `tool` | Command block | Note |
|--------|---------------|------|
| `hexokit` | the bootstrap line alone | "Installs `shll` and HexoKit via Homebrew — the six companions are one `shll install` away. See the [full install guide](/toolkit/install/)." `hexokit` MUST be removed from `FULL_TOOLKIT`. |
| `shll` | bootstrap line, then a follow-on block: `shll install              # the six companions`, `shll setup shell           # wire your shell integration`, `shll setup agent           # optional, once per machine`, `exec $SHELL                # reload your shell` | "Installs `shll` and HexoKit; `shll install` adds the rest of the toolkit — see the [full install guide](/toolkit/install/)." The stale `shll shell-setup` / `shll agent-setup` spellings MUST be gone. |
| `fab-kit` (stays in `FULL_TOOLKIT`) | one `<Code>` block with two lines: the bootstrap line, then `shll install` | the existing reason sentence, retargeted to `/toolkit/install/` |
| `idea`, `wt`, `tu`, `hop` | `curl -fsSL https://hexokit.com/install \| sh -s -- <tool>` | unchanged wording, link → `/toolkit/install/` |

Every link in the component MUST target `/toolkit/install/` (the live mount; `/getting-started/install/` is only a redirect). The roster gate, `<Code>` rendering, and scoped styles are unchanged. The doc-comment MUST describe the new meaning of the bare line and the three tool classes.

- **GIVEN** `pnpm build`
- **WHEN** `dist/docs/index.html`, `dist/shll/index.html`, `dist/fab-kit/index.html`, `dist/idea/index.html` are inspected
- **THEN** `/docs/` carries the bare bootstrap line and no `sh -s --`; `/shll/` carries the bootstrap line and a follow-on block containing `shll install` and `shll setup shell`; `/fab-kit/` carries the bootstrap line and `shll install`; `/idea/` carries `sh -s -- idea`; no page under `dist/` rendered by this component contains `shll.ai/install`.

#### R7: `toolkit/install.md` describes hexokit.com's actual behaviour
`src/content/docs/toolkit/install.md` MUST: open with the two-step full install (`curl -fsSL https://hexokit.com/install | sh` commented `# shll + HexoKit`, then `shll install` commented as the six companions) and prose stating the one-liner bootstraps `shll`, installs HexoKit, prints how to add the rest, and that `shll install` with no arguments installs every roster tool you are missing; state that Homebrew is bootstrapped headlessly when absent (the fixture's `main()` does exactly that — the old "exits with a pointer" sentence MUST go); in "What the one-liner runs" list `brew trust --formula sahil87/tap/shll`, `brew install sahil87/tap/shll`, `shll install run-kit`, `shll update run-kit`, link both the canonical source (`https://github.com/sahil87/shll/blob/main/scripts/install.sh`) and the served file (`https://hexokit.com/install`), and say hexokit.com appends the product-first default; **delete** the `sahil87/tap/all` meta-formula paragraph; use `https://hexokit.com/install | sh -s -- hop wt` in Per-tool install; keep the follow-on (`shll setup shell` / `shll setup agent` / `exec $SHELL`), Verify, per-formula fallback, and Update sections. No `shll.ai/install` string may remain in the file.

- **GIVEN** the rendered `/toolkit/install/` page
- **WHEN** read top to bottom
- **THEN** every command it shows matches what `hexokit.com/install` actually does after this change, and `sahil87/tap/all` appears nowhere.

### Cross-repo hand-off

#### R8: Policy B patch note for C1
`docs/findings/install-composition-policy-b-patch.md` MUST exist with three parts exactly as specified in `intake.md` § What Changes 7: **Part 1** a before → after table of the four location edits to `docs/site/standards/install-composition.md` (intro Policy B clause, scope paragraph, Policy B bullet 1 → `https://hexokit.com/toolkit/install/`, Verifying-conformance bullet) plus the explicit list of what to leave for X4; **Part 2** the proposed "What the bootstrap installs" bullet, verbatim, with its rationale; **Part 3** the optional one-line comment for `scripts/install.sh` above `main "$@"`. The note MUST state that it is applied by shll change `ttoa` (C1), not by this repo, and MUST NOT modify anything outside this repo.

- **GIVEN** the C1 agent reading the note
- **WHEN** it applies Part 1
- **THEN** each "before" string is found verbatim in the current standard (as pulled to `content/shll/site/standards/install-composition.md`) and each "after" is a drop-in replacement.

### Non-Goals

- Editing `sahil87/shll/scripts/install.sh` — upstream stays canonical (intake assumption 1).
- Editing synced `content/**` (READMEs and docs/site trees that still quote `shll.ai/install`) — C7 / upstream.
- Editing the landing page (`src/pages/index.astro`, `src/lib/landing-data.ts`) — its copy already states the S5 behaviour; the `brew install sahil87/tap/hexokit` line is R1(d)'s.
- Making CI fetch the live upstream — the deploy step is the drift gate.
- Adding `rk-desktop` to the default or an `all` token to the epilogue.

### Design Decisions

#### Compose the default at deploy time in hexokit-site, not upstream
**Decision**: Fetch the canonical script unchanged and replace its last line `main "$@"` with a site-owned epilogue in the deploy job.
**Why**: Both domains fetch the same upstream `main`; an upstream default change would flip `shll.ai/install` before X2 and before the READMEs that quote it are updated. The last-line `main "$@"` is upstream's documented truncated-download design, so it is a stable, intentional anchor.
**Rejected**: Editing upstream (cross-repo, flips shll.ai early); committing a site copy or a run-time curl wrapper (abandons the canonical-source design, adds a second hop and a raw.githubusercontent dependency at the user's shell).
*Introduced by*: 260911-d11j-hexokit-install-script

#### Run `main` in a subshell so the hint prints after the install
**Decision**: `( main "$@" )` followed by the hint, instead of patching `main`'s `exec shll update` line.
**Why**: `main` ends in `exec`, which replaces the process; a subshell contains the exec, and `set -e` still propagates a failure (no hint, non-zero exit). One anchor instead of two keeps the composition coupling minimal.
**Rejected**: A pre-install banner (the hint is most useful after the install finishes); a second `sed` anchor on the `exec` line (fragile coupling to upstream internals).
*Introduced by*: 260911-d11j-hexokit-install-script

#### Hint only on the default path
**Decision**: Print the toolkit hint only when the epilogue supplied the default `run-kit`.
**Why**: A user who named tools made a choice; the hint exists to tell the product-only installer that more exists.
**Rejected**: Always printing (noise for subset installs).
*Introduced by*: 260911-d11j-hexokit-install-script

## Tasks

### Phase 1: Setup

- [x] T001 [P] Freeze the upstream script: copy `/home/sahil/code/sahil87/shll/scripts/install.sh` (shll `main` @ `8f5b250`, identical to the served `hexokit.com/install`) to `scripts/fixtures/install-upstream.sh` byte-for-byte; verify its last non-empty line is `main "$@"`. <!-- R4 -->
- [x] T002 [P] Write `scripts/install-epilogue.sh` with the exact fragment from `intake.md` § What Changes 2 (leading blank line, comment block, `hexokit_default` flag, `set -- run-kit`, `( main "$@" )`, guarded hint). <!-- R3 -->

### Phase 2: Core Implementation

- [x] T003 Write `scripts/compose-install.mjs`: exported `composeInstall(source, epilogue)` (HTML/empty guard, last-non-empty-line anchor check with a quoting error message, replacement preserving a trailing newline) and the module-is-main CLI (`<path>` in place; epilogue read from `scripts/install-epilogue.sh` next to the script; `compose-install:` stderr prefix, exit 1 on error, usage + exit 2 on missing arg). Follow `scripts/extract-readme-cli.mjs`'s header-comment and `fileURLToPath` idioms. <!-- R1 -->
- [x] T004 Write `scripts/compose-install.test.mjs` (native `node --test`, `assert/strict`, tmpdir stubs, `child_process.spawnSync('sh', …)` with a `t.skip` when `sh` is absent): composes the fixture (prefix verbatim, epilogue suffix, exactly one `( main "$@" )`, no bare anchor); `sh -n` on the composed fixture; default path → `main:run-kit` + hint; explicit args → no hint; failing `main` → exit 7, no hint; missing anchor throws; HTML body throws; CLI in-place rewrite exits 0 and CLI on HTML exits 1 leaving the file unchanged. Run `node --test scripts/compose-install.test.mjs` until green. <!-- R4 -->
- [x] T005 Edit `.github/workflows/deploy.yml`: add the compose step after the fetch step (per `intake.md` § What Changes 4), rewrite the fetch step's comment (no "served unchanged" claim; mention `docs/memory/build-deploy/install-endpoint.md`); update the `.gitignore` comment above `sites/*/public/install` to "fetched and composed at deploy time from sahil87/shll scripts/install.sh (served at hexokit.com/install)". <!-- R5 -->

### Phase 3: Integration & Edge Cases

- [x] T006 Rewrite `src/components/InstallOneLiner.astro` per R6: `BOOTSTRAP_ONE_LINER` on hexokit.com, remove `hexokit` from `FULL_TOOLKIT`, product branch for `tool === 'hexokit'`, shll follow-on block with `shll install` + `shll setup shell` + `shll setup agent` + `exec $SHELL`, two-line block for `FULL_TOOLKIT` tools, all links → `/toolkit/install/`, doc-comment rewritten; verify every command token against `help/shll.json` (`install`, `setup`) and `help/hexokit.json` (`rk`). <!-- R6 -->
- [x] T007 Rewrite `src/content/docs/toolkit/install.md` per R7 (two-step lead, headless-brew sentence, equivalent-lines block with `shll install run-kit` / `shll update run-kit`, source + served links, delete the `sahil87/tap/all` paragraph, hexokit.com in Per-tool install); grep the file for `shll.ai` and `tap/all` → zero hits. <!-- R7 -->
- [x] T008 Write `docs/findings/install-composition-policy-b-patch.md` per R8 (Parts 1–3, verbatim before/after strings checked against `content/shll/site/standards/install-composition.md`, X4 leave-alone list, "applied by shll change `ttoa`" statement). <!-- R8 -->

### Phase 4: Polish

- [x] T009 Verification pass: `node --test scripts/*.test.mjs` green; `pnpm build` green; inspect `dist/docs/index.html`, `dist/shll/index.html`, `dist/fab-kit/index.html`, `dist/idea/index.html`, `dist/toolkit/install/index.html` for the R6/R7 command forms; `grep -rl 'shll.ai/install' dist/` returns only pages rendered from synced `content/**` (readme/docs-site pages), never the overview, toolkit-install, or landing pages; simulate the deploy step locally (`curl -fsSL` the upstream to a temp `public/install`, run the composer, `sh -n` it, then delete the file so nothing generated is left in the tree). <!-- R5 -->

## Execution Order

- T001 and T002 are independent; T003 needs T002's fragment path fixed; T004 needs T001–T003.
- T005–T008 are independent of each other and of T004, but T009 needs all of them.

## Acceptance

### Functional Completeness

- [x] A-001 R1: `composeInstall` replaces exactly the last non-empty `main "$@"` line with the epilogue and leaves all preceding bytes identical.
- [x] A-002 R2: `node scripts/compose-install.mjs public/install` rewrites the file in place and exits 0; importing the module runs nothing.
- [x] A-003 R3: The epilogue defaults `$@` to `run-kit`, runs `( main "$@" )`, and prints the hint after a successful default-path install.
- [x] A-004 R4: `scripts/compose-install.test.mjs` exists, uses the frozen fixture `scripts/fixtures/install-upstream.sh`, and passes under `node --test scripts/*.test.mjs`.
- [x] A-005 R5: `deploy.yml` runs fetch → compose → build with the compose step in `${{ env.SITE_DIR }}`; `.gitignore` still ignores `sites/*/public/install` with the updated comment; `ci.yml` is unchanged.
- [x] A-006 R6: `InstallOneLiner.astro` renders the four forms of the R6 table with `https://hexokit.com/install` and links to `/toolkit/install/`; `hexokit` is not in `FULL_TOOLKIT`.
- [x] A-007 R7: `toolkit/install.md` opens with the two-step full install, lists `shll install run-kit` / `shll update run-kit` as the equivalent lines, links source and served file, and contains neither `shll.ai/install` nor `tap/all`.
- [x] A-008 R8: `docs/findings/install-composition-policy-b-patch.md` has Parts 1–3 with before-strings that match the current standard verbatim.

### Behavioral Correctness

- [x] A-009 R3: With explicit tool arguments the epilogue passes them through unchanged to `main` and prints no hint.
- [x] A-010 R3: A failing `main` exits the composed script with `main`'s status and prints no hint.
- [x] A-011 R6: The `shll` overview's follow-on block uses `shll setup shell` / `shll setup agent` (no `shell-setup` / `agent-setup`).

### Removal Verification

- [x] A-012 R7: The `sahil87/tap/all` paragraph is gone from `toolkit/install.md` and no `tap/all` string remains anywhere under `src/`.
- [x] A-013 R6: No `shll.ai` string remains in `InstallOneLiner.astro` (code or comments).

### Scenario Coverage

- [x] A-014 R1: Tests cover the missing-anchor throw and the HTML-body throw.
- [x] A-015 R3: Tests cover default path, explicit args, failure propagation, and `sh -n` validity of the composed real fixture.
- [x] A-016 R6: Built `dist/` pages show: `/docs/` bare bootstrap line only; `/shll/` bootstrap + `shll install`; `/fab-kit/` bootstrap + `shll install`; `/idea/` `sh -s -- idea`.

### Edge Cases & Error Handling

- [x] A-017 R2: CLI with no argument prints usage and exits 2; CLI on an HTML file exits 1 with a `compose-install:` stderr line and leaves the file unchanged.
- [x] A-018 R4: Behavioural tests skip (not fail) when `sh` is unavailable.
- [x] A-019 R3: The epilogue names only `shll install`, `rk`, and `https://hexokit.com/toolkit/` (vn39: every command exists in the help dumps) and contains the roster token `run-kit` exactly where the command needs it.

### Code Quality

- [x] A-020 Pattern consistency: new scripts follow the `scripts/*-cli.mjs` / `*.test.mjs` idioms (header doc-comment, `fileURLToPath`, `node:test` + `assert/strict`, tmpdir fixtures).
- [x] A-021 No unnecessary duplication: the bootstrap line is single-sourced in the component; the epilogue text lives only in `scripts/install-epilogue.sh`.
- [x] A-022 Readability over cleverness: `composeInstall` is a short, linear function; no regex gymnastics where a line split suffices.
- [x] A-023 No magic strings: the anchor `main "$@"` and the `compose-install:` prefix are named constants in the composer.
- [x] A-024 No god functions: no function in the new scripts exceeds ~50 lines.

## Notes

- Check items as you review: `- [x]`
- All acceptance items must pass before `/fab-continue` (hydrate)
- If an item is not applicable, mark checked and prefix with **N/A**: `- [x] A-NNN **N/A**: {reason}`

## Deletion Candidates

None — this change adds new functionality without making existing code redundant. The two removals it performs (the `sahil87/tap/all` paragraph in `toolkit/install.md`, `hexokit` from `FULL_TOOLKIT` in `InstallOneLiner.astro`) are planned removals covered by A-012/A-006, not discovered candidates. The `/getting-started/install` → `/toolkit/install/` redirect in `astro.config.mjs` stays: the component no longer links to it, but the redirect still serves external/deep links.

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Confident | Anchor match trims trailing whitespace (including `\r`) on the anchor line only; no other byte is normalized, so a CRLF upstream would still match and compose with mixed endings | Upstream is LF; the composer must never rewrite upstream bytes, and the deploy simulation + `sh -n` would surface a broken result | S:55 R:90 A:85 D:75 |
| 2 | Confident | Behavioural tests run `sh` via `spawnSync` and `t.skip` when absent | CI runners and dev boxes have `sh`; skipping keeps the suite honest elsewhere | S:50 R:95 A:85 D:80 |
| 3 | Confident | The `fab-kit` two-step block is one `<Code>` block with two lines rather than two blocks | One copy button copies both commands; mirrors the shll follow-on block idiom | S:45 R:95 A:80 D:70 |
| 4 | Certain | The fixture is frozen at shll `8f5b250`; CI never fetches the live upstream | Repo convention (frozen behaviour specimens); deploy is the live gate per intake | S:80 R:95 A:90 D:90 |

4 assumptions (1 certain, 3 confident, 0 tentative).
