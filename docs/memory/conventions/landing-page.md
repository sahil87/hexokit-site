---
type: memory
description: "The HexoKit product landing page at `/`: a custom `src/pages/index.astro` inside StarlightPage splash chrome with a landing-scoped `--hk-*` token layer (run-kit palette, dark + light), the fixed section order and verbatim copy, CSS-only motion ports under a reduced-motion gate, the `LINKS` const and its route-existence test, the `hk-slot` image-slot convention and pending captures, the site-owned `hexokit-*.webp` assets and their converter script, and the header-palette seam"
---
# Landing Page

## Overview

The site's `/` route is a hand-written product landing page for **HexoKit**, served by `sites/astro-starlight-terminal1/src/pages/index.astro` — a custom Astro page, not a Starlight content page (no `src/content/docs/index.mdx` exists; a content page and this page would both emit `/`). It renders inside Starlight chrome via `<StarlightPage>` with `frontmatter={{ title: 'HexoKit', template: 'splash', tableOfContents: false, head: [...] }}` — no `hero:` key, so Starlight's `[data-has-hero]` styling never fires — keeping the site header (logo, theme toggle, search) and site footer while dropping the sidebar and right rail (jwhx).

The page root is `<div class="hk-landing">`, NOT `<main>` — Starlight's `Page.astro` already emits the `<main>` landmark around the slot, and a nested main would break landmark uniqueness. Starlight's docs `PageTitle` `<h1>` is hidden by a landing-only CSS rule (`main > .content-panel:first-child:has(> .sl-container > h1#_top) { display: none }`), leaving the hero's `<h1>HexoKit</h1>` as the single visible h1. The page adds zero client JS (Constitution I — the only script is Expressive Code's copy button, shipped site-wide) and no new dependencies (Constitution VI).

## Sections, in order

Every section is a `<section>` with an `aria-labelledby` heading; headings carry the site's `## ` shell-comment prefix via a landing-scoped `.hk-h2::before` rule. All copy decisions trace to the cross-repo hexokit-rebrand plan's § Site shape (D6); the tagline, sub-line and differentiator paragraph are verbatim and survive any redesign.

