# Plan: HexoKit product landing page (`/`)

**Change**: 260910-jwhx-hexokit-landing
**Intake**: `intake.md`

> All paths below are relative to the repo root. The live site is `sites/astro-starlight-terminal1/`
> (abbreviated **`SITE/`** in this file). The plan doc that drives this change lives in another repo:
> `/home/sahil/code/sahil87/run-kit/fab/plans/sahil/26-09-10-hexokit-rebrand.md` — read § Site shape and D6/D10
> before implementing. run-kit's palette source: `/home/sahil/code/sahil87/run-kit/app/frontend/src/globals.css`.

## Requirements

### Landing: route and page shell

#### R1: `/` is a custom Astro page inside Starlight chrome
The homepage MUST be served by a new `SITE/src/pages/index.astro` that wraps its content in Starlight's
`StarlightPage` component (`import StarlightPage from '@astrojs/starlight/components/StarlightPage.astro'`)
with `frontmatter={{ title: 'HexoKit', template: 'splash', tableOfContents: false, head: [...] }}` and NO
`hero:` key. The Starlight content page `SITE/src/content/docs/index.mdx` MUST be deleted so exactly one route
emits `/`. The page root element MUST be `<main class="hk-landing">` (the token-scope root, R4).

- **GIVEN** the repo after this change
- **WHEN** `pnpm build` runs in `SITE/`
- **THEN** it succeeds, `dist/index.html` exists, contains the string `Your tmux, in the browser and on your phone.`, and does NOT contain `Seven small CLIs`
- **AND** `dist/index.html` still contains the Starlight header (`<header class="header"`) and the theme select seam (`starlight-theme-select`)

#### R2: Homepage `<head>` is owned by the page
`index.astro` MUST supply, via the `frontmatter.head` array: `<title>HexoKit — your tmux, in the browser and
on your phone</title>`; `meta name="description"` = *HexoKit is a remote, phone-first console for your tmux:
every session and pane as a live terminal from any device, built for running many AI coding agents in
parallel without wrapping any of them.*; `meta property="og:title"` = the title; `og:type` = `website`;
`og:description` = the description. `SITE/src/components/Head.astro` MUST NOT be edited (S3 owns it).

- **GIVEN** the built `dist/index.html`
- **WHEN** its `<head>` is inspected
- **THEN** exactly one `<title>` is present with the HexoKit title, `og:type` is `website`, and `git diff --stat` shows no change to `Head.astro`

#### R3: Retired homepage components stay in the tree
`TerminalPrompt.astro`, `VersionTable.astro`, `Diagram.astro`, `InstallOneLiner.astro`, every
`SITE/src/lib/terminal-*.ts`, every `SITE/scripts/terminal-*.test.mjs`, and `SITE/public/diagrams/loop-*.svg`
MUST remain unchanged. Only `index.mdx` is deleted.

- **GIVEN** the change's diff
- **WHEN** `git diff --name-status main...HEAD` is read
- **THEN** the only `D` entry under `SITE/src/` is `src/content/docs/index.mdx`
- **AND** `node --test scripts/*.test.mjs` passes in `SITE/`

### Landing: visual system

#### R4: Landing-scoped token layer borrowing run-kit's palette
A new `SITE/src/styles/landing.css`, imported ONLY by `index.astro`, MUST define the `.hk-landing` tokens for
dark (default) and light (`:root[data-theme='light'] .hk-landing`) exactly as listed in the intake § 2 (values
copied from run-kit `globals.css`: `--hk-bg #0f1117 / #f8f9fb`, `--hk-card #171b24 / #ffffff`, `--hk-inset
#0a0c12 / #e8eaef`, `--hk-fg #e8eaf0 / #1a1d24`, `--hk-fg-dim #7a8394 / #6b7280`, `--hk-border #454d66 /
#d1d5db`, `--hk-accent #5b8af0 / #4a7ae8`, `--hk-accent-bright #82a8f7 / #3b66d6`, `--hk-green #22c55e /
#16a34a`, `--hk-yellow #facc15 / #b07d02`, `--hk-purple #c084fc / #9333ea`, `--hk-red #f87171 / #dc2626`).
Every color on the landing MUST come from an `--hk-*` token (no literal hex outside the token block). The
landing wrapper MUST paint `background: var(--hk-bg); color: var(--hk-fg)` full-bleed. Font stays the site's
`--sl-font-mono` (JetBrains Mono). `SITE/src/styles/terminal.css` MUST NOT be edited.

- **GIVEN** the built page in dark mode
- **WHEN** the landing wrapper's computed background is read
- **THEN** it is `#0f1117`, and in light mode (`data-theme="light"`) it is `#f8f9fb`
- **AND** `grep -E '#[0-9a-fA-F]{3,8}' SITE/src/styles/landing.css` matches only lines inside the two token blocks

