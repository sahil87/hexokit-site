# Plan: Minimal, natural landing copy (study 2)

**Change**: 260910-a9xx-landing-copy-minimal
**Intake**: `intake.md`

> Copy-only change to the `/` landing (`sites/astro-starlight-terminal1/`). The exact target strings are in `intake.md` § What Changes (sections 1–5) and are not repeated here — the intake is the source of truth for every word. Toolchain: repo-root `justfile` (`just verify`, `just build`, `just preview`, `just shot`).

## Requirements

### Landing copy: data strings

#### R1: `landing-data.ts` carries the study-2 strings
`src/lib/landing-data.ts` SHALL contain exactly the intake § 1 strings: `HERO.lead`; the seven `FEATURES` bodies and card 1's new title (cards 2–7 titles unchanged); the six `TOOLKIT_EDGES[].blurb` values. Image entries, hrefs, install lines, desktop commands and footer links MUST be unchanged. The header "HAND-COPY DRIFT SURFACE" paragraph and the `ToolkitEdge.blurb` doc comment SHALL state the new rule: the landing's blurbs are deliberately shorter than `/toolkit/`'s and are not a copy of them.

- **GIVEN** the built page
- **WHEN** the seven cards are read
- **THEN** each body matches intake § 1 verbatim, card 7 contains "Quake-style" once, card 6 lists three items ending "or the machine's own screen"
- **GIVEN** `landing-data.test.mjs`
- **WHEN** it runs
- **THEN** every backticked `rk <verb>` still resolves in `help/hexokit.json` and the structural assertions pass unchanged

### Landing copy: page prose

#### R2: `index.astro` prose per intake § 2
The two install notes, the differentiator paragraph, the *It is* / *It isn't* rows, and the desktop body's second and third sentences plus its note SHALL match intake § 2 verbatim; the desktop lead sentence, all eyebrows, H2s, CTAs, code blocks and markup MUST be unchanged.

- **GIVEN** `dist/index.html`
- **WHEN** the install section is read
- **THEN** it contains "Installs <code>shll</code> and HexoKit. Nothing else." and "Needs tmux 3.4 or newer."
- **AND** the desktop section contains "Your tmux sessions outlive it." and no em-dash-bracketed aside in its second sentence

#### R3: toolkit lead per intake § 3
`ToolkitHexagon.astro`'s lead SHALL read "HexoKit is the cockpit. Six small tools sit on its six edges, and `shll` installs them all." with the `shll` link retained.

- **GIVEN** the built page
- **WHEN** the toolkit lead is read
- **THEN** it matches, and the `shll` anchor still points at `/shll/`

### Records

#### R4: the study is committed and the copy philosophy is recorded
`docs/findings/landing-copy-study-2-minimal.md` SHALL be committed unchanged, and `fab/project/context.md` SHALL gain the "## Copy on this site" section per intake § 5 (the seven bullets, incl. the pointers to both studies).

- **GIVEN** the repo after apply
- **WHEN** `git status` and `context.md` are inspected
- **THEN** the study is tracked and the section exists with its seven points

### Verification

#### R5: green and no layout regression
`just verify` SHALL exit 0. Captures via `just shot` (1440 dark, 1440 light, 400 dark, and an anchored `#features` capture at 1440) SHALL show the grid still aligned, the wide operator-console card still image-left/copy-right at 1440, and no horizontal overflow at 400.

- **GIVEN** the four captures
- **WHEN** viewed
- **THEN** no card body overflows, no section broke, both themes legible

### Non-Goals

- No edits to `/toolkit/index.mdx` (its long blurbs stay), to layout/CSS/assets, to fixed strings, or to `Head.astro`/`Footer.astro`/`HeaderNav.astro`/`astro.config.mjs`/`terminal.css`.
- No archive of `lvnp` (user decision: later).

### Design Decisions

#### The landing's blurbs are their own, shorter set
**Decision**: `TOOLKIT_EDGES[].blurb` is landing copy (6–7 words each); `/toolkit/` keeps its long one-liners; the two are not a copy of each other.
**Why**: A landing blurb and a directory-page blurb do different jobs; the verbatim coupling cost ~30 words in the page's densest section for no reader benefit. Sahil chose decoupling explicitly.
**Rejected**: Keeping the verbatim copy and taking the cut elsewhere — the blurbs were the least natural strings left on the page.
*Introduced by*: 260910-a9xx-landing-copy-minimal

