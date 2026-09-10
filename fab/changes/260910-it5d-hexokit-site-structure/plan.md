# Plan: HexoKit site structure

**Change**: 260910-it5d-hexokit-site-structure
**Intake**: `intake.md`

> Path shorthand: `site/` = `sites/astro-starlight-terminal1/` (the live site per `SITE_DIR` in `.github/workflows/deploy.yml`). Everything else is repo-root relative. Source-side names (`repo`/`formula`/`binary`) stay `run-kit` throughout — only the site's slug, URL mount, and identity change (plan D7; source flips in X1).

## Requirements

### Roster: one site-authored tool roster

#### R1: A single roster module carries every tool's four names
The live site SHALL have exactly one roster, `site/src/lib/tool-roster.mjs` (plain ESM so `astro.config.mjs` and `docs-site-sidebar.mjs` can import it at config-eval time), exporting `TOOL_ROSTER` — one record per tool with `slug`, `label`, `mount`, `repo`, `formula`, `binary`, and optional `legacyMounts` — plus the helpers `mountFor(slug)`, `slugForMount(segment)` (null when not a tool mount), `repoFor(slug)`, `labelFor(slug)`, `isToolSlug(slug)`, `isToolMount(segment)`, and the derived `TOOL_SLUGS` (display order). `site/src/lib/tool-slugs.ts` SHALL become a typed re-export of that module (keeping its existing `TOOL_SLUGS`/`isToolSlug`/`ToolSlug` exports so current imports compile). No consumer MAY hardcode `/<slug>/`, `sahil87/<slug>`, or a private roster array after this change.

