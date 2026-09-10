---
type: memory
description: 'The `/` HexoKit product landing page: `src/pages/index.astro` wrapping a StarlightPage splash with a custom body (no `index.mdx`); `landing-data.ts` as the single copy/link/asset module plus its `landing-data.test.mjs` contract (roster mounts, `rk <verb>` ∈ `help/hexokit.json`); the `build-landing-screenshots.mjs` asset pipeline; `landing.css` (breakpoints, gated motion, the accent-as-text contrast exception, the phone-width header override); `ToolkitHexagon.astro`; the drift surfaces.'
---
# Landing Page (`/`)

**Domain**: site

## Overview

`/` is the HexoKit product landing page for the live build (`sites/astro-starlight-terminal1`). It is a single-product marketing page — hero, install, seven feature cards (six in a grid plus one full-width), the agent-agnostic differentiator, the toolkit hexagon, the desktop-app card and a link footer — hand-written on the site, not synced from any producer repo. Its copy follows the site's copy rule (`fab/project/context.md` § Copy on this site: minimal, natural, said-aloud register). It is the only page on the site whose depth is site-authored copy rather than a pulled README slice or generated command reference; the constitution's Tool-Page Depth mechanical-sync rule governs *tool docs*, and its third content class (site-owned curated screenshots, v2.1.3) is what the page's imagery rides.

Every string, link and image reference lives in `src/lib/landing-data.ts`; the page templates only lay that data out. The page ships **no client JavaScript of its own** (Constitution I) — the only scripts on it are Starlight's theme/Pagefind and Expressive Code's copy button, both already carried by every page.

## Route and shell

`src/pages/index.astro` owns `/`. It renders `<StarlightPage template="splash">` and fills the slot with `<main class="landing not-content">`. `src/content/docs/index.mdx` does not exist — the Starlight content route for `/` would collide with the `src/pages/` route, so exactly one of the two can claim it.

Wrapping `StarlightPage` (rather than authoring a standalone `<html>` page) means the header nav, theme select, Pagefind, `Head.astro` (analytics beacon, site-wide og:image, homepage JSON-LD) and `Footer.astro` all render on `/` unchanged. `src/pages/[mount]/[...path].astro` is the same pattern.

**Head metadata** rides `frontmatter.head` on the `StarlightPage` call: a `title` tag, an `og:title` meta and an `og:type: website` meta, plus the page `description`. Starlight's head merge gives frontmatter priority and dedupes the singleton `<title>` and same-`property` metas, so the built page carries exactly one of each. See [seo-social-meta](../../../../../docs/memory/conventions/seo-social-meta.md).

**Splash chrome the page opts out of.** Starlight's splash template renders the frontmatter `title` as a page H1 in its own content panel above the slot; the landing has its own H1 (the tagline), so `landing.css` hides that panel via `body:has(.landing) .content-panel:has(> .sl-container > h1#_top)`, zeroes the panel's border/padding and lifts `.sl-container`'s max-width. The `title` itself stays — it drives the sidebar label, Pagefind's result title and Starlight's `<title>` merge.

