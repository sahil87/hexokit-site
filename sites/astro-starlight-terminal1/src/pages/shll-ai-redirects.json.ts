/**
 * /shll-ai-redirects.json — the machine-readable shll.ai → hexokit.com
 * redirect map (change 260912-1u4q-hexokit-site-cutover-prep), emitted as a
 * build-time static `application/json` endpoint (Constitution I — no SSR, no
 * runtime fetch; Constitution VI — zero new deps). The same idiom as
 * `/versions.json`: a thin page that resolves the repo root and delegates all
 * logic to a lib module (`src/lib/shll-ai-redirects.ts`).
 *
 * Served at `https://hexokit.com/shll-ai-redirects.json`, it enumerates every
 * URL shll.ai ever served (the live page set ∪ the in-site redirect table ∪
 * the agent endpoints) and maps each to the FINAL hexokit.com page — consumed
 * by the X2 cutover, which replaces the sahil87/shll.ai repo with one redirect
 * stub per old URL (fetching this file alongside `/install` and
 * `/versions.json` in the same copy step). The cross-repo contract (schema,
 * key canonicalization, `keep`, `rules`, the stub-consumer shape) is
 * `docs/specs/shll-ai-redirect-map-contract.md`.
 *
 * `pages` is the live route set: `/` (the index.astro landing) ∪ every docs
 * collection entry route (minus the 404 stub) ∪ one route per committed
 * docs/site page (`/<mount>/<path>/`, mount from the roster). `redirects` is
 * the single in-site table (`siteRedirects()` — the same object Astro's
 * `redirects:` config builds from, so the map cannot drift from the in-site
 * stubs). A dangling in-site target THROWS here and fails the build — the
 * site-authored build-stop posture (versions-policy.json precedent).
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { collectDocsSitePages } from '../lib/docs-site-tree.ts';
import { mountFor } from '../lib/tool-slugs.ts';
import { repoRootFromModuleUrl } from '../lib/repo-root.ts';
import { siteRedirects } from '../lib/site-redirects.mjs';
import { buildShllAiRedirectMap } from '../lib/shll-ai-redirects.ts';

export const GET: APIRoute = async ({ site }) => {
  // `site` is guaranteed present — astro.config.mjs sets `site: 'https://hexokit.com'`.
  // `.origin` yields the bare origin (no trailing slash) for URL building.
  const origin = site!.origin;
  const repoRoot = repoRootFromModuleUrl(import.meta.url);

  const docs = await getCollection('docs');
  const pages = [
    '/',
    ...docs.filter((entry) => entry.id !== '404').map((entry) => `/${entry.id}/`),
    ...collectDocsSitePages(repoRoot).map(
      (page) => `/${mountFor(page.slug) ?? page.slug}/${page.path}/`,
    ),
  ];

  const map = buildShllAiRedirectMap({ pages, redirects: siteRedirects(), origin });

  return new Response(`${JSON.stringify(map, null, 2)}\n`, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
