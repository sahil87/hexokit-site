/**
 * tool-slugs — typed re-export of the single site-authored roster in
 * `tool-roster.mjs` (change it5d). The roster itself (records, helpers, and the
 * derived `TOOL_SLUGS`) lives in the plain-ESM module so astro.config.mjs and
 * docs-site-sidebar.mjs can import it at config-evaluation time; this file adds
 * the TS types and keeps the existing export names (`TOOL_SLUGS`, `ToolSlug`,
 * `isToolSlug`) so current consumers compile unchanged.
 *
 * Why the roster gates matter: per-tool pages are canonical at the site root
 * (change 3ke3), and HexoKit's mount (`docs`) differs from its slug — so every
 * root-namespace route dispatcher matches the flat route shape AND resolves the
 * captured segment through this roster (`slugForMount`) instead of assuming
 * segment == slug.
 *
 * Consumers: `commands-toc.ts`, `readme-toc.ts` (route-id gate), `Head.astro`
 * (per-tool JSON-LD pathname gate), the llms endpoints, and the components that
 * need mount/repo resolution (`GithubButton`, `InstallOneLiner`, …).
 */
import {
  TOOL_ROSTER as ROSTER,
  TOOL_SLUGS as SLUGS,
  mountFor as mountForMjs,
  slugForMount as slugForMountMjs,
  repoFor as repoForMjs,
  labelFor as labelForMjs,
  isToolSlug as isToolSlugMjs,
  isToolMount as isToolMountMjs,
} from './tool-roster.mjs';

/** One roster record: the four names a tool carries on this site. */
export interface ToolRecord {
  /** Pulled-data key — help/<slug>.json, content/<slug>/, overview entry id. */
  slug: string;
  /** Display name (JSON-LD name, sidebar/llms headings, listings). */
  label: string;
  /** URL segment — /<mount>/, /<mount>/readme/, … (`docs` for hexokit). */
  mount: string;
  /** GitHub repo under sahil87/ (README/tarball source, star count, links). */
  repo: string;
  /** Homebrew formula (refresh-help.yml; documented here for one-table reading). */
  formula: string;
  /** Binary that runs `help-dump` (refresh-help.yml). */
  binary: string;
  /** Former URL segments that redirect to `mount`. */
  legacyMounts?: string[];
}

/** The single roster, in display order (product first, companions, then shll). */
export const TOOL_ROSTER: readonly ToolRecord[] = ROSTER;

/** The canonical tool slugs, in display order. */
export const TOOL_SLUGS: readonly string[] = SLUGS;

export type ToolSlug = (typeof TOOL_SLUGS)[number];

export const mountFor: (slug: string) => string | null = mountForMjs;
export const slugForMount: (segment: string) => string | null = slugForMountMjs;
export const repoFor: (slug: string) => string | null = repoForMjs;
export const labelFor: (slug: string) => string | null = labelForMjs;

/** True when `slug` is one of the canonical tool slugs. */
export const isToolSlug: (slug: string) => boolean = isToolSlugMjs;

/** True when `segment` is a tool's URL mount (including `docs`). */
export const isToolMount: (segment: string) => boolean = isToolMountMjs;
