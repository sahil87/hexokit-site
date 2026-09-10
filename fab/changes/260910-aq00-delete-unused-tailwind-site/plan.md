# Plan: Delete the unused tailwind site variant and scrub its references

**Change**: 260910-aq00-delete-unused-tailwind-site
**Intake**: `intake.md`

## Requirements

### Repo layout: remove the retired site variant

#### R1: The tailwind variant directory is deleted from the repo
`sites/astro-tailwind-terminal1/` MUST be removed from git (all 42 tracked files) via `git rm -r`. `sites/_playground/` and `sites/astro-starlight-terminal1/` MUST remain untouched by the deletion.

- **GIVEN** the branch after apply
- **WHEN** `git ls-files sites/astro-tailwind-terminal1 | wc -l` runs
- **THEN** it prints `0`
- **AND** `git ls-files sites/_playground | wc -l` equals its pre-apply count

#### R2: Repo-layout docs no longer list the deleted variant
The `sites/` tree in `README.md` (`## Layout`) and in `fab/project/context.md` (`## Repo layout`) MUST drop the `astro-tailwind-terminal1/` row and only that row. Surrounding prose ("multiple website variants", "the others are experiments") stays as-is — it remains true with `_playground/` present.

- **GIVEN** `README.md` and `fab/project/context.md` after apply
- **WHEN** each file's `sites/` tree block is read
- **THEN** it lists exactly `astro-starlight-terminal1/` and `_playground/`
- **AND** no other line in either file changed

#### R3: The VS Code launch config targets the live site
`.vscode/launch.json`'s single "Development server" configuration MUST run `cd sites/astro-starlight-terminal1 && pnpm dev` (the live site's own `dev` script, which carries `--host 0.0.0.0`). `name`, `request`, and `type` MUST be unchanged and the file MUST remain valid JSON.

- **GIVEN** `.vscode/launch.json` after apply
- **WHEN** parsed with `node -e 'JSON.parse(require("fs").readFileSync(".vscode/launch.json","utf8"))'`
- **THEN** it parses, and `configurations[0].command` equals `cd sites/astro-starlight-terminal1 && pnpm dev`

### Memory: reconcile the tool-page rubric to the live Starlight site

#### R4: The rubric's dead-site sections describe the live site
`docs/memory/conventions/tool-page-rubric.md` MUST be reconciled so that no section describes the deleted tailwind site. Specifically:

- (a) The "Live-site mismatch — read first" blockquote directly under the H1 is deleted, not replaced.
- (b) `## Overview` describes the live structure: every tool at `src/content/docs/tools/<tool>/` with exactly three pages — `overview.mdx` (hand-authored), `readme.mdx` (`<ReadmeSlice>`, synced), `commands.mdx` (`<CommandReference>`, generated) — served at root slugs `/<tool>`, `/<tool>/readme`, `/<tool>/commands` via `slug:` frontmatter overrides (change `3ke3`; old `/tools/<tool>/*` URLs redirect — pointer to § Per-tool pages are canonical at the root namespace), plus the pulled `docs/site/**` tree as extra per-tool pages (pointer to the `docs-site-tree` memory). It keeps the framing that the rubric is deliberately short and the overview is a directory entry whose depth lives on the synced sibling pages.
- (c) `## Requirements` items 1–5 are replaced by the live per-tool contract: (1) frontmatter validated by Starlight's `docsSchema()` (`src/content.config.ts` is `docs: defineCollection({ loader: docsLoader(), schema: docsSchema() })`), requiring `title` (bare slug on the overview — the `kb1r` title discipline), `description` (hand-authored SEO one-liner — pointer to seo-social-meta), and the `slug:` override; (2) three pages per tool with the overview body shape defined by the two `## Overview body shape` sections that follow (pointer, not restatement); (3) roster registration — pointer to the "adding an 8th tool" note under § Root-namespace reservation. The "Tool pages SHALL NOT contain **hand-written**" list and the `w32m`/`4s3e` stance blockquotes are kept verbatim.
- (d) `## Sidebar Coupling` describes the live mechanism: sidebar hardcoded in `astro.config.mjs`, one `collapsed: true` group per tool with three `slug:` entries plus a `...docsSiteSidebarItems('<tool>')` spread; no `src/data/tools.ts`; adding a tool means adding a group and updating the roster places. The dangling `../site/astro-config.md` link is removed.
- (e) The `/tools` index section's parenthetical "(Contrast [Sidebar Coupling](#sidebar-coupling) below, which describes the *non-live* tailwind site's `tools.ts` mechanism.)" is reworded to point at the hardcoded `astro.config.mjs` groups without naming the dead site.
- (f) `## Bullet Style` no longer anchors on an "At a glance" section — it targets the overview's hand-authored bullets (the `## How it fits` / `## Where to next` lists) generically. The two Design Decisions "Brew install line in every page" and "`At a glance`, not `Usage`" are struck through with a one-line superseded note (by `moju` `<InstallOneLiner>` and by `bees`'s job-framed lead + `4s3e` respectively), matching the file's existing `~~Short pages, not deep docs.~~` convention — NOT deleted.
- (g) Frontmatter `description` is unchanged unless the rewrite adds coverage it lacks (expected: unchanged). `type: memory` stays.

