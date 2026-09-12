/**
 * site-redirects — the SINGLE in-site redirect table (extracted from
 * astro.config.mjs by change 260912-1u4q-hexokit-site-cutover-prep). Pure
 * refactor: `siteRedirects()` returns exactly the object the config's inline
 * `redirects:` literal built before, so the emitted <meta refresh> stub pages
 * are unchanged. The extraction exists so the table has a SECOND consumer
 * beyond Astro's `redirects:` config — the cross-site shll.ai→hexokit.com
 * redirect map (`src/lib/shll-ai-redirects.ts`, served at
 * /shll-ai-redirects.json) composes this same object, so the map can never
 * drift from the in-site stubs.
 *
 * Plain ESM (`.mjs`, no TS types) because astro.config.mjs is evaluated at
 * config-load time, a boundary that loads `.mjs` cleanly but not `.ts` (the
 * tool-roster.mjs / docs-site-sidebar.mjs precedent). Dependency-free
 * (Constitution VI) beyond the two sibling lib imports.
 *
 * The four contributing sets, in spread order:
 *   - the change-3ke3 set: old deep `/tools/<slug>/*` URLs → `/<mount>/…`,
 *     keyed by every name the /tools/ namespace ever used (slug + legacyMounts)
 *   - legacy mounts (change it5d): `/run-kit{,/readme,/commands}` → `/docs/…`
 *   - one entry per committed docs/site page, from docsSiteRedirectEntries()
 *   - FAMILY_REDIRECTS: the retired family pages (`/tools`,
 *     `/getting-started/*`, `/workflows/*` → `/toolkit/…`)
 */
import { TOOL_ROSTER } from './tool-roster.mjs';
import { docsSiteRedirectEntries } from './docs-site-sidebar.mjs';

/**
 * The retired family pages (change it5d): getting-started + workflows moved
 * under /toolkit/, and the /tools directory page became /toolkit/.
 */
export const FAMILY_REDIRECTS = {
  '/tools': '/toolkit/',
  '/getting-started/overview': '/toolkit/',
  '/toolkit/overview': '/toolkit/',
  '/getting-started/install': '/toolkit/install/',
  '/getting-started/philosophy': '/toolkit/philosophy/',
  '/workflows/daily-flow': '/toolkit/daily-flow/',
  '/workflows/new-change': '/toolkit/new-change/',
};

/**
 * Every in-site redirect, shaped for Astro's `redirects:` config — bare old
 * path → trailing-slash target. Static <meta refresh> pages are emitted at
 * build; a redirect key that collides with a real route fails the build (which
 * is why retired routes must be removed when the key is added).
 */
export function siteRedirects() {
  return {
    ...Object.fromEntries(
      TOOL_ROSTER.flatMap((t) =>
        // The change-3ke3 set, keyed by every name the /tools/ namespace ever
        // used for this tool — its slug AND its legacy mounts (change it5d:
        // the product's old URLs were /tools/run-kit/*, keyed by the old slug).
        [t.slug, ...(t.legacyMounts ?? [])].flatMap((name) => [
          // Bare `/tools/<name>` (previously a 404) — cheap goodwill entry.
          [`/tools/${name}`, `/${t.mount}/`],
          // The three per-tool pages: overview collapses to the tool root.
          [`/tools/${name}/overview`, `/${t.mount}/`],
          [`/tools/${name}/readme`, `/${t.mount}/readme/`],
          [`/tools/${name}/commands`, `/${t.mount}/commands/`],
        ]),
      ),
    ),
    // Legacy mounts (change it5d): HexoKit's pre-rebrand `/run-kit` namespace.
    ...Object.fromEntries(
      TOOL_ROSTER.flatMap((t) =>
        (t.legacyMounts ?? []).flatMap((legacy) => [
          [`/${legacy}`, `/${t.mount}/`],
          [`/${legacy}/readme`, `/${t.mount}/readme/`],
          [`/${legacy}/commands`, `/${t.mount}/commands/`],
        ]),
      ),
    ),
    // One entry per committed docs/site page: `/tools/<slug>/<path>` →
    // `/<mount>/<path>/`, plus one per legacy mount. Enumerated programmatically
    // (static builds can't wildcard-redirect) by the same collector that
    // generates the sidebar.
    ...docsSiteRedirectEntries(),
    ...FAMILY_REDIRECTS,
  };
}
