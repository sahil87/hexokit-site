# Project Context

Product site for **HexoKit** at [hexokit.com](https://hexokit.com) — *your tmux, in the browser and on your phone*. The site presents the product (docs at `/docs/`) plus its toolkit of six companion CLIs: `fab-kit`, `wt`, `idea`, `tu`, `hop`, `shll` (each at its root slug). The product's source repo stays [sahil87/run-kit](https://github.com/sahil87/run-kit) — this repo (`sahil87/hexokit-site`) is the site only. (This site began as a copy of shll.ai, the toolkit's previous landing page.)

## Three content layers

1. **Synced pulled data** (repo-root `help/<slug>.json` + `content/<slug>/**`) — command references and README/docs-site slices, refreshed by the daily `refresh-help.yml` / `refresh-readme.yml` crons and rendered at build time.
2. **Site-authored docs** (`sites/*/src/content/docs/`) — the `/docs/` product stubs, the `/toolkit/` family pages, `/desktop/`.
3. **Site chrome & identity** — components, nav, JSON-LD/OG, llms.txt, versions.json.

The roster wiring these together is **one module**: `sites/astro-starlight-terminal1/src/lib/tool-roster.mjs` — the four-name rule: `slug` (pulled-data key) vs `mount` (URL segment; HexoKit mounts at `docs`) vs `repo` vs `formula`/`binary`. HexoKit is the first tool where these differ (`hexokit` / `docs` / `run-kit` / `run-kit`); consumers never hardcode `/<slug>/` or `sahil87/<slug>`.

## Repo layout

```
sites/
├── astro-starlight-terminal1/  # currently LIVE at hexokit.com (Astro 6 + Starlight, terminal theme)
├── astro-tailwind-terminal1/   # variant (not deployed)
└── _playground/                # scratch space — experiments (no deploy)
help/ content/                  # repo-root pulled data (survive a live-site swap)
.github/workflows/deploy.yml    # SITE_DIR env var selects which site ships
fab/                            # project meta (config, constitution, this file)
docs/                           # project-level memory + specs (NOT per-site)
```

Per-site implementation details (stack choices, file conventions, styling system) live inside that site's directory — typically a `README.md` and `docs/memory/site/` under the site root. Top-level `docs/memory/` is reserved for project-level concerns that span sites (deploy strategy, cross-site conventions).

## Deployment

GitHub Pages via `.github/workflows/deploy.yml` on push to `main`, serving `hexokit.com`. The workflow's `SITE_DIR` env var picks which subdirectory under `sites/` is built and deployed — swap the live site by editing that one line.

`dist/` is gitignored at any depth; CI is the single source of truth for what's live (Constitution VI). Custom domain `hexokit.com` set via `public/CNAME` inside the live site's directory.

## What this project is

- **The HexoKit product site**, with room for parallel website-design variants under `sites/`.
- **Static-first** — every site SHALL produce fully static output. No SSR adapters, no server endpoints, no runtime data fetching for primary content.

## What this project is NOT

- Not the product's source — HexoKit's code lives in `sahil87/run-kit`; this repo hosts the site and the pulled documentation mirrors.
- Not a monorepo with shared dependencies — each site under `sites/` owns its own `package.json` and stack. Sharing is opt-in, not the default.
- Not server-rendered.

## Task runner (`just`) and Playwright

A root `justfile` wraps the live site's toolchain (`just --list`): `setup` (pnpm install), `dev`, `build`, `preview`, `validate` + `test` + `verify` (the same commands `.github/workflows/ci.yml` runs), and two Playwright recipes.

**Playwright is installed per worktree, whenever needed — not by default.** `@playwright/test` is a *devDependency* of the live site (dev-only tooling for visual verification, not a runtime or build dependency — Constitution VI's justification bar applies to those; the static output is unaffected). `pnpm install` brings the npm package; the Chromium browser is fetched only by `just playwright` (copied from run-kit's `just setup`: `pnpm exec playwright install --with-deps chromium`). The recipes are cross-platform (Playwright's installer covers macOS and Linux); the browser build lands in Playwright's per-user cache (`~/Library/Caches/ms-playwright` on macOS, `~/.cache/ms-playwright` on Linux), so a worktree whose build is already cached pays nothing. A fresh worktree has no `node_modules`, so Playwright is absent there until `just setup` / `just playwright` runs — do not go looking for an install in sibling worktrees.

Use it for design review: `just shot <url> <out.png> [width] [height] [scheme]` takes a full-page headless screenshot (default 1440×900, dark) of a dev/preview page or a `file:///abs/path.html`; pass `400 900` for phone width and `light` as the fifth argument for the light theme. The scheme flag drives `prefers-color-scheme`, which Starlight's default `auto` theme follows in a fresh headless context, so both themes (Constitution V) are one recipe call each — no `localStorage` poking needed.

## Copy on this site

Copy added to hexokit.com follows the two studies in `docs/findings/` — [`landing-copy-study.md`](../../docs/findings/landing-copy-study.md) (structure and claims, with a do/don't style sheet in its § 5) and [`landing-copy-study-2-minimal.md`](../../docs/findings/landing-copy-study-2-minimal.md) (volume and register, with measured competitor norms: card blurbs median 14 words, heroes 19). The standing rule:

- **Say it the way you would say it aloud.** Short sentences (aim under 15 words), one claim each. If a section needs 40 words, use four sentences, not two.
- **Outcome over mechanism.** Name what the reader sees or gets; leave how it works to the docs.
- **Plain punctuation.** No em-dash chains, no colon-led lists inside sentences, no parenthetical asides, no rhetorical questions.
- **The reader's words, bare.** tmux, pane, session, window, worktree, board, agent — used without a gloss. Never introduce an insider term on a marketing surface ("pane option", "harness", "liveness", "tier", "substrate" stay in the docs).
- **Headings make one claim** and never depend on the number of items beneath them. No counts as scope ("six things"), no hedges ("is good at", "helps you"), no adjectives as proof.
- **Commands only if they exist.** Hand-written prose may name only `rk` verbs present in `help/hexokit.json` (the `vn39` rule). The product is **HexoKit**; the binary is `rk`.
- **Measure before shipping.** A card body over ~20 words, a hero lead over ~30, or a sentence you would not say to a colleague is a signal to cut.
