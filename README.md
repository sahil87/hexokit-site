# hexokit-site

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Source for **[hexokit.com](https://hexokit.com)** — the product site for **HexoKit** (your tmux, in the browser and on your phone) and its toolkit of companion CLIs (`fab-kit`, `wt`, `idea`, `tu`, `hop`, `shll`) from [@sahil87](https://github.com/sahil87). The product's own source repo stays [sahil87/run-kit](https://github.com/sahil87/run-kit) — this repo is the site.

## Layout

This repo hosts multiple website variants under `sites/`. One is the live build; the others are experiments.

```
sites/
├── astro-starlight-terminal1/  # currently live at hexokit.com
└── _playground/                # scratch space for new experiments
```

Each site is a self-contained project with its own `package.json` and dependencies. The live build is chosen by `.github/workflows/deploy.yml` (`SITE_DIR` env var) — swap it by editing that one line.

## Run the live site locally

```sh
cd sites/astro-starlight-terminal1
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # static output → ./dist/
```

See [`sites/astro-starlight-terminal1/README.md`](./sites/astro-starlight-terminal1/README.md) for site-specific details.

## Start a new experiment

```sh
mkdir sites/_playground/<your-experiment-name>
cd sites/_playground/<your-experiment-name>
# scaffold whatever framework you want
```

Experiments aren't deployed. Promote one by moving it from `_playground/` to a peer `sites/<name>/` directory and updating `SITE_DIR` in the deploy workflow.

## Conventions

The project follows a written [constitution](./fab/project/constitution.md) — most notably:

- **Static-first, zero runtime** — no SSR, no client data fetching for primary content
- **Deploy via CI, never manually** — `dist/` is never committed
- **Dark-mode parity** — every UI element renders correctly in both themes
- **Multi-site isolation** — each site under `sites/` owns its own stack; cross-site sharing is opt-in

Stack choices, styling, and content shape are now per-site decisions, not project-wide rules. See each site's README.

## License

MIT — see [LICENSE](./LICENSE).
