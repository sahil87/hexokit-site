/**
 * tool-roster — the SINGLE site-authored roster of the toolkit's seven tools
 * (change it5d). Before this change "slug" did five jobs at once (help file,
 * content collector, URL segment, brew formula, GitHub repo) and the roster was
 * copied in ~8 places. HexoKit is the first tool whose slug ≠ URL mount ≠ repo,
 * so the four names are now explicit fields on one shared record:
 *
 *   slug          the pulled-data key — help/<slug>.json, content/<slug>/…,
 *                 the docs-collection overview entry id
 *   label         the display name (e.g. `HexoKit` — JSON-LD name, sidebar/llms
 *                 headings, directory listings)
 *   mount         the URL segment — /<mount>/, /<mount>/readme/, … (`docs` for
 *                 HexoKit: the product's pages live under /docs/)
 *   repo          the GitHub repo under sahil87/ — README/tarball pull source,
 *                 GithubButton, star count, JSON-LD url
 *   formula/binary  brew install sahil87/tap/<formula>, then <binary> help-dump
 *                 (used by refresh-help.yml; carried here for the
 *                 one-table-of-truth reading — see that workflow's header)
 *   legacyMounts  former URL segments that now redirect to `mount`
 *                 (HexoKit: `run-kit` — the pre-rebrand mount)
 *
 * Source-side names (repo/formula/binary) stay `run-kit` for HexoKit — only the
 * site's slug, URL mount, and identity change (the source flips in a later
 * change). Substrate identifiers (`rk`, `RK_*`, …) are never part of this table.
 *
 * Plain ESM (`.mjs`, no TS types) so astro.config.mjs and docs-site-sidebar.mjs
 * can import it at config-evaluation time (the docs-site-sidebar precedent: the
 * config-eval boundary loads `.mjs` but not `.ts`). tool-slugs.ts re-exports it
 * typed for the TS graph. Dependency-free (Constitution VI); no disk read — the
 * roster is a fixed, known set, deliberately SITE-AUTHORED (not derived from
 * `help/` or `content/`): the producer repos do not dictate the site's route map.
 *
 * Display order = the product first, then the companions in the hexagon order
 * (fab-kit, wt, idea, tu, hop), then shll. Every iterating surface (sidebar Tools
 * group, ToolsIndex, VersionTable, the llms endpoints) follows this order.
 */

/** @typedef {Object} ToolRecord
 * @property {string} slug
 * @property {string} label
 * @property {string} mount
 * @property {string} repo
 * @property {string} formula
 * @property {string} binary
 * @property {string[]} [legacyMounts]
 */

/** @type {ToolRecord[]} */
export const TOOL_ROSTER = [
  { slug: 'hexokit', label: 'HexoKit', mount: 'docs', repo: 'run-kit', formula: 'run-kit', binary: 'run-kit', legacyMounts: ['run-kit'] },
  { slug: 'fab-kit', label: 'fab-kit', mount: 'fab-kit', repo: 'fab-kit', formula: 'fab-kit', binary: 'fab' },
  { slug: 'wt',      label: 'wt',      mount: 'wt',      repo: 'wt',      formula: 'wt',      binary: 'wt' },
  { slug: 'idea',    label: 'idea',    mount: 'idea',    repo: 'idea',    formula: 'idea',    binary: 'idea' },
  { slug: 'tu',      label: 'tu',      mount: 'tu',      repo: 'tu',      formula: 'tu',      binary: 'tu' },
  { slug: 'hop',     label: 'hop',     mount: 'hop',     repo: 'hop',     formula: 'hop',     binary: 'hop' },
  { slug: 'shll',    label: 'shll',    mount: 'shll',    repo: 'shll',    formula: 'shll',    binary: 'shll' },
];

/** The canonical tool slugs, in display order (derived — never a second list). */
export const TOOL_SLUGS = TOOL_ROSTER.map((t) => t.slug);

const BY_SLUG = new Map(TOOL_ROSTER.map((t) => [t.slug, t]));
const BY_MOUNT = new Map(TOOL_ROSTER.map((t) => [t.mount, t]));

/** The URL mount segment for `slug` (e.g. `hexokit` → `docs`), or null. */
export function mountFor(slug) {
  return BY_SLUG.get(slug)?.mount ?? null;
}

/** The tool slug mounted at `segment` (e.g. `docs` → `hexokit`), or null when
 *  `segment` is not a tool mount (`toolkit`, `reference`, …). */
export function slugForMount(segment) {
  return BY_MOUNT.get(segment)?.slug ?? null;
}

/** The GitHub repo name under sahil87/ for `slug`, or null. */
export function repoFor(slug) {
  return BY_SLUG.get(slug)?.repo ?? null;
}

/** The display label for `slug` (e.g. `hexokit` → `HexoKit`), or null. */
export function labelFor(slug) {
  return BY_SLUG.get(slug)?.label ?? null;
}

/** True when `slug` is one of the seven canonical tool slugs. */
export function isToolSlug(slug) {
  return BY_SLUG.has(slug);
}

/** True when `segment` is a tool's URL mount (including `docs`). */
export function isToolMount(segment) {
  return BY_MOUNT.has(segment);
}
