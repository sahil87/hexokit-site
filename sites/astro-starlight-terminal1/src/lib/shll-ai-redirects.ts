/**
 * shll-ai-redirects — build-time logic for the `/shll-ai-redirects.json` static
 * endpoint (change 260912-1u4q-hexokit-site-cutover-prep). Single-sources
 * everything the thin `src/pages/shll-ai-redirects.json.ts` page needs so the
 * map logic is unit-testable with `node --test` (a page cannot be imported by
 * a plain node script) — the same lib-extraction precedent as
 * `versions-manifest.ts` / `llms.ts`.
 *
 * The map is the machine-readable answer to "where does every URL shll.ai ever
 * served land on hexokit.com?" — consumed by the X2 cutover, which replaces the
 * sahil87/shll.ai repo with one redirect stub per old URL (the cross-repo
 * contract is `docs/specs/shll-ai-redirect-map-contract.md`). Its sources are
 * the union of the LIVE page set (the docs collection + the pulled docs/site
 * trees, supplied by the endpoint) and the IN-SITE redirect table
 * (`siteRedirects()` — the same object Astro's `redirects:` builds from), plus
 * the two agent endpoints. Every value is collapsed to a FINAL live page — no
 * double hop through an in-site stub — and a chain that ends anywhere else
 * THROWS (site-authored input, build-stop posture, the `versions-policy.json`
 * rule: a value in this map must be a page that exists).
 *
 * Pure and dependency-free (Constitution I/VI): no Astro imports, no disk —
 * the page set and redirect table are passed in. Only the roster and the
 * family table are imported (both plain `.mjs`), so the `rules`
 * generalization is DERIVED from the same sources as the enumeration and can
 * never become a second hand-typed redirect table.
 */
import { TOOL_ROSTER } from './tool-roster.mjs';
import { FAMILY_REDIRECTS } from './site-redirects.mjs';

/** The map schema revision. Additive evolution keeps this at 1. */
export const MAP_SCHEMA = 1 as const;

/** The origin every key is a path on — the retired site being mapped FROM. */
export const SHLL_AI_ORIGIN = 'https://shll.ai';

/**
 * Paths that stay REAL FILES on shll.ai (D4 of the rebrand plan: they are
 * baked into shipped `shll` binaries, so X2 serves byte copies, never
 * redirects). Excluded from `redirects` even if present in `pages`.
 */
export const KEEP_ON_SHLL_AI = ['/install', '/versions.json'] as const;

/** The agent-discovery endpoints — build-time static files, not collection
 *  pages, so they are treated as live and mapped by identity. On the X2 side
 *  they are served as byte copies (spec §5): a file-like path cannot be a
 *  `<key>/index.html` meta-refresh stub on GitHub Pages. */
export const AGENT_ENDPOINTS = ['/llms.txt', '/llms-full.txt'] as const;

/** Bound on in-site redirect chain length (a site-authored table deeper than
 *  this is a defect — the build-stop posture applies). */
export const MAX_REDIRECT_HOPS = 3;

export interface RedirectMapInput {
  /** Every live HTML page on hexokit.com, any spelling (canonicalized here). */
  pages: readonly string[];
  /** The in-site table from `siteRedirects()`: bare key → trailing-slash target. */
  redirects: Readonly<Record<string, string>>;
  /** `https://hexokit.com` — from `Astro.site`, never hardcoded. */
  origin: string;
}

export interface RedirectMap {
  schema: typeof MAP_SCHEMA;
  generated_at: string;
  from: typeof SHLL_AI_ORIGIN;
  to: string;
  keep: string[];
  redirects: Record<string, string>;
  rules: [string, string][];
}

/**
 * Canonicalize a path: collapse duplicate slashes, guarantee a leading slash,
 * then — page-like paths (last segment has no `.`) end with exactly one `/`
 * (`/tools/wt/readme` and `/tools/wt/readme/` collapse to one key; `/` stays
 * `/`), while file-like paths (`/llms.txt`, `/versions.json`) stay bare.
 * shll.ai's own 301s (bare → slashed) confirm the trailing-slash spelling is
 * canonical there too.
 */
export function canonicalPath(path: string): string {
  let p = path.replace(/\/{2,}/g, '/');
  if (!p.startsWith('/')) p = `/${p}`;
  p = p.replace(/\/+$/, '');
  if (p === '') return '/';
  const lastSegment = p.split('/').pop() ?? '';
  if (lastSegment.includes('.')) return p;
  return `${p}/`;
}

/**
 * Resolve `source` to its FINAL live page: the canonical path itself when it
 * is a live page, otherwise the in-site table followed (on the bare key, at
 * most MAX_REDIRECT_HOPS hops) until a live page is reached. Throws an Error
 * naming the source and the dangling target when the chain ends at a path that
 * is neither a live page nor a redirect key. The agent endpoints count as
 * live (build-time endpoints, not collection pages).
 */
export function resolveFinal(
  source: string,
  pages: ReadonlySet<string>,
  redirects: Readonly<Record<string, string>>,
): string {
  const live = new Set([...pages, ...AGENT_ENDPOINTS]);
  let current = canonicalPath(source);
  for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop += 1) {
    if (live.has(current)) return current;
    const bare = current.endsWith('/') ? current.slice(0, -1) : current;
    const target = redirects[bare];
    if (target === undefined) {
      throw new Error(
        `shll-ai redirect map: source '${source}' does not resolve to a live page — dangling target '${current}'`,
      );
    }
    current = canonicalPath(target);
  }
  throw new Error(
    `shll-ai redirect map: source '${source}' exceeds ${MAX_REDIRECT_HOPS} redirect hops (still at '${current}')`,
  );
}

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The ordered `[regexSource, replacement]` generalization of the enumeration,
 * for X2's `404.html` catch-all — DERIVED from the roster (`legacyMounts`) and
 * `FAMILY_REDIRECTS`, never hand-typed. `applyRules` over every enumerated key
 * reproduces that key's value (asserted by the unit test and the post-build
 * checker), so the rules and the enumeration cannot disagree.
 *
 * Order is load-bearing: exact and legacy-mount rules precede the generic
 * `/tools/<name>/*` rewrites, a collapsing family entry precedes its family's
 * prefix rule, and the identity catch-all is last.
 */