- **GIVEN** the rubric after apply
- **WHEN** `grep -n 'astro-tailwind-terminal1\|src/content/tools/\|src/data/tools.ts\|zod\|At a glance' docs/memory/conventions/tool-page-rubric.md` runs
- **THEN** the only permitted hits are inside the two struck-through Design Decision titles (`~~…At a glance…~~`) — everything else returns nothing
- **AND** the sections from `## Overview body shape: site-authored framing …` through `## Per-tool GitHub affordance` are byte-identical except for the (e) parenthetical

### Live site: provenance comments name no nonexistent path

#### R5: terminal.css comments are reworded, comment-only
In `sites/astro-starlight-terminal1/src/styles/terminal.css`, the line-1 header comment MUST read `/* terminal.css — port of the retired tailwind variant's terminal aesthetic to Starlight.` and the blinking-cursor comment MUST read `/* Blinking cursor — @keyframes carried over from the retired tailwind variant. */`. No selector, property, or value changes; the file's line count is unchanged.

- **GIVEN** the live site after apply
- **WHEN** `git diff` of `terminal.css` is inspected
- **THEN** only the two comment lines differ
- **AND** `pnpm build` in `sites/astro-starlight-terminal1` exits 0

### Verification sweep

#### R6: No live file references the deleted folder
Outside the recorded history exclusions, the repo MUST contain no reference to `astro-tailwind-terminal1`.

- **GIVEN** the branch after apply
- **WHEN** `git grep -n astro-tailwind-terminal1 -- ':!fab/changes' ':!docs/memory/conventions/log*.md' ':!sites/_playground'` runs
- **THEN** it prints nothing (exit 1)

### Non-Goals

- `fab/changes/**` (including `archive/`) — historical records, never rewritten.
- `docs/memory/conventions/log.md`, `log.seed.md`, `docs/memory/build-deploy/log*.md` — changelogs are history; hydrate appends, never edits old entries.
- `sites/_playground/starlight-terminal/**` — playground experiments are untouched (Constitution II/III); their provenance mentions stay.
- `fab/project/constitution.md`, `fab/project/config.yaml`, `.github/workflows/*`, `SITE_DIR` — unchanged; Multi-Site Isolation and One Live Site still hold with `_playground/`.
- Any content change to the live site beyond the two comment lines.

### Design Decisions

#### Reconcile the rubric at apply, not hydrate
**Decision**: The rubric rewrite (R4) is an apply-stage task; hydrate only regenerates indexes and records the summary line.
**Why**: The memory edit is the user's deliverable ("remove its references from docs and memory") and the review-stage grep (R6) must already pass; deferring it to hydrate would make review pass on a still-inconsistent file.
**Rejected**: Leaving the rubric for hydrate — review could not verify R6, and the mismatch blockquote would survive review.
*Introduced by*: 260910-aq00-delete-unused-tailwind-site

