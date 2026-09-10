# Intake: Delete the unused tailwind site variant and sweep its references

**Change**: 260910-aq00-delete-unused-tailwind-site
**Created**: 2026-09-10

## Origin

Created promptless (deferred questioning) by `/fab-proceed`'s create-new dispatch from a description synthesized out of the live conversation. No questions were asked; every decision below was either established in that conversation (and re-verified at intake) or graded as an assumption. The user's words:

> Delete the unused website folder from sites/ (we have kept it long enough), and remove its references from docs and memory.

Facts established by the orchestrator in the conversation and **re-verified at intake** (this worktree, `main`-based branch `benign-manatee`):

- The unused folder is **`sites/astro-tailwind-terminal1/`** — 42 tracked files (`git ls-files` count). It was the previously-live build; its last substantive commits were the ai.shll.in → shll.ai migration (`7850302`, `3f87350`). The live site per `SITE_DIR` in `.github/workflows/deploy.yml` (line 20) is `sites/astro-starlight-terminal1`, swapped in commit `fbb046f` (2026-05-31).
- `sites/_playground/` (containing `starlight-terminal/`) **stays** — the user asked about the one unused site folder, and playground experiments are protected by Constitution II/III.
- The full reference sweep (`git grep -n astro-tailwind-terminal1`, excluding `fab/changes`, the memory changelogs, `sites/_playground`, and the folder itself) returns exactly **six lines in five files**: `.vscode/launch.json:5`, `README.md:14`, `fab/project/context.md:12`, `docs/memory/conventions/tool-page-rubric.md:7`, and `sites/astro-starlight-terminal1/src/styles/terminal.css:1` + `:462`.
- `docs/memory/build-deploy/*` was checked for "tailwind" / "variant": **no hits describing the `sites/` layout** (the two "variant" matches in `deployment.md` are the phrase "live-corpus invariants" — unrelated). No build-deploy memory changes.
- `fab/backlog.md` has no entry for this work; no non-archived change covers it (gap analysis clean).

## Why

1. **The pain point.** The repo carries a dead site variant — a full Astro + Tailwind project with its own `pnpm-lock.yaml`, seven tool content files, components, and a per-site `docs/memory/site/` tree — that has not been deployed since 2026-05-31 and has received no work since the domain migration. It is a 42-file distraction for anyone reading the repo, and it keeps a stale mental model alive in three places that *describe* the repo: the README layout tree, `fab/project/context.md`, and the `tool-page-rubric` memory file, whose body still documents the dead site's single-page tool shape behind a "Live-site mismatch — read first" warning that has been deferring its own reconciliation for over three months.

2. **The consequence of not fixing it.** Every agent that loads `tool-page-rubric.md` (it is in the always-load memory landscape via `conventions/index.md`) first has to parse a paragraph explaining that the next ~30 lines are wrong, then reason about which sections are live. The `.vscode/launch.json` "Development server" config silently runs the *dead* site. The README tells a newcomer there are two competing builds when there is one live build plus a playground. Left alone, the drift only grows — the mismatch note itself is already stale (it lists `install`/`workflows` pages that change `ng8c` removed).

3. **Why this approach.** Delete via `git rm -r` (history keeps the code; Constitution IV/II say nothing needs preserving in-tree), then do the *narrow* reference sweep the grep identifies — and, because the deletion removes the thing the rubric's dead sections describe, take the long-deferred reconciliation of those specific sections to the live Starlight truth *now* rather than replacing one mismatch note with another. Historical records (`fab/changes/**`, memory `log.md` changelogs) and playground provenance comments are left verbatim: they describe what *was*, and rewriting history is not cleanup.

## What Changes

### 1. Delete `sites/astro-tailwind-terminal1/`

```sh
git rm -r sites/astro-tailwind-terminal1/
```