1. **Hero** — the `HkMark` inline SVG (`aria-hidden`) beside `<h1>HexoKit</h1>`; the tagline verbatim **"Your tmux, in the browser and on your phone."** followed by a blinking block caret; the sub-line verbatim *"Cockpit for the agent era."*; two CTAs — primary `Install` → `#install`, secondary `Read the docs` → `/docs/`; then two eager (`loading="eager"`, `decoding="async"`, explicit `width`/`height`, meaningful `alt`) screenshots side by side — desktop `run-kit-console.webp` (1800×1124) left, phone `hexokit-phone-terminal.webp` (900×1957) right — stacking (desktop above phone, phone capped at `60vh`) at ≤48rem (`--bp-stack`).
2. **Install** (`#install`) — two Expressive Code `<Code lang="bash">` blocks, each rendered from a frontmatter constant (`INSTALL_ONE_LINER = 'curl -fsSL https://hexokit.com/install | sh'`, `BREW_LINE = 'brew install sahil87/tap/hexokit'`), so each line copies alone via the EC copy button; a note under them links `/toolkit/`. `InstallOneLiner.astro` is deliberately NOT reused — it hardcodes `https://shll.ai/install`, is roster-gated on tool slugs, and renders the whole-toolkit story. Both commands are forward-looking: `/install` and the `hexokit` brew formula go live in later rebrand changes (S5/C2); until then a copied command fails — accepted because the site is unannounced (D13).
3. **Features** — six `<article class="hk-card">` in a `repeat(auto-fit, minmax(18rem, 1fr))` grid, each an image (or image slot) + `<h3>` + one or two sentences, copy adapted from the run-kit README (the canonical source). Every `rk <verb>` named in card prose is a top-level command in `help/hexokit.json` (the product's pulled help file, keyed by its roster slug — see [tool-roster](/conventions/tool-roster.md); the `vn39` hard rule for hand-written prose — see [tool-page-rubric](/conventions/tool-page-rubric.md)). Cards 1, 2, 3 and 5 carry images (`loading="lazy"`); cards 4 (boards/status pyramid) and 6 (code/web/GUI tiles) render an image slot (below).
4. **Differentiator** — `<h2>Nothing wraps your agent.</h2>` + the run-kit README paragraph verbatim (product name HexoKit, `htop` in `<code>`, the key sentence in `<strong>`), single column at `max-width: 70ch`. This is the vs-herdr/cmux paragraph and stays even if every other section is redesigned.
5. **Toolkit hexagon** (`#toolkit`) — an intro line (*"HexoKit is the cockpit. Six small tools sit on its edges — each brew-installable alone, each better together."*), then `div.hk-hex` laid out as a 3×3 `grid-template-areas` grid — never absolute positioning on the SVG, so it collapses to a one-column list (mark first) at ≤40rem (`--bp-hex-collapse`). The mark (~180 px, `aria-hidden`) sits in the centre cell wrapped in `<a href="/toolkit/" aria-label="The HexoKit toolkit">`; the six companions sit on the flat-top hexagon's edges clockwise from the top, each an `<a>` with the tool name + one-liner: `fab-kit` (top) → `/fab-kit/`, `wt` (upper-right) → `/wt/`, `idea` (lower-right) → `/idea/`, `tu` (bottom) → `/tu/`, `hop` (lower-left) → `/hop/`, `desktop` (upper-left) → `#desktop` (the on-page card; the nav's `/desktop/` content page is a separate, site-structure-owned surface). A trailing link *"See the whole toolkit →"* → `/toolkit/`. The SVG is decorative; the six links ARE the textual explanation the constitution's Accessibility clause asks for. Deliberately absent: the seven-tool table, the install-everything-first flow, fab-kit's loop diagram (`public/diagrams/loop-*.svg` stays in the repo, unmounted).
6. **Desktop card** (`#desktop`) — a single wide card: `<h2>HexoKit Desktop (macOS)</h2>`, the README copy with `<kbd>⌘</kbd>`, one EC `<Code>` block (`rk desktop install`), and the link *"Install & access guide →"* → `/docs/install/#desktop-app-macos`. No screenshot (the Electron window is visually the dashboard; a titlebar-visible capture is on the slot list).
7. **Page-local footer** — `<footer class="hk-footer">` inside the landing, one `·`-separated row of exactly six links in order: Docs `/docs/` · Toolkit `/toolkit/` · GitHub `https://github.com/sahil87/run-kit` · Discord `https://discord.gg/32XHh5mJYn` · versions.json `/versions.json` · llms.txt `/llms.txt`. The site-wide `Footer.astro` (copyright/MIT/LinkedIn/noon.design) still renders below it via `<StarlightPage>`.

## The `.hk-landing` token layer (landing-only)

`src/styles/landing.css` — imported ONLY by `index.astro` — defines the `--hk-*` custom properties scoped under `.hk-landing`, with values copied from run-kit's `app/frontend/src/globals.css` so the site and the app read as one thing while the docs layer keeps its amber terminal palette. Dark (default): `--hk-bg #0f1117`, `--hk-card #171b24`, `--hk-inset #0a0c12`, `--hk-fg #e8eaf0`, `--hk-fg-dim #7a8394`, `--hk-border #454d66`, `--hk-accent #5b8af0`, `--hk-accent-bright #82a8f7`, `--hk-green #22c55e`, `--hk-yellow #facc15`, `--hk-purple #c084fc`, `--hk-red #f87171`. Light (under `:root[data-theme='light'] .hk-landing`): `#f8f9fb` / `#ffffff` / `#e8eaef` / `#1a1d24` / `#6b7280` / `#d1d5db` / `#4a7ae8` / `#3b66d6` / `#16a34a` / `#b07d02` / `#9333ea` / `#dc2626` (the app's already-audited light set — WCAG AA in both themes).

Every landing color comes from an `--hk-*` token — the only hex literals in the file live inside the two token blocks. The wrapper paints `background: var(--hk-bg); color: var(--hk-fg)` full-bleed (a `box-shadow`/`clip-path` spread), so the landing does not read as the docs' palette; the Starlight header above keeps the docs palette — an accepted seam (the sibling site-structure change owns the header). Font is the site's `--sl-font-mono` (JetBrains Mono); run-kit's Monaspice Nerd Font is not added — a new font asset for one page fails Constitution VI's page-visible-need bar.

Rules carried over from the app: hover on controls is hue-free (brightness/border/motion only); `--hk-green` is reserved for state/brand, never the hover hue; one focus ring (`outline: 2px solid var(--hk-green); outline-offset: 2px`) on every interactive element. Breakpoints are named once in a comment block (`--bp-stack: 48rem`, `--bp-hex-collapse: 40rem` — custom properties cannot drive `@media`, so the names live in the comment; grep the name when changing a value).