#### Strike-through, not deletion, for superseded Design Decisions
**Decision**: The two dead DD entries are struck through with a superseded note, following the file's existing `~~Short pages, not deep docs.~~` convention.
**Why**: The DD section is the file's decision history; deleting entries erases why the current shape exists. The convention is already established in the same section.
**Rejected**: Deleting the entries (loses history) or leaving them untouched (file self-inconsistent once the mismatch note is gone).
*Introduced by*: 260910-aq00-delete-unused-tailwind-site

## Tasks

### Phase 1: Setup

- [x] T001 Record the pre-apply baseline: `git ls-files sites/_playground | wc -l` (for A-002) and `wc -l sites/astro-starlight-terminal1/src/styles/terminal.css` (for A-010); then `git rm -r sites/astro-tailwind-terminal1/` and confirm `git ls-files sites/astro-tailwind-terminal1 | wc -l` prints 0 <!-- R1 -->

### Phase 2: Core Implementation

- [x] T002 [P] `README.md`: delete the single tree row `├── astro-tailwind-terminal1/   # alternate build (previously live)` inside the `## Layout` code block; change nothing else <!-- R2 -->
- [x] T003 [P] `fab/project/context.md`: delete the single tree row `├── astro-tailwind-terminal1/   # variant (not deployed)` inside `## Repo layout`; change nothing else <!-- R2 -->
- [x] T004 [P] `.vscode/launch.json`: change `configurations[0].command` to `cd sites/astro-starlight-terminal1 && pnpm dev`; keep `name`/`request`/`type`; verify with `node -e 'JSON.parse(require("fs").readFileSync(".vscode/launch.json","utf8"))'` <!-- R3 -->
- [x] T005 [P] `sites/astro-starlight-terminal1/src/styles/terminal.css`: reword the line-1 header comment and the `/* Blinking cursor — … */` comment exactly per R5; confirm `git diff --stat` shows 2 lines changed and line count unchanged <!-- R5 -->
- [x] T006 `docs/memory/conventions/tool-page-rubric.md`: perform R4 (a)–(g) — delete the mismatch blockquote; rewrite `## Overview`, `## Requirements` items 1–5, and `## Sidebar Coupling` to the live Starlight structure (verify against `sites/astro-starlight-terminal1/astro.config.mjs`, `src/content.config.ts`, and `ls src/content/docs/tools/*/` before writing); reword the `/tools`-index parenthetical; retarget `## Bullet Style`; strike through the two dead Design Decisions with superseded notes; keep everything else byte-identical; run the R4 grep <!-- R4 -->

### Phase 3: Integration & Edge Cases

- [x] T007 Verification sweep: run the R6 exclusion-scoped `git grep` (must print nothing); run `cd sites/astro-starlight-terminal1 && pnpm install --frozen-lockfile && pnpm build` (must exit 0); re-run the launch.json JSON parse; confirm `git status --short` lists only the intended paths (the deleted tree, the 5 edited files, and this change folder) <!-- R6 -->

## Acceptance

### Functional Completeness