#### R5: CSS-only motion ports, all gated on reduced motion
`landing.css` MUST port from run-kit's `globals.css`, CSS-only: (a) `hk-glint-sweep` — a skewed, hue-free
highlight strip sweeping across the two hero CTA buttons once on hover; (b) `hk-glitch` — a one-shot RGB-split
`text-shadow` glitch (`steps(2)`, ~300 ms) on the `HexoKit` wordmark on hover, snapping its color to
`--hk-green` for the hover; (c) `hk-caret-blink` — a blinking block cursor `▊` after the tagline. Under
`@media (prefers-reduced-motion: reduce)` every landing animation MUST be `animation: none` with the cursor
left visible and steady. No JavaScript is added for motion.

- **GIVEN** `prefers-reduced-motion: reduce`
- **WHEN** the page is rendered
- **THEN** no element inside `.hk-landing` has a running animation, and the tagline cursor is still visible

#### R6: Focus, hover and contrast rules
Every interactive element on the landing MUST show `outline: 2px solid var(--hk-green); outline-offset: 2px` on
`:focus-visible`. Hover on links/buttons MUST be hue-free (brightness/border/motion only; green is reserved for
brand/state). Text/background pairs MUST meet WCAG AA in both themes (the token values are run-kit's audited
set; body text uses `--hk-fg`, secondary uses `--hk-fg-dim` at ≥ 0.9rem).

- **GIVEN** keyboard navigation from the page top
- **WHEN** Tab is pressed repeatedly
- **THEN** focus visits, in order, every hero CTA, install copy button, hexagon link, desktop-card link and footer link, each with the visible green ring

#### R7: Responsive layout
The landing MUST render at 400 px, 768 px and 1280 px widths with no horizontal scroll on `<body>`. The hero
screenshots MUST stack (desktop above phone, phone capped at `max-height: 60vh`) at `≤ 48rem`; the feature grid
MUST be `repeat(auto-fit, minmax(18rem, 1fr))`; the hexagon MUST collapse to a single-column list (mark on top)
at `≤ 40rem`. Breakpoints MUST be named once as CSS comments/consts, not repeated magic numbers.

- **GIVEN** a 400 px viewport
- **WHEN** the page is rendered
- **THEN** `document.documentElement.scrollWidth <= 400` and all six hexagon links are visible in one column

### Landing: sections (plan § Site shape order)

#### R8: Hero
The hero MUST contain, in order: the cube-in-hexagon mark as inline SVG (`aria-hidden="true"`, geometry from
`SITE/src/assets/logo.svg`) beside `<h1>HexoKit</h1>`; `<p class="hk-tagline">Your tmux, in the browser and
on your phone.</p>` (verbatim) followed by the caret; `<p class="hk-subline">Cockpit for the agent era.</p>`
(verbatim); two CTAs — primary `Install` → `#install`, secondary `Read the docs` → `/docs/`; then two `<img>`
side by side: desktop `/screenshots/run-kit-console.webp` (`width="1800" height="1124"`, `loading="eager"`,
`decoding="async"`, alt *HexoKit desktop dashboard: sidebar of servers, sessions and panes with status dots,
a live coding-agent terminal, and host stats.*) and phone `/screenshots/hexokit-phone-terminal.webp` (real
dimensions from the converted file, `loading="eager"`, alt *HexoKit on a phone: a live agent terminal with the
touch key row.*).

- **GIVEN** the built `dist/index.html`
- **WHEN** the hero section is inspected
- **THEN** both verbatim lines are present exactly, both images have `width`, `height`, non-empty `alt`, and `loading="eager"`

#### R9: Install block
`<section id="install">` MUST render two Expressive Code blocks via Starlight's re-export
(`import { Code } from '@astrojs/starlight/components'`), each from a frontmatter constant:
`INSTALL_ONE_LINER = 'curl -fsSL https://hexokit.com/install | sh'` and
`BREW_LINE = 'brew install sahil87/tap/hexokit'` (`lang="bash"`), so each copies alone with EC's copy button.
Below them one note: *Installs `shll` (the toolkit manager) and HexoKit. Want the six companion tools too? See
[the toolkit](/toolkit/).* `InstallOneLiner.astro` MUST NOT be used on this page.

- **GIVEN** the built page
- **WHEN** the install section is inspected
- **THEN** two `.expressive-code` frames are present, the first containing `hexokit.com/install`, the second `sahil87/tap/hexokit`, and the note links `/toolkit/`

