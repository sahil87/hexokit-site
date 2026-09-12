---
type: memory
description: "The single site-authored tool roster (`src/lib/tool-roster.mjs`, plain ESM for config-eval; `tool-slugs.ts` is its typed re-export): one record per tool with the four names — slug (pulled-data key), mount (URL segment), repo (GitHub), formula/binary — plus `legacyMounts` and the `mountFor`/`slugForMount`/`repoFor`/`labelFor`/`isToolSlug`/`isToolMount` helpers. HexoKit is the first slug≠mount≠repo tool (`hexokit`/`docs`/`run-kit`); no consumer hardcodes `/<slug>/` or `sahil87/<slug>`."
---
# Tool Roster

**Domain**: conventions

## Overview

`src/lib/tool-roster.mjs` is the **one** site-authored roster of the toolkit's seven tools. Every consumer that needs a tool's URL, repo, or label resolves it through this module — no consumer hardcodes `/<slug>/`, `sahil87/<slug>`, or a private roster array. The roster is deliberately site-authored (the `VersionTable` precedent: the producer repos do not dictate the site's route map), fixed, and dependency-free — no disk read (Constitution VI).

It exists because "slug" previously did five jobs at once (help file, content collector, URL segment, brew formula, GitHub repo) and the roster was copied across ~8 places (`tool-slugs.ts`, a config-eval copy in `astro.config.mjs`, `llms.ts`, private `ROSTER` arrays in `ToolsIndex`/`VersionTable`, the bash tables in both cron workflows). HexoKit is the first tool whose slug ≠ URL mount ≠ repo, so the implicit equalities are now explicit fields on one shared record (it5d).

## The four-name rule

Each `ToolRecord` carries:

| Field | Names | Used by |
|-------|-------|---------|
| `slug` | `help/<slug>.json`, `content/<slug>/README.md`, `content/<slug>/site/**`, the `docs`-collection overview entry's owning tool | every consumer that reads pulled data |
| `label` | the display name (`HexoKit`, `fab-kit`, …) | JSON-LD `SoftwareApplication.name`, sidebar/llms headings, directory listings |
| `mount` | the URL segment: `/<mount>/`, `/<mount>/readme/`, `/<mount>/commands/`, `/<mount>/<docs-site-path>/` | routes, sidebar, redirects, breadcrumbs, llms bullets, route-id gates |
| `repo` | `github.com/sahil87/<repo>` | README/tarball pull source, GithubButton, star count, JSON-LD `url` |
| `formula` / `binary` | `brew install sahil87/tap/<formula>` then `<binary> help-dump` | `refresh-help.yml` (carried in the roster for the one-table-of-truth reading) |
| `legacyMounts` | former URL segments that redirect to `mount` | the in-site redirect enumeration (`site-redirects.mjs`) and the cross-site map's `rules` (`run-kit` → `docs`; see [redirect-map](/conventions/redirect-map.md)) |

HexoKit's record is `{ slug: 'hexokit', label: 'HexoKit', mount: 'docs', repo: 'run-kit', formula: 'run-kit', binary: 'run-kit', legacyMounts: ['run-kit'] }` — the product's pulled data is keyed `hexokit`, its pages mount at `/docs/`, and its source repo/formula/binary stay `run-kit`. For the six companions slug == mount == repo; `fab-kit`'s binary is `fab`. Substrate identifiers (`rk`, `RK_*`, …) are never part of this table.

## Helpers and display order

Exports: `TOOL_ROSTER` (the records), `TOOL_SLUGS` (derived — never a second list), and the helpers `mountFor(slug)`, `slugForMount(segment)` (**null** when the segment is not a tool mount — `toolkit`, `reference`, `desktop`), `repoFor(slug)`, `labelFor(slug)`, `isToolSlug(slug)`, `isToolMount(segment)`.

Display order is **the product first, then the companions in the hexagon order, then shll**: `hexokit, fab-kit, wt, idea, tu, hop, shll`. Every iterating surface (the sidebar Tools group, `ToolsIndex`, `VersionTable`, the llms endpoints) follows the roster order.

`tool-slugs.ts` is the typed re-export for the TS graph: it keeps its pre-roster export names (`TOOL_SLUGS`, `ToolSlug`, `isToolSlug`) so existing imports compile unchanged, adds the `ToolRecord` type, and re-exports the helpers. `astro.config.mjs` and `docs-site-sidebar.mjs` import the `.mjs` directly.

Consumers routed through the roster include: `astro.config.mjs` (redirects + sidebar), `[mount]/[...path].astro` (the dynamic docs/site route), `docs-site-sidebar.mjs` (sidebar links + redirect enumeration), `commands-toc.ts` / `readme-toc.ts` (route-id gates return the slug via `slugForMount`), `Head.astro` (the mount-gated JSON-LD dispatcher), `GithubButton.astro` / `github-stars.ts` / `CommandReference.astro` (GitHub URLs via `repoFor`), `ToolsIndex.astro` / `VersionTable.astro` (shared roster, build-stop posture), `CommandIndex.astro`, `InstallOneLiner.astro`, `llms.ts` (`TOOLS` derived), the terminal island's serialized slug→mount map, and `src/lib/landing-data.ts`.

**The landing page is a roster consumer.** [`/`](../../../sites/astro-starlight-terminal1/docs/memory/site/landing-page.md) resolves through `src/lib/tool-slugs.ts` rather than hardcoding any path:

- **`mountFor(slug)`** builds the five tool hrefs on the toolkit hexagon, wrapped in a `mountHref` helper that **throws naming the slug** when it is not in the roster, so an unrostered edge fails the build instead of emitting `/null/` (the `HeaderNav`/`GithubButton` guard idiom). The sixth edge, `desktop`, is not a roster tool and links `/desktop/` directly.
- **`labelFor`**-shaped display: each edge carries its own visible `label` alongside the roster `slug`, so the mark's labels stay short without the roster owning presentation.
- **`repoFor('hexokit')`** builds the hero's GitHub CTA and the footer's GitHub link as `https://github.com/sahil87/${repo}` — the same idiom `HeaderNav.astro` uses, so the URL follows the roster through any future repo rename.
- **`isToolSlug`** gates the contract test (`scripts/landing-data.test.mjs`), which asserts every tool edge is a real roster slug and links `` `/${mountFor(slug)}/` ``. HexoKit's mount already differs from its slug, so a hardcoded `/<slug>/` is a live bug class on this page, not a hypothetical one — the test is what keeps it from reappearing.

## Design Decisions

### One roster module, plain ESM
**Decision**: `tool-roster.mjs` is the single source of every tool's slug/label/mount/repo/formula/binary; `tool-slugs.ts` is a typed re-export; `astro.config.mjs` and `docs-site-sidebar.mjs` import the `.mjs` directly.
**Why**: HexoKit is the first tool whose slug ≠ URL segment ≠ repo, so the implicit equalities eight consumers assumed must become explicit in one place; `.mjs` is what loads at Astro config-eval time (the `docs-site-sidebar.mjs` precedent).
**Rejected**: keeping `tool-slugs.ts` as the roster plus a hand-synced config-eval copy — the copy is exactly the drift this removes.
*Introduced by*: 260910-it5d-hexokit-site-structure
