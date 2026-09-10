# Intake: HexoKit site structure

**Change**: 260910-it5d-hexokit-site-structure
**Created**: 2026-09-10

## Origin

> Execute row S3 ("hexokit-site-structure") of `/home/sahil/code/sahil87/run-kit/fab/plans/sahil/26-09-10-hexokit-rebrand.md` Phase 0 (that plan doc lives in the run-kit repo; this repo never contains it). Read the whole plan doc first (Decision log D7, Site shape, Pickup protocol). S2 (PR hexokit-site#1) is merged to main and this worktree branch already includes it. Scope: D7 URL scheme — the slug table gets a `hexokit` entry whose output path is `/docs/`, while its SOURCE repo stays `sahil87/run-kit` (only the output/URL side changes for hexokit; do not repoint the source until X1 in Phase 2); companions (fab-kit, wt, idea, tu, hop, desktop) keep their existing root-slug behavior unchanged; build out `/toolkit/` from the current Getting-started content; re-enable the two Refresh cron workflows (Refresh: Help, Refresh: README — disabled since S1) with the new slug map; set nav to `Docs · Toolkit · Desktop · GitHub`; regenerate llms.txt, JSON-LD, OG tags, favicon for the new identity. If anything about the current site source/slug config is unclear, inspect the repo directly rather than guessing.

One-shot `/fab-new` invocation. No prior discussion in this session; the plan doc is the design authority. The whole plan doc was read, the current site source was inspected file by file (slug roster, both cron workflows, the dynamic docs/site route, the sidebar generator, Head/Footer overrides, the llms/versions endpoints, the homepage terminal island), and two cross-repo facts were verified directly in the `run-kit` and `shll` checkouts (see § Why → "Two constraints found by inspection").

**Plan-doc decisions this change inherits and MUST NOT re-open** (Pickup protocol #1): D1 (HexoKit names the product; companions keep names), D2 (binary stays `rk`/`run-kit`; every `rk-*`/`RK_*`/`@rk_*` identifier untouched), D4 (`shll` stays), D13 (this repo is the copy; shll.ai untouched). D7 (URL scheme) and D6 (site shape) are the plan's proposals and are executed here as written.

## Why

**The problem.** hexokit.com is live (S2) but is still a byte-for-byte copy of shll.ai: the product is the 5th of "seven small CLIs" at `/run-kit/`, the site title is `shll`, JSON-LD/OG/llms.txt all advertise "shll — seven CLIs", and the two content crons are disabled because their slug map would scaffold a second `run-kit` tree. Nothing on the site says HexoKit yet, and the URL scheme the rest of the plan depends on (`/docs/` for the product, root slugs for the companions, `/toolkit/` for the family) does not exist.

**What happens if we don't.** S4 (landing page) has nothing to link into — its hexagon links to `/toolkit/` and its Docs nav to `/docs/`. S5 (install script) depends on S3. The X1/X2 redirect maps (`shll.ai/run-kit/* → hexokit.com/docs/*`, `shll.ai/getting-started/* → hexokit.com/toolkit/*`) have no destinations. And the crons stay off, so `/run-kit/…` (soon `/docs/…`) content and the command reference silently age past the 7-day staleness gate.

**Why this shape (D7).** HexoKit's own docs move to `/docs/…`; the six companions keep the root-slug shape shll.ai already emits. That makes the cutover mechanical — two redirect rules on the shll.ai side, zero pipeline changes for the companions — and lets the daily README/help-dump crons keep running with **one slug change**: the puller's `run-kit` entry becomes `hexokit`, still sourcing from `sahil87/run-kit` (formula `run-kit`, binary `run-kit`, repo `run-kit`), but writing to `help/hexokit.json` + `content/hexokit/**` and mounting at `/docs/`. The **source** side flips in X1, after C3 renames the GitHub repo.

**Two constraints found by inspection (not in the plan doc):**

1. **`versions.json` must keep its `run-kit` row key until C1.** run-kit's update checker no longer fetches the manifest itself — it runs `shll check-updates --json`, and shll matches manifest rows by its roster `Name` (`manifest.Tools[tgt.name]`, `src/cmd/shll/check_updates.go:287`), which is `run-kit` until C1 renames the roster. Today the manifest key is the `help/<slug>.json` filename. Renaming the envelope to `help/hexokit.json` without care would either drop the row (skip-degrade → every installed run-kit silently stops seeing updates) or key it `hexokit` (same effect). So the policy gains a per-tool **envelope override**: the row stays keyed `run-kit` (formula defaults to the key, `run-kit`) but reads its version from `help/hexokit.json`. Reversible in X1/C1 by flipping the key.
2. **The favicon is already HexoKit's mark.** `public/favicon.svg`, `src/assets/logo.svg`, and run-kit's `assets/logo.svg` are byte-identical (verified with `diff`); `public/favicon.ico` was generated from that SVG (`scripts/generate-favicon-ico.mjs`). "Regenerate the favicon for the new identity" is therefore a **verified no-op** — the plan's own evidence section says the logo "already says it". The OG card is the asset that genuinely changes.

**Alternatives rejected.**
- *Keep the internal slug `run-kit` and only change the URL mount.* Rejected: the plan's cron design is "one slug change" and every consumer keys on the slug (`help/<slug>.json`, `content/<slug>/`, roster, JSON-LD name, llms bullets) — a mount-only change would leave `hexokit` nowhere in the pipeline and force a second rename later.
- *Rename the manifest key to `hexokit` now.* Rejected: breaks `shll check-updates` for every installed user until C1 (see constraint 1).
- *Fold `/tools/` (directory page) into `/docs/`.* Rejected: `/tools/` is the seven-tool table the plan deliberately removes from the homepage; its content belongs to `/toolkit/`, so `/tools/` becomes a redirect to `/toolkit/`.
- *Change the homepage body now.* Rejected: S4 hand-writes the landing page. This change only fixes the homepage's identity metadata and retargets its links so nothing 404s.

## What Changes

All paths below are relative to the repo root; the live site is `sites/astro-starlight-terminal1/` (per `SITE_DIR` in `.github/workflows/deploy.yml`), abbreviated `site/`.

### 1. A single site-authored tool roster with four names per tool

Today "slug" does five jobs at once (help file, content collector, URL segment, brew formula, GitHub repo) and the roster is copied in ~8 places (`tool-slugs.ts`, the `TOOL_SLUGS` config-eval copy in `astro.config.mjs`, `llms.ts` `TOOLS`, `ToolsIndex.astro` / `VersionTable.astro` / `TerminalPrompt.astro` `ROSTER`/`TOOLS`, and the bash triples in both cron workflows). HexoKit is the first tool whose slug ≠ URL segment ≠ repo, so the roster becomes explicit.

New `site/src/lib/tool-roster.mjs` (plain ESM so `astro.config.mjs` and the `.mjs` sidebar helper can import it at config-eval time; `tool-slugs.ts` re-exports it typed for the TS graph):

```js
/** Display order = the plan's presentation order: the product first, then the
 *  six companions in the hexagon order (fab-kit, wt, idea, tu, hop), then shll. */
export const TOOL_ROSTER = [
  { slug: 'hexokit', label: 'HexoKit', mount: 'docs', repo: 'run-kit', formula: 'run-kit', binary: 'run-kit', legacyMounts: ['run-kit'] },
  { slug: 'fab-kit', label: 'fab-kit', mount: 'fab-kit', repo: 'fab-kit', formula: 'fab-kit', binary: 'fab' },
  { slug: 'wt',      label: 'wt',      mount: 'wt',      repo: 'wt',      formula: 'wt',      binary: 'wt' },
  { slug: 'idea',    label: 'idea',    mount: 'idea',    repo: 'idea',    formula: 'idea',    binary: 'idea' },
  { slug: 'tu',      label: 'tu',      mount: 'tu',      repo: 'tu',      formula: 'tu',      binary: 'tu' },
  { slug: 'hop',     label: 'hop',     mount: 'hop',     repo: 'hop',     formula: 'hop',     binary: 'hop' },
  { slug: 'shll',    label: 'shll',    mount: 'shll',    repo: 'shll',    formula: 'shll',    binary: 'shll' },
];
```

Field semantics (the four-name rule; the cron workflows' header comments carry the same table):

| Field | Names | Used by |
|-------|-------|---------|
| `slug` | `help/<slug>.json`, `content/<slug>/README.md`, `content/<slug>/site/**`, the `docs` collection entry id of the overview, JSON-LD `SoftwareApplication.name` (via `label`) | every consumer that reads pulled data |
| `mount` | the URL segment: `/<mount>/`, `/<mount>/readme/`, `/<mount>/commands/`, `/<mount>/<docs-site-path>/` | routes, sidebar, redirects, breadcrumbs, llms bullets, route-id gates |
| `repo` | `github.com/sahil87/<repo>` — README/tarball source, GithubButton, star count, JSON-LD `url` | pullers + GitHub affordances |
| `formula` / `binary` | `brew install sahil87/tap/<formula>` then `<binary> help-dump` | `refresh-help.yml` only (documented in the roster for the one-table-of-truth reading) |
| `legacyMounts` | former URL segments that redirect to `mount` | redirect enumeration only |

Helpers exported alongside: `mountFor(slug)`, `slugForMount(segment)` (null when not a tool mount), `repoFor(slug)`, `labelFor(slug)`, `isToolSlug(slug)`, `isToolMount(segment)`, `TOOL_SLUGS` (derived, display order). `tool-slugs.ts` keeps its export names so existing imports compile, and adds the typed re-exports.

**Consumers rewired to the roster** (each currently hardcodes `/<slug>/` or `sahil87/<slug>`):

- `astro.config.mjs` — drop the `TOOL_SLUGS` config-eval copy; import the roster.
- `site/src/lib/docs-site-sidebar.mjs` — `docsSiteSidebarItems(slug)` links to `/<mount>/<path>`; `docsSiteRedirectEntries()` emits `/tools/<slug>/<path>` → `/<mount>/<path>/` AND, for every `legacyMounts` entry, `/<legacy>/<path>` → `/<mount>/<path>/`.
- `site/src/pages/[slug]/[...path].astro` → renamed `site/src/pages/[mount]/[...path].astro`; `getStaticPaths` emits `params: { mount: mountFor(page.slug), path }` and passes `slug` as a prop for the disk read. The link rewriter still receives the **mount** as its site-absolute root (`rewriteDocsSiteLinks(raw, mount, mountPath)`), so relative links inside HexoKit's docs resolve to `/docs/…`.
- `site/src/lib/commands-toc.ts`, `site/src/lib/readme-toc.ts` — the route-id gates `^([^/]+)/commands$` / `^([^/]+)/readme$` accept a **mount** segment and return the **slug** via `slugForMount`.
- `site/src/components/Head.astro` — see § 6.
- `site/src/components/GithubButton.astro`, `site/src/lib/github-stars.ts`, `site/src/components/CommandReference.astro` (its `githubUrl`) — `https://github.com/sahil87/${repoFor(tool)}`.
- `site/src/components/ToolsIndex.astro`, `VersionTable.astro` — replace their private `ROSTER` arrays with the shared roster (route = `/<mount>/`, repo = `repoFor`), keeping their build-stop posture.
- `site/src/components/CommandIndex.astro` — `commandsHref(tool)` → `/<mount>/commands/`.
- `site/src/components/InstallOneLiner.astro` — `FULL_TOOLKIT` key `run-kit` → `hexokit`; the one-liner text (`https://shll.ai/install`) is **unchanged** (S5 owns D10).
- `site/src/lib/llms.ts` `TOOLS` → derived from the roster (display order); `site/src/pages/llms.txt.ts`, `llms-full.txt.ts` — see § 7.
- `site/src/components/TerminalPrompt.astro` (homepage terminal island) — **minimal retarget only**: the `ROUTE_OVERVIEW/README/COMMANDS` helpers resolve through `mountFor`, the tool-card lookup for the run-kit entry reads `help/hexokit.json`, and `hexokit` joins `rk`/`run-kit` as accepted names for that card. Its copy (`shllOS shll.ai`, "tour of the shll toolkit", play scripts) is S4's — the homepage is replaced there.

### 2. The `hexokit` entry: collector rename + `/docs/` mount

- `git mv help/run-kit.json help/hexokit.json` and `git mv content/run-kit content/hexokit` so the site builds before the first cron run (the crons then overwrite in place). `content/run-kit/` MUST NOT survive — `collectDocsSitePages` walks every `content/<slug>/site/` dir and would keep emitting `/run-kit/…` pages.
- `site/src/content/docs/tools/run-kit/{overview,readme,commands}.mdx` → `site/src/content/docs/tools/hexokit/` with frontmatter `slug: docs`, `slug: docs/readme`, `slug: docs/commands`, and `tool="hexokit"` props. The overview is rewritten as the HexoKit product-docs entry (title `HexoKit`; lead from the run-kit README's own words — "Your tmux, in the browser and on your phone." plus the agent-agnostic paragraph; `<GithubButton tool="hexokit" />` (→ `sahil87/run-kit`), `## Install` (`<InstallOneLiner tool="hexokit" />`, whole-toolkit form as today's run-kit), `## Screenshots` (the two existing `public/screenshots/run-kit-*.webp`, file names unchanged), `## How it fits`, `## Where to next` → `/docs/readme/`, `/docs/commands/`). Command tokens in that prose stay `run-kit …`/`rk …` (binary names are substrate — D2 — and the vn39 cross-check validates against `help/hexokit.json`, whose `tool` field is `run-kit`).
- The `docs/site` pages run-kit already publishes (install, tutorial, boards, notifications, agent-hooks, status-dot, customizing-tmux, cron-schedule-kinds, skill + topics, workflows) mount at `/docs/<path>/` automatically via the dynamic route.
- `help/hexokit.json`'s envelope `tool` field remains `"run-kit"` (the binary) — the fab-kit/`fab` precedent; `HelpDocSchema` already allows slug ≠ tool. `stripToolPrefix(short, doc.tool)` keeps working because it strips by the `tool` field.

### 3. Companions unchanged at root slugs; `shll` stays

`fab-kit`, `wt`, `idea`, `tu`, `hop`, `shll` keep `/<slug>/`, `/<slug>/readme/`, `/<slug>/commands/`, `/<slug>/<docs-site-path>/`, their `content/<slug>/` collectors and `help/<slug>.json`. Only their **display order** changes (product first, then the plan's hexagon order). `shll` remains on the roster and in the sidebar because its pages are real synced docs (the toolkit standards live at `/shll/standards/…`) and D4 keeps the command; it is simply not one of the "six" the S4 hexagon draws.

### 4. `/toolkit/` — the family, built from Getting started + Workflows

Move (git mv) and reframe from "seven CLIs" to "HexoKit and the six tools around it":

| From | To (route) | Content change |
|------|------------|----------------|
| `getting-started/overview.md` | `toolkit/index.md` (`/toolkit/`) | Rewrite the lead + "The shape" diagram around HexoKit as the centre: `idea → fab-kit → wt → HexoKit`; the six companions each get one line linking to `/<mount>/`; add a Desktop line linking to `/desktop/`. Drop "What's not on this site" (stale: the site now hosts synced docs). |
| `getting-started/install.md` | `toolkit/install.md` (`/toolkit/install/`) | Prose "shll toolkit" → "HexoKit toolkit"; links `/run-kit/…` → `/docs/…`. Commands and the `https://shll.ai/install` one-liner **unchanged** (S5). |
| `getting-started/philosophy.md` | `toolkit/philosophy.md` | Framing → HexoKit; "Not a coding agent — a layer above one" keeps its argument with the product named. |
| `workflows/daily-flow.md` | `toolkit/daily-flow.md` | Prose "shll toolkit" → "HexoKit toolkit"; command tokens unchanged. |
| `workflows/new-change.md` | `toolkit/new-change.md` | Same. |
| `tools/index.mdx` (the `/tools/` directory page + `ToolsIndex.astro`) | removed; `/tools` → `/toolkit/` redirect | The family listing now lives on `/toolkit/` (the `ToolsIndex` component is reused there so the one-liners stay JSON-single-sourced). |

New **`site/src/content/docs/desktop.md`** (`/desktop/`): a thin site-authored page for the desktop app (today it has no page anywhere): one paragraph from the run-kit README § "Desktop app (macOS)" (native Electron shell around the dashboard; installed with `run-kit desktop install` / `update` / `status` — tokens validated against `help/hexokit.json`), a link to GitHub Releases (`https://github.com/sahil87/run-kit/releases`) and to `/docs/install/#desktop-app-macos`. No images (the README's desktop screenshots are external hotlinks, not the site-owned curated class). S4 enriches it.

Hand-written prose on all of these stays under the vn39 hard rule (every command/flag token present in `help/<slug>.json`).

### 5. Navigation and sidebar

**Header nav `Docs · Toolkit · Desktop · GitHub`** — new `site/src/components/HeaderNav.astro` overriding Starlight's `SocialIcons` slot (the documented way to add header links without forking `Header.astro`): four text links — `Docs` → `/docs/`, `Toolkit` → `/toolkit/`, `Desktop` → `/desktop/`, `GitHub` → `https://github.com/sahil87/run-kit` (the product repo, via `repoFor('hexokit')`; GitHub redirects after C3). Terminal-styled via the existing `--c-*` tokens (dark-mode parity, visible `:focus-visible`), hidden on mobile exactly as Starlight hides social icons (the sidebar carries the same destinations). `social:` in `astro.config.mjs` is emptied (the override replaces it); the Discord link moves to `Footer.astro`'s existing `·`-separated row.

**Sidebar** (`astro.config.mjs`, hand-authored as today, docs/site entries generated):

```
Docs            Overview (/docs/) · Readme · Commands · …docsSiteSidebarItems('hexokit')
Toolkit         Overview (/toolkit/) · Install · Philosophy · Daily flow · Start a new change · Desktop app (/desktop/)
Tools           fab-kit · wt · idea · tu · hop · shll   (each collapsed: Overview · Readme · Commands · …docs/site pages)
Reference       Command index (/reference/command-index/)
```

`title: 'HexoKit'`, `description: 'Your tmux, in the browser and on your phone.'` in the Starlight config.

**Redirects** (`astro.config.mjs` `redirects:` — static `<meta refresh>` pages, all enumerated because static builds cannot wildcard):

| From | To |
|------|----|
| `/run-kit`, `/run-kit/readme`, `/run-kit/commands`, `/run-kit/<each docs-site page>` | `/docs/`, `/docs/readme/`, `/docs/commands/`, `/docs/<page>/` (via `legacyMounts`) |
| `/tools/<slug>`, `/tools/<slug>/overview|readme|commands`, `/tools/<slug>/<docs-site page>` (existing 3ke3 set) | `/<mount>/…` (now roster-driven, so `run-kit` → `/docs/…`) |
| `/tools` | `/toolkit/` |
| `/getting-started/overview`, `/toolkit/overview` | `/toolkit/` |
| `/getting-started/install`, `/getting-started/philosophy` | `/toolkit/install/`, `/toolkit/philosophy/` |
| `/workflows/daily-flow`, `/workflows/new-change` | `/toolkit/daily-flow/`, `/toolkit/new-change/` |

Note for X1/X2: D7 lists `shll.ai/getting-started/* → hexokit.com/toolkit/*`; add `shll.ai/workflows/* → hexokit.com/toolkit/*` and `shll.ai/tools/* → hexokit.com/tools/*` (which then hop once more in-site) to the X1 redirect map.

### 6. Identity: JSON-LD, OG tags, favicon, chrome

`site/src/components/Head.astro`:
- `ogImageAlt` → `HexoKit — your tmux, in the browser and on your phone`.
- Homepage JSON-LD graph: `WebSite.name: 'HexoKit'`; `SoftwareApplication { name: 'HexoKit', description: 'Your tmux, in the browser and on your phone.', url: 'https://github.com/sahil87/run-kit' }` (url via `repoFor`).
- Per-tool JSON-LD dispatcher: gate on `isToolMount(segment)`; `SoftwareApplication.name` = `labelFor(slug)` (`HexoKit` for the `/docs/` pages), `url` via `repoFor`, `description` from `help/<slug>.json` `root.short` as today. Breadcrumbs: `Home › Docs [› Readme|Commands]` for hexokit; `Home › Toolkit › <tool> [› page]` for companions (`Toolkit` crumb → `/toolkit/`, replacing the `Tools` → `/tools/` crumb).
- Homepage `head:` frontmatter in `index.mdx`: `<title>` and `og:title` → `HexoKit — your tmux, in the browser and on your phone`; `og:type=website` kept. The homepage **body** is retargeted only (`/run-kit/` → `/docs/`, "Explore the tools" → `/toolkit/`); its copy is S4's.

**OG image** — `site/scripts/generate-og-image.mjs`: wordmark `hexokit`, tagline `Your tmux, in the browser and on your phone.`, site `hexokit.com`; regenerate `public/og-image.png` (1200×630) with the Playwright headless-shell already at `~/.cache/ms-playwright/chromium_headless_shell-1217` (the script's auto-discovery finds it; no new dependency).

**Favicon** — verified no-op (see § Why). `favicon.svg`, `favicon.ico`, `logo.svg` untouched; the `favicon:` line in `astro.config.mjs` stays. Recorded so nobody hunts for a missing step.

**Chrome/text identity**: `Footer.astro` LICENSE link → `https://github.com/sahil87/hexokit-site/blob/main/LICENSE`, Discord added; `site/src/lib/terminal-share.ts` `SHARE_FOOTER` → `# replayed from https://hexokit.com`; comments that hard-code `https://shll.ai` as the example origin updated to hexokit.com (the code already reads `Astro.site`).

### 7. llms.txt / llms-full.txt

`site/src/pages/llms.txt.ts` — H1 `# HexoKit — your tmux, in the browser and on your phone`; summary blockquote rewritten around the product ("HexoKit is a remote console for your tmux… The HexoKit toolkit adds six companion CLIs…"); sections: `## Docs` (the `/docs/` overview, readme, commands, and one bullet per committed HexoKit docs/site page via `collectDocsSitePages`, titles from their H1 — mechanical, no hand list), `## Toolkit` (`/toolkit/` pages + `/desktop/` + one bullet per companion `/<mount>/` with the `root.short` one-liner as today), `## Reference`. All URLs from `Astro.site`.

`site/src/pages/llms-full.txt.ts` — H1 `# HexoKit — full content`; per-tool sections iterate the roster (HexoKit first, headed by `labelFor`); `MDX_GROUPS` → `Toolkit` (`toolkit/*`, `desktop`), `Reference`, `Tool overviews` (gate on the overview entry ids: `docs` + companion slugs).

### 8. Refresh crons: new slug map, then re-enable

`.github/workflows/refresh-help.yml` — the `slug:formula:binary` triple `run-kit:run-kit:run-kit` → `hexokit:run-kit:run-kit`; header comment table gains the `hexokit` row and the four-name rule, and the "7 toolkit CLIs / shll.ai-owned" wording → HexoKit toolkit / hexokit.com. Everything else (per-tool isolation, validation gate, direct commit, deploy dispatch, staleness gate) unchanged.

`.github/workflows/refresh-readme.yml` — both `slug:repo` pair lists: `run-kit:run-kit` → `hexokit:run-kit` (README step and docs/site step, kept in lockstep); header comments updated the same way. The docs/site CLI clears `content/hexokit/site/` and mirrors run-kit's tree — correct.

`.github/workflows/deploy.yml` / `ci.yml` — comment-only identity fixes (`served at shll.ai/install` → `hexokit.com/install`).

**Re-enabling is a post-merge operator step, not a file change** (both workflows check out `main`, so they must see the new map first):

```sh
gh workflow enable refresh-help.yml   --repo sahil87/hexokit-site
gh workflow enable refresh-readme.yml --repo sahil87/hexokit-site
gh workflow run   refresh-help.yml    --repo sahil87/hexokit-site --ref main   # seeds help/hexokit.json
gh workflow run   refresh-readme.yml  --repo sahil87/hexokit-site --ref main   # seeds content/hexokit/**
```

Then verify the runs are green, that `help/run-kit.json` / `content/run-kit/` did NOT reappear, and that the deploy they dispatch is green. This step is recorded in the plan's Phase 4 and in the ship stage's PR description; it needs only write access (`actions:write`), which the default `sahil-noon` account has.

### 9. `versions.json`: keep the `run-kit` key, read the `hexokit` envelope

`versions-policy.json`:

```json
{
  "run-kit": { "notify": "minor", "envelope": "hexokit" },
  "fab-kit": { "notify": "minor" },
  "shll":    { "notify": "patch" },
  "tu":      { "notify": "minor" },
  "wt":      { "notify": "minor" },
  "idea":    { "notify": "minor" },
  "hop":     { "notify": "minor" }
}
```

`site/src/lib/versions-manifest.ts` — `PolicyEntrySchema` gains optional `envelope: z.string()` (still `.strict()`); `buildManifest` reads `help/<entry.envelope ?? key>.json`; the row key and `formula` default stay the policy key. Emitted row: `"run-kit": { "latest": "3.19.x", "notify": "minor", "formula": "run-kit" }` — byte-shape identical to today, so `shll check-updates` keeps matching. `scripts/versions-manifest.test.mjs` gains the override case. The spec `docs/specs/versions-manifest-contract.md` gets the additive rule ("the policy key is the consumer-facing roster name; `envelope` overrides which `help/<slug>.json` supplies `latest`"). X1/C1 flips the key to `hexokit` and drops the override.

### 10. Tests, fixtures, repo identity

- `site/scripts/extract-readme.test.mjs` `loadHelp('run-kit')` → `'hexokit'`; `site/scripts/llms.test.mjs` `TOOLS` expectation → the new roster order; `site/scripts/refresh-help-fixtures.mjs` `doc: 'run-kit'` → `'hexokit'` (the fixture's command path `run-kit riff` is the binary's path and stays). New unit tests for `tool-roster.mjs` (`mountFor`/`slugForMount`/`repoFor`, legacy-mount redirect enumeration) and for the `envelope` override.
- `README.md` (repo): title/intro → hexokit-site / hexokit.com, layout tree comment "currently live at hexokit.com".
- `fab/project/config.yaml` `project.name: hexokit-site`, description updated; `fab/project/context.md` rewritten for the product site (three layers, roster four-name rule pointer); `fab/project/constitution.md` PATCH **2.1.4**: rename `shll.ai` → `hexokit.com` in principle III and the Tool-Page Depth text (no principle changes), changelog entry.
- `site/README.md` and `site/docs/memory/site/index.md` header: "live shll.ai build" → hexokit.com.
- Pickup protocol #4: at ship, fill S3's PR cell and Status in the run-kit plan doc (`fab/plans/sahil/26-09-10-hexokit-rebrand.md`, a separate commit in the run-kit checkout) and add the X1 redirect-map notes from § 5.

### Out of scope (owned elsewhere in the plan)

S4: homepage/landing body, hexagon, desktop card design, any change to `TerminalPrompt` copy or its fate. S5: the install one-liner URL/default (`shll.ai/install` text stays). C1–C7/X1: any source-side rename (`repo`/`formula`/`binary` all stay `run-kit`; `help/hexokit.json` `tool` stays `run-kit`), the `shll` roster, the shll.ai redirect stub. Substrate identifiers are never touched (Pickup protocol #3). Screenshot file names `run-kit-*.webp` are left as-is (asset names, not user-visible).

## Affected Memory

- `conventions/tool-roster`: (new) the single site-authored roster (`tool-roster.mjs`) and the four-name rule — slug (pulled-data key) vs mount (URL segment) vs repo vs formula/binary — with HexoKit as the first slug≠mount≠repo tool, `legacyMounts` redirect enumeration, and the rule that no consumer hardcodes `/<slug>/` or `sahil87/<slug>` again.
- `conventions/docs-site-tree`: (modify) the dynamic route is now `[mount]/[...path].astro` mounting `content/<slug>/site/<path>.md` at `/<mount>/<path>`; sidebar/redirect generators take the mount from the roster; the legacy-mount redirect set.
- `conventions/help-collection`: (modify) the puller triple for `hexokit` (`hexokit:run-kit:run-kit`), the roster now living in `tool-roster.mjs`, the four-name rule replacing the three-name note.
- `conventions/readme-extraction`: (modify) the `slug:repo` pair for `hexokit` (`hexokit:run-kit`), the first slug≠repo tool; both puller steps in lockstep.
- `conventions/versions-manifest`: (modify) the `envelope` policy override, the "key = consumer-facing roster name (shll `Name`)" rule, the `run-kit` row surviving the envelope rename until C1.
- `conventions/seo-social-meta`: (modify) HexoKit identity in JSON-LD/OG/title, `isToolMount`-gated per-tool JSON-LD with `Docs`/`Toolkit` breadcrumbs, the regenerated OG card, llms.txt sections (`Docs` with mechanical docs/site bullets, `Toolkit`, `Reference`), favicon verified unchanged.
- `conventions/tool-page-rubric`: (modify) root-slug section now "mount" based; the `hexokit` overview at `/docs/`; the `/tools/` directory page retired into `/toolkit/`; header nav override (`HeaderNav.astro` in the `SocialIcons` slot); display order.
- `build-deploy/deployment`: (modify) repo is `sahil87/hexokit-site` serving hexokit.com; the two refresh crons re-enabled post-S3 with the new slug map and the one-time seed runs; `versions.json` public-surface note updated.
- `sites/astro-starlight-terminal1/docs/memory/site/homepage-terminal`: (modify) route/help lookups for the run-kit card resolve via the roster (`hexokit` slug, `/docs/` mount); copy explicitly deferred to S4.

Specs to update at hydrate (human-curated; hydrate proposes): `docs/specs/versions-manifest-contract.md` (§ policy `envelope`, § keying), `docs/specs/readme-extraction-contract.md` and `docs/specs/help-dump-contract.md` (a one-line note that the site's file slug may differ from repo/formula/binary — `hexokit` sources from `run-kit`).

## Impact

- **Live site** (`sites/astro-starlight-terminal1/`): `astro.config.mjs`; `src/lib/{tool-roster.mjs (new), tool-slugs.ts, docs-site-sidebar.mjs, docs-site-tree.ts, commands-toc.ts, readme-toc.ts, github-stars.ts, llms.ts, versions-manifest.ts, terminal-share.ts}`; `src/pages/{[mount]/[...path].astro (renamed), llms.txt.ts, llms-full.txt.ts}`; `src/components/{HeaderNav.astro (new), Head.astro, Footer.astro, GithubButton.astro, CommandReference.astro, CommandIndex.astro, ToolsIndex.astro, VersionTable.astro, InstallOneLiner.astro, TerminalPrompt.astro (minimal)}`; `src/content/docs/{index.mdx, desktop.md (new), toolkit/* (moved), tools/hexokit/* (moved), tools/index.mdx (removed)}`; `scripts/{generate-og-image.mjs, versions-manifest.test.mjs, llms.test.mjs, extract-readme.test.mjs, refresh-help-fixtures.mjs, tool-roster.test.mjs (new)}`; `public/og-image.png` (regenerated); `README.md`.
- **Repo root**: `help/run-kit.json → help/hexokit.json`, `content/run-kit/ → content/hexokit/` (git mv), `versions-policy.json`, `.github/workflows/{refresh-help,refresh-readme,deploy,ci}.yml`, `README.md`, `fab/project/{config.yaml,context.md,constitution.md}`.
- **Cross-repo**: none in code. `shll check-updates` keeps matching (`run-kit` row preserved). The run-kit plan doc's S3 row is updated at ship. Nothing in shll.ai changes.
- **Public surface**: URLs move (`/run-kit/*` → `/docs/*`, `/getting-started/*`+`/workflows/*` → `/toolkit/*`, `/tools/*` → `/toolkit/`) with static redirects for every old path; `versions.json` shape unchanged; `/llms.txt`, `/llms-full.txt`, `/.well-known/security.txt`, `/versions.json`, `/install` keep their paths. hexokit.com is live but unannounced, so the redirects are goodwill for the copied repo's URLs, not a compatibility contract.
- **Tests**: `node --test scripts/*.test.mjs` (267 passing today) plus the new roster/envelope tests; `node scripts/validate-help.mjs`; `pnpm build` must succeed with `dist/docs/index.html`, `dist/toolkit/index.html`, `dist/desktop/index.html`, `dist/run-kit/index.html` (a redirect stub), `dist/llms.txt` carrying HexoKit + all docs/site bullets, and `dist/versions.json` containing a `run-kit` row.
- **Reversibility**: everything is in-repo and static; shll.ai is untouched (D13). Reverting the PR restores the copy exactly; the crons can be disabled again with `gh workflow disable`.

## Open Questions

- None blocking. The design choices below that were mine rather than the plan's (OG wordmark case, `/desktop/` page depth, `envelope` naming, companion display order) are graded in the Assumptions table for `/fab-clarify`.

## Assumptions

| # | Grade | Decision | Rationale | Scores |
|---|-------|----------|-----------|--------|
| 1 | Certain | `hexokit` is a first-class roster slug (help/content/overview all keyed `hexokit`), mounted at `/docs/`, sourcing from `sahil87/run-kit` with formula/binary `run-kit`; the source fields flip only in X1 | D7 + the S3 row + the user's scope text say exactly this; the plan's cron design is "one slug change" | S:95 R:70 A:95 D:95 |
| 2 | Certain | Companions keep `/<slug>/…`, their collectors and help files; `shll` stays on the roster and in the sidebar | D7/D4 and the scope text; only display order changes | S:95 R:90 A:95 D:90 |
| 3 | Certain | The `versions.json` row for the product stays keyed `run-kit` (formula `run-kit`) via a new optional `envelope` policy field that points it at `help/hexokit.json` | Verified: `shll check-updates` matches `manifest.Tools[roster Name]` and the roster Name is `run-kit` until C1; dropping or renaming the row would silently break update notices for every user | S:85 R:80 A:95 D:85 |
| 4 | Certain | Favicon is left unchanged — a verified no-op | `diff` shows `favicon.svg` = `logo.svg` = run-kit's `assets/logo.svg`; the plan itself notes the logo already is the HexoKit mark | S:80 R:100 A:100 D:95 |
| 5 | Confident | A single `tool-roster.mjs` (slug/label/mount/repo/formula/binary/legacyMounts) replaces the ~8 roster copies; the dynamic route becomes `[mount]/[...path].astro`; consumers resolve URLs/repos through it | HexoKit is the first slug≠mount≠repo tool, so the implicit equalities every consumer assumed have to become explicit somewhere; one module is the code-quality.md "don't duplicate" answer | S:70 R:70 A:90 D:85 |
| 6 | Certain | `/toolkit/` = moved+reframed getting-started (overview→`/toolkit/`, install, philosophy) + workflows (daily-flow, new-change); `/tools/` retired into `/toolkit/` with a redirect; `/toolkit/overview` also redirects | § Site shape lists exactly these pages for `/toolkit/`; D7 maps `getting-started/* → toolkit/*` so the old names redirect 1:1 | S:80 R:85 A:85 D:75 |
| 7 | Certain | Header nav via a `SocialIcons`-slot override (`HeaderNav.astro`) with four text links; Discord moves to the footer row; GitHub → `sahil87/run-kit` (product repo) | Starlight has no nav-links config; the SocialIcons override is its documented header-links seam and needs no `Header.astro` fork; the plan's footer carries Discord | S:75 R:90 A:80 D:70 |
| 8 | Confident | A thin site-authored `/desktop/` page exists in S3 (README-sourced paragraph, `run-kit desktop …` tokens, Releases link, no images) | The nav item is S3's and must not 404; content depth is S4's (its Desktop card) | S:60 R:90 A:75 D:65 |
| 9 | Confident | Roster display order becomes: HexoKit, fab-kit, wt, idea, tu, hop, shll | The plan's § Site shape lists the six in that order; the sidebar/llms/VersionTable iterate the roster so the order lands everywhere at once | S:65 R:95 A:80 D:70 |
| 10 | Certain | Homepage body copy and the terminal island's copy are NOT rewritten; only identity metadata (`<title>`, `og:title`, JSON-LD) and links (`/run-kit/`→`/docs/`, tools→`/toolkit/`) change | S4 hand-writes the landing page ("on-brand from day one"); rewriting shll copy that S4 deletes is churn | S:80 R:90 A:85 D:85 |
| 11 | Certain | Install one-liner text (`https://shll.ai/install`) and `InstallOneLiner` wording are untouched apart from the `hexokit` roster key | S5 owns D10 and depends on S3; shll.ai/install stays live forever (D4) so nothing is broken meanwhile | S:80 R:95 A:85 D:85 |
| 12 | Certain | `/run-kit/*` → `/docs/*` in-site redirects are added (via `legacyMounts`), plus `/workflows/*` → `/toolkit/*` | Cheap, mechanical (same enumerator as the 3ke3 `/tools/` reversal); the repo is a copy of shll.ai so these paths exist in indexes/links; noted for the X1 map | S:60 R:95 A:85 D:80 |
| 13 | Certain | Cron re-enable + one seed run each is a post-merge operator step recorded in the plan and the PR body, not a file in this PR | Both workflows pin `ref: main`; enabling before merge would run the old map (double-scaffold risk the plan names) | S:80 R:85 A:90 D:90 |
| 14 | Confident | Constitution PATCH 2.1.4 + `fab/project/{config.yaml,context.md}` + both READMEs get the hexokit-site/hexokit.com identity; no principle changes | These files describe this repo and are wrong today; a PATCH is the documented shape for wording-only amendments | S:55 R:90 A:85 D:80 |
| 15 | Confident | OG card: `$ hexokit` wordmark (lowercase, terminal idiom), tagline "Your tmux, in the browser and on your phone.", `hexokit.com` | The card design is otherwise unchanged from shll's; S4's design iteration may redo it — one script re-run | S:45 R:95 A:60 D:45 |
| 16 | Confident | HexoKit's `/docs/` overview lead is site-authored HexoKit prose (README-derived), while synced README/docs-site pages keep saying run-kit until X1 | D11 lets live site-authored surfaces rename now; the plan explicitly accepts `/docs/` reading run-kit in the two-site window | S:60 R:90 A:70 D:55 |

16 assumptions (10 certain, 6 confident, 0 tentative, 0 unresolved).