export function buildRules(): [string, string][] {
  const rules: [string, string][] = [];

  // `/tools` itself → the toolkit directory (FAMILY_REDIRECTS).
  rules.push(['^/tools/?$', FAMILY_REDIRECTS['/tools']]);

  // Legacy mounts (roster-derived): `/run-kit/*` AND `/tools/run-kit/*` →
  // `/<mount>/*` — one pair per legacy mount (the overview page collapses to
  // the tool root, like the /tools/ set), so a future legacy mount extends
  // the rules without editing them.
  for (const tool of TOOL_ROSTER) {
    for (const legacy of tool.legacyMounts ?? []) {
      rules.push([`^/(?:tools/)?${escapeRegExp(legacy)}/overview/?$`, `/${tool.mount}/`]);
      rules.push([`^/(?:tools/)?${escapeRegExp(legacy)}(/.*)?$`, `/${tool.mount}$1`]);
    }
  }

  // A tool whose slug differs from its mount (HexoKit: `hexokit` → `docs`)
  // needs exact `/tools/<slug>` rules ahead of the generic rewrite below,
  // which would otherwise misroute it to `/<slug>/…` (roster-derived).
  for (const tool of TOOL_ROSTER) {
    if (tool.slug === tool.mount) continue;
    rules.push([`^/tools/${escapeRegExp(tool.slug)}/overview/?$`, `/${tool.mount}/`]);
    rules.push([`^/tools/${escapeRegExp(tool.slug)}(/.*)?$`, `/${tool.mount}$1`]);
  }

  // The generic `/tools/<name>/*` rewrites (correct for every slug == mount
  // tool): `overview` collapses to the tool root, every other page keeps its
  // path.
  rules.push(['^/tools/([^/]+)/overview/?$', '/$1/']);
  rules.push(['^/tools/([^/]+)(/.*)?$', '/$1$2']);

  // The retired family pages, grouped by top segment: a collapsing entry
  // (`/getting-started/overview` → `/toolkit/`) gets an exact rule; a family
  // whose entries preserve their tail gets one prefix rule.
  const groups = new Map<string, [string, string][]>();
  for (const [key, target] of Object.entries(FAMILY_REDIRECTS)) {
    const segment = key.split('/')[1];
    if (key === `/${segment}`) continue; // single-segment family roots handled above
    const list = groups.get(segment) ?? [];
    list.push([key, target]);
    groups.set(segment, list);
  }
  for (const [segment, entries] of groups) {
    const targetRoot = entries[0][1].split('/')[1];
    let tailPreserving = false;
    for (const [key, target] of entries) {
      const tail = key.slice(segment.length + 2);
      if (target === `/${targetRoot}/${tail}/`) {
        tailPreserving = true;
      } else {
        rules.push([`^${escapeRegExp(key)}/?$`, target]);
      }
    }
    if (tailPreserving) {
      rules.push([`^/${escapeRegExp(segment)}(/.*)?$`, `/${targetRoot}$1`]);
    }
  }

  // Identity catch-all — every un-enumerated path maps to its hexokit.com twin.
  rules.push(['^(/.*)$', '$1']);
  return rules;
}

/**
 * Apply the first matching rule to `pathname` and canonicalize the result.
 * The request path is canonicalized BEFORE matching (the spec §4 consumer
 * algorithm), so a duplicate-slash or unslashed request such as
 * `/tools//wt/readme` still hits the `/tools/<name>` rules instead of falling
 * through to identity. The identity catch-all guarantees a rule always matches.
 */
export function applyRules(rules: readonly [string, string][], pathname: string): string {
  const request = canonicalPath(pathname);
  for (const [source, replacement] of rules) {
    const re = new RegExp(source);
    if (re.test(request)) return canonicalPath(request.replace(re, replacement));
  }
  return request;
}

/**
 * Build the shll.ai → hexokit.com redirect map. Sources = every live page ∪
 * every in-site redirect key ∪ the agent endpoints; keys are canonicalized,
 * de-duplicated, and sorted; the `keep` paths are excluded; every value is an
 * absolute URL built from `origin` pointing at a FINAL live page. `now` is
 * injectable so tests can pin `generated_at`; it defaults to the build moment.
 */
export function buildShllAiRedirectMap(
  input: RedirectMapInput,
  now: Date = new Date(),
): RedirectMap {
  const origin = input.origin.replace(/\/+$/, '');
  const live = new Set(input.pages.map(canonicalPath));
  const keepSet = new Set(KEEP_ON_SHLL_AI.flatMap((k) => [k, canonicalPath(k)]));
  const sources = new Set<string>([
    ...live,
    ...Object.keys(input.redirects).map(canonicalPath),
    ...AGENT_ENDPOINTS,
  ]);

  const redirects: Record<string, string> = {};
  for (const key of [...sources].sort()) {
    if (keepSet.has(key)) continue;
    redirects[key] = origin + resolveFinal(key, live, input.redirects);
  }

  return {
    schema: MAP_SCHEMA,
    generated_at: now.toISOString(),
    from: SHLL_AI_ORIGIN,
    to: origin,
    keep: [...KEEP_ON_SHLL_AI],
    redirects,
    rules: buildRules(),
  };
}