#### Two deviations from study 2, by the user's intent
**Decision**: Card 7 keeps "Quake-style" once; card 6 keeps the GUI display as a third short item.
**Why**: Sahil asked for the Quake terminal as a feature (the word is the audience's hook), and the study's two-item list dropped a real capability.
**Rejected**: The study's shorter versions of both bodies.
*Introduced by*: 260910-a9xx-landing-copy-minimal

## Tasks

### Phase 1: Core Implementation

- [x] T001 Replace the copy strings in `sites/astro-starlight-terminal1/src/lib/landing-data.ts` (hero lead, card 1 title, seven card bodies, six blurbs) exactly per intake § 1; rewrite the header "HAND-COPY DRIFT SURFACE" paragraph and the `ToolkitEdge.blurb` doc comment to the decoupled rule. <!-- R1 -->
- [x] T002 [P] Replace the prose in `src/pages/index.astro` (install notes, differentiator paragraph, It is / It isn't, desktop sentences 2–3 and note) per intake § 2, and the toolkit lead in `src/components/ToolkitHexagon.astro` per intake § 3. <!-- R2, R3 -->
- [x] T003 [P] Append the "## Copy on this site" section to `fab/project/context.md` per intake § 5; `git add docs/findings/landing-copy-study-2-minimal.md` so the study ships with the change. <!-- R4 -->

### Phase 2: Verification

- [x] T004 `just verify`; `just build && just preview`, then `just shot` at 1440 dark, 1440 light, 400 dark and `/#features` at 1440; view all four and fix any regression. Captures go to the session scratchpad only. <!-- R5 -->

## Acceptance

### Functional Completeness

- [x] A-001 R1: `landing-data.ts` strings match intake § 1 verbatim; images/hrefs/install lines/footer unchanged; comments state the decoupled-blurb rule
- [x] A-002 R2: `index.astro` prose matches intake § 2 verbatim; fixed strings and markup unchanged
- [x] A-003 R3: `ToolkitHexagon.astro` lead matches intake § 3 with the `/shll/` link
- [x] A-004 R4: the study file is tracked and `context.md` has the "## Copy on this site" section with seven points and both study pointers
- [x] A-005 R5: `just verify` exits 0 (validate, 292 tests, 74 pages)

### Behavioral Correctness

- [x] A-006 R1: card 7 body contains "Quake-style" exactly once; card 6 body ends "or the machine's own screen."
- [x] A-007 R5: the four captures show the grid aligned, the wide card image-left/copy-right at 1440, no horizontal overflow at 400

### Scenario Coverage

- [x] A-008 R1: `node --test scripts/landing-data.test.mjs` passes — every `rk <verb>` in the new copy resolves in `help/hexokit.json`

### Edge Cases & Error Handling

- [x] A-009 R1: no string in `landing-data.ts` contains a stray backtick or an unpaired one (the `inlineCode` transform depends on pairs)

### Code Quality

- [x] A-010 Pattern consistency: strings live only in `landing-data.ts` / the page's own prose blocks, as before; no new markup or helpers
- [x] A-011 No unnecessary duplication: the operator is introduced once (card 5), card 7 assumes it; the hero, card 1 and *It is* no longer repeat one another
- [x] A-012 Existing project patterns: vn39 rule holds for all hand-written prose; the product is "HexoKit", the binary `rk`

## Notes

- Check items as you review: `- [x]`
- All acceptance items must pass before `/fab-continue` (hydrate)
- If an item is not applicable, mark checked and prefix with **N/A**: `- [x] A-NNN **N/A**: {reason}`

## Deletion Candidates

- None — this change replaces copy strings in place and removes no code path. The three prose surfaces (`landing-data.ts`, `index.astro`, `ToolkitHexagon.astro`) shrank by 8 net lines with no symbol, branch, or file made redundant.
- Watch (not a deletion): `sites/astro-starlight-terminal1/docs/memory/site/landing-page.md` § "Hand-copy drift surfaces" item 1 and `docs/memory/conventions/tool-page-rubric.md:161` still describe `TOOLKIT_EDGES[].blurb` as a verbatim hand-copy of `/toolkit/index.mdx`. That claim is now false by decision (the blurbs are decoupled) — hydrate rewrites it; it is not deletable code.

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Certain | Strings are transcribed from intake § 1–3, not re-written at apply | The intake carries decided copy | S:95 R:95 A:95 D:95 |
| 2 | Confident | `context.md` section is appended at the end of the file | Matches how the "Task runner" section was added today | S:60 R:95 A:90 D:80 |

2 assumptions (1 certain, 1 confident, 0 tentative).
