# Plan: HexoKit landing page (`/`)

**Change**: 260910-lvnp-hexokit-landing
**Intake**: `intake.md`

> Everything below is scoped to `sites/astro-starlight-terminal1/` (the live build) unless a path says otherwise. Read `intake.md` first — its § What Changes carries the exact copy, the asset table (source globs, crops, targets), and the S3 coordination flags this plan implements. Toolchain: the repo-root `justfile` (`just setup`, `just playwright`, `just dev`, `just build`, `just test`, `just validate`, `just shot`) — see `fab/project/context.md` § Task runner.

## Requirements

### Landing: Route & Shell

#### R1: `/` is a custom page on the StarlightPage splash wrapper
The site SHALL serve `/` from `src/pages/index.astro`, which renders `<StarlightPage frontmatter={{ title: 'HexoKit', description: …, template: 'splash', tableOfContents: false, head: […] }}>` with a fully custom `<main class="landing not-content">` body. `src/content/docs/index.mdx` MUST be deleted so no two routes claim `/`.

- **GIVEN** a clean `pnpm build`
- **WHEN** `dist/index.html` is inspected
- **THEN** it contains the landing hero markup, Starlight's header (logo, search, theme select, social icons) and the `Footer.astro` copyright row
- **AND** no sidebar, no right-rail table of contents, no pagination links
- **AND** the build log has no duplicate-route warning for `/`