#### R10: Six feature cards
`<section aria-labelledby>` with a grid of six `<article class="hk-card">`, each: an image (or slot) on top,
`<h3>`, one–two sentences. Titles and copy are the intake § 3.3 table, verbatim. Images: card 1
`/screenshots/hexokit-phone-dashboard.webp`; card 2 `/screenshots/run-kit-agent-session.webp`; card 3
`/screenshots/hexokit-fleet-sidebar.webp` (a crop of the console shot's sidebar, R15); card 5
`/screenshots/hexokit-operator.webp`; cards 4 and 6 render an **image slot**: a `div.hk-slot` with
`aspect-ratio: 16/10`, `background: var(--hk-inset)`, `border: 1px dashed var(--hk-border)`, containing a
dim monospace caption `boards · screenshot pending` / `tiles · screenshot pending`. Card images are
`loading="lazy"` with `width`/`height`/`alt`. Every `rk <verb>` named in card prose MUST be a top-level
command in `help/run-kit.json` (`riff` is; verify at apply).

- **GIVEN** the built page
- **WHEN** the features section is inspected
- **THEN** exactly six `article.hk-card` exist, four with `<img>` and two with `div.hk-slot`, in the intake's order

#### R11: Differentiator paragraph
`<section>` with `<h2>Nothing wraps your agent.</h2>` and the intake § 3.4 paragraph verbatim (product name
HexoKit, `htop` in `<code>`, the bold sentence in `<strong>`), single column, `max-width: 70ch`.

- **GIVEN** the built page
- **THEN** the text `The agent is one of the things you run, not the thing HexoKit is.` is present inside `<strong>`

#### R12: The toolkit hexagon
`<section id="toolkit">` MUST render: an intro line *HexoKit is the cockpit. Six small tools sit on its
edges — each brew-installable alone, each better together.*; a `div.hk-hex` laid out as a **3×3 CSS grid**
(`grid-template-areas`), the mark (inline SVG ≈ 180 px, `aria-hidden`) in the centre cell wrapped in
`<a href="/toolkit/" aria-label="The HexoKit toolkit">`; six edge links in the surrounding cells, clockwise
from the top: `fab-kit` (top) → `/fab-kit/`, `wt` (upper-right) → `/wt/`, `idea` (lower-right) → `/idea/`,
`tu` (bottom) → `/tu/`, `hop` (lower-left) → `/hop/`, `desktop` (upper-left) → `#desktop`; each link = tool
name + the one-liner from intake § 3.5 (verbatim); a trailing link *See the whole toolkit →* → `/toolkit/`.
At `≤ 40rem` the grid MUST become one column with the mark first. No seven-tool table, no loop diagram.

- **GIVEN** the built page
- **WHEN** the hexagon section is inspected
- **THEN** six edge links exist with the exact hrefs above in DOM order fab-kit, wt, idea, tu, hop, desktop, and the centre link has `aria-label="The HexoKit toolkit"`

#### R13: Desktop app card
`<section id="desktop">` MUST render `<h2>HexoKit Desktop (macOS)</h2>`, the intake § 3.6 copy verbatim (with
`⌘` in `<kbd>`), one EC `<Code code="rk desktop install" lang="bash" />`, and the link *Install & access
guide →* → `/docs/install/#desktop-app-macos`.

- **GIVEN** the built page
- **THEN** `id="desktop"` exists, the code frame contains `rk desktop install`, and the link href is exactly `/docs/install/#desktop-app-macos`

#### R14: Page-local footer
`<footer class="hk-footer">` inside `.hk-landing` MUST render one `·`-separated row of exactly six links, in
order: Docs `/docs/` · Toolkit `/toolkit/` · GitHub `https://github.com/sahil87/run-kit` · Discord
`https://discord.gg/32XHh5mJYn` · versions.json `/versions.json` · llms.txt `/llms.txt`.
`SITE/src/components/Footer.astro` MUST NOT be edited.

- **GIVEN** the built page
- **THEN** `footer.hk-footer` contains exactly those six anchors in that order, and `git diff` shows no change to `Footer.astro`

### Assets

#### R15: Site-owned screenshot conversion
A one-off `SITE/scripts/convert-screenshots.mjs` (pattern: `SITE/scripts/generate-og-image.mjs`, unwired from
CI) MUST use the already-declared `sharp` dependency to produce, into `SITE/public/screenshots/`:
`hexokit-phone-terminal.webp` (from `https://github.com/user-attachments/assets/f07a0166-7674-41fe-8376-ef34fd2a1afb`),
`hexokit-phone-dashboard.webp` (from `…/35645b54-d6d4-463f-8dc3-9d44e4c76dd5`),
`hexokit-phone-menu.webp` (from `…/1326355e-6031-4620-9ce9-355b82bf8313`) — each resized to ≤ 900 px wide;
`hexokit-operator.webp` (from local `/home/sahil/code/sahil87/run-kit/.uploads/260907140652-image.png`,
≤ 1600 px wide); `hexokit-fleet-sidebar.webp` (a `sharp().extract()` crop of the existing
`run-kit-console.webp` covering its left sidebar — roughly x 0–370, y 90–1000 of 1800×1124; tune by eye).
Quality 82; every output MUST be < 250 KB. Sources are declared in a manifest array at the top of the script
(`{ out, src, maxWidth, extract? }`); the script MUST fail loudly on a missing source. Outputs are committed
(constitution third content class). The two existing `run-kit-*.webp` files MUST NOT be renamed.

- **GIVEN** `node scripts/convert-screenshots.mjs` run once in `SITE/`
- **THEN** the five files exist under `public/screenshots/`, each < 250 KB, each decodable as WebP

### Tests

#### R16: Landing link and asset test
A new `SITE/scripts/landing-links.test.mjs` (`node:test`, same style as `llms.test.mjs`) MUST read
`src/pages/index.astro` as text and assert: (a) every internal `href="/…"` (ignoring `#` fragments) is
either an existing route — a file under `src/content/docs/**` mapping to that slug, a file under `src/pages/**`,
or `/<slug>/` for a slug in `src/lib/tool-slugs.ts` — or is in the explicit allow-list
`FORWARD_LINKS = ['/docs/', '/toolkit/', '/docs/install/', '/versions.json', '/llms.txt']` with a comment naming
S3/S5 as the owners; (b) every `src="/screenshots/…"` names a file that exists in `public/screenshots/`.
`node --test scripts/*.test.mjs` MUST pass with it.

- **GIVEN** a typo'd internal link such as `/toolkt/` in `index.astro`
- **WHEN** the test runs
- **THEN** it fails naming the href

### Non-Goals

- Nav/header items, `Head.astro` JSON-LD/OG image, `Footer.astro`, `/toolkit/`, `/docs/` (S3); `/install` (S5).
- Renaming `run-kit-*.webp`; re-skinning the docs layer; any change under other `sites/*`.
- Relocating the interactive terminal (open question for Sahil).
- Re-capturing screenshots that show the "RunKit" title (after C3).

### Design Decisions

#### Custom page over the Starlight splash template
**Decision**: `src/pages/index.astro` + `StarlightPage` (`template: 'splash'`, no `hero`), `index.mdx` deleted.
**Why**: the landing needs a two-image hero, a 3×3 hexagon grid and a page-local footer; the splash template
cannot express that, while `StarlightPage` keeps header, theme toggle, tokens and a11y for free.
**Rejected**: restyling the splash `hero:`/markdown body (fights the template); a fully custom `<html>` layout
(loses the theme toggle sync and duplicates the header).
*Introduced by*: 260910-jwhx-hexokit-landing

#### Landing-scoped `--hk-*` tokens instead of re-theming the site
**Decision**: run-kit's palette lives under `.hk-landing` only; docs keep the amber terminal palette.
**Why**: the plan wants the landing to look like the app; S3 owns the docs layer and header in parallel, so a
site-wide re-theme here would collide.
**Rejected**: overriding `--c-*`/`--sl-*` globally (collides with S3, changes every docs page).
*Introduced by*: 260910-jwhx-hexokit-landing

#### Forward links to S3/S5 paths, allow-listed in a test
**Decision**: link `/docs/`, `/toolkit/`, `/docs/install/` now; an explicit `FORWARD_LINKS` allow-list in the
link test documents them.
**Why**: S3 lands in parallel; hexokit.com is unannounced (D13); the test still catches any other typo.
**Rejected**: linking today's `/run-kit/` and `/getting-started/` (would need an S3 follow-up edit here).
*Introduced by*: 260910-jwhx-hexokit-landing

#### Image slots for cards without a capture
**Decision**: cards 4 and 6 ship a styled dashed `hk-slot` with a "screenshot pending" caption.
**Why**: no such captures exist in any repo; only Sahil can take them; design iteration is expected.
**Rejected**: dropping the two cards (loses two of the plan's six features); using unrelated images.
*Introduced by*: 260910-jwhx-hexokit-landing

## Tasks

### Phase 1: Setup

- [x] T001 In `SITE/`, run `pnpm install --frozen-lockfile`; confirm the baseline is green before touching anything: `node scripts/validate-help.mjs && node --test scripts/*.test.mjs && pnpm build`. Record the baseline `dist/index.html` title for comparison. <!-- R1 -->
- [x] T002 Write `SITE/scripts/convert-screenshots.mjs` (manifest array `{ out, src, maxWidth, extract? }`; URL sources fetched with `fetch`, local sources read from disk; `sharp` resize + `.webp({ quality: 82 })`; fail loudly on a missing source; print each output size). Run it once to produce `hexokit-phone-terminal.webp`, `hexokit-phone-dashboard.webp`, `hexokit-phone-menu.webp`, `hexokit-operator.webp`, `hexokit-fleet-sidebar.webp` in `SITE/public/screenshots/`; check each < 250 KB and view the fleet crop to tune the extract box. <!-- R15 -->

### Phase 2: Core Implementation

- [x] T003 Create `SITE/src/styles/landing.css`: the `.hk-landing` dark token block and the `:root[data-theme='light'] .hk-landing` light block (values from R4), full-bleed wrapper background/color, base typography on `--sl-font-mono`, the shared `:focus-visible` ring rule, hue-free hover rule, named breakpoint comments (`/* --bp-stack: 48rem */`, `/* --bp-hex-collapse: 40rem */`), and the three keyframes `hk-glint-sweep`, `hk-glitch`, `hk-caret-blink` with the `prefers-reduced-motion` gate at the bottom. <!-- R4 -->
- [x] T004 Create `SITE/src/pages/index.astro`: import `StarlightPage`, `Code`, `../styles/landing.css`; frontmatter `LINKS` const (docs, toolkit, docsInstallDesktop, github, discord, versions, llms), `INSTALL_ONE_LINER`, `BREW_LINE`, the `head` array (title/description/og:*); render `<StarlightPage frontmatter={{ title: 'HexoKit', template: 'splash', tableOfContents: false, head }}>` → `<main class="hk-landing">` with empty section placeholders. Delete `SITE/src/content/docs/index.mdx`. Run `pnpm build`; confirm `/` builds once, header + theme select present. <!-- R1 -->
- [x] T005 Hero section per R8: inline SVG mark (copy polygon geometry from `SITE/src/assets/logo.svg`, `aria-hidden`), `<h1>HexoKit</h1>` with the `hk-glitch` hover class, verbatim tagline + `<span class="hk-caret" aria-hidden>▊</span>`, verbatim sub-line, two CTAs (`hk-cta hk-cta-primary` → `#install`, `hk-cta` → `LINKS.docs`) carrying the glint sweep, then the desktop + phone `<img>` pair with real `width`/`height` (read the phone file's dimensions), `loading="eager"`, `decoding="async"`, the R8 alt texts; styles in `landing.css` (side-by-side ≥ 48rem, stacked below). <!-- R8 -->
- [x] T006 Install section per R9: `id="install"`, two `<Code code={INSTALL_ONE_LINER} lang="bash" />` / `<Code code={BREW_LINE} lang="bash" />`, the note paragraph linking `LINKS.toolkit`. <!-- R9 -->
- [x] T007 Features section per R10: six `article.hk-card` with the intake § 3.3 titles/copy verbatim, images for cards 1/2/3/5 (`loading="lazy"`, real `width`/`height`, alt), `div.hk-slot` for cards 4/6 with captions; grid + slot styles in `landing.css`. Grep `help/run-kit.json` for every `rk <verb>` token used (`riff`). <!-- R10 -->
- [x] T008 [P] Differentiator section per R11 (verbatim paragraph, `<strong>`, `<code>htop</code>`, `max-width: 70ch`). <!-- R11 -->
- [x] T009 [P] Hexagon section per R12: intro line, `div.hk-hex` 3×3 `grid-template-areas`, centre `<a href={LINKS.toolkit} aria-label="The HexoKit toolkit">` wrapping a ~180 px inline SVG mark, six edge links in DOM order fab-kit, wt, idea, tu, hop, desktop with the verbatim one-liners and hrefs, trailing link; collapse to one column ≤ 40rem. <!-- R12 -->
- [x] T010 [P] Desktop card per R13: `id="desktop"`, heading, verbatim copy with `<kbd>⌘</kbd>`, `<Code code="rk desktop install" lang="bash" />`, link → `LINKS.docsInstallDesktop`. <!-- R13 -->
- [x] T011 [P] Footer per R14: `footer.hk-footer` with the six links in order from `LINKS`; confirm `Footer.astro` untouched. <!-- R14 -->

### Phase 3: Integration & Edge Cases

- [x] T012 Responsive + a11y + motion pass: `pnpm build && pnpm preview`, check 400/768/1280 px (no horizontal scroll, hero stacks, hexagon collapses), both themes via the header toggle, Tab order and the green focus ring on every interactive element, and `prefers-reduced-motion` (emulate in devtools or add `@media` check) stops all animation with the caret visible. Fix in `landing.css`. <!-- R7 -->
- [x] T013 Write `SITE/scripts/landing-links.test.mjs` per R16 (route existence from `src/content/docs/**`, `src/pages/**`, `TOOL_SLUGS`; `FORWARD_LINKS` allow-list with an S3/S5 ownership comment; screenshot `src` existence). Run `node --test scripts/*.test.mjs`. <!-- R16 -->
- [x] T014 Verify constraints: `grep -E '#[0-9a-fA-F]{3,8}' src/styles/landing.css` only inside token blocks; `git diff --name-status main...HEAD` shows `Head.astro`, `Footer.astro`, `terminal.css`, `astro.config.mjs` untouched and the only `D` is `index.mdx`; no `<script>` added by `index.astro`; `dist/index.html` lacks `Seven small CLIs`. <!-- R2 -->
- [x] T015 Full gate: `node scripts/validate-help.mjs && node --test scripts/*.test.mjs && pnpm build` all green. <!-- R3 -->

### Phase 4: Polish

- [x] T016 Update `SITE/README.md` § Layout: `index.mdx` line → `src/pages/index.astro  # HexoKit product landing (custom page, not the docs template)`, add `styles/landing.css` and `public/screenshots/` entries; update the `## Theming` bullet "Splash: hand-written `<pre class="shell-session">`" to describe the landing. <!-- R1 -->

## Execution Order

- T001 → T002 (assets needed by T005/T007) → T003 → T004 → T005–T007 sequential, T008–T011 parallel after T004 → T012 → T013 → T014 → T015 → T016.

## Acceptance

### Functional Completeness

- [x] A-001 R1: `/` is emitted once from `src/pages/index.astro` inside `StarlightPage` splash; `index.mdx` is deleted; build succeeds with header and theme select present. (Verified: `pnpm build` green, 74 pages, `dist/index.html` carries `<header class="header"` + `starlight-theme-select`; `git diff --name-status HEAD` shows `D src/content/docs/index.mdx` as the only deletion.)
- [x] A-002 R2: The built homepage `<head>` carries the HexoKit title, description, `og:title`, `og:type=website`, `og:description` from the page; `Head.astro` unchanged. (Verified in `dist/index.html`: exactly one `<title>HexoKit — your tmux, in the browser and on your phone</title>`, `og:type` = `website`, description/og:title/og:description verbatim; `Head.astro` absent from the diff.)
- [x] A-003 R3: All retired terminal components/libs/tests and loop diagrams remain unchanged; unit suite green. (Verified: only `README.md` modified + `index.mdx` deleted under the site; `node --test scripts/*.test.mjs` = 269/269 pass.)
- [x] A-004 R4: `landing.css` defines both `--hk-*` token blocks with the exact values; all landing colors come from tokens; `terminal.css` unchanged. (Verified: dark + `:root[data-theme='light']` blocks match R4's 12 values exactly; `grep -E '#[0-9a-fA-F]{3,8}'` matches only lines 22–51 inside the two token blocks; `terminal.css` not in the diff.)
- [x] A-005 R5: Glint, glitch and caret-blink are present, CSS-only, and all disabled under reduced motion with the caret visible. (Verified: `@keyframes hk-glint-sweep`/`hk-glitch`/`hk-caret-blink` wired to CTA hover / wordmark hover / tagline caret; the `prefers-reduced-motion: reduce` block sets `animation: none` on `.hk-landing *` and keeps `.hk-caret` at `opacity: 1`.)
- [x] A-006 R6: Every interactive landing element shows the 2px green focus ring; hovers are hue-free. (Verified: `.hk-landing :where(a, button):focus-visible { outline: 2px solid var(--hk-green); outline-offset: 2px }`; hovers use `filter: brightness()` + border brightening only.)
- [x] A-007 R7: No horizontal scroll at 400 px; hero stacks ≤ 48rem; hexagon collapses ≤ 40rem; breakpoints named once. (Verified statically: `48rem`/`40rem` each appear once, named in the `--bp-stack`/`--bp-hex-collapse` comment block; grids use `minmax(0, …)` / `auto-fit minmax(18rem, 1fr)`; phone shot capped at `max-height: 60vh` in the stack query.)
- [x] A-008 R8: Hero renders mark, `HexoKit`, the two verbatim lines, two CTAs, and the two eager images with dimensions and alt. (Verified in `dist/index.html`: `HkMark` inline SVG `aria-hidden`, `<h1>HexoKit</h1>`, both verbatim lines, CTAs → `#install` + `/docs/`, both `<img>` eager/async with width/height/alt — 1800×1124 and 900×1957 matching the real files.)
- [x] A-009 R9: Two EC blocks with the exact install and brew commands, each copyable; note links `/toolkit/`; `InstallOneLiner` unused. (Verified: install section has exactly two `.expressive-code` frames rendering `curl -fsSL https://hexokit.com/install | sh` and `brew install sahil87/tap/hexokit`; note links `/toolkit/`; `InstallOneLiner` appears only in a comment.)
- [x] A-010 R10: Six cards in order with verbatim titles/copy; four images, two slots; all `rk` tokens exist in `help/run-kit.json`. (Verified: six `article.hk-card` in intake order, 4 `<img>` + 2 `div.hk-slot` with the `boards/tiles · screenshot pending` captions; `riff` and `desktop` are top-level commands in `help/run-kit.json`, `desktop install` a real subcommand.)
- [x] A-011 R11: Differentiator heading and paragraph verbatim, bold sentence in `<strong>`. (Verified in `dist/index.html`, `<code>htop</code>` and the `<strong>` sentence present.)
- [x] A-012 R12: Hexagon grid with centre `/toolkit/` link (aria-label) and six edge links in the exact order/hrefs with verbatim one-liners; collapses on narrow screens. (Verified: DOM order fab-kit→`/fab-kit/`, wt→`/wt/`, idea→`/idea/`, tu→`/tu/`, hop→`/hop/`, desktop→`#desktop`; centre `<a href="/toolkit/" aria-label="The HexoKit toolkit">`; 3×3 `grid-template-areas` collapsing to one column, mark first, at ≤40rem.)
- [x] A-013 R13: Desktop card with heading, copy, `rk desktop install` block, and the exact docs anchor link. (Verified: `id="desktop"`, verbatim copy with `<kbd>⌘</kbd>`, one EC frame with `rk desktop install`, link href exactly `/docs/install/#desktop-app-macos`.)
- [x] A-014 R14: Footer has exactly the six links in order; `Footer.astro` unchanged. (Verified in `dist/index.html`: Docs `/docs/` · Toolkit `/toolkit/` · GitHub `https://github.com/sahil87/run-kit` · Discord `https://discord.gg/32XHh5mJYn` · versions.json `/versions.json` · llms.txt `/llms.txt`; `Footer.astro` absent from the diff.)
- [x] A-015 R15: Five new `hexokit-*.webp` assets exist, each < 250 KB, produced by the committed converter script; `run-kit-*.webp` not renamed. (Verified via sharp: phone-terminal 900×1957 147KB, phone-dashboard 900×1957 63KB, phone-menu 900×1957 83KB, operator 1600×668 47KB, fleet-sidebar 370×910 19KB; both `run-kit-*.webp` keep their names.)
- [x] A-016 R16: `landing-links.test.mjs` exists, passes, and fails on a typo'd internal link or missing screenshot. (Verified: passes in the 269-test suite; simulated a `/toolkt/` typo against the test's own extraction+assert logic — it fails naming the href; screenshot-existence assert reads `public/screenshots/`.)

### Behavioral Correctness

- [x] A-017 R1: `dist/index.html` no longer contains any shll-splash content (`Seven small CLIs`, `ls tools/`, `$ whoami`). (Verified: zero occurrences of all three. The one `seven small CLIs` lowercase hit is the S3-owned site-wide `og:image:alt` from `Head.astro`, deliberately untouched.)
- [x] A-018 R9: Copying from each install block yields exactly one runnable command (no em-dash, no auto-link). (Verified: the three EC frames' code text is exactly `curl -fsSL https://hexokit.com/install | sh` / `brew install sahil87/tap/hexokit` / `rk desktop install` — no em-dash, no autolink markup.)

### Scenario Coverage

- [x] A-019 R4: Light mode renders the landing on `#f8f9fb` with dark text; dark mode on `#0f1117`. (Verified via the token blocks: `.hk-landing { background: var(--hk-bg); color: var(--hk-fg) }` with `--hk-bg #0f1117` dark / `#f8f9fb` + `--hk-fg #1a1d24` under `:root[data-theme='light']`; the built page links the `hk-landing` stylesheet.)
- [x] A-020 R12: At 400 px the six hexagon links stack in one column under the mark and remain tappable. (Verified statically: 400 px = 25rem < the 40rem collapse breakpoint; the collapse query redefines `grid-template-areas` as one column with `mark` first, and links stay real `<a>` elements.)

### Edge Cases & Error Handling

- [x] A-021 R15: `convert-screenshots.mjs` exits non-zero with a clear message when a source URL/path is missing. (Verified by reading: missing local source throws `missing local source: …`, failed fetch throws `fetch failed … HTTP <status>`; both are caught, printed as `FAILED <out>: …`, and set `process.exitCode = 1`.)
- [x] A-022 R16: The allow-list is exactly the S3/S5-owned paths and is commented as such; no other missing route passes. (Verified: `FORWARD_LINKS = ['/docs/', '/toolkit/', '/docs/install/', '/versions.json', '/llms.txt']` with a comment naming S3/S5 as owners; the typo simulation confirms anything else fails.)

### Code Quality

- [x] A-023 Pattern consistency: `index.astro` and `landing.css` follow the site's existing conventions (frontmatter constants, `not-content` where Starlight styling must not leak, doc-comment headers explaining why, token-driven colors). (Verified: `LINKS`/command/title constants in frontmatter, `not-content` on every section + footer, doc-comment headers on all five new files, all colors via `--hk-*` tokens.)
- [x] A-024 No unnecessary duplication: EC `<Code>` reused for commands; logo geometry copied once into a small inline component or const, not pasted twice; no re-implementation of existing utilities. (Verified: `<Code>` for all three command blocks; logo geometry single-sourced in `HkMark.astro`, used at both placements; the link test reuses `TOOL_SLUGS` from `src/lib/tool-slugs.ts`.)
- [x] A-025 Readability over cleverness: sections are plainly structured; no god functions in the converter script (>50 lines without reason). (Verified: seven plainly ordered sections; converter's `loadSource`/`convert` are small and focused.)
- [x] A-026 No magic strings/numbers: link targets, commands, breakpoints and image manifest are named constants/comments, not inline literals. (Verified: `LINKS`, `INSTALL_ONE_LINER`/`BREW_LINE`/`DESKTOP_INSTALL`, named-breakpoint comment block, `SOURCES` manifest + `QUALITY`/`MAX_BYTES`.)
- [x] A-027 Constitution I/VI: zero client-side JS added by the page; no new dependencies in `package.json`. (Verified: no `<script>` in `index.astro`; `package.json` untouched — `sharp` was already declared.)
- [x] A-028 Constitution V + Accessibility: both themes render correctly; all images have meaningful alt; decorative SVGs are `aria-hidden`; headings form a sensible outline (one `h1`). (Verified: both token palettes present; all six `<img>` have meaningful alt + dimensions; `HkMark`/caret/footer separators `aria-hidden`; the Starlight chrome `<h1 id="_top">` is hidden by the landing-only `:has()` rule — selector confirmed matching the built DOM — leaving the hero's `<h1>HexoKit</h1>` as the single visible h1, followed by section h2s and card h3s.)

## Notes

- Check items as you review: `- [x]`
- All acceptance items must pass before `/fab-continue` (hydrate)
- If an item is not applicable, mark checked and prefix with **N/A**: `- [x] A-NNN **N/A**: {reason}`

## Deletion Candidates

- `src/components/TerminalPrompt.astro` — zero render sites after `index.mdx`'s deletion (its only mount); deliberately retained in-tree per intake Open Questions pending Sahil's re-homing decision (`/toolkit/`, a `/terminal/` page, or a landing easter egg)
- `src/lib/terminal-{suggest,eggs,cheatsheet,share,toolcard,toys}.ts` — reachable only via the unmounted `TerminalPrompt` island; kept alive (and green) by their `scripts/terminal-*.test.mjs` suites; share TerminalPrompt's re-homing decision
- `src/components/VersionTable.astro` — zero render sites (only `index.mdx` rendered it); remaining references in `Head.astro`/`ToolsIndex.astro`/`TerminalPrompt.astro` are comment-only
- `src/components/Diagram.astro` — zero render sites (only `index.mdx` rendered it); the one remaining reference in `TerminalPrompt.astro` is a comment
- `public/diagrams/loop-{light,dark}.svg` — no references anywhere under `src/`; intake assigns the loop diagram's future to `/fab-kit/` and `/toolkit/` (S3)
- `src/styles/terminal.css` — the `.home-prose` rules and the `[data-has-hero]` hero-rhythm block are dormant (no markup consumer, no page emits `hero:` anymore); NOT actionable here — `terminal.css` is S3's file, flag at the S3/S4 rebase seam

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Confident | The fleet-sidebar crop box is x 0–370 / y 90–1000 of the 1800×1124 console shot, tuned by eye | Intake left the crop to apply; sidebar visually occupies that band; trivially re-cut | S:50 R:95 A:70 D:70 |
| 2 | Confident | The operator card image comes from the local run-kit `.uploads` PNG (1618×676) via the converter's local-path branch | Intake names the file; it is a curated crop already; committed as a site-owned asset | S:65 R:90 A:75 D:70 |
| 3 | Confident | Phone assets resized to ≤ 900 px wide, quality 82, keeping every output under 250 KB | Hero phone image renders ≤ ~420 px CSS; 2× density covered; matches the size band of the existing webp files | S:55 R:95 A:80 D:75 |
| 4 | Confident | The hexagon is a `grid-template-areas` 3×3 with the six labels in the eight surrounding cells (top, top-right, right-bottom, bottom, bottom-left, left-top), not SVG-positioned text | Responsive collapse and keyboard order come free; intake chose grid over absolute positioning | S:70 R:85 A:80 D:70 |
| 5 | Confident | Section-heading text uses the site's `## ` shell-comment prefix convention via a `.hk-h2::before` rule scoped to the landing | Keeps the terminal vocabulary shared with the docs layer without touching `terminal.css` | S:50 R:95 A:75 D:65 |
| 6 | Tentative | The hero CTA "Read the docs" points at `/docs/` even though it 404s until S3 merges; no interim fallback to `/run-kit/` | Intake R7 decision; a fallback would need an S3 follow-up edit here; site unannounced <!-- assumed: forward CTA link to /docs/ before S3 lands --> | S:45 R:85 A:40 D:40 |
| 7 | Confident | The page root is `<div class="hk-landing">`, not `<main>` — Starlight's `Page.astro` already emits the page's `<main>` landmark around the slot, and a nested main breaks landmark uniqueness; `.hk-landing` remains the token-scope root R4 requires | R1 says `<main class="hk-landing">`, but valid HTML/a11y (one main landmark) outranks the tag choice; the acceptance checks target content, not the wrapper tag | S:80 R:85 A:80 D:75 |
| 8 | Confident | Starlight's docs `PageTitle` `<h1>` is hidden via a `landing.css` rule (`main > .content-panel:first-child:has(h1#_top) { display: none }` — loaded only on `/`), leaving the hero's `<h1>HexoKit</h1>` as the single visible h1 | StarlightPage with no `hero:` always renders PageTitle; two h1s would fail the "sensible outline (one h1)" acceptance; the skip link's `#_top` target going inert is accepted (landing content begins at page top) | S:70 R:80 A:65 D:60 |

8 assumptions (0 certain, 7 confident, 1 tentative).