- **GIVEN** the `hexokit` record `{ slug: 'hexokit', label: 'HexoKit', mount: 'docs', repo: 'run-kit', formula: 'run-kit', binary: 'run-kit', legacyMounts: ['run-kit'] }`
- **WHEN** a consumer asks `mountFor('hexokit')`, `slugForMount('docs')`, `repoFor('hexokit')`, `slugForMount('toolkit')`
- **THEN** it gets `'docs'`, `'hexokit'`, `'run-kit'`, `null`
- **AND** `grep -rn "sahil87/\${" site/src` and `grep -rn "ROSTER\b\|TOOLS = \[" site/src` show no remaining private rosters (the terminal island's internal `TOOLS` const is the one documented exception, see R21)

#### R2: Display order is product first, then the hexagon order
`TOOL_ROSTER` order SHALL be `hexokit, fab-kit, wt, idea, tu, hop, shll`, and every iterating surface (sidebar Tools group, `ToolsIndex`, `VersionTable`, llms endpoints) SHALL follow it.

- **GIVEN** the built site
- **WHEN** `/toolkit/`'s tool listing and `/llms.txt`'s Toolkit bullets are read
- **THEN** companions appear as fab-kit, wt, idea, tu, hop, shll

### URL scheme: the product at `/docs/`, companions at root

#### R3: The product's pulled data is keyed `hexokit`
`help/run-kit.json` SHALL be renamed `help/hexokit.json` and `content/run-kit/` renamed `content/hexokit/` (both via `git mv`, contents byte-identical). No `help/run-kit.json` and no `content/run-kit/` MAY remain.

- **GIVEN** the repo after apply
- **WHEN** `ls help content`
- **THEN** `help/hexokit.json` and `content/hexokit/{README.md,site/**}` exist, `help/run-kit.json` and `content/run-kit/` do not
- **AND** `help/hexokit.json`'s envelope `tool` field is still `"run-kit"` (the binary — the fab-kit/`fab` precedent)

#### R4: HexoKit pages mount at `/docs/`
The `hexokit` overview/readme/commands stubs SHALL live at `site/src/content/docs/tools/hexokit/{overview,readme,commands}.mdx` with `slug: docs`, `slug: docs/readme`, `slug: docs/commands` and `tool="hexokit"` props. The dynamic docs/site route SHALL be renamed `site/src/pages/[mount]/[...path].astro`; `getStaticPaths` SHALL emit `params: { mount: mountFor(page.slug), path }` and pass `slug` as a prop for the disk read; `rewriteDocsSiteLinks` SHALL receive the **mount** as the site-absolute root. `docsSiteSidebarItems(slug)` SHALL link to `/<mount>/<path>`. The route-id gates in `commands-toc.ts` / `readme-toc.ts` SHALL accept a mount segment and return the slug via `slugForMount`.

- **GIVEN** `content/hexokit/site/install.md` and `content/hexokit/site/skill/mux.md`
- **WHEN** `pnpm build`
- **THEN** `dist/docs/index.html`, `dist/docs/readme/index.html`, `dist/docs/commands/index.html`, `dist/docs/install/index.html`, `dist/docs/skill/mux/index.html` exist
- **AND** a relative link `./boards.md` inside a HexoKit docs page renders as `/docs/boards/`
- **AND** the right-rail ToC on `/docs/commands/` lists HexoKit's first-level commands and on `/docs/readme/` the README headings

#### R5: Companions are unchanged at their root slugs
For `fab-kit`, `wt`, `idea`, `tu`, `hop`, `shll` the emitted page set (`/<slug>/`, `/<slug>/readme/`, `/<slug>/commands/`, `/<slug>/<docs-site-path>/`) and the `/tools/<slug>/*` reverse redirects SHALL be identical to today's build.

- **GIVEN** the pre-change and post-change `dist/`
- **WHEN** the two sets of `dist/<companion>/**/index.html` paths are compared
- **THEN** they are identical for all six companions

#### R6: Every retired path redirects statically
`astro.config.mjs` `redirects:` SHALL enumerate (static `<meta refresh>` stubs — Astro static builds cannot wildcard): `/run-kit`, `/run-kit/readme`, `/run-kit/commands`, and `/run-kit/<each committed hexokit docs-site page>` → `/docs/…/` (generated from `legacyMounts` by the same collector that lists the sidebar); the existing `/tools/<slug>{,/overview,/readme,/commands,/<docs-site page>}` set → `/<mount>/…/` (now roster-driven); `/tools` → `/toolkit/`; `/getting-started/overview` and `/toolkit/overview` → `/toolkit/`; `/getting-started/install` → `/toolkit/install/`; `/getting-started/philosophy` → `/toolkit/philosophy/`; `/workflows/daily-flow` → `/toolkit/daily-flow/`; `/workflows/new-change` → `/toolkit/new-change/`.

- **GIVEN** the built site
- **WHEN** `dist/run-kit/index.html`, `dist/run-kit/install/index.html`, `dist/tools/run-kit/readme/index.html`, `dist/tools/index.html`, `dist/getting-started/install/index.html`, `dist/workflows/daily-flow/index.html` are read
- **THEN** each is a redirect stub whose `<meta http-equiv="refresh">` target is respectively `/docs/`, `/docs/install/`, `/docs/readme/`, `/toolkit/`, `/toolkit/install/`, `/toolkit/daily-flow/`
- **AND** the build does not fail on a redirect key colliding with a real route (so `tools/index.mdx` is gone and `/tools/` is only a redirect)

#### R7: `/toolkit/` absorbs Getting started + Workflows, reframed
The pages SHALL move (git mv) to `site/src/content/docs/toolkit/`: `index.mdx` (`/toolkit/`, from `getting-started/overview.md`, rendering `<ToolsIndex />` for the family listing), `install.md`, `philosophy.md`, `daily-flow.md`, `new-change.md`. Prose SHALL be reframed from "seven CLIs"/"the shll toolkit" to "HexoKit and the six tools around it"/"the HexoKit toolkit": the overview's chain reads `idea → fab-kit → wt → HexoKit`, lists the six companions with one line each linking to `/<mount>/`, adds a Desktop line linking to `/desktop/`, and drops the stale "What's not on this site" section. Command tokens and the install one-liner text (`https://shll.ai/install`) SHALL be unchanged (S5 owns D10). `site/src/content/docs/tools/index.mdx` SHALL be removed. Every hand-written command/flag token MUST exist in the corresponding `help/<slug>.json` (vn39 hard rule).

- **GIVEN** the built site
- **WHEN** `/toolkit/`, `/toolkit/install/`, `/toolkit/philosophy/`, `/toolkit/daily-flow/`, `/toolkit/new-change/` are rendered
- **THEN** each exists, none contains the phrases "seven small CLIs", "shll toolkit", or "seven CLIs", and `/toolkit/` links to `/docs/`, all six companions, and `/desktop/`
- **AND** `grep -rn 'shll.ai/install' site/src/content/docs/toolkit/install.md` still matches (unchanged one-liner)

#### R8: A thin `/desktop/` page exists
`site/src/content/docs/desktop.md` (`/desktop/`, title `Desktop app`) SHALL carry: one paragraph derived from run-kit's README § "Desktop app (macOS)" (a native Electron shell around the dashboard that frees the browser-reserved `⌘` tier; installed and updated with `run-kit desktop install` / `run-kit desktop update` / `run-kit desktop status` — tokens present under `desktop` in `help/hexokit.json`), a link to `https://github.com/sahil87/run-kit/releases`, and a link to `/docs/install/#desktop-app-macos`. No images.

- **GIVEN** the built site
- **WHEN** `/desktop/` is rendered
- **THEN** it exists with those three elements and every `run-kit desktop …` token appears in `help/hexokit.json`

### Navigation and chrome

#### R9: Header nav reads `Docs · Toolkit · Desktop · GitHub`
A new `site/src/components/HeaderNav.astro` SHALL override Starlight's `SocialIcons` slot (`components.SocialIcons` in `astro.config.mjs`) and render four text links: `Docs` → `/docs/`, `Toolkit` → `/toolkit/`, `Desktop` → `/desktop/`, `GitHub` → `https://github.com/sahil87/${repoFor('hexokit')}`. It SHALL use the `--c-*` tokens (dark-mode parity), carry a visible `:focus-visible` ring, and be hidden on mobile exactly as Starlight hides the social icons (the sidebar carries the same destinations). `social:` in the Starlight config SHALL be removed/emptied; the Discord link SHALL move to `Footer.astro`'s `·`-separated row.

- **GIVEN** any built page ≥ md width
- **WHEN** the header is rendered
- **THEN** the four links appear in that order with those hrefs, and no Discord/GitHub icon is in the header
- **AND** the footer row contains a `Discord` link to `https://discord.gg/32XHh5mJYn`

#### R10: Sidebar and site title follow the new structure
`astro.config.mjs` SHALL set `title: 'HexoKit'`, `description: 'Your tmux, in the browser and on your phone.'`, drop the `TOOL_SLUGS` config-eval copy in favor of the roster import, and define the sidebar: **Docs** (Overview `docs`, Readme `docs/readme`, Commands `docs/commands`, `...docsSiteSidebarItems('hexokit')`), **Toolkit** (Overview `toolkit`, Install, Philosophy, Daily flow, Start a new change, Desktop app `desktop`), **Tools** (one collapsed group per companion in roster order, each Overview/Readme/Commands + `...docsSiteSidebarItems(slug)`), **Reference** (Command index).

- **GIVEN** the built site
- **WHEN** the sidebar HTML of `/docs/` is read
- **THEN** the top-level groups are Docs, Toolkit, Tools, Reference in that order and the Tools group lists fab-kit, wt, idea, tu, hop, shll

### Identity: JSON-LD, OG, favicon, footer

#### R11: Structured data and social metadata name HexoKit
`site/src/components/Head.astro` SHALL: set `ogImageAlt` to `HexoKit — your tmux, in the browser and on your phone`; emit the homepage graph `WebSite { name: 'HexoKit' }` + `SoftwareApplication { name: 'HexoKit', description: 'Your tmux, in the browser and on your phone.', url: https://github.com/sahil87/<repoFor('hexokit')> }`; gate the per-tool branch on `isToolMount(firstSegment)` and resolve `slug = slugForMount(...)`, using `labelFor(slug)` as `SoftwareApplication.name` and `repoFor(slug)` for `url`; and emit breadcrumbs `Home › Docs [› Readme|Commands]` for `hexokit` and `Home › Toolkit (→ /toolkit/) › <label> [› page]` for companions. `site/src/content/docs/index.mdx` frontmatter `head:` SHALL set `<title>` and `og:title` to `HexoKit — your tmux, in the browser and on your phone` (keep `og:type=website`); its body SHALL only be retargeted (`/run-kit/` → `/docs/`, the `Explore the tools` action and `all tools →` chip → `/toolkit/`), copy untouched.

- **GIVEN** the built `dist/index.html`, `dist/docs/index.html`, `dist/wt/readme/index.html`
- **WHEN** their `application/ld+json` blocks are parsed
- **THEN** the homepage graph names `HexoKit` twice and links `github.com/sahil87/run-kit`; `/docs/` carries `SoftwareApplication.name == 'HexoKit'` with breadcrumbs Home › Docs; `/wt/readme/` carries breadcrumbs Home › Toolkit › wt › Readme with the Toolkit crumb at `/toolkit/`
- **AND** `dist/index.html` contains no `href="/run-kit/"` and no `href="/tools/"` on the tool chips/actions

#### R12: The OG card is regenerated for HexoKit
`site/scripts/generate-og-image.mjs` SHALL render wordmark `hexokit`, tagline `Your tmux, in the browser and on your phone.`, site `hexokit.com`, and `public/og-image.png` SHALL be regenerated (1200×630) with the Playwright headless shell the script auto-discovers under `~/.cache/ms-playwright/`.

- **GIVEN** `node scripts/generate-og-image.mjs` has run
- **WHEN** `public/og-image.png` is inspected
- **THEN** it is 1200×630 and `git status` shows it modified

#### R13: The favicon is a verified no-op
`public/favicon.svg`, `public/favicon.ico`, and `src/assets/logo.svg` SHALL be left untouched; the apply worker SHALL verify with `diff` that `site/public/favicon.svg` and `/home/sahil/code/sahil87/run-kit/assets/logo.svg` are identical (ignoring the site file's "Mirrored verbatim" comment line) and record the result in `## Notes`.

- **GIVEN** the diff command
- **WHEN** it runs
- **THEN** it reports identical and no favicon/logo file is in the change's diff

#### R14: Repo-identity strings on the site point at hexokit
`Footer.astro`'s LICENSE link SHALL be `https://github.com/sahil87/hexokit-site/blob/main/LICENSE` and gain the Discord link; `site/src/lib/terminal-share.ts` `SHARE_FOOTER` SHALL read `# replayed from https://hexokit.com` (and its test pin updated); code comments citing `https://shll.ai` as the example `Astro.site` origin (`llms.ts`, `llms.txt.ts`, `llms-full.txt.ts`, `.well-known/security.txt.ts`, `versions.json.ts`, `Head.astro`) SHALL say `https://hexokit.com`.

- **GIVEN** `grep -rn 'shll.ai' site/src --include='*.ts' --include='*.astro' --include='*.mjs'`
- **WHEN** run after apply
- **THEN** the only remaining matches are the install one-liner (`InstallOneLiner.astro`, `toolkit/install.md`) and prose that genuinely refers to the shll.ai site as a distinct thing

### Agent discoverability

#### R15: `/llms.txt` is a HexoKit index
`site/src/pages/llms.txt.ts` SHALL emit: H1 `# HexoKit — your tmux, in the browser and on your phone`; a rewritten one-line summary (HexoKit is a remote console for your tmux — every session and pane as a live terminal, in the browser and on your phone; the HexoKit toolkit adds six companion CLIs for planning, worktrees, backlog, cost, and repo navigation); `## Docs` (bullets for `/docs/`, `/docs/readme/`, `/docs/commands/`, then one per committed HexoKit docs/site page via `collectDocsSitePages`, label = page title, path `/docs/<path>/`); `## Toolkit` (`/toolkit/` pages, `/desktop/`, then one bullet per companion `/<mount>/` with the `root.short` one-liner (fallback: overview `description`, keyed by `slugForMount(entry.id)`)); `## Reference`. All URLs absolute from `Astro.site`.

- **GIVEN** the built `dist/llms.txt`
- **WHEN** read
- **THEN** it starts with the HexoKit H1, its `## Docs` section lists at least the install, boards, notifications, and skill pages with `https://hexokit.com/docs/…` URLs, its `## Toolkit` section lists six companions, and it contains no `shll.ai` URL and no `/run-kit/` path

#### R16: `/llms-full.txt` follows the roster
`site/src/pages/llms-full.txt.ts` SHALL open with `# HexoKit — full content`, iterate `TOOL_ROSTER` (heading = `labelFor(slug)`, README slice from `content/<slug>/`, commands from `help/<slug>.json`), and group MDX as `Toolkit` (`toolkit/*` + `desktop`), `Reference`, `Tool overviews` (entries whose id is a tool mount).

- **GIVEN** the built `dist/llms-full.txt`
- **WHEN** read
- **THEN** the first tool section is `## HexoKit`, a `## Toolkit` group contains the five toolkit pages and the desktop page, and no `getting-started/` or `workflows/` heading remains

### Refresh crons

#### R17: Both cron slug maps carry the `hexokit` entry
`.github/workflows/refresh-help.yml` SHALL map `hexokit:run-kit:run-kit` (replacing `run-kit:run-kit:run-kit`), with its header comment table gaining the row and the four-name rule (slug ≠ formula/binary/repo for hexokit; slug ≠ binary for fab-kit). `.github/workflows/refresh-readme.yml` SHALL map `hexokit:run-kit` in BOTH `tools=(...)` arrays (README step and docs/site step). Identity wording in both headers (`7 toolkit CLIs`, `shll.ai-owned`, `shll.ai side`) SHALL say HexoKit toolkit / hexokit.com. `deploy.yml` and `ci.yml` get comment-only fixes (`served at hexokit.com/install`). No step logic changes. Re-enabling the workflows is a post-merge step (see `## Notes`), not part of apply.

- **GIVEN** the two workflow files
- **WHEN** `grep -n 'run-kit' .github/workflows/refresh-*.yml`
- **THEN** every match is on the formula/binary/repo side of a `hexokit:` triple/pair or in a comment explaining the four-name rule; no `"run-kit:` array entry remains
- **AND** `python3 -c "import yaml,sys; [yaml.safe_load(open(f)) for f in sys.argv[1:]]" .github/workflows/*.yml` parses all four files

### Versions manifest

#### R18: The `run-kit` manifest row survives via an envelope override
`versions-policy.json` SHALL read `"run-kit": { "notify": "minor", "envelope": "hexokit" }` (other entries unchanged). `site/src/lib/versions-manifest.ts` `PolicyEntrySchema` SHALL gain optional `envelope: z.string()` (still `.strict()`), and `buildManifest` SHALL read `help/<entry.envelope ?? key>.json` while keeping the row key and the `formula` default as the policy key. `scripts/versions-manifest.test.mjs` SHALL gain a test for the override.

- **GIVEN** `help/hexokit.json` with version `v3.19.37` and the policy above
- **WHEN** `buildManifest` runs
- **THEN** `tools['run-kit'] == { latest: '3.19.37', notify: 'minor', formula: 'run-kit' }` and no `tools['hexokit']` row exists
- **AND** `dist/versions.json` after build contains a `run-kit` row

### Tests, build, repo identity

#### R19: Tests and build are green with the new shape
`scripts/extract-readme.test.mjs` (`loadHelp('run-kit')` → `'hexokit'`), `scripts/llms.test.mjs` (`TOOLS` expectation → roster order), `scripts/refresh-help-fixtures.mjs` (`doc: 'run-kit'` → `'hexokit'`; the fixture's command path `run-kit riff` stays), `scripts/terminal-share.test.mjs` (footer pin) SHALL be updated; new `scripts/tool-roster.test.mjs` SHALL cover the helpers and the legacy-mount redirect enumeration. `node --test scripts/*.test.mjs`, `node scripts/validate-help.mjs`, and `pnpm build` MUST all pass.

- **GIVEN** the site dir after apply
- **WHEN** the three commands run
- **THEN** all exit 0 and the build emits `dist/docs/index.html`, `dist/toolkit/index.html`, `dist/desktop/index.html`, `dist/llms.txt`, `dist/versions.json`

#### R20: Repo-level identity docs describe hexokit-site
`README.md` (title/intro → hexokit-site serving hexokit.com; "currently live at hexokit.com"), `site/README.md` (first line), `site/docs/memory/site/index.md` header ("LIVE hexokit.com build"), `fab/project/config.yaml` (`project.name: hexokit-site`, description), `fab/project/context.md` (rewritten: the product site's three layers, the roster four-name rule pointer, hexokit.com deploy), and `fab/project/constitution.md` PATCH **2.1.4** (rename `shll.ai` → `hexokit.com` in principle III and Tool-Page Depth wording; changelog entry; no principle changes) SHALL be updated.

- **GIVEN** `grep -rln 'shll.ai' README.md fab/project sites/astro-starlight-terminal1/README.md`
- **WHEN** run after apply
- **THEN** the only matches are historical (constitution changelog entries, context that names shll.ai as the predecessor site)

### Homepage terminal island

#### R21: The terminal island keeps working with a minimal retarget
`site/src/components/TerminalPrompt.astro` SHALL: expose the `hexokit` help payload under both `hexokit` and `run-kit` keys in the build-time `data-terminal-help` payload (so the island's existing `run-kit` card lookups still resolve); make `ROUTE_OVERVIEW/README/COMMANDS` resolve through a serialized `{ slug: mount }` map from the roster (so `cd run-kit` navigates to `/docs/`); and accept `hexokit` as an alias key for the run-kit card, tab-completion, and `play`. Its copy (`shllOS shll.ai`, tour narration, play scripts) SHALL NOT be rewritten — S4 owns the homepage.

- **GIVEN** the built homepage
- **WHEN** the island's `data-terminal-help` JSON is parsed and the `cd run-kit` handler's target is inspected
- **THEN** both `hexokit` and `run-kit` keys carry the same card payload and the navigation target is `/docs/`

### Non-Goals
- Homepage/landing body, hexagon, desktop card design, terminal-island copy — S4.
- Install one-liner URL/default (`shll.ai/install` text) — S5.
- Any source-side rename (`repo`/`formula`/`binary`, `help/hexokit.json` `tool` field, shll roster, shll.ai redirect stub) — C1–C7/X1/X2.
- Substrate identifiers (`rk`, `RK_*`, `@rk_*`, `rk-*`) — never (plan Pickup protocol #3).
- Renaming `public/screenshots/run-kit-*.webp` — asset names, not user-visible.
- Re-enabling the cron workflows — post-merge operator step (`## Notes`).

### Design Decisions

#### One roster module, plain ESM
**Decision**: `site/src/lib/tool-roster.mjs` is the single source of every tool's slug/label/mount/repo/formula/binary; `tool-slugs.ts` is a typed re-export; `astro.config.mjs` and `docs-site-sidebar.mjs` import the `.mjs` directly.
**Why**: HexoKit is the first tool whose slug ≠ URL segment ≠ repo, so the implicit equalities eight consumers assumed must become explicit in one place; `.mjs` is what loads at Astro config-eval time (the `docs-site-sidebar.mjs` precedent).
**Rejected**: keeping `tool-slugs.ts` as the roster plus a hand-synced config-eval copy — the copy is exactly the drift this change removes.
*Introduced by*: 260910-it5d-hexokit-site-structure

#### Manifest key stays the consumer's roster name; `envelope` points at the help file
**Decision**: `versions-policy.json` keys are the consumer-facing roster names (`shll`'s `Name`), with an optional `envelope` naming the `help/<slug>.json` that supplies `latest`.
**Why**: `shll check-updates` matches `manifest.Tools[roster Name]` and the name is `run-kit` until C1; dropping or renaming the row would silently stop update notices for every installed user.
**Rejected**: renaming the row to `hexokit` now (breaks the consumer); keeping `help/run-kit.json` unrenamed (leaves `hexokit` out of the pull pipeline the plan's "one slug change" relies on).
*Introduced by*: 260910-it5d-hexokit-site-structure

#### Header nav through the SocialIcons slot
**Decision**: `HeaderNav.astro` overrides `components.SocialIcons`, rendering the four text links; `social:` is emptied and Discord moves to the footer.
**Why**: Starlight has no nav-links config; overriding the SocialIcons slot is its documented header-links seam and needs no `Header.astro` fork, and it inherits the same mobile hiding.
**Rejected**: a full `Header.astro` override (forks Starlight layout CSS for four links); sidebar-only navigation (the plan names a header nav).
*Introduced by*: 260910-it5d-hexokit-site-structure

#### `/tools/` retires into `/toolkit/`
**Decision**: the `/tools/` directory page is removed and redirects to `/toolkit/`, whose overview renders the same `ToolsIndex` listing.
**Why**: `/tools/` was the seven-tool table the plan deliberately removes from the homepage; the family listing's home is now `/toolkit/`, and a redirect key colliding with a real route fails the Astro build.
**Rejected**: keeping both pages (two directory listings of the same six tools).
*Introduced by*: 260910-it5d-hexokit-site-structure

### Deprecated Requirements

#### `/tools/` directory landing page
**Reason**: superseded by `/toolkit/` (plan § Site shape).
**Migration**: static redirect `/tools` → `/toolkit/`; `ToolsIndex.astro` is reused on `/toolkit/`.

#### `/getting-started/*` and `/workflows/*` route prefixes
**Reason**: the family content lives under `/toolkit/` (D7).
**Migration**: one static redirect per old page (R6).

## Tasks

### Phase 1: Setup

- [x] T001 Create `site/src/lib/tool-roster.mjs` (`TOOL_ROSTER` with the seven records in R2 order and the R1 helpers; JSDoc header explaining the four-name rule) and rewrite `site/src/lib/tool-slugs.ts` as its typed re-export (keep `TOOL_SLUGS`, `ToolSlug`, `isToolSlug`; add `ToolRecord` type and re-export the helpers). Add `site/scripts/tool-roster.test.mjs` covering `mountFor`/`slugForMount`/`repoFor`/`labelFor`/`isToolMount`/`TOOL_SLUGS` order. <!-- R1 R2 -->
- [x] T002 `git mv help/run-kit.json help/hexokit.json` and `git mv content/run-kit content/hexokit`; confirm no `content/run-kit/` or `help/run-kit.json` remains. <!-- R3 -->
- [x] T003 [P] Edit `versions-policy.json` (`"run-kit": { "notify": "minor", "envelope": "hexokit" }`); in `site/src/lib/versions-manifest.ts` add optional `envelope` to `PolicyEntrySchema` and read `help/<envelope ?? key>.json` in `buildManifest` (key and `formula` default unchanged; update the header comment); add the override test to `site/scripts/versions-manifest.test.mjs`. <!-- R18 -->

### Phase 2: Core Implementation

- [x] T004 `site/src/lib/docs-site-sidebar.mjs`: import the roster; `docsSiteSidebarItems(slug)` links `/<mountFor(slug)>/<path>`; `docsSiteRedirectEntries()` emits `/tools/<slug>/<path>` → `/<mount>/<path>/` and, for each `legacyMounts` entry, `/<legacy>/<path>` → `/<mount>/<path>/`. Update its header comment. <!-- R4 R6 -->
- [x] T005 `git mv "site/src/pages/[slug]/[...path].astro" "site/src/pages/[mount]/[...path].astro"`; `getStaticPaths` emits `params: { mount: mountFor(page.slug), path }` with `slug` in props; pass the mount to `rewriteDocsSiteLinks`; update the header comment's mount math. <!-- R4 --> <!-- rework(cycle 2): review must-fix — ReadmeSlice.astro:150 passes the SLUG to rewriteReadmeDocsSiteLinks, so /docs/readme/ emits dead /hexokit/… links; pass the mount (mountFor(tool)) like [mount]/[...path].astro does, and sweep the stale `/<slug>/`, `[slug]` comments/param names in extract-readme.ts -->
- [x] T006 [P] `site/src/lib/commands-toc.ts` and `site/src/lib/readme-toc.ts`: gate on `isToolMount(m[1])` and return `slugForMount(m[1])`; callers keep receiving a slug. <!-- R4 R5 -->
- [x] T007 [P] `site/src/components/GithubButton.astro` (`href` via `repoFor(tool)`, displayed slug text `github.com/sahil87/<repo>`), `site/src/lib/github-stars.ts` (`repos/sahil87/<repoFor(tool)>`), `site/src/components/CommandReference.astro` (`githubUrl` via `repoFor`), `site/src/components/CommandIndex.astro` (`commandsHref` → `/<mountFor(tool)>/commands/`). <!-- R1 -->
- [x] T008 [P] `site/src/components/ToolsIndex.astro` and `site/src/components/VersionTable.astro`: replace the private `ROSTER` arrays with `TOOL_ROSTER` (route `/<mount>/`, repo via `repoFor`, label via `label`); keep the build-stop posture and the `LABEL_COL` alignment (widen if `HexoKit` needs it). <!-- R1 R2 -->
- [x] T009 [P] `site/src/components/InstallOneLiner.astro`: `FULL_TOOLKIT` key `'run-kit'` → `'hexokit'` (reason text: `relies on its sibling tools (wt for the riff worktree flow)`); one-liner text unchanged. <!-- R1 -->
- [x] T010 `git mv site/src/content/docs/tools/run-kit site/src/content/docs/tools/hexokit`; set `slug: docs` / `docs/readme` / `docs/commands`, `tool="hexokit"` props, descriptions naming HexoKit; rewrite `overview.mdx` per intake § 2 (title `HexoKit`, README-derived lead, `## Install`, `## Screenshots` with the two existing `run-kit-*.webp`, `## How it fits`, `## Where to next` → `/docs/readme/`, `/docs/commands/`). Command tokens stay `run-kit …`/`rk …`. <!-- R4 -->
- [x] T011 Create `site/src/content/docs/toolkit/`: `git mv` `getting-started/overview.md` → `toolkit/index.mdx` (reframe per R7, import and render `<ToolsIndex />`), `getting-started/install.md` → `toolkit/install.md`, `getting-started/philosophy.md` → `toolkit/philosophy.md`, `workflows/daily-flow.md` → `toolkit/daily-flow.md`, `workflows/new-change.md` → `toolkit/new-change.md`; reframe prose (HexoKit toolkit; `/run-kit/…` links → `/docs/…`; `/getting-started/install/` links → `/toolkit/install/`); `git rm site/src/content/docs/tools/index.mdx`; remove the now-empty `getting-started/` and `workflows/` dirs. Also retarget `/getting-started/install/` links in `InstallOneLiner.astro` and the five companion `overview.mdx` files (`tools/{fab-kit,wt,idea,tu,hop,shll}/overview.mdx` link to `/run-kit/` or `/getting-started/install/`) to `/docs/` and `/toolkit/install/`. <!-- R7 --> <!-- rework: review should-fix — toolkit/install.md:52 `run-kit agent-setup` is a deprecated hidden alias absent from help/hexokit.json (vn39); change to `run-kit agent setup` --> <!-- rework(cycle 2): review should-fix — toolkit/install.md:15/16/52 `shll shell-setup` / `shll agent-setup` are deprecated spellings absent from help/shll.json; use `shll setup shell` / `shll setup agent` (vn39) -->
- [x] T012 [P] Create `site/src/content/docs/desktop.md` per R8 (verify `desktop`, `desktop install`, `desktop update`, `desktop status` exist in `help/hexokit.json` `commands[]`). <!-- R8 -->
- [x] T013 `site/astro.config.mjs`: import `TOOL_ROSTER`/helpers from `./src/lib/tool-roster.mjs` and delete the `TOOL_SLUGS` copy; `title`/`description` per R10; rebuild `redirects` per R6 (roster-driven `/tools/<slug>/*` set with `mountFor`, `docsSiteRedirectEntries()`, the `/run-kit{,/readme,/commands}` legacy entries, `/tools`, `/getting-started/*`, `/toolkit/overview`, `/workflows/*`); sidebar per R10 (Tools group generated from the roster's companions); remove `social:`; add `SocialIcons: './src/components/HeaderNav.astro'` to `components`. <!-- R6 R9 R10 -->
- [x] T014 [P] Create `site/src/components/HeaderNav.astro` per R9 (four links, `--c-*` tokens, `:focus-visible`, `rel="me"` not needed; header comment explaining the SocialIcons-slot choice). <!-- R9 -->
- [x] T015 `site/src/components/Head.astro`: `ogImageAlt`, homepage JSON-LD, mount-gated per-tool branch with `labelFor`/`repoFor`, `Docs`/`Toolkit` breadcrumbs per R11; update the header comment (crumb shape, mount gate). <!-- R11 -->
- [x] T016 [P] `site/src/content/docs/index.mdx`: `head:` title/og:title per R11; retarget `href="/run-kit/"` → `/docs/`, `all tools →` chip and the `Explore the tools` hero action → `/toolkit/`; leave copy as is. <!-- R11 -->
- [x] T017 [P] `site/src/components/Footer.astro` (LICENSE → `sahil87/hexokit-site`, add `Discord` link), `site/src/lib/terminal-share.ts` (`SHARE_FOOTER` → `# replayed from https://hexokit.com`) + its pin in `site/scripts/terminal-share.test.mjs`; comment-only origin fixes in `llms.ts`, `pages/llms.txt.ts`, `pages/llms-full.txt.ts`, `pages/.well-known/security.txt.ts`, `pages/versions.json.ts`, `Head.astro`. <!-- R14 -->
- [x] T018 `site/src/lib/llms.ts` (`TOOLS` derived from `TOOL_SLUGS`; header comment), `site/src/pages/llms.txt.ts` (R15 sections, `collectDocsSitePages` for the Docs bullets, `slugForMount(entry.id)` for the overview-description fallback), `site/src/pages/llms-full.txt.ts` (R16). <!-- R15 R16 --> <!-- rework: review must-fix A-016 — llms-full.txt.ts Toolkit group matcher misses entry id `toolkit` (the overview); use `id === 'toolkit' || id.startsWith('toolkit/')` -->
- [x] T019 `site/src/components/TerminalPrompt.astro`: R21 minimal retarget only — dual-key (`hexokit` + `run-kit`) help payload, roster-serialized mount map for `ROUTE_*`, `hexokit` alias for the card/completion/`play`; update the comment at the `toolHelp` build (the help file is `hexokit.json`, binary `run-kit`). No copy changes. <!-- R21 -->
- [x] T020 [P] `site/scripts/generate-og-image.mjs`: wordmark `hexokit`, tagline `Your tmux, in the browser and on your phone.`, site `hexokit.com`; run `cd site && node scripts/generate-og-image.mjs` and confirm `public/og-image.png` is 1200×630 (`node -e` with `sharp` metadata, or `file`). <!-- R12 -->
- [x] T021 [P] `.github/workflows/refresh-help.yml` (triple `hexokit:run-kit:run-kit`, header table + four-name rule, identity wording), `.github/workflows/refresh-readme.yml` (both `tools=(...)` arrays → `hexokit:run-kit`, header wording), `.github/workflows/deploy.yml` + `ci.yml` (comment-only `hexokit.com/install`); YAML-parse all four. <!-- R17 -->

### Phase 3: Integration & Edge Cases

- [x] T022 Update `site/scripts/extract-readme.test.mjs` (`loadHelp('hexokit')`), `site/scripts/llms.test.mjs` (`TOOLS` order = roster), `site/scripts/refresh-help-fixtures.mjs` (`doc: 'hexokit'`); run `cd site && node --test scripts/*.test.mjs && node scripts/validate-help.mjs` — all green. <!-- R19 -->
- [x] T023 `cd site && pnpm build`; verify per R4/R5/R6/R11/R15/R16/R18: the listed `dist/` paths exist, the redirect stubs point where R6 says, `dist/llms.txt` and `dist/llms-full.txt` match R15/R16, `dist/versions.json` has a `run-kit` row, `dist/index.html` has no `/run-kit/` hrefs, and `grep -rl 'shll' dist/docs dist/toolkit dist/desktop` shows only synced README/docs-site content and the install one-liner. Fix anything found and re-run. <!-- R19 -->
- [x] T024 [P] Favicon verification per R13: `diff <(sed '/Mirrored verbatim/d' site/src/assets/logo.svg) /home/sahil/code/sahil87/run-kit/assets/logo.svg && diff site/public/favicon.svg <(sed '/Mirrored verbatim/d' site/src/assets/logo.svg)`; record "identical — no regen" under `## Notes`. <!-- R13 -->

### Phase 4: Polish

- [x] T025 [P] `README.md` (repo), `site/README.md` first line, `site/docs/memory/site/index.md` header per R20. <!-- R20 -->
- [x] T026 [P] `fab/project/config.yaml` (`project.name`, `description`), `fab/project/context.md` (rewrite per R20), `fab/project/constitution.md` PATCH 2.1.4 (wording + changelog entry, version/last-amended lines). <!-- R20 -->

## Execution Order

- T001 blocks every roster consumer (T004–T009, T013–T019).
- T002 blocks T010, T012, T022, T023 (the help/content paths must exist under `hexokit`).
- T004 and T005 must both land before T013's redirects are built (the collector and route share the mount math).
- T010, T011, T012, T014 must land before T013 (sidebar slugs and the component path must exist or the build fails).
- T022 before T023; T023 is the gate for Phase 4.

## Acceptance

### Functional Completeness

- [x] A-001 R1: `site/src/lib/tool-roster.mjs` exists with the seven records and helpers; `tool-slugs.ts` re-exports it; no private roster arrays or hardcoded `sahil87/${tool}` / `/${tool}/` remain outside the terminal island's documented `TOOLS` const
- [x] A-002 R2: roster order is hexokit, fab-kit, wt, idea, tu, hop, shll and the sidebar Tools group, `ToolsIndex`, `VersionTable`, and llms endpoints follow it (verified in built sidebar and dist/llms.txt)
- [x] A-003 R3: `help/hexokit.json` and `content/hexokit/**` exist; `help/run-kit.json` and `content/run-kit/` do not
- [x] A-004 R4: `dist/docs/{,readme/,commands/,install/,skill/mux/}index.html` exist and the route file is `[mount]/[...path].astro`
- [x] A-005 R5: companion `dist/<slug>/**/index.html` sets are identical to the pre-change build — verified by construction: companion mounts == slugs and every path-emitting input for companions (content files, slug overrides, docs-site trees) is byte-unchanged; built page sets present (fab-kit 8, wt/idea/tu/hop 6, shll 15 pages)
- [x] A-006 R6: every redirect in the R6 table exists in `dist/` as a stub pointing at the stated target (all 13 R6 paths read and matched; all 18 `dist/run-kit/**` pages are stubs)
- [x] A-007 R7: the five `/toolkit/` pages exist, reframed, with `tools/index.mdx` removed (the one "shll toolkit" phrase hit is shll's verbatim pulled `root.short` — the known accepted hit, see Notes)
- [x] A-008 R8: `/desktop/` exists with the paragraph, Releases link, and install-guide link (all three verified in dist; `run-kit desktop install|update|status` present in help/hexokit.json)
- [x] A-009 R9: header shows Docs · Toolkit · Desktop · GitHub; Discord is in the footer (verified in built HTML; no GitHub/Discord icons remain in the header)
- [x] A-010 R10: site title `HexoKit`, sidebar groups Docs, Toolkit, Tools, Reference (verified in dist/docs/index.html sidebar)
- [x] A-011 R11: homepage and per-tool JSON-LD name HexoKit, breadcrumbs per R11, homepage title/og:title updated, homepage links retargeted (all parsed from dist)
- [x] A-012 R12: `public/og-image.png` regenerated (1200×630) from the updated generator
- [x] A-013 R13: favicon/logo files untouched and verified identical to run-kit's (re-ran both diffs at review: identical; no favicon/logo file in the change diff)
- [x] A-014 R14: Footer LICENSE link, share footer, and comment origins point at hexokit
- [x] A-015 R15: `dist/llms.txt` has the HexoKit H1, mechanical `## Docs` bullets, `## Toolkit`, `## Reference`
- [x] A-016 R16: `dist/llms-full.txt` opens with `## HexoKit` and groups MDX as Toolkit/Reference/Tool overviews — FIXED in rework cycle 1: llms-full.txt.ts:42 now matches `id === 'toolkit' || id.startsWith('toolkit/') || id === 'desktop'`; re-verified in dist: the `## Toolkit` group holds all five toolkit pages (The toolkit, Install everything, Philosophy, Daily flow, Start a new change) + Desktop app, `## Reference` holds Command index, `## Tool overviews` holds all seven overviews, and no getting-started/workflows group heading remains.
- [x] A-017 R17: both cron slug maps carry `hexokit:run-kit…`, headers updated, all four workflow files parse as YAML
- [x] A-018 R18: `versions-policy.json` uses `envelope`; `buildManifest` emits a `run-kit` row from `help/hexokit.json` (unit test + dist/versions.json verified)
- [x] A-019 R19: `node --test`, `validate-help.mjs`, and `pnpm build` all pass (279/279 tests, 7/7 help files, 74 pages built)
- [x] A-020 R20: repo README, site README, site memory index header, config.yaml, context.md, constitution 2.1.4 updated
- [x] A-021 R21: the terminal island's help payload carries both keys and `cd run-kit` targets `/docs/`; no copy rewritten (payload parsed from dist/index.html: hexokit == run-kit payload, mounts map maps both to `docs`)

### Behavioral Correctness

- [x] A-022 R6: `/tools/run-kit/readme` now lands on `/docs/readme/` (not `/run-kit/readme/`)
- [x] A-023 R11: the `Tools` breadcrumb (→ `/tools/`) is gone; companions carry `Toolkit` → `/toolkit/` (verified: /wt/readme/ breadcrumbs Home › Toolkit(/toolkit/) › wt › Readme; /docs/ carries Home › Docs)
- [x] A-024 R18: `dist/versions.json` still has no `hexokit` row and its `run-kit` row's `formula` is `run-kit`

### Removal Verification

- [x] A-025 R7: no `site/src/content/docs/getting-started/`, `workflows/`, or `tools/index.mdx` remain; no `/getting-started/` or `/workflows/` hrefs remain in `site/src`
- [x] A-026 R1: `astro.config.mjs` no longer carries a `TOOL_SLUGS` copy

### Scenario Coverage

- [x] A-027 R4: a relative `./x.md` link inside a HexoKit docs page renders site-absolute under `/docs/` (verified: `../skill.md` in content/hexokit/site/skill/mux.md renders `href="/docs/skill"` in dist)
- [x] A-028 R15: `dist/llms.txt` contains no `shll.ai` URL and no `/run-kit/` path (both greps return 0)
- [x] A-029 R17: `grep -n 'run-kit' .github/workflows/refresh-*.yml` matches only formula/binary/repo positions or explanatory comments

### Edge Cases & Error Handling

- [x] A-030 R6: the build does not fail on a redirect/route collision (`/tools/`, `/toolkit/overview` are redirects only — build green, both verified as stubs)
- [x] A-031 R18: a policy entry without `envelope` still reads `help/<key>.json` (companions unchanged — all six companion rows present in dist/versions.json)
- [x] A-032 R7: every hand-written command/flag token in `toolkit/*` and `desktop.md` exists in the corresponding `help/<slug>.json` (vn39) — re-verified token-by-token in review cycle 3 (all 21 command paths + 4 flags checked against the help JSONs). Both prior exceptions are FIXED: `run-kit agent-setup` → `run-kit agent setup` (cycle 1) and `shll shell-setup` / `shll agent-setup` → `shll setup shell` / `shll setup agent` (cycle 2, toolkit/install.md:15-16,52). Same-class instances outside A-032's scope remain in pre-existing surfaces this change did not author: `InstallOneLiner.astro:126-127` (component string, moju-era) and `tools/hop/overview.mdx:21` (file untouched by this diff) — carried as should-fix findings.

### Code Quality

- [x] A-033 Pattern consistency: new/changed code follows the surrounding header-comment + `--c-*` token + build-time-only conventions
- [x] A-034 No unnecessary duplication: roster data lives only in `tool-roster.mjs`; no new hand-copies of tool one-liners or install commands
- [x] A-035 Readability over cleverness: helpers are small named functions; no god functions added
- [x] A-036 No magic strings: mounts/repos/labels come from the roster, not literals, in every consumer

## Notes

- Check items as you review: `- [x]`
- All acceptance items must pass before `/fab-continue` (hydrate)
- If an item is not applicable, mark checked and prefix with **N/A**: `- [x] A-NNN **N/A**: {reason}`
- **T024 favicon verification (recorded per R13):** `diff <(sed '/Mirrored verbatim/d' site/src/assets/logo.svg) /home/sahil/code/sahil87/run-kit/assets/logo.svg` and `diff site/public/favicon.svg <(sed '/Mirrored verbatim/d' site/src/assets/logo.svg)` both report **identical — no regen**; no favicon/logo file is in the change's diff.
- **Known accepted phrase hit (R7):** `/toolkit/` renders shll's one-liner as `meta-CLI for the shll toolkit` — that string is `help/shll.json` `root.short`, single-sourced and rendered verbatim by `ToolsIndex` (the 4s3e/pgox verbatim-pulled-data rule). It is synced content, not hand-written prose; renaming it belongs upstream in the shll repo, not here.
- **TerminalPrompt frontmatter note:** the slug→mount map is built with a plain loop, not `flatMap`+spread — the Astro compiler's import hoisting mangles that expression shape in frontmatter (observed: `fs.readdirSync` → `fs.(`, `import.meta.url` → `import.url`; reproduced and isolated during apply).
- **Post-merge operator step (not apply):** re-enable and seed the crons once `main` carries the new slug map — `gh workflow enable refresh-help.yml --repo sahil87/hexokit-site`, `gh workflow enable refresh-readme.yml --repo sahil87/hexokit-site`, then `gh workflow run` each with `--ref main`; verify both runs green, that `help/run-kit.json` / `content/run-kit/` did not reappear, and the dispatched deploy is green. Also fill S3's PR/Status cells in run-kit's `fab/plans/sahil/26-09-10-hexokit-rebrand.md` and add the X1 redirect-map notes (`shll.ai/workflows/* → hexokit.com/toolkit/*`, `shll.ai/tools/* → hexokit.com/tools/*`).
- The apply worker must NOT commit; `/git-pr` commits at ship.

## Deletion Candidates

- None discovered beyond the planned removals (re-confirmed in review cycle 3) — this change's redundancy cleanup WAS the plan: the private `ROSTER` arrays in `ToolsIndex.astro`/`VersionTable.astro`, the hand-maintained `TOOLS` const in `llms.ts`, the `TOOL_SLUGS` config-eval copy in `astro.config.mjs`, `tools/index.mdx`, and the `getting-started/` + `workflows/` trees were all removed during apply. Every new roster helper (`mountFor`, `slugForMount`, `repoFor`, `labelFor`, `isToolSlug`, `isToolMount`) has live call sites (verified by grep); no zero-call-site, duplicated-logic, or reuse-existing-utility candidates. The terminal island's internal `TOOLS` const (`TerminalPrompt.astro:182`) stays as the documented R21 exception (S4 owns the homepage and its island).

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Certain | `toolkit/index.mdx` (not `.md`) so it can import `ToolsIndex` | MDX is required for component imports; the file's slug is still `toolkit` | S:80 R:95 A:95 D:95 |
| 2 | Confident | Terminal island keeps its internal `run-kit` key and gets a dual-key payload + mount map, rather than a key rename through 2,800 lines | Minimal, S4 will rework/replace the homepage; behavior (card, navigation) is preserved | S:65 R:90 A:85 D:75 |
| 3 | Confident | `HeaderNav` inherits Starlight's `sl-hidden md:sl-flex` mobile hiding via the SocialIcons slot; the sidebar covers mobile | Matches Starlight's own header behavior; no custom breakpoint work | S:60 R:90 A:80 D:80 |
| 4 | Confident | Breadcrumb second crumb is `Docs` for the product and `Toolkit` for companions | Mirrors the nav labels; the plan names no breadcrumb shape | S:55 R:95 A:80 D:75 |
| 5 | Confident | Companion `overview.mdx` files get link retargets only (`/run-kit/` → `/docs/`, install link → `/toolkit/install/`), no prose rewrite | Their `## How it fits` prose names run-kit as a sibling tool; renaming that prose is C7's banner sweep, not S3 | S:60 R:95 A:85 D:80 |

5 assumptions (1 certain, 4 confident, 0 tentative).
