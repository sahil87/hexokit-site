# Intake: HexoKit product landing page (`/`)

**Change**: 260910-jwhx-hexokit-landing
**Created**: 2026-09-10

## Origin

One-shot `/fab-new` invocation executing **row S4 ("hexokit-landing") of Phase 0** of the cross-repo plan
`run-kit/fab/plans/sahil/26-09-10-hexokit-rebrand.md` (that plan lives in the **run-kit** repo at
`/home/sahil/code/sahil87/run-kit/fab/plans/sahil/26-09-10-hexokit-rebrand.md`; this repo never contains it —
downstream agents MUST read it from that absolute path). Raw input:

> Execute row S4 ("hexokit-landing") of /home/sahil/code/sahil87/run-kit/fab/plans/sahil/26-09-10-hexokit-rebrand.md Phase 0 (note: that plan doc lives in a DIFFERENT repo, run-kit -- read it via that absolute path, this repo, sahil87/hexokit-site, will never contain it). Read the whole plan doc first, especially Decision log D6/D10 and the full "Site shape (hexokit.com)" section -- it specifies the exact landing-page sections in order. S2 (PR hexokit-site#1) is merged to main and your worktree branch already includes it (rebased). Scope for this change: build the `/` product landing page per D6 + Site shape -- a custom page (not the Starlight docs template), on-brand from day one even while `/docs/` still reads "run-kit": hero (tagline "Your tmux, in the browser and on your phone." / sub-line "Cockpit for the agent era."), desktop+phone screenshots, install one-liner + brew line, feature cards, the "Nothing wraps your agent" differentiator paragraph, the toolkit hexagon (cube-in-hexagon mark, six companions on six edges linking into /toolkit/ and each tools subtree), desktop app card, footer. This is a sibling change to S3 (hexokit-site-structure, running in parallel in another worktree) -- S3 owns /docs/, /toolkit/, and the slug/cron plumbing; you own the `/` page itself. Expect some overlap/rebase needed against S3 later (both may touch nav/layout); flag it rather than resolving it silently if you hit real conflicts. Design iteration is expected -- this is marked Size L in the plan.

Plan-doc decisions carried in (all read from the plan; D1–D4/D13 confirmed by Sahil, D5–D12 proposed and
adopted as-is — the plan's pickup protocol says do not re-open either set):

- **D1/D2** — the product is **HexoKit**; the binary stays `rk` (long name `hexokit` later). Every `rk …` verb,
  `RK_*`, `@rk_*`, `rk-*` identifier is substrate and is never renamed. Landing copy says "HexoKit" for the
  product and `rk riff` etc. for commands.
- **D6** — hexokit.com is a single-product site in the guppi.sh / herdr.dev shape, a **custom landing page at `/`
  on top of the existing Starlight docs layer**. Section order is fixed by § Site shape (reproduced below).
- **D7** — URL scheme: HexoKit docs at `/docs/…`; companions keep root slugs `/fab-kit/`, `/wt/`, `/idea/`,
  `/tu/`, `/hop/`; the family page is `/toolkit/`. `/docs/` and `/toolkit/` are **S3's deliverables**.
- **D10** — install one-liner is product-first: `curl -fsSL hexokit.com/install | sh` installs `shll` +
  `hexokit`. Served by **S5** (not this change). Brew line: `brew install sahil87/tap/hexokit` (formula lands
  in **C2**, Phase 1).
- **D13** — the site repo is `sahil87/hexokit-site`, a mirror of shll.ai; shll.ai stays live and untouched
  during Phase 0. hexokit.com is live (S2) but **unannounced** — nobody is pointed at it until X1.
- **Ownership split (from the invocation)** — S3 owns `/docs/`, `/toolkit/`, slug/cron plumbing, nav
  (`Docs · Toolkit · Desktop · GitHub`), llms.txt, JSON-LD, OG image, favicon regen. **S4 owns the `/` page
  itself.** Where both would touch the same file (header/nav, `Head.astro`, `Footer.astro`), S4 stays out and
  flags the seam rather than editing.

## Why

**The product has no landing page.** hexokit.com today serves a byte-copy of shll.ai: the homepage is the
"Seven small CLIs that force AI agents to plan before they code" splash with a fab-kit-centred loop diagram,
a seven-tool `ls` listing, and an interactive toy terminal. The plan's evidence section is blunt about it —
the site contradicts the single-product thesis, buries the dashboard as the 5th of seven CLIs, and centres the
planning harness rather than the thing people adopt (dashboards/multiplexers). The competitive-landscape doc
and the run-kit README already have the positioning ("Your tmux, in the browser and on your phone." /
"Cockpit for the agent era."); nothing on the web says it.

**If we don't build it**, Phase 1 cannot start: the plan's pickup protocol gates every rename (C1 onward) on
"Sahil has accepted the S4 landing page". The renames are the irreversible part; the landing page is the
reversible proof that the new shape reads right. It also has to be on-brand from day one even though `/docs/`
will read "run-kit" until X1 — so it is hand-written, not synced.

**Why a custom page rather than restyling the Starlight splash**: the splash template is a docs-site hero
(title + tagline + action buttons + markdown body). The landing needs a two-screenshot hero, a six-edge
hexagon layout, a feature-card grid, and a page-local footer — layout the splash template cannot express
without fighting it. Starlight supports exactly this case via `src/pages/*.astro` + `<StarlightPage>`, which
keeps the site header (logo, theme toggle, search) and the `--c-*`/`--sl-*` token system so dark-mode parity
(Constitution V) and the existing accessibility treatments come for free.

## What Changes

### 1. Route: `/` becomes a custom Astro page; the shll splash is retired

- **New** `sites/astro-starlight-terminal1/src/pages/index.astro`. Renders inside Starlight's chrome via
  `import StarlightPage from '@astrojs/starlight/components/StarlightPage.astro'` with
  `frontmatter={{ title: 'HexoKit', template: 'splash', tableOfContents: false, head: [...] }}` (no `hero:` —
  the hero is hand-written markup, so Starlight's `[data-has-hero]` styling does not fire). `template: 'splash'`
  removes the sidebar and right rail; header + site footer remain.
- **Delete** `sites/astro-starlight-terminal1/src/content/docs/index.mdx` (the shll splash). A content
  `index.mdx` and a `src/pages/index.astro` both emit `/`; the collection page must go. Its components
  (`TerminalPrompt.astro`, `VersionTable.astro`, `Diagram.astro`, `InstallOneLiner.astro`, the
  `src/lib/terminal-*.ts` libs and their `scripts/terminal-*.test.mjs` tests, `public/diagrams/loop-*.svg`)
  are **NOT deleted** — they stay in the tree, unmounted from `/`, so the interactive terminal can be
  re-homed later (see Open Questions). Tests keep passing because they test the libs, not the page.
- `public/CNAME`, `astro.config.mjs` `site:`, redirects, sidebar — untouched.
- Homepage `<head>` (owned by this page, via the `frontmatter.head` array — the same mechanism the old
  `index.mdx` frontmatter used, change `kb1r`):
  - `<title>`: `HexoKit — your tmux, in the browser and on your phone`
  - `meta name=description`: hand-authored, SEO-shaped (convention from change `bees`): *"HexoKit is a remote,
    phone-first console for your tmux: every session and pane as a live terminal from any device, built for
    running many AI coding agents in parallel without wrapping any of them."*
  - `og:title` = the title, `og:type` = `website`, `og:description` = the description.
  - **NOT touched**: `Head.astro`'s homepage JSON-LD branch (still says shll/"shll toolkit") and the site-wide
    `og:image` (still the shll card). Both are S3's ("JSON-LD, OG … regen"). Flag for S3 in the PR body: the
    `isHomepage` JSON-LD graph should become `WebSite name: HexoKit` + `SoftwareApplication name: HexoKit,
    url: https://github.com/sahil87/run-kit`.

### 2. Visual vocabulary: a landing-scoped token layer that borrows run-kit's palette

The plan says the page "carries run-kit's own visual vocabulary (monospace, hexagon mark, accent green, the
CRT/typed-cursor treatments already in `globals.css`) so the site and the app look like one thing." The docs
layer keeps its amber terminal palette; the landing page gets its own tokens, scoped under the page root
class `.hk-landing`, mapped from `run-kit/app/frontend/src/globals.css`:

```css
/* src/styles/landing.css — imported ONLY by src/pages/index.astro */
.hk-landing {
  --hk-bg: #0f1117;          /* run-kit --color-bg-primary */
  --hk-card: #171b24;        /* --color-bg-card */
  --hk-inset: #0a0c12;       /* --color-bg-inset */
  --hk-fg: #e8eaf0;          /* --color-text-primary */
  --hk-fg-dim: #7a8394;      /* --color-text-secondary */
  --hk-border: #454d66;      /* --color-border */
  --hk-accent: #5b8af0;      /* --color-accent (blue) */
  --hk-accent-bright: #82a8f7;
  --hk-green: #22c55e;       /* --color-accent-green — STATE/brand only, never hover hue */
  --hk-yellow: #facc15; --hk-purple: #c084fc; --hk-red: #f87171;
}
:root[data-theme='light'] .hk-landing {
  --hk-bg: #f8f9fb; --hk-card: #ffffff; --hk-inset: #e8eaef;
  --hk-fg: #1a1d24; --hk-fg-dim: #6b7280; --hk-border: #d1d5db;
  --hk-accent: #4a7ae8; --hk-accent-bright: #3b66d6; --hk-green: #16a34a;
  --hk-yellow: #b07d02; --hk-purple: #9333ea; --hk-red: #dc2626;
}
```

- Font stays **JetBrains Mono** (already self-hosted via `@fontsource/jetbrains-mono`). run-kit's Monaspice
  Nerd Font is not added — a new font asset for one page fails Constitution VI's page-visible-need bar; the
  mono-everywhere feel is what matters.
- Motion treatments ported **CSS-only** from `globals.css`, each gated under `prefers-reduced-motion: reduce`
  (site convention, change `cuur`): `rk-glint-sweep` (skewed highlight strip across the install/CTA buttons on
  hover, hue-free), `rk-glitch` (one-shot RGB-split on the HexoKit wordmark hover, snaps to `--hk-green`),
  `rk-caret-blink` (block cursor after the tagline). The app's typed-sweep is JS-driven and is **not** ported;
  a CSS typewriter on the hero tagline is optional design iteration, not a requirement.
- Rules from the app carried over: hover on controls is hue-free (motion + brightness only); green is
  reserved for state/brand; one focus ring `outline: 2px solid var(--hk-green); outline-offset: 2px` on every
  interactive element (Constitution Accessibility: visible focus, WCAG AA contrast in both themes — the light
  values above are the app's already-audited light set).
- Page background: `.hk-landing { background: var(--hk-bg) }` on the full-bleed wrapper so the landing does not
  read as the docs' `#0b0d10`/paper. The Starlight header above it keeps the docs palette — accepted seam;
  S3's nav work decides whether the header is re-skinned.

### 3. Sections, in the plan's order (all inside `<main class="hk-landing">`)

Every section is a `<section>` with an `aria-labelledby` heading; headings use the site's `## ` shell-comment
prefix convention where a visible heading exists. Copy below is the v1 text; design iteration may tune it but
MUST keep the tagline, sub-line and the differentiator paragraph verbatim.

#### 3.1 Hero

- Wordmark: the cube-in-hexagon mark (inline SVG from `src/assets/logo.svg` geometry, `aria-hidden`) + `<h1>`
  **HexoKit**.
- Tagline (`<p class="hk-tagline">`, verbatim): **Your tmux, in the browser and on your phone.**
- Sub-line (`<p class="hk-subline">`, verbatim): *Cockpit for the agent era.*
- Two CTAs: primary **Install** (anchor `#install`), secondary **Read the docs** → `/docs/`.
- Screenshots side by side, desktop left (wide) and phone right (tall), both `<img>` with explicit
  `width`/`height`, `loading="eager"`, `decoding="async"`, meaningful `alt`:
  - Desktop: `/screenshots/run-kit-console.webp` (existing, 1800×1124 — sidebar with servers/sessions/status
    dots, a live agent pane, host stats). Alt: *"HexoKit desktop dashboard: sidebar of servers, sessions and
    panes with status dots, a live coding-agent terminal, and host stats."*
  - Phone: **new** `public/screenshots/hexokit-phone-terminal.webp`, converted at apply time from the run-kit
    README's curated "Mobile terminal session" PNG
    (`https://github.com/user-attachments/assets/f07a0166-7674-41fe-8376-ef34fd2a1afb`; the sibling "Mobile
    menu" `1326355e-…` and "Mobile dashboard" `35645b54-…` shots are converted too for the feature cards).
    Conversion uses `sharp` — already a dependency in `package.json` — via a one-off
    `scripts/convert-screenshots.mjs` (pattern: `scripts/generate-og-image.mjs`, an unwired one-off generator).
    Target ≤ 900 px wide for phone, quality ~82. The GitHub URLs are **fetched once and committed as
    site-owned assets** — never hot-linked (constitution third content class: `public/screenshots/*.webp`,
    committed, alt text mandatory). File prefix is `hexokit-` for new assets (the product slug; the two
    existing `run-kit-*.webp` files keep their names — renaming them is S3/X1 churn).
- On `≤ 48rem` the two screenshots stack (desktop above, phone below, phone capped at ~60vh).
- Known limitation, recorded here so nobody "fixes" it: the screenshots show the app titled **"RunKit"** —
  the Electron `productName` rename is C3 (Phase 1). Re-capture after C3; not this change.

#### 3.2 Install

```text
$ curl -fsSL https://hexokit.com/install | sh        # installs shll + hexokit (D10)
$ brew install sahil87/tap/hexokit                    # or straight from the tap
```

- Rendered with Starlight's re-exported Expressive Code `<Code code=… lang="bash" />` so the block carries the
  site-wide copy button (precedent: `InstallOneLiner.astro`). Two separate `<Code>` blocks so each line copies
  alone. Commands are built as JS string constants in the page frontmatter (the `--`/URL remark hazard does
  not apply in `.astro`, but constants keep them greppable): `INSTALL_ONE_LINER`, `BREW_LINE`.
- One-line note under the blocks: *"Installs `shll` (the toolkit manager) and HexoKit. Want the six companion
  tools too? See [the toolkit](/toolkit/)."* — D10's product-first wording; the full-toolkit install lives on
  `/toolkit/`.
- The existing `InstallOneLiner.astro` is **not** reused: it hardcodes `https://shll.ai/install`, is
  roster-gated on `tool-slugs.ts` (no `hexokit` slug until S3), and renders the whole-toolkit story. It stays as
  the tool-overview component.
- **Both commands are forward-looking**: `/install` on hexokit.com lands in S5 and the `hexokit` formula in C2.
  Until then the copied commands fail. Accepted because hexokit.com is unannounced (D13) and the plan orders
  S4 before S5/C2 deliberately; the PR body states it.

#### 3.3 Features — six cards

Grid `repeat(auto-fit, minmax(18rem, 1fr))`, each card = image (or image slot) + `<h3>` + one or two
sentences. Every command token named in card prose MUST exist in `help/run-kit.json` (the `vn39` hard rule
for hand-written site prose; `node scripts/validate-help.mjs` + a grep of the help JSON at apply time).
Card copy is adapted from the run-kit README (the canonical source):

| # | Title | Copy (v1) | Image |
|---|-------|-----------|-------|
| 1 | Every pane, a live terminal — from any device | Every tmux session and pane on the box shows up in a sidebar. Click one for a live browser terminal, from your desk or your couch. | `hexokit-phone-dashboard.webp` (README "Mobile dashboard") |
| 2 | Agents are just panes | State comes from harness hooks, not from parsing output — busy, waiting, idle, in any agent you run. The agent is one of the things you run, not the thing HexoKit is. | `run-kit-agent-session.webp` (existing) |
| 3 | `rk riff` — one agent per worktree, watch the fleet | One command spawns a git worktree, a tmux window inside it, and your agent. Spawn three at once, watch them side by side. | crop of `run-kit-console.webp` sidebar (fleet with status dots) — or slot |
| 4 | Boards and the status pyramid | Pin panes from any server into a board; every window carries one status dot — hue for journey, shape for liveness — readable at a glance on a phone. | **slot** — no capture exists yet |
| 5 | Cron clock and the operator | Scheduled agent prompts on a clock, and one operator agent that watches the fleet and pings your phone when something needs you. | `hexokit-operator.webp` (from run-kit `.uploads/260907140652-image.png`, 1618×676, the OPERATOR pane) — or slot |
| 6 | Code, web and GUI tiles | Beside the terminal: a full editor at the window's git root, a web tile for any port or URL, a GUI lens — same tab, same device. | **slot** — no capture exists yet |

- **Image slot** = a bordered `--hk-inset` panel the card's aspect ratio, containing a dim monospace caption
  (e.g. `boards · screenshot pending`) — visibly a placeholder, not a broken image, styled as the app's empty
  panes are. The slot list is the design-iteration hand-off to Sahil (see Open Questions). Swapping a slot for
  an image is a one-line edit per card.
- Cards are static (`<article>`), no links required; the section heading links nowhere.

#### 3.4 "Nothing wraps your agent" — the differentiator

`<h2>` **Nothing wraps your agent.** followed by the README paragraph, product name swapped, otherwise
verbatim-ish:

> HexoKit never wraps the agent — a pane is just a pane. It's equally a build, a REPL, an ssh session, `htop`.
> **The agent is one of the things you run, not the thing HexoKit is.** It doesn't speak any agent's protocol,
> parse any agent's output, or care what's in the pane. That's the point: when the agent tooling churns
> underneath you (and it does, monthly), the terminal layer stays put.

Max-width ~70ch (the `.home-prose` measure), single column, no image. This is the vs-herdr/cmux paragraph
and stays even if every other section is redesigned.

#### 3.5 The toolkit hexagon

- Centre: the cube-in-hexagon mark, larger (≈ 160–200 px), linking to `/toolkit/` with `aria-label="The
  HexoKit toolkit"`. Flat-top hexagon, so the six edges are: top, upper-right, lower-right, bottom, lower-left,
  upper-left. Companions sit on the edges **clockwise from the top** in the plan's order:
  `fab-kit` (top), `wt` (upper-right), `idea` (lower-right), `tu` (bottom), `hop` (lower-left), `desktop`
  (upper-left).
- Each edge label is an `<a>` with the tool name and a one-liner (reusing the already-validated one-liners from
  the retired `index.mdx` tools listing, plus one new for desktop):
  - `fab-kit` → `/fab-kit/` — *the planning harness — a constitution and a plan before any agent writes code*
  - `wt` → `/wt/` — *disposable git worktrees so each change works in isolation*
  - `idea` → `/idea/` — *capture ideas and feed a backlog without breaking flow*
  - `tu` → `/tu/` — *track what your AI coding sessions cost*
  - `hop` → `/hop/` — *a personal directory of your git repos — jump anywhere*
  - `desktop` → `#desktop` (the card below) — *the native macOS shell for the dashboard*
- Implementation: a CSS grid (3 columns × 3 rows, mark in the centre cell, labels in the six surrounding
  cells positioned toward their edge) — **not** absolute positioning on the SVG — so it collapses to a plain
  vertical list under `≤ 40rem` with the mark on top. The SVG mark is decorative (`aria-hidden`); the six
  links ARE the textual explanation the constitution's Accessibility clause asks for, so no separate legend.
- Intro line above: *"HexoKit is the cockpit. Six small tools sit on its edges — each brew-installable alone,
  each better together."* and a trailing link *"See the whole toolkit →"* → `/toolkit/`.
- What is deliberately absent (plan § Site shape): the seven-tool table, the install-everything-first flow,
  fab-kit's pipeline/loop diagram (`public/diagrams/loop-*.svg` stays in the repo, unmounted; `/fab-kit/` and
  `/toolkit/` own it).

#### 3.6 Desktop app card

`<section id="desktop">` — a single wide card: `<h2>` **HexoKit Desktop (macOS)**; copy from the README:
*"A native window around your dashboard that frees the browser-reserved `⌘` keyboard tier. Install and update
it from the CLI — quarantine-free, digest-verified — and connect three ways: this Mac, a box over SSH, or any
URL. It never starts, stops or updates anything on its own; your tmux sessions survive every daemon action."*
Code block: `rk desktop install` (EC `<Code>`, copyable). Link: *"Install & access guide →"* →
`/docs/install/#desktop-app-macos` (S3 emits `/docs/install/` from run-kit's `docs/site/install.md`, whose
`## Desktop app (macOS)` heading slugs to `desktop-app-macos`). No screenshot in v1 (the Electron window is
visually the dashboard; a titlebar-visible capture is on the slot list).

#### 3.7 Footer (page-local)

`<footer class="hk-footer">` inside the landing, one `·`-separated row:
**Docs** `/docs/` · **Toolkit** `/toolkit/` · **GitHub** `https://github.com/sahil87/run-kit` ·
**Discord** `https://discord.gg/32XHh5mJYn` · **versions.json** `/versions.json` · **llms.txt** `/llms.txt`.
GitHub links the current repo name; after C3's rename GitHub redirects the old URL, so the link never breaks.
The site-wide `Footer.astro` (copyright/MIT/LinkedIn/noon.design) still renders below via `<StarlightPage>` —
untouched; it is a shared override S3 may also touch.

### 4. Link targets that do not exist yet (integration seam with S3/S5)

`/docs/`, `/toolkit/`, `/docs/install/` and `/install` are produced by S3/S5. This page links to the **D7
target paths**, not to today's `/run-kit/` and `/getting-started/…`, so S3 needs no follow-up edit here and
the landing is correct the moment S3 merges. If S4 merges first, the unannounced site carries those dead
links for the gap — accepted (D13). All landing link targets live in one `const LINKS = {...}` block at the
top of `index.astro` so a path change is a one-place edit.

### 5. Tests and validation

- `pnpm build` must pass (CI's "Build site" step; the route collision with `index.mdx` would fail it).
- `node --test scripts/*.test.mjs` must still pass (terminal libs untouched).
- **New** `scripts/landing-links.test.mjs`: reads `src/pages/index.astro` as text and asserts (a) every
  `href="/…"` internal target is either an existing route (`src/content/docs/**`, `src/pages/**`,
  `TOOL_SLUGS` root pages) or in the explicit allow-list `['/docs/', '/toolkit/', '/docs/install/', '/install']`
  of S3/S5-owned paths — so a typo'd internal link fails CI while the known-forward links are documented in
  code; (b) every `<img src="/screenshots/…">` names a file that exists in `public/screenshots/`.
- `node scripts/validate-help.mjs` unchanged; apply additionally greps `help/run-kit.json` for every
  `rk <verb>` token used in landing prose (`riff`, `desktop`) — the `vn39` hard rule.
- Manual acceptance (design iteration): both themes via the header toggle; 400 px, 768 px, 1280 px widths;
  keyboard tab order reaches every link/button with the visible ring; `prefers-reduced-motion` stops every
  animation; Lighthouse a11y ≥ 95 on `/`.

### 6. Out of scope (explicitly)

Nav/header items (S3), `Head.astro` JSON-LD/OG (S3), `Footer.astro` (shared), `/toolkit/` and `/docs/`
content (S3), `/install` script (S5), renaming `run-kit-*.webp` assets, re-skinning the docs layer to the
run-kit palette, any change under `sites/astro-tailwind-terminal1/` or `sites/_playground/`, and re-homing
the interactive terminal (a decision, not a deliverable — see Open Questions).

## Affected Memory

- `conventions/tool-page-rubric`: (modify) the "hand-authored homepage newcomer blocks" (`ld0j`), the
  `$ whoami` author block's three-way hand-copy note (now two-way: Footer + terminal egg), and the homepage
  install block as an `InstallOneLiner tool=shll` consumer are all retired with `index.mdx`; record the new
  `/` as a custom `src/pages/index.astro` outside the collection, and the `hexokit-*.webp` screenshot naming.
- `conventions/seo-social-meta`: (modify) homepage `head:` overrides now come from `index.astro`'s
  `StarlightPage` frontmatter (HexoKit title/description/og:type); note the homepage JSON-LD branch in
  `Head.astro` is stale pending S3.
- `conventions/landing-page`: (new) the landing page's structure (section order per plan D6), the
  `.hk-landing` scoped token layer and why it is landing-only, the CSS-only motion ports and their
  reduced-motion gate, the hexagon grid layout + edge order, the forward-link allow-list test, the image-slot
  convention and pending-capture list, the forward-looking install commands (S5/C2), and the S3 seams.
- Site-level (hand-maintained, outside `fab docs-index`):
  `sites/astro-starlight-terminal1/docs/memory/site/homepage-terminal.md` (modify) — the terminal island is
  no longer mounted on `/`; `index.mdx` is deleted; components/libs/tests retained; `[data-has-hero]` rules
  in `terminal.css` are now dormant. Add a row for the landing page to
  `sites/astro-starlight-terminal1/docs/memory/site/index.md` if the landing memory is placed there instead
  of `conventions/` (hydrate picks one; precedent for site-specific-but-top-level is `tool-page-rubric`).

## Impact

- **Files**: `src/pages/index.astro` (new, ~300 lines incl. markup), `src/styles/landing.css` (new,
  ~350 lines), `src/content/docs/index.mdx` (deleted), `public/screenshots/hexokit-{phone-terminal,
  phone-dashboard,phone-menu,operator}.webp` (new assets, each < 250 KB), `scripts/convert-screenshots.mjs`
  (new one-off), `scripts/landing-links.test.mjs` (new). Possibly `src/styles/terminal.css` gains nothing —
  landing styles live in their own file to keep the docs stylesheet untouched (S3 may edit it).
- **No new dependencies** (Constitution VI): `sharp` is already declared; EC `<Code>` is a Starlight
  re-export; SVG is inline.
- **Static-first (Constitution I)**: zero client JS added by this page (the EC copy-button script already
  ships site-wide).
- **Dark parity (V)**: both `--hk-*` palettes; screenshots are dark-UI captures on both themes (accepted —
  the app is dark-first).
- **CI**: `ci.yml` unchanged; new test file auto-picked by `node --test scripts/*.test.mjs`.
- **Rebase risk vs S3**: low on files (S3 touches `astro.config.mjs`, slug tables, workflows, `Head.astro`,
  content under `/toolkit/`; S4 touches none of those). Medium on *intent*: if S3 re-skins the header or
  changes `Footer.astro`, the landing's palette seam and duplicate footer row need a look. Flag, don't
  auto-resolve.

## Open Questions

- **Where does the interactive terminal (`TerminalPrompt`, 12 changes of work) resurface, if at all?** This
  change unmounts it from `/` and keeps the code. Candidates: `/toolkit/` (S3's page — natural home for the
  "seven CLIs" playground), a dedicated `/terminal/` page, or an easter-egg toggle on the landing. Decision
  for Sahil during design review; nothing is lost either way.
- **Screenshot captures needed from Sahil for the two image slots (cards 4 and 6) and, optionally, a
  Desktop-app titlebar shot**: a board with 3+ pinned panes showing status dots; the code/web/GUI tiles beside
  a terminal. Also whether the personal session names visible in the existing captures are fine to publish
  (they already are, on shll.ai's `/run-kit/`).
- **Header palette seam**: the Starlight header keeps the docs' amber/`#0b0d10` while the landing body is
  run-kit blue-green/`#0f1117`. Acceptable for v1? If not, the fix belongs with S3's nav work (header
  re-skin), not here.

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Certain | Section order, tagline, sub-line, differentiator paragraph and footer link set are exactly the plan's § Site shape + the invocation text | Specified verbatim by the plan and the user; D6 adopted per pickup protocol | S:95 R:90 A:95 D:95 |
| 2 | Certain | Product is "HexoKit"; command tokens stay `rk …`; no substrate identifier is renamed | D1/D2 confirmed; pickup protocol forbids reopening | S:95 R:95 A:95 D:100 |
| 3 | Certain | S4 does not edit `Head.astro`, `Footer.astro`, `astro.config.mjs` nav/sidebar, or anything under `/toolkit/`/`/docs/`; seams are flagged in the PR body | Invocation assigns those to S3 and asks for flags over silent resolution | S:90 R:90 A:90 D:90 |
| 4 | Certain | Both themes, WCAG AA contrast, visible focus rings, reduced-motion gate, zero new client JS, no new deps | Constitution I/V/VI + Accessibility; site convention `cuur` | S:85 R:90 A:95 D:95 |
| 5 | Confident | Landing is `src/pages/index.astro` wrapped in `<StarlightPage template: 'splash'>`; `content/docs/index.mdx` is deleted; retired components/libs/tests are kept in-tree | Plan says custom page, not the docs template; Starlight documents this exact mechanism; keeps header/theme toggle; deletion needed to avoid the `/` route collision; code retention keeps the option open | S:75 R:70 A:80 D:70 |
| 6 | Confident | Landing-scoped `.hk-landing` token layer ports run-kit's dark+light palette; docs layer keeps amber; JetBrains Mono kept, Monaspice not added; motion ports are CSS-only | Plan asks for run-kit's vocabulary "so site and app look like one thing"; scoping avoids re-theming S3's docs; new font fails Constitution VI's bar | S:65 R:75 A:65 D:50 |
| 7 | Confident | Links point at D7 target paths (`/docs/`, `/toolkit/`, `/docs/install/#desktop-app-macos`) even though S3 has not landed; targets centralised in one `LINKS` const; a link test allow-lists exactly these | S3 runs in parallel and both land before cutover; site is unannounced (D13); one-place edit if paths move | S:60 R:85 A:60 D:55 |
| 8 | Confident | Install block shows the D10 curl one-liner (`https://hexokit.com/install` piped to `sh`) + `brew install sahil87/tap/hexokit` now (both go live in S5/C2); `https://` scheme added to D10's literal; `InstallOneLiner.astro` not reused | D10 + plan § Site shape are explicit; scheme matches the existing convention and avoids an http→https hop; the component is shll-specific and roster-gated | S:70 R:90 A:75 D:65 |
| 9 | Confident | Hero uses existing `run-kit-console.webp` (desktop) + a new `hexokit-phone-terminal.webp` converted from the README's curated mobile PNG via `sharp`; GitHub user-attachment URLs are fetched once and committed, never hot-linked; new assets use the `hexokit-` prefix | Constitution's third content class requires committed `public/screenshots/*.webp` with alt text; README shots are Sahil-curated; `sharp` already a dep | S:55 R:90 A:65 D:55 |
| 10 | Confident | Feature cards without an available capture (boards/status pyramid; code/web/GUI tiles) ship as styled image slots with a "screenshot pending" caption; the capture list goes to Sahil in Open Questions | Plan says "each with a real screenshot" but no such assets exist in either repo; only Sahil can capture; swapping is trivial and design iteration is expected | S:55 R:85 A:30 D:45 |
| 11 | Confident | Hexagon is a 3×3 CSS grid (mark centre, six edge labels) collapsing to a list on narrow screens; edge order clockwise from top = fab-kit, wt, idea, tu, hop, desktop; `desktop` edge links `#desktop`; centre links `/toolkit/`; one-liners reuse the validated `index.mdx` tools-listing text | Plan lists the six in that order and says "linking into /toolkit/ and each tool's subtree"; grid beats absolute positioning for responsiveness/a11y; reused prose is already `vn39`-clean | S:70 R:85 A:75 D:60 |
| 12 | Confident | Interactive terminal is unmounted from `/` and not relocated by this change; relocation is an Open Question | Plan's exhaustive section list omits it and explicitly excludes the seven-tool flow; relocating into `/toolkit/` would edit S3's page | S:40 R:75 A:45 D:40 |
| 13 | Confident | Screenshots showing the "RunKit" app title are shipped as-is and re-captured after C3 | Electron `productName` rename is C3 (D8); `/docs/` reads "run-kit" during Phase 0 by the same acceptance | S:60 R:90 A:80 D:80 |
| 14 | Certain | Footer's GitHub link targets `https://github.com/sahil87/run-kit` (current name) | C3 renames the repo later and GitHub redirects the old URL; linking a not-yet-existing `sahil87/hexokit` would 404 today | S:65 R:95 A:85 D:75 |

14 assumptions (5 certain, 9 confident, 0 tentative, 0 unresolved).