Removes all 42 tracked files: `README.md`, `astro.config.mjs`, `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `src/**` (components, layouts, pages, `content/tools/*.md`, `content.config.ts`, `data/tools.ts`, `diagrams/loop.mmd`, `styles/global.css`), `public/**` (CNAME, favicons, logo, og-image, robots.txt, loop diagrams), and its per-site `docs/memory/site/{index,astro-config,diagrams,site-architecture,styling}.md`. Nothing outside the folder imports from it (the sweep confirms the only cross-references are the six comment/doc lines below). `sites/_playground/` is untouched.

### 2. `README.md` — drop the tree row

Current (line 14 inside the `## Layout` code block):

```
sites/
├── astro-starlight-terminal1/  # currently live at shll.ai
├── astro-tailwind-terminal1/   # alternate build (previously live)
└── _playground/                # scratch space for new experiments
```

Target: remove the `astro-tailwind-terminal1/` row only. Line 9 ("This repo hosts multiple website variants under `sites/`. One is the live build; the others are experiments.") still holds with `_playground/` present and is left as-is. The `## Run the live site locally` section already targets the Starlight site.

### 3. `fab/project/context.md` — drop the tree row

Current (line 12 in `## Repo layout`):

```
├── astro-tailwind-terminal1/   # variant (not deployed)
```

Target: remove the row. The surrounding text ("the repo hosts multiple self-contained website variants under `sites/`") still holds with `_playground/`. No other context.md edit — the per-site memory note ("typically a `README.md` and `docs/memory/site/` under the site root") is a convention statement, not a claim about the deleted folder.

### 4. `.vscode/launch.json` — repoint the only launch config at the live site

Current:

```json
"command": "cd sites/astro-tailwind-terminal1 && ./node_modules/.bin/astro dev",
```

Target: point at `sites/astro-starlight-terminal1`, using the site's own `dev` script (its `package.json` defines `"dev": "astro dev --host 0.0.0.0"` and the site is pnpm-managed — README says `pnpm dev`):

```json
"command": "cd sites/astro-starlight-terminal1 && pnpm dev",
```

Verified at intake: `astro` is a direct dependency of the live site (`"astro": "^6.3.3"`), so the literal `./node_modules/.bin/astro dev` form would also work after `pnpm install`; `pnpm dev` is preferred because it is the documented entry point and carries the `--host` flag the site relies on for run-kit/Tailscale access. The file MUST remain valid JSON; keep the `name`/`request`/`type` fields unchanged.

### 5. `docs/memory/conventions/tool-page-rubric.md` — reconcile the dead-site sections to the live Starlight site

This is the one memory file that describes the deleted site, and this change makes its long-deferred reconciliation due. **Scope of the rewrite** — only the sections that describe the dead site; everything from `## Overview body shape: site-authored framing + cross-tool linking (change bees)` (line 35) onward is already Starlight-aware and is left alone except for the specific stale spots listed under (e) and (f):

**(a) Delete the "Live-site mismatch — read first" blockquote (line 7) entirely.** With the site gone and the body reconciled, there is no mismatch to warn about. Do not replace it with another note.

**(b) Rewrite `## Overview` (lines 9–13)** to describe the live structure, verified at intake:

- Every tool lives at `src/content/docs/tools/<tool>/` in the live site with exactly three pages — `overview.mdx` (hand-authored), `readme.mdx` (synced README slice), `commands.mdx` (generated command reference). `ls src/content/docs/tools/*/` at intake shows exactly `commands.mdx overview.mdx readme.mdx` for all seven tools (idea, hop, fab-kit, wt, run-kit, tu, shll) — no `install`/`workflows` files (removed by `ng8c`).
- The pages are served at the **root** namespace via Starlight `slug:` frontmatter overrides (change `3ke3`): `/<tool>` (overview), `/<tool>/readme`, `/<tool>/commands`. Old `/tools/<tool>/*` URLs are redirects (already documented in § Per-tool pages are canonical at the root namespace — link to it, don't duplicate).
- A tool's pulled `docs/site/**` tree renders as additional per-tool pages via the dynamic route (see `docs-site-tree` memory — pointer, not duplication).
- Keep the framing sentence that the rubric is deliberately short and that each `overview.mdx` is a directory entry whose depth lives on the synced sibling pages (this is the `4s3e` stance the body already documents).

**(c) Rewrite `## Requirements` (lines 15–33).** Replace items 1–5 (which describe the dead single-page shape: `tools` zod schema, opening paragraph, `## Install` brew block, `## At a glance`, `## Full docs`) with the live per-tool contract:

1. **Frontmatter** — validated by Starlight's `docsSchema()`; `src/content.config.ts` in the live site is exactly `docs: defineCollection({ loader: docsLoader(), schema: docsSchema() })`. Required per page: `title` (the bare tool slug on the overview — the `kb1r` title discipline already documented in § Overview body shape), `description` (hand-authored, SEO-optimized — change `bees`, pointer to seo-social-meta), and the `slug:` override (`<tool>`, `<tool>/readme`, `<tool>/commands`).
2. **Three pages per tool** — `overview.mdx`, `readme.mdx` (`<ReadmeSlice tool="<slug>" />`), `commands.mdx` (generated). The overview body shape is defined by the two `## Overview body shape` sections that follow (`bees`: `<GithubButton>` + job-framed lead + `## How it fits` + nav links; `moju`: `## Install` via `<InstallOneLiner>` + `## Screenshots`) — reference them rather than restating.
3. **Roster registration** — a new tool is not live until the hand-listed roster places are updated (pointer to the "Adding an 8th tool" bullet under § `/tools` index page and § Root-namespace reservation — do not duplicate the list).

Keep the existing "Tool pages SHALL NOT contain **hand-written**: …" list and the `w32m`/`4s3e` stance blockquotes (lines 21–33) — they are live and Starlight-aware.

**(d) Rewrite `## Sidebar Coupling` (lines 273–275)** to describe the live mechanism: the sidebar is **hardcoded in `astro.config.mjs`** — each tool is a `collapsed: true` group with three `slug:` entries (`<tool>`, `<tool>/readme`, `<tool>/commands`) plus a `...docsSiteSidebarItems('<tool>')` spread that appends the tool's pulled docs/site pages at build time. There is no `src/data/tools.ts`; adding a tool means adding a sidebar group *and* editing the roster places listed under "Adding an 8th tool". Drop the dangling link to `../site/astro-config.md` (that path does not exist at `docs/memory/site/`; it pointed into the deleted site's per-site memory).

**(e) Line 142 parenthetical** — currently: `(Contrast [Sidebar Coupling](#sidebar-coupling) below, which describes the *non-live* tailwind site's `tools.ts` mechanism.)`. Reword so it no longer names the dead site, e.g. `(See [Sidebar Coupling](#sidebar-coupling) below for how the per-tool groups are hardcoded in `astro.config.mjs`.)`.

**(f) Three residual dead-site spots later in the file** (found at intake; the orchestrator's "already Starlight-aware from bees onward" premise does not hold for these): `## Bullet Style` (lines 263–271) opens with `Bullets in the "At a glance" section MUST use the pattern…` — the live overview has no `## At a glance` section; and two `## Design Decisions` entries describe the dead shape: **"Brew install line in every page"** (the live overview's `## Install` is the `moju` curl one-liner via `<InstallOneLiner>`, not a `brew install` block) and **"`At a glance`, not `Usage`."** Reconcile minimally, matching the file's existing convention for superseded decisions (the `~~Short pages, not deep docs.~~` strike-through + "revised" note pattern): retarget Bullet Style at the overview's hand-authored bullets generically (the `## How it fits` list), and strike through the two dead DDs with a one-line "superseded by `moju` / `bees`" note. Do not delete them — the DD section is the file's decision history.

**(g) Frontmatter `description`** — leave unchanged; the rewrite does not change what the file covers (it already describes the live Starlight page shape). Verify at apply that nothing in the rewritten sections introduces coverage the description lacks.

After the rewrite, `grep -n 'astro-tailwind-terminal1\|src/content/tools/\|src/data/tools.ts\|tools\` zod' docs/memory/conventions/tool-page-rubric.md` MUST return nothing.

### 6. `sites/astro-starlight-terminal1/src/styles/terminal.css` — reword two provenance comments

Current:

```css
/* terminal.css — port of astro-tailwind-terminal1's aesthetic to Starlight.        (line 1)
/* Blinking cursor — reuses the @keyframes from astro-tailwind-terminal1. */        (line 462)
```

Target — no live file names a now-nonexistent path; keep the provenance:

```css
/* terminal.css — port of the retired tailwind variant's terminal aesthetic to Starlight.
/* Blinking cursor — @keyframes carried over from the retired tailwind variant. */
```

Comment-only edits; no selector, property, or value changes. The orchestrator flagged this as a judgment call — recorded as a Confident assumption below.

### 7. Explicitly out of scope

- `fab/changes/**` (all intake/plan history, including `archive/`) — historical records, never rewritten.
- `docs/memory/conventions/log.md`, `log.seed.md`, `docs/memory/build-deploy/log*.md` — memory changelogs are history (hydrate appends a new entry; it does not edit old ones).
- `sites/_playground/starlight-terminal/README.md` (line 3) and its `src/styles/terminal.css` (lines 1, 398) — playground experiments are untouched (Constitution II/III); their mentions are provenance.
- `fab/project/constitution.md` — no amendment. Multi-Site Isolation (II) and One Live Site (III) still hold with `_playground/` present. `fab/project/config.yaml`'s description ("multi-site repo (live build under sites/, experiments in sites/_playground/)") also still holds.
- No `SITE_DIR` change, no `.github/workflows/*` change. `ci.yml`, `refresh-help.yml`, `refresh-readme.yml` do not reference the deleted folder.

### 8. Verification the plan MUST demand

1. `git grep -n astro-tailwind-terminal1 -- ':!fab/changes' ':!docs/memory/conventions/log*.md' ':!sites/_playground'` returns **nothing**.
2. `git ls-files sites/astro-tailwind-terminal1 | wc -l` returns `0`; `git ls-files sites/_playground | wc -l` is unchanged from before apply.
3. The live site still builds: `cd sites/astro-starlight-terminal1 && pnpm install && pnpm build` (only comments changed there — a green build is the regression proof). `node --test scripts/*.test.mjs` may be run as a bonus but is not required (no script changed).
4. `.vscode/launch.json` parses: `node -e 'JSON.parse(require("fs").readFileSync(".vscode/launch.json","utf8"))'`.
5. The rubric-specific grep in §5 returns nothing, and `fab docs-index` regenerates `docs/memory/conventions/index.md` without a description change.

## Affected Memory

- `conventions/tool-page-rubric`: (modify) The dead-site sections are rewritten to the live Starlight truth — mismatch blockquote removed; `## Overview`, `## Requirements` items 1–5, `## Sidebar Coupling`, the line-142 parenthetical, `## Bullet Style`, and two dead Design Decisions reconciled (§5 above). **This rewrite is apply-stage work, not hydrate work** — it is part of the user's deliverable and the review-stage grep (§8.1) must already pass. Hydrate re-runs `fab docs-index` (frontmatter description expected unchanged, so the index row should not move) and appends the `conventions/log.md` entry recording the reconciliation.
- `build-deploy/*`: no change (checked — nothing there describes the `sites/` layout).

## Impact

- **Deleted**: `sites/astro-tailwind-terminal1/` — 42 tracked files. `true_impact` will show a large deletion; `sites/astro-tailwind-terminal1/` is not in `true_impact_exclude`, so the net will be strongly negative — expected and correct.
- **Repo docs**: `README.md` (1 line), `fab/project/context.md` (1 line).
- **Editor config**: `.vscode/launch.json` (1 line).
- **Memory**: `docs/memory/conventions/tool-page-rubric.md` — the largest edit (the ~30-line head plus § Sidebar Coupling, one parenthetical, § Bullet Style lead-in, two DD strike-throughs); `conventions/index.md` regenerated at hydrate.
- **Live site**: two CSS comment lines in `src/styles/terminal.css`. No runtime, build, or rendered-output change; Constitution I/V/VI unaffected. No dependency changes.
- **CI/Deploy**: none. `deploy.yml` `SITE_DIR` unchanged; the deletion does not touch any workflow path.
- **Constitution**: no amendment. II and III remain satisfied; the repo remains multi-site (live + `_playground/`).
- **Change type**: `chore` — the primary act is deleting a tracked directory plus housekeeping of the places that pointed at it; `docs` would misclassify the deletion. (Both types are on the review parsimony-pass skip list, so the choice does not alter review behavior.)

## Open Questions

- None. Every residual choice (launch config form, comment wording, the three residual rubric spots) has a clear front-runner and is graded Confident below; none is a genuine unknown requiring the user.

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Certain | Delete exactly `sites/astro-tailwind-terminal1/` (42 tracked files) via `git rm -r`; `sites/_playground/` stays | User's words name "the unused website folder"; orchestrator verified `SITE_DIR` = starlight since `fbb046f`; playground is protected by Constitution II/III | S:90 R:85 A:95 D:90 |
| 2 | Certain | Change type `chore` (not `docs`) | Primary act is a tracked-directory deletion + housekeeping; both types skip the parsimony pass, so no review-behavior difference | S:70 R:95 A:85 D:65 |
| 3 | Certain | `README.md`: remove only the tree row; keep line 9 ("the others are experiments") | Sentence still true with `_playground/`; orchestrator confirmed | S:90 R:95 A:95 D:90 |
| 4 | Certain | `fab/project/context.md`: remove only the tree row | Same as #3; per-site memory note is a convention statement, not a claim about the deleted folder | S:90 R:95 A:95 D:90 |
| 5 | Confident | `.vscode/launch.json` repointed to the live site with `cd sites/astro-starlight-terminal1 && pnpm dev` (the site's `dev` script) rather than `./node_modules/.bin/astro dev` | Orchestrator said repoint and verify the astro binary path; verified `astro` is a direct dep so either form works — `pnpm dev` is the README-documented entry and carries `--host 0.0.0.0` | S:65 R:95 A:85 D:60 |
| 6 | Certain | Rubric: delete the mismatch blockquote; rewrite `## Overview`, `## Requirements` 1–5, `## Sidebar Coupling`, and the line-142 parenthetical to the live Starlight truth; leave the `bees`-onward Starlight-aware sections alone | Orchestrator specified this scope explicitly; deletion makes the deferred reconciliation due | S:90 R:80 A:85 D:80 |
| 7 | Certain | Live structure described as verified at intake: `tools/<tool>/{overview,readme,commands}.mdx` only (no install/workflows), root slugs via `slug:` overrides (`3ke3`), `docsSchema()` in `content.config.ts`, sidebar hardcoded in `astro.config.mjs` with `docsSiteSidebarItems` spread, no `src/data/` | Read `astro.config.mjs`, `content.config.ts`, and `ls src/content/docs/tools/*/` at intake | S:85 R:90 A:95 D:90 |
| 8 | Confident | Rubric §5(f): also reconcile the three residual dead-site spots after line 35 — `## Bullet Style`'s "At a glance" lead-in and the two dead Design Decisions ("Brew install line in every page", "`At a glance`, not `Usage`") — via the file's existing strike-through/superseded convention, not deletion | Orchestrator's "already Starlight-aware from `bees` onward" premise does not hold for these three spots; leaving them after removing the mismatch note would leave the file self-inconsistent. Minimal, history-preserving, memory-only edit | S:50 R:90 A:75 D:55 |
| 9 | Certain | Rubric frontmatter `description` left unchanged | Rewrite does not change coverage; orchestrator expected this | S:70 R:95 A:80 D:75 |
| 10 | Confident | `terminal.css` lines 1 and 462: reword to "the retired tailwind variant" so no live file names a nonexistent path; comment-only | Orchestrator flagged as a judgment call and asked it be treated in scope; alternatives (leave / delete the comments) are reasonable but weaker | S:70 R:95 A:75 D:60 |
| 11 | Certain | Rubric rewrite happens at **apply**, not hydrate; hydrate only regenerates `conventions/index.md` and appends the log entry | The review-stage grep (§8.1) must pass before hydrate; the memory edit is the user's deliverable, not a side effect | S:75 R:90 A:90 D:80 |
| 12 | Certain | Out of scope: `fab/changes/**`, memory `log*.md`, `sites/_playground/**`, constitution, config.yaml, all workflows / `SITE_DIR` | Orchestrator enumerated; Constitution II/III and config description still hold with `_playground/` present | S:90 R:90 A:90 D:90 |
| 13 | Certain | Verification set: exclusion-scoped `git grep` returns nothing; live `pnpm build` green; `launch.json` valid JSON; rubric-specific grep clean | Orchestrator specified; all mechanical | S:85 R:95 A:90 D:85 |
| 14 | Certain | No `build-deploy/*` memory change | Grepped for "tailwind"/"variant" at intake — only the unrelated phrase "live-corpus invariants" matched | S:80 R:95 A:95 D:90 |

14 assumptions (11 certain, 3 confident, 0 tentative, 0 unresolved).