**Version eyebrow.** The hero eyebrow reads `version` from the repo-root `help/hexokit.json` at build time through `repoRootFromModuleUrl` + `normalizeVersion`, inside a try/catch: a missing or malformed envelope drops the version and the eyebrow still renders. Producer-refreshed data never fails the site build (the same skip-degrade posture the terminal tool cards take, and the opposite of `VersionTable`'s build-stop).

**Inline code in copy.** `index.astro`'s `inlineCode()` HTML-escapes a copy string first, then turns backtick spans into `<code>`. It is the one markup the data file may carry, and escaping-before-transform is what makes the `set:html` hand-off safe.

## Sections and where their copy comes from

In render order:

| Section | Source of copy |
|---|---|
| `#top` hero | `HERO` (tagline and sub-line are verbatim brand strings; the lead is a three-sentence, 31-word version of the README's opening framing — copy study 2). Three CTAs: Install → `#install`, Read the docs → `/docs/`, GitHub → `GITHUB_URL` built from `repoFor('hexokit')`. Two eager `<img>`s with explicit dimensions. |
| `#install` | `INSTALL_LINES` — two Expressive Code `<Code>` blocks (`curl -fsSL hexokit.com/install \| sh`, `brew install sahil87/tap/hexokit`), then two note lines authored in the template. `InstallOneLiner.astro` is deliberately not used: it carries the `shll.ai/install` whole-toolkit form, and the landing's is the product-first line. |
| `#features` | `FEATURES` — seven cards, each an image + title + copy + a `/docs/…` link; the last carries `wide: true` and spans the grid with its screenshot beside the copy (the operator console's Quake-style drawer). |
| `#agnostic` | The differentiator paragraph and the *It is / It isn't* rows, authored in the template from the product README's agent-agnostic passage. |
| `#toolkit` | `ToolkitHexagon.astro`, reading `TOOLKIT_EDGES`. |
| `#desktop` | The card copy is authored in the template from the README's desktop-app section; `DESKTOP_COMMANDS` supplies the `rk desktop install` / `rk desktop update` block. Links `/docs/install/` (the page, not its `#desktop-app-macos` anchor, so an upstream heading rename cannot break it). |
| `footer.landing-footer` | `FOOTER_LINKS` — Docs, Toolkit, GitHub, Discord, versions.json, llms.txt. Starlight's own `Footer.astro` copyright row still renders below it. |

The section `id`s are in-page anchor targets: the hero CTA targets `#install`, and `#desktop` is the marketing card. The hexagon's `desktop` edge targets the separate `/desktop/` page, not this anchor.

## `landing-data.ts` and its contract test

`src/lib/landing-data.ts` exports `HERO`, `INSTALL_LINES`, `DESKTOP_COMMANDS`, `FEATURES`, `TOOLKIT_EDGES`, `FOOTER_LINKS` and `GITHUB_URL`, typed and dependency-free beyond `src/lib/tool-slugs.ts`. Tool links are resolved through the roster: `mountHref(slug)` wraps `mountFor` and throws on an unrostered slug rather than emitting `/null/`, and `GITHUB_URL` comes from `repoFor('hexokit')` (the `HeaderNav.astro` idiom). See [tool-roster](../../../../../docs/memory/conventions/tool-roster.md).

Every `LandingImage` carries `src`, `alt`, and the **real** intrinsic `width`/`height` of the committed webp — the browser reserves the box before the image loads, so the lazy card images do not reflow the page.

`scripts/landing-data.test.mjs` (`node --test`, Node ≥ 22 native `.ts` type-stripping, the `scripts/terminal-toolcard.test.mjs` harness) is the contract. It asserts:

- **The `vn39` hard rule, mechanized.** Every backticked `` `rk <verb>` `` token across all copy strings (hero, feature titles/copy/alt, edge blurbs) names an entry of the repo-root `help/hexokit.json` `root.commands[].name`. A sub-verb like `rk desktop install` validates on its first word. "boards" is deliberately prose and never backticked; a copy edit introducing `` `rk boards` `` fails here. Two guard tests keep the check from going vacuous and pin the negative case.
- **Roster-derived links.** Every `TOOLKIT_EDGES` entry whose slug is a tool passes `isToolSlug` and links `` `/${mountFor(slug)}/` ``; the `desktop` edge links `/desktop/`, not `#desktop`; the six are the expected tools in clockwise order.
- **The exact lists.** `INSTALL_LINES` are the two strings in order; `FOOTER_LINKS` are the six in order; `GITHUB_URL` is roster-derived; every feature card is complete and links under `/docs/`; every image has alt text; and the declared dimensions match the committed webp files on disk.

CI's `node --test scripts/*.test.mjs` picks the file up with no workflow edit.

## Screenshot pipeline

Ten curated webps ship under `public/screenshots/hexokit-*.webp`: `hero-desktop`, `hero-phone`, `phone-terminal`, `agent-state`, `fleet`, `board`, `operator`, `web-tile`, `operator-console`, `desktop-app`. `fleet` is a re-crop of the pre-existing committed `run-kit-agent-session.webp` (the generator accepts `file:` sources for exactly this case); the original stays in place for the tool pages.

`scripts/build-landing-screenshots.mjs` is the committed, **unwired** producer (sharp; the `scripts/generate-og-image.mjs` precedent — not referenced from `package.json`, no new dependency). It holds a `SOURCES` map of `{ out, prefix, crop, maxWidth }` so any asset can be re-derived or re-cropped without redoing the visual triage. Only the outputs are committed; the multi-megabyte source PNGs are not.

- **Source pool**: a flat macOS screenshot folder (`--source-dir` overrides the default), holding ~1,200 `Screenshot <date> at <time>.png` captures.
- **The U+202F gotcha.** macOS puts a NARROW NO-BREAK SPACE (U+202F), not U+0020, before `AM`/`PM` in those filenames, so a typed-space literal never matches. Sources are resolved by `readdirSync` + `startsWith` on the unambiguous date/time prefix, which sidesteps the character entirely. Do not "fix" the prefixes by appending ` AM`/` PM`.
- **Crop boxes** are sharp `extract` boxes in source pixels, each annotated with what it keeps. `hero-desktop` drops the macOS menu bar (rows 0–65 of a 3024×1964 14" capture). `desktop-app` deliberately **keeps** the menu bar — it is the evidence that the card describes a real native shell. The phone captures are kept whole. **Card crops are tight** (the zoom rule): each feature-card asset is a ~16:10 box on the one UI region its claim is about, at a scale where the UI text is still legible inside a card a few hundred pixels wide — `agent-state` on the hero source's lower-left (lower sidebar list + `agt idle` strip, 1000×625), `fleet` on the server grid + session list (760×475), `board` on two pinned panes starting below the app's light title strip (1480×925 → 1400×875), `operator` on the popover's left two thirds (1080×675), `web-tile` on the tile plus the terminal's right edge (1700×1062 → 1400×875), `operator-console` a 2.2:1 box across the whole tab for the wide card (2446×1110 → 1600×726). Full-window captures read as unreadable thumbnails at card size; the hero and desktop-card frames stay wide because they render large.
- **Budgets**: webp quality 80, metadata stripped, `withoutEnlargement` on the resize; widths ≤ 2400 (hero desktop), ≤ 800 (phones), ≤ 1600 (the rest). Shipped weights are 45–289 KB, under the ≤350 KB hero / ≤150 KB phone / ≤250 KB card ceilings. A crop box exceeding its source throws with the offending geometry.

Every crop is eyeballed for sensitive text (tokens, emails, private hostnames) before commit.

## `landing.css`

Imported by `index.astro` only — deliberately not registered in `astro.config.mjs` `customCss`, since the landing is the single consumer. Everything is scoped under `.landing` / `.landing-footer` / `#toolkit`, and `terminal.css` is untouched.

**Tokens.** Every colour resolves from the site's existing `--c-*` custom properties, so light/dark parity is automatic (Constitution V). Layout scale is named once as custom properties (`--landing-max: 72rem`, `--landing-gutter`, `--landing-section-gap`, `--landing-radius`, `--landing-frame-border`, `--landing-phone-stacked-max`).

**Accent-as-text exception.** `--c-accent` is tuned as a border/fill colour. As small text it clears WCAG AA on dark (8.7:1) but reaches only ~3.5:1 on `--c-bg` and ~3.2:1 on `--c-surface` in the light "paper" theme — below the 4.5:1 floor the constitution requires in **both** themes. The landing therefore reads accent text through its own annotated trio, declared on `.landing, .landing-footer, #toolkit`: `--landing-accent-text` (the shared accent in dark; `#7a5310` in light — 6.0:1 on `--c-bg`, 5.5:1 on `--c-surface`), `--landing-on-accent` (the ink on an accent fill: `--c-bg` in dark; `#fffdf7` in light, 5.6:1 against the deeper fill where `--c-bg` on the mid-tone light accent would read 3.5:1), and `--landing-accent-fill`. Those two light-theme hex literals are the file's only palette values not traceable to a token. With them, every landing text pair measures 4.85:1–8.70:1 in both themes.

**Breakpoints** (literal widths, each named in a comment because custom properties are not allowed in `@media`): 40rem — the feature grid gains a second column, the contrast rows split, and the hexagon labels collapse; 48rem — the desktop card and the hexagon each split into two columns; 60rem — the hero splits into copy + screenshots, the feature grid reaches three columns, and the phone frame stops stacking and overlaps the desktop frame's lower-right corner (with reserved padding so the next section cannot collide with it). Below 60rem the phone stacks beneath the desktop shot, centred and capped at `--landing-phone-stacked-max` (260px).

**Motion vocabulary**, borrowed from the product's own UI (`app/frontend/src/globals.css` in the source repo) so site and app read as one thing: the bracket section label's blinking caret cell (`landing-caret-blink`, 1.06s `steps(1)`), a one-shot typed-sweep inverse-video block across a section label on hover (the CSS-only cousin of the app's per-character typed reveal), a CRT glint — a skewed highlight strip sweeping the primary CTA's face on hover — and a faint static scanline overlay on screenshot frames. **All of it lives inside one `@media (prefers-reduced-motion: no-preference)` block**, so the rest state *is* the reduced-motion state and there is nothing for a `reduce` override to undo.

**Card image framing.** `.landing-card-shot` is a fixed 16/10 window with `object-fit: cover; object-position: top center`, so cards align on a grid row regardless of source aspect (the phone shots are 0.46:1) and each image keeps its identifying header row. `.landing-card-wide` spans the grid (`grid-column: 1 / -1`) and from 40rem lays the card out as a row — a 60%-wide 2.2:1 screenshot window beside vertically-centred copy; below 40rem it is an ordinary stacked card.

### The phone-width header override

Starlight hides the header's `.right-group` below its `md` breakpoint because on a docs page the mobile sidebar carries those destinations. The landing has no sidebar, so at 400px a phone visitor would get no theme toggle (Constitution V asks for both themes to *work*, which means reachable) and no nav. `landing.css` therefore restores `display: flex` on `.right-group` for this route, lets the header wrap under 50rem with the group taking the full second row, and raises `--sl-nav-height` to `6.5rem` on `body:has(.landing)` to match the now-two-row fixed header — otherwise the hero slides under it and the tagline is clipped. `auto` is not usable there: the variable is consumed as a length in `padding-top`/`scroll-padding-top` calculations.

Every rule in this block is prefixed `body:has(.landing)`, so no docs page is affected. It is a known risk surface: `.right-group`, `.content-panel` and `.sl-container` are Starlight's own unhashed class names, not a public API, and a Starlight upgrade that renames or restructures them silently drops these overrides. `HeaderNav.astro` itself is not edited.

## `ToolkitHexagon.astro`

The `#toolkit` section: the cube-in-hexagon brand mark with the six companions on its six edges, plus an adjacent textual list.

- **The SVG is decorative** — `aria-hidden="true"`, `focusable="false"`. Its polygon coordinates AND fill colours are copied verbatim from `src/assets/logo.svg` (viewBox `7 10 50 44`) — the same fixed greys in both themes; it is inlined only so the edge labels can be positioned against the same box.
- **The six labels are ordinary HTML `<a>` elements** positioned over the mark by a per-index `EDGE_POSITIONS` entry (`top`/`left`/`translate` custom properties). Side labels are pushed fully clear of the box rather than centred on the edge midpoint, where the label chip and the artwork fought each other and the longest label was clipped. Each has a visible `:focus-visible` ring; tab order follows `TOOLKIT_EDGES`.
- **Below 40rem** the absolute positioning is dropped entirely: the mark box becomes a two-column grid and the six labels reflow into a plain 2×3 block beneath the svg. Visual reading is then row-major while DOM and keyboard order stay clockwise.
- **The adjacent `<ul>`** carries one blurb per edge — the constitution's textual-explanation-beside-a-decorative-diagram constraint, and the section's real "what each tool is for" content.

## Hand-copy drift surfaces

The landing carries site-authored copy, so the hard `vn39` rule binds it (mechanized by the contract test above) and two hand-copy surfaces need naming:

1. **The six hexagon blurbs** (`TOOLKIT_EDGES[].blurb`) are the landing's own short lines (6–7 words each: "a plan before any agent writes code.", "throwaway git worktrees, one per change.", "catch an idea without breaking flow.", "what your AI coding sessions cost.", "jump to any of your repos.", "the Mac app around the dashboard."). They are NOT a copy of the longer one-liners in `src/content/docs/toolkit/index.mdx` § The six companions and are not expected to match them word for word; the only cross-file discipline is that both describe the same job for each tool, so when a tool's job changes, edit both on purpose (a9xx).
2. **The author links** (GitHub / LinkedIn `ahujasahil` / noon.design) exist in exactly two carriers: `Footer.astro` (LinkedIn + noon.design on the copyright row) and the `TerminalPrompt` `whoami` egg (all three). The landing adds no third copy. See [tool-page-rubric](../../../../../docs/memory/conventions/tool-page-rubric.md).

## Shared surfaces the landing inherits but does not edit

`HeaderNav.astro`, `Head.astro` (the analytics beacon, the site-wide og:image, the homepage JSON-LD graph) and `Footer.astro` all render on `/` through the `StarlightPage` wrapper. The landing touches none of them; `astro.config.mjs`, `terminal.css` and `InstallOneLiner.astro` are likewise untouched.

## Requirements

### Requirement: `/` is served by one route with deduped head metadata
The site MUST serve `/` from `src/pages/index.astro` and MUST NOT carry a competing `src/content/docs/index.mdx`. The built page SHALL contain exactly one `<title>`, one `og:title`, one `og:type` (`website`) and one meta description, and SHALL retain the `Head.astro` beacon and og:image.

#### Scenario: A clean build serves the landing at `/`
- **GIVEN** a clean `pnpm build`
- **WHEN** `dist/index.html` is inspected
- **THEN** it carries the landing hero markup, Starlight's header and the `Footer.astro` copyright row, with no sidebar, no table of contents and no pagination
- **AND** the build log carries no duplicate-route warning for `/`

### Requirement: Landing copy names only real commands
Every backticked `` `rk <verb>` `` token in `src/lib/landing-data.ts` MUST name an entry of `help/hexokit.json` `root.commands[].name`.

#### Scenario: A copy edit invents a command
- **GIVEN** a `FEATURES` copy string edited to name `` `rk boards` ``
- **WHEN** `node --test scripts/landing-data.test.mjs` runs
- **THEN** it fails, naming the offending token

### Requirement: Tool links resolve through the roster
The hexagon's tool edges and the GitHub CTA MUST derive their targets from `src/lib/tool-slugs.ts` (`mountFor`, `repoFor`), never from a hardcoded `/<slug>/` or `sahil87/<slug>`.

#### Scenario: An unrostered slug reaches the data module
- **GIVEN** a `TOOLKIT_EDGES` entry naming a slug absent from the roster
- **WHEN** the page builds
- **THEN** `mountHref` throws naming the slug, rather than emitting `/null/`

### Requirement: The page ships no client JavaScript of its own
`src/pages/index.astro`, `ToolkitHexagon.astro` and `src/styles/landing.css` SHALL add no `<script>` to the built page. Every animation MUST sit inside `@media (prefers-reduced-motion: no-preference)`.

#### Scenario: A visitor prefers reduced motion
- **GIVEN** `prefers-reduced-motion: reduce`
- **WHEN** the landing is viewed
- **THEN** no caret blink, typed sweep, CTA glint or scanline overlay runs, and no rule has to be undone to achieve it

### Requirement: Both themes and both widths are legible
Every landing text pair MUST meet WCAG AA (4.5:1 for body text) in both themes, and the page MUST NOT scroll horizontally at 400px.

#### Scenario: Accent-coloured text on the light palette
- **GIVEN** the light theme
- **WHEN** the sub-line, the primary CTA ink or a card link is measured against its background
- **THEN** each reads ≥ 4.5:1, because those surfaces resolve `--landing-accent-text` / `--landing-on-accent` rather than `--c-accent` directly

### Requirement: The header's right group stays reachable on the landing
On `/`, the theme select and the header nav MUST remain visible and clickable at phone width.

#### Scenario: A phone visitor wants the other theme
- **GIVEN** a 400px viewport on `/`
- **WHEN** the header is inspected
- **THEN** the right group renders on its own wrapped row and `--sl-nav-height` is raised to match, so the hero is not clipped under the fixed header

## Design Decisions

### StarlightPage splash wrapper over a standalone page
**Decision**: `src/pages/index.astro` wraps `<StarlightPage template="splash">` and owns only the body; `src/content/docs/index.mdx` is gone.
**Why**: The header, theme toggle, Pagefind, `Head.astro` (beacon, og:image, JSON-LD) and `Footer.astro` are shared site surfaces; wrapping means work on any of them lands on `/` with no second copy to maintain, and `src/pages/[mount]/[...path].astro` already proves the pattern.
**Rejected**: A standalone `<html>` page — duplicates the nav/head/theme/analytics plumbing and guarantees conflicts with any change to those surfaces.
*Introduced by*: 260910-lvnp-hexokit-landing

### Content as data (`landing-data.ts`) with a contract test
**Decision**: All copy, links, install lines and asset references live in one typed module; the `.astro` files only render it.
**Why**: A copy edit becomes a data edit, and the copy becomes testable — `landing-data.test.mjs` mechanizes the `vn39` hard rule (`rk <verb>` ∈ `help/hexokit.json`) and the roster gate for the hexagon, neither of which prose embedded in a template could be asserted on.
**Rejected**: Copy inline in the `.astro` template — untestable, and hand-copied tool one-liners have drifted on this site before.
*Introduced by*: 260910-lvnp-hexokit-landing

### HTML link labels over an SVG with `<a>` children
**Decision**: The hexagon SVG is decorative (`aria-hidden`, `focusable="false"`); the six edge labels are ordinary `<a>` elements positioned over it, with an adjacent `<ul>` explanation.
**Why**: Keyboard focus, visible focus rings and screen-reader reading order are straightforward in HTML; SVG anchors behave inconsistently across browsers and assistive tech and are awkward to give a focus ring (constitution Accessibility constraint).
**Rejected**: `<a>` inside the SVG — harder focus styling, worse reading order.
*Introduced by*: 260910-lvnp-hexokit-landing

### Committed webp assets produced by a checked-in sharp script
**Decision**: `scripts/build-landing-screenshots.mjs` holds the source map and crop boxes; only the derived webps are committed.
**Why**: Reproducible curation without committing multi-megabyte sources; the constitution's third content class blesses site-owned curated screenshots; `sharp` is already a dependency and the script stays unwired, exactly like `generate-og-image.mjs`.
**Rejected**: `astro:assets` `<Image>` over raw PNGs in `src/assets/` — commits the sources and hands crop decisions to the build.
*Introduced by*: 260910-lvnp-hexokit-landing

### Accent-as-text is a landing-scoped token trio, not a palette change
**Decision**: The landing declares `--landing-accent-text` / `--landing-on-accent` / `--landing-accent-fill` on its own roots, resolving to `--c-accent` in dark and to two annotated hex literals in light.
**Why**: `--c-accent` is a fill colour that fails WCAG AA as small text on the light paper background (~3.5:1 on `--c-bg`, ~3.2:1 on `--c-surface`), and the constitution requires AA in both themes. Scoping the fix to the landing shifts no other page's appearance. The same failure applies to `--c-accent`-as-text anywhere on the site, so the site-wide fix belongs in `terminal.css`'s light palette (a shared `--c-accent-text` token) — the next surface that needs accent text should promote it there rather than re-deriving a second shadow palette.
**Rejected**: Using `--c-accent` directly as text (fails AA in light); editing `terminal.css`'s palette from the landing (a site-wide visual change smuggled in by a single page).
*Introduced by*: 260910-lvnp-hexokit-landing

### The header's mobile hiding is overridden for the landing route only
**Decision**: `landing.css` restores `.right-group`, wraps the header and raises `--sl-nav-height` to `6.5rem` under 50rem, every rule prefixed `body:has(.landing)`.
**Why**: Starlight hides the right group on small screens because a docs page's mobile sidebar carries the same destinations; the landing has no sidebar, so without the override a phone visitor has no theme toggle and no nav. Route-scoping through `:has()` keeps every docs page exactly as it was, and `HeaderNav.astro` — a shared component — stays unedited.
**Rejected**: Editing `HeaderNav.astro` or Starlight's own breakpoint (changes every page for one page's problem); leaving the group hidden (a theme toggle that cannot be reached fails Constitution V in practice).
*Known risk*: the override targets Starlight's unhashed `.right-group` / `.content-panel` / `.sl-container` class names, which are not a public API — a Starlight upgrade that renames them drops these rules silently, so re-check the landing at phone width after upgrading.
*Introduced by*: 260910-lvnp-hexokit-landing

### The terminal island and `VersionTable` stay in the tree, unmounted
**Decision**: `TerminalPrompt.astro`, the six `src/lib/terminal-*.ts` libs, their `scripts/terminal-*.test.mjs` suites and `VersionTable.astro` remain committed with no page mounting them.
**Why**: A user decision recorded in this change's intake keeps the terminal available for a possible `/toolkit/` mount; deleting ~7 modules and their 121 tests would destroy work a follow-up may want, and the tests still run green in CI. `VersionTable` lost its only consumer with the old homepage and is retained for the same reason.
**Rejected**: Deleting them with the homepage (irreversible in practice — the island is the largest single body of work on the site).
*Follow-up*: this change's `## Deletion Candidates` enumerates the resulting unmounted surface — the terminal modules and tests, `VersionTable.astro`, and `terminal.css`'s `.home-prose` / `.tools-listing` selector groups, which now style markup no page emits. If the `/toolkit/` mount is abandoned, that list is the cleanup.
*Introduced by*: 260910-lvnp-hexokit-landing

### The landing's blurbs are their own, shorter set
**Decision**: `TOOLKIT_EDGES[].blurb` is landing copy — one 6–7-word line per companion; `src/content/docs/toolkit/index.mdx` keeps the long one-liners for the directory page, and the two sets are not a copy of each other.
**Why**: A landing blurb and a directory-page blurb do different jobs, and the verbatim coupling cost about 30 words in the page's densest section for no reader benefit; Sahil chose decoupling explicitly after copy study 2.
**Rejected**: Keeping the verbatim copy and taking the word cut elsewhere — the blurbs were the least natural strings left on the page.
*Introduced by*: 260910-a9xx-landing-copy-minimal

### Copy follows the minimal, natural register
**Decision**: Every string on the landing is written to be said aloud — short sentences with one claim each, outcome over mechanism, plain punctuation, the reader's own words bare, no insider terms — per `fab/project/context.md` § Copy on this site, which points at the two studies in `docs/findings/` (`landing-copy-study.md` for structure and claims, `landing-copy-study-2-minimal.md` for volume and register). Two user-decided exceptions to study 2's shortest versions: card 7 keeps "Quake-style" once and card 6 keeps the GUI display as a third short item.
**Why**: Measured against eight minimal developer-tool landings, the page's card bodies ran twice the genre's median length and 43 % of its sentences carried an em-dash; the rewrite (712 → ~525 words) keeps every claim the competitive-landscape doc calls defensible.
**Rejected**: Leaving the README's register on the landing — a README reader has opted in to the length, a landing reader has not.
*Introduced by*: 260910-a9xx-landing-copy-minimal

## Key Files

- `src/pages/index.astro` — the route, the `StarlightPage` wrapper and head, the build-time version read, `inlineCode`, and the hero / install / features / agnostic / desktop / footer markup.
- `src/components/ToolkitHexagon.astro` — the `#toolkit` section: the inline brand mark (original colours), `EDGE_POSITIONS`, the six anchors and the blurb list, with its own scoped styles and the sub-40rem collapse.
- `src/lib/landing-data.ts` — every string, link and image reference on the page, plus `mountHref` and `GITHUB_URL`.
- `src/styles/landing.css` — the splash-chrome opt-out, the header override, the accent-as-text trio, layout scale, breakpoints and the reduced-motion-gated motion block.
- `scripts/landing-data.test.mjs` — the copy/link contract (`vn39` tokens, roster mounts, the exact lists, image dimensions against the files on disk).
- `scripts/build-landing-screenshots.mjs` — the unwired sharp generator: source map, crop boxes, budgets.
- `public/screenshots/hexokit-*.webp` — the eight committed assets.
