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
