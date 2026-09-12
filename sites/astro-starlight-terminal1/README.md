# astro-starlight-terminal1

The currently-live build of [hexokit.com](https://hexokit.com). Astro 6 + Starlight 0.39, terminal-themed.

## Develop

```sh
cd sites/astro-starlight-terminal1
pnpm install
pnpm dev        # http://127.0.0.1:4321
pnpm build      # static output → ./dist/
pnpm preview    # preview the build locally
```

Verify (the same commands `.github/workflows/ci.yml` runs):

```sh
node scripts/validate-help.mjs              # help/*.json against the contract schema
node --test scripts/*.test.mjs              # unit suite
pnpm build                                  # full static build
node scripts/check-shll-ai-redirects.mjs    # every old shll.ai URL lands (post-build)
```

Node ≥ 22.12 and pnpm 10. The `dist/` directory is gitignored — never commit it; CI is the single source of truth for what's live.

## Stack

- **[Astro 6](https://astro.build)** — static site generator, no SSR adapter.
- **[Starlight 0.39](https://starlight.astro.build)** — doc-site framework (sidebar nav, prev/next, search via Pagefind, a11y).
- **[Expressive Code](https://expressive-code.com)** — code block rendering, themed to the project palette.
- **JetBrains Mono** — self-hosted via `@fontsource/jetbrains-mono`.

## Layout

```
src/
├── pages/
│   ├── index.astro      # product landing (StarlightPage splash wrapper)
│   └── [mount]/         # per-tool docs/site tree, keyed by roster mount
├── content/docs/        # Starlight content collection
│   ├── toolkit/         # the family: overview, install, daily-flow, philosophy
│   ├── tools/<tool>/    # per-tool: overview, install, commands, workflows
│   └── desktop.md       # the macOS app page
├── content.config.ts    # Starlight docs loader + schema
├── components/
│   ├── HeaderNav.astro      # header nav (SocialIcons slot override)
│   ├── ToolkitHexagon.astro # landing: brand mark + six edge links
│   └── Diagram.astro        # theme-aware SVG <img> swap
├── lib/
│   ├── tool-roster.mjs  # the single tool roster (slug/mount/repo/formula)
│   └── landing-data.ts  # the landing page's copy, links and assets
├── assets/
│   └── logo.svg         # site logo (HexoKit hexagon)
└── styles/
    ├── terminal.css     # palette + terminal aesthetic overrides
    └── landing.css      # landing-only layout, frames and motion
public/
├── CNAME                # hexokit.com custom domain
├── favicon.{svg,ico}    # browser tab icon
├── screenshots/         # curated site-owned product screenshots (.webp)
├── diagrams/loop-{light,dark}.svg
└── og-image.png
```

## Theming

Terminal aesthetic is achieved entirely via CSS variable overrides in `src/styles/terminal.css` — no forked Starlight components. Two palettes (paper light + dark) flip via the standard Starlight theme toggle.

Major customizations:

- Mono font everywhere (`--sl-font: JetBrains Mono`)
- Two terminal palettes (`--c-bg`, `--c-fg`, accents) mapped onto Starlight's `--sl-color-*` tokens
- Sidebar groups render as `# Group name` shell comments; nested groups too
- Caret SVGs replaced with text `+` / `-` (collapsed / expanded)
- Active sidebar/TOC item: `> ` accent marker, no background pill
- H2 headings get a `## ` sage prefix; dashed top border on H2s after content
- Code blocks: themed Expressive Code terminal frames, Mac dots hidden
- Blinking cursor on first paragraph of every doc page
- Landing (`/`): a custom `src/pages/index.astro` body on Starlight's splash template, styled by `src/styles/landing.css` (no Starlight cards)