## Motion (CSS-only, reduced-motion gated)

Three motion treatments ported CSS-only from run-kit's `globals.css` (the app's typed-sweep is JS-driven and is NOT ported): `hk-glint-sweep` (a skewed, hue-free highlight strip across the CTA buttons on hover), `hk-glitch` (a one-shot RGB-split `text-shadow`, `steps(2)`, ~300 ms, on the `HexoKit` wordmark hover, snapping its color to `--hk-green` — the app's deliberate brand exception), and `hk-caret-blink` (the block cursor after the tagline). Under `@media (prefers-reduced-motion: reduce)` every landing animation is `animation: none` and the caret stays visible and steady (the site convention — cursors never vanish under reduce).

## `HkMark.astro`

`src/components/HkMark.astro` renders the cube-in-hexagon mark as inline SVG, sized per placement via a `size` prop (hero 56, hexagon centre 180). The geometry is copied verbatim from `src/assets/logo.svg` (itself mirrored by hand from run-kit's `assets/logo.svg` — there is no auto-sync pipeline) and single-sourced in this one component so the two landing placements cannot drift. The hardcoded grayscale palette is the mark's deliberate dual-theme-by-palette design (Constitution V by palette, not mechanism) — do not "fix" it to `currentColor`. Decorative everywhere it is used: `aria-hidden`.

## Links: the `LINKS` const and the route-existence test

All landing link targets live in one `const LINKS = {...}` at the top of `index.astro`, so a path change is a one-place edit. Targets follow the site's URL scheme and the [four-name rule](/conventions/tool-roster.md): HexoKit's own pages are linked at its **mount** `/docs/` (never its `hexokit` slug), the family page at `/toolkit/`, the companions at their root mounts (`/fab-kit/`, `/wt/`, `/idea/`, `/tu/`, `/hop/`), and the desktop guide at the pulled docs-site page `/docs/install/#desktop-app-macos`. The install *commands* on the page (`https://hexokit.com/install`, `brew install sahil87/tap/hexokit`) are strings inside code blocks, not links, and go live with the install-script and formula changes (S5/C2).

`scripts/landing-links.test.mjs` (`node --test`; reads `index.astro` as text — Astro components do not run under `node --test`) asserts: (a) every internal root-relative link target (literal `href="/…"` attributes AND the string literals inside the `LINKS` const, fragments stripped) is an existing route — a page under `src/content/docs/**` (honoring `slug:` frontmatter overrides), a static file under `src/pages/**`, a `/<mount>/` root page for a record in `TOOL_ROSTER` (`tool-roster.mjs`), or a pulled docs-site page (`content/<slug>/site/**/*.md` → `/<mount>/<path>/`) — or is in the explicit `FORWARD_LINKS` allow-list, which is empty today and exists so a deliberately-forward link must be documented with its owner; (b) every `src="/screenshots/…"` names a file that exists in `public/screenshots/`. A third case pins the mechanism: a misspelt mount is not a route while `/docs/` and `/toolkit/` are.

## Screenshots: the `hk-slot` convention and the converter

Screenshot assets are site-owned, committed `public/screenshots/*.webp` — the constitution's third permitted content class (alt text mandatory; see [tool-page-rubric → Screenshots](/conventions/tool-page-rubric.md)). New assets use the `hexokit-` prefix (the product slug); the two existing `run-kit-*.webp` files keep their names. The captures show the app titled "RunKit" — the Electron `productName` rename is a later rebrand change (C3); re-capture after it, not before.

`scripts/convert-screenshots.mjs` is a one-off, unwired converter (the `generate-og-image.mjs` model — absent from `package.json`, run manually: `node scripts/convert-screenshots.mjs`) built on the already-declared `sharp` dependency. Sources are declared in a `SOURCES` manifest (`{ out, src, maxWidth, extract? }`): URL sources (the run-kit README's curated GitHub user-attachment PNGs) are fetched ONCE and committed — never hot-linked; local sources are read from disk; an optional `extract` box (`sharp().extract()`) crops before resizing. Every output is resized to `maxWidth`, encoded WebP quality 82, and MUST land under 250 KB; the script fails loudly (exit 1) on a missing source. The committed outputs: `hexokit-phone-terminal.webp` (900×1957), `hexokit-phone-dashboard.webp` (900×1957), `hexokit-phone-menu.webp` (900×1957 — converted for the feature cards, currently unused), `hexokit-operator.webp` (1600×668), and `hexokit-fleet-sidebar.webp` (a 370×910 crop of the console shot's left sidebar).

A feature card without an existing capture renders an **image slot** — `div.hk-slot` (`aspect-ratio: 16/10`, `background: var(--hk-inset)`, `1px dashed var(--hk-border)`) containing a dim monospace caption (`boards · screenshot pending` / `tiles · screenshot pending`) — visibly a placeholder styled as the app's empty panes, not a broken image. Swapping a slot for an image is a one-line edit per card. Pending captures: a board with 3+ pinned panes showing status dots; the code/web/GUI tiles beside a terminal; optionally a Desktop-app titlebar shot.

## Head overrides and the chrome seam

The homepage `<head>` is owned by the page via the `frontmatter.head` array (Starlight's head merge dedupes the singleton `<title>` and same-property metas): `<title>HexoKit — your tmux, in the browser and on your phone</title>`, a hand-authored SEO-shaped meta description, `og:title`, `og:type = website`, `og:description`. The rest of the homepage head is site-wide chrome owned elsewhere and already HexoKit-branded: `Head.astro`'s homepage JSON-LD (`WebSite` + `SoftwareApplication` named HexoKit) and the site-wide `og:image` card — see [seo-social-meta](/conventions/seo-social-meta.md).

The one visual seam: the Starlight header (`HeaderNav`, theme toggle, search) keeps the docs' amber `--c-*` palette above the landing's run-kit `--hk-*` body, and `Footer.astro`'s site-wide copyright row renders below the landing's page-local footer. Both are site-chrome surfaces ([tool-page-rubric](/conventions/tool-page-rubric.md)); re-skinning the header to match the landing is a chrome decision, not a landing one.

The retired shll splash's components stay in the tree, unmounted: `TerminalPrompt.astro`, `VersionTable.astro`, `Diagram.astro`, `InstallOneLiner.astro` (still consumed by the tool overviews), the `src/lib/terminal-*.ts` libs and their `scripts/terminal-*.test.mjs` suites, and `public/diagrams/loop-*.svg`. Where the interactive terminal resurfaces is an open decision — see [homepage-terminal](../../../sites/astro-starlight-terminal1/docs/memory/site/homepage-terminal.md).

## Design Decisions

### Custom page over the Starlight splash template
**Decision**: `src/pages/index.astro` + `StarlightPage` (`template: 'splash'`, no `hero`), `index.mdx` deleted.
**Why**: the landing needs a two-image hero, a 3×3 hexagon grid and a page-local footer; the splash template cannot express that, while `StarlightPage` keeps header, theme toggle, tokens and a11y for free.
**Rejected**: restyling the splash `hero:`/markdown body (fights the template); a fully custom `<html>` layout (loses the theme toggle sync and duplicates the header).
*Introduced by*: 260910-jwhx-hexokit-landing

### Landing-scoped `--hk-*` tokens instead of re-theming the site
**Decision**: run-kit's palette lives under `.hk-landing` only; docs keep the amber terminal palette.
**Why**: the plan wants the landing to look like the app; S3 owns the docs layer and header in parallel, so a site-wide re-theme here would collide.
**Rejected**: overriding `--c-*`/`--sl-*` globally (collides with S3, changes every docs page).
*Introduced by*: 260910-jwhx-hexokit-landing

### Link targets centralised in `LINKS` and checked for existence in a test
**Decision**: every internal target is a `LINKS` constant resolved against the roster's mounts and the site's real routes by `landing-links.test.mjs`; a not-yet-built path may only be linked through an owner-named `FORWARD_LINKS` entry.
**Why**: the landing was built in parallel with the site-structure change that created `/docs/` and `/toolkit/`; linking the scheme's target paths (not the pre-rebrand `/run-kit/`, `/getting-started/`) meant zero follow-up edits when it merged, and the test turns a typo'd or premature link into a CI failure instead of a dead link.
**Rejected**: scattering literal hrefs through the markup (no single place to retarget); linking the pre-rebrand paths (would have needed a follow-up edit).
*Introduced by*: 260910-jwhx-hexokit-landing

### Image slots for cards without a capture
**Decision**: cards 4 and 6 ship a styled dashed `hk-slot` with a "screenshot pending" caption.
**Why**: no such captures exist in any repo; only the site owner can take them; design iteration is expected.
**Rejected**: dropping the two cards (loses two of the plan's six features); using unrelated images.
*Introduced by*: 260910-jwhx-hexokit-landing