- [x] A-001 R1: `git ls-files sites/astro-tailwind-terminal1 | wc -l` prints `0` and the directory is absent from the working tree
- [x] A-002 R1: `git ls-files sites/_playground | wc -l` equals the T001 baseline; `sites/astro-starlight-terminal1/` has no deletions
- [x] A-003 R2: `README.md`'s `## Layout` tree lists exactly `astro-starlight-terminal1/` and `_playground/`; `git diff README.md` is a single-line removal
- [x] A-004 R2: `fab/project/context.md`'s `## Repo layout` tree lists exactly the same two entries; `git diff fab/project/context.md` is a single-line removal
- [x] A-005 R3: `.vscode/launch.json` parses as JSON and `configurations[0].command` is `cd sites/astro-starlight-terminal1 && pnpm dev`; `name`/`request`/`type` unchanged
- [x] A-006 R4: The rubric has no "Live-site mismatch" blockquote under its H1
- [x] A-007 R4: The rubric's `## Overview`, `## Requirements`, and `## Sidebar Coupling` describe `src/content/docs/tools/<tool>/{overview,readme,commands}.mdx`, root `slug:` overrides, `docsSchema()`, and the hardcoded `astro.config.mjs` sidebar groups with the `docsSiteSidebarItems` spread — and every factual claim matches the live site's files
- [x] A-008 R4: The `/tools`-index parenthetical, `## Bullet Style`, and the two struck-through Design Decisions no longer describe the tailwind shape as current; the strike-through follows the existing `~~…~~` convention and the entries are not deleted
- [x] A-009 R4: `## Overview body shape …` through `## Per-tool GitHub affordance` are unchanged apart from the parenthetical; the frontmatter `description` and `type: memory` are unchanged
- [x] A-010 R5: `git diff sites/astro-starlight-terminal1/src/styles/terminal.css` shows exactly two changed comment lines and the line count matches the T001 baseline
- [x] A-011 R6: `git grep -n astro-tailwind-terminal1 -- ':!fab/changes' ':!docs/memory/conventions/log*.md' ':!sites/_playground'` prints nothing

### Behavioral Correctness

- [x] A-012 R5: `pnpm build` in `sites/astro-starlight-terminal1` exits 0 on the branch

### Removal Verification

- [x] A-013 R4: The rubric contains no `../site/astro-config.md` link and no reference to `src/data/tools.ts`, `src/content/tools/`, or the `tools` zod schema

### Scenario Coverage

- [x] A-014 R4: The R4 grep's only hits are inside the two struck-through DD titles

### Edge Cases & Error Handling

- [x] A-015 R2: No file outside the intended set (`README.md`, `fab/project/context.md`, `.vscode/launch.json`, the rubric, `terminal.css`, the deleted tree, this change folder) appears in `git status --short`

### Code Quality

- [x] A-016 Pattern consistency: rubric prose follows the file's existing conventions — bundle-relative `/conventions/...` links for memory cross-refs, `(change-id)` provenance citations, no change-ids in headings, no transition narration ("no longer", "previously") in the rewritten body text
- [x] A-017 No unnecessary duplication: the rewritten rubric sections point at existing sections/memories (`3ke3` root namespace, `docs-site-tree`, seo-social-meta, the two `## Overview body shape` sections) rather than restating them
- [x] A-018 Readability over cleverness: the reconciled sections read as present-truth statements of the live site, not as a diff against the old one

## Notes

- Check items as you review: `- [x]`
- All acceptance items must pass before `/fab-continue` (hydrate)
- If an item is not applicable, mark checked and prefix with **N/A**: `- [x] A-NNN **N/A**: {reason}`

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Certain | Rubric `## Bullet Style` retargets at the overview's hand-authored bullet lists generically rather than being deleted | The bold-claim — em-dash — explanation pattern still applies to the live `## How it fits` / `## Where to next` bullets; intake §5(f) said reconcile minimally | S:70 R:95 A:85 D:75 |
| 2 | Confident | `pnpm install --frozen-lockfile` precedes `pnpm build` in T007 so the build proves the branch, not a stale `node_modules` | Standard for a pnpm-managed site; intake §8.3 says `pnpm install && pnpm build` | S:65 R:95 A:90 D:80 |
| 3 | Certain | Superseded DD notes cite `moju` (InstallOneLiner replaces the brew block) and `bees` + `4s3e` (job-framed lead replaces "At a glance") | Both changes are already documented in the same file's body | S:80 R:95 A:90 D:85 |

3 assumptions (2 certain, 1 confident, 0 tentative).