#### R2: Page-level head metadata rides `frontmatter.head`
The page SHALL emit exactly one `<title>HexoKit — your tmux, in the browser and on your phone</title>`, one `og:title` with the same text, one `og:type` = `website`, and one `<meta name="description">` for `/`. `src/components/Head.astro` MUST NOT be edited (its homepage JSON-LD and `og:image` are S3's).

- **GIVEN** `dist/index.html`
- **WHEN** `<title>`, `og:title`, `og:type`, `meta[name=description]` are counted
- **THEN** each appears exactly once with the values above
- **AND** the Cloudflare beacon and `og:image` from `Head.astro` are still present

### Landing: Content Sections (plan § Site shape order)

#### R3: Hero
The hero SHALL render, in order: an eyebrow bracket label carrying the run-kit version read at build time from `help/run-kit.json` (`version`, normalised via `normalizeVersion` from `src/lib/version.ts`; when the file is missing the eyebrow renders without a version — never fails the build); `<h1>` **Your tmux, in the browser and on your phone.**; the sub-line *Cockpit for the agent era.*; the one-sentence lead from the intake; three CTAs (**Install** → `#install`, **Read the docs** → `/docs/`, **GitHub** → `https://github.com/sahil87/run-kit`); and the screenshot pair `/screenshots/hexokit-hero-desktop.webp` + `/screenshots/hexokit-hero-phone.webp` with explicit `width`/`height`, `loading="eager"`, meaningful `alt`.

- **GIVEN** the built page at a 1440px viewport
- **WHEN** the hero is viewed
- **THEN** the phone frame overlaps the desktop frame's lower-right corner and both are visible without scrolling past the CTAs
- **GIVEN** a 400px viewport
- **WHEN** the hero is viewed
- **THEN** the desktop frame spans the width and the phone frame stacks beneath it, centred, ≤ 260px wide; no horizontal scrollbar

#### R4: Install
`#install` SHALL render two Expressive Code blocks via Starlight's re-exported `<Code>` (copy-button parity with every other code block): `curl -fsSL hexokit.com/install | sh` and `brew install sahil87/tap/hexokit`; a note line "Installs `shll` and `hexokit`. Want the six companions too? See the [toolkit](/toolkit/)."; and "Requires tmux ≥ 3.4 — `rk doctor` checks." `InstallOneLiner.astro` MUST NOT be used or modified.

- **GIVEN** `dist/index.html`
- **WHEN** the install section is inspected
- **THEN** both command strings appear verbatim inside Expressive Code frames with the copy button
- **AND** the strings are exactly the two `INSTALL_LINES` exported by `landing-data.ts`

#### R5: Six feature cards
`#features` SHALL render the six `FEATURES` entries from `landing-data.ts` as cards — image (`loading="lazy" decoding="async"`, explicit dimensions, alt), title, copy, "→ docs" link — in a grid: 3 columns ≥ 60rem, 2 columns ≥ 40rem, 1 column below. Copy MUST name only `rk` verbs present in `help/run-kit.json` (vn39); "boards" is prose, never a backticked command. Titles, copy, assets and links are the intake § 2.3 table.

- **GIVEN** the built page
- **WHEN** the six cards are read
- **THEN** their order is: any device · agents are just panes · `rk riff` · boards + status dots · cron clock + operator · code/web/GUI tiles
- **AND** every card link starts with `/docs/`

#### R6: "Nothing wraps your agent"
`#agnostic` SHALL render the intake § 2.4 paragraph (README ¶2 with `run-kit` → HexoKit, `rk` verbs untouched, the two bolded phrases preserved) followed by the two-row *It is / It isn't* contrast.

- **GIVEN** the built page
- **WHEN** the section is read
- **THEN** the phrase "The agent is one of the things you run, not the thing HexoKit is." is present verbatim and bold
- **AND** the section contains no `run-kit` product mention (`rk` verbs are allowed)

#### R7: The toolkit hexagon
`#toolkit` SHALL render a heading "The HexoKit toolkit" linking `/toolkit/`, one framing sentence, a decorative inline SVG (`aria-hidden="true"`) of the cube-in-hexagon mark recoloured to `--c-*` tokens, six HTML `<a>` labels positioned around its six edges (`TOOLKIT_EDGES` order, clockwise from the top edge: fab-kit `/fab-kit/`, wt `/wt/`, idea `/idea/`, tu `/tu/`, hop `/hop/`, desktop `#desktop`), and an adjacent `<ul>` with one blurb per edge (intake § 2.5 text). Under 40rem the labels collapse into a plain 2×3 grid beneath the mark.

- **GIVEN** keyboard navigation from the hexagon heading
- **WHEN** Tab is pressed six times
- **THEN** focus visits the six labels in `TOOLKIT_EDGES` order, each with a visible focus ring
- **GIVEN** either theme
- **WHEN** the SVG is viewed
- **THEN** all border segments and cube faces are legible (no hard-coded greys from `logo.svg`)

#### R8: Desktop app card
`#desktop` SHALL render `/screenshots/hexokit-desktop-app.webp`, the intake § 2.6 copy (native Electron shell, frees the `⌘` tier, three connect modes, never acts on its own), an Expressive Code block with `rk desktop install` and `rk desktop update` plus the quarantine-free reason line, and a link to `/docs/install/`.

- **GIVEN** the built page
- **WHEN** `#desktop` is followed from the hexagon's desktop label
- **THEN** the viewport lands on the card and the id exists exactly once

#### R9: Footer
`footer.landing-footer` SHALL list, in order: Docs `/docs/` · Toolkit `/toolkit/` · GitHub `https://github.com/sahil87/run-kit` · Discord `https://discord.gg/32XHh5mJYn` · versions.json `/versions.json` · llms.txt `/llms.txt` (from `FOOTER_LINKS`). `Footer.astro` MUST NOT be edited and still renders below.

- **GIVEN** `dist/index.html`
- **WHEN** the footer links are read in DOM order
- **THEN** they match `FOOTER_LINKS` exactly and the `© Sahil Ahuja` line from `Footer.astro` follows

### Landing: Data, Test, Assets, Styling

#### R10: Content as data with a contract test
`src/lib/landing-data.ts` SHALL export `HERO`, `INSTALL_LINES`, `FEATURES`, `TOOLKIT_EDGES`, `FOOTER_LINKS` (typed, dependency-free). `scripts/landing-data.test.mjs` (node `--test`, native `.ts` stripping like `scripts/terminal-toolcard.test.mjs`) SHALL assert: every `TOOLKIT_EDGES` entry whose slug is a tool passes `isToolSlug` and links `/<slug>/`; the `desktop` edge links `#desktop`; every backticked `rk <verb>` token in `FEATURES` copy (and the desktop card copy if it lives in the data file) names a root child of `help/run-kit.json`; `FOOTER_LINKS` is the six in R9's order; `INSTALL_LINES` are exactly R4's two strings.

- **GIVEN** `node --test scripts/landing-data.test.mjs`
- **WHEN** run on the finished change
- **THEN** all assertions pass
- **GIVEN** a copy edit introducing `` `rk boards` `` (not a command)
- **WHEN** the test runs
- **THEN** it fails naming the offending token

#### R11: Curated assets committed as webp
Eight files SHALL exist under `public/screenshots/`: `hexokit-hero-desktop.webp`, `hexokit-hero-phone.webp`, `hexokit-phone-terminal.webp`, `hexokit-agent-state.webp`, `hexokit-board.webp`, `hexokit-operator.webp`, `hexokit-web-tile.webp`, `hexokit-desktop-app.webp`, produced from the intake § 3 sources with its crop rules, webp quality ≈ 80, metadata stripped; widths ≤ 2400 (hero desktop), ≤ 800 (phones), ≤ 1600 (others); hero desktop ≤ ~350 KB, phones ≤ ~150 KB, others ≤ ~250 KB. The producing script `scripts/build-landing-screenshots.mjs` (sharp — already a dependency; precedent: `scripts/generate-og-image.mjs`) SHALL be committed with the source map and crop boxes so the assets are reproducible; raw PNGs and OCR output MUST NOT be committed. Every crop is eyeballed for sensitive text before commit.

- **GIVEN** the eight files
- **WHEN** `file`/`sharp` metadata is read
- **THEN** each is `image/webp` within its width and size budget
- **AND** `git status` shows no `.png` additions under `public/`

#### R12: Landing styles isolated, token-driven, theme- and motion-safe
`src/styles/landing.css` SHALL be imported only by `index.astro`; use only the existing `--c-*` / `--sl-*` tokens (no new hard-coded colours); implement the breakpoints in R3/R5/R7; and gate every animation (bracket-caret blink, typed-sweep label reveal, CRT glint on the primary CTA, optional scanlines on frames) behind `@media (prefers-reduced-motion: no-preference)`. The page SHALL ship no client JavaScript of its own. `src/styles/terminal.css` and `astro.config.mjs` `customCss` MUST NOT change.

- **GIVEN** `just shot` at 1440×900 and 400×900 in `dark` and `light`
- **WHEN** the four captures are viewed
- **THEN** every section is legible in both themes, nothing overflows horizontally at 400px, and no text sits on an unreadable background
- **GIVEN** `dist/index.html`
- **WHEN** `<script>` tags are listed
- **THEN** only Starlight's own scripts (theme, Pagefind, EC copy button) and the Head.astro beacon appear — none authored by the landing

### Site Config & Docs

#### R13: Header brand text reads HexoKit
`astro.config.mjs` `starlight.title` SHALL be `'HexoKit'` and `starlight.description` `'HexoKit — your tmux, in the browser and on your phone. Cockpit for the agent era.'`. No other key in that file changes (S3 overlap — flagged in the PR).

- **GIVEN** `git diff astro.config.mjs`
- **WHEN** inspected
- **THEN** exactly the two value lines differ

#### R14: Site README layout tree reflects the new route
`sites/astro-starlight-terminal1/README.md` SHALL replace the `index.mdx  # splash …` tree line with the `src/pages/index.astro` landing entry and list `landing.css` under styles.

- **GIVEN** the README
- **WHEN** the Layout block is read
- **THEN** it names `src/pages/index.astro` and `src/styles/landing.css` and no longer describes a splash `index.mdx`

### Verification

#### R15: Build, tests, drift check and visual review pass
`just validate`, `just test`, and `just build` SHALL exit 0. Visual review SHALL produce four `just shot` captures (1440 dark, 1440 light, 400 dark, 400 light) of the dev or preview server, reviewed by the apply agent and iterated on until R3/R5/R7/R12 hold; captures are written to the session scratchpad (never committed).

- **GIVEN** the finished change
- **WHEN** `just verify` runs
- **THEN** it exits 0 with the new test included in the `node --test` run

### Non-Goals

- No nav changes, no `/docs/…` or `/toolkit/` pages, no slug/cron plumbing — S3 (`hexokit-site-structure`).
- No `Head.astro`, `og-image.png`, JSON-LD, `llms*.txt`, favicon changes — S3.
- No `/install` script default change (S5) and no `hexokit` brew formula (C2); the landing prints the target-state lines.
- No deletion of `TerminalPrompt.astro`, `terminal-*.ts`, their tests, `Diagram.astro`, loop SVGs, `VersionTable`, `InstallOneLiner` — retained for other pages / S3.
- No changes to `terminal.css` beyond zero.

### Design Decisions

#### StarlightPage splash wrapper over a standalone page
**Decision**: `src/pages/index.astro` wraps `<StarlightPage template="splash">` and owns only the body.
**Why**: The header, theme toggle, Pagefind, `Head.astro` (beacon, og:image, JSON-LD) and `Footer.astro` are all surfaces S3 edits; wrapping means S3's work lands on `/` without a merge, and the existing `[slug]/[...path].astro` proves the pattern.
**Rejected**: A standalone `<html>` page (guppi/herdr shape) — duplicates nav/head/theme/analytics plumbing and guarantees rebase conflicts with S3.
*Introduced by*: 260910-lvnp-hexokit-landing

#### Content as data (`landing-data.ts`) with a contract test
**Decision**: All copy, links, install lines and asset references live in one typed module; the `.astro` file only renders.
**Why**: Copy edits become data edits; the node test mechanises the vn39 hard rule (`rk <verb>` ∈ `help/run-kit.json`) and the roster gate for the hexagon, which hand-written MDX could not.
**Rejected**: Copy inline in the `.astro` template — untestable, and the `ld0j` homepage showed how hand-copied tool one-liners drift.
*Introduced by*: 260910-lvnp-hexokit-landing

#### HTML link labels over an SVG with `<a>` children
**Decision**: The hexagon SVG is decorative (`aria-hidden`); the six edge labels are ordinary `<a>` elements positioned over it, with an adjacent `<ul>` explanation.
**Why**: Keyboard focus, visible focus rings and screen-reader order are straightforward in HTML; SVG anchors are inconsistent across browsers and assistive tech (constitution Accessibility constraint).
**Rejected**: `<a>` inside the SVG — harder focus styling, worse reading order.
*Introduced by*: 260910-lvnp-hexokit-landing

#### Committed webp assets produced by a checked-in sharp script
**Decision**: `scripts/build-landing-screenshots.mjs` holds the source map (Desktop globs) and crop boxes; outputs are committed webps.
**Why**: Reproducible curation without committing raw PNGs; the constitution's third content class blesses site-owned curated screenshots; `sharp` is already a dependency; `generate-og-image.mjs` is the precedent for an unwired one-off generator.
**Rejected**: `astro:assets` `<Image>` over raw PNGs in `src/assets/` — commits multi-MB sources and hands crop decisions to the build.
*Introduced by*: 260910-lvnp-hexokit-landing

### Deprecated Requirements

#### Homepage newcomer blocks, `shll install` transcript and typeable terminal on `/`
**Reason**: The plan (D6) makes `/` a single-product landing; the seven-tool table, install-everything flow and loop diagram are deliberately off the homepage; the user chose to drop the terminal from `/`.
**Migration**: `/toolkit/` (S3) re-homes the getting-started content; the terminal component stays in the tree for S3 to mount; the loop diagram lives at `/fab-kit/` and `/toolkit/`.

## Tasks

### Phase 1: Setup

- [ ] T001 Toolchain baseline: from the repo root run `just setup` and `just playwright` (Chromium for `just shot`); run `just build` on the untouched tree and note it passes (baseline for R15). Read `src/pages/[slug]/[...path].astro`, `src/components/InstallOneLiner.astro`, `src/components/Footer.astro`, `src/styles/terminal.css` (tokens, `.shell-session`, reduced-motion section) and run-kit's `app/frontend/src/globals.css` (typed-sweep, CRT glint, caret blink) for pattern extraction. <!-- R15 -->
- [ ] T002 [P] Assets: write `sites/astro-starlight-terminal1/scripts/build-landing-screenshots.mjs` (sharp; resolves each intake § 3 source by `fs.readdirSync` + `startsWith` on the date/time prefix to dodge the U+202F in filenames; a `SOURCES` map of `{ prefix, crop: {left, top, width, height} | null, maxWidth, out }`). View each source with the Read tool to choose crop boxes (hero desktop: the Run Kit window without the macOS menu bar; agent-state: sidebar SESSIONS list + PANE panel; board: the app window without the blank area; web tile: the window). Run it to emit the eight `public/screenshots/hexokit-*.webp`, check sizes against R11's budgets, eyeball every output for sensitive text. <!-- R11 -->

### Phase 2: Core Implementation

- [ ] T003 Create `src/lib/landing-data.ts` exporting `HERO`, `INSTALL_LINES`, `FEATURES`, `TOOLKIT_EDGES`, `FOOTER_LINKS` with the exact copy from `intake.md` § 2 (feature titles/copy/links table, hexagon blurbs, footer six, install two); image entries carry `src`, `alt`, `width`, `height` (read the real dimensions from the produced webps). Dependency-free; import `ToolSlug` types from `src/lib/tool-slugs.ts`. <!-- R10 -->
- [ ] T004 [P] Create `src/styles/landing.css`: layout (`.landing` max-width 72rem, section spacing), hero two-column ≥ 60rem with the phone-over-desktop overlap, feature grid breakpoints, hexagon two-column ≥ 48rem, CSS device frames, bracket-label + caret blink, typed-sweep label reveal, CRT glint on `.landing-cta-primary`, optional scanlines — all motion inside `@media (prefers-reduced-motion: no-preference)`; tokens only; both themes. <!-- R12 -->
- [ ] T005 Create `src/pages/index.astro`: `StarlightPage` splash wrapper with the R2 `frontmatter.head`; import `landing.css` and `landing-data.ts`; render the hero (eyebrow with build-time version via `normalizeVersion` and a try/catch skip-degrade read of `help/run-kit.json` through `repoRootFromModuleUrl`, h1, sub-line, lead, three CTAs, screenshot pair) and the `#install` section (two `<Code>` blocks + notes). <!-- R1, R2, R3, R4 -->
- [ ] T006 Add the `#features` grid (six cards from `FEATURES`) and the `#agnostic` section (paragraph + It is / It isn't rows) to `index.astro`. <!-- R5, R6 -->
- [ ] T007 Create `src/components/ToolkitHexagon.astro`: decorative inline SVG from `src/assets/logo.svg` geometry recoloured to tokens, six absolutely-positioned `<a>` labels from `TOOLKIT_EDGES`, the adjacent `<ul>` blurbs, collapse-to-grid under 40rem; mount it in `#toolkit` with the heading link to `/toolkit/`. <!-- R7 -->
- [ ] T008 Add `#desktop` (image, copy, `<Code>` with `rk desktop install` / `rk desktop update`, reason line, `/docs/install/` link) and `footer.landing-footer` (`FOOTER_LINKS`) to `index.astro`. <!-- R8, R9 -->
- [ ] T009 Delete `src/content/docs/index.mdx`; in `astro.config.mjs` change only `starlight.title` → `'HexoKit'` and `starlight.description` → the R13 string. Confirm `just build` has no route collision and `dist/index.html` is the landing. <!-- R1, R13 -->

### Phase 3: Integration & Edge Cases

- [ ] T010 Create `scripts/landing-data.test.mjs` (node `--test`, imports the `.ts` module directly like `scripts/terminal-toolcard.test.mjs`): roster/slug links, `#desktop`, `rk <verb>` ∈ `help/run-kit.json` root children (parse backticked tokens `^rk (\w[\w-]*)` from all copy strings), footer six in order, install two verbatim. Run `just test`. <!-- R10 -->
- [ ] T011 Run `just validate`, `just test`, `just build`; grep `dist/index.html` for exactly one `<title>`, one `og:title`, one `og:type` content=website, the six footer hrefs in order, the two install strings, and no `<script>` authored by the landing; fix anything that fails. <!-- R2, R4, R9, R12, R15 -->
- [ ] T012 Visual iteration: start `just dev` in the background (or `just build && just preview`), then `just shot http://127.0.0.1:4321/ <scratchpad>/home-1440-dark.png`, `… 1440 900 light`, `… 400 900` (dark) and `… 400 900 light`; view all four with the Read tool; iterate on `landing.css` / markup until the hero overlap, card density, hexagon proportions and label placement read well, nothing overflows at 400px, both themes are legible, and image weight above the fold is ≤ ~600 KB; re-shoot after each round. If `rk` is on PATH and `$TMUX` is set, `rk present http://127.0.0.1:4321/` so the user can see the dev server (fail-silent otherwise). <!-- R3, R5, R7, R12, R15 -->
- [ ] T013 Accessibility pass on the built page: keyboard-tab through the CTAs, hexagon labels, card links and footer in DOM order with visible focus rings; every `<img>` has meaningful alt; the SVG is `aria-hidden` with the `<ul>` explanation adjacent; contrast of dim text (`--c-fg-dim`) on `--c-surface` acceptable in both themes (adjust to `--c-fg` where it is not). <!-- R7, R12 -->

### Phase 4: Polish

- [ ] T014 Update `sites/astro-starlight-terminal1/README.md` Layout block (landing entry + `landing.css`); final `just verify`; confirm `git status` shows no raw `.png` under `public/` and no edits to `terminal.css`, `Head.astro`, `Footer.astro`, `InstallOneLiner.astro`, or `astro.config.mjs` beyond the two lines. <!-- R14, R13, R15 -->

## Execution Order

- T002 (assets) blocks T003 (real image dimensions) and T005–T008 (image `src` paths); start it first, in parallel with T001.
- T003 and T004 are independent of each other; both block T005.
- T005 → T006 → T007 → T008 → T009 are sequential edits to `index.astro` / config.
- T010–T013 run after T009; T012 iterates and may re-touch T004/T005–T008 files.
- T014 last.

## Acceptance

### Functional Completeness

- [ ] A-001 R1: `dist/index.html` is the landing page with Starlight header and `Footer.astro` row; no sidebar/ToC/pagination; `src/content/docs/index.mdx` is gone and the build logs no duplicate-route warning
- [ ] A-002 R2: exactly one `<title>`, one `og:title`, one `og:type` (`website`) and one meta description on `/`, values per R2; `Head.astro` unchanged in the diff
- [ ] A-003 R3: hero shows the verbatim tagline and sub-line, the lead, three CTAs with the specified hrefs, the version eyebrow, and both hero images with `width`/`height`/`alt` and eager loading
- [ ] A-004 R4: two Expressive Code blocks with the exact install strings and copy buttons, plus the toolkit note and the tmux ≥ 3.4 line; `InstallOneLiner.astro` unchanged and not imported by the landing
- [ ] A-005 R5: six cards in the specified order, each with lazy image, title, copy and a `/docs/…` link, rendered from `FEATURES`
- [ ] A-006 R6: differentiator paragraph and It is / It isn't rows present with the bold phrases verbatim and no `run-kit` product mention
- [ ] A-007 R7: hexagon heading links `/toolkit/`; six labels in `TOOLKIT_EDGES` order with the specified hrefs; SVG `aria-hidden`; adjacent blurb list present
- [ ] A-008 R8: `#desktop` exists once with image, copy, `rk desktop install` / `rk desktop update` block and `/docs/install/` link
- [ ] A-009 R9: footer links match `FOOTER_LINKS` exactly and in order; `Footer.astro` unchanged and still rendered
- [ ] A-010 R10: `landing-data.ts` exports the five named constants; `landing-data.test.mjs` exists and passes under `node --test scripts/*.test.mjs`
- [ ] A-011 R11: the eight `hexokit-*.webp` files exist with the budgets in R11; `scripts/build-landing-screenshots.mjs` is committed; no raw PNGs or OCR output under the repo
- [ ] A-012 R12: `landing.css` is imported only by `index.astro`, uses only existing tokens, gates all motion on `prefers-reduced-motion: no-preference`; `terminal.css` and `customCss` unchanged
- [ ] A-013 R13: `astro.config.mjs` diff is exactly the `title` and `description` value lines
- [ ] A-014 R14: site README Layout block names `src/pages/index.astro` and `src/styles/landing.css`
- [ ] A-015 R15: `just validate`, `just test`, `just build` exit 0

### Behavioral Correctness

- [ ] A-016 R3: at 400px width the phone frame stacks under the desktop frame (≤ 260px wide) and the page has no horizontal scroll
- [ ] A-017 R5: the grid is 3 columns at ≥ 60rem, 2 at ≥ 40rem, 1 below (verified in the 1440 and 400 captures)
- [ ] A-018 R12: the 1440/400 × dark/light `just shot` captures were produced and reviewed; every section legible in both themes

### Removal Verification

- [ ] A-019 R1: no `tools-chips`, `tools-listing`, `$ shll install` transcript, `<VersionTable/>`, `<TerminalPrompt/>`, loop `<Diagram/>`, `cat ABOUT.md` or `$ whoami` markup remains in `dist/index.html`
- [ ] A-020 R1: `TerminalPrompt.astro`, `terminal-*.ts`, their tests, `Diagram.astro`, loop SVGs, `VersionTable.astro`, `InstallOneLiner.astro` still exist in the tree (retained, not deleted)

### Scenario Coverage

- [ ] A-021 R10: the test fails when a `FEATURES` copy string names an `rk` verb absent from `help/run-kit.json` (verified by a temporary edit or an inline negative case)
- [ ] A-022 R7: keyboard Tab order visits the six hexagon labels in `TOOLKIT_EDGES` order with visible focus rings
- [ ] A-023 R3: with `help/run-kit.json` temporarily absent (or the read stubbed), the build still succeeds and the eyebrow renders without a version

### Edge Cases & Error Handling

- [ ] A-024 R11: every output crop was inspected for sensitive text (tokens, emails, private data) before commit; the board crop shows the three pinned panes and the `Board: bb` header, or the documented alternate was used
- [ ] A-025 R12: with reduced motion preferred, no animation runs (caret blink, typed sweep, glint, scanlines all gated)

### Code Quality

- [ ] A-026 Pattern consistency: new files follow the site's conventions — frontmatter doc-comment headers on `.astro` components, `not-content` opt-out, `--c-*` tokens, `scripts/*.test.mjs` harness, `repoRootFromModuleUrl` for repo-root reads
- [ ] A-027 No unnecessary duplication: `<Code>` (not hand-rolled frames), `isToolSlug`, `normalizeVersion`, `repoRootFromModuleUrl` reused; no second copy of link styling or terminal chrome
- [ ] A-028 Readability over cleverness: `index.astro` is a linear sequence of sections; `landing-data.ts` is plain data; no god component (extract `ToolkitHexagon.astro`; extract further if a section's markup exceeds ~80 lines)
- [ ] A-029 No magic values: breakpoints, budgets and image dimensions are named (CSS custom properties or constants), not scattered literals
- [ ] A-030 Existing project patterns: no new runtime or build dependency (Constitution VI); static output only (Constitution I); both themes (Constitution V)

## Notes

- Check items as you review: `- [x]`
- All acceptance items must pass before `/fab-continue` (hydrate)
- If an item is not applicable, mark checked and prefix with **N/A**: `- [x] A-NNN **N/A**: {reason}`
- Design iteration is expected (Size L): T012 is a loop, not a step — re-shoot after every layout change and stop only when the four captures read well.

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Confident | Assets are produced by a committed `scripts/build-landing-screenshots.mjs` (sharp) with source globs and crop boxes | Reproducible without committing raw PNGs; `generate-og-image.mjs` is the one-off-generator precedent | S:55 R:90 A:85 D:70 |
| 2 | Confident | The hexagon is its own component `src/components/ToolkitHexagon.astro` | Keeps `index.astro` linear; the site's component-per-concern convention | S:50 R:95 A:90 D:75 |
| 3 | Certain | Visual review uses the repo `justfile` (`just shot` at 1440/400 × dark/light) | User-provided tooling added for exactly this purpose; `--color-scheme` drives Starlight's `auto` theme | S:90 R:95 A:90 D:90 |
| 4 | Confident | Version eyebrow reads `help/run-kit.json` through `repoRootFromModuleUrl` with try/catch skip-degrade | Same repo-root idiom as `Head.astro`/`ReadmeSlice`; a missing producer file must never fail the build | S:45 R:95 A:85 D:70 |
| 5 | Confident | Crop boxes are chosen by the apply agent by viewing the sources; the board card falls back to the intake alternates if the crop does not read | Only the images decide; the intake lists alternates | S:40 R:90 A:60 D:50 |
| 6 | Confident | The `rk <verb>` extraction regex for the test is `` `rk ([a-z][\w-]*)` `` over all copy strings | Mirrors the vn39 token rule; sub-verbs (`rk desktop install`) validate their first word | S:50 R:95 A:85 D:70 |

6 assumptions (1 certain, 5 confident, 0 tentative).
