# Intake: HexoKit landing page (`/`)

**Change**: 260910-lvnp-hexokit-landing
**Created**: 2026-09-10

## Origin

> /fab-new Execute row S4 ("hexokit-landing") of /home/sahil/code/sahil87/run-kit/fab/plans/sahil/26-09-10-hexokit-rebrand.md Phase 0 (note: that plan doc lives in a DIFFERENT repo, run-kit — read it via that absolute path, this repo, sahil87/hexokit-site, will never contain it). Read the whole plan doc first, especially Decision log D6/D10 and the full "Site shape (hexokit.com)" section — it specifies the exact landing-page sections in order. S2 (PR hexokit-site#1) is merged to main and your worktree branch already includes it (rebased). Scope for this change: build the / product landing page per D6 + Site shape — a custom page (not the Starlight docs template), on-brand from day one even while /docs/ still reads "run-kit": hero (tagline "Your tmux, in the browser and on your phone." / sub-line "Cockpit for the agent era."), desktop+phone screenshots, install one-liner + brew line, feature cards, the "Nothing wraps your agent" differentiator paragraph, the toolkit hexagon (cube-in-hexagon mark, six companions on six edges linking into /toolkit/ and each tools subtree), desktop app card, footer. This is a sibling change to S3 (hexokit-site-structure, running in parallel in another worktree) — S3 owns /docs/, /toolkit/, and the slug/cron plumbing; you own the / page itself. Expect some overlap/rebase needed against S3 later (both may touch nav/layout); flag it rather than resolving it silently if you hit real conflicts. Design iteration is expected — this is marked Size L in the plan.

Mid-turn follow-up from Sahil:

> I have lots of assets (run-kit screenshots) you might be able to use (on the website) for this. Check the folder '/Users/sahil/Desktop/Desktop - Sahil’s MacBook Pro/' - warning - huge folder - see if there's a smart way of selecting assets from here

**Interaction mode**: conversational. The plan doc (run-kit repo, absolute path above; on this Mac it resolves to `/Users/sahil/code/sahil87/run-kit/fab/plans/sahil/26-09-10-hexokit-rebrand.md`) was read in full. Decision-log status at intake time: D1–D4, D13 confirmed; D5–D12 proposed (the pickup protocol says treat all as Certain and do not re-open). Three SRAD questions were asked and answered:

1. **Page shell** → *StarlightPage splash wrapper* (a `src/pages/index.astro` wrapping `<StarlightPage template="splash">` with a fully custom body). Rejected: a fully standalone `<html>` page (guppi/herdr shape) — it would duplicate the header/nav/theme/analytics/OG plumbing S3 is changing.
2. **Interactive terminal** (the current homepage's typeable `TerminalPrompt.astro` + 6 `terminal-*.ts` libs + 7 tests + the 746-line `homepage-terminal.md` memory) → *drop from `/`, keep the code in the tree unmounted* so S3 can mount it on `/toolkit/` (or a later `/play` page). Rejected: keeping a compact terminal on the landing (JS weight + extra design surface); deleting it (destroys work S3 may want).
3. **Hero screenshots** → *A1 desktop app + B1 phone* (see § Assets). Rejected: the existing curated `run-kit-console.webp` as hero (older, pre-July UI); deferring the pick to review.

**Rebased onto S3 (2026-09-10, after intake).** `hexokit-site-structure` (change `it5d`, PR #3) merged to `origin/main` while this intake was being written; this branch was rebased onto it and the facts below were updated: `astro.config.mjs` already carries `title: 'HexoKit'` / `description: 'Your tmux, in the browser and on your phone.'` and a `HeaderNav.astro` (Docs · Toolkit · Desktop · GitHub) in the `SocialIcons` slot; `/docs/<path>/`, `/toolkit/`, and a thin `/desktop/` page exist; `help/run-kit.json` became `help/hexokit.json`; a single roster module `src/lib/tool-roster.mjs` (typed re-export `src/lib/tool-slugs.ts`: `TOOL_ROSTER`, `mountFor`, `labelFor`, `repoFor`, `isToolSlug`) replaced the hardcoded slug lists; the dynamic route is `src/pages/[mount]/[...path].astro`; `Head.astro` already emits HexoKit JSON-LD on `/`. S3 left `index.mdx` in place (still the shll splash with HexoKit head overrides) and mounted the terminal nowhere else.

**Asset triage performed at intake** (so the apply agent does not redo it): the Desktop folder holds 1,197 flat `Screenshot <date> at <time>.png` files (Feb–Sep 2026, no subfolders). They were bucketed by pixel dimensions via Spotlight metadata (`mdls`), OCR'd with a macOS Vision-framework Swift script, keyword-scored against run-kit's UI vocabulary (sidebar labels `SERVER/SESSIONS/BOARDS/PANE/HOST`, `riff-*`, `operator`, `Run Kit`, `cron`, web/code tile terms), and the top candidates were reviewed visually on labelled contact sheets. Two genuine iPhone 16 Pro captures (1206×2622) and a dozen full-screen native-app captures (3024×1964, 14" MacBook Pro) surfaced; the rest of the pool is UI-fragment crops from design iteration and agent transcripts. The final picks are listed under § What Changes → Assets. Two gotchas for anyone re-reading the pool: `mdls -raw` prints attributes alphabetically (Height before Width), and the filenames carry a U+202F narrow no-break space before `AM`/`PM` — address them with globs (`Screenshot 2026-09-03 at 11.05.54*.png`), never a typed space.

## Why

**The problem.** shll.ai's homepage contradicts the product thesis the rebrand is built on: "Seven small CLIs that force AI agents to plan before they code", a seven-tool `ls` listing, a fab-kit-centred loop diagram, and the dashboard buried as the fifth tool. The plan (§ Why this shape) establishes that the market rewards the dashboard/multiplexer, that `run-kit` is unsearchable (SERP owned by the defunct RunKit Node playground), and that the product is **HexoKit** — a single-product site in the guppi.sh / herdr.dev shape (D6) on top of the existing Starlight docs layer. hexokit.com is already live (S2, PR #1 merged) but still serves the old shll homepage.

**Consequence of not doing it.** The whole rename is gated on this page: the pickup protocol says *"Do not start Phase 1 until Sahil has accepted the S4 landing page"* and the order is `S1 → S2 → (S3 ∥ S4) → S5 → [design accepted] → C1 → …`. Without S4, nothing renames, the two-brand confusion persists, and the "cockpit for the agent era" positioning has no front door. Because `/docs/` will read "run-kit" until X1, the landing must be hand-written so it is on-brand from day one regardless of the docs pipeline's state.

**Why this approach.**

- *Hand-written custom page, not synced content*: the plan says so explicitly, and there is no canonical upstream for a marketing page (the constitution's mechanical-sync rule targets tool docs; its v2.1.3 third content class — site-owned curated screenshots — is exactly what a landing page needs).
- *StarlightPage wrapper over a standalone page* (user decision): the existing `[slug]/[...path].astro` route already proves the pattern; the page inherits the header, theme toggle, Pagefind, `Head.astro` (analytics beacon, og:image, JSON-LD), and `Footer.astro` for free; every one of those is a surface S3 is editing, so wrapping is what keeps S4 and S3 from colliding. The body is still 100 % custom HTML/CSS in the plan's section order — "not the Starlight docs template" is satisfied.
- *Assets from Sahil's own capture pool*: real UI, current (Sep 2026) and, uniquely, two real phone captures — which the tagline literally promises.

## What Changes

All work is inside `sites/astro-starlight-terminal1/` (the live build) unless stated. Zero new dependencies (Constitution VI); fully static output, no client JS on the page (Constitution I); both themes verified (Constitution V).

### 1. Route: `src/pages/index.astro` replaces `src/content/docs/index.mdx`

- **Delete** `src/content/docs/index.mdx`. Starlight's content route for `/` would collide with a `src/pages/index.astro` route; everything the MDX carried is either retired from `/` (§ 8) or re-homed by S3.
- **Add** `src/pages/index.astro`:

```astro
---
import StarlightPage from '@astrojs/starlight/components/StarlightPage.astro';
import { Code } from '@astrojs/starlight/components';
import '../styles/landing.css';
import { FEATURES, TOOLKIT_EDGES, FOOTER_LINKS, INSTALL_LINES, HERO } from '../lib/landing-data.ts';
// version badge: help/hexokit.json `version` via normalizeVersion (skip-degrade if the file is missing)
---
<StarlightPage
  frontmatter={{
    title: 'HexoKit',
    description: 'Your tmux, in the browser and on your phone. Cockpit for the agent era — every tmux pane as a live terminal, agent-agnostic, no database.',
    template: 'splash',
    tableOfContents: false,
    head: [
      { tag: 'title', content: 'HexoKit — your tmux, in the browser and on your phone' },
      { tag: 'meta', attrs: { property: 'og:title', content: 'HexoKit — your tmux, in the browser and on your phone' } },
      { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
    ],
  }}
>
  <main class="landing not-content"> …sections in § 2 order… </main>
</StarlightPage>
```

- The `head:` entries replicate the mechanism the old `index.mdx` used (change `kb1r`): Starlight's head merge dedupes the singleton `<title>` and same-`property` metas, so the built page carries exactly one of each. `Head.astro` is **not** edited (its homepage JSON-LD and `og-image.png` belong to S3 — plan row S3: "llms.txt, JSON-LD, OG, favicon regen"); until S3 lands, `/`'s JSON-LD still says "shll". Flag in the PR.
- Astro component text is literal (no remark), so `--` and URLs in copy/commands need no JSX-expression escaping (the MDX remark hazard does not apply here).
- Every section is wrapped in `.not-content` (the site's existing opt-out from Starlight's markdown styling) and styled by `landing.css` (§ 4).

### 2. Sections, in this order (D6 + plan § Site shape)

**2.1 Hero** (`<section id="top">`)
- Eyebrow: bracket-tag label in the site's shell-comment style, e.g. `[ hexokit · v3.19.37 ]` — the version read at build time from `help/hexokit.json` (S3 renamed the collector; the envelope's `tool` field still reads `run-kit`) (`version` field, normalised via the existing `src/lib/version.ts` `normalizeVersion`); if the file is missing, omit the version (skip-degrade, mirroring the terminal tool cards' posture).
- `<h1>`: **Your tmux, in the browser and on your phone.** (verbatim)
- Sub-line: *Cockpit for the agent era.* (verbatim)
- One supporting sentence lifted from the README lead: "HexoKit is a remote console for the machine you actually work on — every tmux session and pane as a live terminal, in a sidebar, from your desk or your couch. Nothing to configure, no database, state read straight from tmux."
- CTAs: primary **Install** → `#install`; secondary **Read the docs** → `/docs/`; tertiary **GitHub** → `https://github.com/sahil87/run-kit`, built as `` `https://github.com/sahil87/${repoFor('hexokit')}` `` from the roster — the same idiom as `HeaderNav.astro`.
- Screenshot pair: desktop (`/screenshots/hexokit-hero-desktop.webp`) with the phone (`/screenshots/hexokit-hero-phone.webp`) overlapping its lower-right corner on wide viewports; stacked (phone below, centred, max 260px wide) under 60rem. Frames are CSS only (1px `--c-border`, radius, `--c-surface` backdrop) — no device-mockup images. Explicit `width`/`height` attributes for CLS; hero images `loading="eager"`, everything below `loading="lazy" decoding="async"`.

**2.2 Install** (`<section id="install">`) — D10
- Two Expressive Code blocks via Starlight's re-exported `<Code>` (same engine + copy button as every fenced block on the site; the `InstallOneLiner` precedent):
  1. `curl -fsSL hexokit.com/install | sh`
  2. `brew install sahil87/tap/hexokit`
- One note line: "Installs `shll` (the toolkit manager) and HexoKit. Want the six companions too? See the [toolkit](/toolkit/)." (wording adopted from PR #2 after review) plus "Requires tmux ≥ 3.4 — `rk doctor` checks."
- Do **not** reuse `InstallOneLiner.astro`: it hard-codes the `shll.ai/install` URL and the whole-toolkit default; the product-first line is new (D10) and S5 changes the script's default. These two lines are the plan's *target* state — the `/install` product-first default ships in S5 and the `hexokit` formula in C2; the site is unannounced until X1, so printing them now is by design.

**2.3 Features** (`<section id="features">`) — six cards in a responsive grid (3×2 ≥ 60rem, 2 cols ≥ 40rem, 1 col below). Each card = screenshot + title + one or two sentences + a "→ docs" link. Copy names only commands present in `help/hexokit.json` (`root.commands[].name`; vn39 hard rule for hand-written prose; the roster at intake time: agent, code, code-server, cron, daemon, desktop, doctor, mux, notify, operator, present, remote, riff, role, serve, skill, status, tab, tutorial, update, url — "boards" is a UI concept, never backticked as a command).

| # | Title | Copy sketch | Asset | Link |
|---|-------|-------------|-------|------|
| 1 | Every pane, a live terminal — from any device | Every tmux session and pane shows up in a sidebar. Tap one on your phone, type, and it is the same shell you left at your desk. HTTPS over Tailscale for the couch. | `hexokit-phone-terminal.webp` (B2) | `/docs/install/` |
| 2 | Agents are just panes | Windows running an agent report **active / waiting / idle** through hooks that stamp a tmux pane option — Claude Code, Codex, Gemini CLI, Copilot CLI and more. Agent-agnostic: the dashboard never speaks an agent's protocol. | `hexokit-agent-state.webp` (crop of A1: sidebar + PANE panel showing `agt · active · claude`) | `/docs/agent-hooks/` |
| 3 | `rk riff` — one agent per worktree | One command creates a git worktree, opens a tmux window in it and launches your agent; `-N 3` spawns three. The sidebar is the fleet view. | `run-kit-agent-session.webp` (existing, reused as-is) | `/docs/workflows/` |
| 4 | Boards + status dots | Pin panes from any server into a named board and watch them side by side. Every window carries a status dot: hue = journey, shape = liveness, overlays = flags. | `hexokit-board.webp` (E2) | `/docs/boards/` |
| 5 | Cron clock + operator | `rk cron` wakes an agent on a schedule; `rk operator` is the one agent that runs the server — it watches the fleet, unblocks changes and pings your phone. | `hexokit-operator.webp` (D1) | `/docs/cron-schedule-kinds/` |
| 6 | Code, web and GUI tiles | A window is not only a terminal: split in a `code` editor at the git root, a web tile your agent fills with `rk present`, or the host's GUI display. | `hexokit-web-tile.webp` (C1) | `/docs/skill/display/` |

**2.4 "Nothing wraps your agent"** (`<section id="agnostic">`) — the differentiator. Verbatim-ish from the README (¶ 2 and the *Why* table), with the product name swapped and every `rk` verb untouched:

> What makes HexoKit so good right now is what tends to run in those panes: **AI coding agents, many at once.** `rk riff` spawns each one in its own git worktree, and the dashboard lets you watch the whole fleet. But HexoKit never wraps the agent — a pane is just a pane. It's equally a build, a REPL, an ssh session, `htop`. **The agent is one of the things you run, not the thing HexoKit is.** When the agent tooling churns underneath you (and it does, monthly), the terminal layer stays put.

Followed by the two-row *It is / It isn't* contrast: *It is* — a remote, phone-first console for your tmux: agent-agnostic, no database, state derived from tmux + filesystem; a spawner (`rk riff`) and a dashboard (`rk serve`) that compose. *It isn't* — an agent wrapper: it doesn't speak any agent's protocol, parse any agent's output, or care what's in the pane.

**2.5 The toolkit hexagon** (`<section id="toolkit">`)
- Heading "The HexoKit toolkit" → links `/toolkit/`; one sentence: "HexoKit is the cockpit. Six companions sit on its six edges — each a small CLI (or app) that does one job and composes with the rest — and [`shll`](/shll/) installs them all."
- A decorative inline SVG (`aria-hidden`) of the cube-in-hexagon mark: the flat-top hexagon and cube faces from `src/assets/logo.svg` (viewBox `7 10 50 44`), recoloured to CSS custom properties (border segments `--c-fg-dim` / `--c-fg-faint`, cube faces `--c-fg-faint` / `--c-border` / `--c-surface-2`, accent on hover) so both themes pass (Constitution V).
- Six **HTML** `<a>` labels positioned around the six edges (absolute positioning over the SVG box, collapsing to a plain 2×3 grid under 40rem) — HTML anchors, not SVG `<a>`, so they are keyboard-navigable with visible focus rings (Accessibility constraint). Proposed clockwise from the top edge: **fab-kit** → `/fab-kit/`, **wt** → `/wt/`, **idea** → `/idea/`, **tu** → `/tu/`, **hop** → `/hop/`, **desktop** → `/desktop/` (S3's thin desktop page — the same target as the header nav's Desktop item). The five tool hrefs are built from the roster (`` `/${mountFor(slug)}/` ``), never hardcoded. `shll` is not on an edge (the plan's six); it is named in the framing sentence, the install note and the footer as the installer.
- Adjacent textual list (the constitution's "decorative diagrams SHOULD have a textual explanation adjacent"): one line each, at the "what it's for" level, no commands. Copy the five CLI one-liners **verbatim from `src/content/docs/toolkit/index.mdx` § The six companions** (S3's family page; the two copies are a hand-copy drift surface to record in memory) — fab-kit "the planning harness — a constitution and a plan before any agent writes code"; wt "disposable git worktrees so each change works in isolation"; idea "capture ideas and feed a backlog without breaking flow"; tu "track what your AI coding sessions cost"; hop "a personal directory of your git repos — jump anywhere, batch-update from anywhere"; desktop "the native macOS shell for the dashboard". This list becomes the page's hand-copy drift surface for tool one-liners (record in memory, replacing the retired `ld0j` listing).

**2.6 Desktop app card** (`<section id="desktop">`) — the app has no page anywhere today.
- Screenshot `hexokit-desktop-app.webp` (F1, macOS menu bar kept — it proves the app is native), copy from the README's *Desktop app (macOS)*: an Electron shell that wraps the dashboard and frees the browser-reserved `⌘` keyboard tier; connects three ways — **This Mac** (one-click daemon start), **over SSH** (`rk remote`), or **a URL**; never starts, stops or updates anything on its own; tmux sessions survive every daemon action.
- EC block: `rk desktop install` / `rk desktop update`, with the one-liner reason ("the CLI path produces a quarantine-free, digest-verified install; a browser-downloaded DMG trips Gatekeeper").
- Link → `/docs/install/` (the synced page carries the `#desktop-app-macos` anchor; link to the page, not the anchor, so a heading rename upstream cannot break it). The card keeps `id="desktop"` for in-page anchoring; S3's `/desktop/` page is the hexagon-edge and nav target, this card is the marketing surface.

**2.7 Footer** (`<footer class="landing-footer">`) — the landing's own link row, in the plan's order: **Docs** `/docs/` · **Toolkit** `/toolkit/` · **GitHub** `https://github.com/sahil87/run-kit` · **Discord** `https://discord.gg/32XHh5mJYn` · **versions.json** `/versions.json` · **llms.txt** `/llms.txt`. Starlight's site footer (`Footer.astro` — copyright + author links, change `d9qb`) still renders below it via `StarlightPage`; S4 does not edit `Footer.astro`.

**Post-review copy pass (2026-09-10, after PR #4 review; user-approved from `docs/findings/landing-copy-study.md` priorities 1–6).** The shipped copy supersedes the table above where they differ: features H2 → "Everything is a live terminal" (eyebrow `[ what it does ]` kept); card titles → 1 unchanged, 2 "Waiting, working, idle — at a glance", 3 "One command per parallel agent", 4 "Watch three agents and the dev server at once", 5 "Work that starts without you", 6 "A window is not only a terminal" (bodies tightened per the study); differentiator paragraph trimmed 87 → 62 words with the agent-churn sentence moved into the *It isn't* row; install notes → "Installs `shll` (the toolkit manager) and HexoKit — nothing else. The six companions are one more command away." / "Requires tmux ≥ 3.4. Run `rk doctor` if anything looks wrong."; hero lead drops "in a sidebar"; desktop H2 → "A native window, and the ⌘ tier back"; toolkit sentence drops "(or app)"; an explicit "→ See the whole toolkit" link follows the hexagon. `src/lib/landing-data.ts` and `src/pages/index.astro` are the source of truth for the live strings.

**Design-iteration pass (2026-09-10, after the copy pass; user feedback on PR #4).** (1) Card images were too zoomed out: card crops are now tight ~16:10 boxes on the one UI region each claim is about (`agent-state` 1000×625 on the lower sidebar + `agt idle` strip; `board` on two pinned panes; `operator` on the popover's left two thirds; `web-tile` on the tile + terminal edge; a new `hexokit-fleet.webp` re-crop of the committed `run-kit-agent-session.webp` for the fleet card). (2) A seventh, full-width feature card "The operator drops in from any tab" (`wide: true`, image `hexokit-operator-console.webp` — the operator console's Quake-style drawer over a tab) — the user asked for the Quake terminal as a feature; the H2 no longer counts cards, so a seventh is fine; the contract test now expects seven. (3) The toolkit hexagon renders the ORIGINAL logo colours (verbatim `logo.svg` greys) in both themes — the token-recoloured mark read as a different logo per theme; user decision, matching PR #2's `HkMark.astro`.

**Differentiator H2 (2026-09-10, user's line).** "Nothing wraps your agent" → **"Use any agent, untouched"** — plainer than "wraps", and it carries both halves of the thesis (agent-agnostic + no wrapper). The paragraph and the It is / It isn't rows beneath it are unchanged.

**Desktop H2 (2026-09-10, user feedback).** "A native window, and the ⌘ tier back" assumed the reader knew browsers reserve the ⌘ shortcuts. Now **"The desktop app"** (user's pick — a heading that survives the planned Linux build; the body says "macOS today"), and the body opens with the concrete problem before the fix: "In a browser tab, ⌘W closes the tab and ⌘T opens another — the browser keeps that whole tier of shortcuts for itself. In a window of its own, they all reach your terminal."

### 3. Assets

Sources are in `/Users/sahil/Desktop/Desktop - Sahil’s MacBook Pro/` (address with globs — U+202F before AM/PM). Outputs go to `public/screenshots/` next to the two existing run-kit webps (constitution v2.1.3: site-owned curated screenshots, `.webp`, meaningful alt text).

| Output (`public/screenshots/`) | Source (glob) | Source px | Treatment | Used by |
|---|---|---|---|---|
| `hexokit-hero-desktop.webp` | `Screenshot 2026-09-03 at 11.05.54*AM.png` | 3024×1964 | crop to the Run Kit window (drop macOS menu bar + desktop margin); ≤ 2400px wide | hero |
| `hexokit-hero-phone.webp` | `Screenshot 2026-07-15 at 22.43.47.png` | 1206×2622 | as-is (iOS status bar kept); ≤ 800px wide | hero |
| `hexokit-phone-terminal.webp` | `Screenshot 2026-07-15 at 22.41.22.png` | 1206×2622 | as-is; ≤ 800px wide | card 1 |
| `hexokit-agent-state.webp` | same source as hero-desktop | — | crop: sidebar SESSIONS list + PANE panel (`agt · active · claude`) | card 2 |
| *(reuse)* `run-kit-agent-session.webp` | already committed | — | none | card 3 |
| `hexokit-board.webp` | `Screenshot 2026-07-08 at 8.25.23*PM.png` | 4832×2292 | crop to the app window — the source has a large blank area below the window; verify the three pinned panes and the `Board: bb` header survive | card 4 |
| `hexokit-operator.webp` | `Screenshot 2026-09-07 at 2.06.36*PM.png` | 1618×676 | as-is (already a clean crop of the operator popover) | card 5 |
| `hexokit-web-tile.webp` | `Screenshot 2026-08-19 at 9.02.22*PM.png` | 3024×1898 | crop to window (terminal left, web tile rendering an HTML plan right) | card 6 |
| `hexokit-desktop-app.webp` | `Screenshot 2026-08-15 at 12.03.09*AM.png` | 3024×1964 | keep the macOS menu bar; ≤ 1600px wide | desktop card |

Alternates if a pick fails on inspection: A2 `Screenshot 2026-09-08 at 11.56.41*PM.png` (4252×2840, dashboard in browser); C2 `Screenshot 2026-09-08 at 7.00.13*PM.png` (2644×1502, the `code` lens editor beside the web tile's empty state); D2 `Screenshot 2026-09-07 at 7.28.15*PM.png` (operator popover, busier); F2 `Screenshot 2026-07-20 at 12.18.10*PM.png` (native app with menu bar, single pane).

Pipeline: ImageMagick (`magick`, installed) or the site's existing `sharp` dependency in a one-off script — webp quality ≈ 80, metadata stripped, widths as above; hero desktop ≤ ~350 KB, phone shots ≤ ~150 KB each, lazy-loaded cards ≤ ~250 KB each. Before committing, eyeball every crop for anything sensitive (tokens, emails, private hostnames beyond the `dev-ws-sahil02` already present in the shipped screenshots) and pick a crop that avoids it. Do not commit the raw PNGs or the OCR triage output.

### 4. Styling: `src/styles/landing.css`

- Imported by `index.astro` only (not via `customCss` in `astro.config.mjs` — that array is S3's territory and the page is the only consumer). Component-local rules may use scoped `<style>` in the `.astro` file; shared landing rules live in the CSS file.
- Uses the existing tokens (`--c-bg/--c-surface/--c-surface-2/--c-border/--c-fg/--c-fg-dim/--c-fg-faint/--c-accent/--c-accent-2/--c-accent-3`, `--sl-font-mono`); the light "paper terminal" palette follows automatically through `[data-theme='light']`. Dark-first design; light verified.
- Vocabulary borrowed from run-kit's `app/frontend/src/globals.css` so site and app look like one thing: bracket-tag section labels with a blinking caret cell (`rk-caret-blink` cadence 1.06s steps(1)); a **typed-sweep** reveal on section labels; a **CRT glint** on the primary CTA (skewed highlight strip sweeping the button face on hover); an optional faint scanline overlay on screenshot frames. All motion under `@media (prefers-reduced-motion: no-preference)` (terminal.css's existing reduced-motion section is the precedent); CSS-only — if the typed sweep cannot be done in CSS alone, drop it rather than add page JS.
- Layout: `max-width: 72rem` centred; the hero's two columns from 60rem; feature grid per § 2.3; hexagon section two columns (mark left, list right) from 48rem.
- Reuse, don't duplicate: `.shell-session` caption lines and the single terminal-link selector group from `terminal.css` (`ld0j` keeps every terminal-styled link in one selector group — add `.landing a` to that group in `terminal.css` only if unavoidable; prefer landing-scoped link rules to keep `terminal.css` untouched for S3).

### 5. Data module + test: `src/lib/landing-data.ts`, `scripts/landing-data.test.mjs`

- `landing-data.ts` exports the page's content as data: `HERO` (tagline, sub-line, lead), `INSTALL_LINES`, `FEATURES` (title, copy, img `{src, alt, width, height}`, href), `TOOLKIT_EDGES` (`{slug|'desktop', label, href, blurb}` in clockwise order), `FOOTER_LINKS`. The `.astro` file renders it; copy edits are data edits.
- `landing-data.test.mjs` (node `--test`, Node ≥ 22 native `.ts` type-stripping — the same harness as `scripts/terminal-toolcard.test.mjs`): every toolkit edge whose slug is a tool satisfies `isToolSlug` from `src/lib/tool-slugs.ts` and links `/<slug>/`; the `desktop` edge links `#desktop`; every backticked `rk <verb>` token across `FEATURES` copy exists in `help/hexokit.json`'s `root.commands[].name` (mechanising the vn39 rule for this page); the `desktop` edge links `/desktop/` and the five tool edges link `` `/${mountFor(slug)}/` ``; `FOOTER_LINKS` is exactly the plan's six in order; `INSTALL_LINES` are exactly the two D10 lines.
- CI already runs `node --test scripts/*.test.mjs` (ci.yml) — the new test is picked up without workflow edits.

### 6. Starlight config: no touch

- S3 (`it5d`, merged) already set `starlight.title: 'HexoKit'` and `description: 'Your tmux, in the browser and on your phone.'` and registered `HeaderNav.astro` (Docs · Toolkit · Desktop · GitHub) in the `SocialIcons` slot. `astro.config.mjs` MUST NOT change in this change.

### 7. Docs touch

- Site `README.md` (`sites/astro-starlight-terminal1/README.md`): the layout tree's `index.mdx  # splash (ASCII shell session + loop diagram)` line becomes `src/pages/index.astro  # product landing (StarlightPage splash wrapper)`; add `landing.css` under styles. Two-line edit.

### 8. Removed from `/` — and what deliberately stays in the tree

Removed from the homepage: the seven-tool chip row and `ls -l tools/` listing, the `$ shll install` transcript and `<VersionTable/>`, the typeable `<TerminalPrompt/>`, the loop `<Diagram/>` and its prose, the `cat ABOUT.md` and `$ whoami` blocks, the Discord caption (the plan: "What is deliberately not on the homepage: the seven-tool table, the install-everything-first flow, fab-kit's pipeline diagram").

Kept, unmounted or used elsewhere (**do not delete in this change**): `TerminalPrompt.astro` + `src/lib/terminal-*.ts` + their `scripts/terminal-*.test.mjs` (user decision — S3 may mount the terminal on `/toolkit/`); `Diagram.astro` + `public/diagrams/loop-*.svg` (the loop lives at `/fab-kit/` and `/toolkit/` per the plan); `VersionTable.astro` (`tools/index.mdx`); `InstallOneLiner.astro` (tool overviews); `ThemeSelect.astro`'s hidden `<select>` seam (the terminal's `theme` command still targets it when mounted). The `$ whoami` author block is not re-homed by S4 — `Footer.astro` still carries the same links site-wide (the `d9qb` three-way hand-copy drift surface shrinks to two: Footer + the terminal's `whoami` egg; note it in memory).

### 9. Coordination with S3 (`hexokit-site-structure`, merged as PR #3 — this branch is rebased onto it)

- **Landed by S3, inherited by `/` through the StarlightPage wrapper**: `HeaderNav.astro` nav, HexoKit title/description, HexoKit JSON-LD + og-image in `Head.astro`, the Discord link in `Footer.astro`. S4 edits none of these files.
- **URL scheme is live**: `/docs/<path>/` for every `content/hexokit/site/**` page (install, workflows, boards, notifications, agent-hooks, status-dot, customizing-tmux, cron-schedule-kinds, skill, skill/{code,display,gui,messaging,mux,tutorial}), `/toolkit/`, `/desktop/`. Every landing link resolves on this branch.
- **`index.mdx`**: S3's version (shll splash with HexoKit head overrides) is what S4 deletes. After the delete, `TerminalPrompt.astro` has no mount — verify by grep; the component stays in the tree (user decision).
- **Memory**: S3 hydrated `conventions/tool-page-rubric`, `seo-social-meta`, `tool-roster` (new), `site/homepage-terminal`; S4's hydrate merges on top as current truth.
- **`terminal.css`**: untouched by S4 (`landing.css` instead).

## Affected Memory

- `site/landing-page`: (new) — lives at `sites/astro-starlight-terminal1/docs/memory/site/landing-page.md` (site-implementation memory per `fab/project/context.md`; hand-maintained index at `sites/astro-starlight-terminal1/docs/memory/site/index.md` gains a row). Covers: the `src/pages/index.astro` + `StarlightPage` splash shell, the section order and `landing-data.ts` data shape, the asset table (sources, crops, targets, alt text), the `landing.css` vocabulary and reduced-motion gate, the vn39 test, and the S3 seams (`/#desktop`, D7 links, `title` flip).
- `site/homepage-terminal`: (modify) — the terminal is no longer mounted on `/`; component/libs/tests retained unmounted pending S3's `/toolkit/`; the `ThemeSelect` seam and `data-terminal-prompt` contract are unchanged.
- `conventions/tool-page-rubric`: (modify) — the `ld0j` homepage newcomer blocks (chips, `ls -l` listing, `whoami`, install block) are retired; the toolkit-hexagon list is the new hand-copy surface for five tool one-liners (+ desktop); the `d9qb` author-link drift surface drops to two copies; `/` is no longer an `InstallOneLiner` consumer.
- `conventions/tool-roster`: (modify) — the landing is a new roster consumer (`mountFor`/`labelFor` for the hexagon edge hrefs, `repoFor('hexokit')` for the GitHub CTA).
- `conventions/seo-social-meta`: (modify) — the homepage frontmatter `head:` overrides now ride `StarlightPage`'s `frontmatter.head` in `index.astro` (same dedupe semantics); Head.astro's homepage JSON-LD and og-image are unchanged here and are queued for S3.

## Impact

- **Files**: new `src/pages/index.astro`, `src/styles/landing.css`, `src/lib/landing-data.ts`, `scripts/landing-data.test.mjs`, eight `.webp` under `public/screenshots/`; deleted `src/content/docs/index.mdx`; edited site `README.md` (Layout block); memory files above. `astro.config.mjs` untouched. No new dependencies, no workflow edits.
- **Verification**: `pnpm install && pnpm build` clean (no route collision, no missing-asset warnings); `node --test scripts/*.test.mjs` green including the new test; `node scripts/validate-help.mjs` unchanged; `pnpm dev` and eyeball `/` at ~1440px and ~400px in **both** themes (Constitution V) with keyboard-only navigation across the hexagon labels and CTAs; Lighthouse-style sanity on image weight (above-the-fold ≤ ~600 KB). If `rk` is available, `rk present :4321` to show the dev server in the run-kit web tile for design review.
- **Design iteration**: expected (Size L). Apply should produce a first full pass, then iterate on hero composition, hexagon proportions and card density against screenshots of both themes; review is the acceptance gate the plan's Phase 1 waits on.
- **Risks**: image weight (mitigated by the budgets above); the board source needing a re-capture if the crop is unusable (alternate: reuse a sidebar+dot crop and change the card's image to the status-dot legend `status-dot-reference.svg` from run-kit `docs/img/` — an SVG is theme-safe).

## Open Questions

- Hexagon edge → tool assignment (clockwise from top: fab-kit, wt, idea, tu, hop, desktop is the proposal; apply may reorder for label fit — record the final order in `landing-data.ts` and memory).
- Final crop bounds for `hexokit-board.webp` (E2 has a large blank area below the window); fall back to the alternates in § 3 if the three pinned panes do not read at card size.

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Certain | Page shell = `src/pages/index.astro` wrapping `<StarlightPage template="splash">`; `src/content/docs/index.mdx` deleted | Asked — user chose the wrapper over a standalone page; mirrors the existing `[slug]/[...path].astro` pattern and minimises S3 conflicts | S:95 R:70 A:90 D:95 |
| 2 | Certain | Interactive terminal removed from `/`; `TerminalPrompt.astro`, `terminal-*.ts` libs and tests stay in the tree unmounted | Asked — user chose "drop from /, keep the code" so S3 can mount it on `/toolkit/` | S:95 R:90 A:85 D:95 |
| 3 | Certain | Hero pair = `Screenshot 2026-09-03 at 11.05.54 AM.png` (native app, two agent panes) + `Screenshot 2026-07-15 at 22.43.47.png` (iPhone sidebar) | Asked — user chose A1 + B1 from the OCR-ranked finalists | S:95 R:95 A:85 D:95 |
| 4 | Certain | Section order: hero → install → features → "Nothing wraps your agent" → toolkit hexagon → desktop card → footer | Plan § Site shape lists exactly this order | S:95 R:85 A:95 D:95 |
| 5 | Certain | Hero copy verbatim: "Your tmux, in the browser and on your phone." / "Cockpit for the agent era." | Given verbatim in the task and the plan | S:100 R:95 A:95 D:100 |
| 6 | Certain | Install lines are the D10 target state: the `curl -fsSL hexokit.com/install` one-liner piped to `sh`, and `brew install sahil87/tap/hexokit`, even though `/install`'s default (S5) and the formula (C2) land later | Plan D10 + S4 row; the site is unannounced until X1 | S:90 R:95 A:85 D:90 |
| 7 | Certain | Hexagon edges = fab-kit, wt, idea, tu, hop, desktop; `shll` named in the install note/footer, not on an edge | Plan § Site shape names exactly these six | S:90 R:85 A:90 D:85 |
| 8 | Certain | Internal links use the D7 scheme (`/docs/<path>/`, `/toolkit/`, `/desktop/`) — all live on this branch after the S3 rebase | Plan D7; S3 (PR #3) merged and this branch is rebased onto it | S:90 R:95 A:95 D:90 |
| 9 | Confident | Feature-card asset mapping per § 3 (B2, A1-crop, existing agent-session, E2, D1, C1) and F1 for the desktop card | Chosen from the visual review of OCR-ranked candidates; each card's image is a data-file swap | S:60 R:90 A:75 D:65 |
| 10 | Confident | Assets committed as `public/screenshots/hexokit-*.webp` (q≈80, ≤1600px; hero ≤2400px, phones ≤800px), alt text, width/height attrs | Constitution v2.1.3 third content class + the run-kit precedent; naming by product, not tool slug (the slug flips in S3) | S:60 R:90 A:85 D:75 |
| 11 | Confident | Landing styles isolated in `src/styles/landing.css` imported by the page; `terminal.css` and `customCss` untouched | Keeps S4 out of S3's files; the page is the only consumer | S:55 R:90 A:85 D:75 |
| 12 | Certain | `astro.config.mjs` untouched — S3 already set `title: 'HexoKit'` / the product description and registered `HeaderNav.astro` | Verified on `origin/main` after the rebase | S:95 R:95 A:95 D:95 |
| 13 | Certain | `Head.astro` (JSON-LD, og:image), `Footer.astro`, `llms*.txt`, favicon are not edited; page-level title/og via `StarlightPage` `frontmatter.head` | Plan row S3 owns JSON-LD/OG/llms/favicon; the `kb1r` head-merge mechanism is proven | S:70 R:90 A:85 D:80 |
| 14 | Confident | Hexagon = decorative inline SVG (`aria-hidden`, logo geometry recoloured to tokens) + HTML `<a>` labels positioned around it + adjacent textual list | Accessibility constraint (keyboard focus, textual explanation) and Constitution V (theme parity via tokens) | S:60 R:85 A:80 D:60 |
| 15 | Confident | Motion vocabulary (bracket labels with caret blink, typed-sweep, CRT glint on the CTA, optional scanlines) is CSS-only and reduced-motion gated; no page JS | Plan asks for run-kit's visual vocabulary; Constitution I + the site's existing reduced-motion section | S:65 R:90 A:75 D:60 |
| 16 | Confident | Content lives in `src/lib/landing-data.ts` with `scripts/landing-data.test.mjs` checking roster mounts, `/desktop/`, footer set, install lines and every `rk <verb>` against `help/hexokit.json` `root.commands` | Mechanises the vn39 hard rule for hand-written prose; follows the existing `scripts/*.test.mjs` harness | S:40 R:90 A:85 D:70 |
| 17 | Confident | Hero eyebrow shows the product version from `help/hexokit.json` via `normalizeVersion`, omitted if the file is missing | Small, on-brand, single-sourced; skip-degrade mirrors the terminal tool cards | S:25 R:95 A:70 D:45 |
| 18 | Certain | Differentiator = README ¶2 + the *It is / It isn't* rows, `run-kit` → `HexoKit`, `rk` verbs untouched | Plan: "the agent-agnostic paragraph from the README, verbatim-ish"; D2 keeps `rk` | S:85 R:95 A:90 D:85 |
| 19 | Confident | Edge assignment clockwise from top: fab-kit, wt, idea, tu, hop, desktop | Cosmetic; apply may reorder for label fit and records the final order | S:30 R:95 A:50 D:30 |
| 20 | Confident | The hexagon's desktop edge links S3's `/desktop/` page (same target as the nav); the landing card keeps `id="desktop"` and links `/docs/install/` | A real page like the other five edges; the card stays the marketing surface | S:60 R:90 A:80 D:65 |
| 21 | Certain | `Diagram.astro`, loop SVGs, `VersionTable`, `InstallOneLiner`, `ThemeSelect` seam stay in the tree | Used by other pages or by S3's `/toolkit/`; deleting is out of S4's scope | S:60 R:95 A:90 D:80 |
| 22 | Confident | `hexokit-board.webp` is cropped from `Screenshot 2026-07-08 at 8.25.23 PM.png`; if unusable, fall back to the § 3 alternates or the status-dot legend SVG | The source has a large blank area; the board view is the only real one in the pool | S:40 R:90 A:50 D:40 |

22 assumptions (12 certain, 10 confident, 0 tentative, 0 unresolved).
