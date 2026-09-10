---
description: "Site-specific implementation behavior for the astro-starlight-terminal1 build (LIVE hexokit.com build)"
---
# site

> Hand-maintained (this tree is outside `fab memory-index`). Descriptions come from each file's `description:` frontmatter.

| File | Description | Last Updated |
|------|-------------|-------------|
| [homepage-terminal](homepage-terminal.md) | The terminal island (`TerminalPrompt.astro` + six `src/lib/terminal-*.ts` libs + six `scripts/terminal-*.test.mjs` suites), retained in the tree with no page mounting it: the progressive-enhancement boundary a host page must satisfy (static `shell-session` transcript + a `[data-terminal-prompt]` final line), the 67-command dispatch map and eggs, the `onKeydown` shell affordances, the replay/share/demo/play engines and the toys, the Starlight theme-select sync, and the `.terminal-window` chrome. | 2026-09-10 |
| [landing-page](landing-page.md) | The `/` HexoKit product landing page: `src/pages/index.astro` wrapping a StarlightPage splash with a custom body (no `index.mdx`); `landing-data.ts` as the single copy/link/asset module plus its `landing-data.test.mjs` contract (roster mounts, `rk <verb>` ∈ `help/hexokit.json`); the `build-landing-screenshots.mjs` asset pipeline; `landing.css` (breakpoints, gated motion, the accent-as-text contrast exception, the phone-width header override); `ToolkitHexagon.astro`; the drift surfaces. | 2026-09-10 |
